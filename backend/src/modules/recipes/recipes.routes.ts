
import { Router } from 'express';
import { authenticate } from '../../common/middlewares/auth.middleware';
import {
  getRecipeById,
  createRecipe,
  updateRecipe,
} from './recipes.controller';

export const recipesRouter = Router();

// 1. Tạo công thức mới (Transaction nhiều bảng)
recipesRouter.post('/', authenticate, createRecipe);

// 2. Chỉnh sửa công thức (Transaction đồng bộ nhiều bảng)
recipesRouter.put('/:id', authenticate, updateRecipe);

// 3. Lấy chi tiết công thức theo ID
recipesRouter.get('/:id', authenticate, getRecipeById);

