import { PrismaClient } from '@prisma/client';
import { prisma as defaultPrisma } from '../../config/prisma';
import { AppError, ErrorCodes } from '../../common/errors';

export interface CreateSavedFilterInput {
  filterName: string;
  categoryId?: number | null;
  dietaryIds?: number[];
  excludedIngredientIds?: number[];
  maxCookingTime?: number | null;
  isDefault?: boolean;
}

export interface SavedFilterItem {
  id: string;
  userId: string;
  filterName: string;
  categoryId: number | null;
  dietaryIds: number[];
  excludedIngredientIds: number[];
  maxCookingTime: number | null;
  isDefault: boolean;
  category?: {
    id: number;
    name: string;
    slug: string;
  } | null;
  createdAt: Date;
}

/*
 * quản lý bộ lọc cá nhân
 */
export async function createSavedFilter(
  userId: string,
  data: CreateSavedFilterInput,
  prismaClient: PrismaClient = defaultPrisma as any,
): Promise<SavedFilterItem> {
  const db: any = prismaClient;
  const {
    filterName,
    categoryId,
    dietaryIds = [],
    excludedIngredientIds = [],
    maxCookingTime,
    isDefault = false,
  } = data;

  if (!filterName || !filterName.trim()) {
    throw new AppError(400, ErrorCodes.VALIDATION_ERROR, 'Tên bộ lọc không được để trống.');
  }

  // xác thực categoryId nếu có truyền
  if (categoryId) {
    const cat = await db.category.findUnique({ where: { id: categoryId } });
    if (!cat) {
      throw new AppError(404, ErrorCodes.CATEGORY_NOT_FOUND, 'Danh mục không tồn tại.');
    }
  }

  // xác thực các ID chế độ ăn kiêng nếu có truyền
  if (dietaryIds.length > 0) {
    const existingDietaries = await db.dietaryRegime.findMany({
      where: { id: { in: dietaryIds } },
      select: { id: true },
    });
    if (existingDietaries.length !== dietaryIds.length) {
      throw new AppError(404, ErrorCodes.DIETARY_REGIME_NOT_FOUND, 'Một hoặc nhiều chế độ ăn không tồn tại.');
    }
  }

  // nếu đặt làm bộ lọc mặc định, reset các bộ lọc mặc định cũ của user
  if (isDefault) {
    await db.savedFilter.updateMany({
      where: { userId, isDefault: true },
      data: { isDefault: false },
    });
  }

  // tạo bản ghi saved_filters mới
  const savedFilter = await db.savedFilter.create({
    data: {
      userId,
      filterName: filterName.trim(),
      categoryId: categoryId || null,
      dietaryIds,
      excludedIngredientIds,
      maxCookingTime: maxCookingTime || null,
      isDefault,
    },
    include: {
      category: {
        select: { id: true, name: true, slug: true },
      },
    },
  });

  return savedFilter;
}

/**
 * lấy danh sách bộ lọc đã lưu của người dùng 
 */
export async function getUserSavedFilters(
  userId: string,
  prismaClient: PrismaClient = defaultPrisma as any,
): Promise<SavedFilterItem[]> {
  const db: any = prismaClient;

  const filters = await db.savedFilter.findMany({
    where: { userId },
    orderBy: [
      { isDefault: 'desc' },
      { createdAt: 'desc' },
    ],
    include: {
      category: {
        select: { id: true, name: true, slug: true },
      },
    },
  });

  return filters;
}

/**
 * xóa một bộ lọc đã lưu
 */
export async function deleteSavedFilter(
  userId: string,
  filterId: string,
  prismaClient: PrismaClient = defaultPrisma as any,
): Promise<{ message: string }> {
  const db: any = prismaClient;

  const filter = await db.savedFilter.findFirst({
    where: { id: filterId, userId },
  });

  if (!filter) {
    throw new AppError(404, ErrorCodes.SAVED_FILTER_NOT_FOUND, 'Bộ lọc đã lưu không tồn tại.');
  }

  await db.savedFilter.delete({
    where: { id: filterId },
  });

  return { message: 'Đã xóa bộ lọc thành công.' };
}
