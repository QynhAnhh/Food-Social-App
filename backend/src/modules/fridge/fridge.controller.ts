
import { Response } from 'express';
import { z } from 'zod';
import { prisma } from '../../config/prisma';
import { AuthRequest } from '../../common/middlewares/auth.middleware';
import { matchFridgeRecipes } from './fridge.matching';

const addFridgeItemSchema = z.object({
  ingredientId: z.number().int().positive(),
  quantity: z.number().positive('Số lượng phải lớn hơn 0'),
  expiryDate: z.string().datetime().nullable().optional(),
});

const updateFridgeItemSchema = z.object({
  quantity: z.number().positive('Số lượng phải lớn hơn 0'),
  expiryDate: z.string().datetime().nullable().optional(),
});

// 1. GET /api/v1/fridge/items
// Lấy danh sách nguyên liệu trong tủ lạnh
export const getFridgeItems = async (
  req: AuthRequest,
  res: Response,
) => {
  const items = await prisma.userFridgeItem.findMany({
    where: { userId: req.user!.id },
    include: { ingredient: true },
    orderBy: { updatedAt: 'desc' },
  });

  return res.status(200).json({
    success: true,
    message: 'Lấy danh sách nguyên liệu tủ lạnh thành công.',
    data: items.map((item) => ({
      id: item.id,
      ingredientId: item.ingredientId,
      name: item.ingredient.name,
      quantity: item.quantity,
      unit: item.ingredient.standardUnit,
      imageUrl: item.ingredient.imageUrl,
      expiryDate: item.expiryDate,
      updatedAt: item.updatedAt,
    })),
  });
};

// 2. POST /api/v1/fridge/items
// Thêm hoặc cập nhật nguyên liệu trong tủ lạnh
export const addFridgeItem = async (
  req: AuthRequest,
  res: Response,
) => {
  const parsed = addFridgeItemSchema.safeParse(req.body);

  if (!parsed.success) {
    return res.status(400).json({
      success: false,
      errorCode: 'VALIDATION_ERROR',
      message: parsed.error.errors[0].message,
    });
  }

  const { ingredientId, quantity, expiryDate } = parsed.data;
  const userId = req.user!.id;

  const item = await prisma.userFridgeItem.upsert({
    where: {
      userId_ingredientId: { userId, ingredientId },
    },
    update: {
      quantity,
      expiryDate: expiryDate ? new Date(expiryDate) : null,
    },
    create: {
      userId,
      ingredientId,
      quantity,
      expiryDate: expiryDate ? new Date(expiryDate) : null,
    },
    include: { ingredient: true },
  });

  return res.status(201).json({
    success: true,
    message: 'Đã lưu nguyên liệu vào tủ lạnh.',
    data: {
      id: item.id,
      ingredientId: item.ingredientId,
      name: item.ingredient.name,
      quantity: item.quantity,
      unit: item.ingredient.standardUnit,
      expiryDate: item.expiryDate,
    },
  });
};

// 3. PUT /api/v1/fridge/items/:id
// Sửa định lượng và hạn sử dụng nguyên liệu
export const updateFridgeItem = async (
  req: AuthRequest,
  res: Response,
) => {
  const parsed = updateFridgeItemSchema.safeParse(req.body);

  if (!parsed.success) {
    return res.status(400).json({
      success: false,
      errorCode: 'VALIDATION_ERROR',
      message: parsed.error.errors[0].message,
    });
  }

  const itemId = String(req.params.id);

  const existing = await prisma.userFridgeItem.findFirst({
    where: {
      id: itemId,
      userId: req.user!.id,
    },
  });

  if (!existing) {
    return res.status(404).json({
      success: false,
      errorCode: 'FRIDGE_ITEM_NOT_FOUND',
      message: 'Không tìm thấy nguyên liệu này trong tủ lạnh của bạn.',
    });
  }

  const updated = await prisma.userFridgeItem.update({
    where: { id: itemId },
    data: {
      quantity: parsed.data.quantity,
      ...(parsed.data.expiryDate !== undefined && {
        expiryDate: parsed.data.expiryDate
          ? new Date(parsed.data.expiryDate)
          : null,
      }),
    },
    include: { ingredient: true },
  });

  return res.status(200).json({
    success: true,
    message: 'Cập nhật nguyên liệu thành công.',
    data: {
      id: updated.id,
      ingredientId: updated.ingredientId,
      name: updated.ingredient.name,
      quantity: updated.quantity,
      unit: updated.ingredient.standardUnit,
      expiryDate: updated.expiryDate,
    },
  });
};

// 4. DELETE /api/v1/fridge/items/:id
// Xóa nguyên liệu khỏi tủ lạnh
export const deleteFridgeItem = async (
  req: AuthRequest,
  res: Response,
) => {
  const itemId = String(req.params.id);

  const deleted = await prisma.userFridgeItem.deleteMany({
    where: {
      id: itemId,
      userId: req.user!.id,
    },
  });

  if (deleted.count === 0) {
    return res.status(404).json({
      success: false,
      errorCode: 'FRIDGE_ITEM_NOT_FOUND',
      message: 'Không tìm thấy nguyên liệu cần xóa.',
    });
  }

  return res.status(200).json({
    success: true,
    message: 'Đã xóa nguyên liệu khỏi tủ lạnh.',
    data: { id: itemId },
  });
};

// 5. GET /api/v1/fridge/recommendations
// Gợi ý công thức từ nguyên liệu trong tủ lạnh (Task FSA-23)
export const getFridgeRecommendations = async (
  req: AuthRequest,
  res: Response,
) => {
  const userId = req.user!.id;
  const result = await matchFridgeRecipes(userId, prisma);

  return res.status(200).json({
    success: true,
    message: result.message,
    data: result.data,
  });
};
