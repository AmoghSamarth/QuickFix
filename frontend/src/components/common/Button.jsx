import React from 'react';
import { Loader2 } from 'lucide-react';

/**
 * QuickFix Design System Button Component
 */
export function Button({
  children,
  type = 'button',
  variant = 'primary',
  size = 'md',
  isLoading = false,
  disabled = false,
  icon: Icon,
  iconPosition = 'left',
  className = '',
  onClick,
  ...props
}) {
  const baseStyles =
    'inline-flex items-center justify-center font-medium rounded-lg transition-colors duration-150 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer select-none';

  const sizeStyles = {
    sm: 'text-xs px-3 py-1.5 gap-1.5',
    md: 'text-sm px-4 py-2 gap-2',
    lg: 'text-base px-5 py-2.5 gap-2.5',
  };

  const variantStyles = {
    primary:
      'bg-[#173B32] hover:bg-[#215447] text-white focus:ring-[#173B32] shadow-sm',
    action:
      'bg-[#2F6FED] hover:bg-[#1E5CD9] text-white focus:ring-[#2F6FED] shadow-sm',
    secondary:
      'bg-white hover:bg-slate-50 text-[#1E293B] border border-[#D9E1E8] focus:ring-[#2F6FED] shadow-xs',
    outline:
      'bg-transparent border border-[#173B32] text-[#173B32] hover:bg-[#173B32]/5 focus:ring-[#173B32]',
    danger:
      'bg-[#FCE8E8] text-[#991B1B] border border-[#FECACA] hover:bg-red-100 focus:ring-red-500',
    ghost:
      'bg-transparent text-[#5D6875] hover:text-[#1E293B] hover:bg-slate-100 focus:ring-slate-400',
  };

  return (
    <button
      type={type}
      disabled={disabled || isLoading}
      onClick={onClick}
      className={`${baseStyles} ${sizeStyles[size] || sizeStyles.md} ${variantStyles[variant] || variantStyles.primary} ${className}`}
      {...props}
    >
      {isLoading ? (
        <>
          <Loader2 className="w-4 h-4 animate-spin" />
          <span>Loading...</span>
        </>
      ) : (
        <>
          {Icon && iconPosition === 'left' && <Icon className="w-4 h-4 shrink-0" />}
          <span>{children}</span>
          {Icon && iconPosition === 'right' && <Icon className="w-4 h-4 shrink-0" />}
        </>
      )}
    </button>
  );
}

export default Button;
