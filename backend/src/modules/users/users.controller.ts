import { Response } from 'express';
import multer from 'multer';
import { z } from 'zod';
import { prisma } from '../../config/prisma';
import { uploadImage, isStorageConfigured } from '../../common/services/storage.service';
import { AuthRequest } from '../../common/middlewares/auth.middleware';
import { ErrorCodes } from '../../common/errors';

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 }, // Giới hạn 5MB
});

const nicknameRegex = /^[a-zA-Z0-9_.]{3,20}$/;

const setupNicknameSchema = z.object({
  nickname: z
    .string()
    .min(3, 'Nickname phải có tối thiểu 3 ký tự.')
    .max(30, 'Nickname không được vượt quá 30 ký tự.')
    .regex(
      /^[a-z0-9._]+$/,
      'Nickname chỉ được chứa chữ thường, số, dấu chấm và dấu gạch dưới.',
    )
    .refine(
      (val) => !val.startsWith('.') && !val.endsWith('.'),
      'Nickname không được bắt đầu hoặc kết thúc bằng dấu chấm.',
    ),
});

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

  avatarUrl: z
    .string()
    .url('Đường dẫn avatar không hợp lệ')
    .nullable()
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

const updateAllergiesSchema = z.object({
  ingredientIds: z.array(z.number().int().positive()),
});

// get /api/v1/users/check-nickname?nickname=chef_nhat
export const checkNickname = async (
  req: AuthRequest,
  res: Response,
) => {
  const nickname = String(req.query.nickname || '').trim();

  if (!nicknameRegex.test(nickname)) {
    return res.status(400).json({
      success: false,
      errorCode: ErrorCodes.USER_INVALID_NICKNAME_FORMAT,
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

// post /api/v1/users/setup-nickname
export const setupNickname = async (
  req: AuthRequest,
  res: Response,
) => {
  const parsed = setupNicknameSchema.safeParse(req.body);

  if (!parsed.success) {
    return res.status(400).json({
      success: false,
      errorCode: ErrorCodes.INVALID_NICKNAME_FORMAT,
      message: parsed.error.errors[0].message,
    });
  }

  const userId = req.user!.id;
  const { nickname } = parsed.data;

  if (req.user!.nickname) {
    return res.status(400).json({
      success: false,
      errorCode: ErrorCodes.NICKNAME_ALREADY_SET,
      message: 'Tài khoản đã có nickname, không được phép gọi lại API này.',
    });
  }

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
      errorCode: ErrorCodes.DUPLICATE_NICKNAME,
      message: 'Nickname này đã được sử dụng. Vui lòng chọn nickname khác.',
    });
  }

  const updated = await prisma.user.update({
    where: { id: userId },
    data: { nickname },
  });

  return res.status(200).json({
    success: true,
    message: 'Thiết lập nickname thành công',
    data: {
      id: updated.id,
      nickname: updated.nickname,
      fullName: updated.fullName,
      updatedAt: updated.updatedAt,
    },
  });
};

// get /api/v1/users/me
export const getMe = async (
  req: AuthRequest,
  res: Response,
) => {
  const userId = req.user!.id;

  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: {
      allergies: {
        include: { ingredient: true },
      },
    },
  });

  if (!user) {
    return res.status(404).json({
      success: false,
      errorCode: ErrorCodes.USER_NOT_FOUND,
      message: 'Không tìm thấy thông tin người dùng trong cơ sở dữ liệu.',
    });
  }

  const [recipesCount, followersCount, followingCount] = await Promise.all([
    prisma.recipe.count({ where: { authorId: userId } }),
    prisma.follow.count({ where: { followingId: userId } }),
    prisma.follow.count({ where: { followerId: userId } }),
  ]);

  return res.status(200).json({
    success: true,
    message: 'Lấy thông tin hồ sơ thành công',
    data: {
      id: user.id,
      email: user.email,
      nickname: user.nickname,
      fullName: user.fullName,
      avatarUrl: user.avatarUrl,
      bio: user.bio,
      role: user.role,
      stats: {
        recipesCount,
        followersCount,
        followingCount,
      },
      allergies: (user.allergies || []).map((a) => ({
        id: a.ingredient.id,
        name: a.ingredient.name,
        standardUnit: a.ingredient.standardUnit,
      })),
      createdAt: user.createdAt,
    },
  });
};

// put /api/v1/users/me & put /api/v1/users/profile
export const updateProfile = async (
  req: AuthRequest,
  res: Response,
) => {
  const parsed = updateProfileSchema.safeParse(req.body);

  if (!parsed.success) {
    return res.status(400).json({
      success: false,
      errorCode: ErrorCodes.VALIDATION_ERROR,
      message: parsed.error.errors[0].message,
    });
  }

  const userId = req.user!.id;

  const {
    nickname,
    fullName,
    avatarUrl,
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
        errorCode: ErrorCodes.USER_NICKNAME_TAKEN,
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
        ...(avatarUrl !== undefined && { avatarUrl }),
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
      allergies: (updatedUser.allergies || []).map((a) => ({
        id: a.ingredient.id,
        name: a.ingredient.name,
        standardUnit: a.ingredient.standardUnit,
      })),
      updatedAt: updatedUser.updatedAt,
    },
  });
};

