import React from 'react';
import { Link } from 'react-router-dom';
import { Home, ArrowLeft } from 'lucide-react';
import Button from '../components/common/Button';
import { useAuth } from '../hooks/useAuth';

export function NotFound() {
  const { user, isAdmin } = useAuth();
  const defaultHome = user ? (isAdmin ? '/admin/dashboard' : '/employee/dashboard') : '/login';

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-[#F7F9FC] px-4 text-center">
      <div className="h-16 w-16 rounded-2xl bg-white border border-[#D9E1E8] shadow-sm flex items-center justify-center text-3xl font-bold text-[#173B32] mb-4">
        404
      </div>
      <h1 className="text-2xl font-bold text-[#1E293B] sm:text-3xl mb-2">
        Page Not Found
      </h1>
      <p className="max-w-md text-sm text-[#5D6875] mb-6">
        The page you are looking for does not exist or has been moved to a different location in QuickFix.
      </p>
      <div className="flex gap-3">
        <Link to={defaultHome}>
          <Button variant="primary" icon={Home}>
            Return to Dashboard
          </Button>
        </Link>
        <Button variant="secondary" onClick={() => window.history.back()} icon={ArrowLeft}>
          Go Back
        </Button>
      </div>
    </div>
  );
}

export default NotFound;
