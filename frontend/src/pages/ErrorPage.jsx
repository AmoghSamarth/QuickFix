import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Send, CheckCircle2 } from 'lucide-react';
import Modal from '../components/common/Modal';
import Input from '../components/common/Input';
import Button from '../components/common/Button';

export function ErrorPage({
  _errorCode = '500',
  errorTitle = 'Error 500 (System Issue)',
  subheading = 'An unexpected technical glitch occurred.',
  message = 'Our team has been notified. We are working to resolve the issue as quickly as possible. Please try again later or return to your requests.',
  errorId = 'MR-ERR-500-ADMIN-DB-FAIL',
  onRetry,
}) {
  const [supportModalOpen, setSupportModalOpen] = useState(false);
  const [supportMessage, setSupportMessage] = useState('');
  const [supportSubmitted, setSupportSubmitted] = useState(false);

  const handleRetry = () => {
    if (onRetry) {
      onRetry();
    } else {
      window.location.reload();
    }
  };

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
    <div className="min-h-screen bg-gradient-to-br from-[#EDF9F9] via-[#E8F6F7] to-[#E2F2F4] text-[#0F172A] flex flex-col justify-between relative overflow-hidden selection:bg-[#0D9488]/20 selection:text-[#0D9488]">
      {/* Decorative Star in bottom-right */}
      <div className="absolute -bottom-10 -right-10 pointer-events-none opacity-20">
        <svg width="220" height="220" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M50 0C50 27.6142 72.3858 50 100 50C72.3858 50 50 72.3858 50 100C50 72.3858 27.6142 50 0 50C27.6142 50 50 27.6142 50 0Z" fill="#0D9488"/>
        </svg>
      </div>

      {/* Top Header */}
      <header className="w-full max-w-7xl mx-auto px-6 sm:px-8 lg:px-12 pt-6 pb-4 relative z-10">
        <nav className="flex items-center justify-between">
          {/* Logo with wrench and upward arrow */}
          <Link to="/" className="flex items-center gap-2.5 group">
            <div
              className="w-10 h-10 min-w-[40px] min-h-[40px] shrink-0 rounded-xl flex items-center justify-center relative"
              style={{ width: '40px', height: '40px' }}
            >
              <svg
                width="34"
                height="34"
                viewBox="0 0 32 32"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                style={{ width: '34px', height: '34px' }}
              >
                {/* Dark teal wrench */}
                <path
                  d="M19.5 8.5a1.2 1.2 0 0 0 0 1.7l1.9 1.9a1.2 1.2 0 0 0 1.7 0l4.5-4.5a7.2 7.2 0 0 1-9.5 9.5l-8.3 8.3a2.5 2.5 0 0 1-3.6-3.6l8.3-8.3a7.2 7.2 0 0 1 9.5-9.5l-4.5 4.5z"
                  fill="#173B32"
                />
                {/* Blue upward check / arrow */}
                <path
                  d="M7 17L12 22L26 8"
                  stroke="#2563EB"
                  strokeWidth="3.2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <path
                  d="M20 8H26V14"
                  stroke="#2563EB"
                  strokeWidth="3.2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </div>
            <div>
              <span className="text-xl sm:text-2xl font-bold tracking-tight text-[#0F172A] block leading-none">
                QuickFix
              </span>
              <span className="text-[9px] font-bold uppercase tracking-widest text-[#5D6875] block mt-0.5">
                MAINTENANCE REQUESTS
              </span>
            </div>
          </Link>

          {/* Navigation Links: My Requests & Help */}
          <div className="flex items-center gap-6 sm:gap-8 text-sm font-medium">
            <Link
              to="/employee/requests"
              className="text-[#475569] hover:text-[#0D9488] transition-colors py-1 font-semibold"
            >
              My Requests
            </Link>

            <button
              type="button"
              onClick={() => setSupportModalOpen(true)}
              className="text-[#475569] hover:text-[#0D9488] transition-colors py-1 font-semibold cursor-pointer"
            >
              Help
            </button>
          </div>
        </nav>
      </header>

      {/* Main Center Error Card */}
      <main className="flex-1 flex items-center justify-center w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 relative z-10">
        <div className="w-full max-w-[580px] rounded-3xl bg-white p-8 sm:p-12 shadow-xl shadow-teal-900/5 border border-white/80 text-center">
          {/* Circular Badge with Wrench and Alert Triangle */}
          <div
            className="w-24 h-24 sm:w-28 sm:h-28 mx-auto rounded-full bg-[#E0F4F5] flex items-center justify-center relative mb-6"
            style={{ width: '104px', height: '104px' }}
          >
            {/* Tilted Teal Wrench */}
            <svg
              width="50"
              height="50"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              className="text-[#0D9488] -rotate-12"
              style={{ width: '50px', height: '50px' }}
            >
              <path
                d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.77 3.77z"
                fill="#0D9488"
              />
            </svg>

            {/* Warning triangle in bottom-right corner */}
            <div
              className="absolute -bottom-1 -right-1 flex items-center justify-center rounded-full bg-white p-1 shadow-xs"
              style={{ width: '38px', height: '38px' }}
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
                  d="M12 2L1 21H23L12 2Z"
                  fill="#718096"
                />
                <circle cx="12" cy="17" r="1.2" fill="#FFFFFF" />
                <path
                  d="M12 9V14"
                  stroke="#FFFFFF"
                  strokeWidth="2"
                  strokeLinecap="round"
                />
              </svg>
            </div>
          </div>

          {/* Heading */}
          <h1 className="text-2xl sm:text-[28px] font-extrabold text-[#0F172A] tracking-tight mb-2">
            {errorTitle}
          </h1>

          {/* Subheading */}
          <h2 className="text-base sm:text-lg font-bold text-[#1E293B] mb-3">
            {subheading}
          </h2>

          {/* Body message */}
          <p className="text-xs sm:text-sm text-[#64748B] max-w-md mx-auto leading-relaxed mb-8">
            {message}
          </p>

          {/* Action Buttons */}
          <div className="space-y-3 max-w-md mx-auto">
            {/* Primary: Try Again */}
            <button
              type="button"
              onClick={handleRetry}
              className="w-full flex items-center justify-center py-3.5 px-6 rounded-xl bg-[#00897B] hover:bg-[#00796B] text-white font-semibold text-sm transition-colors shadow-xs cursor-pointer"
            >
              Try Again
            </button>

            {/* Secondary: Return to My Requests */}
            <Link
              to="/employee/requests"
              className="w-full flex items-center justify-center py-3.5 px-6 rounded-xl bg-[#0F172A] hover:bg-[#1E293B] text-white font-semibold text-sm transition-colors cursor-pointer"
            >
              Return to My Requests
            </Link>
          </div>

          {/* Footnote Error ID */}
          <div className="mt-8 pt-2">
            <span className="text-[11px] text-[#94A3B8] font-mono tracking-wide">
              QuickFix Error ID: {errorId}
            </span>
          </div>
        </div>
      </main>

      {/* Empty Footer for spacing */}
      <footer className="w-full py-4 text-center text-xs text-[#94A3B8] relative z-10" />

      {/* Support Modal */}
      <Modal
        isOpen={supportModalOpen}
        onClose={() => setSupportModalOpen(false)}
        title="Contact Maintenance Support"
        description="Our support desk can help troubleshoot system issues or log manual requests."
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
              Send Report
            </Button>
          </>
        }
      >
        {supportSubmitted ? (
          <div className="flex items-center gap-3 rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-xs font-medium text-emerald-800">
            <CheckCircle2 className="h-5 w-5 text-emerald-600 shrink-0" />
            <span>Support report dispatched. Support ticket #SUP-500 generated.</span>
          </div>
        ) : (
          <div className="space-y-4">
            <Input
              type="textarea"
              rows={3}
              label="Describe What Happened"
              id="error-report-text"
              placeholder="What page were you trying to access when this error occurred?"
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

export default ErrorPage;
