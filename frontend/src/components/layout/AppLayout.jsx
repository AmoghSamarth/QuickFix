import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import Topbar from './Topbar';
import MobileNavigation from './MobileNavigation';

/**
 * AppLayout wraps authenticated views with the QuickFix navigation shell
 */
export function AppLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-[#F7F9FC] text-[#1E293B]">
      {/* Mobile Sidebar Backdrop */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-30 bg-[#173B32]/50 backdrop-blur-xs md:hidden"
          onClick={() => setSidebarOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* Sidebar navigation */}
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      {/* Main layout container (offset by sidebar width on desktop) */}
      <div className="flex min-h-screen flex-col md:pl-64">
        {/* Topbar */}
        <Topbar onMenuClick={() => setSidebarOpen((prev) => !prev)} />

        {/* Content area */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 pb-20 md:pb-8 max-w-7xl w-full mx-auto">
          <Outlet />
        </main>

        {/* Mobile bottom navigation bar */}
        <MobileNavigation />
      </div>
    </div>
  );
}

export default AppLayout;
