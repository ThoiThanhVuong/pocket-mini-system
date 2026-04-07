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

    async findAll(entityType?: string, entityId?: string): Promise<AuditLog[]> {
        const query = this.repository.createQueryBuilder('audit')
            .leftJoinAndSelect('audit.user', 'user')
            .orderBy('audit.createdAt', 'DESC');

        if (entityType) {
            query.andWhere('audit.entityType = :entityType', { entityType });
        }
        if (entityId) {
            query.andWhere('audit.entityId = :entityId', { entityId });
        }

        return query.getMany();
    }

    async findByUser(userId: string): Promise<AuditLog[]> {
        return this.repository.find({
            where: { user: { id: userId } },
            relations: ['user'],
            order: { createdAt: 'DESC' }
        });
    }
}
