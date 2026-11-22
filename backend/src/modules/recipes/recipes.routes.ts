import { Router } from 'express';
import {
  authenticate,
  optionalAuthenticate,
} from '../../common/middlewares/auth.middleware';
import { asyncHandler } from '../../common/middlewares/async-handler';

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

recipesRouter.get(
  '/',
  optionalAuthenticate,
  asyncHandler(getRecipes),
);

// Danh sách công thức yêu thích của tôi (phải đặt trước /:id)
recipesRouter.get(
  '/favorites/my',
  authenticate,
  asyncHandler(getMyFavoriteRecipes),
);

// Thả tim / Hủy thả tim công thức
recipesRouter.post(
  '/:id/favorite',
  authenticate,
  asyncHandler(toggleFavorite),
);

// Kiểm tra trạng thái đã thả tim
recipesRouter.get(
  '/:id/favorite',
  authenticate,
  asyncHandler(getFavoriteStatus),
);

recipesRouter.get(
  '/:id',
  optionalAuthenticate,
  asyncHandler(getRecipeById),
);

recipesRouter.post(
  '/',
  authenticate,
  asyncHandler(createRecipe),
);

recipesRouter.put(
  '/:id',
  authenticate,
  asyncHandler(updateRecipe),
);
