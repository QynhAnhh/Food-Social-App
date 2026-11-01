# Hợp Đồng API: Xác Thực, Người Dùng & Dữ Liệu Gốc (API Contract - Phase 1)

Tài liệu này quy định chi tiết các endpoint REST API cho **Giai đoạn 1: Nền tảng Định danh & Dữ liệu gốc**. Mọi request và response phải tuân thủ chính xác kiểu dữ liệu và định dạng JSON được khai báo dưới đây.

---

## 1. Phân hệ Xác thực (Authentication)

### 1.1. `POST /api/v1/auth/google-login`
Xác thực tài khoản Google thông qua Firebase ID Token và khởi tạo/truy xuất người dùng trong cơ sở dữ liệu.

* **Headers:**
  ```http
  Authorization: Bearer <firebase_id_token>
  Content-Type: application/json
  ```
* **Request Body:** Không có.
* **Phản hồi thành công (HTTP 200 OK):**
  ```json
  {
    "success": true,
    "data": {
      "isNewUser": false,
      "hasNickname": true,
      "user": {
        "id": "e4b3c2a1-5d6e-4f7a-8b9c-0d1e2f3a4b5c",
        "email": "chef.an@gmail.com",
        "nickname": "chefan",
        "fullName": "Nguyễn Văn An",
        "avatarUrl": "https://lh3.googleusercontent.com/a/ACg8oc...",
        "bio": "Đam mê nấu các món thuần chay",
        "role": "USER",
        "createdAt": "2026-11-01T08:00:00.000Z"
      }
    },
    "message": "Đăng nhập thành công"
  }
  ```
* **Lỗi có thể xảy ra:**
  - `401 AUTH_TOKEN_MISSING` / `AUTH_TOKEN_INVALID` / `AUTH_TOKEN_EXPIRED`

---

## 2. Phân hệ Người Dùng & Hồ Sơ (Users & Profile)

### 2.1. `GET /api/v1/users/check-nickname`
Kiểm tra tính khả dụng của một nickname trước khi người dùng nhấn xác nhận.

* **Headers:**
  ```http
  Authorization: Bearer <firebase_id_token>
  ```
* **Query Parameters:**
  - `nickname` (`String`, bắt buộc): Chuỗi nickname muốn kiểm tra (ví dụ: `?nickname=bep_an`).
* **Phản hồi thành công (HTTP 200 OK):**
  ```json
  {
    "success": true,
    "data": {
      "nickname": "bep_an",
      "isAvailable": true
    },
    "message": "Nickname này có thể sử dụng"
  }
  ```
* **Lỗi có thể xảy ra:**
  - `400 INVALID_NICKNAME_FORMAT`: Nickname sai định dạng ký tự hoặc độ dài.

---

### 2.2. `POST /api/v1/users/setup-nickname`
Thiết lập nickname độc nhất cho tài khoản sau lần đăng nhập đầu tiên.

* **Headers:**
  ```http
  Authorization: Bearer <firebase_id_token>
  Content-Type: application/json
  ```
* **Request Body:**
  ```json
  {
    "nickname": "bep_an"
  }
  ```
* **Phản hồi thành công (HTTP 200 OK):**
  ```json
  {
    "success": true,
    "data": {
      "id": "e4b3c2a1-5d6e-4f7a-8b9c-0d1e2f3a4b5c",
      "nickname": "bep_an",
      "fullName": "Nguyễn Văn An",
      "updatedAt": "2026-11-01T08:05:00.000Z"
    },
    "message": "Thiết lập nickname thành công"
  }
  ```
* **Lỗi có thể xảy ra:**
  - `409 DUPLICATE_NICKNAME`: Nickname đã bị người khác đăng ký trước.
  - `400 NICKNAME_ALREADY_SET`: Tài khoản đã có nickname, không được phép gọi lại API này.

---

### 2.3. `GET /api/v1/users/me`
Lấy thông tin hồ sơ chi tiết của tài khoản đang đăng nhập.

* **Headers:**
  ```http
  Authorization: Bearer <firebase_id_token>
  ```
* **Phản hồi thành công (HTTP 200 OK):**
  ```json
  {
    "success": true,
    "data": {
      "id": "e4b3c2a1-5d6e-4f7a-8b9c-0d1e2f3a4b5c",
      "email": "chef.an@gmail.com",
      "nickname": "bep_an",
      "fullName": "Nguyễn Văn An",
      "avatarUrl": "https://storage.googleapis.com/.../avatar.jpg",
      "bio": "Yêu thích ẩm thực Á Đông",
      "role": "USER",
      "stats": {
        "recipesCount": 12,
        "followersCount": 150,
        "followingCount": 45
      },
      "createdAt": "2026-11-01T08:00:00.000Z"
    },
    "message": "Lấy thông tin hồ sơ thành công"
  }
  ```

---

### 2.4. `PUT /api/v1/users/me`
Cập nhật thông tin hồ sơ cá nhân (tên hiển thị, giới thiệu tiểu sử, ảnh đại diện).

* **Headers:**
  ```http
  Authorization: Bearer <firebase_id_token>
  Content-Type: application/json
  ```
* **Request Body:**
  ```json
  {
    "fullName": "Đầu Bếp An Nguyễn",
    "bio": "Chuyên chia sẻ công thức các món tráng miệng ít đường",
    "avatarUrl": "https://firebasestorage.googleapis.com/.../new-avatar.jpg"
  }
  ```
