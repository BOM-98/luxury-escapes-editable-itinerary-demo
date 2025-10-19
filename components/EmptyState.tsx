import React from 'react';

interface EmptyStateProps {
  icon?: React.ReactNode;
  title: string;
  description?: string;
  action?: {
    label: string;
    onClick: () => void;
  };
}

export default function EmptyState({ icon, title, description, action }: EmptyStateProps) {
  return (
    <div
      className="flex flex-col items-center justify-center p-8 text-center"
      style={{
        minHeight: '200px',
      }}
    >
      {icon && (
        <div
          className="mb-4"
          style={{
            color: 'var(--le-gray-400)',
          }}
        >
          {icon}
        </div>
      )}
      <h3
        style={{
          fontSize: 'var(--le-text-base)',
          fontWeight: 'var(--le-font-semibold)',
          color: 'var(--le-gray-900)',
          marginBottom: 'var(--le-space-2)',
        }}
      >
        {title}
      </h3>
      {description && (
        <p
          style={{
            fontSize: 'var(--le-text-sm)',
            color: 'var(--le-gray-600)',
            marginBottom: action ? 'var(--le-space-4)' : '0',
            maxWidth: '300px',
          }}
        >
          {description}
        </p>
      )}
      {action && (
        <button
          onClick={action.onClick}
          className="le-button-primary"
          style={{
            padding: 'var(--le-space-2) var(--le-space-4)',
            fontSize: 'var(--le-text-sm)',
          }}
        >
          {action.label}
        </button>
      )}
    </div>
  );
}
