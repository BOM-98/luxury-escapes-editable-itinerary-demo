# Editable Itinerary Platform - Product Specification

## Vision

Transform static PDF proposals into **live, editable itineraries** that combine agent curation with customer autonomy. Think "Google Docs for luxury travel planning."

---

## The Problem

**Today's Flow:**
- Agent creates PDF proposal → customer wants changes → email ping-pong → revised PDF → repeat
- Frustrating for DINKYs who grew up with Booking.com's instant control
- Time-consuming for agents handling simple swap requests
- Lack of transparency around pricing, options, and availability

**Our Solution:**
- Agents curate 2-3 vetted options per item (hotels, activities, experiences)
- Customers get a **live web link** (not PDF) to view and edit within guardrails
- Real-time pricing, photos, maps, and availability
- One-click handback for complex changes
- Version history and approval workflows

---

## Product Principles: "Rails, Not Walls"

1. **Bounded Autonomy** - Customers choose within agent's curated options only
2. **Live Truth** - Real-time availability & pricing with auto-expiry
3. **Explain Trade-offs** - Every swap shows inclusions lost/gained, impact on transfers
4. **Single Thread** - In-tool messaging replaces email chains; all changes tracked
5. **Familiar UX** - Luxury Escapes-style product cards, not paperwork

---

## User Journey (Happy Path)

### 1. Agent Composes First Draft
- Sets dates, destinations, default selections
- Adds 2-3 pre-vetted options per hotel/activity slot
- Includes photos, maps, inclusions, live pricing for each option
- Marks "locked" items (flights, visa constraints, transfers)
- Sets pricing rules and minimum stay requirements

### 2. Customer Receives Link
- Opens live itinerary in web browser
- Sees timeline view of entire trip
- Views agent's recommended selections (highlighted)
- Browses alternative options with photos/details
- Sees total price, status credits, Societé points

### 3. Customer Makes Edits
**Within Rails (No Approval Needed):**
- Swap between agent's provided options
- Change room type or meal plan
- Adjust activity time/day within constraints
- Modify number of nights (within min/max)
- Simple date shifts (±2 days)

**Beyond Rails (Requires Agent Approval):**
- Add new destination
- Request option outside agent's selections
- Major date changes affecting flights
- Group size changes

### 4. Real-time Updates
- Price recalculates instantly
- Status credits & points update
- Map pins change to reflect new selections
- Change summary shows what's different from agent's picks
- Warning indicators for conflicts (transfers, timing)

### 5. Handback & Approval
- Customer clicks "Send to Agent" for complex requests
- Agent sees diff (what changed, price delta, conflicts)
- Agent approves/modifies/rejects with comments
- Customer gets notification
- Repeat until finalized

### 6. Checkout & Confirmation
- Payment inside same UI
- Itinerary locked and versioned
- Shareable link for travel companions
- Downloadable PDF for offline reference

---

## MVP Feature Set

### Phase 1: Customer Viewer/Editor (Prototype Focus)

#### Core Components
1. **Itinerary Timeline**
   - Day-by-day breakdown
   - Visual timeline with time blocks
   - Activity cards with all details
   - Map integration showing locations

2. **Option Selection System**
   - Swap controls for each editable item
   - 2-3 options per slot with full details
   - Photo galleries for each option
   - Inclusion/exclusion lists
   - Price comparison

3. **Live Pricing Engine**
   - Subtotal calculation
   - Status Credits calculation
   - Societé Points calculation
   - Tax and fee breakdown
   - Currency conversion (if needed)

4. **Change Tracking**
   - Visual indicators for modified items
   - "Agent's Pick" badges
   - Change summary sidebar
   - Price delta display
   - Revert to original option

5. **Smart Guardrails**
   - Locked items (non-editable)
   - Minimum stay warnings
   - Transfer conflict alerts
   - Availability checks
   - Date constraint validation

6. **Product Cards (LE-style)**
   - High-quality photos
   - Location on map
   - Inclusions list (breakfast, wifi, spa, etc.)
   - Cancellation policy
   - Room details / activity duration
   - Reviews/ratings (if available)

### Phase 2: Agent Composer (Future)
- Draft creation interface
- Option management
- Rule builder for constraints
- Template system
- Client notes and preferences

