import { firebaseDatabaseMock } from './setup';
import {
  syncRecipeFavoritesCount,
  syncRecipeLiveStats,
  syncUserLiveNotification,
  isRealtimeConfigured,
} from '../src/common/services/realtime.service';

describe('Firebase Realtime Database Service', () => {
  it('1. isRealtimeConfigured - trả về true/false theo biến môi trường', () => {
    expect(typeof isRealtimeConfigured()).toBe('boolean');
  });

  it('2. syncRecipeFavoritesCount - gọi update số tim trên node recipes/:id', async () => {
    await syncRecipeFavoritesCount('recipe-123', 25);
    expect(firebaseDatabaseMock.ref).toHaveBeenCalledWith('recipes/recipe-123');
  });

  it('3. syncRecipeLiveStats - gọi update thống kê trên node recipes/:id/stats', async () => {
    await syncRecipeLiveStats('recipe-123', {
      favoritesCount: 10,
      averageRating: 4.8,
      reviewsCount: 5,
    });
    expect(firebaseDatabaseMock.ref).toHaveBeenCalledWith('recipes/recipe-123/stats');
  });

  it('4. syncUserLiveNotification - gọi set trên node users/:userId/latestNotification', async () => {
    await syncUserLiveNotification('user-456', {
      id: 'notif-789',
      type: 'RECIPE_REVIEWED',
      title: 'Đánh giá mới',
      body: 'Ai đó đã đánh giá công thức của bạn',
      createdAt: new Date(),
    });
    expect(firebaseDatabaseMock.ref).toHaveBeenCalledWith('users/user-456/latestNotification');
  });
});
