'use client';

import React, { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap } from 'react-leaflet';
import L from 'leaflet';
import { DayItinerary, ActivityType } from '@/lib/types';

interface TripMapProps {
  itinerary: DayItinerary[];
  selectedLocation?: [number, number];
  hoveredLocation?: [number, number];
}

// Color scheme for activity types
const ACTIVITY_TYPE_COLORS: Record<ActivityType, { primary: string; label: string; icon: string }> = {
  hotel: { primary: '#3b82f6', label: 'Accommodation', icon: '🏨' },
  activity: { primary: '#f59e0b', label: 'Activity', icon: '🎯' },
  transfer: { primary: '#6b7280', label: 'Transfer', icon: '🚗' },
  flight: { primary: '#8b5cf6', label: 'Flight', icon: '✈️' },
  experience: { primary: '#10b981', label: 'Experience', icon: '⭐' },
  dining: { primary: '#ef4444', label: 'Dining', icon: '🍽️' },
};

// Calculate distance between two coordinates (Haversine formula)
const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number): number => {
  const R = 6371; // Earth's radius in km
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
};

// Estimate travel time based on distance
const estimateTravelTime = (distanceKm: number): string => {
  // Assume average speed of 60 km/h for road travel
  const hours = distanceKm / 60;
  if (hours < 1) {
    return `${Math.round(hours * 60)} min`;
  }
  const h = Math.floor(hours);
  const m = Math.round((hours - h) * 60);
  return m > 0 ? `${h}h ${m}m` : `${h}h`;
};

// Component to handle map center changes
function MapController({ center }: { center: [number, number] }) {
  const map = useMap();

  useEffect(() => {
    if (center) {
      map.setView(center, 9, { animate: true });
    }
  }, [center, map]);

  return null;
}

// Component to fit map bounds to show all markers
function FitBounds({ locations }: { locations: [number, number][] }) {
  const map = useMap();

  useEffect(() => {
    if (locations && locations.length > 0) {
      const bounds = L.latLngBounds(locations);
      map.fitBounds(bounds, { padding: [50, 50], maxZoom: 10 });
    }
  }, [locations, map]);

  return null;
}

