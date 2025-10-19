'use client';

import React, { useState } from 'react';
import { ActivitySlot, Option, DayItinerary } from '@/lib/types';
import { validateOptionSelection, ValidationWarning } from '@/lib/validation';
import ValidationWarningModal from './ValidationWarningModal';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
  type CarouselApi,
} from '@/components/ui/carousel';

interface OptionSelectorProps {
  activitySlot: ActivitySlot;
  isOpen: boolean;
  onClose: () => void;
  onSelectOption: (optionId: string) => void;
  itinerary: DayItinerary[];
}

export default function OptionSelector({
  activitySlot,
  isOpen,
  onClose,
  onSelectOption,
  itinerary,
}: OptionSelectorProps) {
  const [api, setApi] = useState<CarouselApi>();
  const [current, setCurrent] = useState(0);
  const [validationWarnings, setValidationWarnings] = useState<ValidationWarning[]>([]);
  const [showValidationModal, setShowValidationModal] = useState(false);
  const [pendingOptionId, setPendingOptionId] = useState<string | null>(null);

  React.useEffect(() => {
    if (!api) return;

    setCurrent(api.selectedScrollSnap());
    api.on("select", () => {
      setCurrent(api.selectedScrollSnap());
    });
  }, [api]);

  const currentOption = activitySlot.options.find(opt => opt.id === activitySlot.selectedOptionId);

  const calculateDelta = (option: Option) => {
    if (!currentOption) return { price: 0, credits: 0, points: 0 };
    return {
      price: option.price - currentOption.price,
      credits: option.statusCredits - currentOption.statusCredits,
      points: option.societePoints - currentOption.societePoints,
    };
  };

  const formatDelta = (value: number, prefix: string = '$') => {
    if (value === 0) return null;
    const sign = value > 0 ? '+' : '';
    const color = value > 0 ? 'text-red-600' : 'text-green-600';
    return (
      <span className={`${color} font-semibold`}>
        {sign}{prefix === '$' ? prefix : ''}{value.toLocaleString()}{prefix !== '$' ? prefix : ''}
      </span>
    );
  };

  const handleSelectOption = (optionId: string) => {
    const option = activitySlot.options.find(opt => opt.id === optionId);
    if (!option) return;

    // Validate the selection
    const validationResult = validateOptionSelection(activitySlot, option, itinerary);

    if (validationResult.warnings.length > 0) {
      setValidationWarnings(validationResult.warnings);
      setPendingOptionId(optionId);
      setShowValidationModal(true);
    } else {
      onSelectOption(optionId);
      onClose();
    }
  };

  const handleValidationProceed = () => {
    if (pendingOptionId) {
      onSelectOption(pendingOptionId);
      setPendingOptionId(null);
    }
    setShowValidationModal(false);
    setValidationWarnings([]);
    onClose();
  };

  const handleValidationCancel = () => {
    setPendingOptionId(null);
    setShowValidationModal(false);
    setValidationWarnings([]);
  };

  const totalItems = activitySlot.options.length;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[85vh] overflow-hidden p-0">
        <DialogHeader className="px-6 pt-6 pb-4" style={{ borderBottom: '1px solid var(--le-gray-200)' }}>
          <DialogTitle style={{
            fontSize: 'var(--le-text-xl)',
            fontWeight: 'var(--le-font-bold)',
            color: 'var(--le-gray-900)'
          }}>
            {activitySlot.title}
          </DialogTitle>
          <p style={{
            fontSize: 'var(--le-text-sm)',
            color: 'var(--le-gray-600)',
            marginTop: 'var(--le-space-1)'
          }}>
            Option {current + 1} of {activitySlot.options.length}
          </p>
        </DialogHeader>

        <div className="px-2 pb-6 overflow-hidden">
          <Carousel
            setApi={setApi}
            className="w-full"
            opts={{
              align: "start",
              loop: false,
            }}
          >
            <CarouselContent className="-ml-2">
              {/* All Options */}
              {activitySlot.options.map((option, index) => {
                const isCurrentSelection = option.id === activitySlot.selectedOptionId;
                const isAgentPick = option.id === activitySlot.agentRecommendedOptionId;
                const delta = calculateDelta(option);

                return (
                  <CarouselItem key={option.id} className="pl-2 basis-full">
                    <div className="px-2">
                      <div style={{
                        border: isCurrentSelection ? '2px solid var(--le-primary)' : '2px solid var(--le-gray-200)',
                        background: isCurrentSelection ? '#E6F7F5' : 'var(--le-white)',
                        borderRadius: 'var(--le-radius-lg)',
                        overflow: 'hidden'
                      }}>
                        {/* Image */}
                        {option.photos[0] && (
                          <div className="relative h-48 bg-gray-200">
                            <img
                              src={option.photos[0]}
                              alt={option.name}
                              className="w-full h-full object-cover"
                            />
                            {/* Badges */}
                            <div className="absolute top-3 left-3 flex flex-col gap-2">
                              {isAgentPick && (
                                <span style={{
                                  background: '#137333',
                                  color: 'var(--le-white)',
                                  padding: 'var(--le-space-1) var(--le-space-3)',
                                  borderRadius: 'var(--le-radius-full)',
                                  fontSize: 'var(--le-text-xs)',
                                  fontWeight: 'var(--le-font-semibold)',
                                  boxShadow: 'var(--le-shadow-lg)'
                                }}>
                                  ⭐ Agent's Pick
                                </span>
                              )}
                              {isCurrentSelection && (
                                <span style={{
                                  background: 'var(--le-primary)',
                                  color: 'var(--le-white)',
                                  padding: 'var(--le-space-1) var(--le-space-3)',
                                  borderRadius: 'var(--le-radius-full)',
                                  fontSize: 'var(--le-text-xs)',
                                  fontWeight: 'var(--le-font-semibold)',
                                  boxShadow: 'var(--le-shadow-lg)'
                                }}>
                                  ✓ Currently Selected
                                </span>
                              )}
                            </div>
                            {option.availability === 'limited' && (
                              <div className="absolute top-3 right-3" style={{
                                background: '#FEF3C7',
                                color: '#92400E',
                                padding: 'var(--le-space-1) var(--le-space-3)',
                                borderRadius: 'var(--le-radius-full)',
                                fontSize: 'var(--le-text-xs)',
                                fontWeight: 'var(--le-font-semibold)',
                                boxShadow: 'var(--le-shadow-lg)'
                              }}>
                                Limited Availability
                              </div>
                            )}
                            {option.photos.length > 1 && (
                              <div className="absolute bottom-3 right-3 bg-black bg-opacity-70 text-white px-2 py-1 rounded text-xs">
                                📷 {option.photos.length} photos
                              </div>
                            )}
                          </div>
                        )}

                        {/* Agent's Note - only show on agent's pick */}
                        {isAgentPick && activitySlot.notes && (
                          <div style={{
                            background: '#E6F4EA',
                            borderLeft: '4px solid #137333',
                            padding: 'var(--le-space-4)',
                            margin: '0 var(--le-space-5)',
                            marginTop: 'var(--le-space-4)'
                          }}>
                            <div className="flex items-start gap-3">
                              <div style={{
                                width: '40px',
                                height: '40px',
                                borderRadius: 'var(--le-radius-full)',
                                background: '#137333',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                color: 'var(--le-white)',
                                fontSize: 'var(--le-text-sm)',
                                fontWeight: 'var(--le-font-bold)',
                                flexShrink: 0
                              }}>
                                {activitySlot.addedBy?.name?.[0] || 'A'}
                              </div>
                              <div className="flex-1">
                                <p style={{
                                  fontSize: 'var(--le-text-xs)',
                                  fontWeight: 'var(--le-font-semibold)',
                                  color: '#137333',
                                  marginBottom: 'var(--le-space-1)'
                                }}>
                                  {activitySlot.addedBy?.name || 'Your Travel Agent'}'s Note
                                </p>
                                <p style={{
                                  fontSize: 'var(--le-text-sm)',
                                  color: '#0F5323',
                                  fontStyle: 'italic'
                                }}>
                                  "{activitySlot.notes}"
                                </p>
                              </div>
                            </div>
                          </div>
                        )}

                        <div className="p-5">
                          {/* Title & Description */}
                          <h3 className="font-bold text-gray-900 text-xl mb-2">{option.name}</h3>
                          <p className="text-sm text-gray-600 mb-4 leading-relaxed">{option.description}</p>

                          {/* Pricing with Deltas */}
                          <div style={{
                            background: 'var(--le-gray-50)',
                            borderRadius: 'var(--le-radius-lg)',
                            padding: 'var(--le-space-4)',
                            marginBottom: 'var(--le-space-4)',
                            border: '1px solid var(--le-gray-200)'
                          }}>
                            <div className="flex items-baseline justify-between mb-2">
                              <div>
                                <span style={{
                                  fontSize: 'var(--le-text-3xl)',
                                  fontWeight: 'var(--le-font-bold)',
                                  color: 'var(--le-gray-900)'
                                }}>
                                  ${option.price.toLocaleString()}
                                </span>
                                {delta.price !== 0 && (
                                  <span className="ml-3" style={{ fontSize: 'var(--le-text-sm)' }}>
                                    {formatDelta(delta.price)}
                                  </span>
                                )}
                              </div>
                            </div>
                            <div className="flex items-center gap-4" style={{ fontSize: 'var(--le-text-sm)' }}>
                              <div>
                                <span style={{
                                  fontWeight: 'var(--le-font-semibold)',
                                  color: 'var(--le-gray-700)'
                                }}>
                                  +{option.statusCredits}
                                </span>
                                <span style={{
                                  color: 'var(--le-gray-500)',
                                  marginLeft: 'var(--le-space-1)'
                                }}>
                                  credits
                                </span>
                                {delta.credits !== 0 && (
                                  <span className="ml-2" style={{ fontSize: 'var(--le-text-xs)' }}>
                                    {formatDelta(delta.credits, '')}
                                  </span>
                                )}
                              </div>
                              <span style={{ color: 'var(--le-gray-400)' }}>•</span>
                              <div>
                                <span style={{
                                  fontWeight: 'var(--le-font-semibold)',
                                  color: 'var(--le-gray-700)'
                                }}>
                                  +{option.societePoints}
                                </span>
                                <span style={{
                                  color: 'var(--le-gray-500)',
                                  marginLeft: 'var(--le-space-1)'
                                }}>
                                  pts
                                </span>
                                {delta.points !== 0 && (
                                  <span className="ml-2" style={{ fontSize: 'var(--le-text-xs)' }}>
                                    {formatDelta(delta.points, '')}
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>

                          {/* Highlights */}
                          {option.highlights && option.highlights.length > 0 && (
                            <div className="mb-4">
                              <div className="flex flex-wrap gap-2">
                                {option.highlights.map((highlight, idx) => (
                                  <span
                                    key={idx}
                                    style={{
                                      fontSize: 'var(--le-text-xs)',
                                      background: '#E6F7F5',
                                      color: 'var(--le-primary)',
                                      padding: 'var(--le-space-1) var(--le-space-2)',
                                      borderRadius: 'var(--le-radius-full)'
                                    }}
                                  >
                                    ✨ {highlight}
                                  </span>
                                ))}
                              </div>
                            </div>
                          )}

                          {/* Inclusions */}
                          <div className="mb-4">
                            <p style={{
                              fontSize: 'var(--le-text-xs)',
                              fontWeight: 'var(--le-font-bold)',
                              color: 'var(--le-gray-900)',
                              marginBottom: 'var(--le-space-2)'
                            }}>
                              What's Included:
                            </p>
                            <div className="space-y-1">
                              {option.inclusions.slice(0, 4).map((inclusion, idx) => (
                                <div key={idx} className="flex items-start gap-2" style={{
                                  fontSize: 'var(--le-text-xs)',
                                  color: 'var(--le-gray-700)'
                                }}>
                                  <svg className="w-4 h-4 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" style={{ color: 'var(--le-success)' }}>
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                  </svg>
                                  <span>{inclusion}</span>
                                </div>
                              ))}
                              {option.inclusions.length > 4 && (
                                <p style={{
                                  fontSize: 'var(--le-text-xs)',
                                  color: 'var(--le-primary)',
                                  marginLeft: '24px'
                                }}>
                                  +{option.inclusions.length - 4} more included
                                </p>
                              )}
                            </div>
                          </div>

                          {/* Supplier */}
                          {option.supplier && (
                            <div className="flex items-center gap-2 text-xs text-gray-600 mb-4 pb-4 border-b">
                              <svg className="w-4 h-4 text-yellow-500" fill="currentColor" viewBox="0 0 20 20">
                                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                              </svg>
                              <span className="font-bold">{option.supplier.rating}</span>
                              <span>•</span>
                              <span className="font-medium">{option.supplier.name}</span>
                            </div>
                          )}

                          {/* Selection Button */}
                          <button
                            onClick={() => handleSelectOption(option.id)}
                            disabled={isCurrentSelection}
                            className="w-full"
                            style={{
                              padding: 'var(--le-space-3)',
                              background: isCurrentSelection ? '#E6F7F5' : 'var(--le-charcoal)',
                              color: isCurrentSelection ? 'var(--le-primary)' : 'var(--le-white)',
                              border: isCurrentSelection ? '2px solid var(--le-primary)' : 'none',
                              borderRadius: 'var(--le-radius-md)',
                              fontWeight: 'var(--le-font-semibold)',
                              fontSize: 'var(--le-text-sm)',
                              cursor: isCurrentSelection ? 'default' : 'pointer',
                              transition: 'background var(--le-transition-base)'
                            }}
                            onMouseEnter={(e) => {
                              if (!isCurrentSelection) {
                                e.currentTarget.style.background = 'var(--le-charcoal-light)';
                              }
                            }}
                            onMouseLeave={(e) => {
                              if (!isCurrentSelection) {
                                e.currentTarget.style.background = 'var(--le-charcoal)';
                              }
                            }}
                          >
                            {isCurrentSelection ? '✓ Currently Selected' : 'Select This Option'}
                          </button>

                          {/* Price Change Summary */}
                          {!isCurrentSelection && delta.price !== 0 && (
                            <p className="text-center text-xs mt-2 text-gray-600">
                              This will {delta.price > 0 ? 'increase' : 'decrease'} your total by{' '}
                              <span className={delta.price > 0 ? 'text-red-600 font-bold' : 'text-green-600 font-bold'}>
                                {formatDelta(delta.price)}
                              </span>
                            </p>
                          )}
                        </div>
                      </div>

                      {/* Progress Dots */}
                      <div className="flex justify-center gap-2 mt-4">
                        {Array.from({ length: totalItems }).map((_, idx) => (
                          <button
                            key={idx}
                            className="h-1.5 rounded-full transition-all"
                            style={{
                              width: idx === current ? '24px' : '6px',
                              background: idx === current ? 'var(--le-charcoal)' : 'var(--le-gray-300)'
                            }}
                            onClick={() => api?.scrollTo(idx)}
                          />
                        ))}
                      </div>
                    </div>
                  </CarouselItem>
                );
              })}
            </CarouselContent>
            <CarouselPrevious className="left-2" />
            <CarouselNext className="right-2" />
          </Carousel>
        </div>
      </DialogContent>

      {/* Validation Warning Modal */}
      <ValidationWarningModal
        isOpen={showValidationModal}
        warnings={validationWarnings}
        onClose={handleValidationCancel}
        onProceed={handleValidationProceed}
        onCancel={handleValidationCancel}
      />
    </Dialog>
  );
}
