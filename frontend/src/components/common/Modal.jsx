import React, { useEffect } from 'react';
import { X } from 'lucide-react';

/**
 * Accessible dialog modal component
 */
export function Modal({
  isOpen,
  onClose,
  title,
  description,
  children,
  footer,
  maxWidth = 'max-w-lg',
}) {
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };

    if (isOpen) {
      document.body.style.overflow = 'hidden';
      window.addEventListener('keydown', handleKeyDown);
    }

    return () => {
      document.body.style.overflow = 'unset';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto"
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
    >
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-[#173B32]/40 backdrop-blur-xs transition-opacity duration-200"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Modal Dialog Card */}
      <div
        className={`relative w-full ${maxWidth} rounded-xl bg-white p-6 shadow-xl border border-[#D9E1E8] z-10 transition-all duration-200`}
      >
        <div className="flex items-start justify-between pb-4 border-b border-[#D9E1E8]">
          <div>
            <h2 id="modal-title" className="text-lg font-semibold text-[#1E293B]">
              {title}
            </h2>
            {description && (
              <p className="mt-1 text-xs text-[#5D6875]">{description}</p>
            )}
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-1.5 text-[#5D6875] hover:bg-slate-100 hover:text-[#1E293B] focus:outline-none focus:ring-2 focus:ring-[#2F6FED]"
            aria-label="Close modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="py-4 text-sm text-[#1E293B]">{children}</div>

        {footer && (
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-[#D9E1E8]">
            {footer}
          </div>
        )}
      </div>
    </div>
  );
}

export default Modal;
