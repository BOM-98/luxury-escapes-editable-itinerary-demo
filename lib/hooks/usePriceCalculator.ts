import { useMemo } from 'react';
import { DayItinerary, PricingBreakdown, LineItem, CategoryBreakdown, DayBreakdown } from '../types';

const CATEGORY_MAP: Record<string, LineItem['category']> = {
  hotel: 'accommodation',
  activity: 'activity',
  transfer: 'transfer',
  flight: 'other',
  experience: 'experience',
  dining: 'dining',
};

export function usePriceCalculator(itinerary: DayItinerary[]): PricingBreakdown {
  return useMemo(() => {
    let subtotal = 0;
    let statusCredits = 0;
    let societePoints = 0;
    const lineItems: LineItem[] = [];
    const dayBreakdowns: DayBreakdown[] = [];

    // Calculate line items and per-day breakdowns
    itinerary.forEach(day => {
      const dayItems: LineItem[] = [];
      let daySubtotal = 0;
      let dayStatusCredits = 0;
      let daySocietePoints = 0;

      day.activities.forEach(activitySlot => {
        const selectedOption = activitySlot.options.find(
          opt => opt.id === activitySlot.selectedOptionId
        );

        if (selectedOption) {
          const lineItem: LineItem = {
            id: activitySlot.id,
            name: selectedOption.name,
            category: CATEGORY_MAP[activitySlot.type] || 'other',
            dayNumber: day.dayNumber,
            price: selectedOption.price,
            statusCredits: selectedOption.statusCredits,
            societePoints: selectedOption.societePoints,
          };

          lineItems.push(lineItem);
          dayItems.push(lineItem);

          subtotal += selectedOption.price;
          statusCredits += selectedOption.statusCredits;
          societePoints += selectedOption.societePoints;

          daySubtotal += selectedOption.price;
          dayStatusCredits += selectedOption.statusCredits;
          daySocietePoints += selectedOption.societePoints;
        }
      });

      // Create day breakdown
      dayBreakdowns.push({
        dayNumber: day.dayNumber,
        date: day.date,
        items: dayItems,
        subtotal: daySubtotal,
        statusCredits: dayStatusCredits,
        societePoints: daySocietePoints,
      });
    });

    // Calculate category breakdowns
    const categoryMap = new Map<string, CategoryBreakdown>();

    lineItems.forEach(item => {
      const categoryName = getCategoryDisplayName(item.category);

      if (!categoryMap.has(categoryName)) {
        categoryMap.set(categoryName, {
          category: categoryName,
          items: [],
          subtotal: 0,
          statusCredits: 0,
          societePoints: 0,
        });
      }

      const categoryBreakdown = categoryMap.get(categoryName)!;
      categoryBreakdown.items.push(item);
      categoryBreakdown.subtotal += item.price;
      categoryBreakdown.statusCredits += item.statusCredits;
      categoryBreakdown.societePoints += item.societePoints;
    });

    const byCategory = Array.from(categoryMap.values()).sort((a, b) => b.subtotal - a.subtotal);

    // Calculate taxes and fees (example: 10% tax + $50 flat fee)
    const taxes = Math.round(subtotal * 0.10);
    const fees = 50;
    const total = subtotal + taxes + fees;

    return {
      subtotal,
      statusCredits,
      societePoints,
      taxes,
      fees,
      total,
      currency: 'USD',
      lineItems,
      byCategory,
      byDay: dayBreakdowns,
    };
  }, [itinerary]);
}

function getCategoryDisplayName(category: LineItem['category']): string {
  const displayNames: Record<LineItem['category'], string> = {
    accommodation: 'Accommodations',
    activity: 'Activities & Experiences',
    transfer: 'Transfers',
    experience: 'Activities & Experiences',
    dining: 'Dining',
    insurance: 'Travel Insurance',
    other: 'Other',
  };

  return displayNames[category] || 'Other';
}
