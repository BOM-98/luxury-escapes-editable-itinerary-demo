import React from 'react';

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  message?: string;
}

export default function LoadingSpinner({ size = 'md', message }: LoadingSpinnerProps) {
  const sizes = {
    sm: 'w-4 h-4',
    md: 'w-8 h-8',
    lg: 'w-12 h-12',
  };

  return (
    <div className="flex flex-col items-center justify-center p-8">
      <div
        className={`${sizes[size]} border-4 border-gray-200 border-t-teal-600 rounded-full animate-spin`}
        role="status"
        aria-label="Loading"
      />
      {message && (
        <p
          className="mt-4 text-sm text-gray-600"
          style={{
            fontSize: 'var(--le-text-sm)',
            color: 'var(--le-gray-600)',
          }}
        >
          {message}
        </p>
      )}
      <span className="sr-only">Loading...</span>
    </div>
  );
}
