import { prismaMock } from './setup';
import {
  toggleFavoriteRecipe,
  checkFavoriteStatus,
  getUserFavoriteRecipes,
} from '../src/modules/recipes/recipe.favorite';
import { AppError } from '../src/common/errors';

describe('Task 4: Query Thả tim / Lưu công thức yêu thích (Recipe Favorites)', () => {
  const userId = 'user-uuid-1';
  const recipeId = 'rec-uuid-100';

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('toggleFavoriteRecipe', () => {
    it('1. Báo lỗi 404 RECIPE_NOT_FOUND nếu công thức không tồn tại', async () => {
      prismaMock.recipe.findUnique.mockResolvedValueOnce(null);

      await expect(
        toggleFavoriteRecipe(userId, 'non-existent-id', prismaMock as any),
      ).rejects.toThrow(AppError);

      expect(prismaMock.recipe.findUnique).toHaveBeenCalledWith({
        where: { id: 'non-existent-id' },
        select: { id: true, title: true },
      });
    });

    it('2. Thả tim thành công khi chưa từng thả tim -> Tạo bản ghi favorite_recipes và trả về isFavorited = true', async () => {
      // Công thức tồn tại
      prismaMock.recipe.findUnique.mockResolvedValueOnce({
        id: recipeId,
        title: 'Bò Xào Húng Quế',
      });
      // Chưa từng thả tim
      prismaMock.favoriteRecipe.findUnique.mockResolvedValueOnce(null);
      // Mock tạo mới
      prismaMock.favoriteRecipe.create.mockResolvedValueOnce({
        userId,
        recipeId,
        createdAt: new Date(),
      });
      // Mock đếm số tim
      prismaMock.favoriteRecipe.count.mockResolvedValueOnce(1);

      const result = await toggleFavoriteRecipe(userId, recipeId, prismaMock as any);

      expect(prismaMock.favoriteRecipe.create).toHaveBeenCalledWith({
        data: { userId, recipeId },
      });
      expect(result.isFavorited).toBe(true);
      expect(result.favoritesCount).toBe(1);
      expect(result.message).toContain('Đã lưu công thức vào danh sách yêu thích');
    });

    it('3. Hủy thả tim khi đã từng thích trước đó -> Xóa bản ghi favorite_recipes và trả về isFavorited = false', async () => {
      // Công thức tồn tại
      prismaMock.recipe.findUnique.mockResolvedValueOnce({
        id: recipeId,
        title: 'Bò Xào Húng Quế',
      });
      // Đã từng thả tim
      prismaMock.favoriteRecipe.findUnique.mockResolvedValueOnce({
        userId,
        recipeId,
        createdAt: new Date(),
      });
      // Mock xóa bản ghi
      prismaMock.favoriteRecipe.delete.mockResolvedValueOnce({
        userId,
        recipeId,
      });
      // Mock đếm lại số tim
      prismaMock.favoriteRecipe.count.mockResolvedValueOnce(0);

      const result = await toggleFavoriteRecipe(userId, recipeId, prismaMock as any);

      expect(prismaMock.favoriteRecipe.delete).toHaveBeenCalledWith({
        where: {
          userId_recipeId: { userId, recipeId },
        },
      });
      expect(result.isFavorited).toBe(false);
      expect(result.favoritesCount).toBe(0);
      expect(result.message).toContain('Đã hủy lưu công thức khỏi danh sách yêu thích');
    });
  });

  describe('checkFavoriteStatus', () => {
    it('4. Trả về isFavorited = true khi người dùng đã thả tim', async () => {
      prismaMock.favoriteRecipe.findUnique.mockResolvedValueOnce({
        userId,
        recipeId,
      });

      const result = await checkFavoriteStatus(userId, recipeId, prismaMock as any);

      expect(prismaMock.favoriteRecipe.findUnique).toHaveBeenCalledWith({
        where: {
          userId_recipeId: { userId, recipeId },
        },
      });
      expect(result.isFavorited).toBe(true);
    });

    it('5. Trả về isFavorited = false khi người dùng chưa thả tim', async () => {
      prismaMock.favoriteRecipe.findUnique.mockResolvedValueOnce(null);

      const result = await checkFavoriteStatus(userId, recipeId, prismaMock as any);

      expect(result.isFavorited).toBe(false);
    });
  });

  describe('getUserFavoriteRecipes', () => {
    it('6. Lấy danh sách công thức yêu thích thành công có phân trang', async () => {
      const mockFavorites = [
        {
          userId,
          recipeId: 'rec-1',
          createdAt: new Date('2026-02-01'),
          recipe: {
            id: 'rec-1',
            title: 'Bò Xào Húng Quế',
            description: 'Ngon tuyệt',
            thumbnailUrl: 'https://example.com/bo.jpg',
            servings: 2,
            cookingTime: 20,
            averageRating: 4.8,
            author: { id: 'author-1', nickname: 'chef_nhat', fullName: 'Nhất', avatarUrl: null },
            category: { id: 1, name: 'Bữa chính', slug: 'bua-chinh' },
            dietaryTags: [],
            _count: { reviews: 2, cooksnaps: 1, favoritedBy: 10 },
          },
        },
      ];

      prismaMock.favoriteRecipe.count.mockResolvedValueOnce(1);
      prismaMock.favoriteRecipe.findMany.mockResolvedValueOnce(mockFavorites);

      const result = await getUserFavoriteRecipes(userId, { page: 1, limit: 10 }, prismaMock as any);

      expect(result.total).toBe(1);
      expect(result.data.length).toBe(1);
      expect(result.data[0].id).toBe('rec-1');
      expect(result.data[0].title).toBe('Bò Xào Húng Quế');
    });
  });
});
