# Pocket Mini System - ERP Lite

Một hệ thống quản lý nguồn lực doanh nghiệp (ERP) thu nhỏ gọn nhẹ, hiện đại, tích hợp Trợ lý ảo AI. Hệ thống cung cấp đầy đủ các tính năng cơ bản cho doanh nghiệp nhỏ bao gồm Quản lý Kho hàng, Nhân sự (HRM), Đối tác, Tài chính.

---

## 🚀 Các tính năng nổi bật

- **Khối Quản trị Kho (Inventory)**: Quản lý danh mục, hàng hóa, quy trình Nhập - Xuất - Chuyển kho, theo dõi tồn kho theo thời gian thực.
- **Khối Nhân sự (HRM)**: Quản lý thông tin nhân viên, sơ đồ tổ chức, module Chấm công (Check-in/Check-out), và tự động tính lương (Payroll).
- **Khối Đối tác (Partners)**: Quản lý chu kỳ làm việc với Khách hàng & Nhà cung cấp.
- **Khối Tài chính (Finance)**: Theo dõi Thu/Chi, đối soát công nợ.
- **Trợ lý ảo AI (AI Assistant)**: Tích hợp AI (Gemini/OpenRouter) hỗ trợ đọc hiểu dữ liệu hệ thống, trả lời câu hỏi và đưa ra gợi ý vận hành thông minh.

---

## 🛠 Công nghệ sử dụng (Tech Stack)

- **Frontend**: Next.js 14+ (React), Tailwind CSS, Zustand, Radix UI.
- **Backend**: NestJS 11 (Clean Architecture & DDD), TypeScript, TypeORM.
- **Database**: PostgreSQL 15.
- **Triển khai**: Docker & Docker Compose.

---

## 🚀 Hướng dẫn cài đặt & Khởi chạy

Dự án này hỗ trợ 2 phương pháp khởi chạy:
- **Phương pháp 1**: Khởi chạy tự động siêu tốc bằng **Docker** (Giải pháp "1-click" tiện lợi, đề xuất cho người mới).
- **Phương pháp 2**: Khởi chạy **Thủ công** từng thành phần (Đóng vai trò như một Software Engineer/Developer).

Vui lòng hoàn thành quá trình lấy Code dự án trước tiên:
```bash
git clone <đường_dẫn_vào_github_của_bạn>
cd pocket-mini-system
```

---

### PHƯƠNG PHÁP 1: Khởi chạy siêu tốc bằng Docker (Nhanh nhất)

Chỉ yêu cầu cài đặt **Docker Desktop** trên máy.

1. Đảm bảo phần mềm Docker Desktop đang mở (biểu tượng cá voi màu xanh lá cây hoặc đang bơi trên thay công cụ).
2. Tìm file `.env.example` ở thư mục gốc dự án, đổi tên nó thành `.env`. Bạn có thể thay mật khẩu hoặc thêm các Key AI (Ví dụ: `GEMINI_API_KEY`) vào nếu cần.
3. Mở ứng dụng Terminal (Command Prompt / Powershell) tại thư mục dự án và chạy:
   ```bash
   docker-compose up --build -d
   ```
4. Cuộc đời nở hoa! Quá trình sẽ diễn ra trong khoảng 2-5 phút. Docker tự động cài SQL, Node.js, Link Web và API với nhau không sót thứ gì.
5. Truy cập Web tại url: `http://localhost:3000`

---

### PHƯƠNG PHÁP 2: Khởi chạy THỦ CÔNG chi tiết (Dành cho Developer)

Trong trường hợp bạn không muốn dùng Docker full-stack hoặc muốn sửa code dễ dàng, bạn sẽ tự khởi chạy lần lượt: **Database -> Backend -> Frontend**. Yêu cầu máy cài sẵn `Node.js v20+` và `PostgreSQL`.

