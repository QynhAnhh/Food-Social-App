import { firebaseDatabase } from '../../config/firebase';

/**
 * Kiểm tra xem Firebase Realtime Database đã được cấu hình hay chưa.
 */
export const isRealtimeConfigured = (): boolean => {
  return Boolean(process.env.FIREBASE_DATABASE_URL && firebaseDatabase);
};

export interface LiveRecipeStats {
  favoritesCount?: number;
  reviewsCount?: number;
  averageRating?: number;
  cooksnapsCount?: number;
}

/**
 * Đồng bộ số lượt thả tim của công thức nấu ăn lên Firebase Realtime Database.
 * Giúp màn hình điện thoại của tất cả người dùng khác đang mở công thức này tự động cập nhật số tim tức thì.
 */
export const syncRecipeFavoritesCount = async (
  recipeId: string,
  favoritesCount: number
): Promise<void> => {
  if (!firebaseDatabase) return;

  try {
    const ref = firebaseDatabase.ref(`recipes/${recipeId}`);
    await ref.update({
      favoritesCount,
      updatedAt: Date.now(),
    });
  } catch (error) {
    // Không ném lỗi ra ngoài để tránh ảnh hưởng luồng chính
    console.warn(`[RealtimeDB] Không thể đồng bộ số tim cho công thức ${recipeId}:`, error);
  }
};

/**
 * Đồng bộ các chỉ số thống kê (rating, số đánh giá, số cooksnap) của công thức lên Realtime Database.
 */
export const syncRecipeLiveStats = async (
  recipeId: string,
  stats: LiveRecipeStats
): Promise<void> => {
  if (!firebaseDatabase) return;

  try {
    const ref = firebaseDatabase.ref(`recipes/${recipeId}/stats`);
    await ref.update({
      ...stats,
      updatedAt: Date.now(),
    });
  } catch (error) {
    console.warn(`[RealtimeDB] Không thể đồng bộ stats cho công thức ${recipeId}:`, error);
  }
};

/**
 * Đẩy tín hiệu thông báo thời gian thực xuống nhánh của người dùng.
 * Giúp app trên điện thoại hiển thị huy hiệu đỏ (badge) hoặc pop-up thông báo ngay lập tức.
 */
export const syncUserLiveNotification = async (
  userId: string,
  notification: {
    id: string;
    type: string;
    title: string;
    body: string;
    createdAt?: Date | string;
  }
): Promise<void> => {
  if (!firebaseDatabase) return;

  try {
    const ref = firebaseDatabase.ref(`users/${userId}/latestNotification`);
    await ref.set({
      id: notification.id,
      type: notification.type,
      title: notification.title,
      body: notification.body,
      createdAt: notification.createdAt
        ? new Date(notification.createdAt).toISOString()
        : new Date().toISOString(),
      timestamp: Date.now(),
    });
  } catch (error) {
    console.warn(`[RealtimeDB] Không thể gửi live notification cho user ${userId}:`, error);
  }
};
