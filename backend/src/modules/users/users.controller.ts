
import { Response } from 'express';
import multer from 'multer';
import { z } from 'zod';
import { prisma } from '../../config/prisma';
import { firebaseBucket } from '../../config/firebase';
import { AuthRequest } from '../../common/middlewares/auth.middleware';

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 }, // Giới hạn 5MB
});

const nicknameRegex = /^[a-zA-Z0-9_.]{3,20}$/;

const updateProfileSchema = z.object({
  nickname: z
    .string()
    .regex(
      nicknameRegex,
      'Nickname chỉ chứa chữ cái, số, dấu chấm hoặc gạch dưới (3-20 ký tự)',
    )
    .optional(),

  fullName: z
    .string()
    .min(1, 'Họ tên không được để trống')
    .max(80)
    .optional(),

  bio: z
    .string()
    .max(300, 'Tiểu sử tối đa 300 ký tự')
    .nullable()
    .optional(),

  allergyIngredientIds: z
    .array(z.number().int().positive())
    .optional(),
});

// 1. GET /api/v1/users/check-nickname?nickname=chef_nhat
export const checkNickname = async (
  req: AuthRequest,
  res: Response,
) => {
  const nickname = String(req.query.nickname || '').trim();

  if (!nicknameRegex.test(nickname)) {
    return res.status(400).json({
      success: false,
      errorCode: 'USER_INVALID_NICKNAME_FORMAT',
      message:
        'Nickname chỉ gồm chữ không dấu, số, dấu chấm hoặc gạch dưới (3-20 ký tự).',
    });
  }

  const existing = await prisma.user.findFirst({
    where: {
      nickname: {
        equals: nickname,
        mode: 'insensitive',
      },
      ...(req.user ? { NOT: { id: req.user.id } } : {}),
    },
    select: { id: true },
  });

  return res.status(200).json({
    success: true,
    message: existing
      ? 'Nickname đã có người sử dụng.'
      : 'Nickname khả dụng.',
    data: {
      nickname,
      isAvailable: !existing,
    },
  });
};

// 2. PUT /api/v1/users/profile
export const updateProfile = async (
  req: AuthRequest,
  res: Response,
) => {
  const parsed = updateProfileSchema.safeParse(req.body);

  if (!parsed.success) {
    return res.status(400).json({
      success: false,
      errorCode: 'VALIDATION_ERROR',
      message: parsed.error.errors[0].message,
    });
  }

  const userId = req.user!.id;

  const {
    nickname,
    fullName,
    bio,
    allergyIngredientIds,
  } = parsed.data;

  // Kiểm tra nickname đã được người khác sử dụng chưa
  if (nickname) {
    const taken = await prisma.user.findFirst({
      where: {
        nickname: {
          equals: nickname,
          mode: 'insensitive',
        },
        NOT: { id: userId },
      },
    });

    if (taken) {
      return res.status(409).json({
        success: false,
        errorCode: 'USER_NICKNAME_TAKEN',
        message:
          'Nickname này đã được sử dụng, vui lòng chọn tên khác.',
      });
    }
  }

  // Cập nhật thông tin và danh sách dị ứng trong transaction
  const updatedUser = await prisma.$transaction(async (tx) => {
    if (allergyIngredientIds !== undefined) {
      await tx.userAllergy.deleteMany({
        where: { userId },
      });

      if (allergyIngredientIds.length > 0) {
        await tx.userAllergy.createMany({
          data: allergyIngredientIds.map((ingredientId) => ({
            userId,
            ingredientId,
          })),
          skipDuplicates: true,
        });
      }
    }

    return tx.user.update({
      where: { id: userId },
      data: {
        ...(nickname !== undefined && { nickname }),
        ...(fullName !== undefined && { fullName }),
        ...(bio !== undefined && { bio }),
      },
      include: {
        allergies: {
          include: { ingredient: true },
        },
      },
    });
  });

  return res.status(200).json({
    success: true,
    message: 'Cập nhật hồ sơ thành công.',
    data: {
      id: updatedUser.id,
      email: updatedUser.email,
      nickname: updatedUser.nickname,
      fullName: updatedUser.fullName,
      avatarUrl: updatedUser.avatarUrl,
      bio: updatedUser.bio,
      allergies: updatedUser.allergies.map((a) => ({
        id: a.ingredient.id,
        name: a.ingredient.name,
        standardUnit: a.ingredient.standardUnit,
      })),
    },
  });
};

// 3. POST /api/v1/users/avatar
// Multipart Form-Data: field "avatar"
export const uploadAvatar = async (
  req: AuthRequest,
  res: Response,
) => {
  if (!req.file) {
    return res.status(400).json({
      success: false,
      errorCode: 'FILE_REQUIRED',
      message:
        'Vui lòng đính kèm file ảnh trong trường "avatar".',
    });
  }

  const allowedMimeTypes = [
    'image/jpeg',
    'image/png',
    'image/webp',
  ];

  if (!allowedMimeTypes.includes(req.file.mimetype)) {
    return res.status(400).json({
      success: false,
      errorCode: 'INVALID_FILE_TYPE',
      message: 'Chỉ chấp nhận định dạng ảnh JPG, PNG hoặc WEBP.',
    });
  }

  const userId = req.user!.id;

  const ext = req.file.mimetype.split('/')[1];

  const filePath = `avatars/${userId}_${Date.now()}.${ext}`;

  const fileUpload = firebaseBucket.file(filePath);

  await fileUpload.save(req.file.buffer, {
    metadata: {
      contentType: req.file.mimetype,
    },
    public: true,
  });

  const publicUrl = `https://storage.googleapis.com/${firebaseBucket.name}/${filePath}`;

  await prisma.user.update({
    where: { id: userId },
    data: { avatarUrl: publicUrl },
  });

  return res.status(200).json({
    success: true,
    message: 'Tải ảnh đại diện thành công.',
    data: { avatarUrl: publicUrl },
  });
};

// Export middleware upload để routes sử dụng
export { upload };
