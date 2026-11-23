import { Request, Response } from 'express';
import { prisma } from '../../config/prisma';

// get /api/v1/categories - lấy toàn bộ danh mục món ăn chuẩn
export const getCategories = async (_req: Request, res: Response) => {
  const categories = await prisma.category.findMany({
    orderBy: { id: 'asc' },
  });

  return res.status(200).json({
    success: true,
    message: 'Lấy danh mục thành công',
    data: categories.map((cat) => ({
      id: cat.id,
      name: cat.name,
      slug: cat.slug,
      iconUrl: cat.iconUrl,
    })),
  });
};

// get /api/v1/dietary-regimes - lấy danh sách các chế độ ăn kiêng tiêu chuẩn
export const getDietaryRegimes = async (_req: Request, res: Response) => {
  const regimes = await prisma.dietaryRegime.findMany({
    orderBy: { id: 'asc' },
  });

  return res.status(200).json({
    success: true,
    message: 'Lấy danh sách chế độ ăn thành công',
    data: regimes.map((r) => ({
      id: r.id,
      name: r.name,
      slug: r.slug,
      description: r.description,
    })),
  });
};

// get /api/v1/ingredients - tìm kiếm hoặc tải danh sách nguyên liệu chuẩn từ từ điển
export const getIngredients = async (req: Request, res: Response) => {
  const q = String(req.query.q || req.query.query || '').trim();
  const isAllergenCommonParam = req.query.isAllergenCommon;
  const limit = Math.min(Math.max(Number(req.query.limit) || 50, 1), 200);

  const where: any = {};

  if (q) {
    where.name = {
      contains: q,
      mode: 'insensitive',
    };
  }

  if (isAllergenCommonParam !== undefined) {
    where.isAllergenCommon = String(isAllergenCommonParam).toLowerCase() === 'true';
  }

  const ingredients = await prisma.ingredient.findMany({
    where,
    take: limit,
    orderBy: { id: 'asc' },
  });

  return res.status(200).json({
    success: true,
    message: 'Tìm kiếm nguyên liệu thành công',
    data: ingredients.map((ing) => ({
      id: ing.id,
      name: ing.name,
      standardUnit: ing.standardUnit,
      imageUrl: ing.imageUrl,
      isAllergenCommon: ing.isAllergenCommon,
    })),
  });
};
