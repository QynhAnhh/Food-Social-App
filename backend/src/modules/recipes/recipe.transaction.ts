import { PrismaClient } from '@prisma/client';
import { prisma as defaultPrisma } from '../../config/prisma';
import { AppError, ErrorCodes, ErrorCode } from '../../common/errors';

/**
 * Lớp lỗi tùy biến cho nghiệp vụ Recipe Transaction
 * Tuân thủ mã lỗi hệ thống trong docs/conventions/error-handling-codes.md
 */
export class RecipeTransactionError extends AppError {
  constructor(message: string, errorCode: ErrorCode | string, statusCode = 400) {
    super(statusCode, errorCode, message);
    this.name = 'RecipeTransactionError';
  }
}

export interface RecipeStepInput {
  stepNumber: number;
  instruction: string;
  imageUrl?: string | null;
  timerSeconds?: number | null;
}

export interface RecipeIngredientInput {
  ingredientId: number;
  quantity: number;
  note?: string | null;
}

export interface CreateRecipeTransactionInput {
  authorId: string;
  categoryId: number;
  title: string;
  description?: string | null;
  thumbnailUrl: string;
  cookingTime: number;
  servings?: number;
  steps: RecipeStepInput[];
  ingredients: RecipeIngredientInput[];
  dietaryTagIds?: number[];
}

export interface UpdateRecipeTransactionInput {
  authorId?: string; // Dùng để xác thực quyền sở hữu (NOT_RECIPE_OWNER)
  categoryId?: number;
  title?: string;
  description?: string | null;
  thumbnailUrl?: string;
  cookingTime?: number;
  servings?: number;
  steps?: RecipeStepInput[];
  ingredients?: RecipeIngredientInput[];
  dietaryTagIds?: number[];
}

/**
 * Luồng Tạo Công thức mới đa bảng (Multi-table Create Recipe Transaction)
 * Đảm bảo tính toàn vẹn dữ liệu (ACID): recipes, recipe_steps, recipe_ingredients, recipe_dietary_tags
 */
