import { Response } from 'express';
import { Prisma } from '@prisma/client';
import { prisma } from '../../config/prisma';
import { AuthRequest } from '../../common/middlewares/auth.middleware';
import {
  createRecipeTransaction,
  updateRecipeTransaction,
  RecipeTransactionError,
} from './recipe.transaction';
import {
  toggleFavoriteRecipe,
  checkFavoriteStatus,
  getUserFavoriteRecipes,
} from './recipe.favorite';
import { ErrorCodes } from '../../common/errors';

export const getRecipes = async (req: AuthRequest, res: Response) => {
  try {
    const currentUserId = req.user?.id;

    // phân trang
    const page = Math.max(1, parseInt(String(req.query.page || '1'), 10) || 1);
    const limit = Math.min(
      50,
      Math.max(1, parseInt(String(req.query.limit || '10'), 10) || 10),
    );
    const skip = (page - 1) * limit;

    // lấy bộ lọc mặc định của user (nếu đã đăng nhập & không tắt bằng useDefaultFilter=false)
    const shouldApplyDefault =
      Boolean(currentUserId) && String(req.query.useDefaultFilter) !== 'false';

    const defaultFilter = shouldApplyDefault
      ? await prisma.savedFilter.findFirst({
          where: { userId: currentUserId!, isDefault: true },
        })
      : null;

    // hợp nhất tham số URL (ưu tiên hơn) với bộ lọc mặc định
    const searchKeyword = String(req.query.q ?? req.query.search ?? '').trim();

    const queryCategoryId =
      req.query.categoryId !== undefined
        ? Number(req.query.categoryId)
        : defaultFilter?.categoryId ?? undefined;

    const categorySlug = req.query.categorySlug
      ? String(req.query.categorySlug).trim()
      : undefined;

    let dietaryRegimeIds: number[] = defaultFilter?.dietaryRegimeIds ?? [];
    if (req.query.dietaryRegimeIds !== undefined) {
      const raw = String(req.query.dietaryRegimeIds).trim();
      dietaryRegimeIds = raw
        ? raw
            .split(',')
            .map((v) => Number(v.trim()))
            .filter((n) => Number.isInteger(n) && n > 0)
        : [];
    }

    const maxCookingTime =
      req.query.maxCookingTime !== undefined
        ? Number(req.query.maxCookingTime)
        : defaultFilter?.maxCookingTime ?? undefined;

    const minRating =
      req.query.minRating !== undefined
        ? Number(req.query.minRating)
        : defaultFilter?.minRating ?? undefined;

    const excludeAllergies =
      req.query.excludeAllergies !== undefined
        ? String(req.query.excludeAllergies) === 'true'
        : defaultFilter?.excludeAllergies ?? false;

    const sortBy = String(
      req.query.sortBy ?? defaultFilter?.sortBy ?? 'newest',
    );

    // xây dựng điều kiện WHERE
    const where: Prisma.RecipeWhereInput = {};

    if (searchKeyword) {
      where.title = {
        contains: searchKeyword,
        mode: 'insensitive',
      };
    }

    if (queryCategoryId && !Number.isNaN(queryCategoryId)) {
      where.categoryId = queryCategoryId;
    } else if (categorySlug) {
      where.category = { slug: categorySlug };
    }

    if (dietaryRegimeIds.length > 0) {
      where.dietaryTags = {
        some: {
          dietaryRegimeId: { in: dietaryRegimeIds },
        },
      };
    }

    if (maxCookingTime && !Number.isNaN(maxCookingTime) && maxCookingTime > 0) {
      where.cookingTime = { lte: maxCookingTime };
    }

    if (minRating !== undefined && !Number.isNaN(minRating) && minRating > 0) {
      where.averageRating = { gte: minRating };
    }

    // Loại trừ món chứa nguyên liệu user bị dị ứng
    if (excludeAllergies && currentUserId) {
      const allergies = await prisma.userAllergy.findMany({
        where: { userId: currentUserId },
        select: { ingredientId: true },
      });
      const allergyIds = allergies.map((a) => a.ingredientId);

      if (allergyIds.length > 0) {
        where.ingredients = {
          none: {
            ingredientId: { in: allergyIds },
          },
        };
      }
    }

    // sắp xếp
    let orderBy: Prisma.RecipeOrderByWithRelationInput = { createdAt: 'desc' };
    if (sortBy === 'rating') {
      orderBy = { averageRating: 'desc' };
    } else if (sortBy === 'cooking_time') {
      orderBy = { cookingTime: 'asc' };
    }

    // query song song danh sách + tổng số bản ghi
    const [recipes, total] = await Promise.all([
      prisma.recipe.findMany({
        where,
        orderBy,
        skip,
        take: limit,
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
                select: { id: true, name: true, slug: true },
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
      }),
      prisma.recipe.count({ where }),
    ]);

    // Check trạng thái yêu thích hàng loạt cho user đang đăng nhập
    let favoritedSet = new Set<string>();
    if (currentUserId && recipes.length > 0) {
      const favs = await prisma.favoriteRecipe.findMany({
        where: {
          userId: currentUserId,
          recipeId: { in: recipes.map((r) => r.id) },
        },
        select: { recipeId: true },
      });
      favoritedSet = new Set(favs.map((f) => f.recipeId));
    }

    const totalPages = Math.ceil(total / limit);

    return res.status(200).json({
      success: true,
      message: 'Lấy danh sách công thức thành công.',
      data: {
        items: recipes.map((r) => ({
          id: r.id,
          title: r.title,
          description: r.description,
          thumbnailUrl: r.thumbnailUrl,
          servings: r.servings,
          cookingTime: r.cookingTime,
          averageRating: r.averageRating,
          isFavorited: favoritedSet.has(r.id),
          author: r.author,
          category: r.category,
          dietaryTags: r.dietaryTags.map((t) => t.dietaryRegime),
          stats: {
            reviewsCount: r._count.reviews,
            cooksnapsCount: r._count.cooksnaps,
            favoritesCount: r._count.favoritedBy,
          },
          createdAt: r.createdAt,
        })),
        pagination: {
          page,
          limit,
          total,
          totalPages,
          hasNextPage: page < totalPages,
          hasPrevPage: page > 1,
        },
        appliedDefaultFilter: defaultFilter
          ? {
              id: defaultFilter.id,
              name: defaultFilter.name,
            }
          : null,
      },
    });
  } catch (error) {
    console.error('Get recipes error:', error);
    return res.status(500).json({
      success: false,
      errorCode: ErrorCodes.INTERNAL_SERVER_ERROR,
      message: 'Đã có lỗi xảy ra khi lấy danh sách công thức.',
    });
  }
};