// get /api/v1/users/:nickname - xem hồ sơ công khai của đầu bếp
export const getUserByNickname = async (
  req: AuthRequest,
  res: Response,
) => {
  const nickname = String(req.params.nickname || '').trim();

  const user = await prisma.user.findFirst({
    where: {
      nickname: {
        equals: nickname,
        mode: 'insensitive',
      },
    },
    include: {
      allergies: {
        include: { ingredient: true },
      },
    },
  });

  if (!user) {
    return res.status(404).json({
      success: false,
      errorCode: ErrorCodes.USER_NOT_FOUND,
      message: 'Không tìm thấy thông tin người dùng trong cơ sở dữ liệu',
    });
  }

  const [recipesCount, followersCount, followingCount, recentRecipes, isFollowing] =
    await Promise.all([
      prisma.recipe.count({ where: { authorId: user.id } }),
      prisma.follow.count({ where: { followingId: user.id } }),
      prisma.follow.count({ where: { followerId: user.id } }),
      prisma.recipe.findMany({
        where: { authorId: user.id },
        take: 10,
        orderBy: { createdAt: 'desc' },
        include: {
          category: true,
        },
      }),
      req.user && req.user.id !== user.id
        ? prisma.follow
            .findUnique({
              where: {
                followerId_followingId: {
                  followerId: req.user.id,
                  followingId: user.id,
                },
              },
            })
            .then(Boolean)
        : Promise.resolve(false),
    ]);

  return res.status(200).json({
    success: true,
    message: 'Lấy thông tin hồ sơ công khai thành công',
    data: {
      id: user.id,
      nickname: user.nickname,
      fullName: user.fullName,
      avatarUrl: user.avatarUrl,
      bio: user.bio,
      stats: {
        recipesCount,
        followersCount,
        followingCount,
      },
      isFollowing,
      recentRecipes: recentRecipes.map((r) => ({
        id: r.id,
        title: r.title,
        description: r.description,
        thumbnailUrl: r.thumbnailUrl,
        averageRating: Number(r.averageRating),
        ratingCount: r.ratingCount,
        cookingTime: r.cookingTime,
        category: r.category ? { id: r.category.id, name: r.category.name } : null,
      })),
    },
  });
};

// get /api/v1/users/me/allergies - lấy danh sách nguyên liệu dị ứng
export const getMyAllergies = async (
  req: AuthRequest,
  res: Response,
) => {
  const userId = req.user!.id;
  const allergies = await prisma.userAllergy.findMany({
    where: { userId },
    include: { ingredient: true },
    orderBy: { ingredientId: 'asc' },
  });

  return res.status(200).json({
    success: true,
    message: 'Lấy danh sách dị ứng thành công',
    data: allergies.map((a) => ({
      id: a.ingredient.id,
      name: a.ingredient.name,
      standardUnit: a.ingredient.standardUnit,
    })),
  });
};

// put /api/v1/users/me/allergies - cập nhật toàn bộ danh sách dị ứng
export const updateMyAllergies = async (
  req: AuthRequest,
  res: Response,
) => {
  const parsed = updateAllergiesSchema.safeParse(req.body);

  if (!parsed.success) {
    return res.status(400).json({
      success: false,
      errorCode: ErrorCodes.VALIDATION_ERROR,
      message: parsed.error.errors[0].message,
    });
  }

  const userId = req.user!.id;
  const { ingredientIds } = parsed.data;

  await prisma.$transaction(async (tx) => {
    await tx.userAllergy.deleteMany({
      where: { userId },
    });

    if (ingredientIds.length > 0) {
      await tx.userAllergy.createMany({
        data: ingredientIds.map((ingredientId) => ({
          userId,
          ingredientId,
        })),
        skipDuplicates: true,
      });
    }
  });

  return res.status(200).json({
    success: true,
    message: 'Cập nhật danh sách dị ứng thành công',
    data: {
      totalAllergies: ingredientIds.length,
      ingredientIds,
    },
  });
};

// post /api/v1/users/avatar
// Multipart Form-Data: field "avatar"
export const uploadAvatar = async (
  req: AuthRequest,
  res: Response,
) => {
  if (!req.file) {
    return res.status(400).json({
      success: false,
      errorCode: ErrorCodes.FILE_REQUIRED,
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
      errorCode: ErrorCodes.INVALID_FILE_TYPE,
      message: 'Chỉ chấp nhận định dạng ảnh JPG, PNG hoặc WEBP.',
    });
  }

  const userId = req.user!.id;

  if (!isStorageConfigured()) {
    return res.status(503).json({
      success: false,
      message: 'Chức năng upload ảnh đại diện hiện chưa được cấu hình.',
    });
  }

  const publicId = `${userId}_${Date.now()}`;
  const publicUrl = await uploadImage(req.file.buffer, {
    folder: 'avatars',
    publicId,
  });

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
