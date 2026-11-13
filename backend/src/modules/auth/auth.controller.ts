
import { Request, Response } from 'express';
import { z } from 'zod';
import { firebaseAuth } from '../../config/firebase';
import { prisma } from '../../config/prisma';

const googleLoginSchema = z.object({
  idToken: z.string().min(1, 'idToken không được để trống'),
});

export const googleLogin = async (req: Request, res: Response) => {
  try {
    const parsed = googleLoginSchema.safeParse(req.body);

    if (!parsed.success) {
      return res.status(400).json({
        success: false,
        errorCode: 'VALIDATION_ERROR',
        message: parsed.error.errors[0].message,
      });
    }

    const { idToken } = parsed.data;

    // Xác thực Firebase ID Token
    const decoded = await firebaseAuth.verifyIdToken(idToken);

    const { uid, email, name, picture } = decoded;

    if (!email) {
      return res.status(400).json({
        success: false,
        errorCode: 'AUTH_EMAIL_REQUIRED',
        message: 'Tài khoản Google không cung cấp địa chỉ email.',
      });
    }

    // Tìm người dùng đã tồn tại
    const existingUser = await prisma.user.findUnique({
      where: { firebaseUid: uid },
      include: {
        allergies: {
          include: { ingredient: true },
        },
      },
    });

    const isNewUser = !existingUser;

    // Tạo mới hoặc cập nhật người dùng
    const user = await prisma.user.upsert({
      where: { firebaseUid: uid },
      update: {
        email,
        // Chỉ cập nhật avatar Google nếu user chưa có avatar riêng
        ...(existingUser && !existingUser.avatarUrl
          ? { avatarUrl: picture }
          : {}),
      },
      create: {
        firebaseUid: uid,
        email,
        fullName: name || email.split('@')[0],
        avatarUrl: picture || null,
      },
      include: {
        allergies: {
          include: { ingredient: true },
        },
      },
    });

    // Trả kết quả đăng nhập
    return res.status(200).json({
      success: true,
      message: 'Đăng nhập thành công.',
      data: {
        user: {
          id: user.id,
          email: user.email,
          nickname: user.nickname,
          fullName: user.fullName,
          avatarUrl: user.avatarUrl,
          bio: user.bio,
          role: user.role,
          allergies: user.allergies.map((a) => ({
            id: a.ingredient.id,
            name: a.ingredient.name,
          })),
        },
        isNewUser,
        requireNicknameSetup: !user.nickname,
      },
    });
  } catch (error) {
    console.error('Google login error:', error);

    return res.status(401).json({
      success: false,
      errorCode: 'AUTH_INVALID_GOOGLE_TOKEN',
      message: 'Firebase ID Token không hợp lệ hoặc đã hết hạn.',
    });
  }
};
