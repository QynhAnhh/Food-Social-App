# Quy Chuẩn Phát Triển & Cộng Tác Mã Nguồn (Git Workflow Guidelines)

Tài liệu này thiết lập các nguyên tắc và quy trình kỹ thuật bắt buộc nhằm chuẩn hóa mã nguồn, giảm thiểu xung đột (merge conflicts), bảo đảm tính toàn vẹn dữ liệu và duy trì lịch sử cam kết (commit history) minh bạch trong suốt vòng đời dự án.

---

## 1. Mô hình phân nhánh (Branching Strategy)

Dự án áp dụng mô hình phân nhánh tiêu chuẩn **GitHub Flow**:

* **`main` (Production):** 
  - Lưu trữ mã nguồn phiên bản hoàn chỉnh và ổn định nhất.
  - Được bảo vệ bằng cơ chế *Branch Protection*: **Nghiêm cấm commit hoặc push trực tiếp.**
* **`develop` (Integration / Staging):** 
  - Nhánh tích hợp trung tâm phục vụ phát triển.
  - Toàn bộ các tính năng sau khi được kiểm thử và phê duyệt sẽ được hợp nhất (merge) vào nhánh này.
* **Nhánh tính năng / Sửa lỗi (`feature/*`, `fix/*`, `refactor/*`):** 
  - Khởi tạo từ `develop`.
  - Phục vụ việc xử lý từng hạng mục công việc độc lập.

---

## 2. Quy chuẩn định danh nhánh (Branch Naming Conventions)

Tên nhánh phải sử dụng định dạng chữ thường, ngăn cách bằng dấu gạch ngang (`kebab-case`) theo cấu trúc:

$$\text{<loại-nhánh>}/\text{<mô-tả-ngắn-gọn>}$$

| Tiền tố | Mục đích | Ví dụ |
| :--- | :--- | :--- |
| `feature/` | Xây dựng tính năng hoặc màn hình mới | `feature/auth-google-login`<br>`feature/recipe-creation-step` |
| `fix/` | Khắc phục sự cố hoặc lỗi phát sinh trong phát triển | `fix/shopping-list-aggregation`<br>`fix/avatar-upload-boundary` |
| `hotfix/` | Vá lỗi nghiêm trọng phát sinh trực tiếp trên nhánh `main` | `hotfix/crash-deep-link-android14` |
| `refactor/` | Tối ưu hóa cấu trúc code (không làm thay đổi nghiệp vụ) | `refactor/user-service-logic` |
| `chore/` | Cập nhật cấu hình hệ thống, dependencies, thư viện | `chore/update-prisma-schema` |

---

## 3. Quy chuẩn thông điệp cam kết (Conventional Commits)

Thông điệp cam kết (commit message) phải tuân thủ nghiêm ngặt quy chuẩn quốc tế **Conventional Commits**:

$$\text{<type>(<scope>): <mô tả tóm tắt bằng thể mệnh lệnh>}$$

### Các phân loại (Types) bắt buộc:
* **`feat`**: Bổ sung tính năng mới.
* **`fix`**: Sửa lỗi mã nguồn.
* **`refactor`**: Tái cấu trúc mã nguồn mà không thay đổi logic hoặc hành vi người dùng.
* **`perf`**: Cải thiện hiệu năng xử lý (thuật toán, truy vấn database).
* **`docs`**: Cập nhật tài liệu kỹ thuật, sơ đồ, README.
* **`chore`**: Thay đổi cấu hình build, cài đặt packages, cập nhật `.gitignore`.

### Ví dụ quy chuẩn:
* **Đạt yêu cầu:**
  - `feat(auth): integrate google oauth token verification`
  - `feat(fridge): add recipe matching algorithm based on ingredients`
  - `fix(shopping-list): resolve duplicate quantity calculation on unit conversion`
  - `refactor(recipe): extract step image validation to separate util`
* **Không đạt yêu cầu:**
  - `update code`, `fix bug`, `done feature`, `asdfgh`

---

## 4. Quy trình thực thi nhiệm vụ tiêu chuẩn (Standard Workflow)

Mỗi lập trình viên khi thực hiện một hạng mục kỹ thuật cần tuân thủ 5 bước tuần tự:

### Bước 1: Đồng bộ mã nguồn mới nhất từ máy chủ
```bash
git checkout develop
git pull origin develop
```

### Bước 2: Khởi tạo nhánh làm việc độc lập
```bash
git checkout -b feature/auth-google-login
```

### Bước 3: Triển khai và phân chia các commit nhỏ (Atomic Commits)
Thực hiện cam kết mã nguồn thường xuyên theo từng đơn vị chức năng hoàn chỉnh:
```bash
git add <các_file_thay_đổi>
git commit -m "feat(auth): create firebase auth middleware"
```

### Bước 4: Tái đồng bộ và xử lý xung đột (Rebase / Merge)
Trước khi đẩy mã nguồn lên máy chủ, phải cập nhật nhánh `develop` mới nhất vào nhánh cá nhân để kiểm tra và chủ động giải quyết xung đột cục bộ:
```bash
git checkout develop
git pull origin develop

git checkout feature/auth-google-login
git merge develop
# Thực hiện giải quyết conflict (nếu có), lưu và hoàn tất commit giải quyết xung đột
```

### Bước 5: Đẩy nhánh lên Remote Repository
```bash
git push -u origin feature/auth-google-login
```

---

## 5. Quy định về Pull Request (PR) & Đánh giá mã nguồn (Code Review)

### 5.1. Giới hạn quy mô Pull Request
* Một Pull Request không vượt quá **400 dòng thay đổi (diff lines)** nhằm đảm bảo chất lượng phản biện kỹ thuật.
* Trường hợp tính năng lớn, phải chủ động phân rã thành các PR nhỏ hơn theo từng tầng kiến trúc (Database $\rightarrow$ Backend API $\rightarrow$ Frontend UI).

### 5.2. Tiêu chuẩn Đánh giá và Hợp nhất (Approval & Merge Policy)
* **Quy tắc phê duyệt:** Tác giả không được phép tự merge PR của mình. Mỗi PR bắt buộc phải có ít nhất **01 sự phê duyệt (Approve)** từ thành viên khác trước khi được hợp nhất.
* **Chiến lược hợp nhất:** Bắt buộc áp dụng chế độ **`Squash and merge`** nhằm gộp toàn bộ các commit nhỏ lẻ thành một commit duy nhất trên nhánh `develop`, bảo đảm cây lịch sử luôn tinh gọn.

---

## 6. Các nguyên tắc an toàn kỹ thuật (Security & Restrictions)

Các hành vi dưới đây bị nghiêm cấm trên toàn bộ dự án:

1. **Commit thông tin nhạy cảm:**
   - Biến môi trường: `.env`, `.env.local`
   - Chứng chỉ và Key xác thực: `*.jks`, `keystore.properties`, `serviceAccountKey.json`, `google-services.json`
   *(Mọi cấu hình phải thông qua file mẫu định danh `.env.example`).*
2. **Commit thư mục sinh tự động hoặc thư viện bên ngoài:**
   - `node_modules/`, `build/`, `.gradle/`, `.idea/`, `.vscode/`.
3. **Lạm dụng lệnh ghi đè (`git push --force` hoặc `git push -f`):**
   - Nghiêm cấm tuyệt đối việc sử dụng cờ `--force` trên các nhánh dùng chung (`main`, `develop`).
4. **Hợp nhất mã nguồn không đạt kiểm định:**
   - Không được phép phê duyệt hoặc hợp nhất PR khi tiến trình build hoặc kiểm thử tự động (CI) phát hiện lỗi.

