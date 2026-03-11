import React from 'react';

interface StatusBadgeProps {
  className?: string; // Expects the full badge class string (bg-..., text-...)
  children: React.ReactNode; 
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ className, children }) => {
  return (
    <span className={`px-2 py-1 text-xs rounded-full ${className || ''}`}>
      {children}
    </span>
  );
};
