import { Request, Response, NextFunction } from 'express';
import { firebaseAuth } from '../../config/firebase';
import { prisma } from '../../config/prisma';

export interface AuthRequest extends Request {
  user?: {
    id: string;
    firebaseUid: string;
    email: string;
    nickname: string | null;
    role: string;
  };
}

export const authenticate = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader?.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        errorCode: 'AUTH_MISSING_TOKEN',
        message: 'Vui lòng đăng nhập để tiếp tục.',
      });
    }

    const token = authHeader.split(' ')[1];
    const decodedToken = await firebaseAuth.verifyIdToken(token);

    const user = await prisma.user.findUnique({
      where: { firebaseUid: decodedToken.uid },
    });

    if (!user) {
      return res.status(401).json({
        success: false,
        errorCode: 'AUTH_USER_NOT_FOUND',
        message: 'Tài khoản chưa được đồng bộ trên hệ thống.',
      });
    }

    req.user = {
      id: user.id,
      firebaseUid: user.firebaseUid,
      email: user.email,
      nickname: user.nickname,
      role: user.role,
    };
    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      errorCode: 'AUTH_INVALID_TOKEN',
      message: 'Token không hợp lệ hoặc đã hết hạn.',
    });
  }
};