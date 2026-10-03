import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext.jsx';
import { Spinner } from '../common/Spinner.jsx';

/**
 * ProtectedRoute guards authenticated routes and optional admin-only routes.
 */
export function ProtectedRoute({ children, requireAdmin = false }) {
  const { isAuthenticated, isAdmin, isLoading } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return (
      <div
        className="min-h-[50vh] flex flex-col items-center justify-center gap-3"
        role="status"
        aria-live="polite"
      >
        <Spinner size="lg" className="text-brand" />
        <p className="text-sm text-content-secondary">Verifying authentication status...</p>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (requireAdmin && !isAdmin) {
    return <Navigate to="/" replace />;
  }

  return children;
}
