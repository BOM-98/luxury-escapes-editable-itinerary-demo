import React from 'react';
import { DayItinerary } from '@/lib/types';
import ActivityCard from './ActivityCard';

interface DaySectionProps {
  day: DayItinerary;
  onLocationClick?: (coordinates: [number, number]) => void;
  onSelectOption?: (activitySlotId: string, optionId: string) => void;
  fullItinerary: DayItinerary[];
}

export default function DaySection({ day, onLocationClick, onSelectOption, fullItinerary }: DaySectionProps) {
  return (
    <div className="mb-6">
      <div className="bg-gray-900 text-white px-4 py-3 rounded-t-lg flex items-center justify-between sticky top-0 z-10">
        <div>
          <h2 className="text-sm font-semibold">{day.date}</h2>
        </div>
        <button className="px-3 py-1.5 bg-white text-gray-900 text-xs font-medium rounded hover:bg-gray-100 transition-colors">
          Select this day
        </button>
      </div>

      <div className="space-y-3 p-4 bg-gray-50 rounded-b-lg">
        {day.activities.map((activitySlot) => (
          <ActivityCard
            key={activitySlot.id}
            activitySlot={activitySlot}
            onLocationClick={onLocationClick}
            onSelectOption={onSelectOption}
            itinerary={fullItinerary}
          />
        ))}

        <button className="w-full py-3 border-2 border-dashed border-gray-300 rounded-lg text-sm text-gray-500 hover:border-gray-400 hover:text-gray-700 transition-colors flex items-center justify-center gap-2">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Add something to this day
        </button>
      </div>
    </div>
  );
}
