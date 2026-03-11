export enum UserRole {
    ADMIN = 'ADMIN', // Quản trị viên hệ thống
    DIRECTOR = 'DIRECTOR', // Giám đốc (có thể xem hết báo cáo)
    
    // Warehouse Roles
    WAREHOUSE_MANAGER = 'WAREHOUSE_MANAGER', // Quản lý kho (Duyệt nhập/xuất/chuyển)
    WAREHOUSE_STAFF = 'WAREHOUSE_STAFF', // Nhân viên kho (Thực hiện nhập/xuất)
    
    // Sales Roles
    SALES_MANAGER = 'SALES_MANAGER', // Quản lý bán hàng
    SALES_STAFF = 'SALES_STAFF', // Nhân viên bán hàng
    
    // Finance Roles
    ACCOUNTANT = 'ACCOUNTANT', // Kế toán (Thanh toán, công nợ)

    // HR Roles
    HR_MANAGER = 'HR_MANAGER', // Quản lý nhân sự
    
    // General
    STAFF = 'STAFF', // Nhân viên chung
    CUSTOMER = 'CUSTOMER' // Khách hàng (nếu có portal riêng)
}