### Phase 3: Collaboration Features (Future)
- In-app messaging
- Approval workflows
- Version history with rollback
- Multi-user editing for groups
- Notification system

---

## Prototype Implementation Plan

### Step 1: Data Model Enhancement ✅ COMPLETED
**Goal:** Support multiple options per itinerary item

**Tasks:**
- [x] Create `Option` type with pricing, inclusions, photos
- [x] Update `Activity` to include multiple options array (`ActivitySlot`)
- [x] Add `selectedOptionId` to track customer choice
- [x] Add `agentRecommendedOptionId` to show agent's pick
- [x] Create `PricingBreakdown` type with subtotal, credits, points
- [x] Add `locked` flag for non-editable items
- [x] Create `ChangeLog` type to track modifications

**Implementation Notes:**
- Full type definitions created in `lib/types.ts`
- Rich mock data created with 3-day New Zealand itinerary
- 9 activity slots with 18 total options across hotels, activities, dining, transfers

**Data Structure:**
```typescript
interface Option {
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
  availability: 'available' | 'limited' | 'unavailable';
  supplier: {
    name: string;
    rating?: number;
  };
}

interface ActivitySlot {
  id: string;
  title: string; // e.g., "Ubud Accommodation"
  type: 'hotel' | 'activity' | 'transfer' | 'flight';
  time?: string;
  duration?: string;
  options: Option[]; // 2-3 curated options
  selectedOptionId: string; // current selection
  agentRecommendedOptionId: string; // agent's pick
  locked: boolean; // if true, customer can't change
  location?: Location;
  constraints?: {
    minNights?: number;
    maxNights?: number;
    validDates?: string[];
  };
}
```

### Step 2: Option Selector Component ✅ COMPLETED
**Goal:** UI for customers to browse and select options

**Tasks:**
- [x] Create `OptionSelector.tsx` component (carousel version in Dialog)
- [x] Design option card layout with photos
- [x] Add radio/toggle for selection
- [x] Show price comparison between options
- [x] Highlight agent's recommendation
- [x] Display inclusions diff (what changes)
- [x] Add agent's note display
- [x] Handle locked state (view-only)

**Features:**
- ✅ Carousel navigation (shadcn/ui + Embla)
- ✅ Dialog overlay (not full-screen modal)
- ✅ Expandable details
- ✅ Photo galleries with counts
- ✅ Price delta badges (+$200, -$150)
- ✅ "Agent's Pick" visual indicator with green badge
- ✅ "Currently Selected" indicator
- ✅ Progress dots for navigation
- ✅ Selection buttons inside each card
- ✅ Agent's notes shown on agent's pick card

**Implementation Notes:**
- Uses shadcn Dialog component for overlay
- Carousel shows one option at a time
- All options have identical format
- Real-time delta calculations shown inline

### Step 3: Live Price Calculator ✅ COMPLETED
**Goal:** Real-time recalculation of totals

**Tasks:**
- [x] Create `usePriceCalculator` hook
- [x] Calculate base subtotal from all selections
- [x] Calculate total status credits
- [x] Calculate total Societé points
- [x] Add tax calculation logic (10% + $50 fees)
- [x] Create price breakdown component (`SummaryFooter`)
- [x] Add "Price changed" indicators
- [ ] Implement quote expiry timer (future)

**Implementation Notes:**
- Hook uses `useMemo` for performance optimization
- Automatically recalculates on any option change
- Shows original pricing vs. current pricing
- Color-coded deltas (red for increases, green for decreases)
- Change count displayed in summary footer

**Calculation Logic:**
```typescript
const calculateTotals = (itinerary: DayItinerary[]) => {
  let subtotal = 0;
  let statusCredits = 0;
  let societePoints = 0;

  itinerary.forEach(day => {
    day.activities.forEach(activity => {
      const selected = activity.options.find(
        opt => opt.id === activity.selectedOptionId
      );
      if (selected) {
        subtotal += selected.price;
        statusCredits += selected.statusCredits;
        societePoints += selected.societePoints;
      }
    });
  });

  return { subtotal, statusCredits, societePoints };
};
```

