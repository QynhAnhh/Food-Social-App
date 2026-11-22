import { Router } from 'express';
import { authenticate } from '../../common/middlewares/auth.middleware';
import {
  addRecipeToCart,
  addCustomItem,
  getUserShoppingList,
  toggleItem,
  updateItemQty,
  deleteItem,
  deleteRecipeContribution,
  clearCart,
} from './shopping-list.controller';

export const shoppingListRouter = Router();

// Tất cả các thao tác với giỏ đi chợ đều yêu cầu xác thực người dùng
shoppingListRouter.use(authenticate);

// 1. Lấy toàn bộ danh sách đi chợ kèm truy vết nguồn gốc
shoppingListRouter.get('/', getUserShoppingList);

// 2. Thêm nguyên liệu từ công thức vào giỏ đi chợ (Cộng dồn định lượng + Ghi nhận nguồn gốc)
shoppingListRouter.post('/recipes/:recipeId', addRecipeToCart);

// 3. Thêm nguyên liệu tùy chỉnh vào giỏ đi chợ
shoppingListRouter.post('/items', addCustomItem);

// 4. Đánh dấu đã mua / chưa mua nguyên liệu
shoppingListRouter.patch('/items/:id/toggle', toggleItem);

// 5. Chỉnh sửa định lượng nguyên liệu
shoppingListRouter.patch('/items/:id/quantity', updateItemQty);

// 6. Xóa một nguyên liệu khỏi giỏ đi chợ
shoppingListRouter.delete('/items/:id', deleteItem);

// 7. Xóa đóng góp của một công thức khỏi giỏ đi chợ (Trừ dần định lượng)
shoppingListRouter.delete('/recipes/:recipeId', deleteRecipeContribution);

// 8. Dọn sạch toàn bộ giỏ đi chợ
shoppingListRouter.delete('/', clearCart);
