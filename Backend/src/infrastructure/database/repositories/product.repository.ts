import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import {Product as ProductEntity} from '../entities/warehouse/product.entity';
import {Product as ProductDomain} from '../../../core/domain/entities/warehouse/product.entity';
import { IProductRepository } from "src/core/interfaces/repositories/product.repository.interface";
import { Repository } from "typeorm";
import { DeepPartial } from "src/core/interfaces/repositories/base.repository.interface";
@Injectable()
export class ProductRepository implements IProductRepository{
    constructor(
        @InjectRepository(ProductEntity)
        private readonly productRepo:Repository<ProductEntity>
    ){}
    async findBySku(sku:string):Promise<ProductDomain|null>{
        const productEntity = await this.productRepo.findOne({
            where:{sku:sku},
            relations: ['stock']
        })
        return productEntity?this.toDomain(productEntity):null; 
    }
    async save(product:ProductDomain):Promise<ProductDomain>{
        const entity = new ProductEntity();
        entity.id = product.id;
        entity.sku = product.sku;
        entity.name = product.name;
        entity.description = product.description;
        entity.image = product.image;
        entity.categoryId = product.categoryId;
        entity.unit = product.unit;
        entity.price = product.price;
        entity.isActive = product.isActive;
        entity.createdAt = product.createdAt;
        entity.updatedAt = product.updatedAt;
        entity.minStockLevel = product.minStockLevel;
        const savedEntity = await this.productRepo.save(entity);
        return this.toDomain(savedEntity);
    }
    async findAll():Promise<ProductDomain[]>{
        const entities = await this.productRepo.find({ relations: ['stock'] });
        return entities.map(e=>this.toDomain(e));
    }
    async findOneById(id:string):Promise<ProductDomain|null>{
        const entity = await this.productRepo.findOne({where:{id}, relations: ['stock']});
        return entity?this.toDomain(entity):null;
    }
    async findAllWithFilters(search?: string, isActive?: boolean, categoryId?: string): Promise<ProductDomain[]> {
        const query = this.productRepo.createQueryBuilder('product')
            .leftJoinAndSelect('product.stock', 'stock');
        if(search){
            query.andWhere('product.name ILIKE :search OR product.sku ILIKE :search',{search:`%${search}%`})
        }
        if(isActive !==undefined){
            query.andWhere('product.isActive =:isActive',{isActive})
        }
        if(categoryId){
            query.andWhere('product.categoryId =:categoryId',{categoryId})
        }
        const entities = await query.getMany();
        return entities.map(e=>{
            try {
                return this.toDomain(e);
            } catch (error) {
                console.warn(`Failed to convert product entity to domain: ${error}`);
                return null;
            }
        }).filter(product=>product!==null) as ProductDomain[];
    }
    async remove(data: ProductDomain): Promise<ProductDomain> {
        const entity = await this.productRepo.findOne({where:{id:data.id}});
        if(!entity){
            throw new Error('Product not found');
        }
        entity.isActive = false;
        const savedEntity = await this.productRepo.save(entity);
        return this.toDomain(savedEntity);
    }
    private toDomain(entity:ProductEntity):ProductDomain{
        let totalStock = 0;
        if (entity.stock && Array.isArray(entity.stock)) {
            totalStock = entity.stock.reduce((sum, s) => sum + Number(s.quantity), 0);
        }
        return new ProductDomain(
            entity.id,
            entity.sku,
            entity.name,
            entity.description,
            entity.image,
            entity.categoryId,
            entity.unit,
            entity.price,
            entity.isActive,
            entity.createdAt,
            entity.updatedAt,
            entity.minStockLevel,
            totalStock
        )
    }
    create(data: DeepPartial<ProductDomain>): ProductDomain {
        throw new Error('Method not implemented. Use \'new Product(...)\' and \'save()\' instead.');
    }
    createMany(data: DeepPartial<ProductDomain>[]): ProductDomain[] {
        throw new Error('Method not implemented. Use \'new Product(...)\' and \'save()\' instead.');
    }
    async saveMany(data: any[]): Promise<ProductDomain[]> {
        throw new Error('Method not implemented.');
    }
    async findByCondition(filterCondition: any): Promise<ProductDomain | null> {
        throw new Error('Method not implemented.');
    }
    async findWithRelations(relations: any): Promise<ProductDomain[]> {
        throw new Error('Method not implemented.');
    }
}