import { Response } from 'express';
import multer from 'multer';
import { z } from 'zod';
import { Prisma } from '@prisma/client';
import { prisma } from '../../config/prisma';
import { uploadImage, isStorageConfigured } from '../../common/services/storage.service';
import { AuthRequest } from '../../common/middlewares/auth.middleware';
import { ErrorCodes } from '../../common/errors';
import { notifyUser } from '../notifications/notifications.service';

export const cooksnapUpload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
});

const reviewSchema = z.object({
  rating: z
    .number()
    .int('Số sao phải là số nguyên')
    .min(1, 'Đánh giá tối thiểu 1 sao')
    .max(5, 'Đánh giá tối đa 5 sao'),
  comment: z.string().trim().max(1000, 'Nhận xét tối đa 1000 ký tự').optional(),
});

const recalculateRecipeRating = async (
  tx: Prisma.TransactionClient,
  recipeId: string,
): Promise<number> => {
  const agg = await tx.review.aggregate({
    where: { recipeId },
    _avg: { rating: true },
  });

  const avg = agg._avg.rating ? Number(agg._avg.rating.toFixed(2)) : 0;

  await tx.recipe.update({
    where: { id: recipeId },
    data: { averageRating: avg },
  });

  return avg;
};

// ==================== NEWS FEED ====================

/**
 * SQL Builder cho bài toán [DB] Query News Feed
 * Cho phép truy vấn danh sách món ăn từ các đầu bếp đang theo dõi bằng raw SQL tối ưu.
 */
export const queryNewsFeedSQL = (
  followerId: string,
  limit: number = 10,
  offset: number = 0,
) => {
  return Prisma.sql`
    SELECT 
      r.id,
      r.title,
      r.description,
      r.thumbnail_url AS "thumbnailUrl",
      r.servings,
      r.cooking_time AS "cookingTime",
      r.avg_rating AS "averageRating",
      r.created_at AS "createdAt",
      u.id AS "authorId",
      u.full_name AS "authorFullName",
      u.nickname AS "authorNickname",
      u.avatar_url AS "authorAvatarUrl",
      c.id AS "categoryId",
      c.name AS "categoryName",
      c.slug AS "categorySlug"
    FROM recipes r
    JOIN follows f ON f.following_id = r.author_id
    JOIN users u ON u.id = r.author_id
    LEFT JOIN categories c ON c.id = r.category_id
    WHERE f.follower_id = ${followerId}
    ORDER BY r.created_at DESC
    LIMIT ${limit} OFFSET ${offset};
  `;
};

