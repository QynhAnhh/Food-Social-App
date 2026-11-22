import {
  Request,
  Response,
  NextFunction,
  ErrorRequestHandler,
} from 'express';
import { ZodError } from 'zod';
import { Prisma } from '@prisma/client';
import { AppError } from '../errors/app-error';
import { ErrorCodes } from '../errors/error-codes';

export const errorHandler: ErrorRequestHandler = (
  err: unknown,
  _req: Request,
  res: Response,
  _next: NextFunction,
) => {
  // zod validation errors
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

  // application errors
  if (err instanceof AppError) {
    if (err.statusCode >= 500) {
      console.error('Unhandled Server Error:', err);
    }

    return res.status(err.statusCode).json({
      success: false,
      errorCode: err.errorCode,
      message: err.message,
      details: err.details,
      timestamp: new Date().toISOString(),
    });
  }

  // prisma known request errors
  if (err instanceof Prisma.PrismaClientKnownRequestError) {
    let statusCode = 500;
    let message = 'Đã có lỗi xảy ra trên hệ thống.';

    switch (err.code) {
      case 'P2002':
        statusCode = 409;
        message = 'Dữ liệu đã tồn tại.';
        break;

      case 'P2003':
        statusCode = 400;
        message = 'Dữ liệu tham chiếu không hợp lệ.';
        break;

      case 'P2025':
        statusCode = 404;
        message = 'Không tìm thấy dữ liệu cần thao tác.';
        break;
    }

    if (statusCode >= 500) {
      console.error('Unhandled Prisma Error:', err);
    }

    return res.status(statusCode).json({
      success: false,
      errorCode: ErrorCodes.INTERNAL_SERVER_ERROR,
      message,
      details: [],
      timestamp: new Date().toISOString(),
    });
  }

  // unknown errors
  console.error('Unhandled Server Error:', err);

  return res.status(500).json({
    success: false,
    errorCode: ErrorCodes.INTERNAL_SERVER_ERROR,
    message: 'Đã có lỗi xảy ra trên hệ thống.',
    details: [],
    timestamp: new Date().toISOString(),
  });
};
