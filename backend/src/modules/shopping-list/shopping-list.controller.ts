import { Response } from 'express';
import { z } from 'zod';
import { prisma } from '../../config/prisma';
import { AuthRequest } from '../../common/middlewares/auth.middleware';
import { ErrorCodes } from '../../common/errors';

const addItemSchema = z
  .object({
    ingredientId: z.number().int().positive().optional(),
    customName: z.string().trim().min(1).max(100).optional(),
    quantity: z.number().positive('Số lượng phải lớn hơn 0').default(1),
    unit: z.string().trim().max(30).optional(),
    sourceRecipeId: z.string().uuid().optional(),
    note: z.string().trim().max(200).optional(),
  })
  .refine((d) => Boolean(d.ingredientId || d.customName), {
    message: 'Phải cung cấp ingredientId hoặc customName.',
  });

const updateItemSchema = z.object({
  quantity: z.number().positive().optional(),
  unit: z.string().trim().max(30).nullable().optional(),
  note: z.string().trim().max(200).nullable().optional(),
  isChecked: z.boolean().optional(),
});

const addFromRecipeSchema = z.object({
  subtractFridge: z.boolean().optional().default(true),
  servingsMultiplier: z.number().positive().optional().default(1),
});

const formatShoppingItem = (item: any) => ({
  id: item.id,
  name: item.ingredient ? item.ingredient.name : item.customName,
  ingredientId: item.ingredientId,
  imageUrl: item.ingredient?.imageUrl ?? null,
  quantity: item.quantity,
  unit: item.unit ?? item.ingredient?.standardUnit ?? '',
  isChecked: item.isChecked,
  note: item.note,
  source: item.sourceRecipe
    ? {
        type: 'RECIPE' as const,
        recipeId: item.sourceRecipe.id,
        title: item.sourceRecipe.title,
        thumbnailUrl: item.sourceRecipe.thumbnailUrl,
      }
    : {
        type: 'MANUAL' as const,
        recipeId: null,
        title: 'Thêm thủ công',
        thumbnailUrl: null,
      },
  createdAt: item.createdAt,
  updatedAt: item.updatedAt,
});

// GET /api/v1/shopping-list?isChecked=true|false&sourceRecipeId=uuid
export const getShoppingList = async (req: AuthRequest, res: Response) => {
  const userId = req.user!.id;
  const isCheckedQuery = req.query.isChecked;
  const sourceRecipeId = req.query.sourceRecipeId
    ? String(req.query.sourceRecipeId)
    : undefined;

  const items = await prisma.shoppingListItem.findMany({
    where: {
      userId,
      ...(isCheckedQuery !== undefined && {
        isChecked: String(isCheckedQuery) === 'true',
      }),
      ...(sourceRecipeId && { sourceRecipeId }),
    },
    include: {
      ingredient: {
        select: { id: true, name: true, standardUnit: true, imageUrl: true },
      },
      sourceRecipe: {
        select: { id: true, title: true, thumbnailUrl: true },
      },
    },
    orderBy: [{ isChecked: 'asc' }, { createdAt: 'desc' }],
  });

  const formatted = items.map(formatShoppingItem);
  const checkedCount = formatted.filter((i) => i.isChecked).length;

  return res.status(200).json({
    success: true,
    message: 'Lấy danh sách đi chợ thành công.',
    data: {
      summary: {
        total: formatted.length,
        checkedCount,
        uncheckedCount: formatted.length - checkedCount,
      },
      items: formatted,
    },
  });
};

