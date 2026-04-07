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
    `;
    await this.dataSource.query(sql);
  }
}
