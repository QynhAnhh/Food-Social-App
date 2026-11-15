
import { Response } from 'express';
import { z } from 'zod';
import { prisma } from '../../config/prisma';
import { AuthRequest } from '../../common/middlewares/auth.middleware';

const addFridgeItemSchema = z.object({
  ingredientId: z.number().int().positive(),
  quantity: z.number().positive('Số lượng phải lớn hơn 0'),
  expiryDate: z.string().datetime().nullable().optional(),
});

const updateFridgeItemSchema = z.object({
  quantity: z.number().positive('Số lượng phải lớn hơn 0'),
  expiryDate: z.string().datetime().nullable().optional(),
});

// 1. GET /api/v1/fridge/items
// Lấy danh sách nguyên liệu trong tủ lạnh
export const getFridgeItems = async (
  req: AuthRequest,
  res: Response,
) => {
  const items = await prisma.userFridgeItem.findMany({
    where: { userId: req.user!.id },
    include: { ingredient: true },
    orderBy: { updatedAt: 'desc' },
  });

  return res.status(200).json({
    success: true,
    message: 'Lấy danh sách nguyên liệu tủ lạnh thành công.',
    data: items.map((item) => ({
      id: item.id,
      ingredientId: item.ingredientId,
      name: item.ingredient.name,
      quantity: item.quantity,
      unit: item.ingredient.standardUnit,
      imageUrl: item.ingredient.imageUrl,
      expiryDate: item.expiryDate,
      updatedAt: item.updatedAt,
    })),
  });
};

// 2. POST /api/v1/fridge/items
// Thêm hoặc cập nhật nguyên liệu trong tủ lạnh
export const addFridgeItem = async (
  req: AuthRequest,
  res: Response,
) => {
  const parsed = addFridgeItemSchema.safeParse(req.body);

  if (!parsed.success) {
    return res.status(400).json({
      success: false,
      errorCode: 'VALIDATION_ERROR',
      message: parsed.error.errors[0].message,
    });
  }

  const { ingredientId, quantity, expiryDate } = parsed.data;
  const userId = req.user!.id;

  const item = await prisma.userFridgeItem.upsert({
    where: {
      userId_ingredientId: { userId, ingredientId },
    },
    update: {
      quantity,
      expiryDate: expiryDate ? new Date(expiryDate) : null,
    },
    create: {
      userId,
      ingredientId,
      quantity,
      expiryDate: expiryDate ? new Date(expiryDate) : null,
    },
    include: { ingredient: true },
  });

  return res.status(201).json({
    success: true,
    message: 'Đã lưu nguyên liệu vào tủ lạnh.',
    data: {
      id: item.id,
      ingredientId: item.ingredientId,
      name: item.ingredient.name,
      quantity: item.quantity,
      unit: item.ingredient.standardUnit,
      expiryDate: item.expiryDate,
    },
  });
};

// 3. PUT /api/v1/fridge/items/:id
// Sửa định lượng và hạn sử dụng nguyên liệu
export const updateFridgeItem = async (
  req: AuthRequest,
  res: Response,
) => {
  const parsed = updateFridgeItemSchema.safeParse(req.body);

  if (!parsed.success) {
    return res.status(400).json({
      success: false,
      errorCode: 'VALIDATION_ERROR',
      message: parsed.error.errors[0].message,
    });
  }

  const itemId = String(req.params.id);

  const existing = await prisma.userFridgeItem.findFirst({
    where: {
      id: itemId,
      userId: req.user!.id,
    },
  });

  if (!existing) {
    return res.status(404).json({
      success: false,
      errorCode: 'FRIDGE_ITEM_NOT_FOUND',
      message: 'Không tìm thấy nguyên liệu này trong tủ lạnh của bạn.',
    });
  }

  const updated = await prisma.userFridgeItem.update({
    where: { id: itemId },
    data: {
      quantity: parsed.data.quantity,
      ...(parsed.data.expiryDate !== undefined && {
        expiryDate: parsed.data.expiryDate
          ? new Date(parsed.data.expiryDate)
          : null,
      }),
    },
    include: { ingredient: true },
  });

  return res.status(200).json({
    success: true,
    message: 'Cập nhật nguyên liệu thành công.',
    data: {
      id: updated.id,
      ingredientId: updated.ingredientId,
      name: updated.ingredient.name,
      quantity: updated.quantity,
      unit: updated.ingredient.standardUnit,
      expiryDate: updated.expiryDate,
    },
  });
};

