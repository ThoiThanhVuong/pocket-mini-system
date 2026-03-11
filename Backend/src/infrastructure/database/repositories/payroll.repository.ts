import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { IPayrollRepository } from 'src/core/interfaces/repositories/payroll.repository.interface';
import { Payroll as PayrollEntity } from '../entities/hrm/payroll.entity';
import { Payroll as PayrollDomain, PayrollStatus } from 'src/core/domain/entities/hrm/payroll.entity';
import { DeepPartial } from '../../../core/interfaces/repositories/base.repository.interface';

@Injectable()
export class PayrollRepository implements IPayrollRepository {
    constructor(
        @InjectRepository(PayrollEntity)
        private readonly repo: Repository<PayrollEntity>
    ) {}

    async findByUserAndMonth(userId: string, month: number, year: number): Promise<PayrollDomain | null> {
        const entity = await this.repo.findOne({ where: { userId, month, year } });
        return entity ? this.toDomain(entity) : null;
    }

    async findByMonth(month: number, year: number): Promise<PayrollDomain[]> {
        const entities = await this.repo.find({ 
            where: { month, year },
            relations: ['user'] 
        });
        return entities.map(e => this.toDomain(e));
    }

    async save(domain: PayrollDomain): Promise<PayrollDomain> {
        const entity = new PayrollEntity();
        entity.id = domain.id;
        entity.userId = domain.userId;
        entity.month = domain.month;
        entity.year = domain.year;
        entity.totalWorkingDays = domain.totalWorkingDays;
        entity.baseSalary = domain.baseSalary;
        entity.totalSalary = domain.totalSalary;
        entity.status = domain.status;
        entity.createdAt = domain.createdAt;
        entity.updatedAt = domain.updatedAt;

        await this.repo.save(entity);
        return domain;
    }

    // Base methods
    async findOneById(id: string): Promise<PayrollDomain | null> {
        const entity = await this.repo.findOne({ where: { id } });
        return entity ? this.toDomain(entity) : null;
    }

    // Alias for IPayrollRepository compatibility if needed, or ensuring interface matches
    async findById(id: string): Promise<PayrollDomain | null> {
        return this.findOneById(id);
    }

    async findAll(): Promise<PayrollDomain[]> {
        const entities = await this.repo.find();
        return entities.map(e => this.toDomain(e));
    }

    create(data: DeepPartial<PayrollDomain>): PayrollDomain { throw new Error('Use save'); }
    createMany(data: DeepPartial<PayrollDomain>[]): PayrollDomain[] { throw new Error('Use save'); }
    async saveMany(data: any[]): Promise<PayrollDomain[]> { throw new Error('Not implemented'); }
    async remove(data: PayrollDomain): Promise<PayrollDomain> { throw new Error('Not implemented'); }
    async findByCondition(filterCondition: any): Promise<PayrollDomain | null> { throw new Error('Not implemented'); }
    async findWithRelations(relations: any): Promise<PayrollDomain[]> { throw new Error('Not implemented'); }

    private toDomain(entity: PayrollEntity): PayrollDomain {
        return new PayrollDomain(
            entity.id,
            entity.userId,
            entity.month,
            entity.year,
            Number(entity.totalWorkingDays),
            Number(entity.baseSalary),
            Number(entity.totalSalary),
            Number(entity.totalNormalHours || 0),
            Number(entity.totalOtHours || 0),
            Number(entity.hourlyRate || 0),
            entity.status as PayrollStatus,
            entity.createdAt,
            entity.updatedAt,
            entity.user
        );
    }
}
