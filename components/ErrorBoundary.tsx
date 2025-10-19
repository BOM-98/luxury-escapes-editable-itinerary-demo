'use client';

import React, { Component, ErrorInfo, ReactNode } from 'react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

export default class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div
          className="flex flex-col items-center justify-center p-8 min-h-screen"
          style={{
            background: 'var(--le-gray-50)',
          }}
        >
          <div
            className="max-w-md w-full bg-white rounded-lg shadow-lg p-8"
            style={{
              border: '1px solid var(--le-gray-200)',
            }}
          >
            <svg
              className="w-16 h-16 mx-auto mb-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              style={{ color: 'var(--le-error)' }}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
              />
            </svg>
            <h2
              style={{
                fontSize: 'var(--le-text-xl)',
                fontWeight: 'var(--le-font-bold)',
                color: 'var(--le-gray-900)',
                textAlign: 'center',
                marginBottom: 'var(--le-space-3)',
              }}
            >
              Something went wrong
            </h2>
            <p
              style={{
                fontSize: 'var(--le-text-sm)',
                color: 'var(--le-gray-600)',
                textAlign: 'center',
                marginBottom: 'var(--le-space-4)',
              }}
            >
              We're sorry for the inconvenience. Please try refreshing the page or contact support if the problem persists.
            </p>
            {this.state.error && process.env.NODE_ENV === 'development' && (
              <div
                style={{
                  padding: 'var(--le-space-3)',
                  background: 'var(--le-gray-100)',
                  borderRadius: 'var(--le-radius-md)',
                  marginBottom: 'var(--le-space-4)',
                  fontSize: 'var(--le-text-xs)',
                  color: 'var(--le-error)',
                  fontFamily: 'monospace',
                  overflowX: 'auto',
                }}
              >
                {this.state.error.toString()}
              </div>
            )}
            <div className="flex gap-3">
              <button
                onClick={() => window.location.reload()}
                className="le-button-primary flex-1"
                style={{
                  padding: 'var(--le-space-3)',
                }}
              >
                Refresh Page
              </button>
              <button
                onClick={() => this.setState({ hasError: false, error: undefined })}
                className="le-button-secondary flex-1"
                style={{
                  padding: 'var(--le-space-3)',
                }}
              >
                Try Again
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