#### 📌 Bước 1: Khởi chạy và thiết lập Database (PostgreSQL)
Mặc định hệ thống không tự tạo DB, bạn cần tạo bằng tay nếu cài đặt PostgreSQL trên máy tính.
1. Khởi động **pgAdmin 4** (Trình quản lý cơ sở dữ liệu đi kèm khi bạn cài PostgreSQL).
2. Tạo một Login/Group Role: Tại thanh bên trái menu `Login/Group Roles` > Chuột phải chọn `Create` > `Login/Group Role`. 
   - Đặt Name là: `pocket-mini`
   - Chuyển sang Tab Definition nhập định nghĩa mật khẩu (Password). Ví dụ: `123456`.
   - Chuyển qua Tab Privileges: Bật công tắc dòng `Can login?` và `Create databases?`. Save lại.
3. Tạo lại Database: Click lại chuột phải cụm `Databases` > Chọn `Create Database`.
   - Tên cơ sở dữ liệu (Database Name): `pocket-mini`
   - Ở mục `Owner` hãy chọn cái User/Role vừa tạo ở trên (`pocket-mini`). Bấm Lưu (Save).

#### 📌 Bước 2: Thiết lập và Khởi chạy Backend (API)
Phần lõi kết nối máy chủ quản lý dữ liệu.
1. Mở Terminal mới và truy cập thư mục Backend:
   ```bash
   cd Backend
   ```
2. Tìm tệp `Backend/.env.example` **tạo bản sao** và đổi tên tệp sao này thành `.env`. Trong nội dung tệp `.env`, cấu hình cổng đến Cơ sở dữ liệu nội bộ ở Bước 1. Lưu ý `DB_HOST` bây giờ là `localhost`:
   ```env
   DB_HOST=localhost
   DB_PORT=5432
   DB_USERNAME=pocket-mini
   DB_PASSWORD=123456
   DB_NAME=pocket-mini
   JWT_SECRET=chuoi_ky_tu_bi_mat_bat_ky
   ```
3. Cài đặt các thư viện lõi (Dùng chế độ legacy để chống xung đột):
   ```bash
   npm install --legacy-peer-deps
   ```
4. Khởi chạy Backend ở chế độ tự cập nhật khi bạn sửa code (Watch/Dev mode):
   ```bash
   npm run start:dev
   ```
   > Khi xuất hiện thông báo kiểu như: *Nest application successfully started*, tức là API Server chạy thành công và lắng nghe ở cổng `:4000`. Cứ để treo Terminal này đừng tắt nhé.

#### 📌 Bước 3: Thiết lập và Khởi chạy Frontend (Web/Khách hàng)
Phần giao diện tương tác người dùng. Hãy mở ứng dụng thêm một phiên bản (tab) Terminal MỚI, rồi làm như sau:
1. Di chuyển vào thư mục Frontend:
   ```bash
   cd frontend
   ```
2. Tạo tệp `.env.local`: Có một file `.env.local.example` có sẵn (nếu có) hoặc tự tạo thủ công một tệp `.env.local` nếu bạn thích, nội dung của nó trỏ về địa chỉ nhà chứa Backend vừa hoạt động:
   ```env
   NEXT_PUBLIC_API_URL=http://localhost:4000/api
   ```
3. Cài đặt thư viện cho React/Nextjs:
   ```bash
   npm install --legacy-peer-deps
   ```
4. Khởi chạy máy chủ giao diện:
   ```bash
   npm run dev
   ```
   > Đợi vài chục giây quá trình biên dịch (compile) hoàn tất. Máy báo Ready. Lập tức mở trình duyệt nhập vào địa chỉ `http://localhost:3000`

---

## 🛑 Cách Dừng / Tắt ứng dụng

- **Đối với người dùng Docker (Cách 1)**: Tại bất kỳ đâu trong thư mục kho lưu trữ gõ `docker-compose down`.
- **Đối với Developers (Cách 2)**: Nhấn tổ hợp phím tắt quyền năng `Ctrl + C` ở những cửa sổ Terminal/Command Prompt đang chạy lệnh Frontend hay Backend, rồi gõ Yes/Y để xác nhận tắt.

Tài liệu được biên soạn với tinh thần "Đọc là chạy được ngay". Chúc bạn ứng dụng thành công!
Bản quyền: 2026.