export const getRecipeById = async (req: AuthRequest, res: Response) => {
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

      dietaryTags: recipe.dietaryTags.map((t) => t.dietaryRegime),

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
 * POST /api/v1/recipes/:id/favorite
 * Thả tim / Hủy thả tim công thức
 */
export const toggleFavorite = async (req: AuthRequest, res: Response) => {
  const recipeId = String(req.params.id);
  const userId = req.user!.id;

  const result = await toggleFavoriteRecipe(userId, recipeId);

  return res.status(200).json({
    success: true,
    message: result.message,
    data: result,
  });
};

/**
 * GET /api/v1/recipes/:id/favorite
 * Kiểm tra trạng thái đã thả tim của người dùng hiện tại
 */
export const getFavoriteStatus = async (req: AuthRequest, res: Response) => {
  const recipeId = String(req.params.id);
  const userId = req.user!.id;

  const result = await checkFavoriteStatus(userId, recipeId);

  return res.status(200).json({
    success: true,
    data: result,
  });
};

/**
 * GET /api/v1/recipes/favorites/my
 * Lấy danh sách toàn bộ công thức người dùng đã lưu yêu thích
 */
export const getMyFavoriteRecipes = async (req: AuthRequest, res: Response) => {
  const userId = req.user!.id;
  const page = req.query.page ? Number(req.query.page) : 1;
  const limit = req.query.limit ? Number(req.query.limit) : 10;

  const result = await getUserFavoriteRecipes(userId, { page, limit });

  return res.status(200).json({
    success: true,
    message: 'Lấy danh sách công thức yêu thích thành công.',
    data: result,
  });
};
