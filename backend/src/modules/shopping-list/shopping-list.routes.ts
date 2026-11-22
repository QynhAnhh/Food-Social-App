
import { Router } from 'express';
import { authenticate } from '../../common/middlewares/auth.middleware';
import { asyncHandler } from '../../common/middlewares/async-handler';

import {
  getShoppingList,
  addShoppingItem,
  addMissingFromRecipe,
  toggleShoppingItem,
  updateShoppingItem,
  clearCheckedShoppingItems,
  deleteShoppingItem,
} from './shopping-list.controller';

export const shoppingListRouter = Router();

shoppingListRouter.use(authenticate);

shoppingListRouter.get('/', asyncHandler(getShoppingList));
shoppingListRouter.post('/', asyncHandler(addShoppingItem));
shoppingListRouter.post(
  '/from-recipe/:recipeId',
  asyncHandler(addMissingFromRecipe),
);
shoppingListRouter.delete(
  '/checked',
  asyncHandler(clearCheckedShoppingItems),
);
shoppingListRouter.patch(
  '/:id/toggle',
  asyncHandler(toggleShoppingItem),
);
shoppingListRouter.patch('/:id', asyncHandler(updateShoppingItem));
shoppingListRouter.delete('/:id', asyncHandler(deleteShoppingItem));
