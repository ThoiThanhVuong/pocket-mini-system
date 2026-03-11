"use client";

import { usePathname } from 'next/navigation';
import { useEffect } from 'react';
import { Layout } from './Layout';
import { useAuthStore } from '@/store/useAuthStore';

interface ConditionalLayoutProps {
  children: React.ReactNode;
}

export function ConditionalLayout({ children }: ConditionalLayoutProps) {
  const pathname = usePathname();
  const initialize = useAuthStore((state) => state.initialize);
  
  // Initialize auth store from cookies when app mounts
  useEffect(() => {
    initialize();
  }, [initialize]);
  
  // Pages that should NOT have the layout (sidebar + header)
  const noLayoutPages = ['/login'];
  
  if (noLayoutPages.includes(pathname)) {
    return <>{children}</>;
  }
  
  return <Layout>{children}</Layout>;
}