### Step 4: Change Tracking System ✅ COMPLETED
**Goal:** Show what customer has modified

**Tasks:**
- [x] Create `ChangeTracker.tsx` sidebar
- [x] Track all customer modifications
- [x] Calculate price delta from original
- [x] Show count of changed items in footer
- [x] Add "Revert to Agent's Pick" per item
- [x] Add "Reset All Changes" button
- [x] Visual badges on modified items
- [ ] Export changes as diff for agent (future enhancement)

**Change Indicator:**
- [x] Badge showing "Modified" vs "Agent's Pick"
- [x] Color coding (blue = modified, green = agent pick)
- [x] Delta display (+$500 from agent's pick)
- [x] From → To comparison for each change
- [ ] Timeline of changes with timestamps (future enhancement)

**Implementation Notes:**
- Full ChangeTracker sidebar component in right panel (w-96)
- Shows all modified items with day number, activity title
- Displays from → to comparison for each change
- Individual revert buttons (undo arrow icon)
- Reset all button to revert entire itinerary
- Empty state when no changes made
- Summary cards showing total price/credits/points impact
- Color-coded deltas (red for increases, green for decreases)
- Integrated into 3-column layout: itinerary | map | change tracker

### Step 5: Enhanced Activity Cards ✅ COMPLETED
**Goal:** Rich product cards with option selection

**Tasks:**
- [x] Redesign `ActivityCard.tsx` to support options
- [x] Add photo for current selection
- [x] Create expandable option selector (opens carousel dialog)
- [x] Show inclusions list (top 3, with "+X more")
- [x] Add "Change Option" button
- [ ] Display cancellation policy (in option selector)
- [x] Show availability status badges
- [x] Add location quick-view on map

**Card States:**
- [x] Collapsed: Shows current selection only
- [x] Expanded: Opens carousel dialog with all options
- [x] Locked: Grayed out with padlock icon, no "Change Option" button
- [x] Modified: Blue border with "Modified" badge

**Implementation Notes:**
- Card shows current selected option details
- "Change Option (X)" button shows option count
- Location clickable to focus map
- Agent's notes displayed in card footer
- Supplier rating and info shown
- Time and duration badges in header

### Step 6: Smart Guardrails & Validation ✅ COMPLETED
**Goal:** Prevent invalid configurations

**Tasks:**
- [x] Create validation engine
- [x] Check minimum stay requirements
- [x] Validate transfer timing conflicts
- [x] Check date constraint violations
- [x] Verify availability before selection
- [x] Show warning modals for issues
- [x] Suggest alternatives when blocked (via warnings)
- [ ] Add tooltips explaining constraints (future enhancement)

**Validation Rules:**
- [x] Min/max nights for accommodations
- [x] Activity time conflicts
- [x] Transfer compatibility
- [x] Date range restrictions
- [ ] Group size limits (future enhancement)

**Implementation Notes:**
- Full validation engine in `lib/validation.ts`
- Three severity levels: error, warning, info
- ValidationWarningModal component with color-coded display
- Integrated into OptionSelector selection flow
- Blocks selection for errors, warns for conflicts

### Step 7: "Send to Agent" Flow ✅ COMPLETED
**Goal:** Hand off complex requests to agent

**Tasks:**
- [x] Create "Send to Agent" button
- [x] Build request modal with message field
- [x] Show summary of current changes
- [ ] Add attachment support (screenshots, links) (future)
- [x] Create request type categories
- [x] Mock agent response system (5-second delay)
- [x] Add request tracking panel
- [ ] Version comparison view (future)

**Request Types:**
- [x] General Question
- [x] Custom Option Request
- [x] Date Change
- [x] Add Destination
- [x] Group Change
- [x] Special Request

**Implementation Notes:**
- SendToAgentModal with 6 request types
- AgentRequestsPanel for history display
- Tabbed right sidebar (Changes | Requests)
- Mock response system with 5s delay
- Status badges (pending/approved/rejected/requires_info)
- Auto-populated current changes summary
- Price delta calculation and display

### Step 8: Enhanced Pricing Breakdown ✅ COMPLETED
**Goal:** Transparent cost visibility

**Tasks:**
- [x] Expand `SummaryFooter.tsx` component
- [x] Add detailed line-item breakdown
- [x] Show per-day costs
- [ ] Display savings from bundles (future enhancement)
- [x] Add tax and fee breakdown
- [ ] Show price change history (future enhancement)
- [x] Add "Lock Price" button
- [x] Implement quote expiry countdown

**Implementation Notes:**
- Enhanced type system with LineItem, CategoryBreakdown, DayBreakdown interfaces
- Rewrote usePriceCalculator to generate detailed breakdowns by category and by day
- Expandable breakdown panel with toggle between "By Category" and "By Day" views
- Live countdown timer showing quote expiry (HH:MM:SS format)
- Price lock functionality with persistent state during session
- All line items displayed with individual costs
- Tax (10%) and service fees ($50) shown separately
- Categories sorted by cost (highest first)
- Days shown in chronological order with dates

**Breakdown Display:**
```
Accommodations:           $4,200
Activities & Experiences: $2,800
Transfers:                  $450
Travel Insurance:           $297
Taxes & Fees:               $500
─────────────────────────────────
Subtotal:                $8,247
Status Credits:        +2,100 pts
Societé Points:          +180 pts

Price locked until: 23:45:00
```

### Step 9: Map Integration Updates ✅ COMPLETED
**Goal:** Reflect selected options on map

**Tasks:**
- [x] Update `TripMap.tsx` to show selected options
- [x] Color-code pins by option type (activity type based)
- [x] Show option-specific photos in popups
- [x] Add route visualization between locations
- [x] Highlight modified selections differently (amber border)
- [x] Add distance/time between points (Haversine formula)
- [ ] Create "Explore Nearby" suggestions (future enhancement)
- [x] Show transfer routes

**Implementation Notes:**
- Complete TripMap rewrite with activity-type color coding (6 types)
- Enhanced SVG markers with emoji icons and drop shadows
- Modified selections highlighted with 3px amber border
- Rich popups with photos (300px), descriptions, pricing, and details
- Dashed blue polylines connecting consecutive locations
- Haversine formula for accurate distance calculations (km)
- Time estimates based on 60 km/h average travel speed
- Interactive legend showing all activity types and colors
- Toggle controls for routes and legend visibility
- Distance and time shown in both popups and route tooltips

### Step 10: Version History & Revert
**Goal:** Allow customers to undo changes

**Tasks:**
- [ ] Create version snapshot system
- [ ] Add "History" sidebar
- [ ] Show timeline of all changes
- [ ] Enable revert to any version
- [ ] Compare versions side-by-side
- [ ] Export version as PDF
- [ ] Add version notes/labels
- [ ] Auto-save drafts

### Step 11: Mobile Responsive Design
**Goal:** Perfect experience on all devices

**Tasks:**
- [ ] Optimize layout for mobile
- [ ] Create bottom sheet for option selection
- [ ] Simplify map controls for touch
- [ ] Add swipe gestures for option browsing
- [ ] Optimize photo galleries for mobile
- [ ] Create sticky summary bar
- [ ] Test on various screen sizes
- [ ] Add mobile-specific shortcuts

### Step 12: Polish & Edge Cases
**Goal:** Production-ready experience

**Tasks:**
- [ ] Add loading states for all interactions
- [ ] Implement error handling
- [ ] Add empty states
- [ ] Create onboarding tooltips
- [ ] Add keyboard shortcuts
- [ ] Implement undo/redo
- [ ] Add confirmation modals
- [ ] Create help documentation
- [ ] Add accessibility features (ARIA, keyboard nav)
- [ ] Performance optimization

---

## Success Metrics

### Customer Metrics
- **Time to Book:** First draft → final payment
- **Edit Adoption:** % of customers who use swap controls
- **Revision Count:** Reduction in email/call iterations
- **Satisfaction:** NPS/CSAT score for itinerary experience
- **Conversion Rate:** % who book vs. abandon

### Agent Metrics
- **Time Saved:** Hours per booking cycle
- **Close Rate:** % of proposals that convert
- **Revision Efficiency:** Changes handled in-tool vs. email
- **Satisfaction:** Agent NPS for the tool
- **Utilization:** % of proposals using editable format

### Business Metrics
- **AOV (Average Order Value):** Compared to PDF baseline
- **Upsell Rate:** Premium option selection frequency
- **Abandonment Rate:** Where customers drop off
- **Support Tickets:** Reduction in booking-related issues
- **Revenue per Agent:** Productivity increase

---

## Edge Cases & Considerations

### Complex Scenarios
1. **Flight Changes:** Keep flights locked initially; allow date nudges but require re-quote
2. **Group Bookings:** Allow per-room selections but lock shared transfers
3. **Supplier Inventory:** Real-time availability checks; show "limited availability" warnings
4. **Price Fluctuations:** Sticky quote with timer; "Refresh Prices" button with delta highlights
5. **Cancellation Windows:** Show cutoff dates; warn before selecting non-refundable
6. **Payment Deposits:** Support partial payments for high-value bookings
7. **Multi-Currency:** Display prices in customer's preferred currency with conversion rates

### Technical Considerations
1. **Caching:** Cache pricing for 30 mins; refresh badge when stale
2. **Optimistic Updates:** Update UI immediately; rollback if validation fails
3. **Offline Support:** Allow viewing offline; sync changes when online
4. **Concurrency:** Handle multiple users editing same itinerary (groups)
5. **Data Integrity:** Validate all changes server-side
6. **Performance:** Lazy load options; infinite scroll for long itineraries
7. **Analytics:** Track every interaction for insights

---

## Example User Flow (Concrete Scenario)

### Scenario: "Bali Bliss - 5 Nights"

**Agent's Initial Proposal:**
- **Ubud (3 nights):** COMO Uma Ubud (Agent's Pick) vs. Four Seasons Resort vs. Alila Ubud
- **Seminyak (2 nights):** The Legian (Agent's Pick) vs. W Bali vs. Potato Head Studios
- **Day 2:** Tegalalang Rice Terrace Tour at 9 AM (locked) + Cooking Class at 2 PM (3 options)
- **Day 4:** Beach Club Day at Finns (Agent's Pick) vs. Potato Head vs. Sundays Beach Club
- **Transfers:** Private car throughout (locked)

**Customer Opens Link:**
1. Sees beautiful timeline with all 5 days
2. Agent's selections are pre-chosen and highlighted
3. Current total: $3,450 | Status Credits: +1,200 pts | Societé Points: +150 pts

**Customer Makes Changes:**
1. **Day 1-3 (Ubud):** Clicks "Change Hotel" → Compares options → Selects Four Seasons (+$600)
   - Price updates to $4,050
   - See new inclusions: Added "Spa credit $100", "Private plunge pool"
   - Lost: "Complimentary yoga classes"

2. **Day 2 (Cooking Class):** Swaps from "Morning Market + Cook" to "Farm-to-Table Experience" (+$80)
   - Time changes from 2 PM → 3 PM
   - System checks: ✓ No conflicts with dinner transfer

3. **Day 4-5 (Seminyak):** Keeps The Legian (Agent's Pick) ✓

4. **Day 4 (Beach Club):** Upgrades to Potato Head (+$50)
   - Adds DJ event access
   - Changes cabana type

**Final Summary:**
- Subtotal: $4,180 (+$730 from agent's pick)
- Status Credits: +1,450 pts (+250 pts)
- Societé Points: +175 pts (+25 pts)
- Modified items: 3 of 7 (highlighted in blue)
- Agent's picks kept: 4 of 7

**Customer Action:**
- Clicks "Send to Agent"
- Adds message: "Love the upgrade to Four Seasons! Can we also add a sunrise hike on Day 3?"
- Agent sees diff, approves hotel changes, quotes sunrise hike
- Customer accepts and proceeds to payment

**Time Saved:**
- Traditional: 3-4 email rounds over 2-3 days
- With tool: 15 mins browsing + 1 agent response = Same-day finalization

---

## Visual Design Principles

### Color System
- **Agent's Pick:** Green badge, subtle green border
- **Customer Modified:** Blue badge, blue border
- **Locked Item:** Gray with padlock icon, no hover state
- **Price Increase:** Red delta (+$200)
- **Price Decrease:** Green delta (-$150)
- **Warnings:** Amber for conflicts, red for errors

### Typography Hierarchy
- **Trip Title:** Large, bold, prominent
- **Day Headers:** Dark background, white text, sticky
- **Activity Titles:** Medium, semibold
- **Option Names:** Readable, clear hierarchy
- **Price Display:** Large, always visible, real-time updates

### Interaction Patterns
- **Hover:** Subtle elevation, border highlight
- **Click:** Instant feedback, optimistic updates
- **Selection:** Clear visual confirmation, smooth animation
- **Loading:** Skeleton screens, progress indicators
- **Errors:** Inline validation, helpful messages

### Mobile Considerations
- Bottom sheets for option selection
- Swipeable photo galleries
- Sticky pricing summary at bottom
- Collapsible sections to save space
- Large touch targets (min 44x44px)
- Simplified map with "View Full Map" option

---

## Future Enhancements (Post-MVP)

### Phase 4: Advanced Features
- **AI Recommendations:** Suggest upgrades based on preferences
- **Weather Integration:** Show forecasts for each day
- **Social Sharing:** Share itinerary with travel companions
- **Collaborative Editing:** Multiple people can edit together
- **Smart Bundling:** Auto-suggest complementary experiences
- **Loyalty Integration:** Apply points/credits at selection time
- **Travel Insurance:** Inline quotes and selection
- **Visa Requirements:** Automatic checks and reminders

### Phase 5: Agent Tools
- **Template Library:** Pre-built itineraries by destination
- **Client CRM:** Track preferences, past bookings, notes
- **Performance Analytics:** See what options customers prefer
- **Bulk Actions:** Update multiple itineraries at once
- **Commission Tracking:** Revenue and margins per booking
- **Automated Follow-ups:** Reminders for pending approvals

### Phase 6: Ecosystem Integration
- **Supplier API Integration:** Real-time availability from hotels
- **Payment Gateway:** Multiple payment methods, installments
- **Booking Confirmation:** Auto-send vouchers and confirmations
- **Calendar Sync:** Add to Google/Apple Calendar
- **Travel Documents:** Store passports, visas, insurance
- **Post-Trip:** Reviews, photos, rebooking prompts

---

## Technical Architecture (High-Level)

### Frontend
- **Framework:** Next.js 15 with App Router
- **Language:** TypeScript for type safety
- **Styling:** Tailwind CSS for rapid development
- **State Management:** React Context + Hooks (or Zustand for complex state)
- **Maps:** Leaflet + React-Leaflet
- **Forms:** React Hook Form with Zod validation
- **Animations:** Framer Motion for smooth transitions
- **Images:** Next.js Image optimization

### Backend (Future)
- **API:** Next.js API Routes or separate NestJS service
- **Database:** PostgreSQL for relational data
- **Cache:** Redis for pricing and availability
- **File Storage:** S3 for photos and documents
- **Auth:** NextAuth.js with multiple providers
- **Payments:** Stripe for transactions
- **Email:** SendGrid for notifications
- **Real-time:** WebSockets for live collaboration

### Infrastructure
- **Hosting:** Vercel for frontend
- **CDN:** Cloudflare for global performance
- **Monitoring:** Sentry for error tracking
- **Analytics:** PostHog or Amplitude
- **Testing:** Vitest + Playwright for E2E

---

## Positioning & Messaging

### Value Propositions

**For Customers (DINKYs):**
> "Your trip, your way—without the back-and-forth. See your itinerary come to life with photos, maps, and instant pricing. Swap options in seconds, not days."

**For Travel Agents:**
> "Spend less time emailing, more time selling. Create proposals customers can edit themselves—within your expert guidelines. Close deals faster with live itineraries."

**For Luxury Escapes:**
> "Bring OTA convenience to agent-led travel. Empower customers with transparency while keeping agents in control. The future of luxury travel planning."

### Tagline Options
- "No more PDF ping-pong. Plan together."
- "Curated by experts. Customized by you."
- "Your itinerary, supercharged."
- "Travel planning, reimagined."

---

## Launch Strategy

### Beta Testing
1. **Internal Alpha:** Test with LE agents and staff
2. **Closed Beta:** 10-15 trusted agents + their customers
3. **Feedback Loop:** Weekly surveys and interviews
4. **Iteration:** Refine based on real usage
5. **Public Beta:** Expand to 100+ agents
6. **Full Launch:** Market-wide rollout

### Go-to-Market
1. **Agent Training:** Video tutorials, documentation, live workshops
2. **Customer Education:** Tooltip tours, help articles
3. **Marketing Materials:** Demo videos, case studies
4. **Success Stories:** Feature early adopters
5. **Press Release:** Industry publications
6. **Social Proof:** Testimonials and metrics

---

## Appendix: Key User Stories

### As a Customer...
- I want to see all my trip details in one place, so I don't have to dig through emails
- I want to compare hotel options side-by-side, so I can make informed decisions
- I want to know immediately how changes affect price, so there are no surprises
- I want to see what's included in each option, so I understand the value
- I want to revert changes easily, so I can experiment without risk
- I want to view everything on my phone, so I can plan on the go

### As a Travel Agent...
- I want to pre-select great options, so customers aren't overwhelmed
- I want to see what customers changed, so I can understand their preferences
- I want to approve complex requests quickly, so I close deals faster
- I want pricing to update automatically, so I don't manually recalculate
- I want to reuse successful itineraries, so I work more efficiently
- I want customers to self-serve simple changes, so I focus on high-value work

### As Luxury Escapes...
- I want to increase conversion rates, so we book more trips
- I want to reduce support burden, so our team is more efficient
- I want to collect preference data, so we improve recommendations
- I want to upsell premium options, so we increase AOV
- I want to differentiate from OTAs, so agents choose our platform
- I want happy customers and agents, so we build long-term loyalty

---

## Conclusion

This editable itinerary platform represents a fundamental shift from **static proposals to dynamic collaboration**. By giving customers safe, bounded control within an agent's expert curation, we solve the core friction in luxury travel planning: speed vs. quality.

The MVP focuses on the **customer experience first**—proving that real-time option selection, transparent pricing, and visual storytelling can coexist with agent expertise. Once validated, we expand to full collaboration tools, supplier integrations, and ecosystem features.

**Next Steps:**
1. Review and refine this spec with stakeholders
2. Create detailed wireframes and mockups
3. Build clickable prototype for user testing
4. Develop Phase 1 customer editor
5. Beta test with select agents and customers
6. Iterate based on feedback
7. Launch publicly and measure success

---

---

## Implementation Progress

### ✅ Completed (Steps 1-9)
- **Step 1:** Data model with full type system and mock data
- **Step 2:** Carousel-based option selector with Dialog overlay
- **Step 3:** Live price calculator with real-time updates
- **Step 4:** Complete change tracking system with sidebar and revert functionality
- **Step 5:** Enhanced activity cards with option selection
- **Step 6:** Smart guardrails & validation system with warning modals
- **Step 7:** "Send to Agent" flow with request tracking and mock responses
- **Step 8:** Enhanced pricing breakdown with detailed line items, countdown timer, and price lock
- **Step 9:** Map integration with activity-type colors, routes, photos, and distance calculations

### 🚧 In Progress
- None currently

### 📋 Pending (Steps 10-12)
- **Step 10:** Version history & revert
- **Step 11:** Mobile responsive design
- **Step 12:** Polish & edge cases

### 🎯 Current State
- **Working prototype** with complete booking flow
- **3-day New Zealand itinerary** with 9 activity slots
- **Carousel interface** using shadcn/ui components
- **Real-time calculations** for price, credits, and points
- **Change tracking** with revert functionality
- **Smart validation** preventing invalid selections
- **Agent communication** with request tracking
- **Tabbed right sidebar** for changes and requests
- **Detailed pricing breakdown** with category and day views
- **Quote expiry countdown** with live timer
- **Price lock functionality** to guarantee rates
- **Interactive map** with color-coded markers, routes, and photos
- **Distance & time calculations** between all locations
- **Modified selection highlighting** on map with amber borders
- **Running at:** http://localhost:3000

---

**Document Version:** 1.3
**Last Updated:** October 18, 2025
**Owner:** Product Team
**Status:** Active Development - Steps 1-9 Complete
