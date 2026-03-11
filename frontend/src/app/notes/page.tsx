"use client";

import React, { Component } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Plus, 
  Search, 
  Trash2, 
  Clock, 
  User, 
  FileText,
  AlertTriangle
} from 'lucide-react';
import { NoteService, NoteItem } from '@/services/system/note.service';

interface NotesState {
  notes: NoteItem[];
  isLoading: boolean;
  searchTerm: string;
  isModalOpen: boolean;
  isEditing: boolean;
  editingId: string | null;
  formTitle: string;
  formContent: string;
  formIsImportant: boolean;
}

export default class NotesPage extends Component<{}, NotesState> {
  constructor(props: {}) {
    super(props);
    this.state = {
      notes: [],
      isLoading: true,
      searchTerm: '',
      isModalOpen: false,
      isEditing: false,
      editingId: null,
      formTitle: '',
      formContent: '',
      formIsImportant: false
    };
  }

  componentDidMount() {
    this.loadNotes();
  }

  loadNotes = async () => {
    try {
      this.setState({ isLoading: true });
      const data = await NoteService.getAllNotes();
      this.setState({ notes: data || [] });
    } catch (error) {
      console.error('Failed to load notes', error);
    } finally {
      this.setState({ isLoading: false });
    }
  };

  handleOpenAdd = () => {
    this.setState({
      isModalOpen: true,
      isEditing: false,
      editingId: null,
      formTitle: '',
      formContent: '',
      formIsImportant: false
    });
  };

  handleOpenEdit = (note: NoteItem) => {
    this.setState({
      isModalOpen: true,
      isEditing: true,
      editingId: note.id,
      formTitle: note.title || '',
      formContent: note.content,
      formIsImportant: note.isImportant
    });
  };

  handleCloseModal = () => {
    this.setState({ isModalOpen: false });
  };

  handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const { isEditing, editingId, formTitle, formContent, formIsImportant } = this.state;
    
