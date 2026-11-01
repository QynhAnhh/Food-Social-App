# Quy Chuẩn Xử Lý Lỗi & Bảng Mã Lỗi Toàn Hệ Thống (Error Handling Conventions)

Tài liệu này định nghĩa cấu trúc phản hồi lỗi chuẩn và danh mục mã lỗi nghiệp vụ (`errorCode`) cho toàn bộ hệ sinh thái **Food Social App**. Mọi phản hồi lỗi từ Backend và các khối xử lý ngoại lệ trên Android Client phải tuân thủ nghiêm ngặt quy chuẩn này.

---

## 1. Cấu trúc phản hồi lỗi chuẩn (Standard Error Response Envelope)

Mọi phản hồi có mã trạng thái HTTP $\ge 400$ bắt buộc phải trả về định dạng JSON thống nhất như sau:

```json
{
  "success": false,
  "errorCode": "DUPLICATE_NICKNAME",
  "message": "Nickname này đã được sử dụng. Vui lòng chọn nickname khác.",
  "details": [
    {
      "field": "nickname",
      "issue": "Must be unique"
    }
  ],
  "timestamp": "2026-11-01T10:00:00.000Z"
}
```

### Giải thích các trường:
* **`success`** (`Boolean`): Luôn bằng `false`.
* **`errorCode`** (`String`): Chuỗi ký tự viết hoa ngăn cách bằng dấu gạch dưới (`SCREAMING_SNAKE_CASE`), đại diện cho loại lỗi nghiệp vụ cụ thể. Frontend sử dụng trường này để rẽ nhánh logic xử lý giao diện (`when (errorCode)`).
* **`message`** (`String`): Thông điệp mô tả lỗi thân thiện với người dùng (bằng tiếng Việt).
* **`details`** (`Array`): Chi tiết các trường vi phạm (thường dùng cho lỗi xác thực dữ liệu đầu vào `VALIDATION_ERROR`). Nếu không có chi tiết, trường này trả về mảng rỗng `[]`.
* **`timestamp`** (`String`): Thời điểm phát sinh lỗi theo chuẩn ISO-8601 UTC.

---

## 2. Bảng Danh Mục Mã Lỗi Toàn Hệ Thống

### 2.1. Nhóm Lỗi Xác thực & Ủy quyền (Auth & Security)
| HTTP Status | Mã `errorCode` | Ý nghĩa nghiệp vụ | Hành vi đề xuất trên Android |
| :---: | :--- | :--- | :--- |
| `401` | `AUTH_TOKEN_MISSING` | Request không đính kèm Header Authorization | Chuyển hướng người dùng về màn hình Đăng nhập |
| `401` | `AUTH_TOKEN_INVALID` | Firebase ID Token không hợp lệ hoặc đã bị thu hồi | Xóa phiên đăng nhập cục bộ, yêu cầu đăng nhập lại |
| `401` | `AUTH_TOKEN_EXPIRED` | Firebase ID Token đã hết hạn (quá 1 giờ) | SDK Android tự động gọi `getIdToken(true)` làm mới |
| `403` | `FORBIDDEN_RESOURCE` | Người dùng không có quyền truy cập tài nguyên | Hiển thị Toast cảnh báo từ chối truy cập |
| `403` | `ACCOUNT_DEACTIVATED` | Tài khoản đã bị khóa hoặc vô hiệu hóa | Đăng xuất và hiển thị thông báo liên hệ hỗ trợ |

### 2.2. Nhóm Lỗi Người Dùng & Hồ Sơ (Users & Profile)
| HTTP Status | Mã `errorCode` | Ý nghĩa nghiệp vụ | Hành vi đề xuất trên Android |
| :---: | :--- | :--- | :--- |
| `404` | `USER_NOT_FOUND` | Không tìm thấy thông tin người dùng trong cơ sở dữ liệu | Thông báo người dùng không tồn tại |
| `409` | `DUPLICATE_NICKNAME` | Nickname đã tồn tại trên hệ thống | Báo đỏ viền ô nhập và hiển thị gợi ý chọn tên khác |
| `400` | `INVALID_NICKNAME_FORMAT` | Nickname chứa ký tự đặc biệt hoặc sai độ dài (3–30 ký tự) | Hiển thị lỗi trực tiếp dưới ô nhập liệu |
| `400` | `NICKNAME_ALREADY_SET` | Người dùng cố tình gọi API thiết lập lại nickname khi đã có | Chuyển thẳng vào Trang chủ |

