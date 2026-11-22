import { PrismaClient } from '@prisma/client';
import { prisma as defaultPrisma } from '../../config/prisma';
import { AppError, ErrorCodes } from '../../common/errors';

export interface ToggleFavoriteResult {
  recipeId: string;
  isFavorited: boolean;
  favoritesCount: number;
  message: string;
}

export interface FavoriteStatusResult {
  recipeId: string;
  isFavorited: boolean;
}

export interface UserFavoriteRecipesInput {
  page?: number;
  limit?: number;
}

export interface UserFavoriteRecipeItem {
  id: string;
  title: string;
  description: string | null;
  thumbnailUrl: string;
  servings: number;
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
  };
  dietaryTags: Array<{
    id: number;
    name: string;
    slug: string;
  }>;
  stats: {
    reviewsCount: number;
    cooksnapsCount: number;
    favoritesCount: number;
  };
  favoritedAt: Date;
}

export interface UserFavoriteRecipesResult {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  data: UserFavoriteRecipeItem[];
}

/*
 * query thả tim / lưu công thức yêu thích
 */
export async function toggleFavoriteRecipe(
  userId: string,
  recipeId: string,
  prismaClient: PrismaClient = defaultPrisma as any,
): Promise<ToggleFavoriteResult> {
  // kiểm tra công thức nấu ăn có tồn tại trong hệ thống hay không
  const recipe = await prismaClient.recipe.findUnique({
    where: { id: recipeId },
    select: { id: true, title: true },
  });

  if (!recipe) {
    throw new AppError(
      404,
      ErrorCodes.RECIPE_NOT_FOUND,
      'Công thức không tồn tại hoặc đã bị xóa.',
    );
  }

  // kiểm tra xem người dùng đã thả tim công thức này trước đó chưa
  const existingFavorite = await prismaClient.favoriteRecipe.findUnique({
    where: {
      userId_recipeId: {
        userId,
        recipeId,
      },
    },
  });

  if (existingFavorite) {
    // đã thả tim -> xóa bản ghi trong bảng favorite_recipes 
    await prismaClient.favoriteRecipe.delete({
      where: {
        userId_recipeId: {
          userId,
          recipeId,
        },
      },
    });

    const favoritesCount = await prismaClient.favoriteRecipe.count({
      where: { recipeId },
    });

    return {
      recipeId,
      isFavorited: false,
      favoritesCount,
      message: 'Đã hủy lưu công thức khỏi danh sách yêu thích.',
    };
  } else {
    // chưa thả tim -> tạo mới bản ghi trong bảng favorite_recipes
    await prismaClient.favoriteRecipe.create({
      data: {
        userId,
        recipeId,
      },
    });

    const favoritesCount = await prismaClient.favoriteRecipe.count({
      where: { recipeId },
    });

    return {
      recipeId,
      isFavorited: true,
      favoritesCount,
      message: 'Đã lưu công thức vào danh sách yêu thích.',
    };
  }
}

/**
 * kiểm tra trạng thái đã thích
 * phục vụ hiển thị icon trái tim trên giao diện chi tiết hoặc danh sách công thức
 */
export async function checkFavoriteStatus(
  userId: string,
  recipeId: string,
  prismaClient: PrismaClient = defaultPrisma as any,
): Promise<FavoriteStatusResult> {
  const favorite = await prismaClient.favoriteRecipe.findUnique({
    where: {
      userId_recipeId: {
        userId,
        recipeId,
      },
    },
  });

  return {
    recipeId,
    isFavorited: !!favorite,
  };
}

/**
 * lấy danh sách các công thức người dùng đã lưu yêu thích
 */
export async function getUserFavoriteRecipes(
  userId: string,
  options: UserFavoriteRecipesInput = {},
  prismaClient: PrismaClient = defaultPrisma as any,
): Promise<UserFavoriteRecipesResult> {
  const page = Math.max(1, options.page || 1);
  const limit = Math.min(50, Math.max(1, options.limit || 10));
  const skip = (page - 1) * limit;

  const [total, favorites] = await Promise.all([
    prismaClient.favoriteRecipe.count({
      where: { userId },
    }),
    prismaClient.favoriteRecipe.findMany({
      where: { userId },
      skip,
      take: limit,
      orderBy: { createdAt: 'desc' },
      include: {
        recipe: {
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
            _count: {
              select: {
                reviews: true,
                cooksnaps: true,
                favoritedBy: true,
              },
            },
          },
        },
      },
    }),
  ]);

  return {
    total,
    page,
    limit,
    totalPages: Math.ceil(total / limit),
    data: favorites.map((fav) => ({
      id: fav.recipe.id,
      title: fav.recipe.title,
      description: fav.recipe.description,
      thumbnailUrl: fav.recipe.thumbnailUrl,
      servings: fav.recipe.servings,
      cookingTime: fav.recipe.cookingTime,
      averageRating: fav.recipe.averageRating,
      author: fav.recipe.author,
      category: fav.recipe.category,
      dietaryTags: fav.recipe.dietaryTags.map((dt) => dt.dietaryRegime),
      stats: {
        reviewsCount: fav.recipe._count.reviews,
        cooksnapsCount: fav.recipe._count.cooksnaps,
        favoritesCount: fav.recipe._count.favoritedBy,
      },
      favoritedAt: fav.createdAt,
    })),
  };
}
