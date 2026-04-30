<div align="center">

# 🌟 Pocket Mini System - Tương Lai Của Quản Trị Doanh Nghiệp Nhỏ 🌟

[![Next.js](https://img.shields.io/badge/Next.js-14-black?style=for-the-badge&logo=next.js)](https://nextjs.org/)
[![NestJS](https://img.shields.io/badge/NestJS-E0234E?style=for-the-badge&logo=nestjs&logoColor=white)](https://nestjs.com/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-316192?style=for-the-badge&logo=postgresql&logoColor=white)](https://www.postgresql.org/)
[![Docker](https://img.shields.io/badge/Docker-2496ED?style=for-the-badge&logo=docker&logoColor=white)](https://www.docker.com/)

**Một hệ thống ERP (Enterprise Resource Planning) thu nhỏ, hiện đại, tối ưu hiệu năng và được tiếp sức mạnh bởi Trí Tuệ Nhân Tạo (AI).**

[Khám phá tính năng](#-các-tính-năng-cốt-lõi) • [Cài đặt nhanh](#-hướng-dẫn-cài-đặt-nhanh) • [Tài liệu người dùng](#-tài-liệu-hướng-dẫn--cẩm-nang-vận-hành)

</div>

---

## 🎯 Về Dự Án (Giới thiệu)

Các doanh nghiệp vừa và nhỏ (SME) thường xuyên gặp khó khăn trong việc vận hành: dữ liệu nằm rải rác ở nhiều file Excel, khó kiểm soát hàng tồn kho, hay việc tính lương nhân sự tốn quá nhiều thời gian. 

**Pocket Mini System** ra đời như một "chiếc túi vạn năng" giải quyết bài toán đó. Đây là một hệ thống **ERP Lite** mạnh mẽ giúp bạn tập trung mọi luồng công việc vào một nền tảng duy nhất. Từ Quản lý Kho bãi, Nhân sự, Tài chính cho đến Đối tác – tất cả đều được thiết kế với giao diện tuyệt đẹp và trực quan.

**Điểm khác biệt lớn nhất?** Hệ thống được tích hợp sẵn Trợ lý AI, giúp bạn không chỉ "nhập liệu" mà còn nhận được những phân tích tự động, báo cáo thông minh và tự động hóa các quyết định kinh doanh.

---

## ✨ Các Tính Năng Cốt Lõi

Hệ thống được thiết kế với 4 phân hệ chính (Modules) và 1 Trợ lý thông minh:

| Phân hệ | Tính năng chi tiết | Giá trị kinh doanh mang lại |
| :--- | :--- | :--- |
| **📦 Quản trị Kho (Inventory)** | Quản lý danh mục, hàng hóa. Theo dõi quy trình Nhập - Xuất - Chuyển kho chặt chẽ. | Ngăn ngừa thất thoát, tối ưu mức tồn kho, dễ dàng tra cứu vị trí và lịch sử mặt hàng. |
| **👥 Nhân sự (HRM)** | Quản lý hồ sơ nhân viên, phân quyền đa cấp bậc, theo dõi chấm công & tự động tính lương. | Giảm tải 80% giấy tờ cho HR, minh bạch lương thưởng, số hóa quy trình nhân sự. |
| **🤝 Đối tác (Partners)** | Quản lý hồ sơ Khách hàng và Nhà cung cấp. Theo dõi lịch sử giao dịch và cấp độ đối tác. | Tăng cường mối quan hệ kinh doanh, không bao giờ bỏ sót lịch sử làm việc. |
| **💰 Tài chính (Finance)** | Theo dõi dòng tiền (Cash flow), tạo phiếu Thu/Chi, đối soát công nợ tự động. | Nắm bắt sức khỏe tài chính doanh nghiệp theo thời gian thực (Real-time). |
| **🤖 Trợ lý AI (AI Assistant)**| Phân tích dữ liệu bán hàng, tự động đề xuất nhập/xuất kho, tóm tắt và dự báo tài chính. | Có ngay một "Giám đốc vận hành ảo" sẵn sàng tư vấn và giải đáp 24/7. |

---

## 🏗 Kiến Trúc Kỹ Thuật & Công Nghệ

Pocket Mini System được xây dựng theo kiến trúc **Domain-Driven Design (DDD)** ở phía Backend, đảm bảo mã nguồn có khả năng mở rộng (scalable) và dễ bảo trì (maintainable).

### Giao diện (Frontend)
- **Framework**: Next.js 14 (Sử dụng App Router hiện đại).
- **Ngôn ngữ**: TypeScript - Đảm bảo an toàn kiểu dữ liệu (Type-safe).
- **Giao diện & Trải nghiệm**: Tailwind CSS cho thiết kế linh hoạt, kết hợp với Framer Motion tạo ra các hiệu ứng chuyển động mượt mà, mang lại trải nghiệm người dùng (UX) cao cấp.

### Máy chủ (Backend)
- **Framework**: NestJS - Framework Node.js hàng đầu cho ứng dụng cấp doanh nghiệp.
- **Cơ sở dữ liệu**: PostgreSQL kết hợp với TypeORM mạnh mẽ.
- **Bảo mật**: Authentication và Authorization qua NestJS/Passport & JWT (JSON Web Tokens).
- **Trí tuệ nhân tạo**: Tích hợp sức mạnh của Gemini AI / OpenRouter API.

---

## 🚀 Hướng Dẫn Cài Đặt Nhanh

Hệ thống hỗ trợ khởi chạy toàn diện bằng Docker (khuyên dùng) để đảm bảo môi trường đồng nhất và cài đặt dễ dàng.

### 📋 Yêu cầu hệ thống
- [Docker](https://www.docker.com/products/docker-desktop) và Docker Compose.
- *Nếu chạy thủ công:* Cần có Node.js (v18+) và PostgreSQL.

### 🐳 Chạy với Docker (Khuyên dùng)
*Chỉ mất 2 phút để khởi chạy toàn bộ hệ thống.*

1. **Thiết lập biến môi trường**
   ```bash
   cp .env.example .env
   # Nhớ mở file .env và điền GEMINI_API_KEY của bạn nhé!
   ```

2. **Xây dựng và Khởi chạy**
   ```bash
   docker-compose up --build -d
   ```

3. **Truy cập ứng dụng**
   - Mở trình duyệt và truy cập: `http://localhost:3000`
   - Lần đầu chạy có thể mất vài chục giây để hệ thống tự động khởi tạo CSDL và biên dịch ứng dụng.

### 💻 Dành riêng cho Developers (Chạy thủ công)

<details>
<summary><b>👉 Nhấn vào đây để xem hướng dẫn chạy môi trường Development thủ công</b></summary>
<br>

**1. Khởi chạy Backend (Mở Terminal 1)**:
```bash
cd Backend
npm install
# Tạo và cấu hình file .env trong thư mục Backend (Tham khảo .env.example)
npm run start:dev
```

**2. Khởi chạy Frontend (Mở Terminal 2)**:
```bash
cd frontend
npm install
# Tạo và cấu hình file .env trong thư mục frontend
npm run dev
```

</details>

---

## 🛑 Dừng / Tắt Ứng Dụng

- **Đối với Docker**: Mở terminal ở thư mục gốc dự án và chạy lệnh:
  ```bash
  docker-compose down
  ```
- **Đối với chạy thủ công**: Nhấn tổ hợp phím `Ctrl + C` tại các cửa sổ terminal đang chạy và chọn `Y` để xác nhận tắt tiến trình.

---

## 📚 Tài Liệu Hướng Dẫn & Cẩm Nang Vận Hành

> [!IMPORTANT]
> Để tìm hiểu cách sử dụng chi tiết trên giao diện (cách tạo mới sản phẩm, quản lý nhân viên, xem báo cáo, phân quyền...), vui lòng đọc cẩm nang vận hành dành cho người dùng cuối tại:

👉 **[Xem Cẩm Nang Vận Hành (USER_GUIDE.md)](./USER_GUIDE.md)**

---

<div align="center">

**Được xây dựng với 💖 và ☕**

*Bản quyền © 2026. Pocket Mini System.*

</div>
