'use client';

import { Component, ReactNode } from 'react';
import { Button } from '@/components/ui/Button';
import { useRouter } from 'next/navigation';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  override componentDidCatch(error: Error, errorInfo: React.ErrorInfo): void {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
  }

  handleGoHome = () => {
    this.setState({ hasError: false, error: null });
    window.location.href = '/';
  };

  handleRetry = () => {
    this.setState({ hasError: false, error: null });
  };

  override render(): ReactNode {
    if (this.state.hasError) {
      return (
        <div className="flex flex-col items-center justify-center min-h-screen px-4">
          <div className="max-w-md w-full text-center">
            <div className="mb-6">
              <svg
                className="w-24 h-24 mx-auto text-red-500"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                />
              </svg>
            </div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-4">
              Something went wrong
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mb-8">
              We encountered an unexpected error. Please try again or return to the home page.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button onClick={this.handleRetry} variant="default">
                Try Again
              </Button>
              <Button onClick={this.handleGoHome} variant="secondary">
                Go to Home
              </Button>
            </div>
            {process.env.NODE_ENV === 'development' && this.state.error && (
              <div className="mt-8 p-4 bg-gray-100 dark:bg-gray-800 rounded-lg text-left">
                <p className="font-mono text-sm text-red-600 dark:text-red-400 break-all">
                  {this.state.error.message}
                </p>
              </div>
            )}
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
