import { useState, useCallback, useEffect, useRef } from 'react';
import { DayItinerary, TripSummary, ItineraryVersion } from '@/lib/types';

interface UseVersionHistoryProps {
  itinerary: DayItinerary[];
  summary: TripSummary;
  onRestore: (itinerary: DayItinerary[]) => void;
}

export function useVersionHistory({ itinerary, summary, onRestore }: UseVersionHistoryProps) {
  const [versions, setVersions] = useState<ItineraryVersion[]>([]);
  const [currentVersionId, setCurrentVersionId] = useState<string>('initial');
  const [autoSaveEnabled, setAutoSaveEnabled] = useState(true);
  const [lastAutoSaveAt, setLastAutoSaveAt] = useState<Date | undefined>();
  const autoSaveTimerRef = useRef<NodeJS.Timeout | undefined>(undefined);

  // Generate unique version ID
  const generateVersionId = useCallback(() => {
    return `v-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }, []);

  // Calculate changes between two itineraries
  const calculateChanges = useCallback((oldItinerary: DayItinerary[], newItinerary: DayItinerary[]): string[] => {
    const changes: string[] = [];

    newItinerary.forEach((newDay, dayIndex) => {
      const oldDay = oldItinerary[dayIndex];
      if (!oldDay) return;

      newDay.activities.forEach((newActivity, activityIndex) => {
        const oldActivity = oldDay.activities[activityIndex];
        if (!oldActivity) return;

        if (newActivity.selectedOptionId !== oldActivity.selectedOptionId) {
          const newOption = newActivity.options.find(opt => opt.id === newActivity.selectedOptionId);
          const oldOption = oldActivity.options.find(opt => opt.id === oldActivity.selectedOptionId);

          if (newOption && oldOption) {
            changes.push(`Day ${newDay.dayNumber}: Changed ${newActivity.title} from "${oldOption.name}" to "${newOption.name}"`);
          }
        }
      });
    });

    return changes;
  }, []);

  // Create initial version on mount
  useEffect(() => {
    if (versions.length === 0) {
      const initialVersion: ItineraryVersion = {
        id: 'initial',
        timestamp: new Date(),
        itinerary: JSON.parse(JSON.stringify(itinerary)),
        summary: JSON.parse(JSON.stringify(summary)),
        label: 'Original Itinerary',
        note: "Agent's recommended itinerary",
        isAutoSave: false,
        changesSinceLastVersion: [],
      };
      setVersions([initialVersion]);
      setCurrentVersionId('initial');
    }
  }, []); // Only run once on mount

  // Create a new version snapshot
  const createVersion = useCallback((label?: string, note?: string, isAutoSave = false) => {
    const lastVersion = versions[versions.length - 1];
    const changes = lastVersion ? calculateChanges(lastVersion.itinerary, itinerary) : [];

    // Don't create version if nothing changed
    if (changes.length === 0 && versions.length > 0) {
      return null;
    }

    const newVersion: ItineraryVersion = {
      id: generateVersionId(),
      timestamp: new Date(),
      itinerary: JSON.parse(JSON.stringify(itinerary)),
      summary: JSON.parse(JSON.stringify(summary)),
      label,
      note,
      isAutoSave,
      changesSinceLastVersion: changes,
    };

    setVersions(prev => [...prev, newVersion]);
    setCurrentVersionId(newVersion.id);

    if (isAutoSave) {
      setLastAutoSaveAt(new Date());
    }

    return newVersion;
  }, [itinerary, summary, versions, generateVersionId, calculateChanges]);

  // Auto-save functionality (saves every 30 seconds if changes detected)
  useEffect(() => {
    if (!autoSaveEnabled) return;

    // Clear existing timer
    if (autoSaveTimerRef.current) {
      clearTimeout(autoSaveTimerRef.current);
    }

    // Set new timer for 30 seconds
    autoSaveTimerRef.current = setTimeout(() => {
      createVersion(undefined, undefined, true);
    }, 30000); // 30 seconds

    return () => {
      if (autoSaveTimerRef.current) {
        clearTimeout(autoSaveTimerRef.current);
      }
    };
  }, [itinerary, autoSaveEnabled, createVersion]);

  // Revert to a specific version
  const revertToVersion = useCallback((versionId: string) => {
    const version = versions.find(v => v.id === versionId);
    if (!version) return;

    // Restore the itinerary from this version
    onRestore(JSON.parse(JSON.stringify(version.itinerary)));
    setCurrentVersionId(versionId);

    // Create a new version marking this as a revert
    const revertVersion: ItineraryVersion = {
      id: generateVersionId(),
      timestamp: new Date(),
      itinerary: JSON.parse(JSON.stringify(version.itinerary)),
      summary: JSON.parse(JSON.stringify(version.summary)),
      label: `Reverted to: ${version.label || 'Version'}`,
      note: `Restored from version at ${version.timestamp.toLocaleString()}`,
      isAutoSave: false,
      changesSinceLastVersion: [`Reverted to version from ${version.timestamp.toLocaleString()}`],
    };

    setVersions(prev => [...prev, revertVersion]);
    setCurrentVersionId(revertVersion.id);
  }, [versions, onRestore, generateVersionId]);

  // Delete a version
  const deleteVersion = useCallback((versionId: string) => {
    // Don't allow deleting the initial version or current version
    if (versionId === 'initial' || versionId === currentVersionId) return;

    setVersions(prev => prev.filter(v => v.id !== versionId));
  }, [currentVersionId]);

  // Update version label/note
  const updateVersionLabel = useCallback((versionId: string, label?: string, note?: string) => {
    setVersions(prev => prev.map(v =>
      v.id === versionId
        ? { ...v, label, note }
        : v
    ));
  }, []);

  // Get version by ID
  const getVersion = useCallback((versionId: string) => {
    return versions.find(v => v.id === versionId);
  }, [versions]);

  // Get current version
  const getCurrentVersion = useCallback(() => {
    return versions.find(v => v.id === currentVersionId);
  }, [versions, currentVersionId]);

  // Compare two versions
  const compareVersions = useCallback((versionId1: string, versionId2: string) => {
    const v1 = versions.find(v => v.id === versionId1);
    const v2 = versions.find(v => v.id === versionId2);

    if (!v1 || !v2) return null;

    const changes = calculateChanges(v1.itinerary, v2.itinerary);
    const priceDelta = v2.summary.subtotal - v1.summary.subtotal;
    const creditsDelta = v2.summary.statusCredits - v1.summary.statusCredits;
    const pointsDelta = v2.summary.societePoints - v1.summary.societePoints;

    return {
      changes,
      priceDelta,
      creditsDelta,
      pointsDelta,
      olderVersion: v1,
      newerVersion: v2,
    };
  }, [versions, calculateChanges]);

  return {
    versions,
    currentVersionId,
    autoSaveEnabled,
    lastAutoSaveAt,
    createVersion,
    revertToVersion,
    deleteVersion,
    updateVersionLabel,
    getVersion,
    getCurrentVersion,
    compareVersions,
    setAutoSaveEnabled,
  };
}
