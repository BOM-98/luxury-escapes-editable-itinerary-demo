import React from 'react';
import { AgentRequest } from '@/lib/types';

interface AgentRequestsPanelProps {
  requests: AgentRequest[];
}

export default function AgentRequestsPanel({ requests }: AgentRequestsPanelProps) {
  if (requests.length === 0) {
    return (
      <div className="bg-white border-2 border-gray-200 rounded-lg p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-bold text-gray-900">Agent Requests</h3>
        </div>
        <div className="text-center py-8">
          <svg className="w-16 h-16 text-gray-300 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
          </svg>
          <p className="text-gray-600 text-sm">
            No requests yet.
          </p>
          <p className="text-gray-500 text-xs mt-1">
            Click "Send to Agent" to ask questions or request changes.
          </p>
        </div>
      </div>
    );
  }

  const getStatusColor = (status: AgentRequest['status']) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 border-yellow-300';
      case 'approved':
        return 'bg-green-100 text-green-800 border-green-300';
      case 'rejected':
        return 'bg-red-100 text-red-800 border-red-300';
      case 'requires_info':
        return 'bg-blue-100 text-blue-800 border-blue-300';
    }
  };

  const getStatusLabel = (status: AgentRequest['status']) => {
    switch (status) {
      case 'pending':
        return 'Pending Response';
      case 'approved':
        return 'Approved';
      case 'rejected':
        return 'Not Possible';
      case 'requires_info':
        return 'Needs More Info';
    }
  };

  const getTypeLabel = (type: AgentRequest['type']) => {
    switch (type) {
      case 'general':
        return 'General Question';
      case 'custom_option':
        return 'Custom Option';
      case 'date_change':
        return 'Date Change';
      case 'destination_add':
        return 'Add Destination';
      case 'group_change':
        return 'Group Change';
      case 'special_request':
        return 'Special Request';
    }
  };

  return (
    <div className="bg-white border-2 border-gray-200 rounded-lg overflow-hidden">
      <div className="bg-gray-50 border-b-2 border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-bold text-gray-900">Agent Requests</h3>
          <span className="bg-indigo-600 text-white text-xs px-3 py-1 rounded-full font-semibold">
            {requests.length} {requests.length === 1 ? 'Request' : 'Requests'}
          </span>
        </div>
      </div>

      <div className="max-h-96 overflow-y-auto divide-y divide-gray-200">
        {requests.map((request) => (
          <div key={request.id} className="p-6 hover:bg-gray-50 transition-colors">
            {/* Header */}
            <div className="flex items-start justify-between gap-4 mb-3">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <h4 className="font-bold text-gray-900">{request.subject}</h4>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-gray-500">
                    {request.createdAt.toLocaleDateString()} at {request.createdAt.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                  <span className="text-xs text-gray-400">•</span>
                  <span className="text-xs text-gray-600">{getTypeLabel(request.type)}</span>
                </div>
              </div>
              <span className={`text-xs px-3 py-1 rounded-full font-semibold border ${getStatusColor(request.status)}`}>
                {getStatusLabel(request.status)}
              </span>
            </div>

            {/* Customer Message */}
            <div className="mb-3">
              <p className="text-sm text-gray-700">{request.message}</p>
            </div>

            {/* Changes Summary */}
            {request.customerChanges && request.customerChanges.length > 0 && (
              <div className="mb-3 bg-blue-50 border border-blue-200 rounded-lg p-3">
                <p className="text-xs font-semibold text-blue-900 mb-2">Changes included:</p>
                <div className="space-y-1">
                  {request.customerChanges.map((change, idx) => (
                    <p key={idx} className="text-xs text-blue-800">• {change}</p>
                  ))}
                </div>
                {request.priceDelta !== undefined && request.priceDelta !== 0 && (
                  <div className="mt-2 pt-2 border-t border-blue-200">
                    <p className="text-xs font-semibold text-blue-900">
                      Price impact: {request.priceDelta > 0 ? '+' : ''}{request.priceDelta < 0 ? '-' : ''}${Math.abs(request.priceDelta).toLocaleString()}
                    </p>
                  </div>
                )}
              </div>
            )}

            {/* Agent Response */}
            {request.agentResponse && (
              <div className="bg-indigo-50 border-l-4 border-indigo-600 p-4 rounded">
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-full bg-indigo-600 flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                    A
                  </div>
                  <div className="flex-1">
                    <p className="text-xs font-semibold text-indigo-900 mb-1">
                      Agent Response
                      <span className="text-indigo-600 ml-2 font-normal">
                        {request.agentResponse.respondedAt.toLocaleDateString()} at{' '}
                        {request.agentResponse.respondedAt.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </p>
                    <p className="text-sm text-indigo-800">{request.agentResponse.message}</p>
                    {request.agentResponse.updatedItinerary && (
                      <div className="mt-2 flex items-center gap-1 text-xs text-indigo-700">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        Itinerary updated
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
