"use client";

import React, { Component } from 'react';
import { motion, AnimatePresence, Variants } from 'framer-motion';
import { X, Upload } from 'lucide-react';
import { Category } from '@/types/inventory/category';
import { CategoryService } from '@/services/inventory/category.service';
import { UploadService } from '@/services/common/upload.service';

interface CategoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  category: Category | null;
  categories: Category[];
  onSuccess?: () => void;
}

interface CategoryModalState {
  name: string;
  description: string;
  parentId: string;
  isSubmitting: boolean;
  error: string | null;
  imageFile: File | null;
  imagePreview: string;
}

export class CategoryModal extends Component<CategoryModalProps, CategoryModalState> {
  constructor(props: CategoryModalProps) {
    super(props);
    const c = props.category;
    this.state = {
      name: c?.name || '',
      description: c?.description || '',
      parentId: c?.parentId || '',
      isSubmitting: false,
      error: null,
      imageFile: null,
      imagePreview: c?.image || ''
    };
  }

  componentDidUpdate(prevProps: CategoryModalProps) {
    if (this.props.isOpen && !prevProps.isOpen) {
      const c = this.props.category;
      this.setState({
        name: c?.name || '',
        description: c?.description || '',
        parentId: c?.parentId || '',
        error: null,
        isSubmitting: false,
        imageFile: null,
        imagePreview: c?.image || ''
      });
    }
  }

  handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { id, value } = e.target;
    this.setState({ [id]: value } as unknown as Pick<CategoryModalState, keyof CategoryModalState>);
  };

  handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    this.setState({ isSubmitting: true, error: null });

    const { name, description, parentId, imageFile, imagePreview } = this.state;
    const data: any = { 
      name, 
      description,
      parentId: parentId || null
    };

    if (imagePreview && !imageFile) {
      data.image = imagePreview;
    }

    try {
      if (imageFile) {
        data.image = await UploadService.uploadFile(imageFile);
      }

      if (this.props.category) {
        await CategoryService.updateCategory(this.props.category.id, data);
      } else {
        await CategoryService.createCategory(data);
      }
      if (this.props.onSuccess) this.props.onSuccess();
      this.props.onClose();
    } catch (error: any) {
      console.error('Failed to save category:', error);
      this.setState({
        error: error.response?.data?.message || error.message || 'Có lỗi xảy ra',
        isSubmitting: false
      });
    }
  };

  handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      this.setState({
        imageFile: file,
        imagePreview: URL.createObjectURL(file)
      });
    }
  };

  render() {
    const { isOpen, onClose, category, categories } = this.props;
    const { name, description, parentId, isSubmitting, error, imagePreview } = this.state;
    const isEditing = !!category;

    // Helper to sort and indent categories
    const childrenMap = new Map<string | undefined, Category[]>();
    categories.forEach(c => {
      const pId = c.parentId || undefined;
      if (!childrenMap.has(pId)) childrenMap.set(pId, []);
      childrenMap.get(pId)!.push(c);
    });

    const sortedCategories: Category[] = [];
    const traverse = (pId: string | undefined) => {
      const children = childrenMap.get(pId) || [];
      children.sort((a,b) => a.name.localeCompare(b.name));
      children.forEach(child => {
        sortedCategories.push(child);
        traverse(child.id);
      });
    };
    traverse(undefined);
    
    // Filter out the current category to prevent picking itself as parent
    const availableParents = sortedCategories.filter(c => c.id !== category?.id);

    const modalVariants: Variants = {
      hidden: { opacity: 0, scale: 0.8 },
      visible: { opacity: 1, scale: 1, transition: { type: 'spring', duration: 0.5, bounce: 0.4 } },
      exit: { opacity: 0, scale: 0.8, transition: { duration: 0.2 } }
    };
    const backdropVariants: Variants = {
      hidden: { opacity: 0 },
      visible: { opacity: 1 },
      exit: { opacity: 0 }
    };

    return (
      <AnimatePresence>
        {isOpen && (
          <div className="fixed inset-0 z-50 overflow-y-auto">
            <motion.div
              className="fixed inset-0 bg-black bg-opacity-50"
              variants={backdropVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              onClick={onClose}
            />

            <div className="flex items-center justify-center min-h-screen p-4">
              <motion.div
                className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-md w-full mx-auto z-10 my-8"
                variants={modalVariants}
                initial="hidden"
                animate="visible"
                exit="exit"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="flex justify-between items-center p-6 border-b border-gray-200 dark:border-gray-700">
                  <h2 className="text-xl font-semibold text-gray-800 dark:text-white">
                    {isEditing ? 'Sửa danh mục' : 'Thêm danh mục mới'}
                  </h2>
                  <motion.button
                    className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={onClose}
                  >
                    <X size={20} />
                  </motion.button>
                </div>
                
                <div className="p-6">
                  {error && (
                    <div className="mb-4 p-3 bg-red-50 text-red-700 rounded-md text-sm border border-red-200">
                      {error}
                    </div>
                  )}

                  <form onSubmit={this.handleSubmit}>
                    <div className="mb-4">
                      <label className="block mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                        Hình ảnh danh mục
                      </label>
                      <div className="relative border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-6 text-center hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                        <input 
                           type="file" 
                           accept="image/*" 
                           onChange={this.handleImageChange} 
                           className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                        />
                        {imagePreview ? (
                          <div className="relative w-32 h-32 mx-auto">
                            <img src={imagePreview} alt="Preview" className="w-full h-full object-cover rounded-md shadow-sm" />
                          </div>
                        ) : (
                          <motion.div className="mx-auto flex flex-col items-center" whileHover={{ scale: 1.02 }}>
                            <Upload className="text-gray-400 mb-2" size={24} />
                            <p className="text-sm text-gray-500 dark:text-gray-400">
                              Kéo thả hình ảnh vào đây, hoặc <span className="text-blue-600 dark:text-blue-400 font-medium">chọn tệp</span>
                            </p>
                            <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">PNG, JPG hoặc GIF dưới 2MB</p>
                          </motion.div>
                        )}
                      </div>
                    </div>

                    <div className="mb-4">
                      <label htmlFor="name" className="block mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                        Tên danh mục <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        id="name"
                        required
                        value={name}
                        onChange={this.handleInputChange}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                        placeholder="Ex: Electronics"
                      />
                    </div>

                    <div className="mb-4">
                      <label htmlFor="parentId" className="block mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                        Danh mục cha
                      </label>
                      <select
                        id="parentId"
                        value={parentId}
                        onChange={this.handleInputChange}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                      >
                        <option value="">-- Không có (Danh mục gốc) --</option>
                        {availableParents.map(c => (
                          <option key={c.id} value={c.id}>
                            {"\u00A0\u00A0\u00A0".repeat(c.level || 0)}{c.level > 0 ? "↳ " : ""}{c.name}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="mb-4">
                      <label htmlFor="description" className="block mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                        Mô tả
                      </label>
                      <textarea
                        id="description"
                        rows={3}
                        value={description}
                        onChange={this.handleInputChange}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                        placeholder="Mô tả danh mục..."
                      />
                    </div>

                    <div className="flex justify-end space-x-3 mt-6 pt-4 border-t border-gray-200 dark:border-gray-700">
                      <motion.button
                        type="button"
                        className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={onClose}
                        disabled={isSubmitting}
                      >
                        Hủy
                      </motion.button>
                      <motion.button
                        type="submit"
                        className={`px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 ${isSubmitting ? 'opacity-70 cursor-not-allowed' : ''}`}
                        whileHover={!isSubmitting ? { scale: 1.05 } : {}}
                        whileTap={!isSubmitting ? { scale: 0.95 } : {}}
                        disabled={isSubmitting}
                      >
                        {isSubmitting ? 'Đang lưu...' : (isEditing ? 'Cập nhật' : 'Thêm danh mục')}
                      </motion.button>
                    </div>
                  </form>
                </div>
              </motion.div>
            </div>
          </div>
        )}
      </AnimatePresence>
    );
  }
}
