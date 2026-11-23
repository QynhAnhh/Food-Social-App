import { NotificationType, Prisma } from '@prisma/client';
import { prisma } from '../../config/prisma';
import { firebaseMessaging } from '../../config/firebase';
import { syncUserLiveNotification } from '../../common/services/realtime.service';

export interface NotifyUserPayload {
  recipientId: string;
  actorId?: string;
  type: NotificationType;
  title: string;
  body: string;
  data?: Record<string, string>;
}

/**
 * Lưu thông báo vào PostgreSQL và bắn Push Notification qua FCM tới tất cả thiết bị của recipient.
 * Không throw lỗi ra ngoài để tránh làm fail request chính nếu FCM gặp sự cố.
 */
export const notifyUser = async (payload: NotifyUserPayload): Promise<void> => {
  try {
    // Không tự gửi thông báo cho chính mình
    if (payload.actorId && payload.actorId === payload.recipientId) {
      return;
    }

    // lưu lịch sử thông báo vào DB
    const notification = await prisma.notification.create({
      data: {
        recipientId: payload.recipientId,
        actorId: payload.actorId ?? null,
        type: payload.type,
        title: payload.title,
        body: payload.body,
        data: (payload.data ?? {}) as Prisma.InputJsonValue,
      },
    });

    // Đồng bộ tín hiệu thông báo thời gian thực qua Firebase Realtime Database
    void syncUserLiveNotification(payload.recipientId, notification);

    // lấy danh sách FCM token của người nhận
    const deviceTokens = await prisma.userDevice.findMany({
      where: { userId: payload.recipientId },
      select: { token: true },
    });

    if (!deviceTokens || deviceTokens.length === 0) return;

    const tokens = deviceTokens.map((d) => d.token);

    // gửi multicast qua Firebase Cloud Messaging
    const response = await firebaseMessaging.sendEachForMulticast({
      tokens,
      notification: {
        title: payload.title,
        body: payload.body,
      },
      data: {
        notificationId: notification.id,
        type: payload.type,
        ...(payload.data ?? {}),
      },
      android: {
        priority: 'high',
        notification: {
          channelId: 'food_social_default',
          sound: 'default',
        },
      },
    });

    // tự động xóa các FCM token đã chết / app bị gỡ cài đặt
    const invalidTokens: string[] = [];
    response.responses.forEach((resp, idx) => {
      if (!resp.success) {
        const code = resp.error?.code;
        if (
          code === 'messaging/registration-token-not-registered' ||
          code === 'messaging/invalid-registration-token'
        ) {
          invalidTokens.push(tokens[idx]);
        }
      }
    });

    if (invalidTokens.length > 0) {
      await prisma.userDevice.deleteMany({
        where: { token: { in: invalidTokens } },
      });
    }
  } catch (error) {
    console.error('[FCM] Lỗi khi gửi Push Notification:', error);
  }
};