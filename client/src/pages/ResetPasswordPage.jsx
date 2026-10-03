import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext.jsx';
import { FormField } from '../components/common/FormField.jsx';
import { Input } from '../components/common/Input.jsx';
import { Button } from '../components/common/Button.jsx';
import { Alert } from '../components/common/Alert.jsx';
import { Lock, Check } from 'lucide-react';

export function ResetPasswordPage() {
  const { resetPassword, logout, isAuthenticated, isLoading, error: authError, clearError } = useAuth();

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [formErrors, setFormErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const passwordValidation = {
    length: password.length >= 8,
    uppercase: /[A-Z]/.test(password),
    lowercase: /[a-z]/.test(password),
    number: /[0-9]/.test(password),
  };

  const validateForm = () => {
    const errors = {};

    if (!password) {
      errors.password = 'Password is required. Please choose a new password.';
    } else if (
      !passwordValidation.length ||
      !passwordValidation.uppercase ||
      !passwordValidation.lowercase ||
      !passwordValidation.number
    ) {
      errors.password = 'Password does not meet requirements. It must have 8+ characters, uppercase, lowercase, and numbers.';
    }

    if (!confirmPassword) {
      errors.confirmPassword = 'Confirmation password is required. Please repeat the new password.';
    } else if (password !== confirmPassword) {
      errors.confirmPassword = 'Passwords do not match. Please verify that both entries are identical.';
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsSubmitting(true);
    try {
      await resetPassword(password);
      await logout();
      setIsSuccess(true);
    } catch (err) {
      // Handled in context
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md space-y-8 bg-surface-card p-8 rounded-xl border border-line shadow-sm">
        {/* Header */}
        <div className="text-center space-y-2">
          <div className="inline-flex w-12 h-12 rounded-lg bg-brand text-content-on-action items-center justify-center shadow-xs">
            <Lock className="w-6 h-6 text-white" aria-hidden="true" />
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-content-primary">
            Set new password
          </h1>
          <p className="text-sm text-content-secondary">
            Create a strong new password for your account.
          </p>
        </div>

        {authError && (
          <Alert variant="error" onDismiss={clearError}>
            {authError}
          </Alert>
        )}

        {isSuccess ? (
          <div className="space-y-4">
            <Alert variant="success" title="Password updated">
              Your password has been updated. Sign in with your new password.
            </Alert>
            <Link to="/login" className="block w-full">
              <Button variant="primary" size="lg" className="w-full">
                Proceed to sign in
              </Button>
            </Link>
          </div>
        ) : !isLoading && !isAuthenticated ? (
          <div className="space-y-4">
            <Alert variant="warning">This reset link is missing or expired. Request a new link to update your password.</Alert>
            <Link to="/forgot-password" className="block text-sm font-semibold text-content-link hover:underline">Request reset link</Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4" noValidate>
            <FormField
              id="new-password"
              label="New password"
              required
              error={formErrors.password}
            >
              <Input
                name="password"
                type="password"
                placeholder="Enter new password"
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  if (formErrors.password) setFormErrors((p) => ({ ...p, password: null }));
                  if (authError) clearError();
                }}
                autoFocus
              />
            </FormField>

            <div className="p-3 bg-surface-muted rounded-md space-y-1.5 text-xs text-content-secondary">
              <p className="font-semibold text-content-primary">Criteria:</p>
              <div className="grid grid-cols-2 gap-1.5">
                <span className={`flex items-center gap-1.5 ${passwordValidation.length ? 'text-feedback-success font-medium' : 'text-content-muted'}`}>
                  <Check className="w-3.5 h-3.5" aria-hidden="true" />
                  8+ characters
                </span>
                <span className={`flex items-center gap-1.5 ${passwordValidation.uppercase ? 'text-feedback-success font-medium' : 'text-content-muted'}`}>
                  <Check className="w-3.5 h-3.5" aria-hidden="true" />
                  Uppercase letter
                </span>
                <span className={`flex items-center gap-1.5 ${passwordValidation.lowercase ? 'text-feedback-success font-medium' : 'text-content-muted'}`}>
                  <Check className="w-3.5 h-3.5" aria-hidden="true" />
                  Lowercase letter
                </span>
                <span className={`flex items-center gap-1.5 ${passwordValidation.number ? 'text-feedback-success font-medium' : 'text-content-muted'}`}>
                  <Check className="w-3.5 h-3.5" aria-hidden="true" />
                  Numeric digit
                </span>
              </div>
            </div>

            <FormField
              id="confirm-new-password"
              label="Confirm new password"
              required
              error={formErrors.confirmPassword}
            >
              <Input
                name="confirmPassword"
                type="password"
                placeholder="Confirm new password"
                value={confirmPassword}
                onChange={(e) => {
                  setConfirmPassword(e.target.value);
                  if (formErrors.confirmPassword) setFormErrors((p) => ({ ...p, confirmPassword: null }));
                }}
              />
            </FormField>

            <Button
              type="submit"
              variant="primary"
              size="lg"
              isLoading={isSubmitting}
              disabled={isLoading || !isAuthenticated}
              className="w-full mt-2"
            >
              Update password
            </Button>
          </form>
        )}
      </div>
    </div>
  );
}
