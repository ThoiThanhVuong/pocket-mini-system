import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { StockIn as StockInEntity } from '../entities/warehouse/stock-in.entity';
import { StockInItem as StockInItemEntity } from '../entities/warehouse/stock-in-item.entity';
import { StockIn as StockInDomain } from '../../../core/domain/entities/warehouse/stock-in.entity';
import { StockInItem as StockInItemDomain } from '../../../core/domain/entities/warehouse/stock-in-item.entity';
import { TransactionStatus } from '../../../core/domain/enums/transaction-status.enum';
import { IStockInRepository } from '../../../core/interfaces/repositories/stock-in.repository.interface';
import { DeepPartial } from '../../../core/interfaces/repositories/base.repository.interface';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class StockInRepository implements IStockInRepository {
    constructor(
        @InjectRepository(StockInEntity)
        private readonly repo: Repository<StockInEntity>,
        @InjectRepository(StockInItemEntity)
        private readonly itemRepo: Repository<StockInItemEntity>,
    ) {}

    async save(domain: StockInDomain): Promise<StockInDomain> {
        // Update status of existing record
        await this.repo.update(domain.id, { status: domain.status });
        return domain;
    }

    async findOneById(id: string): Promise<StockInDomain | null> {
        return this.findWithItems(id);
    }

    async findWithItems(id: string): Promise<StockInDomain | null> {
        const e = await this.repo.findOne({
            where: { id },
            relations: ['supplier', 'warehouse', 'user', 'stockInItems', 'stockInItems.product'],
        });
        return e ? this.toDomain(e) : null;
    }

    async findByWarehouse(warehouseId: string): Promise<StockInDomain[]> {
        const list = await this.repo.find({
            where: { warehouse: { id: warehouseId } },
            relations: ['supplier', 'warehouse', 'stockInItems', 'stockInItems.product'],
        });
        return list.map(e => this.toDomain(e));
    }

    async findByStatus(status: string): Promise<StockInDomain[]> {
        const list = await this.repo.find({
            where: { status },
            relations: ['supplier', 'warehouse', 'stockInItems'],
        });
        return list.map(e => this.toDomain(e));
    }

    async findAll(): Promise<StockInDomain[]> {
        const list = await this.repo.find({ relations: ['supplier', 'warehouse', 'stockInItems', 'stockInItems.product'] });
        return list.map(e => this.toDomain(e));
    }

    async remove(domain: StockInDomain): Promise<StockInDomain> {
        await this.repo.delete(domain.id);
        return domain;
    }

    // Save new entity with items (used in service for creation)
    async saveNew(
        id: string, supplierId: string, warehouseId: string, userId: string,
        referenceCode: string, status: string,
        items: { productId: string; quantity: number; price: number }[],
    ): Promise<void> {
        const entity = this.repo.create({ id, referenceCode, status } as any);
        // Use query builder to create with FK columns
        await this.repo.query(
            `INSERT INTO stock_in (id, supplier_id, warehouse_id, user_id, reference_code, status)
             VALUES ($1, $2, $3, $4, $5, $6)`,
            [id, supplierId, warehouseId, userId, referenceCode, status],
        );
        for (const item of items) {
            const itemId = uuidv4();
            await this.itemRepo.query(
                `INSERT INTO stock_in_items (id, stock_in_id, product_id, quantity, price)
                 VALUES ($1, $2, $3, $4, $5)`,
                [itemId, id, item.productId, item.quantity, item.price],
            );
        }
    }

    // ── Stubs ────────────────────────────────────────────────────────
    create(data: DeepPartial<StockInDomain>): StockInDomain { throw new Error('Not implemented'); }
    createMany(data: DeepPartial<StockInDomain>[]): StockInDomain[] { throw new Error('Not implemented'); }
    async saveMany(data: StockInDomain[]): Promise<StockInDomain[]> { throw new Error('Not implemented'); }
    async findByCondition(f: any): Promise<StockInDomain | null> { throw new Error('Not implemented'); }
    async findWithRelations(r: any): Promise<StockInDomain[]> { throw new Error('Not implemented'); }

    // ── Helpers ──────────────────────────────────────────────────────
    private toDomain(e: StockInEntity): StockInDomain {
        const items: StockInItemDomain[] = (e.stockInItems || []).map(i => {
            const item = new StockInItemDomain(
                i.id,
                e.id,
                i.productId || (i.product as any)?.id || 'SYS-UNKNOWN-PRODUCT',
                i.quantity,
                i.price,
            );
            (item as any).productName = (i.product as any)?.name ?? '';
            return item;
        });
        const domain = new StockInDomain(
            e.id,
            (e.supplier as any)?.id ?? (e as any).supplierId ?? 'SYS-UNKNOWN-SUPPLIER',
            (e.warehouse as any)?.id ?? (e as any).warehouseId ?? 'SYS-UNKNOWN-WH',
            (e.user as any)?.id ?? (e as any).userId ?? '',
            e.referenceCode,
            items,
            e.status as TransactionStatus,
            e.createdAt as Date,
            e.updatedAt as Date,
        );
        (domain as any).supplierName = (e.supplier as any)?.name ?? '';
        (domain as any).warehouseName = (e.warehouse as any)?.name ?? '';
        return domain;
    }
}
