import { Injectable, Inject, ForbiddenException, NotFoundException } from '@nestjs/common';
import type { INoteService } from '../../../core/interfaces/services/system/note.service.interface';
import { INoteRepositoryKey } from '../../../core/interfaces/repositories/system/note.repository.interface';
import type { INoteRepository } from '../../../core/interfaces/repositories/system/note.repository.interface';

@Injectable()
export class NoteService implements INoteService {
    constructor(
        @Inject(INoteRepositoryKey)
        private readonly noteRepo: INoteRepository,
    ) {}

    async addNote(
        entityType: string,
        entityId: string,
        userId: string,
        content: string,
        title?: string,
        isImportant?: boolean
    ): Promise<any> {
        return this.noteRepo.save({
            entityType,
            entityId,
            content,
            title,
            isImportant,
            user: { id: userId } as any,
        });
    }

    async updateNote(
        id: string,
        userId: string,
        data: { title?: string; content?: string; isImportant?: boolean }
    ): Promise<any> {
        const note = await this.noteRepo.findById(id);
        if (!note) {
            throw new NotFoundException('Note not found');
        }
        if (note.user.id !== userId) {
            throw new ForbiddenException('You do not have permission to edit this note');
        }
        
        return this.noteRepo.save({
            ...note,
            ...data,
        });
    }

    async getNotesByEntity(entityType: string, entityId: string): Promise<any[]> {
        return this.noteRepo.findByEntity(entityType, entityId);
    }

    async getAllNotes(): Promise<any[]> {
        return this.noteRepo.findAll();
    }

    async deleteNote(id: string, userId: string): Promise<void> {
        const note = await this.noteRepo.findById(id);
        if (!note) {
            throw new NotFoundException('Note not found');
        }
        
        // Only creator can delete note (simple logic for now)
        if (note.user.id !== userId) {
            throw new ForbiddenException('You do not have permission to delete this note');
        }
        
        await this.noteRepo.delete(id);
    }
}
