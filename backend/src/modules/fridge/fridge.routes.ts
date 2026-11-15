
import { Router } from 'express';
import { authenticate } from '../../common/middlewares/auth.middleware';

import {
  getFridgeItems,
  addFridgeItem,
  updateFridgeItem,
  deleteFridgeItem,
  getFridgeRecommendations,
} from './fridge.controller';

export const fridgeRouter = Router();

// Middleware xác thực cho toàn bộ API tủ lạnh
fridgeRouter.use(authenticate);

// 1. Lấy danh sách nguyên liệu trong tủ lạnh
fridgeRouter.get('/items', getFridgeItems);

// 2. Thêm hoặc cập nhật nguyên liệu
fridgeRouter.post('/items', addFridgeItem);

// 3. Cập nhật số lượng và hạn sử dụng
fridgeRouter.put('/items/:id', updateFridgeItem);

// 4. Xóa nguyên liệu khỏi tủ lạnh
fridgeRouter.delete('/items/:id', deleteFridgeItem);

// 5. Gợi ý công thức nấu ăn
fridgeRouter.get('/recommendations', getFridgeRecommendations);
