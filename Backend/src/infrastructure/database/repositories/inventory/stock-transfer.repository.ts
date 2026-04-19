import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { StockTransfer as StockTransferEntity } from '../../entities/warehouse/stock-transfer.entity';
import { StockTransferItem as StockTransferItemEntity } from '../../entities/warehouse/stock-transfer-item.entity';
import { StockTransfer as StockTransferDomain } from '../../../../core/domain/entities/warehouse/stock-transfer.entity';
import { StockTransferItem as StockTransferItemDomain } from '../../../../core/domain/entities/warehouse/stock-transfer-item.entity';
import { TransactionStatus } from '../../../../core/domain/enums/transaction-status.enum';
import { IStockTransferRepository } from '../../../../core/interfaces/repositories/inventory/stock-transfer.repository.interface';
import { DeepPartial } from '../../../../core/interfaces/repositories/base.repository.interface';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class StockTransferRepository implements IStockTransferRepository {
    constructor(
        @InjectRepository(StockTransferEntity)
        private readonly repo: Repository<StockTransferEntity>,
        @InjectRepository(StockTransferItemEntity)
        private readonly itemRepo: Repository<StockTransferItemEntity>,
    ) {}

    async save(domain: StockTransferDomain): Promise<StockTransferDomain> {
        await this.repo.update(domain.id, { status: domain.status });
        return domain;
    }

    async findOneById(id: string): Promise<StockTransferDomain | null> {
        return this.findWithItems(id);
    }

    async findWithItems(id: string): Promise<StockTransferDomain | null> {
        const e = await this.repo.findOne({
            where: { id },
            relations: ['fromWarehouse', 'toWarehouse', 'user', 'stockTransferItems', 'stockTransferItems.product'],
        });
        return e ? this.toDomain(e) : null;
    }

    async findByFromWarehouse(warehouseId: string): Promise<StockTransferDomain[]> {
        const list = await this.repo.find({
            where: { fromWarehouse: { id: warehouseId } },
            relations: ['fromWarehouse', 'toWarehouse', 'stockTransferItems'],
        });
        return list.map(e => this.toDomain(e));
    }

    async findByToWarehouse(warehouseId: string): Promise<StockTransferDomain[]> {
        const list = await this.repo.find({
            where: { toWarehouse: { id: warehouseId } },
            relations: ['fromWarehouse', 'toWarehouse', 'stockTransferItems'],
        });
        return list.map(e => this.toDomain(e));
    }

    async findByStatus(status: string): Promise<StockTransferDomain[]> {
        const list = await this.repo.find({
            where: { status },
            relations: ['fromWarehouse', 'toWarehouse', 'stockTransferItems'],
        });
        return list.map(e => this.toDomain(e));
    }

    async findAll(): Promise<StockTransferDomain[]> {
        const list = await this.repo.find({ relations: ['fromWarehouse', 'toWarehouse', 'stockTransferItems', 'stockTransferItems.product'] });
        return list.map(e => this.toDomain(e));
    }

    async remove(domain: StockTransferDomain): Promise<StockTransferDomain> {
        await this.repo.delete(domain.id);
        return domain;
    }

    async findAllPaginated(
        options: { page: number; limit: number; sortBy?: string; sortOrder?: 'ASC' | 'DESC' },
        filters?: { fromWarehouseId?: string; toWarehouseId?: string; status?: string; search?: string }
    ): Promise<{ items: StockTransferDomain[]; meta: any }> {
        const { page, limit, sortBy = 'createdAt', sortOrder = 'DESC' } = options;
        const query = this.repo.createQueryBuilder('stock_transfer')
            .leftJoinAndSelect('stock_transfer.fromWarehouse', 'fromWarehouse')
            .leftJoinAndSelect('stock_transfer.toWarehouse', 'toWarehouse')
            .leftJoinAndSelect('stock_transfer.user', 'user')
            .leftJoinAndSelect('stock_transfer.stockTransferItems', 'items')
            .leftJoinAndSelect('items.product', 'product');

        if (filters?.fromWarehouseId) {
            query.andWhere('stock_transfer.from_warehouse = :fromWarehouseId', { fromWarehouseId: filters.fromWarehouseId });
        }

        if (filters?.toWarehouseId) {
            query.andWhere('stock_transfer.to_warehouse = :toWarehouseId', { toWarehouseId: filters.toWarehouseId });
        }

        if (filters?.status) {
            query.andWhere('stock_transfer.status = :status', { status: filters.status });
        }

        if (filters?.search) {
            query.andWhere('stock_transfer.reference_code ILIKE :search', { search: `%${filters.search}%` });
        }

        const [entities, total] = await query
            .orderBy(`stock_transfer.${sortBy}`, sortOrder)
            .skip((page - 1) * limit)
            .take(limit)
            .getManyAndCount();

        const items = entities.map(e => this.toDomain(e));
        const totalPages = Math.ceil(total / limit);

        return {
            items,
            meta: {
                totalItems: total,
                itemCount: items.length,
                itemsPerPage: limit,
                totalPages,
                currentPage: page,
            }
        };
    }

    async saveNew(
        id: string, fromWarehouseId: string, toWarehouseId: string,
        userId: string, referenceCode: string, status: string,
        items: { productId: string; quantity: number }[],
    ): Promise<void> {
        await this.repo.query(
            `INSERT INTO stock_transfer (id, from_warehouse, to_warehouse, user_id, reference_code, status)
             VALUES ($1, $2, $3, $4, $5, $6)`,
            [id, fromWarehouseId, toWarehouseId, userId, referenceCode, status],
        );
        for (const item of items) {
            const itemId = uuidv4();
            await this.itemRepo.query(
                `INSERT INTO stock_transfer_items (id, stock_transfer_id, product_id, quantity)
                 VALUES ($1, $2, $3, $4)`,
                [itemId, id, item.productId, item.quantity],
            );
        }
    }

    create(data: DeepPartial<StockTransferDomain>): StockTransferDomain { throw new Error('Not implemented'); }
    createMany(data: DeepPartial<StockTransferDomain>[]): StockTransferDomain[] { throw new Error('Not implemented'); }
    async saveMany(data: StockTransferDomain[]): Promise<StockTransferDomain[]> { throw new Error('Not implemented'); }
    async findByCondition(f: any): Promise<StockTransferDomain | null> { throw new Error('Not implemented'); }
    async findWithRelations(r: any): Promise<StockTransferDomain[]> { throw new Error('Not implemented'); }

    private toDomain(e: StockTransferEntity): StockTransferDomain {
        const items: StockTransferItemDomain[] = (e.stockTransferItems || []).map(i => {
            const item = new StockTransferItemDomain(
                i.id,
                e.id,
                i.productId || (i.product as any)?.id || 'SYS-UNKNOWN-PRODUCT',
                i.quantity,
            );
            (item as any).productName = (i.product as any)?.name ?? '';
            return item;
        });
        const domain = new StockTransferDomain(
            e.id,
            (e.fromWarehouse as any)?.id ?? (e as any).fromWarehouseId ?? 'SYS-UNKNOWN-WH',
            (e.toWarehouse as any)?.id ?? (e as any).toWarehouseId ?? 'SYS-UNKNOWN-WH',
            (e.user as any)?.id ?? (e as any).userId ?? '',
            e.referenceCode,
            items,
            e.status as TransactionStatus,
            e.createdAt as Date,
            e.updatedAt as Date,
        );
        (domain as any).fromWarehouseName = (e.fromWarehouse as any)?.name ?? '';
        (domain as any).toWarehouseName = (e.toWarehouse as any)?.name ?? '';
        return domain;
    }
}
