import React from 'react';
import { NavLink } from 'react-router-dom';
import { LayoutDashboard, ClipboardList, PlusCircle, AlertTriangle, User } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';

export function MobileNavigation() {
  const { isAdmin } = useAuth();

  const employeeItems = [
    { to: '/employee/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { to: '/employee/requests', label: 'Requests', icon: ClipboardList },
    { to: '/employee/requests/new', label: 'New', icon: PlusCircle },
    { to: '/profile', label: 'Profile', icon: User },
  ];

  const adminItems = [
    { to: '/admin/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { to: '/admin/tickets', label: 'Tickets', icon: ClipboardList },
    { to: '/admin/escalations', label: 'Escalations', icon: AlertTriangle },
    { to: '/profile', label: 'Profile', icon: User },
  ];

  const items = isAdmin ? adminItems : employeeItems;

  return (
    <nav
      className="md:hidden fixed bottom-0 left-0 right-0 z-30 flex h-16 items-center justify-around border-t border-[#D9E1E8] bg-white px-2 shadow-lg"
      aria-label="Mobile Navigation"
    >
      {items.map((item) => {
        const Icon = item.icon;
        return (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) =>
              `flex flex-col items-center justify-center py-1 px-3 text-[11px] font-medium transition-colors ${
                isActive
                  ? 'text-[#2F6FED] font-semibold'
                  : 'text-[#5D6875] hover:text-[#1E293B]'
              }`
            }
          >
            <Icon className="h-5 w-5 mb-0.5" />
            <span>{item.label}</span>
          </NavLink>
        );
      })}
    </nav>
  );
}

export default MobileNavigation;
