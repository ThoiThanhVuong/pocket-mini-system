import React from 'react';
import { motion } from 'framer-motion';
import { Plus } from 'lucide-react';
import { Can } from '@/components/common/Can';

interface PageHeaderProps {
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
  actionPermission?: string;
  children?: React.ReactNode;
}

export const PageHeader: React.FC<PageHeaderProps> = ({ 
  title, 
  description, 
  actionLabel, 
  onAction,
  actionPermission,
  children
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="flex justify-between items-center mb-6"
    >
      <div>
        <h1 className="text-2xl font-bold text-gray-800 dark:text-white">{title}</h1>
        <p className="text-gray-500 dark:text-gray-400">{description}</p>
      </div>
      <div className="flex items-center gap-3">
        {children}
        {actionLabel && onAction && (
          actionPermission ? (
            <Can permission={actionPermission}>
              <motion.button
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md flex items-center h-[40px]"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={onAction}
              >
                <Plus size={18} className="mr-1" /> {actionLabel}
              </motion.button>
            </Can>
          ) : (
            <motion.button
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md flex items-center h-[40px]"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={onAction}
            >
              <Plus size={18} className="mr-1" /> {actionLabel}
            </motion.button>
          )
        )}
      </div>
    </motion.div>
  );
};
