
import { Response } from 'express';
import { prisma } from '../../config/prisma';
import { AuthRequest } from '../../common/middlewares/auth.middleware';

export const getRecipeById = async (
  req: AuthRequest,
  res: Response,
) => {
  const recipeId = String(req.params.id);
  const currentUserId = req.user?.id;

  // Lấy thông tin chi tiết công thức
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

  // Kiểm tra công thức có tồn tại không
  if (!recipe) {
    return res.status(404).json({
      success: false,
      errorCode: 'RECIPE_NOT_FOUND',
      message: 'Công thức nấu ăn không tồn tại hoặc đã bị xóa.',
    });
  }

  // Kiểm tra người dùng đã yêu thích công thức chưa
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

  // Trả kết quả chi tiết công thức
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
