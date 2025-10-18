import React, { useState } from 'react';
import { ActivitySlot, DayItinerary } from '@/lib/types';
import OptionSelector from './OptionSelector-carousel';

interface ActivityCardProps {
  activitySlot: ActivitySlot;
  onLocationClick?: (coordinates: [number, number]) => void;
  onSelectOption?: (activitySlotId: string, optionId: string) => void;
  itinerary: DayItinerary[];
}

export default function ActivityCard({ activitySlot, onLocationClick, onSelectOption, itinerary }: ActivityCardProps) {
  const [showOptionSelector, setShowOptionSelector] = useState(false);
  // Get the currently selected option
  const selectedOption = activitySlot.options.find(opt => opt.id === activitySlot.selectedOptionId);
  const isAgentPick = activitySlot.selectedOptionId === activitySlot.agentRecommendedOptionId;
  const isModified = !isAgentPick;
  const isLocked = activitySlot.locked;
  const hasMultipleOptions = activitySlot.options.length > 1;

  if (!selectedOption) return null;

  return (
    <div className={`bg-white border-2 rounded-lg p-4 hover:shadow-md transition-all ${
      isLocked ? 'border-gray-300 bg-gray-50' :
      isModified ? 'border-blue-400' :
      'border-gray-200'
    }`}>
      {/* Header with badges */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-2 flex-wrap">
          {activitySlot.time && (
            <span className="text-xs font-medium text-gray-700 bg-gray-100 px-2 py-1 rounded">
              {activitySlot.time}
            </span>
          )}
          {activitySlot.duration && (
            <span className="text-xs text-gray-500">{activitySlot.duration}</span>
          )}
          {isLocked && (
            <span className="flex items-center gap-1 text-xs font-medium text-gray-600 bg-gray-200 px-2 py-1 rounded">
              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
              Locked
            </span>
          )}
          {isAgentPick && !isLocked && (
            <span className="text-xs font-medium text-green-700 bg-green-100 px-2 py-1 rounded">
              Agent's Pick
            </span>
          )}
          {isModified && (
            <span className="text-xs font-medium text-blue-700 bg-blue-100 px-2 py-1 rounded">
              Modified
            </span>
          )}
          {selectedOption.availability === 'limited' && (
            <span className="text-xs font-medium text-amber-700 bg-amber-100 px-2 py-1 rounded">
              Limited Availability
            </span>
          )}
        </div>
      </div>

      {/* Title & Description */}
      <div className="mb-3">
        <h3 className="text-base font-semibold text-gray-900 mb-1">
          {activitySlot.title}
        </h3>
        <h4 className="text-sm font-medium text-gray-700 mb-2">
          {selectedOption.name}
        </h4>
        <p className="text-sm text-gray-600 leading-relaxed">
          {selectedOption.description}
        </p>
      </div>

      {/* Pricing */}
      <div className="flex items-center gap-4 mb-3 pb-3 border-b border-gray-200">
        <div>
          <span className="text-lg font-bold text-gray-900">
            ${selectedOption.price.toLocaleString()}
          </span>
        </div>
        <div className="text-xs text-gray-600">
          <span className="font-medium">+{selectedOption.statusCredits} credits</span>
          <span className="mx-1">•</span>
          <span className="font-medium">+{selectedOption.societePoints} pts</span>
        </div>
      </div>

      {/* Inclusions */}
      {selectedOption.inclusions.length > 0 && (
        <div className="mb-3">
          <p className="text-xs font-semibold text-gray-700 mb-1.5">Included:</p>
          <ul className="space-y-1">
            {selectedOption.inclusions.slice(0, 3).map((inclusion, idx) => (
              <li key={idx} className="flex items-start gap-1.5 text-xs text-gray-600">
                <svg className="w-3.5 h-3.5 text-green-600 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <span>{inclusion}</span>
              </li>
            ))}
            {selectedOption.inclusions.length > 3 && (
              <li className="text-xs text-blue-600 ml-5">
                +{selectedOption.inclusions.length - 3} more
              </li>
            )}
          </ul>
        </div>
      )}

      {/* Actions */}
      <div className="flex items-center justify-between gap-3 pt-3 border-t border-gray-100">
        <div className="flex items-center gap-3">
          {activitySlot.location && (
            <button
              onClick={() => onLocationClick?.(activitySlot.location!.coordinates)}
              className="flex items-center gap-1.5 text-xs text-blue-600 hover:text-blue-800 transition-colors"
            >
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              <span>{activitySlot.location.name}</span>
            </button>
          )}

          {selectedOption.supplier && (
            <div className="flex items-center gap-1 text-xs text-gray-500">
              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
              </svg>
              <span>{selectedOption.supplier.rating} • {selectedOption.supplier.name}</span>
            </div>
          )}
        </div>

        {hasMultipleOptions && !isLocked && (
          <button
            onClick={() => setShowOptionSelector(true)}
            className="text-xs font-medium text-blue-600 hover:text-blue-800 transition-colors"
          >
            Change Option ({activitySlot.options.length})
          </button>
        )}
      </div>

      {/* Agent notes */}
      {activitySlot.notes && (
        <div className="mt-3 pt-3 border-t border-gray-100">
          <div className="flex items-start gap-2">
            <div className="w-5 h-5 rounded-full bg-indigo-500 flex items-center justify-center text-white text-xs font-medium flex-shrink-0">
              {activitySlot.addedBy?.name?.[0] || 'A'}
            </div>
            <div className="flex-1">
              <p className="text-xs text-gray-700 italic">
                "{activitySlot.notes}"
              </p>
              {activitySlot.addedBy && (
                <p className="text-xs text-gray-500 mt-0.5">
                  — {activitySlot.addedBy.name}
                </p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Option Selector Modal */}
      {showOptionSelector && (
        <OptionSelector
          activitySlot={activitySlot}
          isOpen={showOptionSelector}
          onClose={() => setShowOptionSelector(false)}
          onSelectOption={(optionId) => {
            onSelectOption?.(activitySlot.id, optionId);
            setShowOptionSelector(false);
          }}
          itinerary={itinerary}
        />
      )}
    </div>
  );
}
