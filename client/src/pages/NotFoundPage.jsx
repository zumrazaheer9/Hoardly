import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '../components/common/Button.jsx';
import { Compass } from 'lucide-react';

export function NotFoundPage() {
  return (
    <div className="min-h-[calc(100vh-12rem)] flex items-center justify-center px-4 py-16 text-center">
      <div className="max-w-md space-y-6">
        <div className="inline-flex w-16 h-16 rounded-full bg-surface-muted text-content-primary items-center justify-center border border-line">
          <Compass className="w-8 h-8 text-content-secondary" aria-hidden="true" />
        </div>
        <div className="space-y-2">
          <h1 className="text-3xl font-bold tracking-tight text-content-primary">
            Page not found
          </h1>
          <p className="text-sm text-content-secondary leading-relaxed">
            The resource you requested could not be located. It may have moved or no longer exists.
          </p>
        </div>
        <Link to="/">
          <Button variant="primary" size="lg">
            Return to homepage
          </Button>
        </Link>
      </div>
    </div>
  );
}
