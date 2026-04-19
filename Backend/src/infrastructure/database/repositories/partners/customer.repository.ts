import {Customer as CustomerEntity} from '../../entities/partners/customer.entity';
import {Customer as CustomerDomain} from '../../../../core/domain/entities/partners/customer.entity';
import { ICustomerRepository } from '../../../../core/interfaces/repositories/partners/customer.repositories.interface';
import { PartnerStatus } from 'src/core/domain/enums/partners-status.enum';
import { InjectRepository } from '@nestjs/typeorm';
import { DeepPartial, Repository } from 'typeorm';
import { Injectable } from '@nestjs/common';    
import { Email } from 'src/core/domain/value-objects/email.value-object';
import { IPaginationOptions, IPaginatedResult } from "../../../../shared/types/pagination.type";
@Injectable()
export class CustomerRepository implements ICustomerRepository{
    constructor(
        @InjectRepository(CustomerEntity)
        private readonly customerRepo: Repository<CustomerEntity>,
    ) {}
    async findByEmail(email:Email):Promise<CustomerDomain|null>{
        const customerEntity = await this.customerRepo.findOne({
            where:{email:email.getValue()}
        });
        return customerEntity ? this.toDomain(customerEntity) : null;
    }
    async save(customer:CustomerDomain):Promise<CustomerDomain>{
        const entity = new CustomerEntity();
        entity.id= customer.id;
        entity.name= customer.name;
        entity.email= customer.email;
        entity.phone= customer.phone;
        entity.address= customer.address;
        entity.status= customer.status;
        entity.customerType = customer.customerType;
        entity.companyName = customer.companyName!;
        entity.loyaltyTier = customer.loyaltyTier;
        entity.createdAt= customer.createdAt;
        await this.customerRepo.save(entity);
        return customer;
    }
    async findAllWithFilters(search?:string,status?:string,customerType?:string, options?: IPaginationOptions):Promise<IPaginatedResult<CustomerDomain>>{
        const query = this.customerRepo.createQueryBuilder('customer')
            .leftJoin('customer.stockOuts', 'stockOut')
            .leftJoin('stockOut.stockOutItems', 'stockOutItem')
            .select([
                'customer.id', 'customer.name', 'customer.phone', 'customer.email', 
                'customer.address', 'customer.status', 'customer.customerType', 
                'customer.companyName', 'customer.loyaltyTier', 'customer.createdAt'
            ])
            .addSelect('COUNT(DISTINCT stockOut.id)', 'totalOrders')
            .addSelect('SUM(COALESCE(stockOutItem.quantity * stockOutItem.price, 0))', 'totalSpent')
            .groupBy('customer.id');

        if(search){
            query.andWhere('(customer.name ILIKE :search OR customer.email ILIKE :search OR customer.phone ILIKE :search)', { search: `%${search}%` });
        }
        if(status){
            query.andWhere('customer.status = :status', { status });
        }
        if(customerType){
            query.andWhere('customer.customer_type = :customerType', { customerType });
        }

        // Count total items before applying pagination
        const countQuery = this.customerRepo.createQueryBuilder('customer');
        if(search){
            countQuery.andWhere('(customer.name ILIKE :search OR customer.email ILIKE :search OR customer.phone ILIKE :search)', { search: `%${search}%` });
        }
        if(status){
            countQuery.andWhere('customer.status = :status', { status });
        }
        if(customerType){
            countQuery.andWhere('customer.customer_type = :customerType', { customerType });
        }
        const totalItems = await countQuery.getCount();

        if (options) {
            const page = options.page || 1;
            const limit = options.limit || 10;
            const skip = (page - 1) * limit;

            query.offset(skip).limit(limit);

            if (options.sortBy) {
                query.orderBy(`customer.${options.sortBy}`, options.sortOrder || 'ASC');
            } else {
                query.orderBy('customer.createdAt', 'DESC');
            }
        }

        const rawResults = await query.getRawMany();
        
        const items = rawResults.map(raw => {
            const domain = new CustomerDomain(
                raw.customer_id,
                raw.customer_name,
                raw.customer_phone,
                raw.customer_email,
                raw.customer_address,
                raw.customer_status as PartnerStatus,
                raw.customer_customer_type,
                raw.customer_company_name,
                raw.customer_tier,
                new Date(raw.customer_createdAt)
            );
            domain.totalOrders = parseInt(raw.totalOrders || '0');
            domain.totalSpent = parseFloat(raw.totalSpent || '0');
            return domain;
        });

        const page = options?.page || 1;
        const limit = options?.limit || items.length || 10;

        return {
            items,
            meta: {
                totalItems,
                itemCount: items.length,
                itemsPerPage: limit,
                totalPages: Math.ceil(totalItems / limit),
                currentPage: page
            }
        };
    }
    async findOneById(id: any): Promise<CustomerDomain | null> {
        const query = this.customerRepo.createQueryBuilder('customer')
            .leftJoin('customer.stockOuts', 'stockOut')
            .leftJoin('stockOut.stockOutItems', 'stockOutItem')
            .select([
                'customer.id', 'customer.name', 'customer.phone', 'customer.email', 
                'customer.address', 'customer.status', 'customer.customerType', 
                'customer.companyName', 'customer.loyaltyTier', 'customer.createdAt'
            ])
            .addSelect('COUNT(DISTINCT stockOut.id)', 'totalOrders')
            .addSelect('SUM(COALESCE(stockOutItem.quantity * stockOutItem.price, 0))', 'totalSpent')
            .where('customer.id = :id', { id })
            .groupBy('customer.id');

        const raw = await query.getRawOne();
        if (!raw) return null;

        const domain = new CustomerDomain(
            raw.customer_id,
            raw.customer_name,
            raw.customer_phone,
            raw.customer_email,
            raw.customer_address,
            raw.customer_status as PartnerStatus,
            raw.customer_customer_type,
            raw.customer_company_name,
            raw.customer_tier,
            new Date(raw.customer_createdAt)
        );
        domain.totalOrders = parseInt(raw.totalOrders || '0');
        domain.totalSpent = parseFloat(raw.totalSpent || '0');
        return domain;
    }
    async findAll():Promise<CustomerDomain[]>{
        return (await this.findAllWithFilters()).items;
    }
    async remove(data: CustomerDomain): Promise<CustomerDomain> {
        const entity = await this.customerRepo.findOne({ where: { id: data.id } });
        if (!entity) throw new Error('Customer not found');
        
        entity.status = PartnerStatus.INACTIVE;
        const savedEntity = await this.customerRepo.save(entity);
        
        return this.toDomain(savedEntity);
    }
    private toDomain(entity:CustomerEntity):CustomerDomain{
        return new CustomerDomain(
            entity.id,
            entity.name,
            entity.phone,
            entity.email,
            entity.address,
            entity.status as PartnerStatus,
            entity.customerType,
            entity.companyName,
            entity.loyaltyTier,
            entity.createdAt as Date,
        );
    }
    create(data: DeepPartial<CustomerDomain>): CustomerDomain {
        throw new Error('Method not implemented. Use \'new Customer(...)\' and \'save()\' instead.');
    }
    createMany(data: DeepPartial<CustomerDomain>[]): CustomerDomain[] {
        throw new Error('Method not implemented. Use \'new Customer(...)\' and \'save()\' instead.');
    }
    async saveMany(data: any[]): Promise<CustomerDomain[]> {
        throw new Error('Method not implemented.');
    }
    async findByCondition(filterCondition: any): Promise<CustomerDomain | null> {
        throw new Error('Method not implemented.');
    }
    async findWithRelations(relations: any): Promise<CustomerDomain[]> {
        throw new Error('Method not implemented.');
    }
}