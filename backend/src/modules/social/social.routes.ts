
import { Router } from 'express';
import {
  authenticate,
  optionalAuthenticate,
} from '../../common/middlewares/auth.middleware';
import { asyncHandler } from '../../common/middlewares/async-handler';

import {
  cooksnapUpload,
  followUser,
  unfollowUser,
  getFollowers,
  getFollowing,
  getRecipeReviews,
  createRecipeReview,
  updateRecipeReview,
  deleteRecipeReview,
  getRecipeCooksnaps,
  createCooksnap,
  deleteCooksnap,
} from './social.controller';

export const socialRouter = Router();

// Follow
socialRouter.post(
  '/users/:userId/follow',
  authenticate,
  asyncHandler(followUser),
);

socialRouter.delete(
  '/users/:userId/follow',
  authenticate,
  asyncHandler(unfollowUser),
);

socialRouter.get(
  '/users/:userId/followers',
  optionalAuthenticate,
  asyncHandler(getFollowers),
);

socialRouter.get(
  '/users/:userId/following',
  optionalAuthenticate,
  asyncHandler(getFollowing),
);

// Reviews
socialRouter.get(
  '/recipes/:recipeId/reviews',
  optionalAuthenticate,
  asyncHandler(getRecipeReviews),
);

socialRouter.post(
  '/recipes/:recipeId/reviews',
  authenticate,
  asyncHandler(createRecipeReview),
);

socialRouter.put(
  '/recipes/:recipeId/reviews/:reviewId',
  authenticate,
  asyncHandler(updateRecipeReview),
);

socialRouter.delete(
  '/recipes/:recipeId/reviews/:reviewId',
  authenticate,
  asyncHandler(deleteRecipeReview),
);

// Cooksnaps
socialRouter.get(
  '/recipes/:recipeId/cooksnaps',
  optionalAuthenticate,
  asyncHandler(getRecipeCooksnaps),
);

socialRouter.post(
  '/recipes/:recipeId/cooksnaps',
  authenticate,
  cooksnapUpload.single('image'),
  asyncHandler(createCooksnap),
);

socialRouter.delete(
  '/cooksnaps/:cooksnapId',
  authenticate,
  asyncHandler(deleteCooksnap),
);
