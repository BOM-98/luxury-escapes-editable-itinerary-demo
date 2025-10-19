import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { format } from 'date-fns';

interface VersionComparisonModalProps {
  isOpen: boolean;
  onClose: () => void;
  comparison: {
    changes: string[];
    priceDelta: number;
    creditsDelta: number;
    pointsDelta: number;
    olderVersion: {
      id: string;
      timestamp: Date;
      label?: string;
      summary: {
        subtotal: number;
        statusCredits: number;
        societePoints: number;
      };
    };
    newerVersion: {
      id: string;
      timestamp: Date;
      label?: string;
      summary: {
        subtotal: number;
        statusCredits: number;
        societePoints: number;
      };
    };
  } | null;
}

export default function VersionComparisonModal({
  isOpen,
  onClose,
  comparison,
}: VersionComparisonModalProps) {
  if (!comparison) return null;

  const { changes, priceDelta, creditsDelta, pointsDelta, olderVersion, newerVersion } = comparison;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle style={{
            fontSize: 'var(--le-text-xl)',
            fontWeight: 'var(--le-font-bold)',
            color: 'var(--le-gray-900)'
          }}>
            Version Comparison
          </DialogTitle>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto" style={{ padding: 'var(--le-space-4)' }}>
          {/* Version headers */}
          <div className="grid grid-cols-2 gap-4 mb-6">
            {/* Older version */}
            <div style={{
              padding: 'var(--le-space-4)',
              background: 'var(--le-gray-50)',
              borderRadius: 'var(--le-radius-lg)',
              border: '1px solid var(--le-gray-200)'
            }}>
              <div className="flex items-center gap-2 mb-2">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" style={{ color: 'var(--le-gray-600)' }}>
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span style={{
                  fontSize: 'var(--le-text-xs)',
                  fontWeight: 'var(--le-font-semibold)',
                  color: 'var(--le-gray-600)',
                  textTransform: 'uppercase'
                }}>
                  Older Version
                </span>
              </div>
              <p style={{
                fontSize: 'var(--le-text-base)',
                fontWeight: 'var(--le-font-semibold)',
                color: 'var(--le-gray-900)',
                marginBottom: 'var(--le-space-1)'
              }}>
                {olderVersion.label || 'Untitled Version'}
              </p>
              <p style={{
                fontSize: 'var(--le-text-xs)',
                color: 'var(--le-gray-500)',
                marginBottom: 'var(--le-space-3)'
              }}>
                {format(new Date(olderVersion.timestamp), 'MMM d, yyyy h:mm a')}
              </p>
              <div style={{
                display: 'flex',
                flexDirection: 'column',
                gap: 'var(--le-space-1)',
                fontSize: 'var(--le-text-sm)',
                color: 'var(--le-gray-700)'
              }}>
                <div className="flex justify-between">
                  <span>Price:</span>
                  <strong>${olderVersion.summary.subtotal.toLocaleString()}</strong>
                </div>
                <div className="flex justify-between">
                  <span>Credits:</span>
                  <strong>{olderVersion.summary.statusCredits.toLocaleString()}</strong>
                </div>
                <div className="flex justify-between">
                  <span>Points:</span>
                  <strong>{olderVersion.summary.societePoints.toLocaleString()}</strong>
                </div>
              </div>
            </div>

            {/* Newer version */}
            <div style={{
              padding: 'var(--le-space-4)',
              background: '#E6F7F5',
              borderRadius: 'var(--le-radius-lg)',
              border: '1px solid var(--le-primary)'
            }}>
              <div className="flex items-center gap-2 mb-2">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" style={{ color: 'var(--le-primary)' }}>
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span style={{
                  fontSize: 'var(--le-text-xs)',
                  fontWeight: 'var(--le-font-semibold)',
                  color: 'var(--le-primary)',
                  textTransform: 'uppercase'
                }}>
                  Newer Version
                </span>
              </div>
              <p style={{
                fontSize: 'var(--le-text-base)',
                fontWeight: 'var(--le-font-semibold)',
                color: 'var(--le-gray-900)',
                marginBottom: 'var(--le-space-1)'
              }}>
                {newerVersion.label || 'Untitled Version'}
              </p>
              <p style={{
                fontSize: 'var(--le-text-xs)',
                color: 'var(--le-gray-600)',
                marginBottom: 'var(--le-space-3)'
              }}>
                {format(new Date(newerVersion.timestamp), 'MMM d, yyyy h:mm a')}
              </p>
              <div style={{
                display: 'flex',
                flexDirection: 'column',
                gap: 'var(--le-space-1)',
                fontSize: 'var(--le-text-sm)',
                color: 'var(--le-gray-700)'
              }}>
                <div className="flex justify-between">
                  <span>Price:</span>
                  <strong>${newerVersion.summary.subtotal.toLocaleString()}</strong>
                </div>
                <div className="flex justify-between">
                  <span>Credits:</span>
                  <strong>{newerVersion.summary.statusCredits.toLocaleString()}</strong>
                </div>
                <div className="flex justify-between">
                  <span>Points:</span>
                  <strong>{newerVersion.summary.societePoints.toLocaleString()}</strong>
                </div>
              </div>
            </div>
          </div>

          {/* Delta summary */}
          <div style={{
            padding: 'var(--le-space-4)',
            background: 'var(--le-white)',
            borderRadius: 'var(--le-radius-lg)',
            border: '1px solid var(--le-gray-200)',
            marginBottom: 'var(--le-space-4)'
          }}>
            <h3 style={{
              fontSize: 'var(--le-text-base)',
              fontWeight: 'var(--le-font-semibold)',
              color: 'var(--le-gray-900)',
              marginBottom: 'var(--le-space-3)'
            }}>
              Summary of Changes
            </h3>
            <div className="grid grid-cols-3 gap-4">
              <div style={{
                textAlign: 'center',
                padding: 'var(--le-space-3)',
                background: priceDelta > 0 ? '#FEE2E2' : priceDelta < 0 ? '#DCFCE7' : 'var(--le-gray-50)',
                borderRadius: 'var(--le-radius-md)'
              }}>
                <p style={{
                  fontSize: 'var(--le-text-xs)',
                  color: 'var(--le-gray-600)',
                  marginBottom: 'var(--le-space-1)'
                }}>
                  Price Change
                </p>
                <p style={{
                  fontSize: 'var(--le-text-lg)',
                  fontWeight: 'var(--le-font-bold)',
                  color: priceDelta > 0 ? 'var(--le-error)' : priceDelta < 0 ? 'var(--le-success)' : 'var(--le-gray-700)'
                }}>
                  {priceDelta > 0 ? '+' : ''}{priceDelta === 0 ? '' : '$'}{priceDelta.toLocaleString()}
                </p>
              </div>

              <div style={{
                textAlign: 'center',
                padding: 'var(--le-space-3)',
                background: creditsDelta > 0 ? '#DCFCE7' : creditsDelta < 0 ? '#FEE2E2' : 'var(--le-gray-50)',
                borderRadius: 'var(--le-radius-md)'
              }}>
                <p style={{
                  fontSize: 'var(--le-text-xs)',
                  color: 'var(--le-gray-600)',
                  marginBottom: 'var(--le-space-1)'
                }}>
                  Credits Change
                </p>
                <p style={{
                  fontSize: 'var(--le-text-lg)',
                  fontWeight: 'var(--le-font-bold)',
                  color: creditsDelta > 0 ? 'var(--le-success)' : creditsDelta < 0 ? 'var(--le-error)' : 'var(--le-gray-700)'
                }}>
                  {creditsDelta > 0 ? '+' : ''}{creditsDelta.toLocaleString()}
                </p>
              </div>

              <div style={{
                textAlign: 'center',
                padding: 'var(--le-space-3)',
                background: pointsDelta > 0 ? '#DCFCE7' : pointsDelta < 0 ? '#FEE2E2' : 'var(--le-gray-50)',
                borderRadius: 'var(--le-radius-md)'
              }}>
                <p style={{
                  fontSize: 'var(--le-text-xs)',
                  color: 'var(--le-gray-600)',
                  marginBottom: 'var(--le-space-1)'
                }}>
                  Points Change
                </p>
                <p style={{
                  fontSize: 'var(--le-text-lg)',
                  fontWeight: 'var(--le-font-bold)',
                  color: pointsDelta > 0 ? 'var(--le-success)' : pointsDelta < 0 ? 'var(--le-error)' : 'var(--le-gray-700)'
                }}>
                  {pointsDelta > 0 ? '+' : ''}{pointsDelta.toLocaleString()}
                </p>
              </div>
            </div>
          </div>

          {/* Detailed changes */}
          <div style={{
            padding: 'var(--le-space-4)',
            background: 'var(--le-white)',
            borderRadius: 'var(--le-radius-lg)',
            border: '1px solid var(--le-gray-200)'
          }}>
            <h3 style={{
              fontSize: 'var(--le-text-base)',
              fontWeight: 'var(--le-font-semibold)',
              color: 'var(--le-gray-900)',
              marginBottom: 'var(--le-space-3)'
            }}>
              Detailed Changes ({changes.length})
            </h3>

            {changes.length === 0 ? (
              <div style={{
                textAlign: 'center',
                padding: 'var(--le-space-6)',
                color: 'var(--le-gray-500)'
              }}>
                <svg className="w-12 h-12 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <p style={{ fontSize: 'var(--le-text-sm)' }}>No changes between these versions</p>
              </div>
            ) : (
              <ul className="space-y-2">
                {changes.map((change, index) => (
                  <li
                    key={index}
                    style={{
                      padding: 'var(--le-space-3)',
                      background: '#E6F7F5',
                      borderLeft: '3px solid var(--le-primary)',
                      borderRadius: 'var(--le-radius-md)',
                      fontSize: 'var(--le-text-sm)',
                      color: 'var(--le-gray-700)'
                    }}
                  >
                    <div className="flex items-start gap-2">
                      <svg className="w-4 h-4 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" style={{ color: 'var(--le-primary)' }}>
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                      </svg>
                      <span>{change}</span>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>

        {/* Footer */}
        <div style={{
          padding: 'var(--le-space-4)',
          borderTop: '1px solid var(--le-gray-200)',
          background: 'var(--le-white)'
        }}>
          <button
            onClick={onClose}
            className="le-button-primary w-full"
            style={{
              padding: 'var(--le-space-3)'
            }}
          >
            Close
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
