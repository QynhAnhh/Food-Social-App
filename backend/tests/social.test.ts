import request from 'supertest';
import { app } from '../src/app';
import { prismaMock, firebaseAuthMock, uploadImageMock } from './setup';
import { ErrorCodes } from '../src/common/errors';

describe('Social, News Feed, Reviews Trigger & Notifications (Week 4: FSA-31, FSA-32)', () => {
  const currentUserId = 'user-uuid-1';
  const chefId = 'chef-uuid-2';
  const recipeId = 'recipe-uuid-1';
  const reviewId = 'review-uuid-1';
  const cooksnapId = 'cooksnap-uuid-1';
  const token = 'Bearer mock-firebase-token';

  beforeEach(() => {
    firebaseAuthMock.verifyIdToken.mockResolvedValue({
      uid: 'firebase-uid-123',
      email: 'nhat.android@gmail.com',
      name: 'Minh Nhất',
    });

    prismaMock.user.findUnique.mockResolvedValue({
      id: currentUserId,
      firebaseUid: 'firebase-uid-123',
      email: 'nhat.android@gmail.com',
      nickname: 'chef_nhat',
      fullName: 'Minh Nhất',
      role: 'USER',
    });
  });

  // ==================== 1. NEWS FEED ====================
  describe('News Feed API (FSA-32)', () => {
    it('1. GET /api/v1/social/feed - Lấy bảng tin từ các đầu bếp đang theo dõi', async () => {
      // User đang follow chefId
      (prismaMock.follow.findMany as jest.Mock).mockResolvedValue([
        { followingId: chefId },
      ]);

      const mockRecipes = [
        {
          id: recipeId,
          title: 'Phở bò tái lăn Hà Nội',
          description: 'Hương vị truyền thống thơm ngon',
          thumbnailUrl: 'https://example.com/pho.jpg',
          servings: 2,
          cookingTime: 45,
          averageRating: 4.9,
          createdAt: new Date(),
          author: {
            id: chefId,
            nickname: 'chef_tuan',
            fullName: 'Nguyễn Anh Tuấn',
            avatarUrl: 'https://example.com/tuan.jpg',
            bio: 'Đầu bếp 10 năm kinh nghiệm',
          },
          category: {
            id: 1,
            name: 'Bữa chính',
            slug: 'bua-chinh',
            iconUrl: null,
          },
          dietaryTags: [
            { dietaryRegime: { id: 1, name: 'Eat Clean', slug: 'eat-clean' } },
          ],
          cooksnaps: [
            {
              id: cooksnapId,
              imageUrl: 'https://example.com/cooksnap1.jpg',
              caption: 'Nấu theo công thức siêu chuẩn!',
              user: {
                id: 'other-user',
                nickname: 'foodie_lan',
                fullName: 'Lan Hương',
                avatarUrl: null,
              },
            },
          ],
          _count: {
            reviews: 5,
            cooksnaps: 2,
            favoritedBy: 10,
          },
        },
      ];

      (prismaMock.recipe.findMany as jest.Mock).mockResolvedValue(mockRecipes);
      (prismaMock.recipe.count as jest.Mock).mockResolvedValue(1);
      (prismaMock.favoriteRecipe.findMany as jest.Mock).mockResolvedValue([
        { recipeId },
      ]);

      const res = await request(app)
        .get('/api/v1/social/feed?page=1&limit=10')
        .set('Authorization', token);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.isFollowingEmpty).toBe(false);
      expect(res.body.data.items).toHaveLength(1);
      expect(res.body.data.items[0].id).toBe(recipeId);
      expect(res.body.data.items[0].isFavorited).toBe(true);
      expect(res.body.data.items[0].stats.reviewsCount).toBe(5);
      expect(res.body.data.items[0].stats.cooksnapsCount).toBe(2);
      expect(res.body.data.items[0].latestCooksnap).not.toBeNull();
      expect(res.body.data.pagination.total).toBe(1);
    });

    it('2. GET /api/v1/social/feed - Trả về gợi ý khi người dùng chưa follow ai', async () => {
      // User chưa follow ai
      (prismaMock.follow.findMany as jest.Mock).mockResolvedValue([]);
      (prismaMock.recipe.findMany as jest.Mock).mockResolvedValue([]);
      (prismaMock.recipe.count as jest.Mock).mockResolvedValue(0);

      const res = await request(app)
        .get('/api/v1/social/feed')
        .set('Authorization', token);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.isFollowingEmpty).toBe(true);
      expect(res.body.message).toContain('chưa theo dõi đầu bếp nào');
    });

    it('3. GET /api/v1/recipes/feed - Hoạt động trên alias route recipes/feed', async () => {
      (prismaMock.follow.findMany as jest.Mock).mockResolvedValue([]);
      (prismaMock.recipe.findMany as jest.Mock).mockResolvedValue([]);
      (prismaMock.recipe.count as jest.Mock).mockResolvedValue(0);

      const res = await request(app)
        .get('/api/v1/recipes/feed')
        .set('Authorization', token);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
    });

    it('4. GET /api/v1/social/feed - Trả về 401 nếu chưa đăng nhập', async () => {
      const res = await request(app).get('/api/v1/social/feed');
      expect(res.status).toBe(401);
    });
  });

  // ==================== 2. REVIEWS & RATING TRIGGER ====================
  describe('Reviews & avg_rating Recalculation (FSA-31, FSA-32)', () => {
    it('5. POST /api/v1/social/recipes/:recipeId/reviews - Gửi đánh giá hợp lệ và tính lại averageRating', async () => {
      (prismaMock.recipe.findUnique as jest.Mock).mockResolvedValue({
        id: recipeId,
        title: 'Phở bò tái lăn',
        authorId: chefId,
      });

      // Chưa từng đánh giá
      (prismaMock.review.findUnique as jest.Mock).mockResolvedValue(null);

      // Tạo review
      const mockCreatedReview = {
        id: reviewId,
        recipeId,
        userId: currentUserId,
        rating: 5,
        comment: 'Món ăn rất ngon, gia vị vừa vặn!',
        createdAt: new Date(),
        user: {
          id: currentUserId,
          nickname: 'chef_nhat',
          fullName: 'Minh Nhất',
          avatarUrl: null,
        },
      };

      (prismaMock.review.create as jest.Mock).mockResolvedValue(mockCreatedReview);
      (prismaMock.review.aggregate as jest.Mock).mockResolvedValue({
        _avg: { rating: 4.8 },
      });
      (prismaMock.recipe.update as jest.Mock).mockResolvedValue({
        id: recipeId,
        averageRating: 4.8,
      });

      const res = await request(app)
        .post(`/api/v1/social/recipes/${recipeId}/reviews`)
        .set('Authorization', token)
        .send({
          rating: 5,
          comment: 'Món ăn rất ngon, gia vị vừa vặn!',
        });

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.review.rating).toBe(5);
      expect(res.body.data.averageRating).toBe(4.8);
    });

    it('6. POST /api/v1/social/recipes/:recipeId/reviews - Từ chối điểm sao không hợp lệ (0 hoặc 6)', async () => {
      const res = await request(app)
        .post(`/api/v1/social/recipes/${recipeId}/reviews`)
        .set('Authorization', token)
        .send({ rating: 6, comment: 'Quá 5 sao' });

      expect(res.status).toBe(400);
      expect(res.body.errorCode).toBe(ErrorCodes.INVALID_RATING_SCORE);
    });

    it('7. POST /api/v1/social/recipes/:recipeId/reviews - Báo lỗi 409 nếu đã từng đánh giá món này', async () => {
      (prismaMock.recipe.findUnique as jest.Mock).mockResolvedValue({
        id: recipeId,
        title: 'Phở bò tái lăn',
        authorId: chefId,
      });

      (prismaMock.review.findUnique as jest.Mock).mockResolvedValue({
        id: reviewId,
        recipeId,
        userId: currentUserId,
        rating: 4,
      });

      const res = await request(app)
        .post(`/api/v1/social/recipes/${recipeId}/reviews`)
        .set('Authorization', token)
        .send({ rating: 5 });

      expect(res.status).toBe(409);
      expect(res.body.errorCode).toBe(ErrorCodes.ALREADY_REVIEWED);
    });

    it('8. PUT /api/v1/social/recipes/:recipeId/reviews/:reviewId - Cập nhật đánh giá và tính lại sao', async () => {
      (prismaMock.review.findFirst as jest.Mock).mockResolvedValue({
        id: reviewId,
        recipeId,
        userId: currentUserId,
        rating: 4,
      });

      (prismaMock.review.update as jest.Mock).mockResolvedValue({
        id: reviewId,
        recipeId,
        userId: currentUserId,
        rating: 5,
        comment: 'Nấu lại lần 2 ngon xuất sắc!',
        user: {
          id: currentUserId,
          nickname: 'chef_nhat',
          fullName: 'Minh Nhất',
          avatarUrl: null,
        },
      });

      (prismaMock.review.aggregate as jest.Mock).mockResolvedValue({
        _avg: { rating: 5.0 },
      });
      (prismaMock.recipe.update as jest.Mock).mockResolvedValue({
        id: recipeId,
        averageRating: 5.0,
      });

      const res = await request(app)
        .put(`/api/v1/social/recipes/${recipeId}/reviews/${reviewId}`)
        .set('Authorization', token)
        .send({ rating: 5, comment: 'Nấu lại lần 2 ngon xuất sắc!' });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.averageRating).toBe(5.0);
    });

    it('9. DELETE /api/v1/social/recipes/:recipeId/reviews/:reviewId - Xóa đánh giá và tính lại sao', async () => {
      (prismaMock.review.findFirst as jest.Mock).mockResolvedValue({
        id: reviewId,
        recipeId,
        userId: currentUserId,
      });

      (prismaMock.review.delete as jest.Mock).mockResolvedValue({});
      (prismaMock.review.aggregate as jest.Mock).mockResolvedValue({
        _avg: { rating: 4.5 },
      });
      (prismaMock.recipe.update as jest.Mock).mockResolvedValue({
        id: recipeId,
        averageRating: 4.5,
      });

      const res = await request(app)
        .delete(`/api/v1/social/recipes/${recipeId}/reviews/${reviewId}`)
        .set('Authorization', token);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.averageRating).toBe(4.5);
    });
  });

  // ==================== 3. FOLLOW & UNFOLLOW ====================
  describe('Follow / Unfollow Chef APIs (FSA-31)', () => {
    it('10. POST /api/v1/social/users/:userId/follow - Chặn tự follow chính mình (400)', async () => {
      const res = await request(app)
        .post(`/api/v1/social/users/${currentUserId}/follow`)
        .set('Authorization', token);

      expect(res.status).toBe(400);
      expect(res.body.errorCode).toBe(ErrorCodes.CANNOT_FOLLOW_SELF);
    });

    it('11. POST /api/v1/social/users/:userId/follow - Follow đầu bếp thành công', async () => {
      (prismaMock.user.findUnique as jest.Mock)
        .mockResolvedValueOnce({
          id: currentUserId,
          fullName: 'Minh Nhất',
          nickname: 'chef_nhat',
          role: 'USER',
        })
        .mockResolvedValueOnce({
          id: chefId,
          fullName: 'Nguyễn Anh Tuấn',
          nickname: 'chef_tuan',
        })
        .mockResolvedValueOnce({
          id: currentUserId,
          fullName: 'Minh Nhất',
          nickname: 'chef_nhat',
        });

      (prismaMock.follow.findUnique as jest.Mock).mockResolvedValue(null);
      (prismaMock.follow.create as jest.Mock).mockResolvedValue({
        followerId: currentUserId,
        followingId: chefId,
      });

      const res = await request(app)
        .post(`/api/v1/social/users/${chefId}/follow`)
        .set('Authorization', token);

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.isFollowing).toBe(true);
    });

    it('12. DELETE /api/v1/social/users/:userId/follow - Hủy follow đầu bếp thành công', async () => {
      (prismaMock.follow.findUnique as jest.Mock).mockResolvedValue({
        followerId: currentUserId,
        followingId: chefId,
      });
      (prismaMock.follow.delete as jest.Mock).mockResolvedValue({});

      const res = await request(app)
        .delete(`/api/v1/social/users/${chefId}/follow`)
        .set('Authorization', token);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.isFollowing).toBe(false);
    });

    it('13. GET /api/v1/social/users/:userId/followers - Lấy danh sách followers', async () => {
      (prismaMock.follow.findMany as jest.Mock).mockResolvedValue([
        {
          follower: {
            id: 'fan-1',
            nickname: 'fan_cuong',
            fullName: 'Lê Hùng',
            avatarUrl: null,
            bio: null,
          },
          createdAt: new Date(),
        },
      ]);
      (prismaMock.follow.count as jest.Mock).mockResolvedValue(1);

      const res = await request(app).get(`/api/v1/social/users/${chefId}/followers`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.items).toHaveLength(1);
      expect(res.body.data.items[0].nickname).toBe('fan_cuong');
    });
  });

  // ==================== 4. COOKSNAPS ====================
  describe('Cooksnap APIs (FSA-31)', () => {
    it('14. GET /api/v1/social/recipes/:recipeId/cooksnaps - Lấy danh sách ảnh thành phẩm', async () => {
      (prismaMock.recipe.findUnique as jest.Mock).mockResolvedValue({ id: recipeId });
      (prismaMock.cooksnap.findMany as jest.Mock).mockResolvedValue([
        {
          id: cooksnapId,
          recipeId,
          imageUrl: 'https://example.com/cooksnap.jpg',
          caption: 'Thành phẩm thơm ngon!',
          createdAt: new Date(),
          user: {
            id: currentUserId,
            nickname: 'chef_nhat',
            fullName: 'Minh Nhất',
            avatarUrl: null,
          },
        },
      ]);
      (prismaMock.cooksnap.count as jest.Mock).mockResolvedValue(1);

      const res = await request(app).get(`/api/v1/social/recipes/${recipeId}/cooksnaps`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.items).toHaveLength(1);
      expect(res.body.data.items[0].caption).toBe('Thành phẩm thơm ngon!');
    });

    it('15. POST /api/v1/social/recipes/:recipeId/cooksnaps - Đăng cooksnap bằng imageUrl', async () => {
      (prismaMock.recipe.findUnique as jest.Mock).mockResolvedValue({
        id: recipeId,
        title: 'Phở bò tái lăn',
        authorId: chefId,
      });

      (prismaMock.cooksnap.create as jest.Mock).mockResolvedValue({
        id: cooksnapId,
        recipeId,
        userId: currentUserId,
        imageUrl: 'https://example.com/my-pho.jpg',
        caption: 'Làm theo công thức ngon tuyệt cú mèo!',
        user: {
          id: currentUserId,
          nickname: 'chef_nhat',
          fullName: 'Minh Nhất',
          avatarUrl: null,
        },
      });

      const res = await request(app)
        .post(`/api/v1/social/recipes/${recipeId}/cooksnaps`)
        .set('Authorization', token)
        .send({
          imageUrl: 'https://example.com/my-pho.jpg',
          caption: 'Làm theo công thức ngon tuyệt cú mèo!',
        });

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.imageUrl).toBe('https://example.com/my-pho.jpg');
    });

    it('15b. POST /api/v1/social/recipes/:recipeId/cooksnaps - Đăng cooksnap bằng file upload (Cloudinary)', async () => {
      (prismaMock.recipe.findUnique as jest.Mock).mockResolvedValue({
        id: recipeId,
        title: 'Phở bò tái lăn',
        authorId: chefId,
      });

      (prismaMock.cooksnap.create as jest.Mock).mockResolvedValue({
        id: cooksnapId,
        recipeId,
        userId: currentUserId,
        imageUrl: 'https://res.cloudinary.com/food-social/image/upload/v12345/cooksnaps/mock.jpg',
        caption: 'Thành phẩm đính kèm ảnh file!',
        user: {
          id: currentUserId,
          nickname: 'chef_nhat',
          fullName: 'Minh Nhất',
          avatarUrl: null,
        },
      });

      const fakeImageBuffer = Buffer.from('fake-cooksnap-image');
      const res = await request(app)
        .post(`/api/v1/social/recipes/${recipeId}/cooksnaps`)
        .set('Authorization', token)
        .field('caption', 'Thành phẩm đính kèm ảnh file!')
        .attach('image', fakeImageBuffer, { filename: 'cooksnap.jpg', contentType: 'image/jpeg' });

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(uploadImageMock).toHaveBeenCalled();
    });
  });

  // ==================== 5. USER DEVICES & NOTIFICATIONS ====================
  describe('User Devices & Notifications (FSA-31)', () => {
    it('16. POST /api/v1/notifications/device-token - Đăng ký FCM token vào user_devices', async () => {
      (prismaMock.userDevice.upsert as jest.Mock).mockResolvedValue({
        id: 'device-1',
        userId: currentUserId,
        token: 'fcm-device-token-1234567890',
        platform: 'android',
      });

      const res = await request(app)
        .post('/api/v1/notifications/device-token')
        .set('Authorization', token)
        .send({
          token: 'fcm-device-token-1234567890',
          platform: 'android',
        });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.platform).toBe('android');
    });

    it('17. DELETE /api/v1/notifications/device-token - Hủy đăng ký device token khi logout', async () => {
      (prismaMock.userDevice.deleteMany as jest.Mock).mockResolvedValue({ count: 1 });

      const res = await request(app)
        .delete('/api/v1/notifications/device-token')
        .set('Authorization', token)
        .send({ token: 'fcm-device-token-1234567890' });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
    });

    it('18. GET /api/v1/notifications - Lấy danh sách thông báo và số lượng chưa đọc', async () => {
      (prismaMock.notification.findMany as jest.Mock).mockResolvedValue([
        {
          id: 'notif-1',
          recipientId: currentUserId,
          type: 'NEW_FOLLOWER',
          title: 'Người theo dõi mới',
          body: 'Nguyễn Anh Tuấn vừa theo dõi bạn',
          isRead: false,
          createdAt: new Date(),
          actor: {
            id: chefId,
            nickname: 'chef_tuan',
            fullName: 'Nguyễn Anh Tuấn',
            avatarUrl: null,
          },
        },
      ]);
      (prismaMock.notification.count as jest.Mock)
        .mockResolvedValueOnce(1) // total
        .mockResolvedValueOnce(1); // unreadCount

      const res = await request(app)
        .get('/api/v1/notifications')
        .set('Authorization', token);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.unreadCount).toBe(1);
      expect(res.body.data.items).toHaveLength(1);
    });

    it('19. PATCH /api/v1/notifications/:id/read - Đánh dấu thông báo đã đọc', async () => {
      (prismaMock.notification.findFirst as jest.Mock).mockResolvedValue({
        id: 'notif-1',
        recipientId: currentUserId,
      });
      (prismaMock.notification.update as jest.Mock).mockResolvedValue({
        id: 'notif-1',
        isRead: true,
      });

      const res = await request(app)
        .patch('/api/v1/notifications/notif-1/read')
        .set('Authorization', token);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.isRead).toBe(true);
    });

    it('20. PATCH /api/v1/notifications/read-all - Đánh dấu tất cả thông báo đã đọc', async () => {
      (prismaMock.notification.updateMany as jest.Mock).mockResolvedValue({
        count: 5,
      });

      const res = await request(app)
        .patch('/api/v1/notifications/read-all')
        .set('Authorization', token);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.updatedCount).toBe(5);
    });
  });
});