export async function createRecipeTransaction(
  data: CreateRecipeTransactionInput,
  prismaClient: PrismaClient = defaultPrisma as any,
) {
  // 1. Kiểm tra tính hợp lệ của dữ liệu đầu vào
  if (!data.authorId) {
    throw new RecipeTransactionError('Thiếu thông tin tác giả (authorId).', ErrorCodes.INVALID_INPUT, 400);
  }
  if (!data.categoryId) {
    throw new RecipeTransactionError('Thiếu danh mục món ăn (categoryId).', ErrorCodes.CATEGORY_NOT_FOUND, 400);
  }
  if (!data.title || typeof data.title !== 'string' || !data.title.trim()) {
    throw new RecipeTransactionError('Tiêu đề công thức không được để trống.', ErrorCodes.INVALID_INPUT, 400);
  }
  if (!data.thumbnailUrl) {
    throw new RecipeTransactionError('Ảnh đại diện công thức không được để trống.', ErrorCodes.INVALID_INPUT, 400);
  }
  if (typeof data.cookingTime !== 'number' || data.cookingTime <= 0) {
    throw new RecipeTransactionError('Thời gian nấu phải là số nguyên dương.', ErrorCodes.INVALID_INPUT, 400);
  }
  if (!Array.isArray(data.steps) || data.steps.length === 0) {
    throw new RecipeTransactionError('Công thức phải có ít nhất một bước thực hiện.', ErrorCodes.RECIPE_MISSING_STEPS, 400);
  }
  if (!Array.isArray(data.ingredients) || data.ingredients.length === 0) {
    throw new RecipeTransactionError('Công thức phải có ít nhất một nguyên liệu.', ErrorCodes.RECIPE_MISSING_INGREDIENTS, 400);
  }

  // 2. Kiểm tra trùng lặp stepNumber và ingredientId trong request
  const stepNumbers = data.steps.map((s) => s.stepNumber);
  if (new Set(stepNumbers).size !== stepNumbers.length) {
    throw new RecipeTransactionError('Số thứ tự các bước không được trùng lặp.', ErrorCodes.INVALID_STEP_ORDER, 400);
  }

  const ingredientIds = data.ingredients.map((i) => i.ingredientId);
  if (new Set(ingredientIds).size !== ingredientIds.length) {
    throw new RecipeTransactionError('Danh sách nguyên liệu bị trùng lặp nguyên liệu.', ErrorCodes.DUPLICATE_INGREDIENT, 400);
  }

  // 3. Thực thi Interactive Transaction
  return await prismaClient.$transaction(async (tx: any) => {
    // 3.1. Kiểm tra tác giả tồn tại
    const author = await tx.user.findUnique({
      where: { id: data.authorId },
    });
    if (!author) {
      throw new RecipeTransactionError('Tác giả không tồn tại.', ErrorCodes.USER_NOT_FOUND, 404);
    }

    // 3.2. Kiểm tra danh mục tồn tại
    const category = await tx.category.findUnique({
      where: { id: data.categoryId },
    });
    if (!category) {
      throw new RecipeTransactionError('Danh mục món ăn được chọn không hợp lệ.', ErrorCodes.CATEGORY_NOT_FOUND, 404);
    }

    // 3.3. Kiểm tra toàn bộ nguyên liệu tồn tại trong từ điển
    const existingIngredients = await tx.ingredient.findMany({
      where: { id: { in: ingredientIds } },
      select: { id: true },
    });
    if (existingIngredients.length !== ingredientIds.length) {
      throw new RecipeTransactionError('Một hoặc nhiều nguyên liệu không tồn tại trong từ điển chuẩn.', ErrorCodes.INGREDIENT_NOT_FOUND, 404);
    }

    // 3.4. Kiểm tra các thẻ chế độ ăn kiêng (nếu có truyền)
    if (Array.isArray(data.dietaryTagIds) && data.dietaryTagIds.length > 0) {
      const existingTags = await tx.dietaryRegime.findMany({
        where: { id: { in: data.dietaryTagIds } },
        select: { id: true },
      });
      if (existingTags.length !== data.dietaryTagIds.length) {
        throw new RecipeTransactionError('Một hoặc nhiều chế độ ăn kiêng không tồn tại.', ErrorCodes.DIETARY_REGIME_NOT_FOUND, 404);
      }
    }

    // 3.5. Tạo bản ghi Recipe chính
    const newRecipe = await tx.recipe.create({
      data: {
        authorId: data.authorId,
        categoryId: data.categoryId,
        title: data.title.trim(),
        description: data.description ? data.description.trim() : null,
        thumbnailUrl: data.thumbnailUrl,
        cookingTime: data.cookingTime,
        servings: data.servings && data.servings > 0 ? data.servings : 2,
      },
    });

    const recipeId = newRecipe.id;

    // 3.6. Tạo các bước thực hiện (recipe_steps)
    const stepsData = data.steps.map((step) => ({
      recipeId,
      stepNumber: step.stepNumber,
      instruction: step.instruction.trim(),
      imageUrl: step.imageUrl || null,
      timerSeconds: step.timerSeconds ?? null,
    }));
    await tx.recipeStep.createMany({
      data: stepsData,
    });

    // 3.7. Tạo danh sách nguyên liệu (recipe_ingredients)
    const ingredientsData = data.ingredients.map((item) => ({
      recipeId,
      ingredientId: item.ingredientId,
      quantity: Number(item.quantity),
      note: item.note ? item.note.trim() : null,
    }));
    await tx.recipeIngredient.createMany({
      data: ingredientsData,
    });

    // 3.8. Gán thẻ chế độ ăn kiêng (recipe_dietary_tags - nếu có)
    if (Array.isArray(data.dietaryTagIds) && data.dietaryTagIds.length > 0) {
      const tagsData = data.dietaryTagIds.map((regimeId) => ({
        recipeId,
        dietaryRegimeId: regimeId,
      }));
      await tx.recipeDietaryTag.createMany({
        data: tagsData,
      });
    }

    // 3.9. Trả về bản ghi công thức hoàn chỉnh kèm tất cả quan hệ
    return await tx.recipe.findUnique({
      where: { id: recipeId },
      include: {
        author: {
          select: {
            id: true,
            nickname: true,
            fullName: true,
            avatarUrl: true,
          },
        },
        category: true,
        steps: {
          orderBy: { stepNumber: 'asc' },
        },
        ingredients: {
          include: {
            ingredient: true,
          },
        },
        dietaryTags: {
          include: {
            dietaryRegime: true,
          },
        },
      },
    });
  });
}

