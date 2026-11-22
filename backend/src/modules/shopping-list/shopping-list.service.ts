import { PrismaClient } from '@prisma/client';
import { prisma as defaultPrisma } from '../../config/prisma';
import { AppError, ErrorCodes } from '../../common/errors';

export interface AddRecipeToShoppingListInput {
  userId: string;
  recipeId: string;
  servingsMultiplier?: number; // hệ số nhân khẩu phần (mặc định = 1)
}

export interface ShoppingListRecipeSourceDetail {
  recipeId: string;
  recipeTitle: string;
  recipeThumbnail: string;
  addedQuantity: number;
}

export interface ShoppingListItemDetail {
  id: string;
  ingredientId: number;
  name: string;
  standardUnit: string;  // đơn vị đo lường (gam/kg,..)
  imageUrl: string | null;
  totalQuantity: number;
  isPurchased: boolean;
  sources: ShoppingListRecipeSourceDetail[];
  sourcesCount: number;
  updatedAt: Date;
}

export interface ShoppingListSummary {
  totalItems: number;
  purchasedItemsCount: number;
  unpurchasedItemsCount: number;
  items: ShoppingListItemDetail[];
}

/*
 * logic cộng dồn định lượng giỏ đi chợ
 */
export async function addRecipeToShoppingList(
  input: AddRecipeToShoppingListInput,
  prismaClient: PrismaClient = defaultPrisma as any,
): Promise<{ message: string; addedIngredientsCount: number; recipeTitle: string }> {
  const db: any = prismaClient;
  const { userId, recipeId, servingsMultiplier = 1 } = input;

  if (servingsMultiplier <= 0) {
    throw new AppError(400, ErrorCodes.INVALID_INPUT, 'Hệ số khẩu phần phải lớn hơn 0.');
  }

  // kiểm tra công thức và lấy danh sách nguyên liệu
  const recipe = await db.recipe.findUnique({
    where: { id: recipeId },
    include: {
      ingredients: {
        include: {
          ingredient: true,
        },
      },
    },
  });

  if (!recipe) {
    throw new AppError(404, ErrorCodes.RECIPE_NOT_FOUND, 'Công thức nấu ăn không tồn tại.');
  }

  if (recipe.ingredients.length === 0) {
    throw new AppError(
      400,
      ErrorCodes.RECIPE_MISSING_INGREDIENTS,
      'Công thức không có nguyên liệu nào để thêm vào giỏ đi chợ.',
    );
  }

  // cộng dồn định lượng và ghi nhận nguồn gốc
  await db.$transaction(async (tx: any) => {
    for (const item of recipe.ingredients) {
      const addedQuantity = Number((item.quantity * servingsMultiplier).toFixed(2));

      // kiểm tra nguyên liệu đã có trong giỏ đi chợ của người dùng chưa
      const existingShoppingItem = await tx.shoppingListItem.findUnique({
        where: {
          userId_ingredientId: {
            userId,
            ingredientId: item.ingredientId,
          },
        },
      });

      if (existingShoppingItem) {
        // ĐÃ TỒN TẠI -> Cộng dồn total_quantity và reset trạng thái mua
        await tx.shoppingListItem.update({
          where: { id: existingShoppingItem.id },
          data: {
            totalQuantity: Number((existingShoppingItem.totalQuantity + addedQuantity).toFixed(2)),
            isPurchased: false,
          },
        });

        // Cập nhật hoặc ghi nhận nguồn gốc công thức
        const existingSource = await tx.shoppingListRecipeSource.findUnique({
          where: {
            shoppingItemId_recipeId: {
              shoppingItemId: existingShoppingItem.id,
              recipeId,
            },
          },
        });

        if (existingSource) {
          // cộng dồn khối lượng thành phần do công thức này đóng góp
          await tx.shoppingListRecipeSource.update({
            where: {
              shoppingItemId_recipeId: {
                shoppingItemId: existingShoppingItem.id,
                recipeId,
              },
            },
            data: {
              addedQuantity: Number((existingSource.addedQuantity + addedQuantity).toFixed(2)),
            },
          });
        } else {
          // tạo mới bản ghi nguồn gốc liên kết tới công thức
          await tx.shoppingListRecipeSource.create({
            data: {
              shoppingItemId: existingShoppingItem.id,
              recipeId,
              addedQuantity,
            },
          });
        }
      } else {
        // CHƯA TỒN TẠI -> Tạo mới shopping_list_item với định lượng ban đầu
        const createdItem = await tx.shoppingListItem.create({
          data: {
            userId,
            ingredientId: item.ingredientId,
            totalQuantity: addedQuantity,
            isPurchased: false,
          },
        });

        // tạo bản ghi nguồn gốc tương ứng
        await tx.shoppingListRecipeSource.create({
          data: {
            shoppingItemId: createdItem.id,
            recipeId,
            addedQuantity,
          },
        });
      }
    }
  });

  return {
    message: `Đã thêm thành công ${recipe.ingredients.length} nguyên liệu của món "${recipe.title}" vào giỏ đi chợ.`,
    addedIngredientsCount: recipe.ingredients.length,
    recipeTitle: recipe.title,
  };
}

