'use client';
import React, { useState, useEffect } from 'react';
import { MessageSquare, Send, Trash2, User, Clock } from 'lucide-react';
import { NoteService, NoteItem } from '@/services/system/note.service';
import { motion, AnimatePresence } from 'framer-motion';

interface Props {
    entityType: string;
    entityId: string;
}

export function NoteSection({ entityType, entityId }: Props) {
    const [notes, setNotes] = useState<NoteItem[]>([]);
    const [content, setContent] = useState('');
    const [isLoading, setIsLoading] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        loadNotes();
    }, [entityType, entityId]);

    const loadNotes = async () => {
        try {
            setIsLoading(true);
            const data = await NoteService.getNotes(entityType, entityId);
            setNotes(data || []);
        } catch (error) {
            console.error('Failed to load notes', error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!content.trim() || isSubmitting) return;

        try {
            setIsSubmitting(true);
            const newNote = await NoteService.addNote(entityType, entityId, content);
            setNotes([newNote, ...notes]);
            setContent('');
        } catch (error) {
            console.error('Failed to add note', error);
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Bạn có chắc muốn xoá ghi chú này?')) return;
        try {
            await NoteService.deleteNote(id);
            setNotes(notes.filter(n => n.id !== id));
        } catch (error) {
            console.error('Failed to delete note', error);
        }
    };

    return (
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 overflow-hidden">
            <div className="p-4 border-b border-gray-100 dark:border-gray-700 flex items-center gap-2">
                <MessageSquare size={18} className="text-blue-500" />
                <h3 className="font-semibold text-gray-800 dark:text-white">Ghi chú & Thảo luận</h3>
            </div>

            <div className="p-4">
                <form onSubmit={handleSubmit} className="mb-6">
                    <div className="relative">
                        <textarea
                            value={content}
                            onChange={(e) => setContent(e.target.value)}
                            placeholder="Nhập ghi chú hoặc phản hồi..."
                            className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 resize-none h-24 text-sm dark:text-gray-200"
                        />
                        <button
                            type="submit"
                            disabled={!content.trim() || isSubmitting}
                            className="absolute bottom-3 right-3 p-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                        >
                            {isSubmitting ? <Clock size={18} className="animate-spin" /> : <Send size={18} />}
                        </button>
                    </div>
                </form>

                <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
                    {isLoading ? (
                        <div className="flex justify-center py-8">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                        </div>
                    ) : notes.length === 0 ? (
                        <div className="text-center py-8 text-gray-400 dark:text-gray-500 text-sm">
                            Chưa có ghi chú nào.
                        </div>
                    ) : (
                        <AnimatePresence initial={false}>
                            {notes.map((note) => (
                                <motion.div
                                    key={note.id}
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, scale: 0.95 }}
                                    className="group bg-gray-50 dark:bg-gray-900/30 p-4 rounded-xl relative"
                                >
                                    <div className="flex items-center justify-between mb-2">
                                        <div className="flex items-center gap-2">
                                            <div className="w-6 h-6 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                                                <User size={12} className="text-blue-600 dark:text-blue-400" />
                                            </div>
                                            <span className="text-xs font-semibold text-gray-700 dark:text-gray-300">
                                                {note.user?.fullName}
                                            </span>
                                            <span className="text-[10px] text-gray-400 dark:text-gray-500">
                                                {new Date(note.createdAt).toLocaleString('vi-VN')}
                                            </span>
                                        </div>
                                        <button
                                            onClick={() => handleDelete(note.id)}
                                            className="opacity-0 group-hover:opacity-100 p-1 text-red-400 hover:text-red-500 transition-all"
                                        >
                                            <Trash2 size={14} />
                                        </button>
                                    </div>
                                    <p className="text-sm text-gray-600 dark:text-gray-400 whitespace-pre-wrap leading-relaxed">
                                        {note.content}
                                    </p>
                                </motion.div>
                            ))}
                        </AnimatePresence>
                    )}
                </div>
            </div>
        </div>
    );
}