// GET /api/v1/social/feed (hoặc /api/v1/social/news-feed)
// Query params: page=1&limit=10&scope=following (hoặc all)
export const getNewsFeed = async (req: AuthRequest, res: Response) => {
  const currentUserId = req.user?.id;
  if (!currentUserId) {
    return res.status(401).json({
      success: false,
      errorCode: ErrorCodes.AUTH_TOKEN_MISSING,
      message: 'Vui lòng đăng nhập để xem bảng tin News Feed.',
    });
  }

  const page = Math.max(1, parseInt(String(req.query.page || '1'), 10) || 1);
  const limit = Math.min(
    50,
    Math.max(1, parseInt(String(req.query.limit || '10'), 10) || 10),
  );
  const skip = (page - 1) * limit;
  const scope = String(req.query.scope || 'following').toLowerCase();

  // lấy danh sách ID các tác giả mà user hiện tại đang theo dõi
  const followingList = await prisma.follow.findMany({
    where: { followerId: currentUserId },
    select: { followingId: true },
  });

  const followingIds = followingList.map((f) => f.followingId);

  // xác định điều kiện WHERE
  // Nếu scope=following mà chưa theo dõi ai, ta đánh dấu isFollowingEmpty=true
  // và gợi ý các món mới nhất/phổ biến nhất của cộng đồng để không bị trống màn hình
  const isFollowingEmpty = followingIds.length === 0;
  let where: Prisma.RecipeWhereInput = {};

  if (scope === 'following' && !isFollowingEmpty) {
    where = { authorId: { in: followingIds } };
  }

  // truy vấn danh sách bài viết
  const [recipes, total] = await Promise.all([
    prisma.recipe.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      skip,
      take: limit,
      include: {
        author: {
          select: {
            id: true,
            nickname: true,
            fullName: true,
            avatarUrl: true,
            bio: true,
          },
        },
        category: {
          select: {
            id: true,
            name: true,
            slug: true,
            iconUrl: true,
          },
        },
        dietaryTags: {
          include: {
            dietaryRegime: {
              select: { id: true, name: true, slug: true },
            },
          },
        },
        cooksnaps: {
          take: 1,
          orderBy: { createdAt: 'desc' },
          select: {
            id: true,
            imageUrl: true,
            caption: true,
            user: {
              select: { id: true, nickname: true, fullName: true, avatarUrl: true },
            },
          },
        },
        _count: {
          select: {
            reviews: true,
            cooksnaps: true,
            favoritedBy: true,
          },
        },
      },
    }),
    prisma.recipe.count({ where }),
  ]);

  // batch query kiểm tra trạng thái yêu thích
  let favoritedSet = new Set<string>();
  if (recipes.length > 0) {
    const favs = await prisma.favoriteRecipe.findMany({
      where: {
        userId: currentUserId,
        recipeId: { in: recipes.map((r) => r.id) },
      },
      select: { recipeId: true },
    });
    favoritedSet = new Set(favs.map((f) => f.recipeId));
  }

  const totalPages = Math.ceil(total / limit);

  return res.status(200).json({
    success: true,
    message:
      isFollowingEmpty && scope === 'following'
        ? 'Bạn chưa theo dõi đầu bếp nào. Dưới đây là gợi ý các món ăn mới nhất từ cộng đồng.'
        : 'Lấy bảng tin News Feed thành công.',
    data: {
      isFollowingEmpty,
      items: recipes.map((r) => ({
        id: r.id,
        title: r.title,
        description: r.description,
        thumbnailUrl: r.thumbnailUrl,
        servings: r.servings,
        cookingTime: r.cookingTime,
        averageRating: r.averageRating,
        isFavorited: favoritedSet.has(r.id),
        author: r.author,
        category: r.category,
        dietaryTags: r.dietaryTags.map((t) => t.dietaryRegime),
        stats: {
          reviewsCount: r._count.reviews,
          cooksnapsCount: r._count.cooksnaps,
          favoritesCount: r._count.favoritedBy,
        },
        latestCooksnap: r.cooksnaps[0] ?? null,
        createdAt: r.createdAt,
      })),
      pagination: {
        page,
        limit,
        total,
        totalPages,
        hasNextPage: page < totalPages,
        hasPrevPage: page > 1,
      },
    },
  });
};

// ==================== FOLLOW ====================

// POST /api/v1/social/users/:userId/follow
export const followUser = async (req: AuthRequest, res: Response) => {
  const followerId = req.user!.id;
  const followingId = String(req.params.userId);

  if (followerId === followingId) {
    return res.status(400).json({
      success: false,
      errorCode: ErrorCodes.CANNOT_FOLLOW_SELF,
      message: 'Bạn không thể tự theo dõi chính mình.',
    });
  }

  const targetUser = await prisma.user.findUnique({
    where: { id: followingId },
    select: { id: true, fullName: true, nickname: true },
  });

  if (!targetUser) {
    return res.status(404).json({
      success: false,
      errorCode: ErrorCodes.USER_NOT_FOUND,
      message: 'Người dùng không tồn tại.',
    });
  }

  const existing = await prisma.follow.findUnique({
    where: {
      followerId_followingId: { followerId, followingId },
    },
  });

  if (existing) {
    return res.status(409).json({
      success: false,
      errorCode: ErrorCodes.ALREADY_FOLLOWING,
      message: 'Bạn đã theo dõi người dùng này rồi.',
    });
  }

  await prisma.follow.create({
    data: { followerId, followingId },
  });

  const actor = await prisma.user.findUnique({
    where: { id: followerId },
    select: { fullName: true, nickname: true },
  });

  const actorName = actor?.nickname || actor?.fullName || 'Một người dùng';

  // Bắn Push Notification bất đồng bộ
  void notifyUser({
    recipientId: followingId,
    actorId: followerId,
    type: 'NEW_FOLLOWER',
    title: 'Người theo dõi mới',
    body: `${actorName} vừa bắt đầu theo dõi bạn.`,
    data: { followerId },
  });

  return res.status(201).json({
    success: true,
    message: 'Đã theo dõi người dùng thành công.',
    data: { followerId, followingId, isFollowing: true },
  });
};

