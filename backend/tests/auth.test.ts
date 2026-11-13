import request from 'supertest';
import { app } from '../src/app';
import { prismaMock, firebaseAuthMock } from './setup';

describe('POST /api/v1/auth/google', () => {
  it('1. Trả về 400 nếu thiếu idToken trong body', async () => {
    const res = await request(app).post('/api/v1/auth/google').send({});
    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
    expect(res.body.errorCode).toBe('VALIDATION_ERROR');
  });

  it('2. Trả về 401 nếu Firebase ID Token không hợp lệ hoặc hết hạn', async () => {
    firebaseAuthMock.verifyIdToken.mockRejectedValueOnce(new Error('Invalid token'));
    const res = await request(app).post('/api/v1/auth/google').send({ idToken: 'invalid-token' });
    expect(res.status).toBe(401);
    expect(res.body.errorCode).toBe('AUTH_INVALID_GOOGLE_TOKEN');
  });

  it('3. Tạo mới user và trả về requireNicknameSetup = true khi đăng nhập lần đầu', async () => {
    prismaMock.user.findUnique.mockResolvedValueOnce(null);
    prismaMock.user.upsert.mockResolvedValueOnce({
      id: 'user-uuid-new',
      firebaseUid: 'firebase-uid-123',
      email: 'nhat.android@gmail.com',
      nickname: null,
      fullName: 'Minh Nhất',
      avatarUrl: 'https://lh3.googleusercontent.com/a/default-user',
      bio: null,
      role: 'USER',
      allergies: [],
    });

    const res = await request(app).post('/api/v1/auth/google').send({ idToken: 'valid-firebase-token' });
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.isNewUser).toBe(true);
    expect(res.body.data.requireNicknameSetup).toBe(true);
  });
});
