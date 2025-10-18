'use client';

import React from 'react';
import { DayItinerary } from '@/lib/types';

interface DateCalendarProps {
  itinerary: DayItinerary[];
  selectedDay?: number;
  onSelectDay?: (dayNumber: number) => void;
}

export default function DateCalendar({ itinerary, selectedDay, onSelectDay }: DateCalendarProps) {
  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return {
      day: date.toLocaleDateString('en-US', { weekday: 'short' }).toUpperCase(),
      number: date.getDate(),
      month: date.toLocaleDateString('en-US', { month: 'short' }),
    };
  };

  return (
    <div className="le-date-calendar">
      {itinerary.map((day) => {
        const { day: dayName, number, month } = formatDate(day.date);
        const isActive = selectedDay === day.dayNumber;

        return (
          <div
            key={day.dayNumber}
            className={`le-date-item ${isActive ? 'active' : ''}`}
            onClick={() => onSelectDay?.(day.dayNumber)}
          >
            <div className="le-date-number">{number}</div>
            <div className="le-date-day">{dayName}</div>
            <div className="le-date-day" style={{ fontSize: '10px', marginTop: '2px' }}>{month}</div>
          </div>
        );
      })}
    </div>
  );
}