// DELETE /api/v1/social/users/:userId/follow
export const unfollowUser = async (req: AuthRequest, res: Response) => {
  const followerId = req.user!.id;
  const followingId = String(req.params.userId);

  const existing = await prisma.follow.findUnique({
    where: {
      followerId_followingId: { followerId, followingId },
    },
  });

  if (!existing) {
    return res.status(404).json({
      success: false,
      errorCode: ErrorCodes.NOT_FOLLOWING,
      message: 'Bạn chưa theo dõi người dùng này.',
    });
  }

  await prisma.follow.delete({
    where: {
      followerId_followingId: { followerId, followingId },
    },
  });

  return res.status(200).json({
    success: true,
    message: 'Đã hủy theo dõi người dùng.',
    data: { followerId, followingId, isFollowing: false },
  });
};

// GET /api/v1/social/users/:userId/followers?page=1&limit=20
export const getFollowers = async (req: AuthRequest, res: Response) => {
  const userId = String(req.params.userId);
  const page = Math.max(1, parseInt(String(req.query.page || '1'), 10) || 1);
  const limit = Math.min(
    50,
    Math.max(1, parseInt(String(req.query.limit || '20'), 10) || 20),
  );
  const skip = (page - 1) * limit;

  const [rows, total] = await Promise.all([
    prisma.follow.findMany({
      where: { followingId: userId },
      include: {
        follower: {
          select: { id: true, nickname: true, fullName: true, avatarUrl: true, bio: true },
        },
      },
      orderBy: { createdAt: 'desc' },
      skip,
      take: limit,
    }),
    prisma.follow.count({ where: { followingId: userId } }),
  ]);

  return res.status(200).json({
    success: true,
    message: 'Lấy danh sách người theo dõi thành công.',
    data: {
      items: rows.map((r) => ({
        ...r.follower,
        followedAt: r.createdAt,
      })),
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
    },
  });
};

// GET /api/v1/social/users/:userId/following?page=1&limit=20
export const getFollowing = async (req: AuthRequest, res: Response) => {
  const userId = String(req.params.userId);
  const page = Math.max(1, parseInt(String(req.query.page || '1'), 10) || 1);
  const limit = Math.min(
    50,
    Math.max(1, parseInt(String(req.query.limit || '20'), 10) || 20),
  );
  const skip = (page - 1) * limit;

  const [rows, total] = await Promise.all([
    prisma.follow.findMany({
      where: { followerId: userId },
      include: {
        following: {
          select: { id: true, nickname: true, fullName: true, avatarUrl: true, bio: true },
        },
      },
      orderBy: { createdAt: 'desc' },
      skip,
      take: limit,
    }),
    prisma.follow.count({ where: { followerId: userId } }),
  ]);

  return res.status(200).json({
    success: true,
    message: 'Lấy danh sách đang theo dõi thành công.',
    data: {
      items: rows.map((r) => ({
        ...r.following,
        followedAt: r.createdAt,
      })),
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
    },
  });
};

// ==================== REVIEWS ====================