* **Phản hồi thành công (HTTP 200 OK):**
  ```json
  {
    "success": true,
    "data": {
      "id": "e4b3c2a1-5d6e-4f7a-8b9c-0d1e2f3a4b5c",
      "nickname": "bep_an",
      "fullName": "Đầu Bếp An Nguyễn",
      "bio": "Chuyên chia sẻ công thức các món tráng miệng ít đường",
      "avatarUrl": "https://firebasestorage.googleapis.com/.../new-avatar.jpg",
      "updatedAt": "2026-11-01T08:15:00.000Z"
    },
    "message": "Cập nhật hồ sơ thành công"
  }
  ```

---

### 2.5. `GET /api/v1/users/me/allergies`
Lấy danh sách các nguyên liệu gây dị ứng đã lưu của người dùng.

* **Headers:**
  ```http
  Authorization: Bearer <firebase_id_token>
  ```
* **Phản hồi thành công (HTTP 200 OK):**
  ```json
  {
    "success": true,
    "data": [
      {
        "id": 8,
        "name": "Tôm sú",
        "standardUnit": "gram"
      },
      {
        "id": 14,
        "name": "Đậu phộng (Lạc)",
        "standardUnit": "gram"
      }
    ],
    "message": "Lấy danh sách dị ứng thành công"
  }
  ```

---

### 2.6. `PUT /api/v1/users/me/allergies`
Cập nhật toàn bộ danh sách nguyên liệu gây dị ứng của người dùng.

* **Headers:**
  ```http
  Authorization: Bearer <firebase_id_token>
  Content-Type: application/json
  ```
* **Request Body:**
  ```json
  {
    "ingredientIds": [8, 14, 25]
  }
  ```
* **Phản hồi thành công (HTTP 200 OK):**
  ```json
  {
    "success": true,
    "data": {
      "totalAllergies": 3,
      "ingredientIds": [8, 14, 25]
    },
    "message": "Cập nhật danh sách dị ứng thành công"
  }
  ```

---

## 3. Phân hệ Từ Điển & Dữ Liệu Gốc (Master Data)

### 3.1. `GET /api/v1/categories`
Lấy toàn bộ danh mục món ăn chuẩn của hệ thống (Bữa chính, Tráng miệng, Bánh).

* **Truy cập:** Public (Không cần Token).
* **Phản hồi thành công (HTTP 200 OK):**
  ```json
  {
    "success": true,
    "data": [
      {
        "id": 1,
        "name": "Bữa chính",
        "slug": "bua-chinh"
      },
      {
        "id": 2,
        "name": "Món tráng miệng",
        "slug": "mon-trang-mieng"
      },
      {
        "id": 3,
        "name": "Các loại bánh",
        "slug": "cac-loai-banh"
      }
    ],
    "message": "Lấy danh mục thành công"
  }
  ```

---

### 3.2. `GET /api/v1/dietary-regimes`
Lấy danh sách các chế độ ăn kiêng tiêu chuẩn (Eat Clean, Keto, Chay, Low-Carb...).

* **Truy cập:** Public (Không cần Token).
* **Phản hồi thành công (HTTP 200 OK):**
  ```json
  {
    "success": true,
    "data": [
      {
        "id": 1,
        "name": "Eat Clean",
        "slug": "eat-clean",
        "description": "Chế độ ăn tập trung vào thực phẩm tươi, ít qua chế biến"
      },
      {
        "id": 2,
        "name": "Keto (Ketogenic)",
        "slug": "keto",
        "description": "Giảm tối đa carbohydrate, tăng cường chất béo lành mạnh"
      },
      {
        "id": 3,
        "name": "Ăn chay (Vegetarian)",
        "slug": "vegetarian",
        "description": "Chế độ ăn không tiêu thụ thịt động vật"
      },
      {
        "id": 4,
        "name": "Low-Carb",
        "slug": "low-carb",
        "description": "Hạn chế tinh bột và đường"
      }
    ],
    "message": "Lấy danh sách chế độ ăn thành công"
  }
  ```

---

### 3.3. `GET /api/v1/ingredients`
Tìm kiếm hoặc tải danh sách nguyên liệu chuẩn phục vụ chọn từ điển hoặc cài đặt dị ứng.

* **Truy cập:** Public (Không cần Token).
* **Query Parameters:**
  - `q` (`String`, tùy chọn): Từ khóa tìm kiếm theo tên nguyên liệu (VD: `?q=thịt`).
  - `isAllergenCommon` (`Boolean`, tùy chọn): Lọc các nguyên liệu dễ gây dị ứng (VD: `?isAllergenCommon=true`).
  - `limit` (`Int`, tùy chọn, mặc định: 50).
* **Phản hồi thành công (HTTP 200 OK):**
  ```json
  {
    "success": true,
    "data": [
      {
        "id": 1,
        "name": "Thịt bò thăn",
        "standardUnit": "gram",
        "imageUrl": "https://storage.googleapis.com/.../thit-bo.png",
        "isAllergenCommon": false
      },
      {
        "id": 8,
        "name": "Tôm sú",
        "standardUnit": "gram",
        "imageUrl": "https://storage.googleapis.com/.../tom-su.png",
        "isAllergenCommon": true
      },
      {
        "id": 15,
        "name": "Trứng gà",
        "standardUnit": "quả",
        "imageUrl": "https://storage.googleapis.com/.../trung-ga.png",
        "isAllergenCommon": true
      }
    ],
    "message": "Tìm kiếm nguyên liệu thành công"
  }
  ```

