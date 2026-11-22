import { prismaMock } from './setup';
import { filterRecipesQuery } from '../src/modules/recipes/recipe.filter';

describe('Task 2: Query Bộ lọc đa tầng kết hợp loại trừ dị ứng (Recipe Filter Query)', () => {
  const sampleRecipes = [
    {
      id: 'recipe-1',
      title: 'Bò Xào Húng Quế',
      description: 'Món ăn ít carb tốt cho sức khỏe',
      thumbnailUrl: 'https://example.com/bo.jpg',
      servings: 2,
      cookingTime: 25,
      averageRating: 4.8,
      author: {
        id: 'user-1',
        nickname: 'chef_nhat',
        fullName: 'Minh Nhất',
        avatarUrl: null,
      },
      category: {
        id: 1,
        name: 'Bữa chính',
        slug: 'bua-chinh',
        iconUrl: null,
      },
      dietaryTags: [
        {
          dietaryRegime: {
            id: 1,
            name: 'Eat Clean',
            slug: 'eat-clean',
          },
        },
      ],
      ingredients: [
        { id: 'ri-1', ingredientId: 1 }, // Thịt bò
        { id: 'ri-2', ingredientId: 10 }, // Húng quế
      ],
      _count: {
        reviews: 5,
        cooksnaps: 2,
        favoritedBy: 12,
      },
      createdAt: new Date('2026-01-01'),
      updatedAt: new Date('2026-01-01'),
    },
    {
      id: 'recipe-2',
      title: 'Salad Tôm Trứng',
      description: 'Món ăn thanh đạm giải ngấy',
      thumbnailUrl: 'https://example.com/salad.jpg',
      servings: 1,
      cookingTime: 15,
      averageRating: 4.5,
      author: {
        id: 'user-2',
        nickname: 'chef_hoa',
        fullName: 'Thị Hoa',
        avatarUrl: null,
      },
      category: {
        id: 1,
        name: 'Bữa chính',
        slug: 'bua-chinh',
        iconUrl: null,
      },
      dietaryTags: [
        {
          dietaryRegime: {
            id: 2,
            name: 'Keto',
            slug: 'keto',
          },
        },
      ],
      ingredients: [
        { id: 'ri-3', ingredientId: 7 }, // Trứng gà (Dị ứng phổ biến)
        { id: 'ri-4', ingredientId: 10 }, // Tôm sú (Dị ứng hải sản)
      ],
      _count: {
        reviews: 3,
        cooksnaps: 1,
        favoritedBy: 8,
      },
      createdAt: new Date('2026-01-02'),
      updatedAt: new Date('2026-01-02'),
    },
  ];

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('1. Lọc theo Danh mục (categoryId)', async () => {
    prismaMock.recipe.count.mockResolvedValueOnce(1);
    prismaMock.recipe.findMany.mockResolvedValueOnce([sampleRecipes[0]]);

    const result = await filterRecipesQuery(
      { categoryId: 1 },
      prismaMock as any,
    );

    expect(prismaMock.recipe.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({ categoryId: 1 }),
      }),
    );
    expect(result.total).toBe(1);
    expect(result.data[0].id).toBe('recipe-1');
  });

  it('2. Lọc theo Chế độ ăn kiêng (dietaryRegimeId)', async () => {
    prismaMock.recipe.count.mockResolvedValueOnce(1);
    prismaMock.recipe.findMany.mockResolvedValueOnce([sampleRecipes[0]]);

    const result = await filterRecipesQuery(
      { dietaryRegimeId: 1 },
      prismaMock as any,
    );

    expect(prismaMock.recipe.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({
          dietaryTags: { some: { dietaryRegimeId: 1 } },
        }),
      }),
    );
    expect(result.data.length).toBe(1);
  });

  it('3. Lọc theo Thời gian nấu tối đa (maxCookingTime)', async () => {
    prismaMock.recipe.count.mockResolvedValueOnce(1);
    prismaMock.recipe.findMany.mockResolvedValueOnce([sampleRecipes[1]]);

    const result = await filterRecipesQuery(
      { maxCookingTime: 20 },
      prismaMock as any,
    );

    expect(prismaMock.recipe.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({
          cookingTime: { lte: 20 },
        }),
      }),
    );
    expect(result.appliedFilters.maxCookingTime).toBe(20);
  });

  it('4. Lọc kết hợp đa tầng (Category + Dietary + Max Cooking Time + Search)', async () => {
    prismaMock.recipe.count.mockResolvedValueOnce(1);
    prismaMock.recipe.findMany.mockResolvedValueOnce([sampleRecipes[0]]);

    const result = await filterRecipesQuery(
      {
        categoryId: 1,
        dietaryRegimeId: 1,
        maxCookingTime: 30,
        search: 'Bò',
      },
      prismaMock as any,
    );

    expect(prismaMock.recipe.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({
          categoryId: 1,
          dietaryTags: { some: { dietaryRegimeId: 1 } },
          cookingTime: { lte: 30 },
          OR: [
            { title: { contains: 'Bò', mode: 'insensitive' } },
            { description: { contains: 'Bò', mode: 'insensitive' } },
          ],
        }),
      }),
    );
    expect(result.data[0].title).toBe('Bò Xào Húng Quế');
  });

  it('5. TỰ ĐỘNG LOẠI TRỪ DỊ ỨNG: Người dùng dị ứng tôm và trứng -> Loại bỏ công thức chứa tôm trứng', async () => {
    const userId = 'user-uuid-1';
    // Người dùng dị ứng nguyên liệu ID 7 (trứng gà) và ID 10 (tôm sú)
    prismaMock.userAllergy.findMany.mockResolvedValueOnce([
      { ingredientId: 7 },
      { ingredientId: 10 },
    ]);

    prismaMock.recipe.count.mockResolvedValueOnce(1);
    prismaMock.recipe.findMany.mockResolvedValueOnce([sampleRecipes[0]]);
    prismaMock.favoriteRecipe.findMany.mockResolvedValueOnce([]);

    const result = await filterRecipesQuery(
      { userId, excludeAllergies: true },
      prismaMock as any,
    );

    // Kiểm tra truy vấn Prisma phải có điều kiện ingredients: { none: { ingredientId: { in: [7, 10] } } }
    expect(prismaMock.userAllergy.findMany).toHaveBeenCalledWith({
      where: { userId },
      select: { ingredientId: true },
    });

    expect(prismaMock.recipe.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({
          ingredients: {
            none: {
              ingredientId: { in: [7, 10] },
            },
          },
        }),
      }),
    );

    expect(result.appliedFilters.excludeAllergies).toBe(true);
    expect(result.appliedFilters.excludedAllergenCount).toBe(2);
    expect(result.data.length).toBe(1);
    expect(result.data[0].id).toBe('recipe-1');
  });

  it('6. Khi tắt excludeAllergies = false -> Không áp dụng điều kiện loại trừ', async () => {
    const userId = 'user-uuid-1';
    prismaMock.recipe.count.mockResolvedValueOnce(2);
    prismaMock.recipe.findMany.mockResolvedValueOnce(sampleRecipes);
    prismaMock.favoriteRecipe.findMany.mockResolvedValueOnce([]);

    await filterRecipesQuery(
      { userId, excludeAllergies: false },
      prismaMock as any,
    );

    expect(prismaMock.userAllergy.findMany).not.toHaveBeenCalled();
    expect(prismaMock.recipe.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.not.objectContaining({
          ingredients: expect.anything(),
        }),
      }),
    );
  });

  it('7. Sắp xếp đúng theo tiêu chí rating hoặc cookingTime', async () => {
    prismaMock.recipe.count.mockResolvedValueOnce(2);
    prismaMock.recipe.findMany.mockResolvedValueOnce(sampleRecipes);

    await filterRecipesQuery(
      { sortBy: 'rating', sortDirection: 'desc' },
      prismaMock as any,
    );

    expect(prismaMock.recipe.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        orderBy: { averageRating: 'desc' },
      }),
    );
  });

  it('8. Đánh dấu isFavorited = true nếu món đã được người dùng thả tim', async () => {
    const userId = 'user-uuid-1';
    prismaMock.userAllergy.findMany.mockResolvedValueOnce([]);
    prismaMock.recipe.count.mockResolvedValueOnce(1);
    prismaMock.recipe.findMany.mockResolvedValueOnce([sampleRecipes[0]]);
    // Giả lập người dùng đã thả tim món recipe-1
    prismaMock.favoriteRecipe.findMany.mockResolvedValueOnce([{ recipeId: 'recipe-1' }]);

    const result = await filterRecipesQuery(
      { userId },
      prismaMock as any,
    );

    expect(result.data[0].isFavorited).toBe(true);
  });

  it('9. Lọc với mảng dietaryIds và excludedIngredientIds tùy chỉnh (theo tài liệu bảng saved_filters)', async () => {
    prismaMock.recipe.count.mockResolvedValueOnce(1);
    prismaMock.recipe.findMany.mockResolvedValueOnce([sampleRecipes[0]]);

    const result = await filterRecipesQuery(
      {
        dietaryIds: [1, 2],
        excludedIngredientIds: [7, 10],
      },
      prismaMock as any,
    );

    expect(prismaMock.recipe.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({
          dietaryTags: {
            some: { dietaryRegimeId: { in: [1, 2] } },
          },
          ingredients: {
            none: { ingredientId: { in: [7, 10] } },
          },
        }),
      }),
    );
    expect(result.appliedFilters.dietaryIds).toEqual([1, 2]);
    expect(result.appliedFilters.totalExcludedIngredientCount).toBe(2);
  });
});
