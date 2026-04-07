import { Note } from '../../../../infrastructure/database/entities/system/note.entity';

export const INoteRepositoryKey = 'INoteRepository';

export interface INoteRepository {
    save(note: Partial<Note>): Promise<Note>;
    findByEntity(entityType: string, entityId: string): Promise<Note[]>;
    findAll(): Promise<Note[]>;
    delete(id: string): Promise<void>;
    findById(id: string): Promise<Note | null>;
}
