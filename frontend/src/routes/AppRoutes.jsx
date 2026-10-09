import React from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import AppLayout from '../components/layout/AppLayout';

// Pages
import Login from '../pages/Login';
import NotFound from '../pages/NotFound';
import Profile from '../pages/Profile';

// Employee Pages
import EmployeeDashboard from '../pages/employee/EmployeeDashboard';
import MyRequests from '../pages/employee/MyRequests';
import CreateRequest from '../pages/employee/CreateRequest';
import TicketDetails from '../pages/employee/TicketDetails';

// Admin Pages
import AdminDashboard from '../pages/admin/AdminDashboard';
import AllTickets from '../pages/admin/AllTickets';
import AdminTicketDetails from '../pages/admin/AdminTicketDetails';
import Escalations from '../pages/admin/Escalations';

/**
 * Route guard checking authentication
 */
function RequireAuth({ children }) {
  const { isAuthenticated, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F7F9FC]">
        <div className="flex items-center gap-2 text-sm text-[#5D6875]">
          <span className="w-2.5 h-2.5 rounded-full bg-[#2F6FED] animate-ping" />
          <span>Authenticating QuickFix session...</span>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return children;
}

/**
 * Role-aware route guard ensuring role-specific access (e.g. employee vs admin)
 */
function RequireRole({ role, children }) {
  const { user } = useAuth();

  if (!user || user.role !== role) {
    // Redirect to the user's proper role home
    const fallback = user?.role === 'admin' ? '/admin/dashboard' : '/employee/dashboard';
    return <Navigate to={fallback} replace />;
  }

  return children;
}

/**
 * Root index redirector
 */
function RootRedirect() {
  const { isAuthenticated, isAdmin } = useAuth();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return <Navigate to={isAdmin ? '/admin/dashboard' : '/employee/dashboard'} replace />;
}

export function AppRoutes() {
  return (
    <Routes>
      {/* Root redirect */}
      <Route path="/" element={<RootRedirect />} />

      {/* Public Route */}
      <Route path="/login" element={<Login />} />

      {/* Protected Routes wrapped in AppLayout */}
      <Route
        element={
          <RequireAuth>
            <AppLayout />
          </RequireAuth>
        }
      >
        {/* Shared Routes */}
        <Route path="/profile" element={<Profile />} />

        {/* Employee Routes */}
        <Route
          path="/employee/dashboard"
          element={
            <RequireRole role="employee">
              <EmployeeDashboard />
            </RequireRole>
          }
        />
        <Route
          path="/employee/requests"
          element={
            <RequireRole role="employee">
              <MyRequests />
            </RequireRole>
          }
        />
        <Route
          path="/employee/requests/new"
          element={
            <RequireRole role="employee">
              <CreateRequest />
            </RequireRole>
          }
        />
        <Route
          path="/employee/requests/:id"
          element={
            <RequireRole role="employee">
              <TicketDetails />
            </RequireRole>
          }
        />

        {/* Admin Routes */}
        <Route
          path="/admin/dashboard"
          element={
            <RequireRole role="admin">
              <AdminDashboard />
            </RequireRole>
          }
        />
        <Route
          path="/admin/tickets"
          element={
            <RequireRole role="admin">
              <AllTickets />
            </RequireRole>
          }
        />
        <Route
          path="/admin/tickets/:id"
          element={
            <RequireRole role="admin">
              <AdminTicketDetails />
            </RequireRole>
          }
        />
        <Route
          path="/admin/escalations"
          element={
            <RequireRole role="admin">
              <Escalations />
            </RequireRole>
          }
        />
      </Route>

      {/* Wildcard 404 Route */}
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}

export default AppRoutes;
