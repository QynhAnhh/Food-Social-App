import { Router } from 'express';
import { asyncHandler } from '../../common/middlewares/async-handler';
import {
  getCategories,
  getDietaryRegimes,
  getIngredients,
} from './master-data.controller';

// router cho categories
export const categoriesRouter = Router();
categoriesRouter.get('/', asyncHandler(getCategories));

// router cho dietary-regimes
export const dietaryRegimesRouter = Router();
dietaryRegimesRouter.get('/', asyncHandler(getDietaryRegimes));

// router cho ingredients
export const ingredientsRouter = Router();
ingredientsRouter.get('/', asyncHandler(getIngredients));
