import React, { forwardRef } from 'react';
import { Spinner } from './Spinner.jsx';

/**
 * Universal Input atom supporting all 8 states:
 * 1. Default
 * 2. Hover
 * 3. Focus
 * 4. Active
 * 5. Disabled
 * 6. Loading
 * 7. Error
 * 8. Selected / Filled
 */
export const Input = forwardRef(function Input(
  {
    id,
    name,
    type = 'text',
    value,
    defaultValue,
    onChange,
    onBlur,
    onFocus,
    placeholder,
    disabled = false,
    readOnly = false,
    required = false,
    hasError = false,
    isLoading = false,
    isSelected = false,
    className = '',
    'aria-describedby': ariaDescribedBy,
    'aria-invalid': ariaInvalid,
    autoComplete,
    ...props
  },
  ref
) {
  const isInteractionDisabled = disabled || isLoading;

  const stateClasses = hasError
    ? 'border-feedback-error focus:border-feedback-error focus:ring-2 focus:ring-feedback-error/20'
    : isSelected
    ? 'border-line-focus ring-2 ring-brand/10'
    : 'border-line hover:border-line-strong focus:border-line-focus focus:ring-2 focus:ring-brand/20';

  return (
    <div className="relative w-full">
      <input
        ref={ref}
        id={id}
        name={name}
        type={type}
        value={value}
        defaultValue={defaultValue}
        onChange={onChange}
        onBlur={onBlur}
        onFocus={onFocus}
        placeholder={placeholder}
        disabled={isInteractionDisabled}
        readOnly={readOnly}
        required={required}
        autoComplete={autoComplete}
        aria-invalid={hasError || ariaInvalid ? 'true' : 'false'}
        aria-describedby={ariaDescribedBy}
        aria-busy={isLoading}
        className={`w-full px-3.5 py-2.5 bg-surface-card text-content-primary placeholder:text-content-muted text-sm rounded-md border transition-all duration-fast outline-none disabled:opacity-50 disabled:bg-surface-muted disabled:cursor-not-allowed ${stateClasses} ${isLoading ? 'pr-10' : ''} ${className}`}
        {...props}
      />
      {isLoading && (
        <div className="absolute inset-y-0 right-3 flex items-center pointer-events-none text-content-muted">
          <Spinner size="sm" />
        </div>
      )}
    </div>
  );
});
