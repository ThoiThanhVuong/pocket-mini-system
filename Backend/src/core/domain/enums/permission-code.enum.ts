export enum PermissionCode {
    // Users
    USER_VIEW = 'user.view',
    USER_CREATE = 'user.create',
    USER_UPDATE = 'user.update',
    USER_DELETE = 'user.delete',
    
    // Roles
    ROLE_VIEW = 'role.view',
    ROLE_CREATE = 'role.create',
    ROLE_UPDATE = 'role.update',
    ROLE_DELETE = 'role.delete',
    ROLE_ASSIGN_PERMISSION = 'role.assign_permission',

    // Products
    PRODUCT_VIEW = 'product.view',
    PRODUCT_CREATE = 'product.create',
    PRODUCT_UPDATE = 'product.update',
    PRODUCT_DELETE = 'product.delete',

    // Categories
    CATEGORY_VIEW = 'category.view',
    CATEGORY_CREATE = 'category.create',
    CATEGORY_UPDATE = 'category.update',
    CATEGORY_DELETE = 'category.delete',

    // Inventory / Warehouse
    WAREHOUSE_VIEW = 'warehouse.view',
    WAREHOUSE_CREATE = 'warehouse.create',
    WAREHOUSE_UPDATE = 'warehouse.update',
    WAREHOUSE_DELETE = 'warehouse.delete',
    STOCK_VIEW = 'stock.view',
    STOCK_ADJUST = 'stock.adjust', // Kiểm kê, điều chỉnh

    // Stock In/Out
    STOCK_IN_VIEW = 'stock_in.view',
    STOCK_IN_CREATE = 'stock_in.create',
    STOCK_IN_APPROVE = 'stock_in.approve',
    STOCK_IN_COMPLETE = 'stock_in.complete',
    STOCK_IN_CANCEL = 'stock_in.cancel',
    
    STOCK_OUT_VIEW = 'stock_out.view',
    STOCK_OUT_CREATE = 'stock_out.create',
    STOCK_OUT_APPROVE = 'stock_out.approve',
    STOCK_OUT_COMPLETE = 'stock_out.complete',
    STOCK_OUT_CANCEL = 'stock_out.cancel',

    // Stock Transfer
    STOCK_TRANSFER_VIEW = 'stock_transfer.view',
    STOCK_TRANSFER_CREATE = 'stock_transfer.create',
    STOCK_TRANSFER_APPROVE = 'stock_transfer.approve',
    STOCK_TRANSFER_COMPLETE = 'stock_transfer.complete',
    STOCK_TRANSFER_CANCEL = 'stock_transfer.cancel',

    // Partners (Suppliers, Customers)
    SUPPLIER_VIEW = 'supplier.view',
    SUPPLIER_CREATE = 'supplier.create',
    SUPPLIER_UPDATE = 'supplier.update',
    SUPPLIER_DELETE = 'supplier.delete',
    
    CUSTOMER_VIEW = 'customer.view',
    CUSTOMER_CREATE = 'customer.create',
    CUSTOMER_UPDATE = 'customer.update',
    CUSTOMER_DELETE = 'customer.delete',

    // Orders
    ORDER_VIEW = 'order.view',
    ORDER_CREATE = 'order.create',
    ORDER_UPDATE = 'order.update',
    ORDER_PROCESS = 'order.process', // Xử lý đơn

    // Finance
    PAYMENT_VIEW = 'payment.view',
    PAYMENT_CREATE = 'payment.create',
    INVOICE_VIEW = 'invoice.view',

    // Leave Requests
    LEAVE_REQUEST_VIEW = 'leave_request.view',
    LEAVE_REQUEST_CREATE = 'leave_request.create',
    LEAVE_REQUEST_APPROVE = 'leave_request.approve', // Duyệt/Từ chối

    // User Profile (Self)
    PROFILE_VIEW = 'profile.view',
    PROFILE_UPDATE = 'profile.update', // Tự sửa thông tin của mình

    // Salary / Payroll
    SALARY_VIEW_OWN = 'salary.view_own', // Xem lương mình
    SALARY_MANAGE = 'salary.manage', // Tính lương, quản lý lương (Manager)
    SALARY_EXPORT = 'salary.export', // In bảng lương

    // Reports / System
    REPORT_VIEW = 'report.view', // Quyền chung xem báo cáo
    REPORT_HR_VIEW = 'report.hr_view', // Thống kê nhân sự, lương thưởng
    REPORT_INVENTORY_VIEW = 'report.inventory_view', // Thống kê kho, sản phẩm
    REPORT_SALES_VIEW = 'report.sales_view', // Thống kê doanh số
    REPORT_REVENUE_VIEW = 'report.revenue_view', // Thống kê lợi nhuận (Director/Accountant)

    AUDIT_LOG_VIEW = 'audit_log.view',
    SYSTEM_SETTINGS = 'system.settings',
    SYSTEM_VIEW = 'system.view',
    SYSTEM_UPDATE = 'system.update'
}
