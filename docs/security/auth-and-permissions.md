# Kiến Trúc Xác Thực & Phân Quyền (Authentication & Authorization Specification)

Tài liệu này đặc tả cơ chế bảo mật, quy trình xác thực người dùng thông qua Google OAuth2 (Firebase Authentication) và hệ thống phân quyền vai trò (Role-Based Access Control - RBAC) của **Food Social App**.

---

## 1. Mô hình Xác thực Tổng thể (Authentication Architecture)

Hệ thống áp dụng mô hình **BaaS Token Verification**:
* **Client (Android):** Trực tiếp tương tác với Google Identity SDK và Firebase Authentication để xác minh danh tính người dùng trên thiết bị di động, nhận về chuỗi **Firebase ID Token** (JWT).
* **Backend (Node.js):** Nhận ID Token từ Client qua HTTP Header, xác minh chữ ký mã hóa bằng **Firebase Admin SDK**. Sau khi xác minh thành công, Backend trích xuất thông tin người dùng (`firebase_uid`, `email`) và đối chiếu với cơ sở dữ liệu PostgreSQL.

```mermaid
sequenceDiagram
    autonumber
    actor User as Người dùng
    participant Android as Android Client
    participant Google as Google Identity & Firebase Auth
    participant Backend as Node.js Backend
    participant DB as PostgreSQL

    User->>Android: Bấm "Đăng nhập với Google"
    Android->>Google: Yêu cầu xác thực tài khoản Google
    Google-->>Android: Trả về Firebase User & ID Token (JWT)
    Android->>Backend: POST /api/v1/auth/google-login (Bearer <id_token>)
    Backend->>Google: Xác minh chữ ký Token (Firebase Admin SDK)
    Google-->>Backend: Token hợp lệ (UID, Email)
    Backend->>DB: Truy vấn bảng users theo firebase_uid
    alt Người dùng mới (Chưa có trong DB)
        Backend->>DB: Tạo bản ghi mới (has_nickname = false)
    end
    DB-->>Backend: Thông tin người dùng nội bộ
    Backend-->>Android: Trả về User Profile + Cờ trạng thái hasNickname
```

---

## 2. Quy chuẩn Token & Giao tiếp Mạng

### 2.1. Định dạng Header bắt buộc
Mọi yêu cầu gửi từ Android Client tới các API yêu cầu đăng nhập (Protected Endpoints) bắt buộc phải đính kèm Header:

$$\text{Authorization: Bearer <firebase\_id\_token>}$$

* Ví dụ thực tế:
  ```http
  GET /api/v1/users/me HTTP/1.1
  Host: api.foodsocial.app
  Authorization: Bearer eyJhbGciOiJSUzI1NiIsImtpZCI6IjEyMy...
  Content-Type: application/json
  ```

### 2.2. Vòng đời của Token & Cơ chế Tự động Làm mới (Token Refresh)
* **Thời hạn hiệu lực:** Firebase ID Token có hiệu lực trong vòng **01 giờ (3600 giây)**.
* **Cơ chế tại Client:** Trên Android, Firebase SDK tự động duy trì và làm mới Refresh Token ở tầng nền. Android Client phải cài đặt một `AuthInterceptor` (OkHttp) để lấy token mới nhất trước mỗi request:
  ```kotlin
  // Lấy token tự động (tự refresh nếu token cũ đã hết hạn)
  val token = FirebaseAuth.getInstance().currentUser?.getIdToken(false)?.await()?.token
  ```
* **Khi nhận lỗi HTTP 401 `AUTH_TOKEN_EXPIRED`:** Client tự động gọi `getIdToken(true)` (ép buộc làm mới) và thực hiện lại request bị lỗi một lần duy nhất trước khi thông báo đăng xuất.

---

## 3. Hệ thống Phân quyền (Role-Based Access Control - RBAC)

Hệ thống định nghĩa 2 vai trò cơ bản thông qua trường `role` trong bảng `users`:

