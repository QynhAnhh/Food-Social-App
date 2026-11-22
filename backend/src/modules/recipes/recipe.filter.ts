import { PrismaClient } from '@prisma/client';
import { prisma as defaultPrisma } from '../../config/prisma';

export interface FilterRecipesInput {
  userId?: string;
  categoryId?: number;
  categorySlug?: string;
  dietaryRegimeId?: number; // lọc theo ID chế độ ăn kiêng đơn lẻ
  dietaryRegimeSlug?: string;
  dietaryIds?: number[]; // mảng ID các chế độ ăn kiêng
  excludedIngredientIds?: number[]; // mảng ID các nguyên liệu muốn loại trừ
  maxCookingTime?: number;  // phút
  minRating?: number; // (0-5)
  search?: string; // từ khóa tìm kiếm
  excludeAllergies?: boolean; // bật/tắt loại trừ dị ứng từ user_allergies (mặc định: true nếu có userId)
  sortBy?: 'newest' | 'rating' | 'cookingTime' | 'title';
  sortDirection?: 'asc' | 'desc'; // tăng dần | giảm dần
  page?: number;
  limit?: number;
}

export interface FilteredRecipeItem {
  id: string;
  title: string;
  description: string | null;
  thumbnailUrl: string;  // link ảnh công thức
  servings: number;  // số khẩu phần
  cookingTime: number;
  averageRating: number;
  author: {
    id: string;
    nickname: string | null;
    fullName: string;
    avatarUrl: string | null;
  };
  category: {
    id: number;
    name: string;
    slug: string;
    iconUrl: string | null;
  };
  dietaryTags: Array<{
    id: number;
    name: string;
    slug: string;
  }>;
  ingredientsCount: number;  // tổng số nguyên liệu cần dùng
  stats: {
    reviewsCount: number;
    cooksnapsCount: number;
    favoritesCount: number;
  };
  isFavorited?: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface FilterRecipesResult {
  total: number;  // tổng số lượng công thức của bộ lọc
  page: number;
  limit: number;
  totalPages: number;
  appliedFilters: {  // các thông số đã dùng để lọc
    categoryId?: number;
    categorySlug?: string;
    dietaryRegimeId?: number;
    dietaryRegimeSlug?: string;
    dietaryIds?: number[];
    maxCookingTime?: number;
    minRating?: number;
    search?: string;
    excludeAllergies: boolean;
    excludedAllergenCount: number;
    excludedAllergenIds: number[];
    totalExcludedIngredientCount: number;
  };
  data: FilteredRecipeItem[];
}

/*
 * lọc theo danh mục + chế độ ăn + thời gian nấu + từ khóa tìm kiếm
 * đồng thời tự động đối chiếu và loại trừ toàn bộ công thức chứa nguyên liệu trong `user_allergies`
 * và mảng `excluded_ingredient_ids`.
 */
export async function filterRecipesQuery(
  input: FilterRecipesInput,
  prismaClient: PrismaClient = defaultPrisma as any,  // tên tham số: kiểu dữ liệu = giá trị mặc định 
): Promise<FilterRecipesResult> {
  const {
    userId,
    categoryId,
    categorySlug,
    dietaryRegimeId,
    dietaryRegimeSlug,
    dietaryIds,
    excludedIngredientIds = [],
    maxCookingTime,
    minRating,
    search,
    excludeAllergies = true,
    sortBy = 'newest',
    sortDirection,
    page = 1,
    limit = 10,
  } = input;

  const take = Math.min(50, Math.max(1, limit));  // số lượng công thức cần lấy cho 1 trang
  const currentPage = Math.max(1, page);  // số thứ tự trang hiện tại
  const skip = (currentPage - 1) * take;  // số lượng công thức của các trang trước đó cần phải bỏ qua để bắt đầu lấy đúng các món của trang hiện tại

  //  lấy danh sách ID nguyên liệu gây dị ứng của người dùng
  let allergyIngredientIds: number[] = [];
  if (userId && excludeAllergies) {
    const userAllergies = await prismaClient.userAllergy.findMany({
      where: { userId },
      select: { ingredientId: true },
    });
    allergyIngredientIds = userAllergies.map((a) => a.ingredientId);
  }

  // hợp nhất danh sách dị ứng hệ thống và danh sách nguyên liệu loại trừ bổ sung từ bộ lọc cá nhân
  const allExcludedIds = Array.from(new Set([...allergyIngredientIds, ...excludedIngredientIds]));

  const where: any = {};

  // lọc theo danh mục
  if (categoryId) {
    where.categoryId = categoryId;
  } else if (categorySlug) {
    where.category = { slug: categorySlug };
  }

  // lọc theo Chế độ ăn
  if (Array.isArray(dietaryIds) && dietaryIds.length > 0) {
    where.dietaryTags = {
      some: { dietaryRegimeId: { in: dietaryIds } },
    };
  } else if (dietaryRegimeId) {
    where.dietaryTags = {
      some: { dietaryRegimeId },
    };
  } else if (dietaryRegimeSlug) {
    where.dietaryTags = {
      some: { dietaryRegime: { slug: dietaryRegimeSlug } },
    };
  }

  // lọc theo thời gian nấu tối đa
  if (maxCookingTime && maxCookingTime > 0) {
    where.cookingTime = { lte: maxCookingTime };
  }

  // lọc theo điểm đánh giá trung bình tối thiểu
  if (minRating !== undefined && minRating > 0) {
    where.averageRating = { gte: minRating };
  }

  // tìm kiếm từ khóa trong title hoặc description
  if (search && search.trim()) {
    const keyword = search.trim();
    where.OR = [
      { title: { contains: keyword, mode: 'insensitive' } },
      { description: { contains: keyword, mode: 'insensitive' } },
    ];
  }

  // BỘ LỌC LOẠI TRỪ NGUYÊN LIỆU
  // công thức không được chứa bất kỳ ingredientId nào nằm trong allExcludedIds
  if (allExcludedIds.length > 0) {
    where.ingredients = {
      none: {
        ingredientId: { in: allExcludedIds },
      },
    };
  }

  // xác định quy tắc sắp xếp
  const dir = sortDirection || (sortBy === 'cookingTime' ? 'asc' : 'desc');
  const orderBy: any = {};
  switch (sortBy) {
    case 'rating':
      orderBy.averageRating = dir;
      break;
    case 'cookingTime':
      orderBy.cookingTime = dir;
      break;
    case 'title':
      orderBy.title = dir;
      break;
    case 'newest':
    default:
      orderBy.createdAt = dir;
      break;
  }

  // thực thi truy vấn đếm tổng số bản ghi và lấy danh sách kết quả song song
  const [total, recipes] = await Promise.all([
    prismaClient.recipe.count({ where }),
    prismaClient.recipe.findMany({
      where,
      skip,
      take,
      orderBy,
      include: {
        author: {
          select: {
            id: true,
            nickname: true,
            fullName: true,
            avatarUrl: true,
          },
        },
        category: {
          select: {
            id: true,
            name: true,
            slug: true,
            iconUrl: true,
          },
        },
        dietaryTags: {
          include: {
            dietaryRegime: {
              select: {
                id: true,
                name: true,
                slug: true,
              },
            },
          },
        },
        ingredients: {
          select: {
            id: true,
            ingredientId: true,
          },
        },
        _count: {
          select: {
            reviews: true,
            cooksnaps: true,
            favoritedBy: true,
          },
        },
      },
    }),
  ]);

  // kiểm tra trạng thái đã yêu thích của người dùng đối với các món trả về
  const favoritedRecipeIds = new Set<string>();
  if (userId && recipes.length > 0) {
    const favorites = await prismaClient.favoriteRecipe.findMany({
      where: {
        userId,
        recipeId: { in: recipes.map((r) => r.id) },
      },
      select: { recipeId: true },
    });
    favorites.forEach((f) => favoritedRecipeIds.add(f.recipeId));
  }

  // định dạng cấu trúc trả về
  return {
    total,
    page: currentPage,
    limit: take,
    totalPages: Math.ceil(total / take),
    appliedFilters: {
      categoryId,
      categorySlug,
      dietaryRegimeId,
      dietaryRegimeSlug,
      dietaryIds,
      maxCookingTime,
      minRating,
      search,
      excludeAllergies: Boolean(excludeAllergies && allergyIngredientIds.length > 0),
      excludedAllergenCount: allergyIngredientIds.length,
      excludedAllergenIds: allergyIngredientIds,
      totalExcludedIngredientCount: allExcludedIds.length,
    },
    data: recipes.map((recipe) => ({
      id: recipe.id,
      title: recipe.title,
      description: recipe.description,
      thumbnailUrl: recipe.thumbnailUrl,
      servings: recipe.servings,
      cookingTime: recipe.cookingTime,
      averageRating: recipe.averageRating,
      author: recipe.author,
      category: recipe.category,
      dietaryTags: recipe.dietaryTags.map((tag) => tag.dietaryRegime),
      ingredientsCount: recipe.ingredients.length,
      stats: {
        reviewsCount: recipe._count.reviews,
        cooksnapsCount: recipe._count.cooksnaps,
        favoritesCount: recipe._count.favoritedBy,
      },
      isFavorited: userId ? favoritedRecipeIds.has(recipe.id) : false,
      createdAt: recipe.createdAt,
      updatedAt: recipe.updatedAt,
    })),
  };
}