// POST /api/v1/shopping-list
export const addShoppingItem = async (req: AuthRequest, res: Response) => {
  const parsed = addItemSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({
      success: false,
      errorCode: ErrorCodes.VALIDATION_ERROR,
      message: parsed.error.errors[0].message,
    });
  }

  const userId = req.user!.id;
  const { ingredientId, customName, quantity, unit, sourceRecipeId, note } =
    parsed.data;

  let resolvedUnit = unit ?? null;

  if (ingredientId) {
    const ingredient = await prisma.ingredient.findUnique({
      where: { id: ingredientId },
    });
    if (!ingredient) {
      return res.status(404).json({
        success: false,
        errorCode: ErrorCodes.INGREDIENT_NOT_FOUND,
        message: 'Nguyên liệu không tồn tại.',
      });
    }
    resolvedUnit = unit ?? ingredient.standardUnit;
  }

  if (sourceRecipeId) {
    const recipe = await prisma.recipe.findUnique({
      where: { id: sourceRecipeId },
      select: { id: true },
    });
    if (!recipe) {
      return res.status(404).json({
        success: false,
        errorCode: ErrorCodes.RECIPE_NOT_FOUND,
        message: 'Công thức nguồn không tồn tại.',
      });
    }
  }

  // Nếu đã có nguyên liệu giống hệt (chưa mua) cùng nguồn gốc -> cộng dồn số lượng
  if (ingredientId) {
    const existing = await prisma.shoppingListItem.findFirst({
      where: {
        userId,
        ingredientId,
        sourceRecipeId: sourceRecipeId ?? null,
        isChecked: false,
      },
    });

    if (existing) {
      const updated = await prisma.shoppingListItem.update({
        where: { id: existing.id },
        data: { quantity: existing.quantity + quantity },
        include: {
          ingredient: {
            select: { id: true, name: true, standardUnit: true, imageUrl: true },
          },
          sourceRecipe: {
            select: { id: true, title: true, thumbnailUrl: true },
          },
        },
      });

      return res.status(200).json({
        success: true,
        message: 'Đã cộng dồn số lượng vào giỏ đi chợ.',
        data: formatShoppingItem(updated),
      });
    }
  }

  const created = await prisma.shoppingListItem.create({
    data: {
      userId,
      ingredientId: ingredientId ?? null,
      customName: ingredientId ? null : customName ?? null,
      quantity,
      unit: resolvedUnit,
      sourceRecipeId: sourceRecipeId ?? null,
      note: note ?? null,
    },
    include: {
      ingredient: {
        select: { id: true, name: true, standardUnit: true, imageUrl: true },
      },
      sourceRecipe: {
        select: { id: true, title: true, thumbnailUrl: true },
      },
    },
  });

  return res.status(201).json({
    success: true,
    message: 'Thêm nguyên liệu vào giỏ đi chợ thành công.',
    data: formatShoppingItem(created),
  });
};

// POST /api/v1/shopping-list/from-recipe/:recipeId
export const addMissingFromRecipe = async (req: AuthRequest, res: Response) => {
  const parsed = addFromRecipeSchema.safeParse(req.body ?? {});
  if (!parsed.success) {
    return res.status(400).json({
      success: false,
      errorCode: ErrorCodes.VALIDATION_ERROR,
      message: parsed.error.errors[0].message,
    });
  }

  const userId = req.user!.id;
  const recipeId = String(req.params.recipeId);
  const { subtractFridge, servingsMultiplier } = parsed.data;

  const recipe = await prisma.recipe.findUnique({
    where: { id: recipeId },
    include: {
      ingredients: {
        include: { ingredient: true },
      },
    },
  });

  if (!recipe) {
    return res.status(404).json({
      success: false,
      errorCode: ErrorCodes.RECIPE_NOT_FOUND,
      message: 'Công thức không tồn tại.',
    });
  }

  const fridgeMap = new Map<number, number>();
  if (subtractFridge) {
    const fridgeItems = await prisma.userFridgeItem.findMany({
      where: { userId },
      select: { ingredientId: true, quantity: true },
    });
    fridgeItems.forEach((f) => fridgeMap.set(f.ingredientId, f.quantity));
  }

  const addedItems = await prisma.$transaction(async (tx) => {
    const results: any[] = [];

    for (const ri of recipe.ingredients) {
      const requiredQty = ri.quantity * servingsMultiplier;
      const availableQty = subtractFridge ? fridgeMap.get(ri.ingredientId) ?? 0 : 0;
      const missingQty = Number((requiredQty - availableQty).toFixed(2));

      if (missingQty <= 0) continue;

      const existing = await tx.shoppingListItem.findFirst({
        where: {
          userId,
          ingredientId: ri.ingredientId,
          sourceRecipeId: recipeId,
          isChecked: false,
        },
      });

      const saved = existing
        ? await tx.shoppingListItem.update({
            where: { id: existing.id },
            data: { quantity: Number((existing.quantity + missingQty).toFixed(2)) },
            include: {
              ingredient: {
                select: { id: true, name: true, standardUnit: true, imageUrl: true },
              },
              sourceRecipe: {
                select: { id: true, title: true, thumbnailUrl: true },
              },
            },
          })
        : await tx.shoppingListItem.create({
            data: {
              userId,
              ingredientId: ri.ingredientId,
              quantity: missingQty,
              unit: ri.ingredient.standardUnit,
              sourceRecipeId: recipeId,
              note: ri.note,
            },
            include: {
              ingredient: {
                select: { id: true, name: true, standardUnit: true, imageUrl: true },
              },
              sourceRecipe: {
                select: { id: true, title: true, thumbnailUrl: true },
              },
            },
          });

      results.push(formatShoppingItem(saved));
    }

    return results;
  });

  return res.status(201).json({
    success: true,
    message:
      addedItems.length > 0
        ? `Đã thêm ${addedItems.length} nguyên liệu từ "${recipe.title}" vào giỏ đi chợ.`
        : 'Bạn đã có đủ nguyên liệu trong tủ lạnh cho món này.',
    data: addedItems,
  });
};

