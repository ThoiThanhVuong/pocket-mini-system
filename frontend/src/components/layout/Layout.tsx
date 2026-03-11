"use client";

import React, { Component } from 'react';
import { Sidebar } from './Sidebar';
import { Header } from './Header';
import { motion } from 'framer-motion';
interface LayoutProps {
  children: React.ReactNode;
}
interface LayoutState {
  isMobileMenuOpen: boolean;
}
export class Layout extends Component<LayoutProps, LayoutState> {
  constructor(props: LayoutProps) {
    super(props);
    this.state = {
      isMobileMenuOpen: false
    };
  }
  toggleMobileMenu = () => {
    this.setState((prevState) => ({
      isMobileMenuOpen: !prevState.isMobileMenuOpen
    }));
  };
  render() {
    const { isMobileMenuOpen } = this.state;
    return (
      <div className="flex flex-col lg:flex-row h-screen bg-gray-100 dark:bg-gray-900">
        {/* Mobile sidebar overlay */}
        {isMobileMenuOpen &&
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-20 lg:hidden"
          onClick={this.toggleMobileMenu} />

        }
        {/* Sidebar - hidden by default on mobile, shown when menu is open */}
        <div
          className={`fixed inset-y-0 left-0 z-30 transform ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'} lg:relative lg:translate-x-0 transition-transform duration-300 ease-in-out`}>

          <Sidebar closeMobileMenu={this.toggleMobileMenu} />
        </div>
        <div className="flex flex-col flex-1 w-full overflow-hidden">
          <Header toggleMobileMenu={this.toggleMobileMenu} />
          <motion.main
            className="flex-1 overflow-y-auto p-3 sm:p-4 md:p-6"
            initial={{
              opacity: 0
            }}
            animate={{
              opacity: 1
            }}
            exit={{
              opacity: 0
            }}
            transition={{
              duration: 0.3
            }}>

            {this.props.children}
          </motion.main>
        </div>
      </div>);

  }
}