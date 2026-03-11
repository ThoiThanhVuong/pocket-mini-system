import React from 'react';
import { Search, Filter, ChevronDown } from 'lucide-react';

interface FilterOption {
  label: string;
  options?: { value: string; label: string }[];
  value?: string;
  onChange?: (value: string) => void;
}

interface TableToolbarProps {
  searchPlaceholder?: string;
  onSearchChange?: (value: string) => void;
  filters?: FilterOption[];
  searchValue?: string; // Add this
}

export const TableToolbar: React.FC<TableToolbarProps> = ({ searchPlaceholder = "Search...", onSearchChange, filters = [], searchValue }) => {
  return (
    <div className="p-4 border-b border-gray-100 dark:border-gray-700 flex flex-col sm:flex-row justify-between gap-4">
      <div className="relative flex-grow max-w-md">
        <Search
          className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
          size={18}
        />
        <input
          type="text"
          placeholder={searchPlaceholder}
          value={searchValue} // Controlled input
          onChange={(e) => onSearchChange?.(e.target.value)}
          className="pl-10 pr-4 py-2 w-full border border-gray-200 dark:border-gray-600 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
        />
      </div>
      <div className="flex gap-2">
        {filters.map((filter, index) => (
            <div key={index} className="relative">
                {filter.options ? (
                    <select
                        value={filter.value}
                        onChange={(e) => filter.onChange?.(e.target.value)}
                        className="appearance-none pl-3 pr-8 py-2 text-sm border border-gray-200 dark:border-gray-600 rounded-md hover:bg-gray-50 dark:hover:bg-gray-700 bg-white dark:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                        <option value="">{filter.label}</option>
                        {filter.options.map((opt) => (
                            <option key={opt.value} value={opt.value}>
                                {opt.label}
                            </option>
                        ))}
                    </select>
                ) : (
                  <button className="flex items-center px-3 py-2 text-sm border border-gray-200 dark:border-gray-600 rounded-md hover:bg-gray-50 dark:hover:bg-gray-700">
                    <span>{filter.label}</span>
                    <Filter size={16} className="ml-2 text-gray-500 dark:text-gray-400" />
                  </button>
                )}
                {filter.options && (
                     <ChevronDown size={14} className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-500 pointer-events-none" />
                )}
            </div>
        ))}
      </div>
    </div>
  );
};
