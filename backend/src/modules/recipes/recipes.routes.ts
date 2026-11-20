
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
} from './recipes.controller';

export const recipesRouter = Router();

recipesRouter.get(
  '/',
  optionalAuthenticate,
  asyncHandler(getRecipes),
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
