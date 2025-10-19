import React from 'react';
import { DayItinerary } from '@/lib/types';
import ActivityCard from './ActivityCard';

interface DaySectionProps {
  day: DayItinerary;
  onLocationClick?: (coordinates: [number, number]) => void;
  onSelectOption?: (activitySlotId: string, optionId: string) => void;
  onActivityHover?: (coordinates: [number, number] | undefined) => void;
  fullItinerary: DayItinerary[];
}

export default function DaySection({ day, onLocationClick, onSelectOption, onActivityHover, fullItinerary }: DaySectionProps) {
  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
  };

  return (
    <div>
      {/* Black header - full width, no border radius */}
      <div
        className="sticky top-0 z-10 flex items-center justify-between"
        style={{
          background: '#000000',
          color: 'var(--le-white)',
          padding: 'var(--le-space-3) var(--le-space-4)',
        }}
      >
        <div>
          <h2 style={{
            fontSize: 'var(--le-text-sm)',
            fontWeight: 'var(--le-font-semibold)',
            color: 'var(--le-white)'
          }}>
            Day {day.dayNumber} · {formatDate(day.date)}
          </h2>
        </div>
        <button
          className="le-button-primary"
          style={{ fontSize: 'var(--le-text-xs)' }}
        >
          Select day
        </button>
      </div>

      {/* White background container with stacked items - no gaps */}
      <div style={{ background: 'var(--le-white)' }}>
        {day.activities.map((activitySlot) => (
          <ActivityCard
            key={activitySlot.id}
            activitySlot={activitySlot}
            onLocationClick={onLocationClick}
            onSelectOption={onSelectOption}
            onActivityHover={onActivityHover}
            itinerary={fullItinerary}
          />
        ))}

        <button
          className="flex items-center justify-center gap-2"
          style={{
            width: '100%',
            padding: 'var(--le-space-4)',
            border: 'none',
            borderTop: '1px solid var(--le-gray-200)',
            fontSize: 'var(--le-text-sm)',
            color: 'var(--le-gray-500)',
            background: 'var(--le-white)',
            transition: 'all var(--le-transition-base)',
            cursor: 'pointer',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = 'var(--le-gray-50)';
            e.currentTarget.style.color = 'var(--le-gray-700)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = 'var(--le-white)';
            e.currentTarget.style.color = 'var(--le-gray-500)';
          }}
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Add something to this day
        </button>
      </div>
    </div>
  );
}
