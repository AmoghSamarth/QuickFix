import React, { useState } from 'react';
import { Menu, Bell, ArrowLeftRight, User, LogOut } from 'lucide-react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';

export function Topbar({ onMenuClick }) {
  const { user, isAdmin, isDemoMode, switchDemoRole, logout } = useAuth();
  const [profileOpen, setProfileOpen] = useState(false);
  const navigate = useNavigate();

  const handleRoleToggle = () => {
    const nextRole = isAdmin ? 'employee' : 'admin';
    switchDemoRole(nextRole);
    navigate(nextRole === 'admin' ? '/admin/dashboard' : '/employee/dashboard');
  };

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <header className="sticky top-0 z-30 flex h-16 w-full items-center justify-between border-b border-[#D9E1E8] bg-white px-4 sm:px-6">
      {/* Left section: mobile hamburger & breadcrumb/app title */}
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={onMenuClick}
          className="rounded-lg p-2 text-[#5D6875] hover:bg-slate-100 hover:text-[#1E293B] md:hidden cursor-pointer"
          aria-label="Open sidebar menu"
        >
          <Menu className="h-5 w-5" />
        </button>

        <div className="hidden sm:flex items-center gap-2">
          <span className="text-sm font-semibold text-[#173B32]">QuickFix</span>
          <span className="text-slate-300">/</span>
          <span className="text-sm font-medium text-[#5D6875]">
            {isAdmin ? 'Admin Console' : 'Workspace Operations'}
          </span>
        </div>
      </div>

      {/* Right section: Demo role switcher pill, notifications, profile menu */}
      <div className="flex items-center gap-2.5 sm:gap-4">
        {/* Isolated Demo Mode Quick Switcher */}
        {isDemoMode && (
          <div className="flex items-center gap-1.5 rounded-full border border-blue-200 bg-blue-50/80 px-2.5 py-1 text-xs">
            <span className="flex h-2 w-2 rounded-full bg-[#2F6FED] animate-pulse" />
            <span className="hidden md:inline font-medium text-blue-900">
              Demo: <strong className="capitalize">{user?.role}</strong>
            </span>
            <button
              type="button"
              onClick={handleRoleToggle}
              title={`Switch to ${isAdmin ? 'Employee' : 'Admin'} mode`}
              className="ml-1 inline-flex items-center gap-1 rounded bg-[#2F6FED] px-2 py-0.5 text-[11px] font-semibold text-white hover:bg-blue-700 cursor-pointer"
            >
              <ArrowLeftRight className="h-3 w-3" />
              <span>Switch</span>
            </button>
          </div>
        )}

        {/* Notifications Icon with indicator */}
        <button
          type="button"
          className="relative rounded-lg p-2 text-[#5D6875] hover:bg-slate-100 hover:text-[#1E293B] cursor-pointer"
          aria-label="View notifications"
        >
          <Bell className="h-5 w-5" />
          <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-[#2F6FED]" />
        </button>

        {/* User Profile Dropdown */}
        <div className="relative">
          <button
            type="button"
            onClick={() => setProfileOpen((prev) => !prev)}
            className="flex items-center gap-2 rounded-lg p-1.5 hover:bg-slate-100 cursor-pointer text-left"
            aria-expanded={profileOpen}
            aria-label="User menu"
          >
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#173B32] text-xs font-bold text-white">
              {user?.avatar || (user?.name ? user.name.slice(0, 2).toUpperCase() : 'QF')}
            </div>
            <div className="hidden lg:block">
              <span className="block text-xs font-semibold text-[#1E293B] leading-none">
                {user?.name}
              </span>
              <span className="block text-[11px] text-[#5D6875] mt-0.5 capitalize">
                {user?.role}
              </span>
            </div>
          </button>

          {profileOpen && (
            <>
              <div
                className="fixed inset-0 z-30"
                onClick={() => setProfileOpen(false)}
              />
              <div className="absolute right-0 mt-2 w-52 rounded-xl border border-[#D9E1E8] bg-white py-1.5 shadow-lg z-40">
                <div className="px-3.5 py-2 border-b border-[#D9E1E8]">
                  <p className="text-xs font-semibold text-[#1E293B] truncate">{user?.name}</p>
                  <p className="text-[11px] text-[#5D6875] truncate">{user?.email}</p>
                </div>
                <Link
                  to="/profile"
                  onClick={() => setProfileOpen(false)}
                  className="flex items-center gap-2.5 px-3.5 py-2 text-xs font-medium text-[#1E293B] hover:bg-slate-50"
                >
                  <User className="h-4 w-4 text-[#5D6875]" />
                  <span>My Profile</span>
                </Link>
                <button
                  type="button"
                  onClick={() => {
                    setProfileOpen(false);
                    handleLogout();
                  }}
                  className="flex w-full items-center gap-2.5 px-3.5 py-2 text-xs font-medium text-red-600 hover:bg-red-50 text-left cursor-pointer"
                >
                  <LogOut className="h-4 w-4 text-red-600" />
                  <span>Sign Out</span>
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </header>
  );
}

export default Topbar;
