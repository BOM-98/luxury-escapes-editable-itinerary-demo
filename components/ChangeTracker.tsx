import React from 'react';
import { DayItinerary, ActivitySlot } from '@/lib/types';

interface ChangeTrackerProps {
  itinerary: DayItinerary[];
  onRevertItem: (activitySlotId: string) => void;
  onResetAll: () => void;
}

export default function ChangeTracker({ itinerary, onRevertItem, onResetAll }: ChangeTrackerProps) {
  // Find all modified items
  const modifiedItems: Array<{
    day: number;
    activitySlot: ActivitySlot;
    originalOption: any;
    selectedOption: any;
    priceDelta: number;
  }> = [];

  itinerary.forEach((day, dayIndex) => {
    day.activities.forEach((activitySlot) => {
      if (activitySlot.selectedOptionId !== activitySlot.agentRecommendedOptionId) {
        const originalOption = activitySlot.options.find(
          opt => opt.id === activitySlot.agentRecommendedOptionId
        );
        const selectedOption = activitySlot.options.find(
          opt => opt.id === activitySlot.selectedOptionId
        );

        if (originalOption && selectedOption) {
          modifiedItems.push({
            day: dayIndex + 1,
            activitySlot,
            originalOption,
            selectedOption,
            priceDelta: selectedOption.price - originalOption.price,
          });
        }
      }
    });
  });

  const totalPriceDelta = modifiedItems.reduce((sum, item) => sum + item.priceDelta, 0);
  const totalCreditsDelta = modifiedItems.reduce((sum, item) => {
    const original = item.originalOption;
    const selected = item.selectedOption;
    return sum + (selected.statusCredits - original.statusCredits);
  }, 0);
  const totalPointsDelta = modifiedItems.reduce((sum, item) => {
    const original = item.originalOption;
    const selected = item.selectedOption;
    return sum + (selected.societePoints - original.societePoints);
  }, 0);

  if (modifiedItems.length === 0) {
    return (
      <div className="bg-white border-2 border-gray-200 rounded-lg p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-bold text-gray-900">Your Changes</h3>
          <span className="bg-green-100 text-green-700 text-xs px-3 py-1 rounded-full font-semibold">
            All Agent's Picks
          </span>
        </div>
        <div className="text-center py-8">
          <svg className="w-16 h-16 text-gray-300 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <p className="text-gray-600 text-sm">
            You haven't made any changes yet.
          </p>
          <p className="text-gray-500 text-xs mt-1">
            Click "Change Option" on any activity to customize your trip.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white border-2 border-blue-300 rounded-lg overflow-hidden">
      {/* Header */}
      <div className="bg-blue-50 border-b-2 border-blue-200 px-6 py-4">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-lg font-bold text-blue-900">Your Changes</h3>
          <span className="bg-blue-600 text-white text-xs px-3 py-1 rounded-full font-semibold">
            {modifiedItems.length} {modifiedItems.length === 1 ? 'Item' : 'Items'} Modified
          </span>
        </div>
        <p className="text-sm text-blue-700">
          Review your customizations below
        </p>
      </div>

      {/* Summary */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border-b border-gray-200 px-6 py-4">
        <div className="grid grid-cols-3 gap-4 text-center">
          <div>
            <p className="text-xs text-gray-600 mb-1">Price Impact</p>
            <p className={`text-lg font-bold ${totalPriceDelta > 0 ? 'text-red-600' : totalPriceDelta < 0 ? 'text-green-600' : 'text-gray-900'}`}>
              {totalPriceDelta > 0 ? '+' : ''}{totalPriceDelta < 0 ? '-' : ''}${Math.abs(totalPriceDelta).toLocaleString()}
            </p>
          </div>
          <div>
            <p className="text-xs text-gray-600 mb-1">Credits</p>
            <p className={`text-lg font-bold ${totalCreditsDelta > 0 ? 'text-green-600' : totalCreditsDelta < 0 ? 'text-red-600' : 'text-gray-900'}`}>
              {totalCreditsDelta > 0 ? '+' : ''}{totalCreditsDelta}
            </p>
          </div>
          <div>
            <p className="text-xs text-gray-600 mb-1">Points</p>
            <p className={`text-lg font-bold ${totalPointsDelta > 0 ? 'text-green-600' : totalPointsDelta < 0 ? 'text-red-600' : 'text-gray-900'}`}>
              {totalPointsDelta > 0 ? '+' : ''}{totalPointsDelta}
            </p>
          </div>
        </div>
      </div>

      {/* Modified Items List */}
      <div className="max-h-96 overflow-y-auto">
        {modifiedItems.map((item, index) => (
          <div
            key={`${item.day}-${item.activitySlot.id}`}
            className={`px-6 py-4 ${index < modifiedItems.length - 1 ? 'border-b border-gray-200' : ''}`}
          >
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1">
                {/* Day & Title */}
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-xs font-semibold text-gray-500">DAY {item.day}</span>
                  <span className="text-xs text-gray-400">•</span>
                  <span className="text-sm font-bold text-gray-900">{item.activitySlot.title}</span>
                </div>

                {/* From → To */}
                <div className="space-y-2">
                  <div className="flex items-start gap-2">
                    <span className="text-xs text-gray-500 mt-1">From:</span>
                    <div className="flex-1">
                      <p className="text-sm text-gray-700 line-through">{item.originalOption.name}</p>
                      <p className="text-xs text-gray-500">${item.originalOption.price.toLocaleString()}</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="text-xs text-blue-600 mt-1">To:</span>
                    <div className="flex-1">
                      <p className="text-sm text-blue-900 font-semibold">{item.selectedOption.name}</p>
                      <div className="flex items-center gap-2">
                        <p className="text-xs text-gray-700">${item.selectedOption.price.toLocaleString()}</p>
                        {item.priceDelta !== 0 && (
                          <span className={`text-xs font-semibold ${item.priceDelta > 0 ? 'text-red-600' : 'text-green-600'}`}>
                            ({item.priceDelta > 0 ? '+' : ''}{item.priceDelta < 0 ? '-' : ''}${Math.abs(item.priceDelta).toLocaleString()})
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Revert Button */}
              <button
                onClick={() => onRevertItem(item.activitySlot.id)}
                className="flex-shrink-0 px-3 py-1.5 text-xs font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-100 border border-gray-300 rounded-lg transition-colors"
                title="Revert to agent's pick"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6" />
                </svg>
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Reset All Button */}
      <div className="border-t-2 border-gray-200 px-6 py-4 bg-gray-50">
        <button
          onClick={onResetAll}
          className="w-full px-4 py-2.5 text-sm font-semibold text-gray-700 hover:text-gray-900 bg-white hover:bg-gray-100 border-2 border-gray-300 rounded-lg transition-colors flex items-center justify-center gap-2"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
          Reset All to Agent's Picks
        </button>
      </div>
    </div>
  );
}
