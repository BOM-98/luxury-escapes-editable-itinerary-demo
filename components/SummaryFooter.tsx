'use client';

import React, { useState, useEffect } from 'react';
import { TripSummary } from '@/lib/types';

interface SummaryFooterProps {
  summary: TripSummary;
  onLockPrice?: () => void;
}

export default function SummaryFooter({ summary, onLockPrice }: SummaryFooterProps) {
  const [showBreakdown, setShowBreakdown] = useState(false);
  const [breakdownView, setBreakdownView] = useState<'category' | 'day'>('category');
  const [timeRemaining, setTimeRemaining] = useState<string>('');

  // Countdown timer for quote expiry
  useEffect(() => {
    if (!summary.quoteExpiresAt) return;

    const updateCountdown = () => {
      const now = new Date().getTime();
      const expiry = new Date(summary.quoteExpiresAt!).getTime();
      const diff = expiry - now;

      if (diff <= 0) {
        setTimeRemaining('Expired');
        return;
      }

      const hours = Math.floor(diff / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((diff % (1000 * 60)) / 1000);

      setTimeRemaining(`${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`);
    };

    updateCountdown();
    const interval = setInterval(updateCountdown, 1000);

    return () => clearInterval(interval);
  }, [summary.quoteExpiresAt]);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const formatPoints = (points: number) => {
    return `+${new Intl.NumberFormat('en-US').format(points)} pts`;
  };

  const formatDelta = (current: number, original: number, isCurrency: boolean = true) => {
    const delta = current - original;
    if (delta === 0) return null;

    const sign = delta > 0 ? '+' : '';
    const formatted = isCurrency
      ? formatCurrency(delta)
      : `${sign}${delta}`;

    return (
      <span className={`text-sm font-medium ml-2 ${delta > 0 ? 'text-red-600' : 'text-green-600'}`}>
        ({formatted})
      </span>
    );
  };

  const hasChanges = summary.changeCount > 0;
  const priceDelta = summary.subtotal - summary.originalPricing.subtotal;

  return (
    <div className="bg-white border-t-2 border-gray-300 shadow-lg">
      {/* Main summary bar */}
      <div className="px-6 py-4">
        <div className="max-w-7xl mx-auto">
          {/* Change indicator */}
          {hasChanges && (
            <div className="mb-3 flex items-center justify-between bg-blue-50 border border-blue-200 rounded-lg px-4 py-2">
              <div className="flex items-center gap-2">
                <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span className="text-sm font-medium text-blue-900">
                  You've modified {summary.changeCount} {summary.changeCount === 1 ? 'item' : 'items'}
                </span>
              </div>
              {priceDelta !== 0 && (
                <div className="text-sm">
                  <span className="text-blue-700">Price change: </span>
                  <span className={`font-bold ${priceDelta > 0 ? 'text-red-600' : 'text-green-600'}`}>
                    {formatCurrency(priceDelta)}
                  </span>
                </div>
              )}
            </div>
          )}

          <div className="flex items-start gap-6">
            {/* Price summary grid */}
            <div className="flex-1 grid grid-cols-4 gap-6">
              {/* Subtotal */}
              <div>
                <p className="text-sm text-gray-600 mb-1">Subtotal:</p>
                <div className="flex items-baseline">
                  <p className="text-2xl font-bold text-gray-900">
                    {formatCurrency(summary.subtotal)}
                  </p>
                  {formatDelta(summary.subtotal, summary.originalPricing.subtotal)}
                </div>
                {hasChanges && (
                  <p className="text-xs text-gray-500 mt-1">
                    Original: {formatCurrency(summary.originalPricing.subtotal)}
                  </p>
                )}
              </div>

              {/* Status Credits */}
              <div>
                <p className="text-sm text-gray-600 mb-1">Status Credits</p>
                <div className="flex items-baseline">
                  <p className="text-2xl font-bold text-gray-900">
                    {formatPoints(summary.statusCredits)}
                  </p>
                  {formatDelta(summary.statusCredits, summary.originalPricing.statusCredits, false)}
                </div>
                {hasChanges && (
                  <p className="text-xs text-gray-500 mt-1">
                    Original: {formatPoints(summary.originalPricing.statusCredits)}
                  </p>
                )}
              </div>

              {/* Societé Points */}
              <div>
                <p className="text-sm text-gray-600 mb-1">Societé Points</p>
                <div className="flex items-baseline">
                  <p className="text-2xl font-bold text-gray-900">
                    {formatPoints(summary.societePoints)}
                  </p>
                  {formatDelta(summary.societePoints, summary.originalPricing.societePoints, false)}
                </div>
                {hasChanges && (
                  <p className="text-xs text-gray-500 mt-1">
                    Original: {formatPoints(summary.originalPricing.societePoints)}
                  </p>
                )}
              </div>

              {/* Total */}
              <div className="border-l-2 border-gray-300 pl-6">
                <p className="text-sm text-gray-600 mb-1">Total (incl. taxes & fees):</p>
                <div className="flex items-baseline">
                  <p className="text-2xl font-bold text-blue-600">
                    {formatCurrency(summary.total || 0)}
                  </p>
                  {summary.total && summary.originalPricing.total && formatDelta(summary.total, summary.originalPricing.total)}
                </div>
                {summary.taxes && (
                  <p className="text-xs text-gray-500 mt-1">
                    Taxes: {formatCurrency(summary.taxes)} • Fees: {formatCurrency(summary.fees || 0)}
                  </p>
                )}
              </div>
            </div>

            {/* Action buttons */}
            <div className="flex flex-col gap-2 min-w-[200px]">
              {/* View Breakdown button */}
              <button
                onClick={() => setShowBreakdown(!showBreakdown)}
                className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-900 text-sm font-medium rounded-lg transition-colors flex items-center justify-center gap-2"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                </svg>
                {showBreakdown ? 'Hide' : 'View'} Breakdown
              </button>

              {/* Price lock button */}
              {summary.quoteExpiresAt && !summary.isPriceLocked && onLockPrice && (
                <button
                  onClick={onLockPrice}
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold rounded-lg transition-colors flex items-center justify-center gap-2"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                  Lock Price
                </button>
              )}

              {/* Quote expiry countdown */}
              {summary.quoteExpiresAt && !summary.isPriceLocked && timeRemaining && (
                <div className="px-3 py-1.5 bg-amber-50 border border-amber-200 rounded-lg text-center">
                  <p className="text-xs text-amber-700 font-medium">Quote expires in:</p>
                  <p className={`text-sm font-bold font-mono ${timeRemaining === 'Expired' ? 'text-red-600' : 'text-amber-900'}`}>
                    {timeRemaining}
                  </p>
                </div>
              )}

              {/* Price locked indicator */}
              {summary.isPriceLocked && (
                <div className="px-3 py-2 bg-green-50 border border-green-200 rounded-lg">
                  <div className="flex items-center gap-2 justify-center">
                    <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span className="text-xs text-green-800 font-semibold">Price Locked</span>
                  </div>
                  {summary.priceLockedAt && (
                    <p className="text-xs text-green-600 text-center mt-1">
                      {new Date(summary.priceLockedAt).toLocaleDateString()}
                    </p>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Detailed breakdown panel */}
      {showBreakdown && (
        <div className="border-t border-gray-200 bg-gray-50 px-6 py-4">
          <div className="max-w-7xl mx-auto">
            {/* Breakdown view toggle */}
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-gray-900">Detailed Breakdown</h3>
              <div className="flex gap-2">
                <button
                  onClick={() => setBreakdownView('category')}
                  className={`px-3 py-1.5 text-sm font-medium rounded-lg transition-colors ${
                    breakdownView === 'category'
                      ? 'bg-indigo-600 text-white'
                      : 'bg-white text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  By Category
                </button>
                <button
                  onClick={() => setBreakdownView('day')}
                  className={`px-3 py-1.5 text-sm font-medium rounded-lg transition-colors ${
                    breakdownView === 'day'
                      ? 'bg-indigo-600 text-white'
                      : 'bg-white text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  By Day
                </button>
              </div>
            </div>

            {/* Category breakdown */}
            {breakdownView === 'category' && summary.byCategory && summary.byCategory.length > 0 && (
              <div className="space-y-3">
                {summary.byCategory.map((category) => (
                  <div key={category.category} className="bg-white rounded-lg border border-gray-200 p-4">
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="text-sm font-bold text-gray-900">{category.category}</h4>
                      <div className="text-right">
                        <p className="text-lg font-bold text-gray-900">{formatCurrency(category.subtotal)}</p>
                        <p className="text-xs text-gray-500">
                          {formatPoints(category.statusCredits)} • {formatPoints(category.societePoints)}
                        </p>
                      </div>
                    </div>
                    <div className="space-y-2">
                      {category.items.map((item) => (
                        <div key={item.id} className="flex items-center justify-between text-sm py-1">
                          <span className="text-gray-700">{item.name}</span>
                          <span className="font-medium text-gray-900">{formatCurrency(item.price)}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Day breakdown */}
            {breakdownView === 'day' && summary.byDay && summary.byDay.length > 0 && (
              <div className="space-y-3">
                {summary.byDay.map((day) => (
                  <div key={day.dayNumber} className="bg-white rounded-lg border border-gray-200 p-4">
                    <div className="flex items-center justify-between mb-3">
                      <div>
                        <h4 className="text-sm font-bold text-gray-900">Day {day.dayNumber}</h4>
                        <p className="text-xs text-gray-500">{day.date}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-lg font-bold text-gray-900">{formatCurrency(day.subtotal)}</p>
                        <p className="text-xs text-gray-500">
                          {formatPoints(day.statusCredits)} • {formatPoints(day.societePoints)}
                        </p>
                      </div>
                    </div>
                    <div className="space-y-2">
                      {day.items.map((item) => (
                        <div key={item.id} className="flex items-center justify-between text-sm py-1">
                          <span className="text-gray-700">{item.name}</span>
                          <span className="font-medium text-gray-900">{formatCurrency(item.price)}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Taxes and fees */}
            <div className="mt-4 bg-white rounded-lg border border-gray-200 p-4">
              <div className="space-y-2 text-sm">
                <div className="flex items-center justify-between">
                  <span className="text-gray-700">Subtotal</span>
                  <span className="font-semibold text-gray-900">{formatCurrency(summary.subtotal)}</span>
                </div>
                {summary.taxes && (
                  <div className="flex items-center justify-between">
                    <span className="text-gray-700">Taxes (10%)</span>
                    <span className="font-medium text-gray-900">{formatCurrency(summary.taxes)}</span>
                  </div>
                )}
                {summary.fees && (
                  <div className="flex items-center justify-between">
                    <span className="text-gray-700">Service Fees</span>
                    <span className="font-medium text-gray-900">{formatCurrency(summary.fees)}</span>
                  </div>
                )}
                <div className="flex items-center justify-between pt-2 border-t border-gray-200">
                  <span className="font-bold text-gray-900">Total</span>
                  <span className="text-xl font-bold text-indigo-600">{formatCurrency(summary.total || 0)}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
