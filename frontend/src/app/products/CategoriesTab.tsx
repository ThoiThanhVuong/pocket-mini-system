"use client";

import React, { Component } from 'react';
import { motion } from 'framer-motion';
import { Edit, Trash2, Tags } from 'lucide-react';
import { toast } from 'sonner';
import dynamic from 'next/dynamic';
import { TableToolbar } from '@/components/common/TableToolbar';
import { Pagination } from '@/components/common/Pagination';
import { Category } from '@/types/inventory/category';
import { CategoryService } from '@/services/inventory/category.service';

const CategoryModal = dynamic(() => import('./CategoryModal').then(mod => mod.CategoryModal), {
  ssr: false
});

interface CategoriesTabState {
  categories: Category[];
  isModalOpen: boolean;
  selectedCategory: Category | null;
  searchQuery: string;
  currentPage: number;
  pageSize: number;
  totalItems: number;
}

interface CategoriesTabProps {
  onAddClickRef?: (fn: () => void) => void;
}

export class CategoriesTab extends Component<CategoriesTabProps, CategoriesTabState> {
  constructor(props: CategoriesTabProps) {
    super(props);
    this.state = {
      categories: [],
      isModalOpen: false,
      selectedCategory: null,
      searchQuery: '',
      currentPage: 1,
      pageSize: 10,
      totalItems: 0
    };
  }

  loadCategories = async () => {
    try {
      const { searchQuery, currentPage, pageSize } = this.state;
      const data = await CategoryService.getAllCategories({
        search: searchQuery,
        page: currentPage,
        limit: pageSize
      });
      this.setState({ categories: data.items, totalItems: data.meta.totalItems });
    } catch (error) {
      console.error('Failed to fetch categories:', error);
    }
  };

  async componentDidMount() {
    await this.loadCategories();
    if (this.props.onAddClickRef) {
      this.props.onAddClickRef(() => this.openModal());
    }
  }

  openModal = (category: Category | null = null) => {
    this.setState({
      isModalOpen: true,
      selectedCategory: category
    });
  };

  closeModal = () => {
    this.setState({
      isModalOpen: false,
      selectedCategory: null
    });
  };
  
  handleDelete = async (id: string) => {
    if (window.confirm("Bạn có chắc chắn muốn xóa danh mục này? Hãy chắc chắn không có sản phẩm nào đang dùng danh mục này nhé!")) {
        try {
            await CategoryService.deleteCategory(id);
            toast.success('Xóa danh mục thành công');
            await this.loadCategories();
        } catch(e: any) {
            // toast now handled globally in axios.ts
        }
    }
  }

  getFilteredCategories = () => {
    const { categories, searchQuery } = this.state;
    if (searchQuery) {
      // Remove local search filter since we rely on backend results
      // const search = searchQuery.toLowerCase();
      // return c.name.toLowerCase().includes(search) || 
      //        (c.description && c.description.toLowerCase().includes(search));
    }

    // Default: Sort hierarchically
    const childrenMap = new Map<string | undefined, Category[]>();
    categories.forEach(c => {
      const pId = c.parentId || undefined;
      if (!childrenMap.has(pId)) childrenMap.set(pId, []);
      childrenMap.get(pId)!.push(c);
    });

    const sorted: Category[] = [];
    const traverse = (parentId: string | undefined) => {
      const children = childrenMap.get(parentId) || [];
      children.sort((a,b) => a.name.localeCompare(b.name));
      children.forEach(child => {
        sorted.push(child);
        traverse(child.id);
      });
    };
    traverse(undefined);
    return sorted;
  };

  handlePageChange = (page: number) => {
    this.setState({ currentPage: page }, () => {
      this.loadCategories();
    });
  };

  render() {
    const { isModalOpen, selectedCategory, searchQuery, currentPage, pageSize, totalItems, categories } = this.state;
    // We still sort the fetched page hierarchically for presentation
    const filteredCategories = this.getFilteredCategories();
    
    return (
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden mt-6">
        <TableToolbar 
          searchPlaceholder="Search categories..."
          searchValue={searchQuery}
          onSearchChange={(val) => this.setState({ searchQuery: val, currentPage: 1 }, () => this.loadCategories())}
        />
        
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 dark:bg-gray-700/50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Name
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Description
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
              {filteredCategories.length > 0 ? filteredCategories.map((cat, index) =>
              <motion.tr
                key={cat.id}
                className="hover:bg-gray-50 dark:hover:bg-gray-700/30"
                whileHover={{ scale: 1.01 }}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: index * 0.05 }}
              >
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div 
                      className="flex items-center"
                      style={{ paddingLeft: `${(cat.level || 0) * 1.5}rem` }}
                    >
                      {(cat.level || 0) > 0 && <span className="text-gray-400 mr-2">↳</span>}
                      {cat.image ? (
                        <img src={cat.image} alt={cat.name} className="h-10 w-10 rounded-md object-cover mr-3 border border-gray-200 dark:border-gray-700" />
                      ) : (
                        <div className="h-10 w-10 rounded-md bg-gray-100 dark:bg-gray-700 flex items-center justify-center mr-3 border border-gray-200 dark:border-gray-600">
                          <Tags className="h-5 w-5 text-gray-400" />
                        </div>
                      )}
                      <div className="font-medium text-gray-800 dark:text-white">
                        {cat.name}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm text-gray-600 dark:text-gray-300 line-clamp-2">
                      {cat.description || 'N/A'}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right">
                    <motion.button
                    className="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 mr-3"
                    whileHover={{ scale: 1.2 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={() => this.openModal(cat)}>
                      <Edit size={16} />
                    </motion.button>
                    <motion.button
                    className="text-red-600 dark:text-red-400 hover:text-red-800 dark:hover:text-red-300"
                    onClick={() => this.handleDelete(cat.id)}
                    whileHover={{ scale: 1.2 }}
                    whileTap={{ scale: 0.9 }}>
                      <Trash2 size={16} />
                    </motion.button>
                  </td>
                </motion.tr>
              ) : (
                <tr>
                  <td colSpan={3} className="px-6 py-8 text-center text-gray-500 dark:text-gray-400">
                    No categories found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        <Pagination 
          totalItems={totalItems} 
          currentPage={currentPage}
          pageSize={pageSize}
          onPageChange={this.handlePageChange}
          labelShowing="Showing"
          labelTo="to"
          labelOf="of"
          labelResults="results"
          labelPrevious="Previous"
          labelNext="Next"
        />
        {isModalOpen &&
        <CategoryModal
          isOpen={isModalOpen}
          onClose={this.closeModal}
          category={selectedCategory}
          categories={this.state.categories}
          onSuccess={this.loadCategories} />
        }
      </div>
    );
  }
}
