import request from 'supertest';
import { app } from '../src/app';
import { prismaMock, uploadImageMock } from './setup';

const AUTH_HEADER = { Authorization: 'Bearer valid-token' };

describe('Users & Profile APIs', () => {
  it('1. GET /check-nickname - Trả về isAvailable = true nếu chưa có ai dùng', async () => {
    prismaMock.user.findFirst.mockResolvedValueOnce(null);
    const res = await request(app).get('/api/v1/users/check-nickname?nickname=chef_nhat_99').set(AUTH_HEADER);
    expect(res.status).toBe(200);
    expect(res.body.data.isAvailable).toBe(true);
  });

  it('2. POST /setup-nickname - Thiết lập nickname độc nhất lần đầu', async () => {
    prismaMock.user.findUnique.mockResolvedValueOnce({
      id: 'user-uuid-1',
      nickname: null,
    });
    prismaMock.user.findFirst.mockResolvedValueOnce(null);
    prismaMock.user.update.mockResolvedValueOnce({
      id: 'user-uuid-1',
      nickname: 'bep_an',
      fullName: 'Nguyễn Văn An',
      updatedAt: new Date(),
    });

    const res = await request(app)
      .post('/api/v1/users/setup-nickname')
      .set(AUTH_HEADER)
      .send({ nickname: 'bep_an' });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.nickname).toBe('bep_an');
  });

  it('3. GET /me - Lấy thông tin hồ sơ của tài khoản đang đăng nhập kèm stats', async () => {
    const mockUser = {
      id: 'user-uuid-1',
      email: 'chef.an@gmail.com',
      nickname: 'bep_an',
      fullName: 'Nguyễn Văn An',
      avatarUrl: null,
      bio: 'Yêu nấu ăn',
      role: 'USER',
      allergies: [],
      createdAt: new Date(),
    };
    prismaMock.user.findUnique
      .mockResolvedValueOnce(mockUser)
      .mockResolvedValueOnce(mockUser);
    prismaMock.recipe.count.mockResolvedValueOnce(12);
    prismaMock.follow.count.mockResolvedValueOnce(150); // followers
    prismaMock.follow.count.mockResolvedValueOnce(45);  // following

    const res = await request(app).get('/api/v1/users/me').set(AUTH_HEADER);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.nickname).toBe('bep_an');
    expect(res.body.data.stats.recipesCount).toBe(12);
    expect(res.body.data.stats.followersCount).toBe(150);
  });

  it('4. PUT /profile - Cập nhật thành công nickname, bio và dị ứng', async () => {
    prismaMock.user.findFirst.mockResolvedValueOnce(null);
    prismaMock.user.update.mockResolvedValueOnce({
      id: 'user-uuid-1',
      email: 'nhat.android@gmail.com',
      nickname: 'chef_nhat',
      fullName: 'Minh Nhất',
      avatarUrl: null,
      bio: 'Đam mê món Á',
      allergies: [{ ingredient: { id: 12, name: 'Tôm sú', standardUnit: 'gram' } }],
    });

    const res = await request(app)
      .put('/api/v1/users/profile')
      .set(AUTH_HEADER)
      .send({ nickname: 'chef_nhat', fullName: 'Minh Nhất', bio: 'Đam mê món Á', allergyIngredientIds: [12] });

    expect(res.status).toBe(200);
    expect(res.body.data.nickname).toBe('chef_nhat');
  });

  it('5. GET /:nickname - Xem trang cá nhân công khai của người khác', async () => {
    prismaMock.user.findFirst.mockResolvedValueOnce({
      id: 'u-target-1',
      nickname: 'chef_tuan',
      fullName: 'Nguyễn Anh Tuấn',
      avatarUrl: null,
      bio: 'Bếp trưởng',
      allergies: [],
    });
    prismaMock.recipe.count.mockResolvedValueOnce(5);
    prismaMock.follow.count.mockResolvedValueOnce(20);
    prismaMock.follow.count.mockResolvedValueOnce(10);
    prismaMock.recipe.findMany.mockResolvedValueOnce([]);
    prismaMock.follow.findUnique.mockResolvedValueOnce(null);

    const res = await request(app).get('/api/v1/users/chef_tuan').set(AUTH_HEADER);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.nickname).toBe('chef_tuan');
    expect(res.body.data.stats.recipesCount).toBe(5);
  });

  it('6. GET & PUT /me/allergies - Lấy và cập nhật danh sách nguyên liệu dị ứng', async () => {
    prismaMock.userAllergy.findMany.mockResolvedValueOnce([
      { ingredientId: 8, ingredient: { id: 8, name: 'Tôm sú', standardUnit: 'gram' } },
    ]);

    const getRes = await request(app).get('/api/v1/users/me/allergies').set(AUTH_HEADER);
    expect(getRes.status).toBe(200);
    expect(getRes.body.data).toHaveLength(1);

    prismaMock.userAllergy.deleteMany.mockResolvedValueOnce({ count: 1 });
    prismaMock.userAllergy.createMany.mockResolvedValueOnce({ count: 2 });

    const putRes = await request(app)
      .put('/api/v1/users/me/allergies')
      .set(AUTH_HEADER)
      .send({ ingredientIds: [8, 14] });

    expect(putRes.status).toBe(200);
    expect(putRes.body.data.totalAllergies).toBe(2);
  });

  it('7. POST /avatar - Upload ảnh đại diện lên Cloudinary', async () => {
    prismaMock.user.update.mockResolvedValueOnce({ id: 'user-uuid-1' });
    const fakeImageBuffer = Buffer.from('fake-image');
    const res = await request(app)
      .post('/api/v1/users/avatar')
      .set(AUTH_HEADER)
      .attach('avatar', fakeImageBuffer, { filename: 'avatar.png', contentType: 'image/png' });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(uploadImageMock).toHaveBeenCalledTimes(1);
    expect(res.body.data.avatarUrl).toContain('https://res.cloudinary.com/');
  });
});
