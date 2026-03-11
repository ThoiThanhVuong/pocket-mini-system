import React from 'react';

interface PaginationProps {
  totalItems: number;
  startIndex?: number;
  endIndex?: number;
  labelShowing?: string;
  labelTo?: string;
  labelOf?: string;
  labelResults?: string;
  labelPrevious?: string;
  labelNext?: string;
}

export const Pagination: React.FC<PaginationProps> = ({
  totalItems,
  startIndex = 1,
  endIndex = totalItems,
  labelShowing = "Hiển thị",
  labelTo = "đến",
  labelOf = "của",
  labelResults = "kết quả",
  labelPrevious = "Trước",
  labelNext = "Sau"
}) => {
  return (
    <div className="px-6 py-4 flex items-center justify-between border-t border-gray-200 dark:border-gray-700">
      <div className="text-sm text-gray-500 dark:text-gray-400">
        {labelShowing} <span className="font-medium">{startIndex}</span> {labelTo}{' '}
        <span className="font-medium">{endIndex}</span> {labelOf}{' '}
        <span className="font-medium">{totalItems}</span> {labelResults}
      </div>
      <div className="flex space-x-2">
        <button className="px-3 py-1 text-sm border border-gray-200 dark:border-gray-600 rounded-md hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-300">
          {labelPrevious}
        </button>
        <button className="px-3 py-1 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700">
          1
        </button>
        <button className="px-3 py-1 text-sm border border-gray-200 dark:border-gray-600 rounded-md hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-300">
          {labelNext}
        </button>
      </div>
    </div>
  );
};
