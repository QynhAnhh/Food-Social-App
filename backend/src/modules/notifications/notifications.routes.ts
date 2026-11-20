
import { Router } from 'express';
import { authenticate } from '../../common/middlewares/auth.middleware';
import { asyncHandler } from '../../common/middlewares/async-handler';

import {
  registerDeviceToken,
  unregisterDeviceToken,
  getNotifications,
  markNotificationRead,
  markAllNotificationsRead,
} from './notifications.controller';

export const notificationsRouter = Router();

notificationsRouter.use(authenticate);

notificationsRouter.post(
  '/device-token',
  asyncHandler(registerDeviceToken),
);

notificationsRouter.delete(
  '/device-token',
  asyncHandler(unregisterDeviceToken),
);

notificationsRouter.get(
  '/',
  asyncHandler(getNotifications),
);

notificationsRouter.patch(
  '/read-all',
  asyncHandler(markAllNotificationsRead),
);

notificationsRouter.patch(
  '/:id/read',
  asyncHandler(markNotificationRead),
);
