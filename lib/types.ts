export interface Location {
  id: string;
  name: string;
  coordinates: [number, number]; // [lat, lng]
}

export interface Supplier {
  name: string;
  rating?: number;
  reviewCount?: number;
}

export type AvailabilityStatus = 'available' | 'limited' | 'unavailable';

export type ActivityType = 'hotel' | 'activity' | 'transfer' | 'flight' | 'experience' | 'dining';

export interface Option {
  id: string;
  name: string;
  description: string;
  price: number;
  statusCredits: number;
  societePoints: number;
  photos: string[];
  inclusions: string[];
  exclusions: string[];
  cancellationPolicy: string;
  availability: AvailabilityStatus;
  supplier?: Supplier;
  roomType?: string; // For hotels
  mealPlan?: string; // For hotels
  highlights?: string[]; // Key selling points
}

export interface Constraints {
  minNights?: number;
  maxNights?: number;
  validDates?: string[];
  maxParticipants?: number;
  minParticipants?: number;
}

export interface ActivitySlot {
  id: string;
  title: string; // e.g., "Ubud Accommodation" or "Cooking Class"
  type: ActivityType;
  time?: string;
  duration?: string;
  options: Option[]; // 2-3 curated options
  selectedOptionId: string; // current customer selection
  agentRecommendedOptionId: string; // agent's original pick
  locked: boolean; // if true, customer cannot change
  location?: Location;
  constraints?: Constraints;
  notes?: string; // Agent notes or special instructions
  addedBy?: {
    name: string;
    avatar?: string;
  };
}

export interface DayItinerary {
  date: string;
  dayNumber: number;
  activities: ActivitySlot[];
}

export interface LineItem {
  id: string;
  name: string;
  category: 'accommodation' | 'activity' | 'transfer' | 'experience' | 'dining' | 'insurance' | 'other';
  dayNumber?: number;
  price: number;
  statusCredits: number;
  societePoints: number;
}

export interface CategoryBreakdown {
  category: string;
  items: LineItem[];
  subtotal: number;
  statusCredits: number;
  societePoints: number;
}

export interface DayBreakdown {
  dayNumber: number;
  date: string;
  items: LineItem[];
  subtotal: number;
  statusCredits: number;
  societePoints: number;
}

export interface PricingBreakdown {
  subtotal: number;
  statusCredits: number;
  societePoints: number;
  taxes?: number;
  fees?: number;
  total?: number;
  currency?: string;
  // Enhanced breakdown details
  byCategory?: CategoryBreakdown[];
  byDay?: DayBreakdown[];
  lineItems?: LineItem[];
}

export interface ChangeLogEntry {
  id: string;
  timestamp: Date;
  activitySlotId: string;
  fieldChanged: 'selectedOption' | 'dates' | 'participants' | 'notes';
  previousValue: string;
  newValue: string;
  priceDelta: number;
  statusCreditsDelta: number;
  societePointsDelta: number;
}

export interface TripSummary extends PricingBreakdown {
  originalPricing: PricingBreakdown; // Agent's original quote
  changeCount: number; // Number of modifications
  lastModified?: Date;
  quoteExpiresAt?: Date; // When the price lock expires
  isPriceLocked?: boolean; // Whether customer locked the price
  priceLockedAt?: Date; // When price was locked
  priceLockedBy?: string; // Who locked the price
}

export interface Trip {
  id: string;
  title: string;
  location: string;
  creator: string;
  createdAt: Date;
  expiresAt?: Date; // Quote expiry
  stats: {
    days: number;
    stays: number;
    experiences: number;
  };
  itinerary: DayItinerary[];
  summary: TripSummary;
  changeLog: ChangeLogEntry[];
  status: 'draft' | 'sent' | 'modified' | 'approved' | 'booked';
}

// Agent Request Types
export type AgentRequestType = 'custom_option' | 'date_change' | 'destination_add' | 'group_change' | 'special_request' | 'general';
export type AgentRequestStatus = 'pending' | 'approved' | 'rejected' | 'requires_info';

export interface AgentRequest {
  id: string;
  type: AgentRequestType;
  subject: string;
  message: string;
  createdAt: Date;
  status: AgentRequestStatus;
  customerChanges?: string[]; // List of modified items
  priceDelta?: number;
  agentResponse?: {
    message: string;
    respondedAt: Date;
    updatedItinerary?: boolean;
  };
}

// Version History Types
export interface ItineraryVersion {
  id: string;
  timestamp: Date;
  itinerary: DayItinerary[];
  summary: TripSummary;
  label?: string; // Custom label like "After hotel upgrade"
  note?: string; // Optional description
  isAutoSave?: boolean; // Distinguish auto-saves from manual saves
  changesSinceLastVersion?: string[]; // Summary of what changed
}

export interface VersionHistoryState {
  versions: ItineraryVersion[];
  currentVersionId: string;
  autoSaveEnabled: boolean;
  lastAutoSaveAt?: Date;
}

// Legacy type for backward compatibility
export interface Activity {
  id: string;
  title: string;
  description: string;
  time?: string;
  duration?: string;
  location?: Location;
  icon?: string;
  moreInfoLink?: string;
  addedBy?: {
    name: string;
    avatar?: string;
  };
}