// GET /api/v1/social/recipes/:recipeId/reviews?page=1&limit=10
export const getRecipeReviews = async (req: AuthRequest, res: Response) => {
  const recipeId = String(req.params.recipeId);
  const page = Math.max(1, parseInt(String(req.query.page || '1'), 10) || 1);
  const limit = Math.min(
    50,
    Math.max(1, parseInt(String(req.query.limit || '10'), 10) || 10),
  );
  const skip = (page - 1) * limit;

  const recipe = await prisma.recipe.findUnique({
    where: { id: recipeId },
    select: { id: true, averageRating: true },
  });

  if (!recipe) {
    return res.status(404).json({
      success: false,
      errorCode: ErrorCodes.RECIPE_NOT_FOUND,
      message: 'Công thức không tồn tại.',
    });
  }

  const [items, total] = await Promise.all([
    prisma.review.findMany({
      where: { recipeId },
      include: {
        user: {
          select: { id: true, nickname: true, fullName: true, avatarUrl: true },
        },
      },
      orderBy: { createdAt: 'desc' },
      skip,
      take: limit,
    }),
    prisma.review.count({ where: { recipeId } }),
  ]);

  return res.status(200).json({
    success: true,
    message: 'Lấy danh sách đánh giá thành công.',
    data: {
      averageRating: recipe.averageRating,
      items,
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
    },
  });
};

// POST /api/v1/social/recipes/:recipeId/reviews
export const createRecipeReview = async (req: AuthRequest, res: Response) => {
  const parsed = reviewSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({
      success: false,
      errorCode: ErrorCodes.INVALID_RATING_SCORE,
      message: parsed.error.errors[0].message,
    });
  }

  const userId = req.user!.id;
  const recipeId = String(req.params.recipeId);
  const { rating, comment } = parsed.data;

  const recipe = await prisma.recipe.findUnique({
    where: { id: recipeId },
    select: { id: true, title: true, authorId: true },
  });

  if (!recipe) {
    return res.status(404).json({
      success: false,
      errorCode: ErrorCodes.RECIPE_NOT_FOUND,
      message: 'Công thức không tồn tại.',
    });
  }

  const existing = await prisma.review.findUnique({
    where: { recipeId_userId: { recipeId, userId } },
  });

  if (existing) {
    return res.status(409).json({
      success: false,
      errorCode: ErrorCodes.ALREADY_REVIEWED,
      message: 'Bạn đã đánh giá công thức này rồi. Hãy dùng tính năng chỉnh sửa.',
    });
  }

  const { review, averageRating } = await prisma.$transaction(async (tx) => {
    const created = await tx.review.create({
      data: {
        recipeId,
        userId,
        rating,
        comment: comment ?? null,
      },
      include: {
        user: {
          select: { id: true, nickname: true, fullName: true, avatarUrl: true },
        },
      },
    });

    const avg = await recalculateRecipeRating(tx, recipeId);
    return { review: created, averageRating: avg };
  });

  const actorName = review.user.nickname || review.user.fullName;

  void notifyUser({
    recipientId: recipe.authorId,
    actorId: userId,
    type: 'NEW_REVIEW',
    title: 'Đánh giá mới cho công thức của bạn',
    body: `${actorName} đã đánh giá ${rating}⭐ cho món "${recipe.title}".`,
    data: { recipeId, reviewId: review.id },
  });

  return res.status(201).json({
    success: true,
    message: 'Gửi đánh giá thành công.',
    data: { review, averageRating },
  });
};

