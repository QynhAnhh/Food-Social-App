import { Request, Response, NextFunction, ErrorRequestHandler } from 'express';
import { ZodError } from 'zod';
import { AppError } from '../errors/app-error';
import { ErrorCodes } from '../errors/error-codes';

/**
 * Middleware xử lý lỗi tập trung toàn hệ thống (Global Error Handler)
 * Tuân thủ theo mục 1 & 3.1 của docs/conventions/error-handling-codes.md
 */
export const errorHandler: ErrorRequestHandler = (
  err: any,
  _req: Request,
  res: Response,
  _next: NextFunction,
) => {
  // 1. Bắt lỗi từ Zod validation
  if (err instanceof ZodError) {
    const details = err.errors.map((e) => ({
      field: e.path.join('.'),
      issue: e.message,
    }));

    return res.status(400).json({
      success: false,
      errorCode: ErrorCodes.VALIDATION_ERROR,
      message: err.errors[0]?.message || 'Dữ liệu đầu vào không hợp lệ.',
      details,
      timestamp: new Date().toISOString(),
    });
  }

  // 2. Bắt lỗi nghiệp vụ AppError (và các lớp con)
  const statusCode = err.statusCode || 500;
  const errorCode = err.errorCode || ErrorCodes.INTERNAL_SERVER_ERROR;
  const message = err.message || 'Đã có lỗi xảy ra trên hệ thống.';
  const details = err.details || [];

  // Ghi log nếu là lỗi máy chủ nghiêm trọng (500)
  if (statusCode >= 500) {
    console.error('Unhandled Server Error:', err);
  }

  return res.status(statusCode).json({
    success: false,
    errorCode,
    message,
    details,
    timestamp: new Date().toISOString(),
  });
};

