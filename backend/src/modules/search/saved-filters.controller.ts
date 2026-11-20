import { Response } from 'express';
import { z } from 'zod';
import { prisma } from '../../config/prisma';
import { AuthRequest } from '../../common/middlewares/auth.middleware';
import { ErrorCodes } from '../../common/errors';

const savedFilterSchema = z.object({
  name: z.string().trim().min(1, 'Tên bộ lọc không được để trống').max(60),
  categoryId: z.number().int().positive().nullable().optional(),
  dietaryRegimeIds: z.array(z.number().int().positive()).optional().default([]),
  maxCookingTime: z.number().int().positive().nullable().optional(),
  minRating: z.number().min(0).max(5).nullable().optional(),
  excludeAllergies: z.boolean().optional().default(false),
  sortBy: z.enum(['newest', 'rating', 'cooking_time']).nullable().optional(),
  isDefault: z.boolean().optional().default(false),
});

const updateSavedFilterSchema = savedFilterSchema.partial();

// GET /api/v1/saved-filters
export const getSavedFilters = async (req: AuthRequest, res: Response) => {
  const userId = req.user!.id;

  const filters = await prisma.savedFilter.findMany({
    where: { userId },
    include: {
      category: {
        select: { id: true, name: true, slug: true },
      },
    },
    orderBy: [{ isDefault: 'desc' }, { updatedAt: 'desc' }],
  });

  return res.status(200).json({
    success: true,
    message: 'Lấy danh sách bộ lọc cá nhân thành công.',
    data: filters,
  });
};

// POST /api/v1/saved-filters
export const createSavedFilter = async (req: AuthRequest, res: Response) => {
  const parsed = savedFilterSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({
      success: false,
      errorCode: ErrorCodes.VALIDATION_ERROR,
      message: parsed.error.errors[0].message,
    });
  }

  const userId = req.user!.id;
  const data = parsed.data;

  if (data.categoryId) {
    const category = await prisma.category.findUnique({
      where: { id: data.categoryId },
    });
    if (!category) {
      return res.status(404).json({
        success: false,
        errorCode: ErrorCodes.CATEGORY_NOT_FOUND,
        message: 'Danh mục không tồn tại.',
      });
    }
  }

  const created = await prisma.$transaction(async (tx) => {
    if (data.isDefault) {
      await tx.savedFilter.updateMany({
        where: { userId, isDefault: true },
        data: { isDefault: false },
      });
    }

    return tx.savedFilter.create({
      data: {
        userId,
        name: data.name,
        categoryId: data.categoryId ?? null,
        dietaryRegimeIds: data.dietaryRegimeIds,
        maxCookingTime: data.maxCookingTime ?? null,
        minRating: data.minRating ?? null,
        excludeAllergies: data.excludeAllergies,
        sortBy: data.sortBy ?? null,
        isDefault: data.isDefault,
      },
      include: {
        category: { select: { id: true, name: true, slug: true } },
      },
    });
  });

  return res.status(201).json({
    success: true,
    message: 'Lưu bộ lọc cá nhân thành công.',
    data: created,
  });
};

// PUT /api/v1/saved-filters/:id
export const updateSavedFilter = async (req: AuthRequest, res: Response) => {
  const parsed = updateSavedFilterSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({
      success: false,
      errorCode: ErrorCodes.VALIDATION_ERROR,
      message: parsed.error.errors[0].message,
    });
  }

  const userId = req.user!.id;
  const filterId = String(req.params.id);

  const existing = await prisma.savedFilter.findFirst({
    where: { id: filterId, userId },
  });

  if (!existing) {
    return res.status(404).json({
      success: false,
      errorCode: ErrorCodes.SAVED_FILTER_NOT_FOUND,
      message: 'Bộ lọc không tồn tại.',
    });
  }

  const data = parsed.data;

  const updated = await prisma.$transaction(async (tx) => {
    if (data.isDefault === true) {
      await tx.savedFilter.updateMany({
        where: { userId, isDefault: true, NOT: { id: filterId } },
        data: { isDefault: false },
      });
    }

    return tx.savedFilter.update({
      where: { id: filterId },
      data,
      include: {
        category: { select: { id: true, name: true, slug: true } },
      },
    });
  });

  return res.status(200).json({
    success: true,
    message: 'Cập nhật bộ lọc thành công.',
    data: updated,
  });
};

// PATCH /api/v1/saved-filters/:id/default
export const setDefaultSavedFilter = async (
  req: AuthRequest,
  res: Response,
) => {
  const userId = req.user!.id;
  const filterId = String(req.params.id);

  const existing = await prisma.savedFilter.findFirst({
    where: { id: filterId, userId },
  });

  if (!existing) {
    return res.status(404).json({
      success: false,
      errorCode: ErrorCodes.SAVED_FILTER_NOT_FOUND,
      message: 'Bộ lọc không tồn tại.',
    });
  }

  const updated = await prisma.$transaction(async (tx) => {
    await tx.savedFilter.updateMany({
      where: { userId, isDefault: true },
      data: { isDefault: false },
    });

    return tx.savedFilter.update({
      where: { id: filterId },
      data: { isDefault: true },
      include: {
        category: { select: { id: true, name: true, slug: true } },
      },
    });
  });

  return res.status(200).json({
    success: true,
    message: 'Đã đặt bộ lọc làm mặc định.',
    data: updated,
  });
};

// DELETE /api/v1/saved-filters/:id
export const deleteSavedFilter = async (req: AuthRequest, res: Response) => {
  const userId = req.user!.id;
  const filterId = String(req.params.id);

  const existing = await prisma.savedFilter.findFirst({
    where: { id: filterId, userId },
  });

  if (!existing) {
    return res.status(404).json({
      success: false,
      errorCode: ErrorCodes.SAVED_FILTER_NOT_FOUND,
      message: 'Bộ lọc không tồn tại.',
    });
  }

  await prisma.savedFilter.delete({ where: { id: filterId } });

  return res.status(200).json({
    success: true,
    message: 'Đã xóa bộ lọc cá nhân.',
  });
};