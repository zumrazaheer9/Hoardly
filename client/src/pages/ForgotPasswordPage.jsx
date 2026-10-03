import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext.jsx';
import { FormField } from '../components/common/FormField.jsx';
import { Input } from '../components/common/Input.jsx';
import { Button } from '../components/common/Button.jsx';
import { Alert } from '../components/common/Alert.jsx';
import { KeyRound, ArrowLeft } from 'lucide-react';

export function ForgotPasswordPage() {
  const { forgotPassword, error: authError, clearError } = useAuth();
  const [email, setEmail] = useState('');
  const [emailError, setEmailError] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email.trim()) {
      setEmailError('Email address is missing. Please provide the email address associated with your account.');
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      setEmailError('Email address format is invalid. Please enter a valid address such as user@example.com.');
      return;
    }

    setIsSubmitting(true);
    setEmailError(null);
    try {
      const res = await forgotPassword(email.trim());
      setSuccessMessage(res.message || 'Password reset link has been dispatched to your email.');
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
            <KeyRound className="w-6 h-6 text-white" aria-hidden="true" />
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-content-primary">
            Reset account password
          </h1>
          <p className="text-sm text-content-secondary">
            Enter your email and we will send you a link to choose a new password.
          </p>
        </div>

        {authError && (
          <Alert variant="error" onDismiss={clearError}>
            {authError}
          </Alert>
        )}

        {successMessage ? (
          <div className="space-y-6">
            <Alert variant="success" title="Check your inbox">
              {successMessage}
            </Alert>
            <Link to="/login" className="block w-full">
              <Button variant="secondary" size="lg" className="w-full">
                <ArrowLeft className="w-4 h-4 mr-2" aria-hidden="true" />
                Return to sign in
              </Button>
            </Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-5" noValidate>
            <FormField
              id="reset-email"
              label="Email address"
              required
              error={emailError}
            >
              <Input
                name="email"
                type="email"
                placeholder="name@example.com"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  if (emailError) setEmailError(null);
                  if (authError) clearError();
                }}
                autoComplete="email"
                autoFocus
              />
            </FormField>

            <Button
              type="submit"
              variant="primary"
              size="lg"
              isLoading={isSubmitting}
              className="w-full"
            >
              Send reset link
            </Button>

            <div className="text-center pt-2">
              <Link
                to="/login"
                className="text-xs text-content-link hover:underline font-medium inline-flex items-center gap-1"
              >
                <ArrowLeft className="w-3.5 h-3.5" aria-hidden="true" />
                Back to sign in
              </Link>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
