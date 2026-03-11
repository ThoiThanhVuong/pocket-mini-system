import { Injectable } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { IDashboardRepository } from '../../../core/interfaces/repositories/dashboard.repository.interface';
import {
    DashboardKpi,
    MonthlyChartItem,
    RecentActivityItem,
} from '../../../core/interfaces/services/dashboard.service.interface';

@Injectable()
export class DashboardRepository implements IDashboardRepository {
    constructor(private readonly dataSource: DataSource) {}

    async getKpi(): Promise<DashboardKpi> {
        const revenueResult = await this.dataSource.query(`
            SELECT COALESCE(SUM(amount), 0) AS total
            FROM payments
            WHERE status = 'paid'
              AND reference_type IN ('stock_out', 'manual_income')
        `);
        const productsResult = await this.dataSource.query(`
            SELECT COUNT(*) AS total FROM products WHERE is_active = true
        `);
        const ordersResult = await this.dataSource.query(`
            SELECT COUNT(*) AS total FROM stock_in WHERE status != 'cancelled'
        `);
        const customersResult = await this.dataSource.query(`
            SELECT COUNT(*) AS total FROM customers
        `);
        const pendingStockOutResult = await this.dataSource.query(`
            SELECT COUNT(*) AS total FROM stock_out WHERE status = 'pending'
        `);
        return {
            totalRevenue:     Number(revenueResult[0]?.total || 0),
            totalProducts:    Number(productsResult[0]?.total || 0),
            totalStockIns:    Number(ordersResult[0]?.total || 0),
            totalCustomers:   Number(customersResult[0]?.total || 0),
            pendingStockOuts: Number(pendingStockOutResult[0]?.total || 0),
        };
    }

    async getMonthlyChart(): Promise<MonthlyChartItem[]> {
        const stockInData = await this.dataSource.query(`
            SELECT 
                TO_CHAR(DATE_TRUNC('month', si.created_at), 'Mon') AS month,
                DATE_TRUNC('month', si.created_at) AS month_date,
                COALESCE(SUM(sii.quantity * sii.price), 0) AS total
            FROM stock_in si
            JOIN stock_in_items sii ON sii.stock_in_id = si.id
            WHERE si.created_at >= NOW() - INTERVAL '7 months'
              AND si.status IN ('completed', 'approved')
            GROUP BY DATE_TRUNC('month', si.created_at), TO_CHAR(DATE_TRUNC('month', si.created_at), 'Mon')
            ORDER BY month_date
        `);
        const stockOutData = await this.dataSource.query(`
            SELECT 
                TO_CHAR(DATE_TRUNC('month', so.created_at), 'Mon') AS month,
                DATE_TRUNC('month', so.created_at) AS month_date,
                COALESCE(SUM(soi.quantity * soi.price), 0) AS total
            FROM stock_out so
            JOIN stock_out_items soi ON soi.stock_out_id = so.id
            WHERE so.created_at >= NOW() - INTERVAL '7 months'
              AND so.status IN ('completed', 'approved')
            GROUP BY DATE_TRUNC('month', so.created_at), TO_CHAR(DATE_TRUNC('month', so.created_at), 'Mon')
            ORDER BY month_date
        `);
        const monthMap: Record<string, { monthDate: string; month: string; stockIn: number; stockOut: number }> = {};
        for (const row of stockInData) {
            monthMap[row.month_date] = { monthDate: row.month_date, month: row.month, stockIn: Number(row.total), stockOut: 0 };
        }
        for (const row of stockOutData) {
            if (monthMap[row.month_date]) {
                monthMap[row.month_date].stockOut = Number(row.total);
            } else {
                monthMap[row.month_date] = { monthDate: row.month_date, month: row.month, stockIn: 0, stockOut: Number(row.total) };
            }
        }
        return Object.values(monthMap)
            .sort((a, b) => new Date(a.monthDate).getTime() - new Date(b.monthDate).getTime())
            .map(({ month, stockIn, stockOut }) => ({ month, stockIn, stockOut }));
    }

    async getRecentActivity(): Promise<RecentActivityItem[]> {
        const logs = await this.dataSource.query(`
            SELECT 
                al.entity_type AS type,
                al.action,
                al.entity_id AS id,
                al.created_at,
                al.changes,
                u.full_name AS user_name,
                -- Lấy reference_code từ changes JSONB nếu có
                al.changes->>'referenceCode' AS code
            FROM audit_logs al
            LEFT JOIN users u ON u.id = al.user_id
            ORDER BY al.created_at DESC
            LIMIT 10
        `);

        return logs.map(log => {
            let description = '';
            const actionLabel = log.action === 'CREATE' ? 'Tạo mới' :
                               log.action === 'APPROVE' ? 'Duyệt' :
                               log.action === 'COMPLETE' ? 'Hoàn thành' :
                               log.action === 'CANCEL' ? 'Huỷ' : log.action;

            if (log.type === 'stock_in') {
                description = `${actionLabel} phiếu nhập ${log.code || ''}`;
            } else if (log.type === 'stock_out') {
                description = `${actionLabel} phiếu xuất ${log.code || ''}`;
            } else {
                description = `${actionLabel} ${log.type}`;
            }

            return {
                type: log.type,
                code: log.code || log.id.slice(0, 8),
                status: log.action,
                createdAt: log.created_at,
                description: description.trim(),
            };
        });
    }

    async getLowStockCount(): Promise<number> {
        const result = await this.dataSource.query(`
            SELECT COUNT(*) AS total
            FROM stock s
            JOIN products p ON p.id = s.product_id
            WHERE s.quantity <= p.min_stock_level
              AND p.is_active = true
        `);
        return Number(result[0]?.total || 0);
    }
}
