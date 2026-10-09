import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Headphones, Send, CheckCircle2 } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import Modal from '../components/common/Modal';
import Input from '../components/common/Input';
import Button from '../components/common/Button';

export function Home() {
  const { isAuthenticated, isAdmin } = useAuth();
  const [supportModalOpen, setSupportModalOpen] = useState(false);
  const [supportMessage, setSupportMessage] = useState('');
  const [supportSubmitted, setSupportSubmitted] = useState(false);

  const handleSupportSubmit = (e) => {
    e.preventDefault();
    setSupportSubmitted(true);
    setTimeout(() => {
      setSupportSubmitted(false);
      setSupportModalOpen(false);
      setSupportMessage('');
    }, 1800);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#EDF9F9] via-[#E8F6F7] to-[#E2F2F4] text-[#0F172A] flex flex-col justify-between selection:bg-[#0D9488]/20 selection:text-[#0D9488]">
      {/* Top Navigation Bar */}
      <header className="w-full max-w-7xl mx-auto px-6 sm:px-8 lg:px-12 pt-6 pb-4">
        <nav className="flex items-center justify-between">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2.5 group">
            {/* Custom Teal Wrench Icon matching the reference */}
            <div className="w-9 h-9 min-w-[36px] min-h-[36px] max-w-[36px] max-h-[36px] shrink-0 rounded-xl flex items-center justify-center transition-transform group-hover:scale-105" style={{ width: '36px', height: '36px' }}>
              <svg
                width="28"
                height="28"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                className="w-7 h-7 shrink-0"
                style={{ width: '28px', height: '28px', maxWidth: '28px', maxHeight: '28px' }}
              >
                <path
                  d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.77 3.77z"
                  fill="#0D9488"
                />
              </svg>
            </div>
            <span className="text-xl sm:text-2xl font-bold tracking-tight text-[#0F172A]">
              QuickFix
            </span>
          </Link>

          {/* Right Nav Links: Home and Login */}
          <div className="flex items-center gap-6 sm:gap-8">
            <div className="flex items-center gap-7 text-sm font-medium">
              {/* Home with active teal underline */}
              <Link
                to="/"
                className="relative py-1 text-[#0D9488] font-semibold transition-colors after:content-[''] after:absolute after:bottom-0 after:left-0 after:right-0 after:h-[2.5px] after:bg-[#0D9488] after:rounded-full"
              >
                Home
              </Link>
            </div>

            {/* Login Button */}
            <Link
              to={isAuthenticated ? (isAdmin ? '/admin/dashboard' : '/employee/dashboard') : '/login'}
              className="inline-flex items-center justify-center rounded-lg border border-[#0D9488] bg-transparent px-5 py-1.5 text-sm font-medium text-[#0D9488] hover:bg-[#0D9488]/10 transition-colors shadow-2xs"
            >
              Login
            </Link>
          </div>
        </nav>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 flex items-center w-full max-w-7xl mx-auto px-6 sm:px-8 lg:px-12 py-8 sm:py-12">
        <div className="w-full grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-center">
          {/* Left Hero Column */}
          <div className="lg:col-span-7 space-y-6">
            <div className="space-y-3">
              <span className="text-xs sm:text-[13px] font-bold uppercase tracking-wider text-[#0D9488] block">
                SMART MAINTENANCE PORTAL
              </span>
              <h1 className="text-4xl sm:text-5xl lg:text-[54px] font-extrabold text-[#0F172A] tracking-tight leading-[1.12]">
                Maintenance made <br />
                <span className="text-[#0D9488]">simple &amp; trackable.</span>
              </h1>
            </div>

            <p className="text-base sm:text-lg text-[#64748B] max-w-lg leading-relaxed font-normal">
              Report issues, follow progress and keep your workplace running
              smoothly — all in one place.
            </p>

            {/* CTA Buttons */}
            <div className="pt-2 flex flex-wrap items-center gap-4">
              <Link
                to={isAuthenticated ? '/employee/requests' : '/login'}
                state={!isAuthenticated ? { from: { pathname: '/employee/requests' } } : undefined}
                className="inline-flex items-center justify-center rounded-lg bg-[#00897B] hover:bg-[#00796B] text-white font-medium text-sm sm:text-base px-6 py-3 transition-colors shadow-xs"
              >
                View My Requests
              </Link>

              <Link
                to={isAuthenticated ? '/employee/requests/new' : '/login'}
                state={!isAuthenticated ? { from: { pathname: '/employee/requests/new' } } : undefined}
                className="inline-flex items-center justify-center rounded-lg bg-white/90 hover:bg-white border border-[#0D9488] text-[#0D9488] font-medium text-sm sm:text-base px-6 py-3 transition-colors shadow-2xs"
              >
                Report an Issue
              </Link>
            </div>
          </div>

          {/* Right Column: Floating Ticket Card */}
          <div className="lg:col-span-5 flex justify-center lg:justify-end">
            <div className="w-full max-w-md rounded-2xl bg-white p-7 sm:p-8 shadow-xl shadow-teal-900/5 border border-white/80 transition-all hover:shadow-2xl hover:shadow-teal-900/10">
              {/* Header: Label & Status Badge */}
              <div className="flex items-center justify-between mb-2">
                <span className="text-[11px] font-bold tracking-wider text-[#94A3B8] uppercase">
                  YOUR LATEST REQUEST
                </span>
                <span className="inline-flex items-center gap-1.5 rounded-full bg-[#DCFCE7] px-2.5 py-0.5 text-[11px] font-semibold text-[#15803D]">
                  <span className="h-1.5 w-1.5 rounded-full bg-[#16A34A]" />
                  IN PROGRESS
                </span>
              </div>

              {/* Title */}
              <h2 className="text-xl font-bold text-[#0F172A] tracking-tight mb-6">
                AC not working in Lab 2
              </h2>

              {/* Centered Ticket ID */}
              <div className="text-center py-2 mb-6">
                <div className="text-4xl sm:text-5xl font-extrabold text-[#0D9488] tracking-tight">
                  #MR001
                </div>
                <div className="text-xs text-[#94A3B8] font-medium mt-1">
                  Ticket ID
                </div>
              </div>

              {/* Metadata 3-Column Grid */}
              <div className="grid grid-cols-3 gap-2 py-4 border-t border-b border-slate-100 text-center">
                <div className="border-r border-slate-100 pr-2">
                  <div className="text-sm font-bold text-[#0F172A]">Team A</div>
                  <div className="text-[11px] text-[#94A3B8] mt-0.5">
                    Assigned Team
                  </div>
                </div>

                <div className="border-r border-slate-100 px-2">
                  <div className="text-sm font-bold text-[#0F172A]">12 Oct</div>
                  <div className="text-[11px] text-[#94A3B8] mt-0.5">
                    SLA Deadline
                  </div>
                </div>

                <div className="pl-2">
                  <div className="text-sm font-bold text-[#0F172A]">2 days</div>
                  <div className="text-[11px] text-[#94A3B8] mt-0.5">
                    Since Created
                  </div>
                </div>
              </div>

              {/* Progress Bar */}
              <div className="mt-6 mb-3">
                <div className="w-full h-2 rounded-full bg-slate-100 overflow-hidden">
                  <div className="h-full w-[72%] rounded-full bg-[#0D9488]" />
                </div>
              </div>

              {/* Bottom status note */}
              <div className="flex items-center gap-2 text-xs text-[#64748B] pt-1">
                <span className="h-1.5 w-1.5 rounded-full bg-[#16A34A] shrink-0" />
                <span>Status updated by Maintenance Team</span>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Bottom Help/Support Floating Bar */}
      <footer className="w-full max-w-7xl mx-auto px-6 sm:px-8 lg:px-12 pb-6 pt-2">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 py-3">
          {/* Left Info with Headset Icon */}
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 min-w-[40px] min-h-[40px] shrink-0 items-center justify-center rounded-full bg-[#E0F4F5] text-[#0D9488]" style={{ width: '40px', height: '40px' }}>
              <Headphones className="h-5 w-5 shrink-0" style={{ width: '20px', height: '20px' }} />
            </div>
            <div className="h-8 w-px bg-slate-300/80 hidden sm:block" />
            <div>
              <p className="text-sm font-bold text-[#0F172A] leading-tight">
                Need help?
              </p>
              <p className="text-xs text-[#64748B]">
                Contact the maintenance team for any urgent issues.
              </p>
            </div>
          </div>

          {/* Right Action Button */}
          <button
            type="button"
            onClick={() => setSupportModalOpen(true)}
            className="inline-flex items-center justify-center rounded-lg border border-[#0D9488] bg-white/70 hover:bg-white px-5 py-2 text-xs sm:text-sm font-medium text-[#0D9488] transition-colors shadow-2xs cursor-pointer"
          >
            Contact Support
          </button>
        </div>
      </footer>

      {/* Contact Support Modal */}
      <Modal
        isOpen={supportModalOpen}
        onClose={() => setSupportModalOpen(false)}
        title="Contact Maintenance Support"
        description="Reach out directly to the facilities dispatch desk for urgent assistance."
        footer={
          <>
            <Button
              variant="secondary"
              size="sm"
              onClick={() => setSupportModalOpen(false)}
            >
              Close
            </Button>
            <Button
              variant="action"
              size="sm"
              onClick={handleSupportSubmit}
              icon={Send}
            >
              Send Message
            </Button>
          </>
        }
      >
        {supportSubmitted ? (
          <div className="flex items-center gap-3 rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-xs font-medium text-emerald-800">
            <CheckCircle2 className="h-5 w-5 text-emerald-600 shrink-0" />
            <span>Thank you! Your urgent support inquiry has been transmitted to Dispatch Team A.</span>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="rounded-lg bg-teal-50 border border-teal-100 p-3 text-xs text-teal-900">
              <strong>Emergency Dispatch:</strong> For immediate flooding, electrical fires, or gas leaks, please call internal extension <strong>x4400</strong>.
            </div>
            <Input
              type="textarea"
              rows={3}
              label="Describe Your Issue"
              id="support-message"
              placeholder="Provide building location and details of your request..."
              value={supportMessage}
              onChange={(e) => setSupportMessage(e.target.value)}
              required
            />
          </div>
        )}
      </Modal>
    </div>
  );
}

export default Home;
