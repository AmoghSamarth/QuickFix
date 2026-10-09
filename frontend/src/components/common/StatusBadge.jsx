import React from 'react';
import { getStatusConfig } from '../../utils/statusUtils';

/**
 * StatusBadge Component
 * Standardized badge for Pending, In Progress, Resolved, Escalated statuses.
 */
export function StatusBadge({ status, showDot = true, size = 'md', className = '' }) {
  const config = getStatusConfig(status);

  const sizeStyles = {
    sm: 'text-xs px-2 py-0.5',
    md: 'text-xs font-medium px-2.5 py-1',
    lg: 'text-sm font-medium px-3 py-1.5',
  };

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border ${config.badgeClasses} ${sizeStyles[size] || sizeStyles.md} ${className}`}
    >
      {showDot && (
        <span
          className={`w-1.5 h-1.5 rounded-full shrink-0 ${config.dotColor}`}
          aria-hidden="true"
        />
      )}
      <span>{config.label}</span>
    </span>
  );
}

export default StatusBadge;
