import React, { useState } from 'react';
import { ItineraryVersion } from '@/lib/types';
import { formatDistanceToNow } from 'date-fns';

interface VersionHistoryProps {
  versions: ItineraryVersion[];
  currentVersionId: string;
  onRevertToVersion: (versionId: string) => void;
  onDeleteVersion: (versionId: string) => void;
  onUpdateLabel: (versionId: string, label?: string, note?: string) => void;
  onCompareVersions: (versionId1: string, versionId2: string) => void;
  onCreateVersion: (label?: string, note?: string) => void;
  autoSaveEnabled: boolean;
  lastAutoSaveAt?: Date;
}

export default function VersionHistory({
  versions,
  currentVersionId,
  onRevertToVersion,
  onDeleteVersion,
  onUpdateLabel,
  onCompareVersions,
  onCreateVersion,
  autoSaveEnabled,
  lastAutoSaveAt,
}: VersionHistoryProps) {
  const [editingVersionId, setEditingVersionId] = useState<string | null>(null);
  const [editLabel, setEditLabel] = useState('');
  const [editNote, setEditNote] = useState('');
  const [compareMode, setCompareMode] = useState(false);
  const [selectedVersions, setSelectedVersions] = useState<string[]>([]);

  // Sort versions by timestamp (newest first)
  const sortedVersions = [...versions].sort((a, b) =>
    new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
  );

  const handleSaveLabel = (versionId: string) => {
    onUpdateLabel(versionId, editLabel || undefined, editNote || undefined);
    setEditingVersionId(null);
    setEditLabel('');
    setEditNote('');
  };

  const handleStartEdit = (version: ItineraryVersion) => {
    setEditingVersionId(version.id);
    setEditLabel(version.label || '');
    setEditNote(version.note || '');
  };

  const toggleCompareSelection = (versionId: string) => {
    setSelectedVersions(prev => {
      if (prev.includes(versionId)) {
        return prev.filter(id => id !== versionId);
      } else if (prev.length < 2) {
        return [...prev, versionId];
      } else {
        // Replace oldest selection
        return [prev[1], versionId];
      }
    });
  };

  const handleCompare = () => {
    if (selectedVersions.length === 2) {
      onCompareVersions(selectedVersions[0], selectedVersions[1]);
      setCompareMode(false);
      setSelectedVersions([]);
    }
  };

  return (
    <div className="flex flex-col h-full" style={{ background: 'var(--le-white)' }}>
      {/* Header */}
      <div style={{
        padding: 'var(--le-space-5)',
        borderBottom: '1px solid var(--le-gray-200)',
        background: 'var(--le-white)'
      }}>
        <div className="flex items-center justify-between mb-3">
          <h2 style={{
            fontSize: 'var(--le-text-lg)',
            fontWeight: 'var(--le-font-bold)',
            color: 'var(--le-gray-900)'
          }}>
            Version History
          </h2>

          {/* Auto-save indicator */}
          <div className="flex items-center gap-2">
            <svg
              className="w-4 h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              style={{ color: autoSaveEnabled ? 'var(--le-success)' : 'var(--le-gray-400)' }}
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            <span style={{
              fontSize: 'var(--le-text-xs)',
              color: autoSaveEnabled ? 'var(--le-success)' : 'var(--le-gray-500)'
            }}>
              Auto-save {autoSaveEnabled ? 'ON' : 'OFF'}
            </span>
          </div>
        </div>

        {lastAutoSaveAt && (
          <p style={{
            fontSize: 'var(--le-text-xs)',
            color: 'var(--le-gray-500)',
            marginBottom: 'var(--le-space-3)'
          }}>
            Last saved {formatDistanceToNow(lastAutoSaveAt, { addSuffix: true })}
          </p>
        )}

        {/* Action buttons */}
        <div className="flex gap-2">
          <button
            onClick={() => onCreateVersion()}
            className="le-button-primary flex-1"
            style={{
              fontSize: 'var(--le-text-xs)',
              padding: 'var(--le-space-2) var(--le-space-3)'
            }}
          >
            Save Version
          </button>
          <button
            onClick={() => {
              setCompareMode(!compareMode);
              setSelectedVersions([]);
            }}
            className="le-button-secondary flex-1"
            style={{
              fontSize: 'var(--le-text-xs)',
              padding: 'var(--le-space-2) var(--le-space-3)'
            }}
          >
            {compareMode ? 'Cancel' : 'Compare'}
          </button>
        </div>

        {compareMode && (
          <div style={{
            marginTop: 'var(--le-space-3)',
            padding: 'var(--le-space-3)',
            background: '#E6F7F5',
            borderRadius: 'var(--le-radius-md)',
            border: '1px solid var(--le-primary)'
          }}>
            <p style={{
              fontSize: 'var(--le-text-xs)',
              color: 'var(--le-gray-700)',
              marginBottom: 'var(--le-space-2)'
            }}>
              Select 2 versions to compare ({selectedVersions.length}/2 selected)
            </p>
            {selectedVersions.length === 2 && (
              <button
                onClick={handleCompare}
                className="le-button-primary w-full"
                style={{
                  fontSize: 'var(--le-text-xs)',
                  padding: 'var(--le-space-2)'
                }}
              >
                Compare Selected Versions
              </button>
            )}
          </div>
        )}
      </div>

      {/* Version Timeline */}
      <div
        className="flex-1 overflow-y-auto"
        style={{ padding: 'var(--le-space-4)' }}
      >
        {sortedVersions.length === 0 ? (
          <div style={{
            textAlign: 'center',
            padding: 'var(--le-space-8)',
            color: 'var(--le-gray-500)'
          }}>
            <svg className="w-12 h-12 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <p style={{ fontSize: 'var(--le-text-sm)' }}>No versions saved yet</p>
          </div>
        ) : (
          <div className="space-y-4">
            {sortedVersions.map((version, index) => {
              const isCurrentVersion = version.id === currentVersionId;
              const isInitial = version.id === 'initial';
              const isEditing = editingVersionId === version.id;
              const isSelected = selectedVersions.includes(version.id);

              return (
                <div
                  key={version.id}
                  style={{
                    position: 'relative',
                    paddingLeft: 'var(--le-space-6)',
                    paddingBottom: index < sortedVersions.length - 1 ? 'var(--le-space-4)' : '0',
                    borderLeft: index < sortedVersions.length - 1 ? '2px solid var(--le-gray-200)' : 'none'
                  }}
                >
                  {/* Timeline dot */}
                  <div
                    className="absolute left-0 top-0"
                    style={{
                      width: '12px',
                      height: '12px',
                      marginLeft: '-7px',
                      borderRadius: 'var(--le-radius-full)',
                      background: isCurrentVersion ? 'var(--le-primary)' : isSelected ? 'var(--le-warning)' : 'var(--le-gray-300)',
                      border: `2px solid ${isCurrentVersion ? 'var(--le-primary)' : 'var(--le-white)'}`,
                      boxShadow: '0 0 0 2px var(--le-gray-200)'
                    }}
                  />

                  {/* Version card */}
                  <div
                    className={compareMode ? 'cursor-pointer' : ''}
                    onClick={() => compareMode && toggleCompareSelection(version.id)}
                    style={{
                      background: isCurrentVersion ? '#E6F7F5' : isSelected ? '#FEF3C7' : 'var(--le-white)',
                      border: `1px solid ${isCurrentVersion ? 'var(--le-primary)' : isSelected ? 'var(--le-warning)' : 'var(--le-gray-200)'}`,
                      borderRadius: 'var(--le-radius-md)',
                      padding: 'var(--le-space-3)',
                      transition: 'all var(--le-transition-base)'
                    }}
                  >
                    {/* Header with badges */}
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-center gap-2 flex-wrap">
                        {isCurrentVersion && (
                          <span
                            className="le-tag"
                            style={{
                              background: 'var(--le-primary)',
                              color: 'var(--le-white)',
                              fontSize: 'var(--le-text-xs)',
                              padding: '2px var(--le-space-2)',
                              borderRadius: 'var(--le-radius-sm)'
                            }}
                          >
                            Current
                          </span>
                        )}
                        {version.isAutoSave && (
                          <span
                            className="le-tag"
                            style={{
                              background: 'var(--le-gray-200)',
                              color: 'var(--le-gray-600)',
                              fontSize: 'var(--le-text-xs)',
                              padding: '2px var(--le-space-2)',
                              borderRadius: 'var(--le-radius-sm)'
                            }}
                          >
                            Auto-saved
                          </span>
                        )}
                      </div>

                      {/* Actions dropdown */}
                      {!isEditing && !compareMode && (
                        <div className="flex items-center gap-1">
                          {!isCurrentVersion && (
                            <button
                              onClick={() => onRevertToVersion(version.id)}
                              title="Revert to this version"
                              style={{
                                padding: 'var(--le-space-1)',
                                background: 'transparent',
                                border: 'none',
                                cursor: 'pointer',
                                color: 'var(--le-primary)'
                              }}
                            >
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6" />
                              </svg>
                            </button>
                          )}
                          <button
                            onClick={() => handleStartEdit(version)}
                            title="Edit label"
                            style={{
                              padding: 'var(--le-space-1)',
                              background: 'transparent',
                              border: 'none',
                              cursor: 'pointer',
                              color: 'var(--le-gray-600)'
                            }}
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                            </svg>
                          </button>
                          {!isInitial && !isCurrentVersion && (
                            <button
                              onClick={() => onDeleteVersion(version.id)}
                              title="Delete version"
                              style={{
                                padding: 'var(--le-space-1)',
                                background: 'transparent',
                                border: 'none',
                                cursor: 'pointer',
                                color: 'var(--le-error)'
                              }}
                            >
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                              </svg>
                            </button>
                          )}
                        </div>
                      )}
                    </div>

                    {/* Edit mode */}
                    {isEditing ? (
                      <div className="space-y-2">
                        <input
                          type="text"
                          value={editLabel}
                          onChange={(e) => setEditLabel(e.target.value)}
                          placeholder="Version label (optional)"
                          className="w-full"
                          style={{
                            fontSize: 'var(--le-text-sm)',
                            padding: 'var(--le-space-2)',
                            border: '1px solid var(--le-gray-300)',
                            borderRadius: 'var(--le-radius-md)',
                            outline: 'none'
                          }}
                        />
                        <textarea
                          value={editNote}
                          onChange={(e) => setEditNote(e.target.value)}
                          placeholder="Notes (optional)"
                          rows={2}
                          className="w-full"
                          style={{
                            fontSize: 'var(--le-text-xs)',
                            padding: 'var(--le-space-2)',
                            border: '1px solid var(--le-gray-300)',
                            borderRadius: 'var(--le-radius-md)',
                            outline: 'none',
                            resize: 'vertical'
                          }}
                        />
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleSaveLabel(version.id)}
                            className="le-button-primary flex-1"
                            style={{
                              fontSize: 'var(--le-text-xs)',
                              padding: 'var(--le-space-2)'
                            }}
                          >
                            Save
                          </button>
                          <button
                            onClick={() => {
                              setEditingVersionId(null);
                              setEditLabel('');
                              setEditNote('');
                            }}
                            className="le-button-secondary flex-1"
                            style={{
                              fontSize: 'var(--le-text-xs)',
                              padding: 'var(--le-space-2)'
                            }}
                          >
                            Cancel
                          </button>
                        </div>
                      </div>
                    ) : (
                      <>
                        {/* Version label and timestamp */}
                        <div style={{ marginBottom: 'var(--le-space-2)' }}>
                          <p style={{
                            fontSize: 'var(--le-text-sm)',
                            fontWeight: 'var(--le-font-semibold)',
                            color: 'var(--le-gray-900)',
                            marginBottom: '2px'
                          }}>
                            {version.label || 'Untitled Version'}
                          </p>
                          <p style={{
                            fontSize: 'var(--le-text-xs)',
                            color: 'var(--le-gray-500)'
                          }}>
                            {formatDistanceToNow(new Date(version.timestamp), { addSuffix: true })}
                          </p>
                        </div>

                        {/* Version note */}
                        {version.note && (
                          <p style={{
                            fontSize: 'var(--le-text-xs)',
                            color: 'var(--le-gray-600)',
                            marginBottom: 'var(--le-space-2)',
                            fontStyle: 'italic'
                          }}>
                            {version.note}
                          </p>
                        )}

                        {/* Changes since last version */}
                        {version.changesSinceLastVersion && version.changesSinceLastVersion.length > 0 && (
                          <div style={{
                            marginTop: 'var(--le-space-2)',
                            paddingTop: 'var(--le-space-2)',
                            borderTop: '1px solid var(--le-gray-200)'
                          }}>
                            <p style={{
                              fontSize: 'var(--le-text-xs)',
                              fontWeight: 'var(--le-font-semibold)',
                              color: 'var(--le-gray-700)',
                              marginBottom: 'var(--le-space-1)'
                            }}>
                              Changes:
                            </p>
                            <ul className="space-y-1">
                              {version.changesSinceLastVersion.slice(0, 3).map((change, idx) => (
                                <li
                                  key={idx}
                                  style={{
                                    fontSize: 'var(--le-text-xs)',
                                    color: 'var(--le-gray-600)',
                                    paddingLeft: 'var(--le-space-3)',
                                    position: 'relative'
                                  }}
                                >
                                  <span
                                    style={{
                                      position: 'absolute',
                                      left: '0',
                                      color: 'var(--le-primary)'
                                    }}
                                  >
                                    •
                                  </span>
                                  {change}
                                </li>
                              ))}
                              {version.changesSinceLastVersion.length > 3 && (
                                <li style={{
                                  fontSize: 'var(--le-text-xs)',
                                  color: 'var(--le-primary)',
                                  paddingLeft: 'var(--le-space-3)'
                                }}>
                                  +{version.changesSinceLastVersion.length - 3} more changes
                                </li>
                              )}
                            </ul>
                          </div>
                        )}

                        {/* Pricing snapshot */}
                        <div style={{
                          marginTop: 'var(--le-space-2)',
                          paddingTop: 'var(--le-space-2)',
                          borderTop: '1px solid var(--le-gray-200)',
                          display: 'flex',
                          gap: 'var(--le-space-3)',
                          fontSize: 'var(--le-text-xs)',
                          color: 'var(--le-gray-600)'
                        }}>
                          <span>
                            <strong>${version.summary.subtotal.toLocaleString()}</strong>
                          </span>
                          <span>•</span>
                          <span>{version.summary.statusCredits} credits</span>
                          <span>•</span>
                          <span>{version.summary.societePoints} pts</span>
                        </div>
                      </>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
