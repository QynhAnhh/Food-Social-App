import { Router } from 'express';
import {
  authenticate,
  optionalAuthenticate,
} from '../../common/middlewares/auth.middleware';
import { asyncHandler } from '../../common/middlewares/async-handler';

import {
  checkNickname,
  setupNickname,
  getMe,
  updateProfile,
  getUserByNickname,
  getMyAllergies,
  updateMyAllergies,
  uploadAvatar,
  upload,
} from './users.controller';

export const usersRouter = Router();

// kiểm tra tính khả dụng của nickname
usersRouter.get(
  '/check-nickname',
  authenticate,
  asyncHandler(checkNickname),
);

// thiết lập nickname độc nhất lần đầu sau đăng nhập google
usersRouter.post(
  '/setup-nickname',
  authenticate,
  asyncHandler(setupNickname),
);

// thông tin hồ sơ cá nhân của tôi
usersRouter.get(
  '/me',
  authenticate,
  asyncHandler(getMe),
);

// cập nhật hồ sơ cá nhân
usersRouter.put(
  '/me',
  authenticate,
  asyncHandler(updateProfile),
);

usersRouter.put(
  '/profile',
  authenticate,
  asyncHandler(updateProfile),
);

// quản lý danh sách nguyên liệu dị ứng của tôi
usersRouter.get(
  '/me/allergies',
  authenticate,
  asyncHandler(getMyAllergies),
);

usersRouter.put(
  '/me/allergies',
  authenticate,
  asyncHandler(updateMyAllergies),
);

// upload ảnh đại diện
usersRouter.post(
  '/avatar',
  authenticate,
  upload.single('avatar'),
  asyncHandler(uploadAvatar),
);

// xem trang cá nhân công khai của người dùng khác qua nickname (đặt cuối cùng)
usersRouter.get(
  '/:nickname',
  optionalAuthenticate,
  asyncHandler(getUserByNickname),
);