/**
 * thêm nguyên liệu tùy chỉnh / đơn lẻ vào giỏ đi chợ
 */
export async function addCustomIngredientToShoppingList(
  userId: string,
  ingredientId: number,
  quantity: number,
  prismaClient: PrismaClient = defaultPrisma as any,
): Promise<{ message: string; item: any }> {
  const db: any = prismaClient;

  if (quantity <= 0) {
    throw new AppError(400, ErrorCodes.INVALID_INPUT, 'Định lượng phải lớn hơn 0.');
  }

  const ingredient = await db.ingredient.findUnique({
    where: { id: ingredientId },
  });

  if (!ingredient) {
    throw new AppError(404, ErrorCodes.INGREDIENT_NOT_FOUND, 'Nguyên liệu không tồn tại trong từ điển.');
  }

  const existing = await db.shoppingListItem.findUnique({
    where: {
      userId_ingredientId: {
        userId,
        ingredientId,
      },
    },
  });

  let item;
  if (existing) {
    item = await db.shoppingListItem.update({
      where: { id: existing.id },
      data: {
        totalQuantity: Number((existing.totalQuantity + quantity).toFixed(2)),
        isPurchased: false,
      },
      include: { ingredient: true },
    });
  } else {
    item = await db.shoppingListItem.create({
      data: {
        userId,
        ingredientId,
        totalQuantity: Number(quantity.toFixed(2)),
        isPurchased: false,
      },
      include: { ingredient: true },
    });
  }

  return {
    message: `Đã thêm ${quantity} ${ingredient.standardUnit} ${ingredient.name} vào giỏ đi chợ.`,
    item,
  };
}

/**
 * lấy toàn bộ danh sách đi chợ kèm truy vết nguồn gốc
 */
export async function getShoppingList(
  userId: string,
  prismaClient: PrismaClient = defaultPrisma as any,
): Promise<ShoppingListSummary> {
  const db: any = prismaClient;

  const items = await db.shoppingListItem.findMany({
    where: { userId },
    include: {
      ingredient: {
        select: {
          id: true,
          name: true,
          standardUnit: true,
          imageUrl: true,
        },
      },
      recipeSources: {
        include: {
          recipe: {
            select: {
              id: true,
              title: true,
              thumbnailUrl: true,
            },
          },
        },
      },
    },
    orderBy: [
      { isPurchased: 'asc' },
      { updatedAt: 'desc' },
    ],
  });

  const formattedItems: ShoppingListItemDetail[] = (items || []).map((item: any) => ({
    id: item.id,
    ingredientId: item.ingredientId,
    name: item.ingredient.name,
    standardUnit: item.ingredient.standardUnit,
    imageUrl: item.ingredient.imageUrl,
    totalQuantity: item.totalQuantity,
    isPurchased: item.isPurchased,
    sources: (item.recipeSources || []).map((s: any) => ({
      recipeId: s.recipe.id,
      recipeTitle: s.recipe.title,
      recipeThumbnail: s.recipe.thumbnailUrl,
      addedQuantity: s.addedQuantity,
    })),
    sourcesCount: (item.recipeSources || []).length,
    updatedAt: item.updatedAt,
  }));

  const purchasedCount = formattedItems.filter((i: ShoppingListItemDetail) => i.isPurchased).length;

  return {
    totalItems: formattedItems.length,
    purchasedItemsCount: purchasedCount,
    unpurchasedItemsCount: formattedItems.length - purchasedCount,
    items: formattedItems,
  };
}

/**
 * cập nhật trạng thái đã mua
 */
export async function toggleShoppingItemBought(
  userId: string,
  itemId: string,
  isPurchased?: boolean,
  prismaClient: PrismaClient = defaultPrisma as any,
): Promise<{ id: string; isPurchased: boolean }> {
  const db: any = prismaClient;

  const item = await db.shoppingListItem.findFirst({
    where: { id: itemId, userId },
  });

  if (!item) {
    throw new AppError(404, ErrorCodes.SHOPPING_ITEM_NOT_FOUND, 'Mục giỏ hàng không tồn tại.');
  }

  const nextStatus = isPurchased !== undefined ? isPurchased : !item.isPurchased;

  const updated = await db.shoppingListItem.update({
    where: { id: itemId },
    data: { isPurchased: nextStatus },
  });

  return {
    id: updated.id,
    isPurchased: updated.isPurchased,
  };
}

