
import { Router } from 'express';
import { authenticate } from '../../common/middlewares/auth.middleware';
import { asyncHandler } from '../../common/middlewares/async-handler';

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

// lấy danh sách nguyên liệu trong tủ lạnh
fridgeRouter.get('/', asyncHandler(getFridgeItems));
fridgeRouter.get('/items', asyncHandler(getFridgeItems));

// thêm hoặc cập nhật nguyên liệu
fridgeRouter.post('/items', asyncHandler(addFridgeItem));

// cập nhật số lượng và hạn sử dụng
fridgeRouter.put('/items/:id', asyncHandler(updateFridgeItem));

// xóa nguyên liệu khỏi tủ lạnh
fridgeRouter.delete('/items/:id', asyncHandler(deleteFridgeItem));

// gợi ý công thức nấu ăn
fridgeRouter.get('/recommendations', asyncHandler(getFridgeRecommendations));
fridgeRouter.get('/suggestions', asyncHandler(getFridgeRecommendations));
fridgeRouter.post('/suggestions', asyncHandler(getFridgeRecommendations));
