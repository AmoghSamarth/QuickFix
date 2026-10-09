import React, { useState } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { LogIn, ShieldCheck, UserCheck, AlertCircle, Sparkles, ArrowLeft } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import Button from '../components/common/Button';
import Input from '../components/common/Input';
import { getApiErrorMessage } from '../services/api';

export function Login() {
  const { login, loginAsDemo } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage('');
    setIsLoading(true);

    try {
      const response = await login({ email, password });
      const defaultTarget = response?.user?.role === 'admin' ? '/admin/dashboard' : '/employee/dashboard';
      const redirectTarget = location.state?.from?.pathname || defaultTarget;
      navigate(redirectTarget, { replace: true });
    } catch (err) {
      setErrorMessage(getApiErrorMessage(err));
    } finally {
      setIsLoading(false);
    }
  };

  const handleDemoAccess = (role) => {
    loginAsDemo(role);
    const target = role === 'admin' ? '/admin/dashboard' : '/employee/dashboard';
    navigate(target, { replace: true });
  };

  return (
    <div className="min-h-screen flex flex-col justify-center bg-gradient-to-br from-[#EDF9F9] via-[#E8F6F7] to-[#E2F2F4] py-10 px-4 sm:px-6 lg:px-8 selection:bg-[#0D9488]/20 selection:text-[#0D9488]">
      {/* Back to Home Button */}
      <div className="sm:mx-auto sm:w-full sm:max-w-md mb-4">
        <Link
          to="/"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#0D9488] hover:text-[#0f766e] transition-colors"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          <span>Back to Home</span>
        </Link>
      </div>

      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        {/* Brand Emblem */}
        <div className="flex justify-center mb-3">
          <div
            className="w-12 h-12 rounded-2xl bg-white shadow-md border border-white/80 flex items-center justify-center"
            style={{ width: '48px', height: '48px' }}
          >
            <svg
              width="30"
              height="30"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              style={{ width: '30px', height: '30px' }}
            >
              <path
                d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.77 3.77z"
                fill="#0D9488"
              />
            </svg>
          </div>
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-[#0F172A]">
          SmartFix
        </h1>
        <p className="mt-1 text-xs sm:text-sm font-medium text-[#64748B]">
          Report it. Track it. Fix it.
        </p>
      </div>

      <div className="mt-6 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-6 shadow-xl shadow-teal-900/5 rounded-2xl border border-white/80 sm:px-10">
          <h2 className="text-base font-bold text-[#0F172A] mb-5 text-center">
            Sign In to Maintenance Portal
          </h2>

          {errorMessage && (
            <div className="mb-5 flex items-start gap-3 rounded-lg border border-[#FECACA] bg-[#FCE8E8] p-3 text-xs text-[#991B1B]">
              <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Backend Login Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              label="Work Email"
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="name@company.com"
            />

            <Input
              label="Password"
              id="password"
              name="password"
              type="password"
              autoComplete="current-password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
            />

            <div className="pt-2">
              <button
                type="submit"
                disabled={isLoading}
                className="w-full flex items-center justify-center gap-2 rounded-lg bg-[#00897B] hover:bg-[#00796B] text-white font-medium text-sm py-2.5 px-4 transition-colors cursor-pointer disabled:opacity-50"
              >
                <LogIn className="w-4 h-4" />
                <span>{isLoading ? 'Signing In...' : 'Sign In'}</span>
              </button>
            </div>
          </form>

          {/* Isolated Demo Mode Access Section */}
          <div className="mt-8 pt-6 border-t border-slate-100">
            <div className="flex items-center gap-1.5 justify-center mb-2 text-xs font-bold uppercase tracking-wider text-[#0D9488]">
              <Sparkles className="h-3.5 w-3.5" />
              <span>Explore Demo Mode</span>
            </div>
            <p className="text-xs text-[#64748B] text-center mb-4">
              Access the Employee or Administrator panel instantly:
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <Button
                type="button"
                variant="secondary"
                size="sm"
                onClick={() => handleDemoAccess('employee')}
                icon={UserCheck}
                className="justify-center border-slate-200 hover:border-[#0D9488] hover:text-[#0D9488]"
              >
                Employee Panel
              </Button>

              <Button
                type="button"
                variant="secondary"
                size="sm"
                onClick={() => handleDemoAccess('admin')}
                icon={ShieldCheck}
                className="justify-center border-slate-200 hover:border-[#0D9488] hover:text-[#0D9488]"
              >
                Admin Panel
              </Button>
            </div>
          </div>
        </div>

        <p className="mt-6 text-center text-xs text-[#64748B]">
          Smart Maintenance &amp; Escalation Platform • Enterprise Edition
        </p>
      </div>
    </div>
  );
}

export default Login;
