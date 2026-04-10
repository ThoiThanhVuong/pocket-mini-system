# Hướng dẫn Sao lưu và Phục hồi Cơ sở dữ liệu

Dự án này sử dụng PostgreSQL cài đặt qua Docker. Các file `.bat` trong thư mục này được thiết kế để tự động hoá việc sao lưu (backup) và phục hồi (restore) trên Windows.

## 1. Yêu cầu trước khi chạy
- Máy tính phải đang cài đặt và bật **Docker Desktop**.
- Ứng dụng/Database Docker (`pocket-mini-db`) đang phải ở trạng thái chạy (Tức là bạn đã gõ `docker-compose up -d` trước đó).

## 2. Cách Sao Lưu (Backup)
1. Chỉ cần nhấp đúp (Double click) vào tệp `backup-db.bat` trong thư mục `scripts`.
2. Script sẽ tự động lấy toàn bộ dữ liệu CSDL hiện tại và xuất thành file ảnh `.sql`.
3. File SQL này được lưu ở thư mục `scripts/backups/`. Ví dụ tên tệp: `backup_20260410_103000.sql`. Hãy cất giữ tệp này để đề phòng rủi ro.

## 3. Cách Phục Hồi (Restore)
> ⚠️ **CẢNH BÁO**: Việc phục hồi sẽ XÓA SẠCH toàn bộ dữ liệu của thời điểm hiện tại và chép đè dữ liệu cũ vào.

1. Mở Terminal / Command Prompt tại thư mục `scripts`.
2. Gõ câu lệnh theo cú pháp sau:
   ```cmd
   restore-db.bat backups\ten_file_backup.sql
   ```
   (Thay `ten_file_backup.sql` bằng đúng tên file bạn muốn khôi phục).
3. Hệ thống sẽ hỏi xác nhận `(Y/N)`. Bạn gõ `Y` và bấm Enter để tiến hành chép đè.

Vậy là xong! Quy trình được tự động hoá 100%. Mọi lỗi phát sinh thường do Docker chưa chạy.
