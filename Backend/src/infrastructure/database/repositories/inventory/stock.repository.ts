import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { Stock as StockEntity } from '../../entities/warehouse/stock.entity';
import { Inventory } from '../../../../core/domain/entities/warehouse/inventory.entity';
import { IStockRepository } from '../../../../core/interfaces/repositories/inventory/stock.repository.interface';
import { DeepPartial } from '../../../../core/interfaces/repositories/base.repository.interface';

@Injectable()
export class StockRepository implements IStockRepository {
    constructor(
        @InjectRepository(StockEntity)
        private readonly repo: Repository<StockEntity>,
        private readonly dataSource: DataSource,
    ) {}

    async findByWarehouse(warehouseId: string): Promise<Inventory[]> {
        const list = await this.repo.find({
            where: { warehouseId },
            relations: ['product'],
        });
        return list.map(e => this.toDomain(e));
    }

    async findByProduct(productId: string): Promise<Inventory[]> {
        const list = await this.repo.find({
            where: { productId },
            relations: ['warehouse'],
        });
        return list.map(e => this.toDomain(e));
    }

    async findByWarehouseAndProduct(warehouseId: string, productId: string): Promise<Inventory | null> {
        const e = await this.repo.findOne({ where: { warehouseId, productId } });
        return e ? this.toDomain(e) : null;
    }

    async getLowStock(warehouseId: string): Promise<Inventory[]> {
        const list = await this.repo
            .createQueryBuilder('stock')
            .leftJoinAndSelect('stock.product', 'product')
            .where('stock.warehouse_id = :warehouseId', { warehouseId })
            .andWhere('stock.quantity <= product.min_stock_level')
            .getMany();
        return list.map(e => this.toDomain(e));
    }

    async upsert(warehouseId: string, productId: string, delta: number): Promise<Inventory> {
        await this.dataSource.query(
            `INSERT INTO stock (warehouse_id, product_id, quantity)
             VALUES ($1, $2, $3)
             ON CONFLICT (warehouse_id, product_id)
             DO UPDATE SET quantity = stock.quantity + $3`,
            [warehouseId, productId, delta],
        );
        const updated = await this.repo.findOne({ where: { warehouseId, productId } });
        return this.toDomain(updated!);
    }

    /** Tổng tồn kho của 1 product trên tất cả kho */
    async getTotalStockByProduct(productId: string): Promise<number> {
        const result = await this.repo
            .createQueryBuilder('stock')
            .select('COALESCE(SUM(stock.quantity), 0)', 'total')
            .where('stock.product_id = :productId', { productId })
            .getRawOne();
        return parseInt(result?.total ?? '0', 10);
    }

    async getDetailedStock(warehouseId?: string): Promise<any[]> {
        const qb = this.repo.createQueryBuilder('stock')
            .leftJoinAndSelect('stock.product', 'product')
            .leftJoinAndSelect('stock.warehouse', 'warehouse');
        
        if (warehouseId) {
            qb.where('stock.warehouse_id = :warehouseId', { warehouseId });
        }
        
        const list = await qb.getMany();
        return list.map(e => ({
            warehouseId: e.warehouseId,
            warehouseName: (e as any).warehouse?.name || '',
            productId: e.productId,
            productName: (e as any).product?.name || '',
            productSku: (e as any).product?.sku || '',
            quantity: e.quantity,
            price: (e as any).product?.price || 0,
        }));
    }

    async findOneById(id: string): Promise<Inventory | null> { return null; }
    async findAll(): Promise<Inventory[]> {
        const list = await this.repo.find();
        return list.map(e => this.toDomain(e));
    }
    async save(domain: Inventory): Promise<Inventory> { return domain; }
    async remove(domain: Inventory): Promise<Inventory> { return domain; }
    create(data: DeepPartial<Inventory>): Inventory { throw new Error('Not implemented'); }
    createMany(data: DeepPartial<Inventory>[]): Inventory[] { throw new Error('Not implemented'); }
    async saveMany(data: Inventory[]): Promise<Inventory[]> { throw new Error('Not implemented'); }
    async findByCondition(f: any): Promise<Inventory | null> { throw new Error('Not implemented'); }
    async findWithRelations(r: any): Promise<Inventory[]> { throw new Error('Not implemented'); }

    private toDomain(e: StockEntity): Inventory {
        // Dùng composite key thay vì random UUID
        const compositeId = `${e.warehouseId}_${e.productId}`;
        return new Inventory(compositeId, e.warehouseId, e.productId, e.quantity);
    }
}
