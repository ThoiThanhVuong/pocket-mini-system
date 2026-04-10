import { Injectable } from '@nestjs/common';
import { DataSource, Repository } from 'typeorm';
import { IAuditLogRepository } from '../../../../core/interfaces/repositories/system/audit-log.repository.interface';
import { AuditLog } from '../../entities/system/auditLog.entity';

@Injectable()
export class AuditLogRepository implements IAuditLogRepository {
    private readonly repository: Repository<AuditLog>;

    constructor(private readonly dataSource: DataSource) {
        this.repository = this.dataSource.getRepository(AuditLog);
    }

    async save(auditLog: Partial<AuditLog>): Promise<AuditLog> {
        return this.repository.save(auditLog);
    }

    async findAll(options: { 
        entityType?: string; 
        entityId?: string; 
        page?: number; 
        limit?: number; 
        search?: string 
    }): Promise<{ data: AuditLog[]; total: number }> {
        const { entityType, entityId, page = 1, limit = 12, search } = options;
        const skip = (page - 1) * limit;

        const query = this.repository.createQueryBuilder('audit')
            .leftJoinAndSelect('audit.user', 'user')
            .orderBy('audit.createdAt', 'DESC');

        if (entityType) {
            query.andWhere('audit.entityType = :entityType', { entityType });
        }
        if (entityId) {
            query.andWhere('audit.entityId = :entityId', { entityId });
        }
        
        if (search) {
            query.andWhere(
                '(audit.action ILIKE :search OR audit.entityType ILIKE :search OR user.fullName ILIKE :search)',
                { search: `%${search}%` }
            );
        }

        const [data, total] = await query
            .skip(skip)
            .take(limit)
            .getManyAndCount();

        return { data, total };
    }

    async findByUser(userId: string): Promise<AuditLog[]> {
        return this.repository.find({
            where: { user: { id: userId } },
            relations: ['user'],
            order: { createdAt: 'DESC' }
        });
    }
}
