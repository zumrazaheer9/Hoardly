import React from 'react';
import { AlertCircle, CheckCircle2, AlertTriangle, Info, X } from 'lucide-react';

/**
 * Accessible Alert notification banner with semantic status tokens.
 */
export function Alert({
  variant = 'info',
  title,
  children,
  onDismiss,
  className = '',
}) {
  const config = {
    info: {
      container: 'bg-blue-50 border-blue-200 text-blue-900',
      icon: <Info className="w-5 h-5 text-feedback-info shrink-0" aria-hidden="true" />,
    },
    success: {
      container: 'bg-emerald-50 border-emerald-200 text-emerald-900',
      icon: <CheckCircle2 className="w-5 h-5 text-feedback-success shrink-0" aria-hidden="true" />,
    },
    warning: {
      container: 'bg-amber-50 border-amber-200 text-amber-900',
      icon: <AlertTriangle className="w-5 h-5 text-feedback-warning shrink-0" aria-hidden="true" />,
    },
    error: {
      container: 'bg-rose-50 border-rose-200 text-rose-900',
      icon: <AlertCircle className="w-5 h-5 text-feedback-error shrink-0" aria-hidden="true" />,
    },
  }[variant] || config.info;

  return (
    <div
      role="alert"
      className={`flex items-start gap-3 p-4 rounded-md border text-sm transition-all duration-normal ${config.container} ${className}`}
    >
      {config.icon}
      <div className="flex-1">
        {title && <h3 className="font-semibold mb-0.5">{title}</h3>}
        <div className="text-sm leading-relaxed">{children}</div>
      </div>
      {onDismiss && (
        <button
          type="button"
          onClick={onDismiss}
          className="p-1 rounded-sm hover:bg-black/5 cursor-pointer text-current"
          aria-label="Dismiss alert notification"
        >
          <X className="w-4 h-4" aria-hidden="true" />
        </button>
      )}
    </div>
  );
}
