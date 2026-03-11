"use client";

import React, { Component } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Search, 
  Filter, 
  Download, 
  RefreshCw, 
  FileText, 
  User, 
  Clock,
  Info,
  X
} from 'lucide-react';
import { Pagination } from '@/components/common/Pagination';
import { StatusBadge } from '@/components/common/StatusBadge';
import { AuditService, AuditLogItem } from '@/services/system/audit.service';

interface LogsState {
  logs: AuditLogItem[];
  isLoading: boolean;
  searchTerm: string;
  selectedLog: AuditLogItem | null;
}

export default class LogsPage extends Component<{}, LogsState> {
  constructor(props: {}) {
    super(props);
    this.state = {
      logs: [],
      isLoading: true,
      searchTerm: '',
      selectedLog: null
    };
  }

  componentDidMount() {
    this.loadLogs();
  }

  loadLogs = async () => {
    try {
      this.setState({ isLoading: true });
      const data = await AuditService.getAllHistory();
      this.setState({ logs: data || [] });
    } catch (error) {
      console.error('Failed to load logs', error);
    } finally {
      this.setState({ isLoading: false });
    }
  };

  getActionBadgeClass = (action: string) => {
    switch (action) {
      case 'CREATE':
        return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400';
      case 'UPDATE':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400';
      case 'DELETE':
        return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400';
      case 'APPROVE':
        return 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400';
      case 'COMPLETE':
        return 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400';
      case 'CANCEL':
        return 'bg-rose-100 text-rose-800 dark:bg-rose-900/30 dark:text-rose-400';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300';
    }
  };

  handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    this.setState({ searchTerm: e.target.value });
  };

  getFilteredLogs = () => {
    const { logs, searchTerm } = this.state;
    if (!searchTerm) return logs;
    const lowerSearch = searchTerm.toLowerCase();
    return logs.filter(log => 
      log.action.toLowerCase().includes(lowerSearch) ||
      log.entityType.toLowerCase().includes(lowerSearch) ||
      (log.user?.fullName && log.user.fullName.toLowerCase().includes(lowerSearch))
    );
  };

  handleViewDetails = (log: AuditLogItem) => {
    this.setState({ selectedLog: log });
  };

  closeModal = () => {
    this.setState({ selectedLog: null });
  };

  render() {
    const { isLoading, searchTerm } = this.state;
    const filteredLogs = this.getFilteredLogs();

    return (
      <div className="container mx-auto">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-6 flex flex-col md:flex-row md:items-center md:justify-between gap-4"
        >
          <div>
            <h1 className="text-2xl font-bold text-gray-800 dark:text-white">System Logs</h1>
            <p className="text-gray-500 dark:text-gray-400">Track all activities and system events</p>
          </div>
          <div className="flex space-x-2">
            <motion.button
              className="flex items-center space-x-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 px-4 py-2 rounded-lg text-sm text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={this.loadLogs}
            >
              <RefreshCw size={16} className={isLoading ? 'animate-spin' : ''} />
              <span>Refresh</span>
            </motion.button>
            <motion.button
              className="flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-blue-700"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <Download size={16} />
              <span>Export CSV</span>
            </motion.button>
          </div>
        </motion.div>

        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
          <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex flex-col sm:flex-row justify-between gap-4">
            <div className="relative max-w-md w-full">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
              <input
                type="text"
                placeholder="Search by action, user, or resource..."
                className="pl-10 pr-4 py-2 w-full border border-gray-200 dark:border-gray-600 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                value={searchTerm}
                onChange={this.handleSearch}
              />
            </div>
            <div className="flex space-x-2">
              <button className="flex items-center space-x-2 px-3 py-2 border border-gray-200 dark:border-gray-700 rounded-lg text-sm text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                <Filter size={16} />
                <span>Filters</span>
              </button>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-50 dark:bg-gray-700/50 border-b border-gray-200 dark:border-gray-700">
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Timestamp</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">User</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Action</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Resource</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Changes</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Details</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                {isLoading ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-12 text-center">
                      <div className="flex flex-col items-center">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mb-2"></div>
                        <span className="text-sm text-gray-500">Loading audit history...</span>
                      </div>
                    </td>
                  </tr>
                ) : filteredLogs.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-12 text-center text-gray-500">
                      No logs matching your search criteria
                    </td>
                  </tr>
                ) : (
                  filteredLogs.map((log, index) => (
                    <motion.tr
                      key={log.id}
                      className="hover:bg-gray-50 dark:hover:bg-gray-700/30"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3, delay: index * 0.02 }}
                    >
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <Clock size={14} className="text-gray-400 mr-2" />
                          <div>
                            <div className="text-sm text-gray-800 dark:text-white">
                              {new Date(log.createdAt).toLocaleDateString()}
                            </div>
                            <div className="text-xs text-gray-500">
                              {new Date(log.createdAt).toLocaleTimeString()}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="h-7 w-7 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center mr-2">
                            <User size={14} className="text-blue-600 dark:text-blue-400" />
                          </div>
                          <span className="text-sm text-gray-700 dark:text-gray-300">
                            {log.user?.fullName || 'System'}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <StatusBadge className={this.getActionBadgeClass(log.action)}>
                          {log.action}
                        </StatusBadge>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <FileText size={14} className="text-gray-400 mr-2" />
                          <span className="text-sm text-gray-600 dark:text-gray-300 capitalize">
                            {log.entityType.replace('_', ' ')}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-xs text-gray-500 dark:text-gray-400 max-w-xs truncate font-mono bg-gray-50 dark:bg-gray-800/50 p-1 rounded">
                          {JSON.stringify(log.changes || {})}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right">
                        <button 
                          onClick={() => this.handleViewDetails(log)}
                          className="text-blue-600 hover:text-blue-800 p-1 rounded hover:bg-blue-50 transition-colors"
                        >
                          <Info size={16} />
                        </button>
                      </td>
                    </motion.tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          <div className="p-4 border-t border-gray-200 dark:border-gray-700">
            <Pagination 
              totalItems={filteredLogs.length}
              labelShowing="Showing"
              labelTo="to"
              labelOf="of"
              labelResults="entries"
              labelPrevious="Previous"
              labelNext="Next"
            />
          </div>
        </div>

        {/* Details Modal */}
        <AnimatePresence>
          {this.state.selectedLog && (() => {
            const log = this.state.selectedLog;
            return (
              <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="absolute inset-0 bg-black/50 backdrop-blur-sm"
                  onClick={this.closeModal}
                />
                <motion.div
                  initial={{ opacity: 0, scale: 0.95, y: 20 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95, y: 20 }}
                  className="relative bg-white dark:bg-gray-800 rounded-xl shadow-2xl w-full max-w-2xl overflow-hidden z-10"
                >
                  <div className="flex items-center justify-between p-4 border-b border-gray-100 dark:border-gray-700">
                    <h3 className="text-lg font-semibold text-gray-800 dark:text-white">Audit Log Details</h3>
                    <button 
                      onClick={this.closeModal}
                      className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors text-gray-400"
                    >
                      <X size={20} />
                    </button>
                  </div>
                  
                  <div className="p-6 overflow-y-auto max-h-[70vh]">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                      <div className="space-y-4">
                        <div>
                          <span className="text-xs font-medium text-gray-400 uppercase tracking-wider block mb-1">User</span>
                          <div className="flex items-center">
                            <div className="h-8 w-8 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center mr-2">
                              <User size={16} className="text-blue-600 dark:text-blue-400" />
                            </div>
                            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                              {log.user?.fullName || 'System'}
                            </span>
                          </div>
                        </div>
                        <div>
                          <span className="text-xs font-medium text-gray-400 uppercase tracking-wider block mb-1">Action</span>
                          <StatusBadge className={this.getActionBadgeClass(log.action)}>
                            {log.action}
                          </StatusBadge>
                        </div>
                      </div>
                      <div className="space-y-4">
                        <div>
                          <span className="text-xs font-medium text-gray-400 uppercase tracking-wider block mb-1">Timestamp</span>
                          <div className="flex items-center text-sm text-gray-700 dark:text-gray-300">
                            <Clock size={14} className="mr-2 text-gray-400" />
                            {new Date(log.createdAt).toLocaleString()}
                          </div>
                        </div>
                        <div>
                          <span className="text-xs font-medium text-gray-400 uppercase tracking-wider block mb-1">Resource</span>
                          <div className="flex items-center text-sm text-gray-700 dark:text-gray-300 capitalize">
                            <FileText size={14} className="mr-2 text-gray-400" />
                            {log.entityType.replace('_', ' ')}
                            <span className="ml-2 px-2 py-0.5 bg-gray-100 dark:bg-gray-700 rounded text-xs">
                              ID: {log.entityId.slice(0, 8)}...
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div>
                      <span className="text-xs font-medium text-gray-400 uppercase tracking-wider block mb-2">Changes Data</span>
                      <div className="bg-gray-950 rounded-lg p-4 overflow-x-auto border border-gray-800">
                        <pre className="text-xs font-mono text-blue-400">
                          {JSON.stringify(log.changes, null, 2)}
                        </pre>
                      </div>
                    </div>
                  </div>

                  <div className="p-4 bg-gray-50 dark:bg-gray-800/50 flex justify-end">
                    <button 
                      onClick={this.closeModal}
                      className="px-4 py-2 bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg text-sm font-medium text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors"
                    >
                      Close
                    </button>
                  </div>
                </motion.div>
              </div>
            );
          })()}
        </AnimatePresence>
      </div>
    );
  }
}
