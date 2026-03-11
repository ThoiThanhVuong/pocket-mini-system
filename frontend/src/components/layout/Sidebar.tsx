"use client";

import React, { Component } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuthStore } from '@/store/useAuthStore';
import { motion } from 'framer-motion';
import {
  LayoutDashboard,
  Package,
  Warehouse,
  Users,
  Truck,
  ShoppingCart,
  CreditCard,
  StickyNote,
  BarChart3,
  UserCog,
  FileText,
  Bot,
  User as UserIcon, 
  ArrowRightLeft,
  LogOut,
  Settings,
  X } from
'lucide-react';

const SidebarWithNavigation = (props: SidebarProps) => {
  const pathname = usePathname();
  const { logout, user } = useAuthStore();
  return <Sidebar {...props} pathname={pathname} onLogout={logout} user={user} />;
};
interface SidebarProps {
  closeMobileMenu?: () => void;
  pathname?: string;
  onLogout?: () => void;
  user?: { permissions: string[] } | null;
}
interface SidebarState {
  expanded: boolean;
}
class Sidebar extends Component<SidebarProps, SidebarState> {
  constructor(props: SidebarProps) {
    super(props);
    this.state = {
      expanded: true
    };
  }
  toggleSidebar = () => {
    this.setState((prevState) => ({
      expanded: !prevState.expanded
    }));
  };
  render() {
    const { expanded } = this.state;
    const { closeMobileMenu, pathname, user } = this.props;
    
    // Helper to check permission
    const hasPermission = (permission: string | string[]) => {
        if (!user || !user.permissions) return false;
        if (Array.isArray(permission)) {
           return permission.some(p => user.permissions.includes(p));
        }
        return user.permissions.includes(permission);
    };

    const allNavItems = [
      {
        href: '/',
        icon: <LayoutDashboard size={20} />,
        label: 'Dashboard',
        permission: null, // Always visible
      },
      {
        href: '/profile',
        icon: <UserIcon size={20} />,
        label: 'Hồ sơ cá nhân',
        permission: null, // Always visible
      },
      {
        href: '/products',
        icon: <Package size={20} />,
        label: 'Products',
        permission: 'product.view',
      },
      {
        href: '/warehouses',
        icon: <Warehouse size={20} />,
        label: 'Warehouses',
        permission: 'warehouse.view',
      },
      {
        href: '/suppliers',
        icon: <Truck size={20} />,
        label: 'Suppliers',
        permission: 'supplier.view',
      },
      {
        href: '/customers',
        icon: <Users size={20} />,
        label: 'Customers',
        permission: 'customer.view',
      },
      {
        href: '/stock-management',
        icon: <ArrowRightLeft size={20} />,
        label: 'Stock Management',
        permission: ['stock.view', 'stock_in.view', 'stock_out.view', 'stock_transfer.view'],
      },
      {
        href: '/payments',
        icon: <CreditCard size={20} />,
        label: 'Payments',
        permission: 'payment.view',
      },
      {
        href: '/notes',
        icon: <StickyNote size={20} />,
        label: 'Notes',
        permission: null, // Always visible
      },
      {
        href: '/reports',
        icon: <BarChart3 size={20} />,
        label: 'Reports',
        permission: 'report.view',
      },
      {
        href: '/users',
        icon: <UserCog size={20} />,
        label: 'Users & Roles',
        permission: 'user.view',
      },
      {
        href: '/logs',
        icon: <FileText size={20} />,
        label: 'Audit Logs',
        permission: 'audit_log.view',
      },
      {
        href: '/ai-assistant',
        icon: <Bot size={20} />,
        label: 'AI Assistant',
        permission: null, // Always visible
      },
      {
        href: '/settings',
        icon: <Settings size={20} />,
        label: 'Cài đặt hệ thống',
        permission: 'system.settings',
      },
    ];

    const navItems = allNavItems.filter(
      (item) => item.permission === null || hasPermission(item.permission)
    );

    return (
      <motion.div
        className="bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 h-full overflow-y-auto flex flex-col"
        initial={{
          width: expanded ? 240 : 70
        }}
        animate={{
          width: expanded ? 240 : 70
        }}
        transition={{
          duration: 0.3,
          ease: 'easeInOut'
        }}>

        <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
          {/* Close button - visible only on mobile */}
          {closeMobileMenu &&
          <button
            onClick={closeMobileMenu}
            className="lg:hidden p-1 rounded-md hover:bg-gray-200 dark:hover:bg-gray-700 absolute right-2 top-2">

              <X size={20} className="text-gray-500 dark:text-gray-400" />
            </button>
          }
          {expanded &&
          <motion.div
            initial={{
              opacity: 0
            }}
            animate={{
              opacity: 1
            }}
            exit={{
              opacity: 0
            }}
            className="font-bold text-lg text-gray-800 dark:text-white">

              Pocket ERP Mini
            </motion.div>
          }
          {/* Toggle sidebar button - hidden on mobile */}
          <button
            onClick={this.toggleSidebar}
            className="p-1 rounded-md hover:bg-gray-200 dark:hover:bg-gray-700 hidden lg:block">

            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5 text-gray-500 dark:text-gray-400"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor">

              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d={
                expanded ?
                'M11 19l-7-7 7-7m8 14l-7-7 7-7' :
                'M13 5l7 7-7 7M5 5l7 7-7 7'
                } />

            </svg>
          </button>
        </div>
        <nav className="mt-4 flex-1 overflow-y-auto">
          <ul className="space-y-1">
            {navItems.map((item, index) =>
            <motion.li
              key={index}
              whileHover={{
                scale: 1.03
              }}
              whileTap={{
                scale: 0.97
              }}>

                <Link
                href={item.href}
                onClick={closeMobileMenu}
                className={`
                    flex items-center px-4 py-2.5 text-sm font-medium
                    ${pathname === item.href ? 'bg-blue-50 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400' : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700/50'}
                    ${expanded ? 'justify-start' : 'justify-center'}
                  `}>

                  <span className="flex-shrink-0">{item.icon}</span>
                  {expanded && <span className="ml-3">{item.label}</span>}
                </Link>
              </motion.li>
            )}
          </ul>
        </nav>
        <div className="p-4 border-t border-gray-200 dark:border-gray-700">
          <motion.button
            onClick={this.props.onLogout}
            className={`flex items-center ${expanded ? 'justify-start' : 'justify-center'} w-full px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700/50 rounded-md`}
            whileHover={{
              scale: 1.03
            }}
            whileTap={{
              scale: 0.97
            }}>

            <LogOut size={20} />
            {expanded && <span className="ml-3">Logout</span>}
          </motion.button>
        </div>
      </motion.div>);

  }
}
export { SidebarWithNavigation as Sidebar };
