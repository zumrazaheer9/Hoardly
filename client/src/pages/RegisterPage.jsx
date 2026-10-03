import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext.jsx';
import { FormField } from '../components/common/FormField.jsx';
import { Input } from '../components/common/Input.jsx';
import { Button } from '../components/common/Button.jsx';
import { Alert } from '../components/common/Alert.jsx';
import { UserPlus, Check } from 'lucide-react';

export function RegisterPage() {
  const { register, error: authError, clearError } = useAuth();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    full_name: '',
    email: '',
    phone: '',
    password: '',
    confirm_password: '',
  });

  const [formErrors, setFormErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [registrationMessage, setRegistrationMessage] = useState('');

  const passwordValidation = {
    length: formData.password.length >= 8,
    uppercase: /[A-Z]/.test(formData.password),
    lowercase: /[a-z]/.test(formData.password),
    number: /[0-9]/.test(formData.password),
  };

  const validateForm = () => {
    const errors = {};

    if (!formData.full_name.trim()) {
      errors.full_name = 'Full name is missing. We require your name for orders and shipping. Please enter your first and last name.';
    } else if (formData.full_name.trim().length < 2) {
      errors.full_name = 'Full name is too short. Names must contain at least 2 characters. Please provide your complete name.';
    }

    if (!formData.email.trim()) {
      errors.email = 'Email address is missing. An email is required for account communication and order receipts. Please enter your email address.';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email.trim())) {
      errors.email = 'Email address format is invalid. It does not match the standard format. Please enter an email like user@example.com.';
    }

    if (!formData.password) {
      errors.password = 'Password is required. A security credential is required to protect your account. Please choose a password.';
    } else if (
      !passwordValidation.length ||
      !passwordValidation.uppercase ||
      !passwordValidation.lowercase ||
      !passwordValidation.number
    ) {
      errors.password = 'Password requirements are incomplete. Passwords must be at least 8 characters and include uppercase, lowercase, and numbers.';
    }

    if (!formData.confirm_password) {
      errors.confirm_password = 'Password confirmation is missing. Please re-enter your password to ensure they match.';
    } else if (formData.password !== formData.confirm_password) {
      errors.confirm_password = 'Passwords do not match. The values in both password fields must be identical. Please retype your confirmation password.';
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (formErrors[name]) {
      setFormErrors((prev) => ({ ...prev, [name]: null }));
    }
    if (authError) {
      clearError();
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsSubmitting(true);
    try {
      const response = await register({
        full_name: formData.full_name.trim(),
        email: formData.email.trim(),
        phone: formData.phone.trim() || undefined,
        password: formData.password,
      });
      if (response.session?.access_token) {
        navigate('/', { replace: true });
      } else {
        setRegistrationMessage(response.message || 'Your account was created. Check your email for a confirmation link before signing in.');
      }
    } catch (err) {
      // Error is set in AuthContext
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
            <UserPlus className="w-6 h-6 text-white" aria-hidden="true" />
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-content-primary">
            Create account
          </h1>
          <p className="text-sm text-content-secondary">
            Join Hoardly to explore products, build wishlists, and track orders.
          </p>
        </div>

        {/* Global Error Banner */}
        {authError && (
          <Alert variant="error" onDismiss={clearError}>
            {authError}
          </Alert>
        )}
        {registrationMessage && <Alert variant="success">{registrationMessage}</Alert>}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4" noValidate>
          <FormField
            id="register-name"
            label="Full name"
            required
            error={formErrors.full_name}
          >
            <Input
              name="full_name"
              type="text"
              placeholder="Alex Johnson"
              value={formData.full_name}
              onChange={handleChange}
              autoComplete="name"
              autoFocus
            />
          </FormField>

          <FormField
            id="register-email"
            label="Email address"
            required
            error={formErrors.email}
          >
            <Input
              name="email"
              type="email"
              placeholder="alex@example.com"
              value={formData.email}
              onChange={handleChange}
              autoComplete="email"
            />
          </FormField>

          <FormField
            id="register-phone"
            label="Phone number (optional)"
            helperText="Used for order shipping updates."
            error={formErrors.phone}
          >
            <Input
              name="phone"
              type="tel"
              placeholder="+1 (555) 000-0000"
              value={formData.phone}
              onChange={handleChange}
              autoComplete="tel"
            />
          </FormField>

          <FormField
            id="register-password"
            label="Password"
            required
            error={formErrors.password}
          >
            <Input
              name="password"
              type="password"
              placeholder="Create a secure password"
              value={formData.password}
              onChange={handleChange}
              autoComplete="new-password"
            />
          </FormField>

          {/* Password checklist */}
          <div className="p-3 bg-surface-muted rounded-md space-y-1.5 text-xs text-content-secondary">
            <p className="font-semibold text-content-primary">Password criteria:</p>
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
            id="register-confirm-password"
            label="Confirm password"
            required
            error={formErrors.confirm_password}
          >
            <Input
              name="confirm_password"
              type="password"
              placeholder="Confirm your password"
              value={formData.confirm_password}
              onChange={handleChange}
              autoComplete="new-password"
            />
          </FormField>

          <Button
            type="submit"
            variant="primary"
            size="lg"
            isLoading={isSubmitting}
            className="w-full mt-2"
          >
            Create account
          </Button>
        </form>

        {/* Footer */}
        <div className="text-center text-xs text-content-secondary border-t border-line pt-4">
          Already registered?{' '}
          <Link
            to="/login"
            className="text-content-link hover:underline font-semibold"
          >
            Sign in to account
          </Link>
        </div>
      </div>
    </div>
  );
}
