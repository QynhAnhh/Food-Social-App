# Đặc Tả Luồng Nghiệp Vụ: Xác Thực & Hồ Sơ Người Dùng (Auth & Profile Flow)

Tài liệu này mô tả chi tiết luồng nghiệp vụ tương tác giữa người dùng, ứng dụng Android và máy chủ Backend cho phân hệ **Xác thực và Thiết lập Hồ sơ cá nhân (Giai đoạn 1)**.

---

## 1. Luồng Đăng nhập Google & Bắt buộc Tạo Nickname Lần đầu

### 1.1. Bối cảnh nghiệp vụ
Mỗi tài khoản đăng nhập qua Google đều có một `email` và `full_name`. Tuy nhiên, trong ứng dụng mạng xã hội ẩm thực này, mỗi người dùng **bắt buộc phải có một `nickname` độc nhất** để:
* Định danh bài viết công thức, bình luận, và ảnh Cooksnap.
* Phục vụ tính năng tìm kiếm đầu bếp trên thanh Global Search.
* Tạo đường dẫn định danh trang cá nhân (Profile URL).

Do đó, người dùng sau khi đăng nhập Google lần đầu tiên **không thể vào thẳng Trang chủ** nếu chưa hoàn tất bước thiết lập nickname.

---

### 1.2. Sơ đồ Luồng Tuần Tự (Sequence Diagram)

```mermaid
sequenceDiagram
    autonumber
    actor User as Người dùng
    participant App as Android Client
    participant Auth as Firebase Auth
    participant API as Backend API
    participant DB as PostgreSQL

    User->>App: Mở App, nhấn "Đăng nhập với Google"
    App->>Auth: Mở Google One-Tap / Sign-In Dialog
    Auth-->>App: Trả về Google Credentials & Firebase ID Token
    App->>API: POST /api/v1/auth/google-login (Bearer Token)
    
    API->>API: Verify Token qua Firebase Admin SDK
    API->>DB: Tìm kiếm user theo firebase_uid
    alt Người dùng mới hoàn toàn
        API->>DB: INSERT INTO users (email, full_name, avatar_url, nickname=NULL)
        API-->>App: HTTP 200 { isNewUser: true, hasNickname: false, user: {...} }
        App->>App: Điều hướng đến Màn hình "Thiết lập Nickname"
    else Người dùng cũ nhưng chưa đặt Nickname
        API-->>App: HTTP 200 { isNewUser: false, hasNickname: false, user: {...} }
        App->>App: Điều hướng đến Màn hình "Thiết lập Nickname"
    else Người dùng đã hoàn tất Nickname trước đó
        API-->>App: HTTP 200 { isNewUser: false, hasNickname: true, user: {...} }
        App->>App: Lưu phiên làm việc -> Chuyển thẳng vào "Trang chủ"
    end

    opt Luồng Thiết lập Nickname (Nếu hasNickname = false)
        loop Người dùng nhập Nickname
            User->>App: Nhập chuỗi nickname (VD: "bep_nha_bong")
            App->>API: GET /api/v1/users/check-nickname?nickname=bep_nha_bong
            API->>DB: SELECT COUNT(*) FROM users WHERE nickname = 'bep_nha_bong'
            DB-->>API: 0 (Chưa ai dùng)
            API-->>App: HTTP 200 { isAvailable: true }
            App->>App: Hiển thị icon tích xanh "Nickname khả dụng"
        end
        User->>App: Nhấn nút "Hoàn tất"
        App->>API: POST /api/v1/users/setup-nickname { nickname: "bep_nha_bong" }
        API->>DB: UPDATE users SET nickname = 'bep_nha_bong' WHERE id = user.id
        DB-->>API: Cập nhật thành công
        API-->>App: HTTP 200 { success: true, user: {...} }
        App->>App: Chuyển hướng vào "Trang chủ"
    end
```

---

## 2. Quy tắc Nghiệp vụ Kiểm tra Nickname (Validation Rules)

Backend sử dụng thư viện **Zod** để xác thực tính hợp lệ của `nickname`. Các điều kiện bắt buộc:
1. **Độ dài:** Tối thiểu 3 ký tự, tối đa 30 ký tự.
2. **Ký tự cho phép:** Chỉ chấp nhận chữ cái thường không dấu (`a-z`), chữ số (`0-9`), dấu gạch dưới (`_`) và dấu chấm (`.`).
3. **Không bắt đầu hoặc kết thúc bằng dấu chấm:** Tránh định dạng gây lỗi URL.
4. **Tính độc nhất:** Không trùng lặp với bất kỳ nickname nào đã có trong bảng `users` (so sánh không phân biệt hoa thường).

```typescript
// Zod Schema kiểm duyệt Nickname
export const nicknameSchema = z.string()
  .min(3, "Nickname phải có tối thiểu 3 ký tự.")
  .max(30, "Nickname không được vượt quá 30 ký tự.")
  .regex(/^[a-z0-9._]+$/, "Nickname chỉ được chứa chữ thường, số, dấu chấm và dấu gạch dưới.")
  .refine(val => !val.startsWith('.') && !val.endsWith('.'), "Nickname không được bắt đầu hoặc kết thúc bằng dấu chấm.");
```

---

## 3. Luồng Cấu hình Nguyên liệu Dị ứng Cá nhân (Allergy Settings)

### 3.1. Bối cảnh
Người dùng có thể chủ động khai báo các nguyên liệu gây dị ứng của bản thân (ví dụ: `Hải sản`, `Đậu phộng`, `Sữa`) ngay sau khi vào app hoặc tại trang Cài đặt hồ sơ cá nhân.

### 3.2. Quy trình xử lý
1. Người dùng mở màn hình *Cài đặt dị ứng*.
2. App gọi `GET /api/v1/ingredients?isAllergenCommon=true` để lấy danh sách các nhóm nguyên liệu dễ gây dị ứng phổ biến có sẵn trong từ điển.
3. App đồng thời gọi `GET /api/v1/users/me/allergies` để lấy danh sách ID các nguyên liệu mà người dùng đã lưu trước đó.
4. Người dùng tích chọn / bỏ chọn các mục.
5. Người dùng nhấn "Lưu thay đổi" $\rightarrow$ App gửi `PUT /api/v1/users/me/allergies` kèm danh sách `ingredientIds: [1, 5, 12]`.
6. Backend chạy một Database Transaction:
   - Xóa các bản ghi cũ trong `user_allergies` của người dùng này.
   - Thêm mới các bản ghi theo mảng ID vừa gửi.
7. Từ thời điểm này, mọi truy vấn tìm kiếm công thức hoặc gợi ý tủ lạnh sẽ **tự động loại trừ** các công thức có chứa các `ingredient_id` này.

