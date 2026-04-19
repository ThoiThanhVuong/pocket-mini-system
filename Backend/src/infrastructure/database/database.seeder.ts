import { Injectable, OnApplicationBootstrap, Logger } from '@nestjs/common';
import { DataSource } from 'typeorm';

@Injectable()
export class DatabaseSeeder implements OnApplicationBootstrap {
  private readonly logger = new Logger(DatabaseSeeder.name);

  constructor(private readonly dataSource: DataSource) {}

  async onApplicationBootstrap() {
    try {
      this.logger.log('Khởi tạo dữ liệu mặc định hệ thống (Permissions, Roles, User Admin)...');
      await this.seedInitialData();
      this.logger.log('Khởi tạo dữ liệu mặc định thành công!');
    } catch (error) {
      this.logger.error('Lỗi khi khởi tạo dữ liệu mặc định', error);
    }
  }

  private async seedInitialData() {
    // Đoạn script tự động đổ data permissions, roles và gán admin bạn cung cấp
    const sql = `
-- 0. Cleanup Duplicates
DELETE FROM "permissions" WHERE "permission_code" IN ('stock_in.completed', 'stock_out.completed', 'stock_transfer.completed');

-- 1. Insert Permissions
INSERT INTO "permissions" ("permission_code", "description") VALUES
-- Users
('user.view', 'Xem User'),
('user.create', 'Tạo User'),
('user.update', 'Cập nhật User'),
('user.delete', 'Xóa User'),
-- Roles
('role.view', 'Xem Role'),
('role.create', 'Tạo Role'),
('role.update', 'Cập nhật Role'),
('role.delete', 'Xóa Role'),
('role.assign_permission', 'Gán Quyền'),
-- Products
('product.view', 'Xem Sản Phẩm'),
('product.create', 'Tạo Sản Phẩm'),
('product.update', 'Cập nhật Sản Phẩm'),
('product.delete', 'Xóa Sản Phẩm'),
-- Categories
('category.view', 'Xem Danh Mục'),
('category.create', 'Tạo Danh Mục'),
('category.update', 'Cập nhật Danh Mục'),
('category.delete', 'Xóa Danh Mục'),
-- Warehouse
('warehouse.view', 'Xem Kho'),
('warehouse.create', 'Tạo Kho'),
('warehouse.update', 'Cập nhật Kho'),
('warehouse.delete', 'Xóa Kho'),
('stock.view', 'Xem Tồn Kho'),
('stock.adjust', 'Kiểm Kê/Điều Chỉnh'),
-- Stock In
('stock_in.view', 'Xem Nhập Kho'),
('stock_in.create', 'Tạo Phiếu Nhập'),
('stock_in.approve', 'Duyệt Phiếu Nhập'),
('stock_in.cancel', 'Hủy Phiếu Nhập'),
('stock_in.complete', 'Hoàn thành Phiếu Nhập'),
-- Stock Out
('stock_out.view', 'Xem Xuất Kho'),
('stock_out.create', 'Tạo Phiếu Xuất'),
('stock_out.approve', 'Duyệt Phiếu Xuất'),
('stock_out.cancel', 'Hủy Phiếu Xuất'),
('stock_out.complete', 'Hoàn thành Phiếu Xuất'),
-- Stock Transfer
('stock_transfer.view', 'Xem Chuyển Kho'),
('stock_transfer.create', 'Tạo Phiếu Chuyển'),
('stock_transfer.approve', 'Duyệt Phiếu Chuyển'),
('stock_transfer.cancel', 'Hủy Phiếu Chuyển'),
('stock_transfer.complete', 'Hoàn thành Phiếu Chuyển'),
-- Suppliers
('supplier.view', 'Xem NCC'),
('supplier.create', 'Tạo NCC'),
('supplier.update', 'Cập nhật NCC'),
('supplier.delete', 'Xóa NCC'),
-- Customers
('customer.view', 'Xem Khách Hàng'),
('customer.create', 'Tạo Khách Hàng'),
('customer.update', 'Cập nhật Khách Hàng'),
('customer.delete', 'Xóa Khách Hàng'),
-- Orders
('order.view', 'Xem Đơn Hàng'),
('order.create', 'Tạo Đơn Hàng'),
('order.update', 'Cập nhật Đơn Hàng'),
('order.process', 'Xử Lý Đơn Hàng'),
-- Finance
('payment.view', 'Xem Thanh Toán'),
('payment.create', 'Tạo Thanh Toán'),
('invoice.view', 'Xem Hóa Đơn'),
-- Leave Requests
('leave_request.view', 'Xem Yêu Cầu Nghỉ'),
('leave_request.create', 'Tạo Yêu Cầu Nghỉ'),
('leave_request.approve', 'Duyệt Yêu Cầu Nghỉ'),
-- Profile
('profile.view', 'Xem Profile'),
('profile.update', 'Cập nhật Profile'),
-- Salary
('salary.view_own', 'Xem Lương (Cá nhân)'),
('salary.manage', 'Quản Lý Lương'),
('salary.export', 'Xuất Bảng Lương'),
-- Reports
('report.view', 'Xem Báo Cáo Chung'),
('report.hr_view', 'Xem Báo Cáo Nhân Sự'),
('report.inventory_view', 'Xem Báo Cáo Kho'),
('report.sales_view', 'Xem Báo Cáo Doanh Số'),
('report.revenue_view', 'Xem Báo Cáo Lợi Nhuận'),
-- System
('audit_log.view', 'Xem Nhat Ky He Thong'),
('system.settings', 'Cai Dat He Thong')
ON CONFLICT ("permission_code") DO NOTHING;

-- 2. Create ADMIN Role if not exists
INSERT INTO "roles" ("role_code", "name", "description") VALUES
('ADMIN', 'System Administrator', 'Quản trị viên hệ thống có toàn quyền')
ON CONFLICT ("role_code") DO NOTHING;

-- 3. Assign ALL Permissions to ADMIN Role
INSERT INTO "role_permissions" ("role_id", "permission_id")
SELECT 
    (SELECT "id" FROM "roles" WHERE "role_code" = 'ADMIN'),
    "id"
FROM "permissions"
ON CONFLICT DO NOTHING;

-- 3.5 Create default Admin User if not exists
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

INSERT INTO "users" ("email", "password_hash", "full_name", "status")
VALUES (
    'admin@example.com',
    crypt('123456', gen_salt('bf'::text, 10)), -- Sinh mã Bcrypt
    'System Admin',
    'active'
)
ON CONFLICT ("email") DO NOTHING;

-- 4. Assign ADMIN Role to your User (admin@example.com) if the user exists
INSERT INTO "user_roles" ("user_id", "role_id")
SELECT u.id, r.id
FROM "users" u
CROSS JOIN "roles" r
WHERE u.email = 'admin@example.com' AND r.role_code = 'ADMIN'
ON CONFLICT DO NOTHING;

-- 5. Seed Test Data (Users, Suppliers, Customers, Warehouses, Categories, Products)

-- 5.1 Insert Test Roles
INSERT INTO "roles" ("role_code", "name", "description") VALUES
('MANAGER', 'Manager', 'Quản lý Hệ Thống'),
('STAFF', 'Staff', 'Nhân viên Bán Hàng/Kho'),
('ACCOUNTANT', 'Accountant', 'Kế Toán Chuyên Trách')
ON CONFLICT ("role_code") DO NOTHING;

-- 5.2 Insert Test Users (Admin already exists, so 3 more = 4 total)
INSERT INTO "users" ("email", "password_hash", "full_name", "status", "base_salary") VALUES
(
    'manager@example.com',
    crypt('123456', gen_salt('bf'::text, 10)),
    'Trần Quản Lý',
    'active',
    20000000
),
(
    'staff@example.com',
    crypt('123456', gen_salt('bf'::text, 10)),
    'Lê Nhân Viên',
    'active',
    10000000
),
(
    'accountant@example.com',
    crypt('123456', gen_salt('bf'::text, 10)),
    'Phạm Kế Toán',
    'active',
    15000000
)
ON CONFLICT ("email") DO NOTHING;

-- 5.3 Assign Roles & Permissions
-- Cấp quyền mẫu cho MANAGER (full quyền kho và sản phẩm)
INSERT INTO "role_permissions" ("role_id", "permission_id")
SELECT r.id, p.id FROM "roles" r CROSS JOIN "permissions" p WHERE r.role_code = 'MANAGER' AND (p.permission_code LIKE 'product.%' OR p.permission_code LIKE 'stock%') ON CONFLICT DO NOTHING;

-- Cấp quyền mẫu cho ACCOUNTANT (quyền tài chính và báo cáo)
INSERT INTO "role_permissions" ("role_id", "permission_id")
SELECT r.id, p.id FROM "roles" r CROSS JOIN "permissions" p WHERE r.role_code = 'ACCOUNTANT' AND (p.permission_code LIKE 'payment.%' OR p.permission_code LIKE 'invoice.%' OR p.permission_code LIKE 'report.%') ON CONFLICT DO NOTHING;

-- Gán Role cho Users
INSERT INTO "user_roles" ("user_id", "role_id")
SELECT u.id, r.id FROM "users" u CROSS JOIN "roles" r WHERE u.email = 'manager@example.com' AND r.role_code = 'MANAGER' ON CONFLICT DO NOTHING;

INSERT INTO "user_roles" ("user_id", "role_id")
SELECT u.id, r.id FROM "users" u CROSS JOIN "roles" r WHERE u.email = 'staff@example.com' AND r.role_code = 'STAFF' ON CONFLICT DO NOTHING;

INSERT INTO "user_roles" ("user_id", "role_id")
SELECT u.id, r.id FROM "users" u CROSS JOIN "roles" r WHERE u.email = 'accountant@example.com' AND r.role_code = 'ACCOUNTANT' ON CONFLICT DO NOTHING;

-- 5.4 Seed Suppliers (3 Suppliers)
INSERT INTO "suppliers" ("name", "contact_person", "phone", "email", "address", "status") VALUES
('Công ty Cổ phần Alpha', 'Trần Anh', '0988123456', 'alpha@example.com', 'Hà Nội', 'active'),
('Nhà PP Beta', 'Lê Bảo', '0912000111', 'beta@example.com', 'TP.HCM', 'active'),
('Kho Tổng Linh Kiện Gamma', 'Phạm Cường', '0909112233', 'gamma@example.com', 'Đà Nẵng', 'active')
ON CONFLICT DO NOTHING; -- Tránh lỗi nếu schema có ràng buộc

-- 5.5 Seed Customers (3 Customers)
INSERT INTO "customers" ("name", "phone", "email", "address", "status") VALUES
('Cửa hàng Điện tử Vui', '0977888999', 'vui@example.com', 'Cần Thơ', 'active'),
('Đại lý Tuấn Hưng', '0933444555', 'tuan@example.com', 'Hải Phòng', 'active'),
('Chị Hoa (Khách sỉ)', '0944556677', 'hoa@example.com', 'Bình Dương', 'active')
ON CONFLICT DO NOTHING;

-- 5.6 Seed Warehouses (3 Warehouses)
INSERT INTO "warehouses" ("name", "location", "status", "manager") VALUES
('Kho Tổng Miền Bắc', 'Hà Nội', 'ACTIVE', 'Trần Quản Lý'),
('Kho Trung Chuyển Miền Trung', 'Đà Nẵng', 'ACTIVE', 'Trần Quản Lý'),
('Kho Trung Tâm Miền Nam', 'TP. HCM', 'ACTIVE', 'Trần Quản Lý')
ON CONFLICT ("name") DO NOTHING;

-- 5.7 Seed Categories
INSERT INTO "categories" ("name", "description", "level") VALUES
('Thiết Bị Lưu Trữ', 'Ổ cứng HDD, SSD, USB', 0),
('Phụ Kiện Máy Tính', 'Bàn phím, Chuột, Tai nghe', 0),
('Thiết Bị Mạng', 'Router, Switch, Cáp mạng', 0)
ON CONFLICT ("name") DO NOTHING;

-- 5.8 Seed Products (5 Products)
INSERT INTO "products" ("sku", "name", "description", "image", "unit", "price", "is_active", "min_stock_level", "category_id")
SELECT 'PRD01', 'Ổ cứng SSD Samsung 1TB', 'SSD NVMe PCIe Gen 4', '', 'Cái', 2100000, true, 10, c.id
FROM "categories" c WHERE c.name = 'Thiết Bị Lưu Trữ' LIMIT 1
ON CONFLICT ("sku") DO NOTHING;

INSERT INTO "products" ("sku", "name", "description", "image", "unit", "price", "is_active", "min_stock_level", "category_id")
SELECT 'PRD02', 'Ổ cứng HDD WD Blue 2TB', 'HDD Sata 3 7200rpm', '', 'Cái', 1350000, true, 15, c.id
FROM "categories" c WHERE c.name = 'Thiết Bị Lưu Trữ' LIMIT 1
ON CONFLICT ("sku") DO NOTHING;

INSERT INTO "products" ("sku", "name", "description", "image", "unit", "price", "is_active", "min_stock_level", "category_id")
SELECT 'PRD03', 'Bàn phím cơ Logitech G Pro', 'Bàn phím Gaming switch Blue', '', 'Cái', 2450000, true, 5, c.id
FROM "categories" c WHERE c.name = 'Phụ Kiện Máy Tính' LIMIT 1
ON CONFLICT ("sku") DO NOTHING;

INSERT INTO "products" ("sku", "name", "description", "image", "unit", "price", "is_active", "min_stock_level", "category_id")
SELECT 'PRD04', 'Chuột Razer DeathAdder V2', 'Chuột Gaming có dây', '', 'Cái', 1100000, true, 8, c.id
FROM "categories" c WHERE c.name = 'Phụ Kiện Máy Tính' LIMIT 1
ON CONFLICT ("sku") DO NOTHING;

INSERT INTO "products" ("sku", "name", "description", "image", "unit", "price", "is_active", "min_stock_level", "category_id")
SELECT 'PRD05', 'Router Wifi 6 TP-Link AX50', 'Phát wifi 2 băng tần chuẩn AX3000', '', 'Cái', 1600000, true, 12, c.id
FROM "categories" c WHERE c.name = 'Thiết Bị Mạng' LIMIT 1
ON CONFLICT ("sku") DO NOTHING;

-- 5.9 Seed Attendance
INSERT INTO "attendance" ("user_id", "date", "check_in", "check_out", "working_hours", "overtime_hours", "status", "note")
SELECT u.id, '2026-04-01', '2026-04-01 08:00:00', '2026-04-01 17:00:00', 8, 0, 'PRESENT', 'Chấm công mẫu'
FROM "users" u WHERE u.email IN ('manager@example.com', 'staff@example.com', 'accountant@example.com') 
ON CONFLICT DO NOTHING;

INSERT INTO "attendance" ("user_id", "date", "check_in", "check_out", "working_hours", "overtime_hours", "status", "note")
SELECT u.id, '2026-04-02', '2026-04-02 08:30:00', '2026-04-02 18:30:00', 8, 1, 'PRESENT', 'Có tăng ca'
FROM "users" u WHERE u.email IN ('manager@example.com', 'staff@example.com', 'accountant@example.com') 
ON CONFLICT DO NOTHING;

INSERT INTO "attendance" ("user_id", "date", "check_in", "check_out", "working_hours", "overtime_hours", "status", "note")
SELECT u.id, '2026-04-03', '2026-04-03 08:00:00', '2026-04-03 12:00:00', 4, 0, 'HALF_DAY', 'Sáng làm chiều nghỉ'
FROM "users" u WHERE u.email IN ('manager@example.com', 'staff@example.com', 'accountant@example.com') 
ON CONFLICT DO NOTHING;

-- 5.10 Seed Payroll (Month 4, 2026)
INSERT INTO "payroll" ("user_id", "month", "year", "total_working_days", "base_salary", "total_salary", "total_normal_hours", "total_ot_hours", "hourly_rate", "status")
SELECT 
    u.id, 
    4, 
    2026, 
    2.5, 
    COALESCE(u.base_salary, 10000000), 
    (COALESCE(u.base_salary, 10000000) / 22) * 2.5, 
    20, 
    1, 
    COALESCE(u.base_salary, 10000000) / (22 * 8), 
    'DRAFT' 
FROM "users" u 
WHERE u.email IN ('manager@example.com', 'staff@example.com', 'accountant@example.com') 
ON CONFLICT DO NOTHING;
    `;
    await this.dataSource.query(sql);
  }
}
