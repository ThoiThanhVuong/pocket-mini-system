import { Injectable, Inject, BadRequestException, NotFoundException } from '@nestjs/common';
import { ISupplierService } from '../../../core/interfaces/services/partners/supplier.service.interface';
import type { ISupplierRepository } from '../../../core/interfaces/repositories/partners/supplier.repositories.interface';
import { Supplier } from '../../../core/domain/entities/partners/supplier.entity';
import { CreateSupplierDto } from '../../dtos/partners/create-supplier.dto';
import { SupplierMapper } from '../../mappers/supplier.mapper';
import { Email } from '../../../core/domain/value-objects/email.value-object';
import { IPaginationOptions, IPaginatedResult } from "../../../shared/types/pagination.type";

@Injectable()
export class SupplierService implements ISupplierService {
    constructor(
        @Inject('ISupplierRepository')
        private readonly repo: ISupplierRepository
    ) {}

    async createSupplier(name: string, contactPerson: string, phone: string, email: string, address?: string): Promise<Supplier> {
        if (email) {
            const existing = await this.repo.findByEmail(new Email(email));
            if (existing) {
                throw new BadRequestException('Supplier with this email already exists');
            }
        }
        const dto: CreateSupplierDto = { name, contactPerson, phone, email, address };
        const supplier = SupplierMapper.toDomain(dto);
        return await this.repo.save(supplier);
    }

    async updateSupplier(id: string, data: Partial<Supplier>): Promise<Supplier> {
        const supplier = await this.repo.findOneById(id);
        if (!supplier) {
            throw new NotFoundException('Supplier not found');
        }
        
        // Use updateDetails method from entity
        supplier.updateDetails(
            data.name,
            data.contactPerson,
            data.phone,
            (data as any).email, // Should handle email properly if it's string or Email object. Entity updateDetails expects string for email.
            data.address,
            data.status
        );

        return await this.repo.save(supplier);
    }

    async deleteSupplier(id: string): Promise<void> {
        const supplier = await this.repo.findOneById(id);
        if (!supplier) throw new NotFoundException('Supplier not found');
        await this.repo.remove(supplier);
    }

    async getSupplierById(id: string): Promise<Supplier | null> {
        return await this.repo.findOneById(id);
    }

    async getAllSuppliers(search?: string, status?: string, options?: IPaginationOptions): Promise<IPaginatedResult<Supplier>> {
        return await this.repo.findAllWithFilters(search, status, options);
    }

    async countSuppliers(search?: string, status?: string): Promise<number> {
        const suppliers = await this.repo.findAllWithFilters(search, status, { page: 1, limit: 1 });
        return (suppliers as IPaginatedResult<Supplier>).meta.totalItems;
    }
}
