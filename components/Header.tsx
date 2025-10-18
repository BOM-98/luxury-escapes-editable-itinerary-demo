import React from 'react';

interface HeaderProps {
  title: string;
  location: string;
  creator: string;
  stats: {
    days: number;
    stays: number;
    experiences: number;
  };
}

export default function Header({ title, location, creator, stats }: HeaderProps) {
  return (
    <header className="le-divider" style={{
      background: 'var(--le-white)',
      borderBottom: '1px solid',
      padding: 'var(--le-space-4) var(--le-space-6)'
    }}>
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <h1 className="le-text-heading" style={{
            fontSize: 'var(--le-text-xl)'
          }}>
            {title}
          </h1>
          <p className="le-text-caption" style={{
            marginTop: 'var(--le-space-1)'
          }}>
            {location} • Created by {creator}
          </p>
        </div>

        <div className="flex items-center" style={{ gap: 'var(--le-space-6)' }}>
          <div className="flex items-center" style={{
            gap: 'var(--le-space-2)',
            padding: 'var(--le-space-2) var(--le-space-3)',
            background: 'var(--le-gray-100)',
            borderRadius: 'var(--le-radius-md)'
          }}>
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" style={{ color: 'var(--le-gray-600)' }}>
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            <span style={{
              fontSize: 'var(--le-text-sm)',
              fontWeight: 'var(--le-font-medium)',
              color: 'var(--le-gray-700)'
            }}>
              {stats.days} day{stats.days !== 1 ? 's' : ''}
            </span>
          </div>

          <div className="flex items-center" style={{
            gap: 'var(--le-space-2)',
            padding: 'var(--le-space-2) var(--le-space-3)',
            background: 'var(--le-gray-100)',
            borderRadius: 'var(--le-radius-md)'
          }}>
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" style={{ color: 'var(--le-gray-600)' }}>
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
            </svg>
            <span style={{
              fontSize: 'var(--le-text-sm)',
              fontWeight: 'var(--le-font-medium)',
              color: 'var(--le-gray-700)'
            }}>
              {stats.stays} stay{stats.stays !== 1 ? 's' : ''}
            </span>
          </div>

          <div className="flex items-center" style={{
            gap: 'var(--le-space-2)',
            padding: 'var(--le-space-2) var(--le-space-3)',
            background: 'var(--le-gray-100)',
            borderRadius: 'var(--le-radius-md)'
          }}>
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" style={{ color: 'var(--le-gray-600)' }}>
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
            </svg>
            <span style={{
              fontSize: 'var(--le-text-sm)',
              fontWeight: 'var(--le-font-medium)',
              color: 'var(--le-gray-700)'
            }}>
              {stats.experiences} experience{stats.experiences !== 1 ? 's' : ''}
            </span>
          </div>

          <button className="le-button-primary">
            Share
          </button>
        </div>
      </div>
    </header>
  );
}
