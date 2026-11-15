import { PrismaClient } from '@prisma/client';
import { prisma as defaultPrisma } from '../../config/prisma';

export interface MatchedIngredient {
  ingredientId: number;
  name: string;
  requiredQuantity: number;
  availableQuantity: number;
  isEnoughQuantity: boolean;
  unit: string;
}

export interface MissingIngredient {
  ingredientId: number;
  name: string;
  missingQuantity: number;
  unit: string;
}

export interface ScoredRecipe {
  id: string;
  title: string;
  thumbnailUrl: string;
  cookingTime: number;
  servings: number;
  averageRating: number;
  category: {
    id: number;
    name: string;
    slug: string;
  };
  author: {
    id: string;
    nickname: string | null;
    fullName: string;
    avatarUrl: string | null;
  };
  matchPercentage: number;
  matchedCount: number;
  totalIngredients: number;
  matchedIngredients: MatchedIngredient[];
  missingIngredients: MissingIngredient[];
}

export interface MatchingResult {
  message: string;
  data: ScoredRecipe[];
}

/**
 * Thuật toán Tủ lạnh thông minh (Task FSA-23)
 * Đối chiếu nguyên liệu trong tủ lạnh với công thức, lọc bỏ dị ứng, tính % phù hợp và xếp hạng
 */
export async function matchFridgeRecipes(
  userId: string,
  prismaClient: PrismaClient = defaultPrisma as any,
): Promise<MatchingResult> {
  // 1. Lấy nguyên liệu trong tủ lạnh và danh sách dị ứng của người dùng
  const [fridgeItems, userAllergies] = await Promise.all([
    prismaClient.userFridgeItem.findMany({
      where: { userId },
    }),
    prismaClient.userAllergy.findMany({
      where: { userId },
    }),
  ]);

  if (fridgeItems.length === 0) {
    return {
      message: 'Tủ lạnh đang trống. Hãy thêm nguyên liệu để nhận gợi ý món ăn.',
      data: [],
    };
  }

  // 2. Lập bản đồ tra cứu khối lượng nguyên liệu trong tủ: ingredientId -> quantity
  const fridgeMap = new Map<number, number>(
    fridgeItems.map((item) => [item.ingredientId, item.quantity]),
  );
  const fridgeIngredientIds = Array.from(fridgeMap.keys());

  // 3. Danh sách ID nguyên liệu gây dị ứng của người dùng
  const allergyIngredientIds = userAllergies.map((a) => a.ingredientId);

  // 4. Tìm các công thức có ít nhất 1 nguyên liệu trong tủ lạnh
  // và TUYỆT ĐỐI KHÔNG chứa bất kỳ nguyên liệu gây dị ứng nào
  const candidateRecipes = await prismaClient.recipe.findMany({
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

  // 5. Tính toán tỷ lệ khớp (%) và bóc tách danh sách nguyên liệu đủ / thiếu
  const scoredRecipes: ScoredRecipe[] = candidateRecipes.map((recipe: any) => {
    const totalIngredients = recipe.ingredients.length;
    const matchedIngredients: MatchedIngredient[] = [];
    const missingIngredients: MissingIngredient[] = [];

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
        ? Math.round((matchedIngredients.length / totalIngredients) * 100)
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

  // 6. Sắp xếp kết quả theo thứ tự ưu tiên:
  // - 1. Tỷ lệ nguyên liệu khớp giảm dần (Match % desc)
  // - 2. Số nguyên liệu còn thiếu tăng dần (Missing count asc)
  // - 3. Điểm đánh giá trung bình giảm dần (Rating desc)
  scoredRecipes.sort((a, b) => {
    if (b.matchPercentage !== a.matchPercentage) {
      return b.matchPercentage - a.matchPercentage;
    }

    if (a.missingIngredients.length !== b.missingIngredients.length) {
      return a.missingIngredients.length - b.missingIngredients.length;
    }

    return b.averageRating - a.averageRating;
  });

  return {
    message: 'Gợi ý công thức dựa trên tủ lạnh thành công.',
    data: scoredRecipes,
  };
}

