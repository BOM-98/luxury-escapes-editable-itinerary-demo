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
import VersionHistory from '@/components/VersionHistory';
import VersionComparisonModal from '@/components/VersionComparisonModal';
import { ResizablePanelGroup, ResizablePanel, ResizableHandle } from '@/components/ui/resizable';
import { mockTrip } from '@/lib/mockData';
import { usePriceCalculator } from '@/lib/hooks/usePriceCalculator';
import { useVersionHistory } from '@/hooks/useVersionHistory';
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
  const [activeRightPanel, setActiveRightPanel] = useState<'changes' | 'requests' | 'history'>('changes');
  const [selectedDay, setSelectedDay] = useState<number | undefined>();
  const [showVersionComparison, setShowVersionComparison] = useState(false);
  const [comparisonData, setComparisonData] = useState<any>(null);

  // Mobile state: which panel is active on mobile
  const [activeMobilePanel, setActiveMobilePanel] = useState<'itinerary' | 'map' | 'details'>('map');

  // Calculate pricing based on current selections
  const currentPricing = usePriceCalculator(itinerary);

  // Quote expiry: 24 hours from now
  const quoteExpiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000);

  const [isPriceLocked, setIsPriceLocked] = useState(false);
  const [priceLockedAt, setPriceLockedAt] = useState<Date | undefined>();

  // Create enhanced summary with original pricing for comparison
  const changeCount = itinerary.reduce((count, day) =>
    count + day.activities.filter(slot =>
      slot.selectedOptionId !== slot.agentRecommendedOptionId
    ).length,
    0
  );

  const summary = {
    ...currentPricing,
    originalPricing: mockTrip.summary.originalPricing,
    changeCount,
    quoteExpiresAt,
    isPriceLocked,
    priceLockedAt,
  };

  // Initialize version history
  const versionHistory = useVersionHistory({
    itinerary,
    summary,
    onRestore: (restoredItinerary) => {
      setItinerary(restoredItinerary);
    },
  });

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

  const handleLockPrice = () => {
    setIsPriceLocked(true);
    setPriceLockedAt(new Date());
  };

  const handleCompareVersions = (versionId1: string, versionId2: string) => {
    const comparison = versionHistory.compareVersions(versionId1, versionId2);
    if (comparison) {
      setComparisonData(comparison);
      setShowVersionComparison(true);
    }
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

      {/* Desktop Layout - 3 Panel Resizable */}
      <div className="hidden md:flex flex-1 overflow-hidden">
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

        {/* Right Panel: Changes, Agent Requests & Version History */}
        <ResizablePanel defaultSize={25} minSize={20} maxSize={40} className="min-w-[300px]">
          <div className="h-full bg-gray-50 border-l-2 border-gray-300 flex flex-col">
            {/* Panel Tabs */}
            <div className="flex border-b-2 border-gray-300">
              <button
                onClick={() => setActiveRightPanel('changes')}
                className={`flex-1 px-3 py-3 text-xs font-semibold transition-colors ${
                  activeRightPanel === 'changes'
                    ? 'bg-white text-blue-600 border-b-2 border-blue-600 -mb-0.5'
                    : 'bg-gray-100 text-gray-600 hover:text-gray-900'
                }`}
              >
                Changes
                {changeCount > 0 && (
                  <span className="ml-1 bg-blue-600 text-white text-xs px-1.5 py-0.5 rounded-full">
                    {changeCount}
                  </span>
                )}
              </button>
              <button
                onClick={() => setActiveRightPanel('requests')}
                className={`flex-1 px-3 py-3 text-xs font-semibold transition-colors ${
                  activeRightPanel === 'requests'
                    ? 'bg-white text-indigo-600 border-b-2 border-indigo-600 -mb-0.5'
                    : 'bg-gray-100 text-gray-600 hover:text-gray-900'
                }`}
              >
                Requests
                {agentRequests.length > 0 && (
                  <span className="ml-1 bg-indigo-600 text-white text-xs px-1.5 py-0.5 rounded-full">
                    {agentRequests.length}
                  </span>
                )}
              </button>
              <button
                onClick={() => setActiveRightPanel('history')}
                className={`flex-1 px-3 py-3 text-xs font-semibold transition-colors ${
                  activeRightPanel === 'history'
                    ? 'bg-white text-teal-600 border-b-2 border-teal-600 -mb-0.5'
                    : 'bg-gray-100 text-gray-600 hover:text-gray-900'
                }`}
              >
                History
                {versionHistory.versions.length > 0 && (
                  <span className="ml-1 bg-teal-600 text-white text-xs px-1.5 py-0.5 rounded-full">
                    {versionHistory.versions.length}
                  </span>
                )}
              </button>
            </div>

            {/* Panel Content */}
            <div className="flex-1 overflow-y-auto">
              {activeRightPanel === 'changes' ? (
                <div className="p-6">
                  <ChangeTracker
                    itinerary={itinerary}
                    onRevertItem={handleRevertItem}
                    onResetAll={handleResetAll}
                  />
                </div>
              ) : activeRightPanel === 'requests' ? (
                <div className="p-6">
                  <AgentRequestsPanel requests={agentRequests} />
                </div>
              ) : (
                <VersionHistory
                  versions={versionHistory.versions}
                  currentVersionId={versionHistory.currentVersionId}
                  onRevertToVersion={versionHistory.revertToVersion}
                  onDeleteVersion={versionHistory.deleteVersion}
                  onUpdateLabel={versionHistory.updateVersionLabel}
                  onCompareVersions={handleCompareVersions}
                  onCreateVersion={(label, note) => versionHistory.createVersion(label, note, false)}
                  autoSaveEnabled={versionHistory.autoSaveEnabled}
                  lastAutoSaveAt={versionHistory.lastAutoSaveAt}
                />
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
      </div>

      {/* Mobile Layout - Tabbed Single Panel */}
      <div className="md:hidden flex flex-col flex-1 overflow-hidden relative">
        {/* Main Content Area */}
        <div className="flex-1 overflow-hidden">
          {/* Itinerary Panel */}
          {activeMobilePanel === 'itinerary' && (
            <div className="h-full overflow-hidden">
              <ItinerarySidebar
                itinerary={itinerary}
                onLocationClick={(coords) => {
                  handleLocationClick(coords);
                  setActiveMobilePanel('map');
                }}
                onSelectOption={handleSelectOption}
                onActivityHover={handleActivityHover}
              />
            </div>
          )}

          {/* Map Panel */}
          {activeMobilePanel === 'map' && (
            <div className="h-full w-full relative">
              <TripMap
                itinerary={itinerary}
                selectedLocation={selectedLocation}
                hoveredLocation={hoveredLocation}
              />
            </div>
          )}

          {/* Details Panel (Changes, Requests, History) */}
          {activeMobilePanel === 'details' && (
            <div className="h-full bg-gray-50 flex flex-col overflow-hidden">
              {/* Sub-tabs for Details */}
              <div className="flex border-b-2 border-gray-300 bg-white">
                <button
                  onClick={() => setActiveRightPanel('changes')}
                  className={`flex-1 px-3 py-3 text-xs font-semibold transition-colors ${
                    activeRightPanel === 'changes'
                      ? 'bg-white text-blue-600 border-b-2 border-blue-600 -mb-0.5'
                      : 'bg-gray-100 text-gray-600'
                  }`}
                >
                  Changes
                  {changeCount > 0 && (
                    <span className="ml-1 bg-blue-600 text-white text-xs px-1.5 py-0.5 rounded-full">
                      {changeCount}
                    </span>
                  )}
                </button>
                <button
                  onClick={() => setActiveRightPanel('requests')}
                  className={`flex-1 px-3 py-3 text-xs font-semibold transition-colors ${
                    activeRightPanel === 'requests'
                      ? 'bg-white text-indigo-600 border-b-2 border-indigo-600 -mb-0.5'
                      : 'bg-gray-100 text-gray-600'
                  }`}
                >
                  Requests
                  {agentRequests.length > 0 && (
                    <span className="ml-1 bg-indigo-600 text-white text-xs px-1.5 py-0.5 rounded-full">
                      {agentRequests.length}
                    </span>
                  )}
                </button>
                <button
                  onClick={() => setActiveRightPanel('history')}
                  className={`flex-1 px-3 py-3 text-xs font-semibold transition-colors ${
                    activeRightPanel === 'history'
                      ? 'bg-white text-teal-600 border-b-2 border-teal-600 -mb-0.5'
                      : 'bg-gray-100 text-gray-600'
                  }`}
                >
                  History
                  {versionHistory.versions.length > 0 && (
                    <span className="ml-1 bg-teal-600 text-white text-xs px-1.5 py-0.5 rounded-full">
                      {versionHistory.versions.length}
                    </span>
                  )}
                </button>
              </div>

              {/* Panel Content */}
              <div className="flex-1 overflow-y-auto">
                {activeRightPanel === 'changes' ? (
                  <div className="p-4">
                    <ChangeTracker
                      itinerary={itinerary}
                      onRevertItem={handleRevertItem}
                      onResetAll={handleResetAll}
                    />
                  </div>
                ) : activeRightPanel === 'requests' ? (
                  <div className="p-4">
                    <AgentRequestsPanel requests={agentRequests} />
                  </div>
                ) : (
                  <VersionHistory
                    versions={versionHistory.versions}
                    currentVersionId={versionHistory.currentVersionId}
                    onRevertToVersion={versionHistory.revertToVersion}
                    onDeleteVersion={versionHistory.deleteVersion}
                    onUpdateLabel={versionHistory.updateVersionLabel}
                    onCompareVersions={handleCompareVersions}
                    onCreateVersion={(label, note) => versionHistory.createVersion(label, note, false)}
                    autoSaveEnabled={versionHistory.autoSaveEnabled}
                    lastAutoSaveAt={versionHistory.lastAutoSaveAt}
                  />
                )}
              </div>

              {/* Send to Agent Button - Mobile */}
              <div className="border-t-2 border-gray-300 p-3 bg-white">
                <button
                  onClick={() => setShowSendToAgent(true)}
                  className="le-button-primary w-full flex items-center justify-center gap-2"
                  style={{
                    padding: 'var(--le-space-3)',
                    fontSize: 'var(--le-text-sm)'
                  }}
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                  </svg>
                  Send to Agent
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Mobile Bottom Navigation */}
        <div className="flex border-t-2 border-gray-300 bg-white safe-area-inset-bottom">
          <button
            onClick={() => setActiveMobilePanel('itinerary')}
            className={`flex-1 flex flex-col items-center justify-center py-3 transition-colors ${
              activeMobilePanel === 'itinerary'
                ? 'text-teal-600'
                : 'text-gray-500'
            }`}
          >
            <svg className="w-6 h-6 mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
            <span className="text-xs font-medium">Itinerary</span>
          </button>
          <button
            onClick={() => setActiveMobilePanel('map')}
            className={`flex-1 flex flex-col items-center justify-center py-3 transition-colors ${
              activeMobilePanel === 'map'
                ? 'text-teal-600'
                : 'text-gray-500'
            }`}
          >
            <svg className="w-6 h-6 mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
            </svg>
            <span className="text-xs font-medium">Map</span>
          </button>
          <button
            onClick={() => setActiveMobilePanel('details')}
            className={`flex-1 flex flex-col items-center justify-center py-3 transition-colors relative ${
              activeMobilePanel === 'details'
                ? 'text-teal-600'
                : 'text-gray-500'
            }`}
          >
            <svg className="w-6 h-6 mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span className="text-xs font-medium">Details</span>
            {(changeCount > 0 || agentRequests.length > 0) && (
              <span className="absolute top-1 right-6 bg-red-500 text-white text-xs w-5 h-5 rounded-full flex items-center justify-center">
                {changeCount + agentRequests.length}
              </span>
            )}
          </button>
        </div>
      </div>

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

      {/* Version Comparison Modal */}
      <VersionComparisonModal
        isOpen={showVersionComparison}
        onClose={() => {
          setShowVersionComparison(false);
          setComparisonData(null);
        }}
        comparison={comparisonData}
      />
    </div>
  );
}