export default function TripMap({ itinerary, selectedLocation, hoveredLocation }: TripMapProps) {
  const [mounted, setMounted] = useState(false);
  const [showRoutes, setShowRoutes] = useState(true);
  const [showLegend, setShowLegend] = useState(true);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div className="w-full h-full bg-gray-100 flex items-center justify-center">
        <p className="text-gray-500">Loading map...</p>
      </div>
    );
  }

  // Collect all locations from all days with full details
  interface MapLocation {
    coordinates: [number, number];
    name: string;
    title: string;
    type: ActivityType;
    dayNumber: number;
    date: string;
    time?: string;
    selectedOption: any;
    isModified: boolean;
    agentRecommendedOptionId: string;
  }

  const allLocations: MapLocation[] = itinerary.flatMap(day =>
    day.activities
      .filter(slot => slot.location)
      .map(slot => {
        const selectedOption = slot.options.find(opt => opt.id === slot.selectedOptionId);
        const isModified = slot.selectedOptionId !== slot.agentRecommendedOptionId;
        return {
          coordinates: slot.location!.coordinates,
          name: slot.location!.name,
          title: slot.title,
          type: slot.type,
          dayNumber: day.dayNumber,
          date: day.date,
          time: slot.time,
          selectedOption,
          isModified,
          agentRecommendedOptionId: slot.agentRecommendedOptionId,
        };
      })
  );

  // Handle duplicate coordinates by adding small offsets
  const locationsWithOffsets = allLocations.map((location, index) => {
    // Count how many previous locations have the same coordinates
    const duplicatesBefore = allLocations.slice(0, index).filter(
      loc => loc.coordinates[0] === location.coordinates[0] &&
             loc.coordinates[1] === location.coordinates[1]
    ).length;

    if (duplicatesBefore > 0) {
      // Add a small offset (0.002 degrees ≈ 222 meters)
      const offset = 0.002 * duplicatesBefore;
      return {
        ...location,
        coordinates: [
          location.coordinates[0] + offset,
          location.coordinates[1] + offset,
        ] as [number, number],
      };
    }
    return location;
  });

  // Create route lines between consecutive locations (using original coordinates for route calculation)
  const routes: Array<{ positions: [number, number][]; distance: number; time: string }> = [];
  for (let i = 0; i < allLocations.length - 1; i++) {
    const from = allLocations[i];
    const to = allLocations[i + 1];
    const distance = calculateDistance(
      from.coordinates[0],
      from.coordinates[1],
      to.coordinates[0],
      to.coordinates[1]
    );
    routes.push({
      positions: [from.coordinates, to.coordinates],
      distance: Math.round(distance),
      time: estimateTravelTime(distance),
    });
  }

  // Calculate center point (New Zealand center or average of all locations)
  const center: [number, number] = selectedLocation || [-41.0, 173.0];

  // Create color-coded icons for different activity types
  const createActivityIcon = (type: ActivityType, isModified: boolean) => {
    const typeConfig = ACTIVITY_TYPE_COLORS[type];
    const color = typeConfig.primary;
    const strokeColor = isModified ? '#fbbf24' : color; // Amber border for modified
    const strokeWidth = isModified ? 3 : 2;

    const svgIcon = `
      <svg width="32" height="45" viewBox="0 0 32 45" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <filter id="shadow-${type}" x="-50%" y="-50%" width="200%" height="200%">
            <feDropShadow dx="0" dy="2" stdDeviation="2" flood-opacity="0.3"/>
          </filter>
        </defs>
        <path d="M16 0C7.2 0 0 7.2 0 16C0 28 16 45 16 45C16 45 32 28 32 16C32 7.2 24.8 0 16 0Z"
          fill="${color}"
          stroke="${strokeColor}"
          stroke-width="${strokeWidth}"
          filter="url(#shadow-${type})"/>
        <circle cx="16" cy="16" r="8" fill="white" opacity="0.9"/>
        <text x="16" y="20" text-anchor="middle" font-size="12" fill="${color}">${typeConfig.icon}</text>
      </svg>
    `;

    return L.divIcon({
      html: svgIcon,
      className: 'custom-marker',
      iconSize: [32, 45],
      iconAnchor: [16, 45],
      popupAnchor: [0, -45],
    });
  };

  return (
    <div className="relative w-full h-full">
      {/* Map Controls */}
      <div className="absolute top-4 right-4 z-[40] flex flex-col gap-2">
        <button
          onClick={() => setShowRoutes(!showRoutes)}
          className="le-button-primary flex items-center gap-2"
          style={{
            fontSize: 'var(--le-text-xs)',
            padding: 'var(--le-space-2) var(--le-space-3)',
            background: showRoutes ? 'var(--le-charcoal)' : 'var(--le-white)',
            color: showRoutes ? 'var(--le-white)' : 'var(--le-charcoal)',
            border: showRoutes ? 'none' : '1px solid var(--le-gray-300)',
            boxShadow: 'var(--le-shadow-md)',
          }}
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
          </svg>
          Routes
        </button>
        <button
          onClick={() => setShowLegend(!showLegend)}
          className="le-button-primary flex items-center gap-2"
          style={{
            fontSize: 'var(--le-text-xs)',
            padding: 'var(--le-space-2) var(--le-space-3)',
            background: showLegend ? 'var(--le-charcoal)' : 'var(--le-white)',
            color: showLegend ? 'var(--le-white)' : 'var(--le-charcoal)',
            border: showLegend ? 'none' : '1px solid var(--le-gray-300)',
            boxShadow: 'var(--le-shadow-md)',
          }}
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          Legend
        </button>
      </div>

      {/* Legend */}
      {showLegend && (
        <div className="absolute top-4 left-4 z-[40] max-w-xs" style={{
          background: 'var(--le-white)',
          padding: 'var(--le-space-4)',
          borderRadius: 'var(--le-radius-md)',
          boxShadow: 'var(--le-shadow-lg)',
          border: '1px solid var(--le-gray-200)'
        }}>
          <h3 style={{
            fontSize: 'var(--le-text-sm)',
            fontWeight: 'var(--le-font-bold)',
            color: 'var(--le-gray-900)',
            marginBottom: 'var(--le-space-3)'
          }}>
            Map Legend
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--le-space-2)' }}>
            {Object.entries(ACTIVITY_TYPE_COLORS).map(([type, config]) => (
              <div key={type} className="flex items-center gap-3">
                <div
                  className="w-3 h-3 rounded-full"
                  style={{ backgroundColor: config.primary }}
                />
                <span className="flex items-center gap-1" style={{
                  fontSize: 'var(--le-text-xs)',
                  color: 'var(--le-gray-700)'
                }}>
                  <span>{config.icon}</span>
                  <span>{config.label}</span>
                </span>
              </div>
            ))}
            <div style={{
              paddingTop: 'var(--le-space-2)',
              borderTop: '1px solid var(--le-gray-200)',
              marginTop: 'var(--le-space-2)'
            }}>
              <div className="flex items-center gap-3">
                <div className="w-3 h-3 rounded-full border-2 border-amber-400" />
                <span style={{
                  fontSize: 'var(--le-text-xs)',
                  color: 'var(--le-gray-700)'
                }}>
                  Modified Selection
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      <MapContainer
        center={center}
        zoom={6}
        style={{ height: '100%', width: '100%' }}
        className="z-0"
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {/* Priority: hoveredLocation > selectedLocation > fit all bounds */}
        {hoveredLocation ? (
          <MapController center={hoveredLocation} />
        ) : selectedLocation ? (
          <MapController center={selectedLocation} />
        ) : (
          <FitBounds locations={locationsWithOffsets.map(loc => loc.coordinates)} />
        )}

        {/* Route Lines */}
        {showRoutes && routes.map((route, index) => (
          <Polyline
            key={`route-${index}`}
            positions={route.positions}
            pathOptions={{
              color: '#3b82f6',
              weight: 3,
              opacity: 0.6,
              dashArray: '10, 10',
            }}
          >
            <Popup>
              <div className="p-2 text-center">
                <p className="text-xs font-semibold text-gray-900">
                  {route.distance} km
                </p>
                <p className="text-xs text-gray-600">
                  ~{route.time} drive
                </p>
              </div>
            </Popup>
          </Polyline>
        ))}

        {/* Markers for each location */}
        {locationsWithOffsets.map((location, index) => (
          <Marker
            key={`${location.title}-${index}`}
            position={location.coordinates}
            icon={createActivityIcon(location.type, location.isModified)}
          >
            <Popup maxWidth={300}>
              <div className="p-3">
                {/* Header */}
                <div className="flex items-start justify-between mb-2">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-lg">{ACTIVITY_TYPE_COLORS[location.type].icon}</span>
                      <h3 className="font-bold text-sm text-gray-900">{location.title}</h3>
                    </div>
                    <p className="text-xs text-gray-600 mb-1">
                      {ACTIVITY_TYPE_COLORS[location.type].label}
                    </p>
                  </div>
                  {location.isModified && (
                    <span className="px-2 py-0.5 bg-amber-100 text-amber-800 text-xs font-semibold rounded">
                      Modified
                    </span>
                  )}
                </div>

                {/* Selected Option */}
                {location.selectedOption && (
                  <div className="mb-3">
                    <p className="text-sm font-semibold text-blue-700 mb-1">
                      {location.selectedOption.name}
                    </p>
                    {location.selectedOption.photos && location.selectedOption.photos.length > 0 && (
                      <img
                        src={location.selectedOption.photos[0]}
                        alt={location.selectedOption.name}
                        className="w-full h-32 object-cover rounded-lg mb-2"
                        onError={(e) => {
                          (e.target as HTMLImageElement).style.display = 'none';
                        }}
                      />
                    )}
                    <p className="text-xs text-gray-600 mb-2">
                      {location.selectedOption.description}
                    </p>
                  </div>
                )}

                {/* Location & Time Details */}
                <div className="space-y-1 mb-3 pb-3 border-b border-gray-200">
                  <div className="flex items-center gap-2 text-xs text-gray-700">
                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    </svg>
                    <span>{location.name}</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-gray-700">
                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    <span>Day {location.dayNumber} • {location.date}</span>
                  </div>
                  {location.time && (
                    <div className="flex items-center gap-2 text-xs text-gray-700">
                      <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <span>{location.time}</span>
                    </div>
                  )}
                </div>

                {/* Pricing */}
                {location.selectedOption && (
                  <div className="space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-gray-600">Price:</span>
                      <span className="text-sm font-bold text-gray-900">
                        ${location.selectedOption.price.toLocaleString()}
                      </span>
                    </div>
                    {location.selectedOption.statusCredits > 0 && (
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-gray-600">Status Credits:</span>
                        <span className="text-xs font-semibold text-blue-600">
                          +{location.selectedOption.statusCredits} pts
                        </span>
                      </div>
                    )}
                  </div>
                )}

                {/* Distance to next location */}
                {index < locationsWithOffsets.length - 1 && routes[index] && (
                  <div className="mt-3 pt-3 border-t border-gray-200">
                    <div className="flex items-center gap-2 text-xs text-gray-600">
                      <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                      </svg>
                      <span>
                        {routes[index].distance} km • ~{routes[index].time} to next stop
                      </span>
                    </div>
                  </div>
                )}
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
}
