import request from 'supertest';
import { app } from '../src/app';
import { prismaMock, fileSaveMock } from './setup';

const AUTH_HEADER = { Authorization: 'Bearer valid-token' };

describe('Users & Profile APIs', () => {
  it('1. GET /check-nickname - Trả về isAvailable = true nếu chưa có ai dùng', async () => {
    prismaMock.user.findFirst.mockResolvedValueOnce(null);
    const res = await request(app).get('/api/v1/users/check-nickname?nickname=chef_nhat_99').set(AUTH_HEADER);
    expect(res.status).toBe(200);
    expect(res.body.data.isAvailable).toBe(true);
  });

  it('2. PUT /profile - Cập nhật thành công nickname, bio và dị ứng', async () => {
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

  it('3. POST /avatar - Upload ảnh lên Firebase Cloud Storage', async () => {
    prismaMock.user.update.mockResolvedValueOnce({ id: 'user-uuid-1' });
    const fakeImageBuffer = Buffer.from('fake-image');
    const res = await request(app)
      .post('/api/v1/users/avatar')
      .set(AUTH_HEADER)
      .attach('avatar', fakeImageBuffer, { filename: 'avatar.png', contentType: 'image/png' });

    expect(res.status).toBe(200);
    expect(fileSaveMock).toHaveBeenCalledTimes(1);
  });
});
