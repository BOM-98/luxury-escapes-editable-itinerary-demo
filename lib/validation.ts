import { DayItinerary, ActivitySlot, Option } from './types';

export type ValidationWarning = {
  type: 'minimum_stay' | 'transfer_conflict' | 'availability' | 'date_constraint' | 'timing_conflict';
  severity: 'error' | 'warning' | 'info';
  message: string;
  affectedSlotId?: string;
  suggestion?: string;
};

export type ValidationResult = {
  isValid: boolean;
  warnings: ValidationWarning[];
};

/**
 * Validates an option selection before confirming
 */
export function validateOptionSelection(
  activitySlot: ActivitySlot,
  option: Option,
  itinerary: DayItinerary[]
): ValidationResult {
  const warnings: ValidationWarning[] = [];

  // Check availability
  if (option.availability === 'unavailable') {
    warnings.push({
      type: 'availability',
      severity: 'error',
      message: `${option.name} is currently unavailable for your dates.`,
      affectedSlotId: activitySlot.id,
      suggestion: 'Please choose another option or contact your agent for alternatives.'
    });
  }

  if (option.availability === 'limited') {
    warnings.push({
      type: 'availability',
      severity: 'warning',
      message: `${option.name} has limited availability. Book soon to secure your spot.`,
      affectedSlotId: activitySlot.id,
      suggestion: 'Consider confirming your selection quickly to avoid missing out.'
    });
  }

  // Check constraints
  if (activitySlot.constraints) {
    // Minimum nights validation
    if (activitySlot.type === 'hotel' && activitySlot.constraints.minNights) {
      const minNights = activitySlot.constraints.minNights;
      warnings.push({
        type: 'minimum_stay',
        severity: 'info',
        message: `This accommodation requires a minimum stay of ${minNights} ${minNights === 1 ? 'night' : 'nights'}.`,
        affectedSlotId: activitySlot.id,
        suggestion: 'Your current itinerary meets this requirement.'
      });
    }

    // Date constraints
    if (activitySlot.constraints.validDates && activitySlot.constraints.validDates.length > 0) {
      warnings.push({
        type: 'date_constraint',
        severity: 'info',
        message: `${option.name} is only available on specific dates.`,
        affectedSlotId: activitySlot.id,
        suggestion: 'Your agent has confirmed this option works with your travel dates.'
      });
    }
  }

  // Check for timing conflicts with same-day activities
  const timingConflicts = checkTimingConflicts(activitySlot, option, itinerary);
  warnings.push(...timingConflicts);

  // Check transfer compatibility
  const transferWarnings = checkTransferCompatibility(activitySlot, option, itinerary);
  warnings.push(...transferWarnings);

  const hasErrors = warnings.some(w => w.severity === 'error');

  return {
    isValid: !hasErrors,
    warnings
  };
}

/**
 * Check for timing conflicts on the same day
 */
function checkTimingConflicts(
  activitySlot: ActivitySlot,
  option: Option,
  itinerary: DayItinerary[]
): ValidationWarning[] {
  const warnings: ValidationWarning[] = [];

  // Find the day this activity belongs to
  const day = itinerary.find(d =>
    d.activities.some(a => a.id === activitySlot.id)
  );

  if (!day || !activitySlot.time) return warnings;

  // Check other activities on the same day
  const sameDay = day.activities.filter(a =>
    a.id !== activitySlot.id && a.time && a.type === 'activity'
  );

  // Simple time overlap check (would need more sophisticated logic in production)
  sameDay.forEach(otherActivity => {
    if (otherActivity.time) {
      // This is a simplified check - in production, would parse times and durations
      const sameMorning = activitySlot.time?.includes('AM') && otherActivity.time.includes('AM');
      const sameAfternoon = activitySlot.time?.includes('PM') && otherActivity.time.includes('PM');

      if (sameMorning || sameAfternoon) {
        warnings.push({
          type: 'timing_conflict',
          severity: 'warning',
          message: `This activity may overlap with ${otherActivity.title}.`,
          affectedSlotId: activitySlot.id,
          suggestion: 'Review your schedule or contact your agent to adjust timing.'
        });
      }
    }
  });

  return warnings;
}

/**
 * Check if transfers are still compatible
 */
function checkTransferCompatibility(
  activitySlot: ActivitySlot,
  option: Option,
  itinerary: DayItinerary[]
): ValidationWarning[] {
  const warnings: ValidationWarning[] = [];

  // Find if there are any transfers on the same day
  const day = itinerary.find(d =>
    d.activities.some(a => a.id === activitySlot.id)
  );

  if (!day) return warnings;

  const hasTransfers = day.activities.some(a => a.type === 'transfer');

  if (hasTransfers && activitySlot.type === 'hotel') {
    warnings.push({
      type: 'transfer_conflict',
      severity: 'info',
      message: 'Your agent has arranged transfers that may be affected by this change.',
      affectedSlotId: activitySlot.id,
      suggestion: 'The new location will be confirmed with your transfer provider.'
    });
  }

  return warnings;
}

/**
 * Validate entire itinerary for conflicts
 */
export function validateItinerary(itinerary: DayItinerary[]): ValidationResult {
  const warnings: ValidationWarning[] = [];

  itinerary.forEach((day, dayIndex) => {
    day.activities.forEach(activitySlot => {
      const selectedOption = activitySlot.options.find(
        opt => opt.id === activitySlot.selectedOptionId
      );

      if (selectedOption) {
        const result = validateOptionSelection(activitySlot, selectedOption, itinerary);
        warnings.push(...result.warnings);
      }
    });
  });

  const hasErrors = warnings.some(w => w.severity === 'error');

  return {
    isValid: !hasErrors,
    warnings
  };
}

/**
 * Check if a change requires agent approval
 */
export function requiresAgentApproval(
  activitySlot: ActivitySlot,
  newOptionId: string
): boolean {
  // If the option is not in the curated list, it requires approval
  const isInCuratedList = activitySlot.options.some(opt => opt.id === newOptionId);

  if (!isInCuratedList) {
    return true;
  }

  // If the activity is locked, changes require approval
  if (activitySlot.locked) {
    return true;
  }

  // Check if the option has severe availability issues
  const option = activitySlot.options.find(opt => opt.id === newOptionId);
  if (option?.availability === 'unavailable') {
    return true;
  }

  return false;
}
