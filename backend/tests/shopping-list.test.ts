import { prismaMock } from './setup';
import {
  addRecipeToShoppingList,
  addCustomIngredientToShoppingList,
  getShoppingList,
  toggleShoppingItemBought,
  updateShoppingItemQuantity,
  removeShoppingListItem,
  removeRecipeFromShoppingList,
  clearShoppingList,
} from '../src/modules/shopping-list/shopping-list.service';
import { AppError } from '../src/common/errors';

describe('Task 3: Logic Cộng dồn định lượng Giỏ đi chợ & Truy vết nguồn (Bảng số 12 & 13 trong tài liệu)', () => {
  const userId = 'user-uuid-1';
  const recipeId = 'rec-uuid-1';

  const mockRecipeWithIngredients = {
    id: recipeId,
    title: 'Bò Xào Húng Quế',
    servings: 2,
    ingredients: [
      {
        id: 'ri-1',
        recipeId,
        ingredientId: 1, // Thịt bò thăn
        quantity: 300,
        ingredient: { id: 1, name: 'Thịt bò thăn', standardUnit: 'gram' },
      },
      {
        id: 'ri-2',
        recipeId,
        ingredientId: 20, // Húng quế
        quantity: 50,
        ingredient: { id: 20, name: 'Húng quế', standardUnit: 'gram' },
      },
    ],
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('addRecipeToShoppingList', () => {
    it('1. Báo lỗi 404 RECIPE_NOT_FOUND nếu công thức không tồn tại', async () => {
      prismaMock.recipe.findUnique.mockResolvedValueOnce(null);

      await expect(
        addRecipeToShoppingList({ userId, recipeId: 'wrong-id' }, prismaMock as any),
      ).rejects.toThrow(AppError);
    });

    it('2. Báo lỗi 400 nếu công thức không có nguyên liệu nào', async () => {
      prismaMock.recipe.findUnique.mockResolvedValueOnce({
        id: recipeId,
        title: 'Món nước lọc',
        ingredients: [],
      });

      await expect(
        addRecipeToShoppingList({ userId, recipeId }, prismaMock as any),
      ).rejects.toThrow(AppError);
    });

    it('3. Thêm thành công khi giỏ rỗng -> Tạo mới shopping_list_items và ghi nhận nguồn shopping_list_recipe_sources', async () => {
      prismaMock.recipe.findUnique.mockResolvedValueOnce(mockRecipeWithIngredients);

      // Cả 2 nguyên liệu đều chưa có trong giỏ
      prismaMock.shoppingListItem.findUnique.mockResolvedValue(null);

      // Mock create cho item
      prismaMock.shoppingListItem.create
        .mockResolvedValueOnce({ id: 'item-uuid-1', totalQuantity: 300 })
        .mockResolvedValueOnce({ id: 'item-uuid-2', totalQuantity: 50 });

      // Mock create cho recipe sources
      prismaMock.shoppingListRecipeSource.create.mockResolvedValue({});

      const result = await addRecipeToShoppingList({ userId, recipeId }, prismaMock as any);

      expect(prismaMock.$transaction).toHaveBeenCalledTimes(1);
      // Tạo 2 mục nguyên liệu mới trong giỏ
      expect(prismaMock.shoppingListItem.create).toHaveBeenCalledTimes(2);
      expect(prismaMock.shoppingListItem.create).toHaveBeenNthCalledWith(1, {
        data: {
          userId,
          ingredientId: 1,
          totalQuantity: 300,
          isPurchased: false,
        },
      });
      // Ghi nhận nguồn 2 nguyên liệu đến từ recipe-1 theo đúng bảng số 13 (shopping_item_id, recipe_id, added_quantity)
      expect(prismaMock.shoppingListRecipeSource.create).toHaveBeenCalledTimes(2);
      expect(prismaMock.shoppingListRecipeSource.create).toHaveBeenNthCalledWith(1, {
        data: {
          shoppingItemId: 'item-uuid-1',
          recipeId,
          addedQuantity: 300,
        },
      });

      expect(result.addedIngredientsCount).toBe(2);
      expect(result.recipeTitle).toBe('Bò Xào Húng Quế');
    });

    it('4. CỘNG DỒN ĐỊNH LƯỢNG: Nguyên liệu đã có sẵn trong giỏ -> Cộng dồn total_quantity và cập nhật added_quantity', async () => {
      prismaMock.recipe.findUnique.mockResolvedValueOnce(mockRecipeWithIngredients);

      // Giả sử nguyên liệu 1 (Thịt bò) đã có 200g từ món khác trước đó
      prismaMock.shoppingListItem.findUnique
        .mockResolvedValueOnce({
          id: 'item-uuid-1',
          userId,
          ingredientId: 1,
          totalQuantity: 200,
          isPurchased: true,
        })
        // Nguyên liệu 2 (Húng quế) chưa có
        .mockResolvedValueOnce(null);

      // Nguồn gốc món này cho thịt bò chưa từng có trước đó
      prismaMock.shoppingListRecipeSource.findUnique.mockResolvedValueOnce(null);

      // Mock update thịt bò (200 + 300 = 500)
      prismaMock.shoppingListItem.update.mockResolvedValueOnce({
        id: 'item-uuid-1',
        totalQuantity: 500,
      });

      // Mock create húng quế mới
      prismaMock.shoppingListItem.create.mockResolvedValueOnce({
        id: 'item-uuid-2',
        totalQuantity: 50,
      });

      await addRecipeToShoppingList({ userId, recipeId }, prismaMock as any);

      // Kiểm tra gọi update cộng dồn định lượng: 200 + 300 = 500
      expect(prismaMock.shoppingListItem.update).toHaveBeenCalledWith({
        where: { id: 'item-uuid-1' },
        data: {
          totalQuantity: 500,
          isPurchased: false,
        },
      });

      // Tạo nguồn gốc mới cho món bò xào đối với thịt bò
      expect(prismaMock.shoppingListRecipeSource.create).toHaveBeenCalledWith({
        data: {
          shoppingItemId: 'item-uuid-1',
          recipeId,
          addedQuantity: 300,
        },
      });
    });

    it('5. Nhân hệ số khẩu phần (servingsMultiplier = 2) -> Định lượng tự động nhân đôi', async () => {
      prismaMock.recipe.findUnique.mockResolvedValueOnce(mockRecipeWithIngredients);
      prismaMock.shoppingListItem.findUnique.mockResolvedValue(null);
      prismaMock.shoppingListItem.create
        .mockResolvedValueOnce({ id: 'item-uuid-1', totalQuantity: 600 })
        .mockResolvedValueOnce({ id: 'item-uuid-2', totalQuantity: 100 });

      await addRecipeToShoppingList(
        { userId, recipeId, servingsMultiplier: 2 },
        prismaMock as any,
      );

      // 300g * 2 = 600g
      expect(prismaMock.shoppingListItem.create).toHaveBeenNthCalledWith(1, {
        data: {
          userId,
          ingredientId: 1,
          totalQuantity: 600,
          isPurchased: false,
        },
      });
      // 50g * 2 = 100g
      expect(prismaMock.shoppingListItem.create).toHaveBeenNthCalledWith(2, {
        data: {
          userId,
          ingredientId: 20,
          totalQuantity: 100,
          isPurchased: false,
        },
      });
    });
  });

  describe('addCustomIngredientToShoppingList', () => {
    it('6. Thêm nguyên liệu tùy chỉnh thành công', async () => {
      prismaMock.ingredient.findUnique.mockResolvedValueOnce({
        id: 1,
        name: 'Thịt bò thăn',
        standardUnit: 'gram',
      });
      prismaMock.shoppingListItem.findUnique.mockResolvedValueOnce(null);
      prismaMock.shoppingListItem.create.mockResolvedValueOnce({
        id: 'item-uuid-custom',
        userId,
        ingredientId: 1,
        totalQuantity: 250,
        isPurchased: false,
      });

      const result = await addCustomIngredientToShoppingList(
        userId,
        1,
        250,
        prismaMock as any,
      );

      expect(result.message).toContain('Đã thêm 250 gram Thịt bò thăn vào giỏ đi chợ');
    });
  });

  describe('getShoppingList', () => {
    it('7. Lấy danh sách đi chợ kèm truy vết nguồn gốc món ăn (Recipe Sources Trace)', async () => {
      const mockItems = [
        {
          id: 'item-1',
          ingredientId: 1,
          totalQuantity: 500,
          isPurchased: false,
          ingredient: {
            id: 1,
            name: 'Thịt bò thăn',
            standardUnit: 'gram',
            imageUrl: null,
          },
          recipeSources: [
            {
              addedQuantity: 300,
              recipe: { id: 'rec-1', title: 'Bò Xào Húng Quế', thumbnailUrl: 'bo.jpg' },
            },
            {
              addedQuantity: 200,
              recipe: { id: 'rec-2', title: 'Phở Bò', thumbnailUrl: 'pho.jpg' },
            },
          ],
          updatedAt: new Date(),
        },
      ];

      prismaMock.shoppingListItem.findMany.mockResolvedValueOnce(mockItems);

      const result = await getShoppingList(userId, prismaMock as any);

      expect(result.totalItems).toBe(1);
      expect(result.unpurchasedItemsCount).toBe(1);
      expect(result.purchasedItemsCount).toBe(0);
      expect(result.items[0].totalQuantity).toBe(500);
      expect(result.items[0].isPurchased).toBe(false);
      // Kiểm tra truy vết nguồn gốc: 2 món ăn đóng góp
      expect(result.items[0].sourcesCount).toBe(2);
      expect(result.items[0].sources[0].recipeTitle).toBe('Bò Xào Húng Quế');
      expect(result.items[0].sources[0].addedQuantity).toBe(300);
      expect(result.items[0].sources[1].recipeTitle).toBe('Phở Bò');
      expect(result.items[0].sources[1].addedQuantity).toBe(200);
    });
  });

  describe('toggleShoppingItemBought & updateShoppingItemQuantity', () => {
    it('8. Đánh dấu đã mua / chưa mua nguyên liệu (isPurchased)', async () => {
      prismaMock.shoppingListItem.findFirst.mockResolvedValueOnce({
        id: 'item-1',
        userId,
        isPurchased: false,
      });
      prismaMock.shoppingListItem.update.mockResolvedValueOnce({
        id: 'item-1',
        isPurchased: true,
      });

      const result = await toggleShoppingItemBought(userId, 'item-1', true, prismaMock as any);
      expect(result.isPurchased).toBe(true);
    });

    it('9. Cập nhật định lượng thủ công cho 1 nguyên liệu', async () => {
      prismaMock.shoppingListItem.findFirst.mockResolvedValueOnce({
        id: 'item-1',
        userId,
        totalQuantity: 300,
      });
      prismaMock.shoppingListItem.update.mockResolvedValueOnce({
        id: 'item-1',
        totalQuantity: 400,
      });

      const result = await updateShoppingItemQuantity(userId, 'item-1', 400, prismaMock as any);
      expect(result.totalQuantity).toBe(400);
    });

    it('10. Xóa 1 nguyên liệu cụ thể khỏi giỏ đi chợ', async () => {
      prismaMock.shoppingListItem.findFirst.mockResolvedValueOnce({
        id: 'item-1',
        userId,
      });
      prismaMock.shoppingListItem.delete.mockResolvedValueOnce({});

      const result = await removeShoppingListItem(userId, 'item-1', prismaMock as any);
      expect(result.message).toContain('Đã xóa nguyên liệu khỏi giỏ đi chợ');
    });
  });

  describe('removeRecipeFromShoppingList & clearShoppingList', () => {
    it('11. Hoàn trả và trừ định lượng khi xóa công thức khỏi giỏ đi chợ', async () => {
      // Giả sử món rec-1 đóng góp 300g vào mục item-1 (tổng đang là 500g)
      prismaMock.shoppingListRecipeSource.findMany.mockResolvedValueOnce([
        {
          shoppingItemId: 'item-1',
          recipeId: 'rec-1',
          addedQuantity: 300,
          shoppingItem: {
            id: 'item-1',
            totalQuantity: 500,
          },
        },
      ]);

      const result = await removeRecipeFromShoppingList(userId, 'rec-1', prismaMock as any);

      // Cập nhật lại định lượng: 500 - 300 = 200g
      expect(prismaMock.shoppingListItem.update).toHaveBeenCalledWith({
        where: { id: 'item-1' },
        data: { totalQuantity: 200 },
      });
      expect(prismaMock.shoppingListRecipeSource.delete).toHaveBeenCalledWith({
        where: {
          shoppingItemId_recipeId: {
            shoppingItemId: 'item-1',
            recipeId: 'rec-1',
          },
        },
      });
      expect(result.affectedItemsCount).toBe(1);
    });

    it('12. Dọn sạch toàn bộ giỏ đi chợ', async () => {
      prismaMock.shoppingListItem.deleteMany.mockResolvedValueOnce({ count: 5 });

      const result = await clearShoppingList(userId, prismaMock as any);

      expect(prismaMock.shoppingListItem.deleteMany).toHaveBeenCalledWith({
        where: { userId },
      });
      expect(result.deletedCount).toBe(5);
    });
  });
});
