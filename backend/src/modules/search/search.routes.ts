import { Router } from 'express';
import { authenticate } from '../../common/middlewares/auth.middleware';
import {
  saveFilter,
  getSavedFilters,
  deleteFilter,
} from './saved-filter.controller';

export const searchRouter = Router();

searchRouter.post('/saved-filters', authenticate, saveFilter);
searchRouter.get('/saved-filters', authenticate, getSavedFilters);
searchRouter.delete('/saved-filters/:id', authenticate, deleteFilter);