// PATCH /api/v1/shopping-list/:id/toggle
export const toggleShoppingItem = async (req: AuthRequest, res: Response) => {
  const userId = req.user!.id;
  const itemId = String(req.params.id);

  const existing = await prisma.shoppingListItem.findFirst({
    where: { id: itemId, userId },
  });

  if (!existing) {
    return res.status(404).json({
      success: false,
      errorCode: ErrorCodes.SHOPPING_ITEM_NOT_FOUND,
      message: 'Mục giỏ đi chợ không tồn tại.',
    });
  }

  const explicitValue =
    typeof req.body?.isChecked === 'boolean'
      ? req.body.isChecked
      : !existing.isChecked;

  const updated = await prisma.shoppingListItem.update({
    where: { id: itemId },
    data: { isChecked: explicitValue },
    include: {
      ingredient: {
        select: { id: true, name: true, standardUnit: true, imageUrl: true },
      },
      sourceRecipe: {
        select: { id: true, title: true, thumbnailUrl: true },
      },
    },
  });

  return res.status(200).json({
    success: true,
    message: updated.isChecked
      ? 'Đã đánh dấu đã mua.'
      : 'Đã bỏ đánh dấu đã mua.',
    data: formatShoppingItem(updated),
  });
};

// PATCH /api/v1/shopping-list/:id
export const updateShoppingItem = async (req: AuthRequest, res: Response) => {
  const parsed = updateItemSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({
      success: false,
      errorCode: ErrorCodes.VALIDATION_ERROR,
      message: parsed.error.errors[0].message,
    });
  }

  const userId = req.user!.id;
  const itemId = String(req.params.id);

  const existing = await prisma.shoppingListItem.findFirst({
    where: { id: itemId, userId },
  });

  if (!existing) {
    return res.status(404).json({
      success: false,
      errorCode: ErrorCodes.SHOPPING_ITEM_NOT_FOUND,
      message: 'Mục giỏ đi chợ không tồn tại.',
    });
  }

  const updated = await prisma.shoppingListItem.update({
    where: { id: itemId },
    data: parsed.data,
    include: {
      ingredient: {
        select: { id: true, name: true, standardUnit: true, imageUrl: true },
      },
      sourceRecipe: {
        select: { id: true, title: true, thumbnailUrl: true },
      },
    },
  });

  return res.status(200).json({
    success: true,
    message: 'Cập nhật mục đi chợ thành công.',
    data: formatShoppingItem(updated),
  });
};

// DELETE /api/v1/shopping-list/checked
export const clearCheckedShoppingItems = async (
  req: AuthRequest,
  res: Response,
) => {
  const userId = req.user!.id;

  const result = await prisma.shoppingListItem.deleteMany({
    where: { userId, isChecked: true },
  });

  return res.status(200).json({
    success: true,
    message: `Đã xóa ${result.count} mục đã mua khỏi giỏ đi chợ.`,
    data: { deletedCount: result.count },
  });
};

// DELETE /api/v1/shopping-list/:id
export const deleteShoppingItem = async (req: AuthRequest, res: Response) => {
  const userId = req.user!.id;
  const itemId = String(req.params.id);

  const existing = await prisma.shoppingListItem.findFirst({
    where: { id: itemId, userId },
  });

  if (!existing) {
    return res.status(404).json({
      success: false,
      errorCode: ErrorCodes.SHOPPING_ITEM_NOT_FOUND,
      message: 'Mục giỏ đi chợ không tồn tại.',
    });
  }

  await prisma.shoppingListItem.delete({ where: { id: itemId } });

  return res.status(200).json({
    success: true,
    message: 'Đã xóa mục khỏi giỏ đi chợ.',
  });
};