/**
 * Luồng Chỉnh sửa Công thức đa bảng (Multi-table Update Recipe Transaction)
 * Đồng bộ an toàn: recipes, recipe_steps, recipe_ingredients, recipe_dietary_tags
 */
export async function updateRecipeTransaction(
  recipeId: string,
  data: UpdateRecipeTransactionInput,
  prismaClient: PrismaClient = defaultPrisma as any,
) {
  if (!recipeId) {
    throw new RecipeTransactionError('Thiếu mã công thức (recipeId).', ErrorCodes.INVALID_INPUT, 400);
  }

  // Kiểm tra hợp lệ nếu có cập nhật steps
  if (data.steps !== undefined) {
    if (!Array.isArray(data.steps) || data.steps.length === 0) {
      throw new RecipeTransactionError('Công thức phải có ít nhất một bước thực hiện.', ErrorCodes.RECIPE_MISSING_STEPS, 400);
    }
    const stepNumbers = data.steps.map((s) => s.stepNumber);
    if (new Set(stepNumbers).size !== stepNumbers.length) {
      throw new RecipeTransactionError('Số thứ tự các bước không được trùng lặp.', ErrorCodes.INVALID_STEP_ORDER, 400);
    }
  }

  // Kiểm tra hợp lệ nếu có cập nhật ingredients
  if (data.ingredients !== undefined) {
    if (!Array.isArray(data.ingredients) || data.ingredients.length === 0) {
      throw new RecipeTransactionError('Công thức phải có ít nhất một nguyên liệu.', ErrorCodes.RECIPE_MISSING_INGREDIENTS, 400);
    }
    const ingredientIds = data.ingredients.map((i) => i.ingredientId);
    if (new Set(ingredientIds).size !== ingredientIds.length) {
      throw new RecipeTransactionError('Danh sách nguyên liệu bị trùng lặp nguyên liệu.', ErrorCodes.DUPLICATE_INGREDIENT, 400);
    }
  }

  return await prismaClient.$transaction(async (tx: any) => {
    // 1. Kiểm tra công thức hiện tại có tồn tại không
    const existingRecipe = await tx.recipe.findUnique({
      where: { id: recipeId },
    });
    if (!existingRecipe) {
      throw new RecipeTransactionError('Công thức không tồn tại hoặc đã bị xóa.', ErrorCodes.RECIPE_NOT_FOUND, 404);
    }

    // 2. Kiểm tra quyền sở hữu (nếu có truyền authorId yêu cầu)
    if (data.authorId && existingRecipe.authorId !== data.authorId) {
      throw new RecipeTransactionError('Bạn không có quyền chỉnh sửa công thức của người khác.', ErrorCodes.NOT_RECIPE_OWNER, 403);
    }

    // 3. Kiểm tra danh mục mới (nếu có cập nhật)
    if (data.categoryId !== undefined) {
      const category = await tx.category.findUnique({
        where: { id: data.categoryId },
      });
      if (!category) {
        throw new RecipeTransactionError('Danh mục món ăn được chọn không hợp lệ.', ErrorCodes.CATEGORY_NOT_FOUND, 404);
      }
    }

    // 4. Kiểm tra nguyên liệu mới (nếu có cập nhật)
    if (data.ingredients !== undefined) {
      const ingredientIds = data.ingredients.map((i) => i.ingredientId);
      const existingIngredients = await tx.ingredient.findMany({
        where: { id: { in: ingredientIds } },
        select: { id: true },
      });
      if (existingIngredients.length !== ingredientIds.length) {
        throw new RecipeTransactionError('Một hoặc nhiều nguyên liệu không tồn tại trong từ điển chuẩn.', ErrorCodes.INGREDIENT_NOT_FOUND, 404);
      }
    }

    // 5. Kiểm tra tags mới (nếu có cập nhật)
    if (data.dietaryTagIds !== undefined && data.dietaryTagIds.length > 0) {
      const existingTags = await tx.dietaryRegime.findMany({
        where: { id: { in: data.dietaryTagIds } },
        select: { id: true },
      });
      if (existingTags.length !== data.dietaryTagIds.length) {
        throw new RecipeTransactionError('Một hoặc nhiều chế độ ăn kiêng không tồn tại.', ErrorCodes.DIETARY_REGIME_NOT_FOUND, 404);
      }
    }

    // 6. Cập nhật bảng chính Recipe
    const recipeUpdatePayload: Record<string, any> = {};
    if (data.title !== undefined) recipeUpdatePayload.title = data.title.trim();
    if (data.description !== undefined) recipeUpdatePayload.description = data.description ? data.description.trim() : null;
    if (data.thumbnailUrl !== undefined) recipeUpdatePayload.thumbnailUrl = data.thumbnailUrl;
    if (data.cookingTime !== undefined) recipeUpdatePayload.cookingTime = data.cookingTime;
    if (data.servings !== undefined) recipeUpdatePayload.servings = data.servings;
    if (data.categoryId !== undefined) recipeUpdatePayload.categoryId = data.categoryId;

    if (Object.keys(recipeUpdatePayload).length > 0) {
      await tx.recipe.update({
        where: { id: recipeId },
        data: recipeUpdatePayload,
      });
    }

    // 7. Đồng bộ lại các bước (steps) nếu có truyền danh sách mới
    if (data.steps !== undefined) {
      await tx.recipeStep.deleteMany({
        where: { recipeId },
      });

      const newStepsData = data.steps.map((step) => ({
        recipeId,
        stepNumber: step.stepNumber,
        instruction: step.instruction.trim(),
        imageUrl: step.imageUrl || null,
        timerSeconds: step.timerSeconds ?? null,
      }));
      await tx.recipeStep.createMany({
        data: newStepsData,
      });
    }

    // 8. Đồng bộ lại danh sách nguyên liệu (ingredients) nếu có truyền danh sách mới
    if (data.ingredients !== undefined) {
      await tx.recipeIngredient.deleteMany({
        where: { recipeId },
      });

      const newIngredientsData = data.ingredients.map((item) => ({
        recipeId,
        ingredientId: item.ingredientId,
        quantity: Number(item.quantity),
        note: item.note ? item.note.trim() : null,
      }));
      await tx.recipeIngredient.createMany({
        data: newIngredientsData,
      });
    }

    // 9. Đồng bộ lại danh sách thẻ chế độ ăn kiêng (dietaryTagIds) nếu có truyền
    if (data.dietaryTagIds !== undefined) {
      await tx.recipeDietaryTag.deleteMany({
        where: { recipeId },
      });

      if (data.dietaryTagIds.length > 0) {
        const newTagsData = data.dietaryTagIds.map((regimeId) => ({
          recipeId,
          dietaryRegimeId: regimeId,
        }));
        await tx.recipeDietaryTag.createMany({
          data: newTagsData,
        });
      }
    }

    // 10. Trả về công thức đầy đủ sau khi cập nhật
    return await tx.recipe.findUnique({
      where: { id: recipeId },
      include: {
        author: {
          select: {
            id: true,
            nickname: true,
            fullName: true,
            avatarUrl: true,
          },
        },
        category: true,
        steps: {
          orderBy: { stepNumber: 'asc' },
        },
        ingredients: {
          include: {
            ingredient: true,
          },
        },
        dietaryTags: {
          include: {
            dietaryRegime: true,
          },
        },
      },
    });
  });
}

