import { Response } from 'express';
import { AuthRequest } from '../../common/middlewares/auth.middleware';
import {
  createSavedFilter,
  getUserSavedFilters,
  deleteSavedFilter,
} from './saved-filter.service';
import { ErrorCodes } from '../../common/errors';

export const saveFilter = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user!.id;
    const {
      filterName,
      name, // Hỗ trợ fallback nếu client gửi name
      categoryId,
      dietaryIds,
      excludedIngredientIds,
      maxCookingTime,
      isDefault,
    } = req.body;

    const filter = await createSavedFilter(userId, {
      filterName: filterName || name,
      categoryId,
      dietaryIds,
      excludedIngredientIds,
      maxCookingTime,
      isDefault,
    });

    return res.status(201).json({
      success: true,
      message: 'Lưu bộ lọc thành công.',
      data: filter,
    });
  } catch (error: any) {
    console.error('Loi luu bo loc:', error);
    return res.status(error.statusCode || 500).json({
      success: false,
      errorCode: error.errorCode || ErrorCodes.INTERNAL_SERVER_ERROR,
      message: error.message || 'Đã có lỗi xảy ra khi lưu bộ lọc.',
    });
  }
};

export const getSavedFilters = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user!.id;
    const filters = await getUserSavedFilters(userId);

    return res.status(200).json({
      success: true,
      message: 'Lấy danh sách bộ lọc đã lưu thành công.',
      data: filters,
    });
  } catch (error: any) {
    console.error('Loi lay danh sach bo loc da luu:', error);
    return res.status(error.statusCode || 500).json({
      success: false,
      errorCode: error.errorCode || ErrorCodes.INTERNAL_SERVER_ERROR,
      message: error.message || 'Đã có lỗi xảy ra khi lấy danh sách bộ lọc.',
    });
  }
};

export const deleteFilter = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user!.id;
    const filterId = String(req.params.id);

    const result = await deleteSavedFilter(userId, filterId);

    return res.status(200).json({
      success: true,
      ...result,
    });
  } catch (error: any) {
    console.error('Loi xoa bo loc da luu:', error);
    return res.status(error.statusCode || 500).json({
      success: false,
      errorCode: error.errorCode || ErrorCodes.INTERNAL_SERVER_ERROR,
      message: error.message || 'Đã có lỗi xảy ra khi xóa bộ lọc.',
    });
  }
};