// PUT /api/v1/social/recipes/:recipeId/reviews/:reviewId
export const updateRecipeReview = async (req: AuthRequest, res: Response) => {
  const parsed = reviewSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({
      success: false,
      errorCode: ErrorCodes.INVALID_RATING_SCORE,
      message: parsed.error.errors[0].message,
    });
  }

  const userId = req.user!.id;
  const recipeId = String(req.params.recipeId);
  const reviewId = String(req.params.reviewId);

  const existing = await prisma.review.findFirst({
    where: { id: reviewId, recipeId },
  });

  if (!existing) {
    return res.status(404).json({
      success: false,
      errorCode: ErrorCodes.REVIEW_NOT_FOUND,
      message: 'Đánh giá không tồn tại.',
    });
  }

  if (existing.userId !== userId) {
    return res.status(403).json({
      success: false,
      errorCode: ErrorCodes.FORBIDDEN_RESOURCE,
      message: 'Bạn không có quyền chỉnh sửa đánh giá này.',
    });
  }

  const { review, averageRating } = await prisma.$transaction(async (tx) => {
    const updated = await tx.review.update({
      where: { id: reviewId },
      data: {
        rating: parsed.data.rating,
        comment: parsed.data.comment ?? null,
      },
      include: {
        user: {
          select: { id: true, nickname: true, fullName: true, avatarUrl: true },
        },
      },
    });

    const avg = await recalculateRecipeRating(tx, recipeId);
    return { review: updated, averageRating: avg };
  });

  return res.status(200).json({
    success: true,
    message: 'Cập nhật đánh giá thành công.',
    data: { review, averageRating },
  });
};

// DELETE /api/v1/social/recipes/:recipeId/reviews/:reviewId
export const deleteRecipeReview = async (req: AuthRequest, res: Response) => {
  const userId = req.user!.id;
  const userRole = req.user!.role;
  const recipeId = String(req.params.recipeId);
  const reviewId = String(req.params.reviewId);

  const existing = await prisma.review.findFirst({
    where: { id: reviewId, recipeId },
  });

  if (!existing) {
    return res.status(404).json({
      success: false,
      errorCode: ErrorCodes.REVIEW_NOT_FOUND,
      message: 'Đánh giá không tồn tại.',
    });
  }

  if (existing.userId !== userId && userRole !== 'ADMIN') {
    return res.status(403).json({
      success: false,
      errorCode: ErrorCodes.FORBIDDEN_RESOURCE,
      message: 'Bạn không có quyền xóa đánh giá này.',
    });
  }

  const averageRating = await prisma.$transaction(async (tx) => {
    await tx.review.delete({ where: { id: reviewId } });
    return recalculateRecipeRating(tx, recipeId);
  });

  return res.status(200).json({
    success: true,
    message: 'Đã xóa đánh giá.',
    data: { averageRating },
  });
};

// ==================== COOKSNAPS ====================

// GET /api/v1/social/recipes/:recipeId/cooksnaps?page=1&limit=12
export const getRecipeCooksnaps = async (req: AuthRequest, res: Response) => {
  const recipeId = String(req.params.recipeId);
  const page = Math.max(1, parseInt(String(req.query.page || '1'), 10) || 1);
  const limit = Math.min(
    50,
    Math.max(1, parseInt(String(req.query.limit || '12'), 10) || 12),
  );
  const skip = (page - 1) * limit;

  const recipe = await prisma.recipe.findUnique({
    where: { id: recipeId },
    select: { id: true },
  });

  if (!recipe) {
    return res.status(404).json({
      success: false,
      errorCode: ErrorCodes.RECIPE_NOT_FOUND,
      message: 'Công thức không tồn tại.',
    });
  }

  const [items, total] = await Promise.all([
    prisma.cooksnap.findMany({
      where: { recipeId },
      include: {
        user: {
          select: { id: true, nickname: true, fullName: true, avatarUrl: true },
        },
      },
      orderBy: { createdAt: 'desc' },
      skip,
      take: limit,
    }),
    prisma.cooksnap.count({ where: { recipeId } }),
  ]);

  return res.status(200).json({
    success: true,
    message: 'Lấy danh sách Cooksnap thành công.',
    data: {
      items,
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
    },
  });
};

