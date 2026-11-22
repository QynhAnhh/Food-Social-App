import { Response } from 'express';
import { AuthRequest } from '../../common/middlewares/auth.middleware';
import {
  addRecipeToShoppingList,
  addCustomIngredientToShoppingList,
  getShoppingList,
  toggleShoppingItemBought,
  updateShoppingItemQuantity,
  removeShoppingListItem,
  removeRecipeFromShoppingList,
  clearShoppingList,
} from './shopping-list.service';
import { ErrorCodes } from '../../common/errors';

export const addRecipeToCart = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user!.id;
    const recipeId = String(req.params.recipeId);
    const servingsMultiplier = req.body.servingsMultiplier
      ? Number(req.body.servingsMultiplier)
      : 1;

    const result = await addRecipeToShoppingList({
      userId,
      recipeId,
      servingsMultiplier,
    });

    return res.status(200).json({
      success: true,
      ...result,
    });
  } catch (error: any) {
    console.error('Loi them cong thuc vao gio di cho:', error);
    return res.status(error.statusCode || 500).json({
      success: false,
      errorCode: error.errorCode || ErrorCodes.INTERNAL_SERVER_ERROR,
      message: error.message || 'Đã có lỗi xảy ra khi thêm nguyên liệu vào giỏ đi chợ.',
    });
  }
};

export const addCustomItem = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user!.id;
    const ingredientId = Number(req.body.ingredientId);
    const quantity = Number(req.body.quantity);

    if (!ingredientId || isNaN(ingredientId)) {
      return res.status(400).json({
        success: false,
        errorCode: ErrorCodes.VALIDATION_ERROR,
        message: 'Mã nguyên liệu không hợp lệ.',
      });
    }

    if (!quantity || isNaN(quantity) || quantity <= 0) {
      return res.status(400).json({
        success: false,
        errorCode: ErrorCodes.INVALID_INPUT,
        message: 'Định lượng phải lớn hơn 0.',
      });
    }

    const result = await addCustomIngredientToShoppingList(userId, ingredientId, quantity);

    return res.status(201).json({
      success: true,
      ...result,
    });
  } catch (error: any) {
    console.error('Loi khi them nguyen lieu tuy chinh vao gio:', error);
    return res.status(error.statusCode || 500).json({
      success: false,
      errorCode: error.errorCode || ErrorCodes.INTERNAL_SERVER_ERROR,
      message: error.message || 'Đã có lỗi xảy ra khi thêm nguyên liệu.',
    });
  }
};

export const getUserShoppingList = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user!.id;
    const result = await getShoppingList(userId);

    return res.status(200).json({
      success: true,
      message: 'Lấy danh sách đi chợ thành công.',
      data: result,
    });
  } catch (error: any) {
    console.error('Loi lay danh sach gio di cho:', error);
    return res.status(error.statusCode || 500).json({
      success: false,
      errorCode: error.errorCode || ErrorCodes.INTERNAL_SERVER_ERROR,
      message: error.message || 'Đã có lỗi xảy ra khi lấy danh sách đi chợ.',
    });
  }
};

export const toggleItem = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user!.id;
    const itemId = String(req.params.id);
    const isPurchased = req.body.isPurchased !== undefined
      ? Boolean(req.body.isPurchased)
      : (req.body.isBought !== undefined ? Boolean(req.body.isBought) : undefined);

    const result = await toggleShoppingItemBought(userId, itemId, isPurchased);

    return res.status(200).json({
      success: true,
      message: 'Cập nhật trạng thái mua thành công.',
      data: result,
    });
  } catch (error: any) {
    console.error('Loi danh dau trang thai nguyen lieu trong gio:', error);
    return res.status(error.statusCode || 500).json({
      success: false,
      errorCode: error.errorCode || ErrorCodes.INTERNAL_SERVER_ERROR,
      message: error.message || 'Đã có lỗi xảy ra khi cập nhật trạng thái.',
    });
  }
};

export const updateItemQty = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user!.id;
    const itemId = String(req.params.id);
    const totalQuantity = Number(req.body.totalQuantity);

    if (isNaN(totalQuantity) || totalQuantity <= 0) {
      return res.status(400).json({
        success: false,
        errorCode: ErrorCodes.INVALID_INPUT,
        message: 'Định lượng (totalQuantity) phải lớn hơn 0.',
      });
    }

    const result = await updateShoppingItemQuantity(userId, itemId, totalQuantity);

    return res.status(200).json({
      success: true,
      message: 'Cập nhật định lượng thành công.',
      data: result,
    });
  } catch (error: any) {
    console.error('Loi cap nhat so luong nguyen lieu trong gio:', error);
    return res.status(error.statusCode || 500).json({
      success: false,
      errorCode: error.errorCode || ErrorCodes.INTERNAL_SERVER_ERROR,
      message: error.message || 'Đã có lỗi xảy ra khi cập nhật định lượng.',
    });
  }
};

export const deleteItem = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user!.id;
    const itemId = String(req.params.id);

    const result = await removeShoppingListItem(userId, itemId);

    return res.status(200).json({
      success: true,
      ...result,
    });
  } catch (error: any) {
    console.error('Loi xoa nguyen lieu khoi gio di cho:', error);
    return res.status(error.statusCode || 500).json({
      success: false,
      errorCode: error.errorCode || ErrorCodes.INTERNAL_SERVER_ERROR,
      message: error.message || 'Đã có lỗi xảy ra khi xóa nguyên liệu.',
    });
  }
};

export const deleteRecipeContribution = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user!.id;
    const recipeId = String(req.params.recipeId);

    const result = await removeRecipeFromShoppingList(userId, recipeId);

    return res.status(200).json({
      success: true,
      ...result,
    });
  } catch (error: any) {
    console.error('Loi xoa dong gop cua cong thuc khoi gio di cho:', error);
    return res.status(error.statusCode || 500).json({
      success: false,
      errorCode: error.errorCode || ErrorCodes.INTERNAL_SERVER_ERROR,
      message: error.message || 'Đã có lỗi xảy ra khi hoàn trả định lượng công thức.',
    });
  }
};

export const clearCart = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user!.id;
    const result = await clearShoppingList(userId);

    return res.status(200).json({
      success: true,
      ...result,
    });
  } catch (error: any) {
    console.error('Loi lam sach gio di cho:', error);
    return res.status(error.statusCode || 500).json({
      success: false,
      errorCode: error.errorCode || ErrorCodes.INTERNAL_SERVER_ERROR,
      message: error.message || 'Đã có lỗi xảy ra khi dọn sạch giỏ đi chợ.',
    });
  }
};
