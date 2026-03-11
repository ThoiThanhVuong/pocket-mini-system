"use client";

import React, { Component } from 'react';
import { motion } from 'framer-motion';
import {
  ArrowRightLeft,
  PackageCheck,
  PackageMinus,
  PackagePlus,
  Check } from
'lucide-react';
import { StockIn } from './StockIn';
import { StockOut } from './StockOut';
import { StockTransfer } from './StockTransfer';
import { StockManagementState } from '@/types/inventory/ui';
export default class StockManagementPage extends Component<{}, StockManagementState> {
  constructor(props: {}) {
    super(props);
    this.state = {
      activeTab: 'stock-in'
    };
  }
  setActiveTab = (tab: string) => {
    this.setState({
      activeTab: tab
    });
  };
  renderTabContent = () => {
    const { activeTab } = this.state;
    switch (activeTab) {
      case 'stock-in':
        return <StockIn />;
      case 'stock-out':
        return <StockOut />;
      case 'stock-transfer':
        return <StockTransfer />;
      default:
        return <StockIn />;
    }
  };
  render() {
    const { activeTab } = this.state;
    const tabs = [
    {
      id: 'stock-in',
      label: 'Stock In',
      icon: <PackagePlus size={18} />
    },
    {
      id: 'stock-out',
      label: 'Stock Out',
      icon: <PackageMinus size={18} />
    },
    {
      id: 'stock-transfer',
      label: 'Stock Transfer',
      icon: <ArrowRightLeft size={18} />
    }];

    return (
      <div className="container mx-auto">
        <motion.div
          initial={{
            opacity: 0,
            y: -20
          }}
          animate={{
            opacity: 1,
            y: 0
          }}
          transition={{
            duration: 0.5
          }}
          className="mb-6">

          <h1 className="text-2xl font-bold text-gray-800 dark:text-white">
            Stock Management
          </h1>
          <p className="text-gray-500 dark:text-gray-400">
            Manage inventory across your warehouses
          </p>
        </motion.div>
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden mb-6">
          <div className="border-b border-gray-200 dark:border-gray-700">
            <nav className="flex flex-wrap">
              {tabs.map((tab) =>
              <motion.button
                key={tab.id}
                className={`flex items-center px-6 py-4 text-sm font-medium border-b-2 ${activeTab === tab.id ? 'border-blue-500 text-blue-600 dark:border-blue-400 dark:text-blue-400' : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'}`}
                onClick={() => this.setActiveTab(tab.id)}
                whileHover={{
                  backgroundColor:
                  activeTab === tab.id ? '' : 'rgba(0,0,0,0.03)'
                }}
                whileTap={{
                  scale: 0.98
                }}>

                  <span className="mr-2">{tab.icon}</span>
                  {tab.label}
                </motion.button>
              )}
            </nav>
          </div>
        </div>
        {this.renderTabContent()}
      </div>);

  }
}
