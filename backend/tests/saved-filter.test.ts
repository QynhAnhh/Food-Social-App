import { prismaMock } from './setup';
import {
  createSavedFilter,
  getUserSavedFilters,
  deleteSavedFilter,
} from '../src/modules/search/saved-filter.service';
import { AppError } from '../src/common/errors';

describe('Task 1 & 2: Quản lý Bộ lọc cá nhân (Saved Filters - Bảng số 4 trong tài liệu)', () => {
  const userId = 'user-uuid-1';

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('createSavedFilter', () => {
    it('1. Báo lỗi nếu tên bộ lọc rỗng', async () => {
      await expect(
        createSavedFilter(userId, { filterName: '' }, prismaMock as any),
      ).rejects.toThrow(AppError);
    });

    it('2. Lưu thành công bộ lọc với mảng dietaryIds, excludedIngredientIds và cờ isDefault', async () => {
      prismaMock.category.findUnique.mockResolvedValueOnce({ id: 1, name: 'Bữa chính' });
      prismaMock.dietaryRegime.findMany.mockResolvedValueOnce([{ id: 1 }, { id: 2 }]);
      prismaMock.savedFilter.updateMany.mockResolvedValueOnce({ count: 1 });

      prismaMock.savedFilter.create.mockResolvedValueOnce({
        id: 'filter-1',
        userId,
        filterName: 'Bữa tối Eat Clean',
        categoryId: 1,
        dietaryIds: [1, 2],
        excludedIngredientIds: [7, 10],
        maxCookingTime: 30,
        isDefault: true,
        category: { id: 1, name: 'Bữa chính', slug: 'bua-chinh' },
        createdAt: new Date(),
      });

      const result = await createSavedFilter(
        userId,
        {
          filterName: 'Bữa tối Eat Clean',
          categoryId: 1,
          dietaryIds: [1, 2],
          excludedIngredientIds: [7, 10],
          maxCookingTime: 30,
          isDefault: true,
        },
        prismaMock as any,
      );

      expect(prismaMock.savedFilter.updateMany).toHaveBeenCalledWith({
        where: { userId, isDefault: true },
        data: { isDefault: false },
      });

      expect(prismaMock.savedFilter.create).toHaveBeenCalledWith({
        data: {
          userId,
          filterName: 'Bữa tối Eat Clean',
          categoryId: 1,
          dietaryIds: [1, 2],
          excludedIngredientIds: [7, 10],
          maxCookingTime: 30,
          isDefault: true,
        },
        include: {
          category: { select: { id: true, name: true, slug: true } },
        },
      });

      expect(result.id).toBe('filter-1');
      expect(result.filterName).toBe('Bữa tối Eat Clean');
      expect(result.isDefault).toBe(true);
      expect(result.dietaryIds).toEqual([1, 2]);
      expect(result.excludedIngredientIds).toEqual([7, 10]);
    });
  });

  describe('getUserSavedFilters', () => {
    it('3. Lấy danh sách bộ lọc đã lưu của người dùng', async () => {
      prismaMock.savedFilter.findMany.mockResolvedValueOnce([
        {
          id: 'filter-1',
          userId,
          filterName: 'Bữa tối Eat Clean',
          categoryId: 1,
          dietaryIds: [1],
          excludedIngredientIds: [],
          maxCookingTime: 20,
          isDefault: true,
          category: { id: 1, name: 'Bữa chính', slug: 'bua-chinh' },
          createdAt: new Date(),
        },
      ]);

      const result = await getUserSavedFilters(userId, prismaMock as any);

      expect(prismaMock.savedFilter.findMany).toHaveBeenCalledWith({
        where: { userId },
        orderBy: [
          { isDefault: 'desc' },
          { createdAt: 'desc' },
        ],
        include: {
          category: { select: { id: true, name: true, slug: true } },
        },
      });
      expect(result.length).toBe(1);
      expect(result[0].filterName).toBe('Bữa tối Eat Clean');
    });
  });

  describe('deleteSavedFilter', () => {
    it('4. Báo lỗi 404 SAVED_FILTER_NOT_FOUND nếu bộ lọc không tồn tại hoặc không thuộc người dùng', async () => {
      prismaMock.savedFilter.findFirst.mockResolvedValueOnce(null);

      await expect(
        deleteSavedFilter(userId, 'non-existent-filter', prismaMock as any),
      ).rejects.toThrow(AppError);
    });

    it('5. Xóa bộ lọc thành công', async () => {
      prismaMock.savedFilter.findFirst.mockResolvedValueOnce({
        id: 'filter-1',
        userId,
      });
      prismaMock.savedFilter.delete.mockResolvedValueOnce({});

      const result = await deleteSavedFilter(userId, 'filter-1', prismaMock as any);

      expect(prismaMock.savedFilter.delete).toHaveBeenCalledWith({
        where: { id: 'filter-1' },
      });
      expect(result.message).toContain('Đã xóa bộ lọc thành công');
    });
  });
});
