import api from '@/lib/axios';

export interface NoteItem {
    id: string;
    title?: string;
    content: string;
    isImportant: boolean;
    entityType: string;
    entityId: string;
    createdAt: string;
    user: {
        id: string;
        fullName: string;
    };
}

export const NoteService = {
    addNote: async (entityType: string, entityId: string, content: string, title?: string, isImportant?: boolean): Promise<NoteItem> => {
        const res = await api.post('/notes', { entityType, entityId, content, title, isImportant });
        return res.data.data;
    },

    updateNote: async (id: string, data: { title?: string; content?: string; isImportant?: boolean }): Promise<NoteItem> => {
        const res = await api.patch(`/notes/${id}`, data);
        return res.data.data;
    },

    getNotes: async (entityType: string, entityId: string): Promise<NoteItem[]> => {
        const res = await api.get(`/notes/${entityType}/${entityId}`);
        return res.data.data;
    },
    
    getAllNotes: async (): Promise<NoteItem[]> => {
        const res = await api.get('/notes');
        return res.data.data;
    },

    deleteNote: async (id: string): Promise<void> => {
        await api.delete(`/notes/${id}`);
    }
};
