import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  ClipboardList,
  PlusCircle,
  AlertTriangle,
  User,
  LogOut,
  ShieldCheck,
  Building2,
  ArrowLeftRight,
} from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';

export function Sidebar({ isOpen, onClose }) {
  const { user, isAdmin, isDemoMode, switchDemoRole, logout } = useAuth();
  const navigate = useNavigate();

  const employeeLinks = [
    { to: '/employee/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { to: '/employee/requests', label: 'My Requests', icon: ClipboardList },
    { to: '/employee/requests/new', label: 'New Request', icon: PlusCircle },
    { to: '/profile', label: 'Profile', icon: User },
  ];

  const adminLinks = [
    { to: '/admin/dashboard', label: 'Admin Dashboard', icon: LayoutDashboard },
    { to: '/admin/tickets', label: 'All Tickets', icon: ClipboardList },
    { to: '/admin/escalations', label: 'Escalations', icon: AlertTriangle },
    { to: '/profile', label: 'Profile', icon: User },
  ];

  const links = isAdmin ? adminLinks : employeeLinks;

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
    <aside
      className={`fixed inset-y-0 left-0 z-40 flex w-64 flex-col bg-[#173B32] text-white transition-transform duration-200 ease-in-out md:translate-x-0 ${
        isOpen ? 'translate-x-0 shadow-2xl' : '-translate-x-full'
      }`}
    >
      {/* Brand Header */}
      <div className="flex h-16 items-center gap-3 border-b border-[#215447] px-6">
        <img src="/logo.svg" alt="QuickFix Logo" className="h-9 w-9 rounded-lg" />
        <div>
          <span className="text-base font-bold tracking-tight text-white block leading-none">
            QuickFix
          </span>
          <span className="text-[11px] font-medium text-[#DDF5E5] block mt-0.5 tracking-wide">
            Report it. Track it. Fix it.
          </span>
        </div>
      </div>

      {/* Role Badge Indicator */}
      <div className="mx-4 mt-4 mb-2 flex items-center justify-between rounded-lg bg-[#0F2620] px-3 py-2 border border-[#215447]/60">
        <div className="flex items-center gap-2">
          {isAdmin ? (
            <ShieldCheck className="h-4 w-4 text-[#FED7AA]" />
          ) : (
            <Building2 className="h-4 w-4 text-[#BBF7D0]" />
          )}
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-300">
            {isAdmin ? 'Administrator Portal' : 'Employee Portal'}
          </span>
        </div>
        <span
          className={`h-2 w-2 rounded-full ${
            isAdmin ? 'bg-[#F97316]' : 'bg-[#16A34A]'
          }`}
        />
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 space-y-1 overflow-y-auto px-3 py-3" aria-label="Main Navigation">
        {links.map((link) => {
          const Icon = link.icon;
          return (
            <NavLink
              key={link.to}
              to={link.to}
              onClick={onClose}
              className={({ isActive }) =>
                `flex items-center gap-3 rounded-lg px-3.5 py-2.5 text-sm font-medium transition-colors ${
                  isActive
                    ? 'bg-[#2F6FED] text-white shadow-xs font-semibold'
                    : 'text-slate-200 hover:bg-[#215447] hover:text-white'
                }`
              }
            >
              <Icon className="h-4 w-4 shrink-0" />
              <span>{link.label}</span>
            </NavLink>
          );
        })}
      </nav>

      {/* Demo Mode Role Switcher Widget */}
      {isDemoMode && (
        <div className="mx-3 mb-3 rounded-lg border border-[#2F6FED]/40 bg-[#0F2620] p-3">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-[#93C5FD]">
              Demo Mode Active
            </span>
            <span className="text-[10px] bg-[#2F6FED] text-white px-1.5 py-0.5 rounded font-mono">
              DEMO
            </span>
          </div>
          <p className="text-xs text-slate-300 mb-2.5">
            Switch perspective to test role-specific workflows:
          </p>
          <button
            type="button"
            onClick={handleRoleToggle}
            className="flex w-full items-center justify-center gap-2 rounded-md bg-[#215447] hover:bg-[#2F6FED] text-white py-1.5 px-2.5 text-xs font-medium transition-colors cursor-pointer border border-[#215447]"
          >
            <ArrowLeftRight className="h-3.5 w-3.5" />
            <span>Switch to {isAdmin ? 'Employee' : 'Admin'}</span>
          </button>
        </div>
      )}

      {/* User Info & Logout Footer */}
      <div className="border-t border-[#215447] p-3.5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#215447] text-xs font-bold text-white border border-[#2F6FED]/50">
              {user?.avatar || (user?.name ? user.name.slice(0, 2).toUpperCase() : 'QF')}
            </div>
            <div className="min-w-0">
              <p className="truncate text-xs font-semibold text-white">
                {user?.name || 'QuickFix User'}
              </p>
              <p className="truncate text-[11px] text-slate-300">
                {user?.email || 'user@quickfix.internal'}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={handleLogout}
            title="Log Out"
            aria-label="Log Out"
            className="rounded-lg p-1.5 text-slate-300 hover:bg-[#215447] hover:text-white transition-colors cursor-pointer"
          >
            <LogOut className="h-4 w-4" />
          </button>
        </div>
      </div>
    </aside>
  );
}

export default Sidebar;
