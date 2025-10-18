import React from 'react';
import { DayItinerary } from '@/lib/types';
import DaySection from './DaySection';

interface ItinerarySidebarProps {
  itinerary: DayItinerary[];
  onLocationClick?: (coordinates: [number, number]) => void;
  onSelectOption?: (activitySlotId: string, optionId: string) => void;
}

export default function ItinerarySidebar({ itinerary, onLocationClick, onSelectOption }: ItinerarySidebarProps) {
  return (
    <div className="w-full h-full overflow-y-auto border-r" style={{
      background: 'var(--le-white)',
      borderColor: 'var(--le-gray-200)'
    }}>
      {itinerary.map((day) => (
        <DaySection
          key={day.dayNumber}
          day={day}
          onLocationClick={onLocationClick}
          onSelectOption={onSelectOption}
          fullItinerary={itinerary}
        />
      ))}
    </div>
  );
}
