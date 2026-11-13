
import { Router } from 'express';
import { authenticate } from '../../common/middlewares/auth.middleware';
import { getRecipeById } from './recipes.controller';

export const recipesRouter = Router();

// Lấy chi tiết công thức theo ID
recipesRouter.get('/:id', authenticate, getRecipeById);
