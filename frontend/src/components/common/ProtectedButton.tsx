'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { usePermission } from '@/hooks/usePermission';

interface ProtectedButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  permission: string;
  className?: string;
}


export function ProtectedButton({
  permission,
  className = '',
  onClick,
  children,
  disabled,
  title,
  ...rest
}: ProtectedButtonProps) {
  const { hasPermission } = usePermission();
  const allowed = hasPermission(permission);

  return (
    <motion.button
      {...(rest as any)}
      disabled={!allowed || disabled}
      title={!allowed ? 'Bạn không có quyền thực hiện thao tác này' : title}
      className={`${className} ${!allowed ? 'opacity-40 cursor-not-allowed' : ''}`}
      whileHover={{ scale: allowed ? 1.05 : 1 }}
      whileTap={{ scale: allowed ? 0.95 : 1 }}
      onClick={(e: React.MouseEvent<HTMLButtonElement>) => {
        if (!allowed) { e.preventDefault(); return; }
        onClick?.(e);
      }}
    >
      {children}
    </motion.button>
  );
}
