import React from 'react';

/**
 * Accessible FormField molecule linking label, input, description, and error message.
 * Error adheres to the formula: what + why + how.
 */
export function FormField({
  id,
  label,
  error,
  helperText,
  required = false,
  children,
  className = '',
}) {
  const errorId = error ? `${id}-error` : undefined;
  const helperId = helperText ? `${id}-helper` : undefined;
  const describedBy = [errorId, helperId].filter(Boolean).join(' ') || undefined;

  return (
    <div className={`flex flex-col gap-1.5 w-full ${className}`}>
      {label && (
        <label
          htmlFor={id}
          className="text-xs font-semibold text-content-secondary tracking-wide flex items-center justify-between"
        >
          <span>{label}</span>
          {required && (
            <span className="text-feedback-error text-xs" aria-hidden="true">
              *
            </span>
          )}
        </label>
      )}

      {React.isValidElement(children)
        ? React.cloneElement(children, {
            id,
            hasError: Boolean(error),
            'aria-describedby': describedBy,
            'aria-invalid': Boolean(error),
            required,
          })
        : children}

      {error ? (
        <p
          id={errorId}
          role="alert"
          aria-live="polite"
          className="text-xs text-feedback-error font-medium transition-all duration-fast"
        >
          {error}
        </p>
      ) : helperText ? (
        <p id={helperId} className="text-xs text-content-muted">
          {helperText}
        </p>
      ) : null}
    </div>
  );
}
