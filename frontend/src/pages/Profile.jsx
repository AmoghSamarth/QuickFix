import React, { useState } from 'react';
import { User, Mail, Shield, Building, CheckCircle2 } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import Button from '../components/common/Button';
import Input from '../components/common/Input';

export function Profile() {
  const { user, isDemoMode } = useAuth();
  const [name, setName] = useState(user?.name || '');
  const [department, setDepartment] = useState(user?.department || '');
  const [isSaved, setIsSaved] = useState(false);

  const handleSave = (e) => {
    e.preventDefault();
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 3000);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-[#1E293B]">User Profile</h1>
        <p className="text-sm text-[#5D6875] mt-1">
          Manage your account information and preferences within QuickFix.
        </p>
      </div>

      {isDemoMode && (
        <div className="rounded-xl border border-blue-200 bg-blue-50/70 p-4 text-xs text-blue-800">
          <strong>Demo Profile:</strong> You are currently exploring QuickFix under the demo user session for{' '}
          <span className="font-semibold">{user?.name}</span> ({user?.role}).
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* User Card */}
        <div className="md:col-span-1 rounded-xl border border-[#D9E1E8] bg-white p-6 shadow-xs flex flex-col items-center text-center">
          <div className="h-20 w-20 rounded-full bg-[#173B32] text-white text-xl font-bold flex items-center justify-center border-4 border-[#DDF5E5] mb-4">
            {user?.avatar || (user?.name ? user.name.slice(0, 2).toUpperCase() : 'QF')}
          </div>
          <h2 className="text-lg font-semibold text-[#1E293B]">{user?.name}</h2>
          <p className="text-xs text-[#5D6875] mb-3">{user?.email}</p>
          <span className="inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-wider bg-slate-100 text-slate-700 border border-slate-200">
            <Shield className="h-3.5 w-3.5 text-[#2F6FED]" />
            {user?.role}
          </span>
          <div className="w-full mt-6 pt-6 border-t border-[#D9E1E8] text-left text-xs space-y-2 text-[#5D6875]">
            <div className="flex justify-between">
              <span>Department:</span>
              <span className="font-medium text-[#1E293B]">{user?.department || 'Operations'}</span>
            </div>
            <div className="flex justify-between">
              <span>User ID:</span>
              <span className="font-mono text-[#1E293B]">{user?.id || 'emp-101'}</span>
            </div>
            <div className="flex justify-between">
              <span>Status:</span>
              <span className="text-emerald-700 font-medium">Active</span>
            </div>
          </div>
        </div>

        {/* Edit Form */}
        <div className="md:col-span-2 rounded-xl border border-[#D9E1E8] bg-white p-6 shadow-xs">
          <h3 className="text-base font-semibold text-[#1E293B] mb-4">
            Account Details
          </h3>

          {isSaved && (
            <div className="mb-4 flex items-center gap-2 rounded-lg bg-[#DDF5E5] p-3 text-xs font-medium text-[#166534] border border-[#BBF7D0]">
              <CheckCircle2 className="h-4 w-4 shrink-0" />
              <span>Profile details updated successfully!</span>
            </div>
          )}

          <form onSubmit={handleSave} className="space-y-4">
            <Input
              label="Full Name"
              id="name"
              name="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              icon={User}
              required
            />

            <Input
              label="Work Email Address"
              id="email"
              name="email"
              value={user?.email || ''}
              disabled
              icon={Mail}
              helperText="Email is managed by corporate directory."
            />

            <Input
              label="Department / Unit"
              id="department"
              name="department"
              value={department}
              onChange={(e) => setDepartment(e.target.value)}
              icon={Building}
            />

            <div className="pt-2 flex justify-end">
              <Button type="submit" variant="primary">
                Save Changes
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

export default Profile;
