# 📘 CẨM NANG VẬN HÀNH POCKET MINI SYSTEM

Chào mừng bạn đến với hướng dẫn sử dụng chi tiết cho hệ thống ERP Lite. Tài liệu này được biên soạn để giúp người dùng làm chủ mọi tính năng theo quy trình vận hành thực tế.

---

## 🗂 MỤC LỤC
1. [Quản lý Danh mục & Sản phẩm](#1-quản-lý-danh-mục--sản-phẩm)
2. [Quản lý Kho hàng (Warehouse)](#2-quản-lý-kho-hàng-warehouse)
3. [Quản lý Đối tác (Khách hàng & Nhà cung cấp)](#3-quản-lý-đối-tác-khách-hàng--nhà-cung-cấp)
4. [Nghiệp vụ Kho (Nhập / Xuất / Chuyển)](#4-nghiệp-vụ-kho-nhập--xuất--chuyển)
5. [Quản lý Nhân sự & Tính lương](#5-quản-lý-nhân-sự--tính-lương)
6. [Quản lý Tài chính (Dòng tiền)](#6-quản-lý-tài-chính-dòng-tiền)
7. [Trợ lý ảo AI & Nhật ký](#7-trợ-lý-ảo-ai--nhật-ký)

---

## 1. Quản lý Danh mục & Sản phẩm
Để bắt đầu, bạn cần khai báo các mặt hàng kinh doanh.
- **Tạo Danh mục**: Vào **Sản phẩm** -> Tab **Categories** -> **Add Category**. Phân loại hàng giúp báo cáo rõ ràng hơn (VD: Gia dụng, Điện tử).
- **Thêm Sản phẩm**: Vào tab **Products** -> **Add Product**.
  - **SKU**: Mã duy nhất của sản phẩm.
  - **Min Stock Level**: Rất quan trọng! Nếu kho xuống dưới mức này, AI sẽ tự động cảnh báo bạn cần nhập hàng.
  - **Price**: Giá bán niêm yết.

## 2. Quản lý Kho hàng (Warehouse)
Hệ thống hỗ trợ quản lý đa kho.
- **Thêm Kho mới**: Vào menu **Kho hàng** -> **Thêm kho**.
- **Thông tin**: Nhập tên kho, địa chỉ và **Sức chứa**. 
- **Theo dõi**: Tại danh sách kho, bấm biểu tượng **Con mắt** (Xem tồn kho) để biết chính xác trong kho đó đang có những mặt hàng gì.

## 3. Quản lý Đối tác (Khách hàng & Nhà cung cấp)
- **Nhà cung cấp**: Vào **Đối tác** -> **Nhà cung cấp** -> **Thêm nhà cung cấp**. Đây là đối tượng bạn sẽ chọn khi làm phiếu **Nhập kho**.
- **Khách hàng**: Vào **Đối tác** -> **Khách hàng** -> **Thêm khách hàng**. Bạn có thể thiết lập mức chiết khấu hoặc hạng thành viên (Vàng, Bạc, Đồng) để quản lý tệp khách thân thiết.

## 4. Nghiệp vụ Kho (Nhập / Xuất / Chuyển)
Đây là phần cốt lõi của hoạt động kinh doanh.

### A. Nhập kho (Mua hàng)
1. Vào **Stock Management** -> Tab **Stock In** -> **Tạo phiếu nhập kho**.
2. **Bước 1**: Chọn Nhà cung cấp & Kho nhận hàng.
3. **Bước 2**: Chọn sản phẩm, nhập số lượng và giá vốn nhập thực tế.
4. **Sau khi tạo**: Phiếu ở trạng thái *PENDING*. Bạn cần bấm **Duyệt** -> **Hoàn thành** để số lượng tồn kho được cộng vào hệ thống.
5. Cuối cùng, bấm **Thanh toán** để ghi nhận bạn đã trả tiền cho nhà cung cấp.

### B. Xuất kho (Bán hàng)
1. Vào tab **Stock Out** -> **Tạo phiếu xuất kho**.
2. Chọn Khách hàng & Kho xuất đi. Hệ thống sẽ báo lỗi nếu kho bạn chọn không đủ hàng.
3. Thực hiện **Duyệt** -> **Hoàn thành** -> **Thanh toán** để trừ tiền hàng và ghi nhận doanh thu.

### C. Chuyển kho (Cân đối tồn kho)
1. Vào tab **Stock Transfer** -> **Tạo phiếu chuyển kho**.
2. Chọn **Kho đi** và **Kho đến**. Hàng hóa sẽ được trừ ở kho đi và cộng vào kho đến ngay khi phiếu được hoàn thành.

## 5. Quản lý Nhân sự & Tính lương
- **Cài đặt Lương**: Vào **Người dùng** -> Tab **Vai trò**. Chỉnh sửa từng vai trò để cài đặt **Lương cơ bản**.
- **Tính lương hàng tháng**:
  1. Vào tab **Tính lương**.
  2. Chọn tháng/năm.
  3. Bấm **Tính toán lương**: Hệ thống tự động quét toàn bộ nhân viên và áp mức lương cơ bản để tạo bảng tính.
  4. Bạn có thể xác nhận từng dòng lương và in phiếu lương cho nhân viên.

## 6. Quản lý Tài chính (Dòng tiền)
Hệ thống theo dõi dòng tiền ra (Chi) và dòng tiền vào (Thu).
- **Thanh toán đơn hàng**: Mọi phiếu nhập/xuất kho đều tạo ra giao dịch tương ứng tại đây.
- **Thu/Chi ngoài**: Tại menu **Quản lý dòng tiền**, bạn có thể tạo phiếu thu tiền hoặc chi tiền cho các mục đích không liên quan đến sản phẩm (tiền nhà, tiền điện, phí dịch vụ...).

## 7. Trợ lý ảo AI & Nhật ký
- **AI Assistant**: Ra lệnh bằng tiếng Việt để phân tích dữ liệu. VD: "Thống kê cho tôi các mặt hàng đã hết", "Dự báo doanh thu kho chính".
- **Audit Logs**: Vào menu **System Logs** để xem ai đã thực hiện thao tác gì (Xóa, Sửa, Đăng nhập) để đảm bảo an ninh hệ thống.

---
© 2026 Pocket Mini System Team. Chúc bạn vận hành hiệu quả!