// POST /api/v1/social/recipes/:recipeId/cooksnaps
// Multipart Form-Data: field "image" + optional "caption"
export const createCooksnap = async (req: AuthRequest, res: Response) => {
  const userId = req.user!.id;
  const recipeId = String(req.params.recipeId);
  const caption = req.body?.caption ? String(req.body.caption).trim() : null;

  if (caption && caption.length > 500) {
    return res.status(400).json({
      success: false,
      errorCode: ErrorCodes.VALIDATION_ERROR,
      message: 'Chú thích Cooksnap tối đa 500 ký tự.',
    });
  }

  const recipe = await prisma.recipe.findUnique({
    where: { id: recipeId },
    select: { id: true, title: true, authorId: true },
  });

  if (!recipe) {
    return res.status(404).json({
      success: false,
      errorCode: ErrorCodes.RECIPE_NOT_FOUND,
      message: 'Công thức không tồn tại.',
    });
  }

  let imageUrl = req.body?.imageUrl ? String(req.body.imageUrl).trim() : '';

  if (req.file) {
    if (!isStorageConfigured()) {
      return res.status(503).json({
        success: false,
        message: 'Chức năng upload ảnh hiện chưa được cấu hình.',
      });
    }

    const allowedMimeTypes = ['image/jpeg', 'image/png', 'image/webp'];
    if (!allowedMimeTypes.includes(req.file.mimetype)) {
      return res.status(400).json({
        success: false,
        errorCode: ErrorCodes.INVALID_FILE_TYPE,
        message: 'Chỉ chấp nhận định dạng ảnh JPG, PNG hoặc WEBP.',
      });
    }

    const publicId = `${userId}_${Date.now()}`;
    imageUrl = await uploadImage(req.file.buffer, {
      folder: `cooksnaps/${recipeId}`,
      publicId,
    });
  }

  if (!imageUrl) {
    return res.status(400).json({
      success: false,
      errorCode: ErrorCodes.FILE_REQUIRED,
      message: 'Vui lòng đính kèm file ảnh thành phẩm trong trường "image".',
    });
  }

  const cooksnap = await prisma.cooksnap.create({
    data: {
      recipeId,
      userId,
      imageUrl,
      caption,
    },
    include: {
      user: {
        select: { id: true, nickname: true, fullName: true, avatarUrl: true },
      },
    },
  });

  const actorName = cooksnap.user.nickname || cooksnap.user.fullName;

  void notifyUser({
    recipientId: recipe.authorId,
    actorId: userId,
    type: 'NEW_COOKSNAP',
    title: 'Có ảnh thành phẩm Cooksnap mới!',
    body: `${actorName} vừa khoe ảnh nấu thành công món "${recipe.title}".`,
    data: { recipeId, cooksnapId: cooksnap.id },
  });

  return res.status(201).json({
    success: true,
    message: 'Đăng ảnh Cooksnap thành công.',
    data: cooksnap,
  });
};

// DELETE /api/v1/social/cooksnaps/:cooksnapId
export const deleteCooksnap = async (req: AuthRequest, res: Response) => {
  const userId = req.user!.id;
  const userRole = req.user!.role;
  const cooksnapId = String(req.params.cooksnapId);

  const existing = await prisma.cooksnap.findUnique({
    where: { id: cooksnapId },
    include: { recipe: { select: { authorId: true } } },
  });

  if (!existing) {
    return res.status(404).json({
      success: false,
      errorCode: ErrorCodes.COOKSNAP_NOT_FOUND,
      message: 'Cooksnap không tồn tại.',
    });
  }

  const canDelete =
    existing.userId === userId ||
    existing.recipe.authorId === userId ||
    userRole === 'ADMIN';

  if (!canDelete) {
    return res.status(403).json({
      success: false,
      errorCode: ErrorCodes.FORBIDDEN_RESOURCE,
      message: 'Bạn không có quyền xóa ảnh Cooksnap này.',
    });
  }

  await prisma.cooksnap.delete({ where: { id: cooksnapId } });

  return res.status(200).json({
    success: true,
    message: 'Đã xóa ảnh Cooksnap.',
  });
};