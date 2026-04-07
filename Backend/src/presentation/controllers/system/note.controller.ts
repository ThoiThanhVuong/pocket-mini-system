import { Controller, Get, Post, Patch, Delete, Body, Param, Query, UseGuards, Inject, Req } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import type { INoteService } from '../../../core/interfaces/services/system/note.service.interface';
import { INoteServiceKey } from '../../../core/interfaces/services/system/note.service.interface';

@Controller('notes')
@UseGuards(AuthGuard('jwt'))
export class NoteController {
    constructor(
        @Inject(INoteServiceKey)
        private readonly noteService: INoteService,
    ) {}

    @Post()
    async addNote(
        @Body() body: { entityType: string; entityId: string; title?: string; content: string; isImportant?: boolean },
        @Req() req: any,
    ) {
        return this.noteService.addNote(
            body.entityType,
            body.entityId,
            req.user.id,
            body.content,
            body.title,
            body.isImportant,
        );
    }

    @Patch(':id')
    async updateNote(
        @Param('id') id: string,
        @Body() body: { title?: string; content?: string; isImportant?: boolean },
        @Req() req: any,
    ) {
        return this.noteService.updateNote(id, req.user.id, body);
    }

    @Get()
    async getAllNotes() {
        return this.noteService.getAllNotes();
    }

    @Get(':entityType/:entityId')
    async getNotes(
        @Param('entityType') entityType: string,
        @Param('entityId') entityId: string,
    ) {
        return this.noteService.getNotesByEntity(entityType, entityId);
    }

    @Delete(':id')
    async deleteNote(@Param('id') id: string, @Req() req: any) {
        return this.noteService.deleteNote(id, req.user.id);
    }
}
