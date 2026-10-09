import React from 'react';
import { AlertCircle, RefreshCw } from 'lucide-react';
import Button from './Button';

/**
 * Standard error state component with message and retry capability
 */
export function ErrorState({
  title = 'Something went wrong',
  message = 'We encountered an error loading this data. Please try again.',
  onRetry,
  className = '',
}) {
  return (
    <div
      role="alert"
      className={`flex flex-col items-center justify-center p-8 sm:p-10 text-center rounded-xl border border-[#FECACA] bg-[#FCE8E8]/30 ${className}`}
    >
      <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#FCE8E8] text-[#991B1B] mb-4 border border-[#FECACA]">
        <AlertCircle className="w-6 h-6" />
      </div>
      <h3 className="text-base font-semibold text-[#991B1B] mb-1">{title}</h3>
      <p className="text-sm text-[#5D6875] max-w-md mb-5">{message}</p>
      {onRetry && (
        <Button
          variant="secondary"
          size="sm"
          onClick={onRetry}
          icon={RefreshCw}
        >
          Retry
        </Button>
      )}
    </div>
  );
}

export default ErrorState;
