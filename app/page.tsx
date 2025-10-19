'use client';

import { useState } from 'react';
import dynamic from 'next/dynamic';
import Header from '@/components/Header';
import DateCalendar from '@/components/DateCalendar';
import ItinerarySidebar from '@/components/ItinerarySidebar';
import SummaryFooter from '@/components/SummaryFooter';
import ChangeTracker from '@/components/ChangeTracker';
import SendToAgentModal from '@/components/SendToAgentModal';
import AgentRequestsPanel from '@/components/AgentRequestsPanel';
import { ResizablePanelGroup, ResizablePanel, ResizableHandle } from '@/components/ui/resizable';
import { mockTrip } from '@/lib/mockData';
import { usePriceCalculator } from '@/lib/hooks/usePriceCalculator';
import { DayItinerary, AgentRequest } from '@/lib/types';

// Dynamically import map component to avoid SSR issues with Leaflet
const TripMap = dynamic(() => import('@/components/TripMap'), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full bg-gray-100 flex items-center justify-center">
      <p className="text-gray-500">Loading map...</p>
    </div>
  ),
});

export default function Home() {
  const [selectedLocation, setSelectedLocation] = useState<[number, number] | undefined>();
  const [hoveredLocation, setHoveredLocation] = useState<[number, number] | undefined>();
  const [itinerary, setItinerary] = useState<DayItinerary[]>(mockTrip.itinerary);
  const [showSendToAgent, setShowSendToAgent] = useState(false);
  const [agentRequests, setAgentRequests] = useState<AgentRequest[]>([]);
  const [activeRightPanel, setActiveRightPanel] = useState<'changes' | 'requests'>('changes');
  const [selectedDay, setSelectedDay] = useState<number | undefined>();

  // Calculate pricing based on current selections
  const currentPricing = usePriceCalculator(itinerary);

  const handleLocationClick = (coordinates: [number, number]) => {
    setSelectedLocation(coordinates);
  };

  const handleActivityHover = (coordinates: [number, number] | undefined) => {
    setHoveredLocation(coordinates);
  };

  const handleSelectOption = (activitySlotId: string, optionId: string) => {
    setItinerary(prevItinerary =>
      prevItinerary.map(day => ({
        ...day,
        activities: day.activities.map(slot =>
          slot.id === activitySlotId
            ? { ...slot, selectedOptionId: optionId }
            : slot
        )
      }))
    );
  };

  const handleRevertItem = (activitySlotId: string) => {
    setItinerary(prevItinerary =>
      prevItinerary.map(day => ({
        ...day,
        activities: day.activities.map(slot =>
          slot.id === activitySlotId
            ? { ...slot, selectedOptionId: slot.agentRecommendedOptionId }
            : slot
        )
      }))
    );
  };

  const handleResetAll = () => {
    setItinerary(prevItinerary =>
      prevItinerary.map(day => ({
        ...day,
        activities: day.activities.map(slot => ({
          ...slot,
          selectedOptionId: slot.agentRecommendedOptionId
        }))
      }))
    );
  };

  const handleSendToAgent = (request: Omit<AgentRequest, 'id' | 'createdAt' | 'status'>) => {
    const newRequest: AgentRequest = {
      ...request,
      id: `req_${Date.now()}`,
      createdAt: new Date(),
      status: 'pending',
    };

    setAgentRequests(prev => [...prev, newRequest]);

    // Mock agent response after 5 seconds
    setTimeout(() => {
      setAgentRequests(prev => prev.map(req => {
        if (req.id === newRequest.id) {
          return {
            ...req,
            status: 'approved' as const,
            agentResponse: {
              message: "Thanks for reaching out! I've reviewed your request and it looks great. Your changes have been approved and I've confirmed availability for all selections. Looking forward to helping you plan an amazing trip!",
              respondedAt: new Date(),
              updatedItinerary: false,
            },
          };
        }
        return req;
      }));
    }, 5000);
  };

  // Create enhanced summary with original pricing for comparison
  const changeCount = itinerary.reduce((count, day) =>
    count + day.activities.filter(slot =>
      slot.selectedOptionId !== slot.agentRecommendedOptionId
    ).length,
    0
  );

  // Quote expiry: 24 hours from now
  const quoteExpiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000);

  const [isPriceLocked, setIsPriceLocked] = useState(false);
  const [priceLockedAt, setPriceLockedAt] = useState<Date | undefined>();

  const handleLockPrice = () => {
    setIsPriceLocked(true);
    setPriceLockedAt(new Date());
  };

  const summary = {
    ...currentPricing,
    originalPricing: mockTrip.summary.originalPricing,
    changeCount,
    quoteExpiresAt,
    isPriceLocked,
    priceLockedAt,
  };

  const priceDelta = currentPricing.subtotal - mockTrip.summary.originalPricing.subtotal;

  return (
    <div className="flex flex-col h-screen">
      <Header
        title={mockTrip.title}
        location={mockTrip.location}
        creator={mockTrip.creator}
        stats={mockTrip.stats}
      />

      <DateCalendar
        itinerary={itinerary}
        selectedDay={selectedDay}
        onSelectDay={setSelectedDay}
      />

      <ResizablePanelGroup direction="horizontal" className="flex-1 overflow-hidden">
        {/* Left Panel: Itinerary Sidebar */}
        <ResizablePanel defaultSize={25} minSize={15} maxSize={40} className="min-w-[300px]">
          <ItinerarySidebar
            itinerary={itinerary}
            onLocationClick={handleLocationClick}
            onSelectOption={handleSelectOption}
            onActivityHover={handleActivityHover}
          />
        </ResizablePanel>

        <ResizableHandle withHandle />

        {/* Center Panel: Map */}
        <ResizablePanel defaultSize={50} minSize={30}>
          <div className="h-full w-full relative">
            <TripMap
              itinerary={itinerary}
              selectedLocation={selectedLocation}
              hoveredLocation={hoveredLocation}
            />
          </div>
        </ResizablePanel>

        <ResizableHandle withHandle />

        {/* Right Panel: Changes & Agent Requests */}
        <ResizablePanel defaultSize={25} minSize={20} maxSize={40} className="min-w-[300px]">
          <div className="h-full bg-gray-50 border-l-2 border-gray-300 flex flex-col">
            {/* Panel Tabs */}
            <div className="flex border-b-2 border-gray-300">
              <button
                onClick={() => setActiveRightPanel('changes')}
                className={`flex-1 px-4 py-3 text-sm font-semibold transition-colors ${
                  activeRightPanel === 'changes'
                    ? 'bg-white text-blue-600 border-b-2 border-blue-600 -mb-0.5'
                    : 'bg-gray-100 text-gray-600 hover:text-gray-900'
                }`}
              >
                Your Changes
                {changeCount > 0 && (
                  <span className="ml-2 bg-blue-600 text-white text-xs px-2 py-0.5 rounded-full">
                    {changeCount}
                  </span>
                )}
              </button>
              <button
                onClick={() => setActiveRightPanel('requests')}
                className={`flex-1 px-4 py-3 text-sm font-semibold transition-colors ${
                  activeRightPanel === 'requests'
                    ? 'bg-white text-indigo-600 border-b-2 border-indigo-600 -mb-0.5'
                    : 'bg-gray-100 text-gray-600 hover:text-gray-900'
                }`}
              >
                Agent Requests
                {agentRequests.length > 0 && (
                  <span className="ml-2 bg-indigo-600 text-white text-xs px-2 py-0.5 rounded-full">
                    {agentRequests.length}
                  </span>
                )}
              </button>
            </div>

            {/* Panel Content */}
            <div className="flex-1 overflow-y-auto p-6">
              {activeRightPanel === 'changes' ? (
                <ChangeTracker
                  itinerary={itinerary}
                  onRevertItem={handleRevertItem}
                  onResetAll={handleResetAll}
                />
              ) : (
                <AgentRequestsPanel requests={agentRequests} />
              )}
            </div>

            {/* Send to Agent Button */}
            <div className="border-t-2 border-gray-300 p-4 bg-white">
              <button
                onClick={() => setShowSendToAgent(true)}
                className="le-button-primary w-full flex items-center justify-center gap-2"
                style={{
                  padding: 'var(--le-space-3) var(--le-space-4)',
                  boxShadow: 'var(--le-shadow-sm)'
                }}
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
                Send Message to Agent
              </button>
            </div>
          </div>
        </ResizablePanel>
      </ResizablePanelGroup>

      <SummaryFooter summary={summary} onLockPrice={handleLockPrice} />

      {/* Send to Agent Modal */}
      <SendToAgentModal
        isOpen={showSendToAgent}
        onClose={() => setShowSendToAgent(false)}
        onSubmit={handleSendToAgent}
        itinerary={itinerary}
        modifiedCount={changeCount}
        priceDelta={priceDelta}
      />
    </div>
  );
}
