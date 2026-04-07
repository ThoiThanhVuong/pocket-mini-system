import { Injectable } from '@nestjs/common';
import { DataSource, Repository } from 'typeorm';
import { INoteRepository } from '../../../../core/interfaces/repositories/system/note.repository.interface';
import { Note } from '../../entities/system/note.entity';

@Injectable()
export class NoteRepository implements INoteRepository {
    private readonly repository: Repository<Note>;

    constructor(private readonly dataSource: DataSource) {
        this.repository = this.dataSource.getRepository(Note);
    }

    async save(note: Partial<Note>): Promise<Note> {
        return this.repository.save(note);
    }

    async findByEntity(entityType: string, entityId: string): Promise<Note[]> {
        return this.repository.find({
            where: { entityType, entityId },
            relations: ['user'],
            order: { createdAt: 'DESC' }
        });
    }

    async findAll(): Promise<Note[]> {
        return this.repository.find({
            relations: ['user'],
            order: { createdAt: 'DESC' }
        });
    }

    async delete(id: string): Promise<void> {
        await this.repository.delete(id);
    }

    async findById(id: string): Promise<Note | null> {
        return this.repository.findOne({ 
            where: { id },
            relations: ['user']
        });
    }
}