// 4. DELETE /api/v1/fridge/items/:id
// Xóa nguyên liệu khỏi tủ lạnh
export const deleteFridgeItem = async (
  req: AuthRequest,
  res: Response,
) => {
  const itemId = String(req.params.id);

  const deleted = await prisma.userFridgeItem.deleteMany({
    where: {
      id: itemId,
      userId: req.user!.id,
    },
  });

  if (deleted.count === 0) {
    return res.status(404).json({
      success: false,
      errorCode: 'FRIDGE_ITEM_NOT_FOUND',
      message: 'Không tìm thấy nguyên liệu cần xóa.',
    });
  }

  return res.status(200).json({
    success: true,
    message: 'Đã xóa nguyên liệu khỏi tủ lạnh.',
    data: { id: itemId },
  });
};

// 5. GET /api/v1/fridge/recommendations
// Gợi ý công thức từ nguyên liệu trong tủ lạnh
export const getFridgeRecommendations = async (
  req: AuthRequest,
  res: Response,
) => {
  const userId = req.user!.id;

  // Lấy nguyên liệu trong tủ lạnh và danh sách dị ứng
  const [fridgeItems, userAllergies] = await Promise.all([
    prisma.userFridgeItem.findMany({
      where: { userId },
    }),
    prisma.userAllergy.findMany({
      where: { userId },
    }),
  ]);

  if (fridgeItems.length === 0) {
    return res.status(200).json({
      success: true,
      message:
        'Tủ lạnh đang trống. Hãy thêm nguyên liệu để nhận gợi ý món ăn.',
      data: [],
    });
  }

  const fridgeMap = new Map<number, number>(
    fridgeItems.map((item) => [
      item.ingredientId,
      item.quantity,
    ]),
  );

  const fridgeIngredientIds = Array.from(fridgeMap.keys());

  const allergyIngredientIds = userAllergies.map(
    (a) => a.ingredientId,
  );

  // Tìm công thức có ít nhất một nguyên liệu trong tủ lạnh
  // và không chứa bất kỳ nguyên liệu gây dị ứng nào
  const candidateRecipes = await prisma.recipe.findMany({
    where: {
      ingredients: {
        some: {
          ingredientId: { in: fridgeIngredientIds },
        },
        ...(allergyIngredientIds.length > 0 && {
          none: {
            ingredientId: { in: allergyIngredientIds },
          },
        }),
      },
    },
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
      ingredients: {
        include: { ingredient: true },
      },
    },
  });

  // Tính tỷ lệ nguyên liệu khớp và nguyên liệu còn thiếu
  const scoredRecipes = candidateRecipes.map((recipe) => {
    const totalIngredients = recipe.ingredients.length;

    const matchedIngredients: any[] = [];
    const missingIngredients: any[] = [];

    for (const reqIng of recipe.ingredients) {
      const inFridgeQty = fridgeMap.get(reqIng.ingredientId);

      if (inFridgeQty !== undefined) {
        matchedIngredients.push({
          ingredientId: reqIng.ingredientId,
          name: reqIng.ingredient.name,
          requiredQuantity: reqIng.quantity,
          availableQuantity: inFridgeQty,
          isEnoughQuantity: inFridgeQty >= reqIng.quantity,
          unit: reqIng.ingredient.standardUnit,
        });
      } else {
        missingIngredients.push({
          ingredientId: reqIng.ingredientId,
          name: reqIng.ingredient.name,
          missingQuantity: reqIng.quantity,
          unit: reqIng.ingredient.standardUnit,
        });
      }
    }

    const matchPercentage =
      totalIngredients > 0
        ? Math.round(
            (matchedIngredients.length / totalIngredients) * 100,
          )
        : 0;

    return {
      id: recipe.id,
      title: recipe.title,
      thumbnailUrl: recipe.thumbnailUrl,
      cookingTime: recipe.cookingTime,
      servings: recipe.servings,
      averageRating: recipe.averageRating,
      category: recipe.category,
      author: recipe.author,
      matchPercentage,
      matchedCount: matchedIngredients.length,
      totalIngredients,
      matchedIngredients,
      missingIngredients,
    };
  });

  // Sắp xếp:
  // 1. Tỷ lệ nguyên liệu khớp giảm dần
  // 2. Số nguyên liệu thiếu tăng dần
  // 3. Điểm đánh giá giảm dần
  scoredRecipes.sort((a, b) => {
    if (b.matchPercentage !== a.matchPercentage) {
      return b.matchPercentage - a.matchPercentage;
    }

    if (
      a.missingIngredients.length !==
      b.missingIngredients.length
    ) {
      return (
        a.missingIngredients.length -
        b.missingIngredients.length
      );
    }

    return b.averageRating - a.averageRating;
  });

  return res.status(200).json({
    success: true,
    message: 'Gợi ý công thức dựa trên tủ lạnh thành công.',
    data: scoredRecipes,
  });
};
