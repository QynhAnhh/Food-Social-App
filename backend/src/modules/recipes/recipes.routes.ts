import { Router } from 'express';
import { authenticate, optionalAuthenticate } from '../../common/middlewares/auth.middleware';
import {
  getRecipes,
  getRecipeById,
  createRecipe,
  updateRecipe,
  toggleFavorite,
  getFavoriteStatus,
  getMyFavoriteRecipes,
} from './recipes.controller';

export const recipesRouter = Router();

// lọc công thức đa tầng (Danh mục + Chế độ ăn + Loại trừ dị ứng)
recipesRouter.get('/', optionalAuthenticate, getRecipes);

// lấy danh sách công thức người dùng hiện tại đã thả tim
recipesRouter.get('/favorites/my', authenticate, getMyFavoriteRecipes);

// tạo công thức mới (Transaction nhiều bảng)
recipesRouter.post('/', authenticate, createRecipe);

// chỉnh sửa công thức (Transaction đồng bộ nhiều bảng)
recipesRouter.put('/:id', authenticate, updateRecipe);

// thả tim / Hủy thả tim công thức
recipesRouter.post('/:id/favorite', authenticate, toggleFavorite);

// kiểm tra trạng thái đã thả tim của 1 công thức
recipesRouter.get('/:id/favorite', authenticate, getFavoriteStatus);

// lấy chi tiết công thức theo ID (kèm kiểm tra đã thích nếu đăng nhập)
recipesRouter.get('/:id', optionalAuthenticate, getRecipeById);
