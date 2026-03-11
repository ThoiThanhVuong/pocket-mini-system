"use client";

import React, { Component } from 'react';
import { motion } from 'framer-motion';
import { Edit, Trash2, Package } from 'lucide-react';
import { toast } from 'sonner';
import dynamic from 'next/dynamic';
import { TableToolbar } from '@/components/common/TableToolbar';
import { Pagination } from '@/components/common/Pagination';
import { StatusBadge } from '@/components/common/StatusBadge';
import { Product } from '@/types/inventory/product';
import { ProductService } from '@/services/inventory/product.service';
import { Category } from '@/types/inventory/category';
import { CategoryService } from '@/services/inventory/category.service';

const ProductModal = dynamic(() => import('./ProductModal').then(mod => mod.ProductModal), {
  ssr: false
});

interface ProductsTabState {
  products: any[];
  categories: Category[];
  isModalOpen: boolean;
  selectedProduct: any | null;
  searchQuery: string;
  categoryFilter: string;
  statusFilter: string;
}

interface ProductsTabProps {
  onAddClickRef?: (fn: () => void) => void;
}

export class ProductsTab extends Component<ProductsTabProps, ProductsTabState> {
  constructor(props: ProductsTabProps) {
    super(props);
    this.state = {
      products: [],
      categories: [],
      isModalOpen: false,
      selectedProduct: null,
      searchQuery: '',
      categoryFilter: '',
      statusFilter: ''
    };
  }

  loadProducts = async () => {
    try {
      const cats = await CategoryService.getAllCategories();
      const catMap = cats.reduce((acc: any, cat) => {
        acc[cat.id] = cat.name;
        return acc;
      }, {});

      const data = await ProductService.getAllProducts();
      const formattedProducts = data.map((p: any) => ({
        ...p,
        categoryId: p.categoryId,
        category: catMap[p.categoryId] || 'Uncategorized',
        stock: p.stockQuantity ?? 0,
        status: p.isActive ? 'Active' : 'Inactive'
      }));
      this.setState({ products: formattedProducts, categories: cats });
    } catch (error) {
      console.error('Failed to fetch data:', error);
    }
  };

  async componentDidMount() {
    await this.loadProducts();
    if (this.props.onAddClickRef) {
      this.props.onAddClickRef(() => this.openModal());
    }
  }

  openModal = (product: any | null = null) => {
    this.setState({
      isModalOpen: true,
      selectedProduct: product
    });
  };

  closeModal = () => {
    this.setState({
      isModalOpen: false,
      selectedProduct: null
    });
  };

  getStatusBadgeClass = (status: string) => {
    switch (status) {
      case 'Active':
        return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400';
      case 'Inactive':
        return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300';
    }
  };

  handleDelete = async (product: any) => {
    if (window.confirm(`Bạn có chắc chắn muốn ngưng kinh doanh sản phẩm "${product.name}"?`)) {
      try {
        await ProductService.deleteProduct(product.id);
        toast.success(`Đã ngưng kinh doanh sản phẩm ${product.name}`);
        await this.loadProducts();
      } catch (error: any) {
        // toast now handled globally in axios.ts
      }
    }
  };

  getFilteredProducts = () => {
    const { products, searchQuery, categoryFilter, statusFilter } = this.state;
    return products.filter(p => {
      const matchesSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                            (p.sku && p.sku.toLowerCase().includes(searchQuery.toLowerCase()));
      const matchesCategory = categoryFilter ? p.categoryId === categoryFilter : true;
      const matchesStatus = statusFilter ? p.status === statusFilter : true;
      return matchesSearch && matchesCategory && matchesStatus;
    });
  };

  render() {
    const { isModalOpen, selectedProduct, categories, searchQuery, categoryFilter, statusFilter } = this.state;
    const filteredProducts = this.getFilteredProducts();
    
    return (
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden mt-6">
        <TableToolbar 
          searchPlaceholder="Search products by name or SKU..."
          searchValue={searchQuery}
          onSearchChange={(val) => this.setState({ searchQuery: val })}
          filters={[
            { 
              label: 'Category',
              value: categoryFilter,
              options: categories.map(c => ({ value: c.id, label: c.name })),
              onChange: (val) => this.setState({ categoryFilter: val })
            }, 
            { 
              label: 'Status',
              value: statusFilter,
              options: [
                { value: 'Active', label: 'Active' },
                { value: 'Inactive', label: 'Inactive' }
              ],
              onChange: (val) => this.setState({ statusFilter: val })
            }
          ]}
        />
        
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 dark:bg-gray-700/50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Product
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Category
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Price
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Stock
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
              {filteredProducts.length > 0 ? filteredProducts.map((product, index) =>
              <motion.tr
                key={product.id}
                className="hover:bg-gray-50 dark:hover:bg-gray-700/30"
                whileHover={{ scale: 1.01 }}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: index * 0.05 }}
              >
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      {product.image ? (
                        <img src={product.image} alt={product.name} className="h-10 w-10 rounded-md object-cover mr-3 border border-gray-200 dark:border-gray-700" />
                      ) : (
                        <div className="h-10 w-10 rounded-md bg-gray-100 dark:bg-gray-700 flex items-center justify-center mr-3 border border-gray-200 dark:border-gray-600">
                          <Package className="h-5 w-5 text-gray-400" />
                        </div>
                      )}
                      <div className="font-medium text-gray-800 dark:text-white">
                        {product.name}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-600 dark:text-gray-300">
                      {product.category}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-600 dark:text-gray-300">
                      {product.price.toLocaleString('vi-VN')} ₫
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-600 dark:text-gray-300">
                      {product.stock}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <StatusBadge className={this.getStatusBadgeClass(product.status)}>
                      {product.status}
                    </StatusBadge>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right">
                    <motion.button
                    className="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 mr-3"
                    whileHover={{ scale: 1.2 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={() => this.openModal(product)}>
                      <Edit size={16} />
                    </motion.button>
                    <motion.button
                    className="text-red-600 dark:text-red-400 hover:text-red-800 dark:hover:text-red-300"
                    whileHover={{ scale: 1.2 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={() => this.handleDelete(product)}>
                      <Trash2 size={16} />
                    </motion.button>
                  </td>
                </motion.tr>
              ) : (
                <tr>
                  <td colSpan={6} className="px-6 py-8 text-center text-gray-500 dark:text-gray-400">
                    No products found matching your criteria.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        <Pagination 
          totalItems={filteredProducts.length} 
          labelShowing="Showing"
          labelTo="to"
          labelOf="of"
          labelResults="results"
          labelPrevious="Previous"
          labelNext="Next"
        />
        {isModalOpen &&
        <ProductModal
          isOpen={isModalOpen}
          onClose={this.closeModal}
          product={selectedProduct}
          onSuccess={this.loadProducts} />
        }
      </div>
    );
  }
}