/**
 * chỉnh sửa trực tiếp số lượng nguyên liệu trong giỏ
 */
export async function updateShoppingItemQuantity(
  userId: string,
  itemId: string,
  totalQuantity: number,
  prismaClient: PrismaClient = defaultPrisma as any,
): Promise<{ id: string; totalQuantity: number }> {
  const db: any = prismaClient;

  if (totalQuantity <= 0) {
    throw new AppError(400, ErrorCodes.INVALID_INPUT, 'Định lượng phải lớn hơn 0.');
  }

  const item = await db.shoppingListItem.findFirst({
    where: { id: itemId, userId },
  });

  if (!item) {
    throw new AppError(404, ErrorCodes.SHOPPING_ITEM_NOT_FOUND, 'Mục giỏ hàng không tồn tại.');
  }

  const updated = await db.shoppingListItem.update({
    where: { id: itemId },
    data: { totalQuantity: Number(totalQuantity.toFixed(2)) },
  });

  return {
    id: updated.id,
    totalQuantity: updated.totalQuantity,
  };
}

/**
 * xóa một mục khỏi giỏ đi chợ
 */
export async function removeShoppingListItem(
  userId: string,
  itemId: string,
  prismaClient: PrismaClient = defaultPrisma as any,
): Promise<{ message: string }> {
  const db: any = prismaClient;

  const item = await db.shoppingListItem.findFirst({
    where: { id: itemId, userId },
  });

  if (!item) {
    throw new AppError(404, ErrorCodes.SHOPPING_ITEM_NOT_FOUND, 'Mục giỏ hàng không tồn tại.');
  }

  await db.shoppingListItem.delete({
    where: { id: itemId },
  });

  return { message: 'Đã xóa nguyên liệu khỏi giỏ đi chợ.' };
}

/**
 * xóa toàn bộ đóng góp của 1 món ăn cụ thể khỏi giỏ đi chợ
 * trừ dần định lượng added_quantity, nếu định lượng <= 0 thì tự xóa mục nguyên liệu
 */
export async function removeRecipeFromShoppingList(
  userId: string,
  recipeId: string,
  prismaClient: PrismaClient = defaultPrisma as any,
): Promise<{ message: string; affectedItemsCount: number }> {
  const db: any = prismaClient;

  const sources = await db.shoppingListRecipeSource.findMany({
    where: {
      recipeId,
      shoppingItem: { userId },
    },
    include: {
      shoppingItem: true,
    },
  });

  if (sources.length === 0) {
    return {
      message: 'Món ăn này chưa được thêm vào giỏ đi chợ.',
      affectedItemsCount: 0,
    };
  }

  await db.$transaction(async (tx: any) => {
    for (const source of sources) {
      const parentItem = source.shoppingItem;
      const remainingQty = Number((parentItem.totalQuantity - source.addedQuantity).toFixed(2));

      if (remainingQty <= 0) {
        // nếu trừ hết định lượng thì xóa hẳn mục đó khỏi giỏ
        await tx.shoppingListItem.delete({
          where: { id: parentItem.id },
        });
      } else {
        // ngược lại, cập nhật định lượng còn lại và xóa liên kết nguồn gốc với món ăn này
        await tx.shoppingListItem.update({
          where: { id: parentItem.id },
          data: { totalQuantity: remainingQty },
        });
        await tx.shoppingListRecipeSource.delete({
          where: {
            shoppingItemId_recipeId: {
              shoppingItemId: parentItem.id,
              recipeId,
            },
          },
        });
      }
    }
  });

  return {
    message: `Đã xóa công thức và hoàn trả định lượng cho ${sources.length} nguyên liệu trong giỏ.`,
    affectedItemsCount: sources.length,
  };
}

/**
 * xóa sạch toàn bộ giỏ đi chợ của người dùng
 */
export async function clearShoppingList(
  userId: string,
  prismaClient: PrismaClient = defaultPrisma as any,
): Promise<{ message: string; deletedCount: number }> {
  const db: any = prismaClient;

  const result = await db.shoppingListItem.deleteMany({
    where: { userId },
  });

  return {
    message: 'Đã dọn sạch toàn bộ giỏ đi chợ.',
    deletedCount: result.count,
  };
}
