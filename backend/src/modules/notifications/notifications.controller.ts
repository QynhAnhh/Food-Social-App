import { Response } from 'express';
import { z } from 'zod';
import { prisma } from '../../config/prisma';
import { AuthRequest } from '../../common/middlewares/auth.middleware';
import { ErrorCodes } from '../../common/errors';

const registerTokenSchema = z.object({
  token: z.string().trim().min(10, 'FCM token không hợp lệ.'),
  platform: z.enum(['android', 'ios', 'web']).optional().default('android'),
});

const unregisterTokenSchema = z.object({
  token: z.string().trim().min(10, 'FCM token không hợp lệ.'),
});

// POST /api/v1/notifications/device-token
export const registerDeviceToken = async (req: AuthRequest, res: Response) => {
  const parsed = registerTokenSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({
      success: false,
      errorCode: ErrorCodes.VALIDATION_ERROR,
      message: parsed.error.errors[0].message,
    });
  }

  const userId = req.user!.id;
  const { token, platform } = parsed.data;

  // Upsert theo token: nếu máy đổi tài khoản thì chuyển quyền sở hữu token sang user mới
  const saved = await prisma.deviceToken.upsert({
    where: { token },
    update: { userId, platform },
    create: { userId, token, platform },
  });

  return res.status(200).json({
    success: true,
    message: 'Đăng ký thiết bị nhận thông báo thành công.',
    data: saved,
  });
};

// DELETE /api/v1/notifications/device-token (Gọi khi logout trên app)
export const unregisterDeviceToken = async (
  req: AuthRequest,
  res: Response,
) => {
  const parsed = unregisterTokenSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({
      success: false,
      errorCode: ErrorCodes.VALIDATION_ERROR,
      message: parsed.error.errors[0].message,
    });
  }

  const userId = req.user!.id;

  await prisma.deviceToken.deleteMany({
    where: { userId, token: parsed.data.token },
  });

  return res.status(200).json({
    success: true,
    message: 'Đã hủy đăng ký FCM token của thiết bị.',
  });
};

// GET /api/v1/notifications?page=1&limit=20
export const getNotifications = async (req: AuthRequest, res: Response) => {
  const userId = req.user!.id;
  const page = Math.max(1, parseInt(String(req.query.page || '1'), 10) || 1);
  const limit = Math.min(
    50,
    Math.max(1, parseInt(String(req.query.limit || '20'), 10) || 20),
  );
  const skip = (page - 1) * limit;

  const [items, total, unreadCount] = await Promise.all([
    prisma.notification.findMany({
      where: { recipientId: userId },
      include: {
        actor: {
          select: { id: true, nickname: true, fullName: true, avatarUrl: true },
        },
      },
      orderBy: { createdAt: 'desc' },
      skip,
      take: limit,
    }),
    prisma.notification.count({ where: { recipientId: userId } }),
    prisma.notification.count({ where: { recipientId: userId, isRead: false } }),
  ]);

  return res.status(200).json({
    success: true,
    message: 'Lấy danh sách thông báo thành công.',
    data: {
      unreadCount,
      items,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    },
  });
};

// PATCH /api/v1/notifications/:id/read
export const markNotificationRead = async (req: AuthRequest, res: Response) => {
  const userId = req.user!.id;
  const notificationId = String(req.params.id);

  const existing = await prisma.notification.findFirst({
    where: { id: notificationId, recipientId: userId },
  });

  if (!existing) {
    return res.status(404).json({
      success: false,
      errorCode: ErrorCodes.NOTIFICATION_NOT_FOUND,
      message: 'Thông báo không tồn tại.',
    });
  }

  const updated = await prisma.notification.update({
    where: { id: notificationId },
    data: { isRead: true },
  });

  return res.status(200).json({
    success: true,
    message: 'Đã đánh dấu thông báo đã đọc.',
    data: updated,
  });
};

// PATCH /api/v1/notifications/read-all
export const markAllNotificationsRead = async (
  req: AuthRequest,
  res: Response,
) => {
  const userId = req.user!.id;

  const result = await prisma.notification.updateMany({
    where: { recipientId: userId, isRead: false },
    data: { isRead: true },
  });

  return res.status(200).json({
    success: true,
    message: `Đã đánh dấu ${result.count} thông báo là đã đọc.`,
    data: { updatedCount: result.count },
  });
};