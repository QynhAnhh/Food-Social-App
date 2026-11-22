
import { Response } from 'express';
import { prisma } from '../../config/prisma';
import { AuthRequest } from '../../common/middlewares/auth.middleware';
import {
  createRecipeTransaction,
  updateRecipeTransaction,
  RecipeTransactionError,
} from './recipe.transaction';
import { filterRecipesQuery } from './recipe.filter';
import {
  toggleFavoriteRecipe,
  checkFavoriteStatus,
  getUserFavoriteRecipes,
} from './recipe.favorite';
import { ErrorCodes } from '../../common/errors';

export const getRecipeById = async (
  req: AuthRequest,
  res: Response,
) => {
  const recipeId = String(req.params.id);
  const currentUserId = req.user?.id;

  // lấy thông tin chi tiết công thức
  const recipe = await prisma.recipe.findUnique({
    where: { id: recipeId },
    include: {
      author: {
        select: {
          id: true,
          nickname: true,
          fullName: true,
          avatarUrl: true,
          bio: true,
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
        include: {
          ingredient: {
            select: {
              id: true,
              name: true,
              standardUnit: true,
              imageUrl: true,
            },
          },
        },
      },
      steps: {
        orderBy: {
          stepNumber: 'asc',
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
  });

  // kiểm tra công thức có tồn tại không
  if (!recipe) {
    return res.status(404).json({
      success: false,
      errorCode: ErrorCodes.RECIPE_NOT_FOUND,
      message: 'Công thức nấu ăn không tồn tại hoặc đã bị xóa.',
    });
  }

  // kiểm tra người dùng đã yêu thích công thức chưa
  let isFavorited = false;

  if (currentUserId) {
    const fav = await prisma.favoriteRecipe.findUnique({
      where: {
        userId_recipeId: {
          userId: currentUserId,
          recipeId,
        },
      },
    });

    isFavorited = !!fav;
  }

  // trả kết quả chi tiết công thức
  return res.status(200).json({
    success: true,
    message: 'Lấy chi tiết công thức thành công.',
    data: {
      id: recipe.id,
      title: recipe.title,
      description: recipe.description,
      thumbnailUrl: recipe.thumbnailUrl,
      servings: recipe.servings,
      cookingTime: recipe.cookingTime,
      averageRating: recipe.averageRating,
      isFavorited,

      stats: {
        reviewsCount: recipe._count.reviews,
        cooksnapsCount: recipe._count.cooksnaps,
        favoritesCount: recipe._count.favoritedBy,
      },

      author: recipe.author,
      category: recipe.category,

      dietaryTags: recipe.dietaryTags.map(
        (t) => t.dietaryRegime,
      ),

      ingredients: recipe.ingredients.map((ri) => ({
        id: ri.id,
        ingredientId: ri.ingredient.id,
        name: ri.ingredient.name,
        quantity: ri.quantity,
        unit: ri.ingredient.standardUnit,
        note: ri.note,
        imageUrl: ri.ingredient.imageUrl,
      })),

      steps: recipe.steps.map((s) => ({
        id: s.id,
        stepNumber: s.stepNumber,
        instruction: s.instruction,
        imageUrl: s.imageUrl,
        timerSeconds: s.timerSeconds,
      })),

      createdAt: recipe.createdAt,
      updatedAt: recipe.updatedAt,
    },
  });
};

export const createRecipe = async (req: AuthRequest, res: Response) => {
  try {
    const authorId = req.user!.id;
    const recipe = await createRecipeTransaction({
      ...req.body,
      authorId,
    });

    return res.status(201).json({
      success: true,
      message: 'Tạo công thức thành công.',
      data: recipe,
    });
  } catch (error: any) {
    if (error instanceof RecipeTransactionError) {
      return res.status(error.statusCode).json({
        success: false,
        errorCode: error.errorCode,
        message: error.message,
      });
    }

    console.error('Loi tao cong thuc mon an:', error);
    return res.status(500).json({
      success: false,
      errorCode: ErrorCodes.INTERNAL_SERVER_ERROR,
      message: 'Đã có lỗi xảy ra khi tạo công thức.',
    });
  }
};

export const updateRecipe = async (req: AuthRequest, res: Response) => {
  try {
    const recipeId = String(req.params.id);
    const authorId = req.user!.id;

    const updatedRecipe = await updateRecipeTransaction(recipeId, {
      ...req.body,
      authorId,
    });

    return res.status(200).json({
      success: true,
      message: 'Cập nhật công thức thành công.',
      data: updatedRecipe,
    });
  } catch (error: any) {
    if (error instanceof RecipeTransactionError) {
      return res.status(error.statusCode).json({
        success: false,
        errorCode: error.errorCode,
        message: error.message,
      });
    }

    console.error('Loi cap nhat cong thuc mon an:', error);
    return res.status(500).json({
      success: false,
      errorCode: ErrorCodes.INTERNAL_SERVER_ERROR,
      message: 'Đã có lỗi xảy ra khi cập nhật công thức.',
    });
  }
};

/**
 * GET /api/v1/recipes
 * bộ lọc đa tầng (danh mục, chế độ ăn, thời gian nấu, tìm kiếm từ khóa) kết hợp loại trừ dị ứng
 */
export const getRecipes = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    const categoryId = req.query.categoryId ? Number(req.query.categoryId) : undefined;
    const categorySlug = req.query.categorySlug ? String(req.query.categorySlug) : undefined;
    const dietaryRegimeId = req.query.dietaryRegimeId ? Number(req.query.dietaryRegimeId) : undefined;
    const dietaryRegimeSlug = req.query.dietaryRegimeSlug ? String(req.query.dietaryRegimeSlug) : undefined;
    const maxCookingTime = req.query.maxCookingTime ? Number(req.query.maxCookingTime) : undefined;
    const minRating = req.query.minRating ? Number(req.query.minRating) : undefined;
    const search = req.query.search ? String(req.query.search) : undefined;
    const excludeAllergies = req.query.excludeAllergies !== undefined
      ? req.query.excludeAllergies !== 'false'
      : true;
    const sortBy = (req.query.sortBy as any) || 'newest';
    const sortDirection = (req.query.sortDirection as any) || undefined;
    const page = req.query.page ? Number(req.query.page) : 1;
    const limit = req.query.limit ? Number(req.query.limit) : 10;

    const result = await filterRecipesQuery({
      userId,
      categoryId,
      categorySlug,
      dietaryRegimeId,
      dietaryRegimeSlug,
      maxCookingTime,
      minRating,
      search,
      excludeAllergies,
      sortBy,
      sortDirection,
      page,
      limit,
    });

    return res.status(200).json({
      success: true,
      message: 'Lấy danh sách công thức thành công.',
      ...result,
    });
  } catch (error: any) {
    console.error('Loi loc cong thuc mon an:', error);
    return res.status(error.statusCode || 500).json({
      success: false,
      errorCode: error.errorCode || ErrorCodes.INTERNAL_SERVER_ERROR,
      message: error.message || 'Đã có lỗi xảy ra khi truy vấn công thức.',
    });
  }
};

/**
 * POST /api/v1/recipes/:id/favorite
 * thả tim / hủy thả tim công thức
 */
export const toggleFavorite = async (req: AuthRequest, res: Response) => {
  try {
    const recipeId = String(req.params.id);
    const userId = req.user!.id;

    const result = await toggleFavoriteRecipe(userId, recipeId);

    return res.status(200).json({
      success: true,
      ...result,
    });
  } catch (error: any) {
    console.error('Loi tha tim / bo tim cong thuc:', error);
    return res.status(error.statusCode || 500).json({
      success: false,
      errorCode: error.errorCode || ErrorCodes.INTERNAL_SERVER_ERROR,
      message: error.message || 'Đã có lỗi xảy ra khi cập nhật yêu thích.',
    });
  }
};

/**
 * GET /api/v1/recipes/:id/favorite
 * kiểm tra trạng thái đã thả tim của người dùng hiện tại
 */
export const getFavoriteStatus = async (req: AuthRequest, res: Response) => {
  try {
    const recipeId = String(req.params.id);
    const userId = req.user!.id;

    const result = await checkFavoriteStatus(userId, recipeId);

    return res.status(200).json({
      success: true,
      data: result,
    });
  } catch (error: any) {
    console.error('Loi kiem tra trang thai tha tim:', error);
    return res.status(error.statusCode || 500).json({
      success: false,
      errorCode: error.errorCode || ErrorCodes.INTERNAL_SERVER_ERROR,
      message: error.message || 'Đã có lỗi xảy ra khi kiểm tra trạng thái yêu thích.',
    });
  }
};

/**
 * GET /api/v1/recipes/favorites/my
 * lấy danh sách toàn bộ công thức người dùng đã lưu yêu thích
 */
export const getMyFavoriteRecipes = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user!.id;
    const page = req.query.page ? Number(req.query.page) : 1;
    const limit = req.query.limit ? Number(req.query.limit) : 10;

    const result = await getUserFavoriteRecipes(userId, { page, limit });

    return res.status(200).json({
      success: true,
      message: 'Lấy danh sách công thức yêu thích thành công.',
      ...result,
    });
  } catch (error: any) {
    console.error('Loi lay danh sach cong thuc yeu thich:', error);
    return res.status(error.statusCode || 500).json({
      success: false,
      errorCode: error.errorCode || ErrorCodes.INTERNAL_SERVER_ERROR,
      message: error.message || 'Đã có lỗi xảy ra khi lấy danh sách yêu thích.',
    });
  }
};


