
import { Router } from 'express';
import { authenticate } from '../../common/middlewares/auth.middleware';

import {
  checkNickname,
  updateProfile,
  uploadAvatar,
  upload,
} from './users.controller';

export const usersRouter = Router();

// 1. Kiểm tra nickname
usersRouter.get(
  '/check-nickname',
  authenticate,
  checkNickname,
);

// 2. Cập nhật hồ sơ
usersRouter.put(
  '/profile',
  authenticate,
  updateProfile,
);

// 3. Upload ảnh đại diện
usersRouter.post(
  '/avatar',
  authenticate,
  upload.single('avatar'),
  uploadAvatar,
);
