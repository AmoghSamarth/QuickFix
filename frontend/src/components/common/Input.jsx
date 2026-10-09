import React from 'react';

/**
 * QuickFix Design System Form Input Component
 * Handles labels, validation errors, helper text, and icon adornments
 */
export function Input({
  id,
  name,
  label,
  type = 'text',
  value,
  onChange,
  placeholder,
  error,
  helperText,
  required = false,
  disabled = false,
  icon: Icon,
  className = '',
  rows = 3,
  children,
  ...props
}) {
  const inputId = id || name;

  const isTextarea = type === 'textarea';
  const isSelect = type === 'select';

  const baseInputStyles =
    'w-full rounded-lg border bg-white px-3.5 py-2.5 text-sm text-[#1E293B] placeholder-[#94A3B8] transition-colors focus:outline-none disabled:bg-slate-50 disabled:text-slate-400 disabled:cursor-not-allowed';

  const stateStyles = error
    ? 'border-[#FECACA] text-[#991B1B] focus:border-red-500 focus:ring-1 focus:ring-red-500'
    : 'border-[#D9E1E8] hover:border-slate-400 focus:border-[#2F6FED] focus:ring-1 focus:ring-[#2F6FED]';

  return (
    <div className={`w-full ${className}`}>
      {label && (
        <label
          htmlFor={inputId}
          className="block text-xs font-semibold uppercase tracking-wider text-[#5D6875] mb-1.5"
        >
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}

      <div className="relative">
        {Icon && !isTextarea && !isSelect && (
          <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-[#94A3B8]">
            <Icon className="w-4 h-4" />
          </div>
        )}

        {isTextarea ? (
          <textarea
            id={inputId}
            name={name}
            value={value}
            onChange={onChange}
            placeholder={placeholder}
            disabled={disabled}
            required={required}
            rows={rows}
            className={`${baseInputStyles} ${stateStyles} resize-y`}
            {...props}
          />
        ) : isSelect ? (
          <select
            id={inputId}
            name={name}
            value={value}
            onChange={onChange}
            disabled={disabled}
            required={required}
            className={`${baseInputStyles} ${stateStyles}`}
            {...props}
          >
            {children}
          </select>
        ) : (
          <input
            id={inputId}
            name={name}
            type={type}
            value={value}
            onChange={onChange}
            placeholder={placeholder}
            disabled={disabled}
            required={required}
            className={`${baseInputStyles} ${stateStyles} ${Icon ? 'pl-10' : ''}`}
            {...props}
          />
        )}
      </div>

      {error ? (
        <p className="mt-1.5 text-xs text-red-600 font-medium" role="alert">
          {error}
        </p>
      ) : helperText ? (
        <p className="mt-1.5 text-xs text-[#5D6875]">{helperText}</p>
      ) : null}
    </div>
  );
}

export default Input;
