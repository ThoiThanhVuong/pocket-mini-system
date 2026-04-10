import React from 'react';

interface PaginationProps {
  totalItems: number;
  currentPage: number;
  pageSize: number;
  onPageChange: (page: number) => void;
  labelShowing?: string;
  labelTo?: string;
  labelOf?: string;
  labelResults?: string;
  labelPrevious?: string;
  labelNext?: string;
}

export const Pagination: React.FC<PaginationProps> = ({
  totalItems,
  currentPage,
  pageSize,
  onPageChange,
  labelShowing = "Showing",
  labelTo = "to",
  labelOf = "of",
  labelResults = "entries",
  labelPrevious = "Previous",
  labelNext = "Next"
}) => {
  const totalPages = Math.ceil(totalItems / pageSize);
  const startIndex = totalItems === 0 ? 0 : (currentPage - 1) * pageSize + 1;
  const endIndex = Math.min(currentPage * pageSize, totalItems);

  if (totalPages <= 1 && totalItems <= pageSize) {
    if (totalItems === 0) return null;
    // Still show "Showing 1 to X of X" but skip buttons
    return (
      <div className="px-6 py-4 flex items-center justify-between border-t border-gray-200 dark:border-gray-700">
        <div className="text-sm text-gray-500 dark:text-gray-400">
          {labelShowing} <span className="font-medium">{startIndex}</span> {labelTo}{' '}
          <span className="font-medium">{endIndex}</span> {labelOf}{' '}
          <span className="font-medium">{totalItems}</span> {labelResults}
        </div>
      </div>
    );
  }

  const getPageNumbers = () => {
    const pages = [];
    const maxVisible = 5;
    
    if (totalPages <= maxVisible) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else {
      let start = Math.max(1, currentPage - 2);
      let end = Math.min(totalPages, start + maxVisible - 1);
      
      if (end === totalPages) {
        start = Math.max(1, end - maxVisible + 1);
      }
      
      for (let i = start; i <= end; i++) pages.push(i);
    }
    return pages;
  };

  return (
    <div className="px-6 py-4 flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-gray-200 dark:border-gray-700">
      <div className="text-sm text-gray-500 dark:text-gray-400 order-2 sm:order-1">
        {labelShowing} <span className="font-medium">{startIndex}</span> {labelTo}{' '}
        <span className="font-medium">{endIndex}</span> {labelOf}{' '}
        <span className="font-medium">{totalItems}</span> {labelResults}
      </div>
      <div className="flex items-center space-x-1 order-1 sm:order-2">
        <button 
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1}
          className="px-3 py-1 text-sm border border-gray-200 dark:border-gray-600 rounded-md hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-300 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {labelPrevious}
        </button>
        
        {getPageNumbers().map(page => (
          <button
            key={page}
            onClick={() => onPageChange(page)}
            className={`px-3 py-1 text-sm rounded-md transition-colors ${
              currentPage === page 
                ? 'bg-blue-600 text-white' 
                : 'border border-gray-200 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-300'
            }`}
          >
            {page}
          </button>
        ))}

        <button 
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          className="px-3 py-1 text-sm border border-gray-200 dark:border-gray-600 rounded-md hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-300 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {labelNext}
        </button>
      </div>
    </div>
  );
};