    try {
      if (isEditing && editingId) {
        await NoteService.updateNote(editingId, {
          title: formTitle,
          content: formContent,
          isImportant: formIsImportant
        });
      } else {
        await NoteService.addNote('general', 'system', formContent, formTitle, formIsImportant);
      }
      this.handleCloseModal();
      await this.loadNotes();
    } catch (error) {
      console.error('Failed to save note', error);
      alert('Failed to save note. Please try again.');
    }
  };

  handleDelete = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (window.confirm('Are you sure you want to delete this note?')) {
      try {
        await NoteService.deleteNote(id);
        await this.loadNotes();
      } catch (error) {
        console.error('Failed to delete note', error);
      }
    }
  };

  handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    this.setState({ searchTerm: e.target.value });
  };

  getFilteredNotes = () => {
    const { notes, searchTerm } = this.state;
    if (!searchTerm) return notes;
    const lowerSearch = searchTerm.toLowerCase();
    return notes.filter(note => 
      (note.title && note.title.toLowerCase().includes(lowerSearch)) ||
      note.content.toLowerCase().includes(lowerSearch) ||
      note.entityType.toLowerCase().includes(lowerSearch)
    );
  };

  render() {
    const { isLoading, searchTerm, isModalOpen, isEditing, formTitle, formContent, formIsImportant } = this.state;
    const filteredNotes = this.getFilteredNotes();

    const colorClasses = [
      'bg-[#fef9c3] border-[#fef08a] dark:bg-yellow-900/20 dark:border-yellow-700/30', // Yellow
      'bg-[#dbeafe] border-[#bfdbfe] dark:bg-blue-900/20 dark:border-blue-700/30',   // Blue
      'bg-[#f3e8ff] border-[#e9d5ff] dark:bg-purple-900/20 dark:border-purple-700/30', // Purple
      'bg-[#dcfce7] border-[#bbf7d0] dark:bg-green-900/20 dark:border-green-700/30', // Green
      'bg-[#fee2e2] border-[#fecaca] dark:bg-red-900/20 dark:border-red-700/30',   // Red
    ];

    return (
      <div className="container mx-auto px-4 py-8">
        <header className="flex flex-col md:flex-row md:items-center justify-between mb-10 gap-6">
          <div className="space-y-1">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white tracking-tight">Notes</h1>
            <p className="text-gray-500 dark:text-gray-400 font-medium">Keep track of important reminders</p>
          </div>
          
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4">
            <div className="relative group">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 group-focus-within:text-blue-500 transition-colors" size={20} />
              <input
                type="text"
                placeholder="Search notes..."
                className="pl-10 pr-4 py-2.5 w-full sm:w-64 border border-gray-200 dark:border-gray-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-800 dark:text-white transition-all shadow-sm"
                value={searchTerm}
                onChange={this.handleSearch}
              />
            </div>
            <motion.button
              whileHover={{ scale: 1.02, backgroundColor: '#2563eb' }}
              whileTap={{ scale: 0.98 }}
              onClick={this.handleOpenAdd}
              className="flex items-center justify-center space-x-2 bg-blue-600 text-white px-6 py-2.5 rounded-xl font-semibold shadow-md shadow-blue-500/20 transition-all"
            >
              <Plus size={20} />
              <span>Add Note</span>
            </motion.button>
          </div>
        </header>

        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-32">
            <div className="w-12 h-12 border-4 border-blue-100 border-t-blue-600 rounded-full animate-spin mb-4"></div>
            <p className="text-gray-500 font-medium">Loading notes...</p>
          </div>
        ) : filteredNotes.length === 0 ? (
          <div className="bg-white dark:bg-gray-800/50 rounded-3xl border border-gray-100 dark:border-gray-800 p-20 text-center shadow-sm">
            <div className="bg-gray-50 dark:bg-gray-800 h-20 w-20 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-inner">
              <FileText size={40} className="text-gray-300" />
            </div>
            <h3 className="text-xl font-bold text-gray-800 dark:text-white mb-2">No notes yet</h3>
            <p className="text-gray-500 max-w-xs mx-auto text-sm leading-relaxed">
              Capture your ideas and reminders by clicking the "Add Note" button above.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <AnimatePresence mode="popLayout">
              {filteredNotes.map((note, index) => {
                const colorClass = colorClasses[index % colorClasses.length];
                return (
                  <motion.div
                    key={note.id}
                    layout
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    whileHover={{ y: -6 }}
                    className={`group relative flex flex-col p-6 rounded-[2rem] border shadow-sm transition-all overflow-hidden cursor-default ${colorClass}`}
                  >
                    <div className="flex justify-between items-start mb-4">
                      <h4 className="text-lg font-bold text-gray-900 dark:text-white line-clamp-2 pr-8">
                        {note.title || 'Untitled Note'}
                      </h4>
                      {note.isImportant && (
                        <div className="text-red-500 bg-white/80 dark:bg-red-900/30 p-1.5 rounded-lg shadow-sm">
                          <AlertTriangle size={18} />
                        </div>
                      )}
                    </div>

                    <p className="text-gray-700 dark:text-gray-300 text-sm leading-relaxed mb-8 flex-grow line-clamp-6">
                      {note.content}
                    </p>

                    <div className="flex items-center justify-between mt-auto pt-4 border-t border-black/5 dark:border-white/5">
                      <div className="flex items-center text-xs text-gray-500 font-medium">
                        <Clock size={14} className="mr-1.5 opacity-60" />
                        {new Date(note.createdAt).toLocaleDateString('en-US', { 
                          month: 'long', 
                          day: 'numeric', 
                          year: 'numeric' 
                        })}
                      </div>
                      
                      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-all transform translate-y-2 group-hover:translate-y-0">
                        <button 
                          onClick={() => this.handleOpenEdit(note)}
                          className="p-2 text-gray-600 hover:text-blue-600 hover:bg-white/80 dark:hover:bg-gray-700 rounded-lg transition-colors"
                          title="Edit"
                        >
                          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z"></path></svg>
                        </button>
                        <button 
                          onClick={(e) => this.handleDelete(note.id, e)}
                          className="p-2 text-gray-600 hover:text-red-500 hover:bg-white/80 dark:hover:bg-gray-700 rounded-lg transition-colors"
                          title="Delete"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>
        )}

        {/* Create/Edit Modal */}
        <AnimatePresence>
          {isModalOpen && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="absolute inset-0 bg-black/40 backdrop-blur-[2px]"
                onClick={this.handleCloseModal}
              />
              <motion.div
                initial={{ opacity: 0, scale: 0.9, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9, y: 20 }}
                className="relative bg-white dark:bg-gray-900 rounded-[2.5rem] shadow-2xl w-full max-w-lg overflow-hidden border border-gray-100 dark:border-gray-800"
              >
                <div className="p-8">
                  <div className="flex justify-between items-center mb-8">
                    <h3 className="text-2xl font-bold text-gray-900 dark:text-white">
                      {isEditing ? 'Edit Note' : 'New Note'}
                    </h3>
                    <button 
                      onClick={this.handleCloseModal}
                      className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-xl transition-colors text-gray-400"
                    >
                      <Plus size={24} className="rotate-45" />
                    </button>
                  </div>
                  
                  <form onSubmit={this.handleSubmit} className="space-y-6">
                    <div>
                      <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2 ml-1">Title</label>
                      <input
                        type="text"
                        placeholder="e.g. Order USB-C Cables"
                        className="w-full px-5 py-3.5 bg-gray-50 dark:bg-gray-800 border-none rounded-2xl text-sm focus:ring-2 focus:ring-blue-500 dark:text-white transition-all shadow-inner"
                        value={formTitle}
                        onChange={(e) => this.setState({ formTitle: e.target.value })}
                        required
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2 ml-1">Content</label>
                      <textarea
                        rows={5}
                        placeholder="What's on your mind?"
                        className="w-full px-5 py-3.5 bg-gray-50 dark:bg-gray-800 border-none rounded-2xl text-sm focus:ring-2 focus:ring-blue-500 dark:text-white transition-all shadow-inner resize-none"
                        value={formContent}
                        onChange={(e) => this.setState({ formContent: e.target.value })}
                        required
                      />
                    </div>

                    <div className="flex items-center gap-3 p-4 bg-gray-50 dark:bg-gray-800 rounded-2xl">
                      <input
                        type="checkbox"
                        id="important"
                        className="w-5 h-5 text-blue-600 rounded-lg border-gray-300 focus:ring-blue-500 dark:bg-gray-700 pointer-cursor"
                        checked={formIsImportant}
                        onChange={(e) => this.setState({ formIsImportant: e.target.checked })}
                      />
                      <label htmlFor="important" className="text-sm font-bold text-gray-700 dark:text-gray-300 cursor-pointer select-none">
                        Mark as important
                      </label>
                    </div>

                    <div className="flex gap-4 pt-4">
                      <button 
                        type="button"
                        onClick={this.handleCloseModal}
                        className="flex-1 px-6 py-3.5 bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-750 text-gray-700 dark:text-gray-300 font-bold rounded-2xl transition-all"
                      >
                        Cancel
                      </button>
                      <button 
                        type="submit"
                        className="flex-1 px-6 py-3.5 bg-blue-600 hover:bg-blue-700 shadow-lg shadow-blue-500/30 text-white font-bold rounded-2xl transition-all"
                      >
                        {isEditing ? 'Save Changes' : 'Create Note'}
                      </button>
                    </div>
                  </form>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>
      </div>
    );
  }
}
