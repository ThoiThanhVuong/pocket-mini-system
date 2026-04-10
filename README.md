# Pocket Mini System - ERP Lite

Một hệ thống quản lý nguồn lực doanh nghiệp (ERP) thu nhỏ gọn nhẹ, hiện đại, tích hợp Trợ lý ảo AI. Hệ thống cung cấp đầy đủ các tính năng cơ bản cho doanh nghiệp nhỏ bao gồm Quản lý Kho hàng, Nhân sự (HRM), Đối tác, Tài chính.

---

## 📖 Tài liệu hướng dẫn
> [!IMPORTANT]
> Để xem hướng dẫn sử dụng chi tiết từng bước (Cẩm nang vận hành), vui lòng truy cập: **[USER_GUIDE.md](./USER_GUIDE.md)**

---

## 🔥 Các tính năng nổi trội

- **📦 Quản trị Kho (Inventory)**: Quản lý danh mục, hàng hóa, quy trình Nhập - Xuất - Chuyển kho.
- **👥 Nhân sự (HRM)**: Quản lý người dùng, phân quyền chi tiết, và tự động tính lương.
- **🤝 Đối tác (Partners)**: Quản lý khách hàng và nhà cung cấp.
- **💰 Tài chính (Finance)**: Theo dõi dòng tiền Thu/Chi và công nợ.
- **🤖 Trợ lý AI (AI Assistant)**: Phân tích dữ liệu và gợi ý chiến lược kinh doanh.

---

---

## 🛠 Công nghệ sử dụng (Tech Stack)

- **Frontend**: Next.js 14 (App Router), Tailwind CSS, Framer Motion.
- **Backend**: NestJS (DDD Architecture), NestJS/Passport (Auth).
- **Database**: PostgreSQL & TypeORM.
- **AI Engine**: Gemini AI / OpenRouter API.

---

## 🚀 Hướng dẫn cài đặt cho Developer

### PHƯƠNG PHÁP 1: Docker (Đề xuất)
1. Đổi tên `.env.example` -> `.env` và điền `GEMINI_API_KEY`.
2. Chạy lệnh:
   ```bash
   docker-compose up --build -d
   ```
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
