
import express from 'express';
import cors from 'cors';

import { authRouter } from './modules/auth/auth.routes';
import { usersRouter } from './modules/users/users.routes';
import { fridgeRouter } from './modules/fridge/fridge.routes';
import { recipesRouter } from './modules/recipes/recipes.routes';

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
  });
});

// ================= API ROUTES =================

const API_PREFIX = '/api/v1';

app.use(`${API_PREFIX}/auth`, authRouter);
app.use(`${API_PREFIX}/users`, usersRouter);
app.use(`${API_PREFIX}/fridge`, fridgeRouter);
app.use(`${API_PREFIX}/recipes`, recipesRouter);

// ================= 404 HANDLER =================

app.use((_req, res) => {
  res.status(404).json({
    success: false,
    message: 'API endpoint not found',
  });
});
