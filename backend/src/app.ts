import express from 'express';
import cors from 'cors';

import { authRouter } from './modules/auth/auth.routes';
import { usersRouter } from './modules/users/users.routes';
import { fridgeRouter } from './modules/fridge/fridge.routes';
import { recipesRouter } from './modules/recipes/recipes.routes';
import { savedFiltersRouter } from './modules/search/saved-filters.routes';
import { shoppingListRouter } from './modules/shopping-list/shopping-list.routes';
import { notificationsRouter } from './modules/notifications/notifications.routes';
import { socialRouter } from './modules/social/social.routes';
import { errorHandler } from './common/middlewares/error.middleware';

export const app = express();

// ================= MIDDLEWARE =================

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ================= HEALTH CHECK =================

app.get('/health', (_req, res) => {
  res.status(200).json({
    success: true,
    message: 'Food Social API is running',
    timestamp: new Date().toISOString(),
  });
});

// ================= API ROUTES =================

const API_PREFIX = '/api/v1';

app.use(`${API_PREFIX}/auth`, authRouter);
app.use(`${API_PREFIX}/users`, usersRouter);
app.use(`${API_PREFIX}/fridge`, fridgeRouter);
app.use(`${API_PREFIX}/recipes`, recipesRouter);
app.use(`${API_PREFIX}/saved-filters`, savedFiltersRouter);
app.use(`${API_PREFIX}/shopping-list`, shoppingListRouter);
app.use(`${API_PREFIX}/notifications`, notificationsRouter);
app.use(`${API_PREFIX}/social`, socialRouter);

// ================= 404 HANDLER =================

app.use((_req, res) => {
  res.status(404).json({
    success: false,
    message: 'API endpoint not found',
  });
});

// ================= GLOBAL ERROR HANDLER =================

app.use(errorHandler);