| Vai trò | Giá trị `role` | Phạm vi quyền hạn |
| :--- | :---: | :--- |
| **Người dùng** | `USER` | Toàn quyền quản lý tài nguyên của chính mình: Tạo/sửa/xóa công thức cá nhân, quản lý tủ lạnh, giỏ đi chợ, bộ lọc đã lưu, viết đánh giá, đăng Cooksnap, theo dõi người khác. |
| **Quản trị viên** | `ADMIN` | Kế thừa toàn bộ quyền của `USER`, đồng thời có quyền: Ẩn/xóa công thức hoặc bình luận vi phạm của bất kỳ ai; Thêm/sửa/xóa danh mục từ điển chuẩn (`categories`, `dietary_regimes`, `ingredients`). |

---

## 4. Ma trận Phân quyền Endpoints (Permission Matrix)

### Phân loại mức độ bảo vệ:
* 🟢 **Public:** Không yêu cầu đăng nhập, cho phép khách lướt xem nội dung.
* 🟡 **Authenticated (`USER`):** Yêu cầu Token hợp lệ của người dùng thông thường.
* 🔴 **Admin-only (`ADMIN`):** Yêu cầu Token hợp lệ và có `role = 'ADMIN'`.

| Phân hệ / Module | Đường dẫn API | Phương thức | Mức độ bảo vệ | Ghi chú |
| :--- | :--- | :---: | :---: | :--- |
| **Auth & Setup** | `/api/v1/auth/google-login` | `POST` | 🟡 Authenticated | Nhận Firebase Token, khởi tạo phiên làm việc |
| | `/api/v1/users/check-nickname` | `GET` | 🟡 Authenticated | Kiểm tra tính khả dụng của nickname |
| | `/api/v1/users/setup-nickname` | `POST` | 🟡 Authenticated | Thiết lập nickname độc nhất lần đầu |
| **User Profile** | `/api/v1/users/me` | `GET` / `PUT` | 🟡 Authenticated | Xem và cập nhật hồ sơ cá nhân |
| | `/api/v1/users/:nickname` | `GET` | 🟢 Public | Xem trang cá nhân công khai của người khác |
| | `/api/v1/users/me/allergies`| `GET` / `PUT` | 🟡 Authenticated | Quản lý danh sách nguyên liệu dị ứng cá nhân |
| **Recipes** | `/api/v1/recipes` | `GET` | 🟢 Public | Xem danh sách công thức trang chủ, lọc |
| | `/api/v1/recipes/:id` | `GET` | 🟢 Public | Xem chi tiết nguyên liệu và cách nấu |
| | `/api/v1/recipes` | `POST` | 🟡 Authenticated | Đăng bài công thức nấu ăn mới |
| | `/api/v1/recipes/:id` | `PUT` / `DELETE` | 🟡 Authenticated | Chỉ chủ sở hữu bài viết (`author_id = user.id`) hoặc `ADMIN` |
| **Smart Fridge** | `/api/v1/fridge` | `GET` / `PUT` | 🟡 Authenticated | Quản lý nguyên liệu trong tủ lạnh |
| | `/api/v1/fridge/suggestions` | `POST` | 🟡 Authenticated | Thuật toán gợi ý món ăn theo nguyên liệu |
| **Shopping List**| `/api/v1/shopping-list` | `GET` / `POST` | 🟡 Authenticated | Quản lý và cộng dồn nguyên liệu giỏ đi chợ |
| **Master Data** | `/api/v1/categories` | `GET` | 🟢 Public | Xem danh mục món ăn |
| | `/api/v1/ingredients` | `GET` | 🟢 Public | Tìm kiếm nguyên liệu chuẩn từ từ điển |
| | `/api/v1/categories` | `POST` / `PUT` | 🔴 Admin-only | Quản lý từ điển danh mục |
| | `/api/v1/ingredients` | `POST` / `PUT` | 🔴 Admin-only | Thêm nguyên liệu chuẩn vào hệ thống |
