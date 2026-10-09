import React, { useState } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { LogIn, ShieldCheck, UserCheck, AlertCircle, Sparkles } from 'lucide-react';
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
    <div className="min-h-screen flex flex-col justify-center bg-[#F7F9FC] py-12 px-4 sm:px-6 lg:px-8 selection:bg-[#173B32]/10 selection:text-[#173B32]">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        {/* Brand Emblem matching original design reference */}
        <div className="flex justify-center mb-3">
          <Link to="/" className="inline-block hover:opacity-90 transition-opacity">
            <img
              src="/logo.svg"
              alt="QuickFix"
              className="h-14 w-14 rounded-2xl shadow-md shrink-0"
              style={{ width: '56px', height: '56px' }}
            />
          </Link>
        </div>
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-[#173B32]">
          QuickFix
        </h1>
        <p className="mt-1 text-sm font-medium text-[#5D6875]">
          Report it. Track it. Fix it.
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-6 shadow-md rounded-2xl border border-[#D9E1E8] sm:px-10">
          <h2 className="text-lg font-semibold text-[#1E293B] mb-6 text-center">
            Sign In to QuickFix
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
              <Button
                type="submit"
                variant="primary"
                size="md"
                isLoading={isLoading}
                className="w-full"
                icon={LogIn}
              >
                Sign In
              </Button>
            </div>
          </form>

          {/* Isolated Demo Mode Access Section */}
          <div className="mt-8 pt-6 border-t border-[#D9E1E8]">
            <div className="flex items-center gap-1.5 justify-center mb-3 text-xs font-semibold uppercase tracking-wider text-[#2F6FED]">
              <Sparkles className="h-3.5 w-3.5" />
              <span>Explore Demo Mode</span>
            </div>
            <p className="text-xs text-[#5D6875] text-center mb-4">
              Explore the frontend workflows instantly without requiring a live backend connection:
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <Button
                type="button"
                variant="secondary"
                size="sm"
                onClick={() => handleDemoAccess('employee')}
                icon={UserCheck}
                className="justify-center border-slate-300 hover:border-[#2F6FED]"
              >
                Employee View
              </Button>

              <Button
                type="button"
                variant="secondary"
                size="sm"
                onClick={() => handleDemoAccess('admin')}
                icon={ShieldCheck}
                className="justify-center border-slate-300 hover:border-[#173B32]"
              >
                Admin View
              </Button>
            </div>
          </div>
        </div>

        <p className="mt-6 text-center text-xs text-[#5D6875]">
          QuickFix Maintenance &amp; Escalation Platform • Protected System
        </p>
      </div>
    </div>
  );
}

export default Login;
