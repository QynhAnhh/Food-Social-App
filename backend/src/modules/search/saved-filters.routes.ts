
import { Router } from 'express';
import { authenticate } from '../../common/middlewares/auth.middleware';
import { asyncHandler } from '../../common/middlewares/async-handler';

import {
  getSavedFilters,
  createSavedFilter,
  updateSavedFilter,
  setDefaultSavedFilter,
  deleteSavedFilter,
} from './saved-filters.controller';

export const savedFiltersRouter = Router();

savedFiltersRouter.use(authenticate);

savedFiltersRouter.get('/', asyncHandler(getSavedFilters));
savedFiltersRouter.post('/', asyncHandler(createSavedFilter));
savedFiltersRouter.put('/:id', asyncHandler(updateSavedFilter));
savedFiltersRouter.patch(
  '/:id/default',
  asyncHandler(setDefaultSavedFilter),
);
savedFiltersRouter.delete('/:id', asyncHandler(deleteSavedFilter));