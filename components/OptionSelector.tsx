'use client';

import React, { useState } from 'react';
import { ActivitySlot, Option } from '@/lib/types';

interface OptionSelectorProps {
  activitySlot: ActivitySlot;
  isOpen: boolean;
  onClose: () => void;
  onSelectOption: (optionId: string) => void;
}

export default function OptionSelector({
  activitySlot,
  isOpen,
  onClose,
  onSelectOption,
}: OptionSelectorProps) {
  const [selectedOptionId, setSelectedOptionId] = useState(activitySlot.selectedOptionId);
  const [compareMode, setCompareMode] = useState(false);
  const [lightboxImage, setLightboxImage] = useState<string | null>(null);

  if (!isOpen) return null;

  const currentOption = activitySlot.options.find(opt => opt.id === activitySlot.selectedOptionId);
  const agentOption = activitySlot.options.find(opt => opt.id === activitySlot.agentRecommendedOptionId);
  const previewOption = activitySlot.options.find(opt => opt.id === selectedOptionId);

  const handleSelectOption = () => {
    onSelectOption(selectedOptionId);
    onClose();
  };

  const calculateDelta = (option: Option) => {
    if (!currentOption) return { price: 0, credits: 0, points: 0 };
    return {
      price: option.price - currentOption.price,
      credits: option.statusCredits - currentOption.statusCredits,
      points: option.societePoints - currentOption.societePoints,
    };
  };

  const formatDelta = (value: number, prefix: string = '$') => {
    if (value === 0) return '—';
    const sign = value > 0 ? '+' : '';
    return `${sign}${prefix === '$' ? prefix : ''}${value.toLocaleString()}${prefix !== '$' ? prefix : ''}`;
  };

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black bg-opacity-50 z-50 transition-opacity"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="fixed inset-4 md:inset-10 bg-white rounded-lg shadow-2xl z-50 flex flex-col overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between bg-gray-50">
          <div className="flex-1">
            <h2 className="text-xl font-bold text-gray-900">{activitySlot.title}</h2>
            <p className="text-sm text-gray-600 mt-1">
              Choose from {activitySlot.options.length} curated options
            </p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => setCompareMode(!compareMode)}
              className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
                compareMode
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              {compareMode ? '✓ Comparing' : 'Compare All'}
            </button>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-200 rounded-lg transition-colors"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {/* Agent's Note */}
          {activitySlot.notes && (
            <div className="mb-6 bg-indigo-50 border border-indigo-200 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-full bg-indigo-600 flex items-center justify-center text-white text-sm font-medium flex-shrink-0">
                  {activitySlot.addedBy?.name?.[0] || 'A'}
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-indigo-900 mb-1">Agent's Recommendation</p>
                  <p className="text-sm text-indigo-700 italic">"{activitySlot.notes}"</p>
                  {activitySlot.addedBy && (
                    <p className="text-xs text-indigo-600 mt-1">— {activitySlot.addedBy.name}</p>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Options Grid */}
          <div className={`grid gap-6 ${compareMode ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3' : 'grid-cols-1'}`}>
            {activitySlot.options.map((option) => {
              const isSelected = option.id === selectedOptionId;
              const isCurrentSelection = option.id === activitySlot.selectedOptionId;
              const isAgentPick = option.id === activitySlot.agentRecommendedOptionId;
              const delta = calculateDelta(option);

              return (
                <div
                  key={option.id}
                  className={`border-2 rounded-lg overflow-hidden transition-all cursor-pointer ${
                    isSelected
                      ? 'border-blue-600 shadow-lg'
                      : isCurrentSelection
                      ? 'border-green-400'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                  onClick={() => setSelectedOptionId(option.id)}
                >
                  {/* Image */}
                  {option.photos.length > 0 && (
                    <div className="relative h-48 bg-gray-200">
                      <img
                        src={option.photos[0]}
                        alt={option.name}
                        className="w-full h-full object-cover"
                      />
                      {option.photos.length > 1 && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setLightboxImage(option.photos[0]);
                          }}
                          className="absolute bottom-2 right-2 bg-black bg-opacity-60 text-white px-2 py-1 rounded text-xs hover:bg-opacity-80"
                        >
                          +{option.photos.length - 1} more
                        </button>
                      )}
                      {isAgentPick && (
                        <div className="absolute top-2 left-2 bg-green-600 text-white px-3 py-1 rounded-full text-xs font-semibold flex items-center gap-1">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
                          Agent's Pick
                        </div>
                      )}
                      {isCurrentSelection && !isAgentPick && (
                        <div className="absolute top-2 left-2 bg-blue-600 text-white px-3 py-1 rounded-full text-xs font-semibold">
                          Currently Selected
                        </div>
                      )}
                    </div>
                  )}

                  <div className="p-4">
                    {/* Radio Button */}
                    <div className="flex items-start gap-3 mb-3">
                      <input
                        type="radio"
                        checked={isSelected}
                        onChange={() => setSelectedOptionId(option.id)}
                        className="mt-1 w-4 h-4 text-blue-600 focus:ring-blue-500"
                      />
                      <div className="flex-1">
                        <h3 className="font-semibold text-gray-900 text-lg mb-1">{option.name}</h3>
                        <p className="text-sm text-gray-600 leading-relaxed">{option.description}</p>
                      </div>
                    </div>

                    {/* Pricing */}
                    <div className="bg-gray-50 rounded-lg p-3 mb-3">
                      <div className="flex items-baseline justify-between mb-2">
                        <span className="text-2xl font-bold text-gray-900">
                          ${option.price.toLocaleString()}
                        </span>
                        {delta.price !== 0 && (
                          <span className={`text-sm font-semibold ${delta.price > 0 ? 'text-red-600' : 'text-green-600'}`}>
                            {formatDelta(delta.price)}
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-3 text-xs text-gray-600">
                        <div className="flex items-center gap-1">
                          <span className="font-medium">+{option.statusCredits} credits</span>
                          {delta.credits !== 0 && (
                            <span className={delta.credits > 0 ? 'text-green-600' : 'text-red-600'}>
                              ({formatDelta(delta.credits, ' ')})
                            </span>
                          )}
                        </div>
                        <span>•</span>
                        <div className="flex items-center gap-1">
                          <span className="font-medium">+{option.societePoints} pts</span>
                          {delta.points !== 0 && (
                            <span className={delta.points > 0 ? 'text-green-600' : 'text-red-600'}>
                              ({formatDelta(delta.points, ' ')})
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Highlights */}
                    {option.highlights && option.highlights.length > 0 && (
                      <div className="mb-3">
                        <div className="flex flex-wrap gap-1.5">
                          {option.highlights.map((highlight, idx) => (
                            <span
                              key={idx}
                              className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded"
                            >
                              {highlight}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Inclusions */}
                    <div className="mb-3">
                      <p className="text-xs font-semibold text-gray-700 mb-2">Included:</p>
                      <ul className="space-y-1">
                        {option.inclusions.slice(0, 4).map((inclusion, idx) => (
                          <li key={idx} className="flex items-start gap-2 text-xs text-gray-600">
                            <svg className="w-3.5 h-3.5 text-green-600 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                            <span>{inclusion}</span>
                          </li>
                        ))}
                        {option.inclusions.length > 4 && (
                          <li className="text-xs text-blue-600 ml-5">
                            +{option.inclusions.length - 4} more included
                          </li>
                        )}
                      </ul>
                    </div>

                    {/* Supplier & Availability */}
                    <div className="flex items-center justify-between pt-3 border-t border-gray-200">
                      {option.supplier && (
                        <div className="flex items-center gap-1 text-xs text-gray-600">
                          <svg className="w-3.5 h-3.5 text-yellow-500" fill="currentColor" viewBox="0 0 20 20">
                            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                          </svg>
                          <span className="font-medium">{option.supplier.rating}</span>
                          <span className="text-gray-400">•</span>
                          <span>{option.supplier.name}</span>
                        </div>
                      )}
                      {option.availability === 'limited' && (
                        <span className="text-xs font-medium text-amber-600 bg-amber-50 px-2 py-1 rounded">
                          Limited availability
                        </span>
                      )}
                    </div>

                    {/* Meal Plan / Room Type */}
                    {(option.roomType || option.mealPlan) && (
                      <div className="mt-3 pt-3 border-t border-gray-200 text-xs text-gray-600">
                        {option.roomType && <div>Room: {option.roomType}</div>}
                        {option.mealPlan && <div>Meals: {option.mealPlan}</div>}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-gray-200 bg-gray-50 flex items-center justify-between">
          <div className="text-sm text-gray-600">
            {previewOption && selectedOptionId !== activitySlot.selectedOptionId && (
              <div>
                <span className="font-medium">Change to:</span> {previewOption.name}
                <span className="ml-2">
                  ({formatDelta(calculateDelta(previewOption).price)} from current)
                </span>
              </div>
            )}
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={onClose}
              className="px-4 py-2 text-gray-700 hover:bg-gray-200 rounded-lg transition-colors font-medium"
            >
              Cancel
            </button>
            <button
              onClick={handleSelectOption}
              disabled={selectedOptionId === activitySlot.selectedOptionId}
              className={`px-6 py-2 rounded-lg font-medium transition-colors ${
                selectedOptionId === activitySlot.selectedOptionId
                  ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  : 'bg-blue-600 text-white hover:bg-blue-700'
              }`}
            >
              {selectedOptionId === activitySlot.selectedOptionId ? 'Already Selected' : 'Confirm Selection'}
            </button>
          </div>
        </div>
      </div>

      {/* Photo Lightbox */}
      {lightboxImage && (
        <div
          className="fixed inset-0 bg-black bg-opacity-90 z-[60] flex items-center justify-center p-4"
          onClick={() => setLightboxImage(null)}
        >
          <img
            src={lightboxImage}
            alt="Full size"
            className="max-w-full max-h-full object-contain"
          />
          <button
            onClick={() => setLightboxImage(null)}
            className="absolute top-4 right-4 text-white p-2 hover:bg-white hover:bg-opacity-20 rounded-lg"
          >
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      )}
    </>
  );
}
