import { ErrorCode, ErrorCodes } from './error-codes';

/**
 * Lớp lỗi cơ sở dùng chung toàn hệ thống (AppError)
 * Tuân thủ theo mục 3.1 của docs/conventions/error-handling-codes.md
 */
export class AppError extends Error {
  constructor(
    public readonly statusCode: number,
    public readonly errorCode: ErrorCode | string,
    message: string,
    public readonly details: any[] = [],
  ) {
    super(message);
    this.name = this.constructor.name;
    Object.setPrototypeOf(this, new.target.prototype);
  }
}

/**
 * Lỗi dữ liệu yêu cầu không hợp lệ (HTTP 400 Bad Request)
 */
export class BadRequestError extends AppError {
  constructor(
    message: string = 'Yêu cầu không hợp lệ.',
    errorCode: ErrorCode | string = ErrorCodes.INVALID_INPUT,
    details: any[] = [],
  ) {
    super(400, errorCode, message, details);
  }
}

/**
 * Lỗi chưa xác thực (HTTP 401 Unauthorized)
 */
export class UnauthorizedError extends AppError {
  constructor(
    message: string = 'Vui lòng đăng nhập để tiếp tục.',
    errorCode: ErrorCode | string = ErrorCodes.AUTH_TOKEN_MISSING,
  ) {
    super(401, errorCode, message);
  }
}

/**
 * Lỗi không có quyền truy cập (HTTP 403 Forbidden)
 */
export class ForbiddenError extends AppError {
  constructor(
    message: string = 'Bạn không có quyền truy cập tài nguyên này.',
    errorCode: ErrorCode | string = ErrorCodes.FORBIDDEN_RESOURCE,
  ) {
    super(403, errorCode, message);
  }
}

/**
 * Lỗi không tìm thấy tài nguyên (HTTP 404 Not Found)
 */
export class NotFoundError extends AppError {
  constructor(
    message: string = 'Không tìm thấy tài nguyên yêu cầu.',
    errorCode: ErrorCode | string = ErrorCodes.USER_NOT_FOUND,
  ) {
    super(404, errorCode, message);
  }
}

/**
 * Lỗi xung đột dữ liệu (HTTP 409 Conflict)
 */
export class ConflictError extends AppError {
  constructor(
    message: string = 'Dữ liệu đã tồn tại hoặc xảy ra xung đột.',
    errorCode: ErrorCode | string = ErrorCodes.DUPLICATE_NICKNAME,
  ) {
    super(409, errorCode, message);
  }
}

/**
 * Lỗi kiểm duyệt dữ liệu (HTTP 422 Unprocessable Entity hoặc 400 Validation)
 */
export class ValidationError extends AppError {
  constructor(
    message: string = 'Dữ liệu gửi lên không đúng định dạng.',
    details: any[] = [],
    statusCode: number = 422,
  ) {
    super(statusCode, ErrorCodes.VALIDATION_ERROR, message, details);
  }
}

/**
 * Lỗi máy chủ nội bộ (HTTP 500 Internal Server Error)
 */
export class InternalServerError extends AppError {
  constructor(
    message: string = 'Đã có lỗi xảy ra trên hệ thống, vui lòng thử lại sau.',
    errorCode: ErrorCode | string = ErrorCodes.INTERNAL_SERVER_ERROR,
  ) {
    super(500, errorCode, message);
  }
}

