import React from 'react';

export default function FormField({
  id,
  label,
  error,
  helpText,
  required = false,
  children,
  className = ''
}) {
  return (
    <div className={`space-y-1.5 ${className}`}>
      {label && (
        <label htmlFor={id} className="block text-sm font-medium text-slate-800">
          {label}
          {required && <span className="text-rose-500 ml-1" aria-hidden="true">*</span>}
        </label>
      )}

      {children}

      {error ? (
        <p id={`${id}-error`} className="text-xs text-rose-600 font-medium flex items-center gap-1" role="alert">
          <span>{error}</span>
        </p>
      ) : helpText ? (
        <p id={`${id}-help`} className="text-xs text-slate-500">
          {helpText}
        </p>
      ) : null}
    </div>
  );
}
