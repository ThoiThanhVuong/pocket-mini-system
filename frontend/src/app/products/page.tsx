"use client";

import React, { Component } from 'react';
import { motion } from 'framer-motion';
import { Package, Tags } from 'lucide-react';
import { PageHeader } from '@/components/common/PageHeader';
import { ProductsTab } from './ProductsTab';
import { CategoriesTab } from './CategoriesTab';
import { ExcelImportButton } from '@/components/common/ExcelImportButton';

interface ProductsPageState {
  activeTab: string;
}

export default class ProductsPage extends Component<{}, ProductsPageState> {
  private addProductFn: (() => void) | null = null;
  private addCategoryFn: (() => void) | null = null;

  constructor(props: {}) {
    super(props);
    this.state = {
      activeTab: 'products'
    };
  }

  setActiveTab = (tab: string) => {
    this.setState({ activeTab: tab });
  };

  handleMainAction = () => {
    if (this.state.activeTab === 'products' && this.addProductFn) {
      this.addProductFn();
    } else if (this.state.activeTab === 'categories' && this.addCategoryFn) {
      this.addCategoryFn();
    }
  };

  renderTabContent = () => {
    const { activeTab } = this.state;
    switch (activeTab) {
      case 'products':
        return <ProductsTab onAddClickRef={(fn) => { this.addProductFn = fn; }} />;
      case 'categories':
        return <CategoriesTab onAddClickRef={(fn) => { this.addCategoryFn = fn; }} />;
      default:
        return <ProductsTab onAddClickRef={(fn) => { this.addProductFn = fn; }} />;
    }
  };

  render() {
    const { activeTab } = this.state;
    const tabs = [
      { id: 'products', label: 'Products', icon: <Package size={18} /> },
      { id: 'categories', label: 'Categories', icon: <Tags size={18} /> }
    ];

    return (
      <div>
        <PageHeader 
          title="Catalog Management" 
          description="Manage your products and categories"
          actionLabel={activeTab === 'products' ? 'Add Product' : 'Add Category'}
          onAction={this.handleMainAction}
        >
          {activeTab === 'products' && (
            <ExcelImportButton 
              endpoint="/products/import" 
              templateEndpoint="/products/import-template"
              onSuccess={() => window.location.reload()}
              permission="product.create"
            />
          )}
        </PageHeader>
        
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden mb-6">
          <div className="border-b border-gray-200 dark:border-gray-700">
            <nav className="flex flex-wrap">
              {tabs.map((tab) => (
                <motion.button
                  key={tab.id}
                  className={`flex items-center px-6 py-4 text-sm font-medium border-b-2 ${
                    activeTab === tab.id 
                      ? 'border-blue-500 text-blue-600 dark:border-blue-400 dark:text-blue-400' 
                      : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
                  }`}
                  onClick={() => this.setActiveTab(tab.id)}
                  whileHover={{ backgroundColor: activeTab === tab.id ? '' : 'rgba(0,0,0,0.03)' }}
                  whileTap={{ scale: 0.98 }}
                >
                  <span className="mr-2">{tab.icon}</span>
                  {tab.label}
                </motion.button>
              ))}
            </nav>
          </div>
        </div>

        {this.renderTabContent()}
      </div>
    );
  }
}
