import React from 'react';
import { getPriorityConfig } from '../../utils/statusUtils';

/**
 * PriorityBadge Component
 * Displays Low, Medium, High, and Critical priorities
 */
export function PriorityBadge({ priority, size = 'md', className = '' }) {
  const config = getPriorityConfig(priority);

  const sizeStyles = {
    sm: 'text-xs px-2 py-0.5',
    md: 'text-xs font-medium px-2.5 py-1',
    lg: 'text-sm font-medium px-3 py-1.5',
  };

  return (
    <span
      className={`inline-flex items-center rounded-md border ${config.badgeClasses} ${sizeStyles[size] || sizeStyles.md} ${className}`}
    >
      {config.label}
    </span>
  );
}

export default PriorityBadge;