### 2.3. Nhóm Lỗi Công thức & Nội dung (Recipes & Categories)
| HTTP Status | Mã `errorCode` | Ý nghĩa nghiệp vụ | Hành vi đề xuất trên Android |
| :---: | :--- | :--- | :--- |
| `404` | `RECIPE_NOT_FOUND` | Công thức không tồn tại hoặc đã bị tác giả xóa | Hiển thị màn hình trống kèm thông báo món ăn đã bị gỡ |
| `403` | `NOT_RECIPE_OWNER` | Cố tình chỉnh sửa hoặc xóa công thức của người khác | Hiển thị Snackbar cảnh báo không có quyền |
| `400` | `RECIPE_MISSING_INGREDIENTS` | Công thức chưa có nguyên liệu nào | Báo lỗi tại bước tạo nguyên liệu |
| `400` | `RECIPE_MISSING_STEPS` | Công thức chưa có các bước thực hiện | Báo lỗi tại bước thêm công đoạn nấu |
| `404` | `CATEGORY_NOT_FOUND` | Danh mục món ăn được chọn không hợp lệ | Đề xuất tải lại danh sách danh mục |

### 2.4. Nhóm Lỗi Tiện ích (Fridge & Shopping List)
| HTTP Status | Mã `errorCode` | Ý nghĩa nghiệp vụ | Hành vi đề xuất trên Android |
| :---: | :--- | :--- | :--- |
| `400` | `EMPTY_FRIDGE_QUERY` | Không có nguyên liệu nào được chọn để tìm kiếm món | Yêu cầu người dùng chọn ít nhất 1 nguyên liệu |
| `404` | `INGREDIENT_NOT_FOUND` | Nguyên liệu không tồn tại trong từ điển chuẩn | Thông báo nguyên liệu không hợp lệ |
| `404` | `SHOPPING_ITEM_NOT_FOUND` | Mục cần cập nhật/xóa không có trong giỏ hàng | Cập nhật lại giỏ hàng cục bộ |

### 2.5. Nhóm Lỗi Tương tác Cộng đồng (Social & Reviews)
| HTTP Status | Mã `errorCode` | Ý nghĩa nghiệp vụ | Hành vi đề xuất trên Android |
| :---: | :--- | :--- | :--- |
| `400` | `CANNOT_FOLLOW_SELF` | Người dùng tự nhấn theo dõi chính mình | Vô hiệu hóa nút Follow trên trang cá nhân của chính mình |
| `409` | `ALREADY_REVIEWED` | Mỗi người dùng chỉ được đánh giá công thức 1 lần | Chuyển sang chế độ "Chỉnh sửa đánh giá" |
| `400` | `INVALID_RATING_SCORE` | Điểm sao không nằm trong khoảng 1 đến 5 | Khóa thanh chấm điểm ở mức 1–5 sao |

### 2.6. Nhóm Lỗi Dữ liệu & Hệ thống (Validation & System)
| HTTP Status | Mã `errorCode` | Ý nghĩa nghiệp vụ | Hành vi đề xuất trên Android |
| :---: | :--- | :--- | :--- |
| `422` | `VALIDATION_ERROR` | Dữ liệu gửi lên sai định dạng (bị Zod từ chối) | Đọc mảng `details` để hiển thị lỗi từng trường tương ứng |
| `429` | `RATE_LIMIT_EXCEEDED` | Gửi quá nhiều request trong thời gian ngắn | Khóa thao tác trong $X$ giây và thông báo thử lại sau |
| `500` | `INTERNAL_SERVER_ERROR` | Lỗi máy chủ không mong muốn | Hiển thị thông báo "Máy chủ đang bảo trì, vui lòng thử lại sau" |

---

## 3. Hướng dẫn cài đặt mẫu cho Đội ngũ Kỹ thuật

### 3.1. Phía Backend (Node.js / Express):
Định nghĩa lớp lỗi nghiệp vụ tập trung:
```typescript
// backend/src/common/errors/app-error.ts
export class AppError extends Error {
  constructor(
    public readonly statusCode: number,
    public readonly errorCode: string,
    message: string,
    public readonly details: any[] = []
  ) {
    super(message);
    Object.setPrototypeOf(this, new.target.prototype);
  }
}
```

Middleware bắt lỗi tập trung:
```typescript
// backend/src/common/middlewares/error.middleware.ts
export const errorHandler = (err: any, req: Request, res: Response, next: NextFunction) => {
  const statusCode = err.statusCode || 500;
  const errorCode = err.errorCode || 'INTERNAL_SERVER_ERROR';
  const message = err.message || 'Đã có lỗi xảy ra trên hệ thống.';
  const details = err.details || [];

  res.status(statusCode).json({
    success: false,
    errorCode,
    message,
    details,
    timestamp: new Date().toISOString()
  });
};
```

### 3.2. Phía Frontend (Android / Kotlin):
Lớp bọc phản hồi mạng chuẩn:
```kotlin
// android/app/src/main/java/com/foodsocial/app/core/common/NetworkResult.kt
sealed class NetworkResult<out T> {
    data class Success<T>(val data: T) : NetworkResult<T>()
    data class Error(
        val statusCode: Int,
        val errorCode: String,
        val message: String,
        val details: List<ValidationErrorDetail> = emptyList()
    ) : NetworkResult<Nothing>()
    object Loading : NetworkResult<Nothing>()
}
```

