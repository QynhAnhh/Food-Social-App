
import { Router } from 'express';
import { authenticate } from '../../common/middlewares/auth.middleware';
import { asyncHandler } from '../../common/middlewares/async-handler';

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
  asyncHandler(checkNickname),
);

// 2. Cập nhật hồ sơ
usersRouter.put(
  '/profile',
  authenticate,
  asyncHandler(updateProfile),
);

// 3. Upload ảnh đại diện
usersRouter.post(
  '/avatar',
  authenticate,
  upload.single('avatar'),
  asyncHandler(uploadAvatar),
);
