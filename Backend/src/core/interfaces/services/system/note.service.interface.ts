export const INoteServiceKey = 'INoteService';

export interface INoteService {
    addNote(
        entityType: string,
        entityId: string,
        userId: string,
        content: string,
        title?: string,
        isImportant?: boolean
    ): Promise<any>;
    
    updateNote(
        id: string,
        userId: string,
        data: { title?: string; content?: string; isImportant?: boolean }
    ): Promise<any>;

    getNotesByEntity(entityType: string, entityId: string): Promise<any[]>;
    getAllNotes(): Promise<any[]>;
    deleteNote(id: string, userId: string): Promise<void>;
}
