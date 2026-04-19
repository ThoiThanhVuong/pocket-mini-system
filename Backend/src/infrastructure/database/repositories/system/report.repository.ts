import { Injectable } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { IReportRepository } from '../../../../core/interfaces/repositories/system/report.repository.interface';
import {
    SalesKpi,
    SalesTrendItem,
    TopProductItem,
    InventoryKpi,
    InventoryByCategoryItem,
    CustomersKpi,
    CustomersByMonthItem,
    CustomerRevenueItem,
} from '../../../../core/interfaces/services/system/report.service.interface';

@Injectable()
export class ReportRepository implements IReportRepository {
    constructor(private readonly dataSource: DataSource) {}

    // ─── Sales ──────────────────────────────────────────────────────────────────
    async getSalesKpi(interval: string): Promise<SalesKpi> {
        const revenueRes = await this.dataSource.query(`
            SELECT COALESCE(SUM(soi.quantity * soi.price), 0) AS total
            FROM stock_out so
            JOIN stock_out_items soi ON soi.stock_out_id = so.id
            WHERE so.status IN ('completed', 'approved')
              AND so.created_at >= NOW() - INTERVAL '${interval}'
        `);
        const costRes = await this.dataSource.query(`
            SELECT COALESCE(SUM(sii.quantity * sii.price), 0) AS total
            FROM stock_in si
            JOIN stock_in_items sii ON sii.stock_in_id = si.id
            WHERE si.status IN ('completed', 'approved')
              AND si.created_at >= NOW() - INTERVAL '${interval}'
        `);
        const ordersRes = await this.dataSource.query(`
            SELECT COUNT(*) AS total
            FROM stock_out
            WHERE status != 'cancelled'
              AND created_at >= NOW() - INTERVAL '${interval}'
        `);
        return {
            totalRevenue: Number(revenueRes[0]?.total || 0),
            totalCost:    Number(costRes[0]?.total || 0),
            totalOrders:  Number(ordersRes[0]?.total || 0),
        };
    }

    async getSalesTrend(months: number): Promise<SalesTrendItem[]> {
        const revenueRows = await this.dataSource.query(`
            SELECT
                TO_CHAR(DATE_TRUNC('month', so.created_at), 'Mon') AS month,
                DATE_TRUNC('month', so.created_at) AS month_date,
                COALESCE(SUM(soi.quantity * soi.price), 0) AS revenue
            FROM stock_out so
            JOIN stock_out_items soi ON soi.stock_out_id = so.id
            WHERE so.status IN ('completed', 'approved')
              AND so.created_at >= NOW() - INTERVAL '${months} months'
            GROUP BY DATE_TRUNC('month', so.created_at), TO_CHAR(DATE_TRUNC('month', so.created_at), 'Mon')
            ORDER BY month_date
        `);
        const costRows = await this.dataSource.query(`
            SELECT
                DATE_TRUNC('month', si.created_at) AS month_date,
                COALESCE(SUM(sii.quantity * sii.price), 0) AS cost
            FROM stock_in si
            JOIN stock_in_items sii ON sii.stock_in_id = si.id
            WHERE si.status IN ('completed', 'approved')
              AND si.created_at >= NOW() - INTERVAL '${months} months'
            GROUP BY DATE_TRUNC('month', si.created_at)
            ORDER BY month_date
        `);
        const costMap: Record<string, number> = {};
        for (const r of costRows) {
            costMap[r.month_date] = Number(r.cost);
        }
        return revenueRows.map((r: any): SalesTrendItem => ({
            month:   r.month,
            revenue: Number(r.revenue),
            cost:    costMap[r.month_date] || 0,
        }));
    }

    async getTopProducts(interval: string): Promise<TopProductItem[]> {
        const rows = await this.dataSource.query(`
            SELECT
                p.name,
                SUM(soi.quantity) AS quantity,
                SUM(soi.quantity * soi.price) AS revenue
            FROM stock_out so
            JOIN stock_out_items soi ON soi.stock_out_id = so.id
            JOIN products p ON p.id = soi.product_id
            WHERE so.status IN ('completed', 'approved')
              AND so.created_at >= NOW() - INTERVAL '${interval}'
            GROUP BY p.id, p.name
            ORDER BY quantity DESC
            LIMIT 5
        `);
        return rows.map((r: any): TopProductItem => ({
            name:     r.name,
            quantity: Number(r.quantity),
            revenue:  Number(r.revenue),
        }));
    }

