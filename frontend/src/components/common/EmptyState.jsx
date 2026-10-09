import React from 'react';
import { ClipboardList } from 'lucide-react';
import Button from './Button';

/**
 * Standard empty state component with informative icon, message, and action CTA
 */
export function EmptyState({
  icon: Icon = ClipboardList,
  title = 'No items found',
  description = 'There are no records matching your request at this time.',
  actionText,
  onAction,
  actionIcon,
  className = '',
}) {
  return (
    <div
      className={`flex flex-col items-center justify-center p-8 sm:p-12 text-center rounded-xl border border-dashed border-[#D9E1E8] bg-white ${className}`}
    >
      <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-slate-50 text-[#5D6875] mb-4 border border-[#D9E1E8]">
        <Icon className="w-6 h-6" />
      </div>
      <h3 className="text-base font-semibold text-[#1E293B] mb-1">{title}</h3>
      <p className="text-sm text-[#5D6875] max-w-sm mb-6">{description}</p>
      {actionText && onAction && (
        <Button
          variant="action"
          size="sm"
          onClick={onAction}
          icon={actionIcon}
        >
          {actionText}
        </Button>
      )}
    </div>
  );
}

export default EmptyState;
