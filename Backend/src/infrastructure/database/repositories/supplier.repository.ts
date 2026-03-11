import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { ISupplierRepository } from "../../../core/interfaces/repositories/supplier.repositories.interface";
import { DeepPartial, Repository } from "typeorm";
import { Supplier as SupplierEntity } from "../entities/partners/supplier.entity";
import { Supplier as SupplierDomain } from "../../../core/domain/entities/partners/supplier.entity";
import { PartnerStatus } from "../../../core/domain/enums/partners-status.enum";
import { Email } from "../../../core/domain/value-objects/email.value-object";
@Injectable()
export class SupplierRepository implements ISupplierRepository{
    constructor(
        @InjectRepository(SupplierEntity)
        private readonly supplierRepo: Repository<SupplierEntity>,
    ) {}

    async findByEmail(email:Email):Promise<SupplierDomain|null>{
        const entity = await this.supplierRepo.findOne({ where: { email: email.getValue() } });
        return entity ? this.toDomain(entity) : null;
    }
    async save(supplier:SupplierDomain):Promise<SupplierDomain>{
        const entity = new SupplierEntity();
        entity.id= supplier.id;
        entity.name= supplier.name;
        entity.contactPerson= supplier.contactPerson;
        entity.email= supplier.email;
        entity.phone= supplier.phone;
        entity.address= supplier.address;
        entity.status= supplier.status;
        entity.createdAt= supplier.createdAt;
        await this.supplierRepo.save(entity);
        return supplier;
    }
    async findAllWithFilters(search?:string,status?:string):Promise<SupplierDomain[]>{
        const query = this.supplierRepo.createQueryBuilder('supplier');
        if(search){
            query.andWhere('(supplier.name ILIKE :search OR supplier.email ILIKE :search OR supplier.phone ILIKE :search)', { search: `%${search}%` });
        }
        if(status){
            query.andWhere('supplier.status = :status', { status });
        }
        const entities = await query.getMany();
        return entities
            .map(e => {
                try {
                    return this.toDomain(e);
                } catch (error) {
                    console.warn(`[SupplierRepository] Skipping invalid record ID ${e.id}: ${(error as Error).message}`);
                    return null;
                }
            })
            .filter(item => item !== null) as SupplierDomain[];
    }
    async findOneById(id: any): Promise<SupplierDomain | null> {
        const entity = await this.supplierRepo.findOne({ 
            where: { id },
         });
        return entity ? this.toDomain(entity) : null;
    }
    async findAll():Promise<SupplierDomain[]>{
        const entities = await this.supplierRepo.find();
        return entities
            .map(e => {
                try {
                    return this.toDomain(e);
                } catch (error) {
                    console.warn(`[SupplierRepository] Skipping invalid record ID ${e.id}: ${(error as Error).message}`);
                    return null;
                }
            })
            .filter(item => item !== null) as SupplierDomain[];
    }
    async remove(data: SupplierDomain): Promise<SupplierDomain> {
        const entity = await this.supplierRepo.findOne({ where: { id: data.id } });
        if (!entity) throw new Error('Supplier not found');
        
        entity.status = PartnerStatus.INACTIVE;
        const savedEntity = await this.supplierRepo.save(entity);
        
        return this.toDomain(savedEntity);
    }

    private toDomain(entity:SupplierEntity):SupplierDomain{
        return new SupplierDomain(
            entity.id,
            entity.name,
            entity.contactPerson,
            entity.phone,
            entity.email,
            entity.address,
            entity.status as PartnerStatus,
            entity.createdAt as Date,
        );
    }
    create(data: DeepPartial<SupplierDomain>): SupplierDomain {
        throw new Error('Method not implemented. Use \'new Supplier(...)\' and \'save()\' instead.');
    }
    createMany(data: DeepPartial<SupplierDomain>[]): SupplierDomain[] {
        throw new Error('Method not implemented. Use \'new Supplier(...)\' and \'save()\' instead.');
    }
    async saveMany(data: any[]): Promise<SupplierDomain[]> {
        throw new Error('Method not implemented.');
    }
    async findByCondition(filterCondition: any): Promise<SupplierDomain | null> {
        throw new Error('Method not implemented.');
    }
    async findWithRelations(relations: any): Promise<SupplierDomain[]> {
        throw new Error('Method not implemented.');
    }
}
    