    // ─── Inventory ──────────────────────────────────────────────────────────────
    async getInventoryKpi(): Promise<InventoryKpi> {
        const totalRes = await this.dataSource.query(`
            SELECT COUNT(*) AS total FROM products WHERE is_active = true
        `);
        const lowStockRes = await this.dataSource.query(`
            SELECT COUNT(*) AS total
            FROM stock s
            JOIN products p ON p.id = s.product_id
            WHERE s.quantity > 0 AND s.quantity <= p.min_stock_level AND p.is_active = true
        `);
        const outOfStockRes = await this.dataSource.query(`
            SELECT COUNT(*) AS total
            FROM stock s
            JOIN products p ON p.id = s.product_id
            WHERE s.quantity = 0 AND p.is_active = true
        `);
        return {
            totalProducts:   Number(totalRes[0]?.total || 0),
            lowStockItems:   Number(lowStockRes[0]?.total || 0),
            outOfStockItems: Number(outOfStockRes[0]?.total || 0),
        };
    }

    async getInventoryByCategory(): Promise<InventoryByCategoryItem[]> {
        const rows = await this.dataSource.query(`
            SELECT
                COALESCE(c.name, 'Chưa phân loại') AS name,
                COUNT(CASE WHEN s.quantity > p.min_stock_level THEN 1 END) AS in_stock,
                COUNT(CASE WHEN s.quantity > 0 AND s.quantity <= p.min_stock_level THEN 1 END) AS low_stock,
                COUNT(CASE WHEN s.quantity = 0 THEN 1 END) AS out_of_stock
            FROM products p
            LEFT JOIN categories c ON c.id = p.category_id
            LEFT JOIN stock s ON s.product_id = p.id
            WHERE p.is_active = true
            GROUP BY c.name
            ORDER BY COUNT(p.id) DESC
            LIMIT 8
        `);
        return rows.map((r: any): InventoryByCategoryItem => ({
            name:       r.name,
            inStock:    Number(r.in_stock || 0),
            lowStock:   Number(r.low_stock || 0),
            outOfStock: Number(r.out_of_stock || 0),
        }));
    }

    // ─── Customers ──────────────────────────────────────────────────────────────
    async getCustomersKpi(interval: string): Promise<CustomersKpi> {
        const totalRes = await this.dataSource.query(`
            SELECT COUNT(*) AS total FROM customers
        `);
        const newRes = await this.dataSource.query(`
            SELECT COUNT(*) AS total FROM customers
            WHERE created_at >= NOW() - INTERVAL '${interval}'
        `);
        return {
            totalCustomers: Number(totalRes[0]?.total || 0),
            newThisPeriod:  Number(newRes[0]?.total || 0),
        };
    }

    async getCustomersByMonth(months: number): Promise<CustomersByMonthItem[]> {
        const rows = await this.dataSource.query(`
            SELECT
                TO_CHAR(DATE_TRUNC('month', created_at), 'Mon') AS month,
                COUNT(*) AS new_customers
            FROM customers
            WHERE created_at >= NOW() - INTERVAL '${months} months'
            GROUP BY DATE_TRUNC('month', created_at), TO_CHAR(DATE_TRUNC('month', created_at), 'Mon')
            ORDER BY DATE_TRUNC('month', created_at)
        `);
        return rows.map((r: any): CustomersByMonthItem => ({
            month:        r.month,
            newCustomers: Number(r.new_customers),
        }));
    }

    async getRevenueByCustomer(interval: string): Promise<CustomerRevenueItem[]> {
        const rows = await this.dataSource.query(`
            SELECT 
                c.id AS customer_id,
                c.name AS customer_name,
                COUNT(DISTINCT so.id) AS total_orders,
                COALESCE(SUM(soi.quantity * soi.price), 0) AS total_revenue
            FROM customers c
            LEFT JOIN stock_out so ON so.customer_id = c.id
                AND so.status IN ('completed', 'approved')
                AND so.created_at >= NOW() - INTERVAL '${interval}'
            LEFT JOIN stock_out_items soi ON soi.stock_out_id = so.id
            GROUP BY c.id, c.name
            HAVING COUNT(DISTINCT so.id) > 0 OR COALESCE(SUM(soi.quantity * soi.price), 0) > 0
            ORDER BY total_revenue DESC
        `);
        
        return rows.map((r: any): CustomerRevenueItem => ({
            customerId: r.customer_id,
            customerName: r.customer_name,
            totalOrders: Number(r.total_orders),
            totalRevenue: Number(r.total_revenue)
        }));
    }
}
