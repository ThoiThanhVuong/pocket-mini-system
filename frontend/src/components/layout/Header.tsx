"use client";

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Bell, Sun, Moon, Search, User, Menu } from 'lucide-react';
import { useAuthStore } from '@/store/useAuthStore';

interface HeaderProps {
  toggleMobileMenu: () => void;
}

export const Header: React.FC<HeaderProps> = ({ toggleMobileMenu }) => {
  const [darkMode, setDarkMode] = useState(false);
  const { user } = useAuthStore();

  const toggleDarkMode = () => {
    const newDarkMode = !darkMode;
    setDarkMode(newDarkMode);
    if (newDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  };

  // Safely extract role name
  const getRoleName = () => {
      if (!user?.roles || user.roles.length === 0) return 'Member';
      const role = user.roles[0];
      if (typeof role === 'string') return role;
      if (typeof role === 'object' && 'name' in role) return (role as any).name;
      return 'Member';
  };

  return (
    <header className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 py-3 px-4 sm:px-6">
      <div className="flex justify-between items-center">
        <div className="flex items-center">
          {/* Mobile menu button */}
          <button
            onClick={toggleMobileMenu}
            className="mr-4 p-2 rounded-md text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 lg:hidden">
            <Menu size={24} />
          </button>
          <div className="relative hidden sm:block">
            <Search
              className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-500"
              size={18} />

            <input
              type="text"
              placeholder="Search..."
              className="pl-10 pr-4 py-2 border border-gray-200 dark:border-gray-600 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white w-full sm:w-auto" />

          </div>
        </div>
        <div className="flex items-center space-x-2 sm:space-x-4">
          <motion.button
            whileHover={{
              scale: 1.1
            }}
            whileTap={{
              scale: 0.9
            }}
            className="p-2 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700">

            <Bell size={20} />
          </motion.button>
          <motion.button
            whileHover={{
              scale: 1.1
            }}
            whileTap={{
              scale: 0.9
            }}
            onClick={toggleDarkMode}
            className="p-2 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700">

            {darkMode ? <Sun size={20} /> : <Moon size={20} />}
          </motion.button>
          <div className="hidden sm:block h-6 border-r border-gray-200 dark:border-gray-600"></div>
          <motion.div
            className="flex items-center cursor-pointer"
            whileHover={{
              scale: 1.03
            }}>

            <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white">
              <span className="font-bold text-sm">
                  {user?.fullName?.charAt(0).toUpperCase() || <User size={16} />}
              </span>
            </div>
            <div className="hidden sm:block ml-2">
              <p className="text-sm font-medium text-gray-700 dark:text-white">
                {user?.fullName || 'Guest User'}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                {getRoleName()}
              </p>
            </div>
          </motion.div>
        </div>
      </div>
      {/* Mobile search - shown only on small screens */}
      <div className="mt-3 sm:hidden">
        <div className="relative">
          <Search
            className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-500"
            size={18} />

          <input
            type="text"
            placeholder="Search..."
            className="w-full pl-10 pr-4 py-2 border border-gray-200 dark:border-gray-600 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white" />

        </div>
      </div>
    </header>
  );
};