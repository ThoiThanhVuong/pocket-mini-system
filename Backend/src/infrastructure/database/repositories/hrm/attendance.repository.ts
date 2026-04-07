import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between } from 'typeorm';
import { IAttendanceRepository } from '../../../../core/interfaces/repositories/hrm/attendance.repository.interface';
import { Attendance as AttendanceEntity } from '../../entities/hrm/attendance.entity';
import { Attendance as AttendanceDomain, AttendanceStatus } from 'src/core/domain/entities/hrm/attendance.entity';
import { DeepPartial } from 'src/core/interfaces/repositories/base.repository.interface';

@Injectable()
export class AttendanceRepository implements IAttendanceRepository {
    constructor(
        @InjectRepository(AttendanceEntity)
        private readonly repo: Repository<AttendanceEntity>
    ) {}

    async findByUserAndDate(userId: string, date: Date): Promise<AttendanceDomain | null> {
        // Construct YYYY-MM-DD string using Local Time (Server Time)
        // using toISOString() would convert to UTC, which might be yesterday if early morning.
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        const dateString = `${year}-${month}-${day}`;
        const entity = await this.repo.createQueryBuilder('attendance')
            .where('attendance.user_id = :userId', { userId })
            .andWhere('attendance.date = :dateString', { dateString })
            .getOne();

        return entity ? this.toDomain(entity) : null;
    }

    async findByUserAndMonth(userId: string, month: number, year: number): Promise<AttendanceDomain[]> {
        const start = `${year}-${String(month).padStart(2, '0')}-01`;
        // Calculate last day of month
        const lastDay = new Date(year, month, 0).getDate();
        const end = `${year}-${String(month).padStart(2, '0')}-${lastDay}`;

        const entities = await this.repo.createQueryBuilder('attendance')
            .where('attendance.user_id = :userId', { userId })
            .andWhere('attendance.date >= :start', { start })
            .andWhere('attendance.date <= :end', { end })
            .orderBy('attendance.date', 'ASC')
            .getMany();

        return entities.map(e => this.toDomain(e));
    }

    async save(domain: AttendanceDomain): Promise<AttendanceDomain> {
        const entity = new AttendanceEntity();
        entity.id = domain.id;
        entity.userId = domain.userId;
        entity.date = domain.date;
        entity.checkIn = domain.checkIn;
        entity.checkOut = domain.checkOut;
        entity.workingHours = domain.workingHours;
        entity.overtimeHours = domain.overtimeHours;
        entity.status = domain.status;
        entity.note = domain.note;
        entity.createdAt = domain.createdAt; 
        entity.updatedAt = domain.updatedAt; 

        const saved = await this.repo.save(entity);
        return domain;
    }

    // Base methods - Fix Signatures
    async findOneById(id: string): Promise<AttendanceDomain | null> {
         const entity = await this.repo.findOne({ where: { id } });
         return entity ? this.toDomain(entity) : null;
    }
    
    async findAll(): Promise<AttendanceDomain[]> {
        const entities = await this.repo.find();
        return entities.map(e => this.toDomain(e));
    }

    create(data: DeepPartial<AttendanceDomain>): AttendanceDomain { throw new Error('Use save'); }
    createMany(data: DeepPartial<AttendanceDomain>[]): AttendanceDomain[] { throw new Error('Use save'); }
    async saveMany(data: any[]): Promise<AttendanceDomain[]> { throw new Error('Not implemented'); }
    async remove(data: AttendanceDomain): Promise<AttendanceDomain> { throw new Error('Not implemented'); }
    async findByCondition(filterCondition: any): Promise<AttendanceDomain | null> { throw new Error('Not implemented'); }
    async findWithRelations(relations: any): Promise<AttendanceDomain[]> { throw new Error('Not implemented'); }


    private toDomain(entity: AttendanceEntity): AttendanceDomain {
        return new AttendanceDomain(
            entity.id,
            entity.userId,
            entity.date,
            entity.checkIn,
            entity.checkOut,
            Number(entity.workingHours),
            Number(entity.overtimeHours),
            entity.status as AttendanceStatus,
            entity.note,
            entity.createdAt,
            entity.updatedAt
        );
    }
}
