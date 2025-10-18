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
    <div style={{
      background: 'var(--le-white)',
      borderBottom: '1px solid var(--le-gray-200)',
      borderLeft: isModified ? '3px solid var(--le-primary)' : 'none',
      padding: 'var(--le-space-4)',
      opacity: isLocked ? '0.9' : '1',
    }}>
      {/* Header with badges */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-2 flex-wrap">
          {activitySlot.time && (
            <span className="le-tag" style={{
              background: 'var(--le-gray-200)',
              color: 'var(--le-gray-700)',
              fontWeight: 'var(--le-font-medium)',
              borderRadius: 'var(--le-radius-sm)'
            }}>
              {activitySlot.time}
            </span>
          )}
          {activitySlot.duration && (
            <span style={{
              fontSize: 'var(--le-text-xs)',
              color: 'var(--le-gray-500)'
            }}>
              {activitySlot.duration}
            </span>
          )}
          {isLocked && (
            <span className="le-tag flex items-center gap-1" style={{
              background: 'var(--le-gray-200)',
              color: 'var(--le-gray-600)',
              borderRadius: 'var(--le-radius-sm)'
            }}>
              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
              Locked
            </span>
          )}
          {isAgentPick && !isLocked && (
            <span className="le-tag" style={{
              background: '#E6F4EA',
              color: '#137333',
              borderRadius: 'var(--le-radius-sm)'
            }}>
              Agent's Pick
            </span>
          )}
          {isModified && (
            <span className="le-tag primary" style={{
              borderRadius: 'var(--le-radius-sm)'
            }}>
              Modified
            </span>
          )}
          {selectedOption.availability === 'limited' && (
            <span className="le-tag" style={{
              background: '#FEF3C7',
              color: '#92400E',
              borderRadius: 'var(--le-radius-sm)'
            }}>
              Limited Availability
            </span>
          )}
        </div>
      </div>

      {/* Title & Description */}
      <div style={{ marginBottom: 'var(--le-space-3)' }}>
        <h3 className="le-text-heading" style={{
          fontSize: 'var(--le-text-base)',
          marginBottom: 'var(--le-space-1)'
        }}>
          {activitySlot.title}
        </h3>
        <h4 style={{
          fontSize: 'var(--le-text-sm)',
          fontWeight: 'var(--le-font-medium)',
          color: 'var(--le-gray-700)',
          marginBottom: 'var(--le-space-2)'
        }}>
          {selectedOption.name}
        </h4>
        <p className="le-text-body" style={{
          fontSize: 'var(--le-text-sm)'
        }}>
          {selectedOption.description}
        </p>
      </div>

      {/* Pricing */}
      <div className="flex items-center gap-4 le-divider" style={{
        marginBottom: 'var(--le-space-3)',
        paddingBottom: 'var(--le-space-3)',
        borderBottom: '1px solid'
      }}>
        <div>
          <span style={{
            fontSize: 'var(--le-text-lg)',
            fontWeight: 'var(--le-font-bold)',
            color: 'var(--le-gray-900)'
          }}>
            ${selectedOption.price.toLocaleString()}
          </span>
        </div>
        <div style={{
          fontSize: 'var(--le-text-xs)',
          color: 'var(--le-gray-600)'
        }}>
          <span style={{ fontWeight: 'var(--le-font-medium)' }}>+{selectedOption.statusCredits} credits</span>
          <span className="mx-1">•</span>
          <span style={{ fontWeight: 'var(--le-font-medium)' }}>+{selectedOption.societePoints} pts</span>
        </div>
      </div>

      {/* Inclusions */}
      {selectedOption.inclusions.length > 0 && (
        <div style={{ marginBottom: 'var(--le-space-3)' }}>
          <p style={{
            fontSize: 'var(--le-text-xs)',
            fontWeight: 'var(--le-font-semibold)',
            color: 'var(--le-gray-700)',
            marginBottom: 'var(--le-space-1)'
          }}>
            Included:
          </p>
          <ul style={{ display: 'flex', flexDirection: 'column', gap: 'var(--le-space-1)' }}>
            {selectedOption.inclusions.slice(0, 3).map((inclusion, idx) => (
              <li key={idx} className="flex items-start gap-1.5" style={{
                fontSize: 'var(--le-text-xs)',
                color: 'var(--le-gray-600)'
              }}>
                <svg className="w-3.5 h-3.5 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" style={{ color: 'var(--le-success)' }}>
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <span>{inclusion}</span>
              </li>
            ))}
            {selectedOption.inclusions.length > 3 && (
              <li style={{
                fontSize: 'var(--le-text-xs)',
                color: 'var(--le-primary)',
                marginLeft: '20px'
              }}>
                +{selectedOption.inclusions.length - 3} more
              </li>
            )}
          </ul>
        </div>
      )}

      {/* Actions */}
      <div className="flex items-center justify-between gap-3 le-divider" style={{
        paddingTop: 'var(--le-space-3)',
        borderTop: '1px solid'
      }}>
        <div className="flex items-center gap-3">
          {activitySlot.location && (
            <button
              onClick={() => onLocationClick?.(activitySlot.location!.coordinates)}
              className="flex items-center gap-1.5"
              style={{
                fontSize: 'var(--le-text-xs)',
                color: 'var(--le-primary)',
                background: 'transparent',
                border: 'none',
                cursor: 'pointer',
                transition: 'color var(--le-transition-base)'
              }}
              onMouseEnter={(e) => e.currentTarget.style.color = 'var(--le-primary-dark)'}
              onMouseLeave={(e) => e.currentTarget.style.color = 'var(--le-primary)'}
            >
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              <span>{activitySlot.location.name}</span>
            </button>
          )}

          {selectedOption.supplier && (
            <div className="flex items-center gap-1" style={{
              fontSize: 'var(--le-text-xs)',
              color: 'var(--le-gray-500)'
            }}>
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
            style={{
              fontSize: 'var(--le-text-xs)',
              fontWeight: 'var(--le-font-medium)',
              color: 'var(--le-primary)',
              background: 'transparent',
              border: 'none',
              cursor: 'pointer',
              transition: 'color var(--le-transition-base)'
            }}
            onMouseEnter={(e) => e.currentTarget.style.color = 'var(--le-primary-dark)'}
            onMouseLeave={(e) => e.currentTarget.style.color = 'var(--le-primary)'}
          >
            Change Option ({activitySlot.options.length})
          </button>
        )}
      </div>

      {/* Agent notes */}
      {activitySlot.notes && (
        <div className="le-divider" style={{
          marginTop: 'var(--le-space-3)',
          paddingTop: 'var(--le-space-3)',
          borderTop: '1px solid'
        }}>
          <div className="flex items-start gap-2">
            <div className="flex items-center justify-center flex-shrink-0" style={{
              width: '20px',
              height: '20px',
              borderRadius: 'var(--le-radius-full)',
              background: 'var(--le-primary)',
              color: 'var(--le-white)',
              fontSize: 'var(--le-text-xs)',
              fontWeight: 'var(--le-font-medium)'
            }}>
              {activitySlot.addedBy?.name?.[0] || 'A'}
            </div>
            <div className="flex-1">
              <p style={{
                fontSize: 'var(--le-text-xs)',
                color: 'var(--le-gray-700)',
                fontStyle: 'italic'
              }}>
                "{activitySlot.notes}"
              </p>
              {activitySlot.addedBy && (
                <p style={{
                  fontSize: 'var(--le-text-xs)',
                  color: 'var(--le-gray-500)',
                  marginTop: '2px'
                }}>
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
