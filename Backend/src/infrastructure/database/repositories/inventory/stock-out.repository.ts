import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { StockOut as StockOutEntity } from '../../entities/warehouse/stock-out.entity';
import { StockOutItem as StockOutItemEntity } from '../../entities/warehouse/stock-out-item.entity';
import { StockOut as StockOutDomain } from '../../../../core/domain/entities/warehouse/stock-out.entity';
import { StockOutItem as StockOutItemDomain } from '../../../../core/domain/entities/warehouse/stock-out-item.entity';
import { TransactionStatus } from '../../../../core/domain/enums/transaction-status.enum';
import { IStockOutRepository } from '../../../../core/interfaces/repositories/inventory/stock-out.repository.interface';
import { DeepPartial } from '../../../../core/interfaces/repositories/base.repository.interface';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class StockOutRepository implements IStockOutRepository {
    constructor(
        @InjectRepository(StockOutEntity)
        private readonly repo: Repository<StockOutEntity>,
        @InjectRepository(StockOutItemEntity)
        private readonly itemRepo: Repository<StockOutItemEntity>,
    ) {}

    async save(domain: StockOutDomain): Promise<StockOutDomain> {
        await this.repo.update(domain.id, { status: domain.status });
        return domain;
    }

    async findOneById(id: string): Promise<StockOutDomain | null> {
        return this.findWithItems(id);
    }

    async findWithItems(id: string): Promise<StockOutDomain | null> {
        const e = await this.repo.findOne({
            where: { id },
            relations: ['customer', 'warehouse', 'user', 'stockOutItems', 'stockOutItems.product'],
        });
        return e ? this.toDomain(e) : null;
    }

    async findByWarehouse(warehouseId: string): Promise<StockOutDomain[]> {
        const list = await this.repo.find({
            where: { warehouse: { id: warehouseId } },
            relations: ['customer', 'warehouse', 'stockOutItems'],
        });
        return list.map(e => this.toDomain(e));
    }

    async findByStatus(status: string): Promise<StockOutDomain[]> {
        const list = await this.repo.find({
            where: { status },
            relations: ['customer', 'warehouse', 'stockOutItems'],
        });
        return list.map(e => this.toDomain(e));
    }

    async findAll(): Promise<StockOutDomain[]> {
        const list = await this.repo.find({ relations: ['customer', 'warehouse', 'stockOutItems', 'stockOutItems.product'] });
        return list.map(e => this.toDomain(e));
    }

    async remove(domain: StockOutDomain): Promise<StockOutDomain> {
        await this.repo.delete(domain.id);
        return domain;
    }

    async saveNew(
        id: string, customerId: string, warehouseId: string, userId: string,
        referenceCode: string, status: string,
        items: { productId: string; quantity: number; price: number }[],
    ): Promise<void> {
        await this.repo.query(
            `INSERT INTO stock_out (id, customer_id, warehouse_id, user_id, reference_code, status)
             VALUES ($1, $2, $3, $4, $5, $6)`,
            [id, customerId, warehouseId, userId, referenceCode, status],
        );
        for (const item of items) {
            const itemId = uuidv4();
            await this.itemRepo.query(
                `INSERT INTO stock_out_items (id, stock_out_id, product_id, quantity, price)
                 VALUES ($1, $2, $3, $4, $5)`,
                [itemId, id, item.productId, item.quantity, item.price],
            );
        }
    }

    // ── Stubs ────────────────────────────────────────────────────────
    create(data: DeepPartial<StockOutDomain>): StockOutDomain { throw new Error('Not implemented'); }
    createMany(data: DeepPartial<StockOutDomain>[]): StockOutDomain[] { throw new Error('Not implemented'); }
    async saveMany(data: StockOutDomain[]): Promise<StockOutDomain[]> { throw new Error('Not implemented'); }
    async findByCondition(f: any): Promise<StockOutDomain | null> { throw new Error('Not implemented'); }
    async findWithRelations(r: any): Promise<StockOutDomain[]> { throw new Error('Not implemented'); }

    private toDomain(e: StockOutEntity): StockOutDomain {
        const items: StockOutItemDomain[] = (e.stockOutItems || []).map(i => {
            const item = new StockOutItemDomain(
                i.id,
                e.id,
                i.productId || (i.product as any)?.id || 'SYS-UNKNOWN-PRODUCT',
                i.quantity,
                i.price,
            );
            (item as any).productName = (i.product as any)?.name ?? '';
            return item;
        });
        const domain = new StockOutDomain(
            e.id,
            (e.customer as any)?.id ?? (e as any).customerId ?? 'SYS-UNKNOWN-CUSTOMER',
            (e.warehouse as any)?.id ?? (e as any).warehouseId ?? 'SYS-UNKNOWN-WH',
            (e.user as any)?.id ?? (e as any).userId ?? '',
            e.referenceCode,
            items,
            e.status as TransactionStatus,
            e.createdAt as Date,
            e.updatedAt as Date,
        );
        (domain as any).customerName = (e.customer as any)?.name ?? '';
        (domain as any).warehouseName = (e.warehouse as any)?.name ?? '';
        return domain;
    }
}
