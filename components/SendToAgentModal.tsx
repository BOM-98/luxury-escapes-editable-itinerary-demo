import React, { useState } from 'react';
import { DayItinerary, AgentRequest, AgentRequestType } from '@/lib/types';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';

interface SendToAgentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (request: Omit<AgentRequest, 'id' | 'createdAt' | 'status'>) => void;
  itinerary: DayItinerary[];
  modifiedCount: number;
  priceDelta: number;
}

export default function SendToAgentModal({
  isOpen,
  onClose,
  onSubmit,
  itinerary,
  modifiedCount,
  priceDelta,
}: SendToAgentModalProps) {
  const [requestType, setRequestType] = useState<AgentRequestType>('general');
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');

  const requestTypes: Array<{ value: AgentRequestType; label: string; description: string }> = [
    { value: 'general', label: 'General Question', description: 'Ask about your itinerary or options' },
    { value: 'custom_option', label: 'Request Custom Option', description: 'Request an option not in the list' },
    { value: 'date_change', label: 'Change Dates', description: 'Modify travel dates or duration' },
    { value: 'destination_add', label: 'Add Destination', description: 'Add a new city or location' },
    { value: 'group_change', label: 'Change Group Size', description: 'Add or remove travelers' },
    { value: 'special_request', label: 'Special Request', description: 'Dietary, accessibility, or other needs' },
  ];

  // Get list of modified items
  const modifiedItems: string[] = [];
  itinerary.forEach((day, dayIndex) => {
    day.activities.forEach((activitySlot) => {
      if (activitySlot.selectedOptionId !== activitySlot.agentRecommendedOptionId) {
        const selectedOption = activitySlot.options.find(
          opt => opt.id === activitySlot.selectedOptionId
        );
        if (selectedOption) {
          modifiedItems.push(`Day ${dayIndex + 1}: ${activitySlot.title} → ${selectedOption.name}`);
        }
      }
    });
  });

  const handleSubmit = () => {
    if (!subject.trim() || !message.trim()) {
      return;
    }

    onSubmit({
      type: requestType,
      subject: subject.trim(),
      message: message.trim(),
      customerChanges: modifiedItems,
      priceDelta,
    });

    // Reset form
    setRequestType('general');
    setSubject('');
    setMessage('');
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold flex items-center gap-2">
            <svg className="w-7 h-7 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
            </svg>
            Send Message to Agent
          </DialogTitle>
          <p className="text-sm text-gray-600 mt-2">
            Your agent will review your request and respond within 24 hours.
          </p>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Current Changes Summary */}
          {modifiedCount > 0 && (
            <div className="bg-blue-50 border-2 border-blue-200 rounded-lg p-4">
              <h3 className="text-sm font-bold text-blue-900 mb-2">Your Current Changes:</h3>
              <div className="space-y-1">
                {modifiedItems.map((item, idx) => (
                  <p key={idx} className="text-xs text-blue-800">• {item}</p>
                ))}
              </div>
              <div className="mt-3 pt-3 border-t border-blue-200">
                <p className="text-sm font-semibold text-blue-900">
                  Price Impact: {priceDelta > 0 ? '+' : ''}{priceDelta < 0 ? '-' : ''}${Math.abs(priceDelta).toLocaleString()}
                </p>
              </div>
            </div>
          )}

          {/* Request Type */}
          <div>
            <label className="block text-sm font-semibold text-gray-900 mb-2">
              Request Type
            </label>
            <div className="grid grid-cols-2 gap-3">
              {requestTypes.map((type) => (
                <button
                  key={type.value}
                  onClick={() => setRequestType(type.value)}
                  className={`p-3 text-left border-2 rounded-lg transition-all ${
                    requestType === type.value
                      ? 'border-indigo-600 bg-indigo-50'
                      : 'border-gray-200 hover:border-gray-300 bg-white'
                  }`}
                >
                  <p className={`text-sm font-semibold ${
                    requestType === type.value ? 'text-indigo-900' : 'text-gray-900'
                  }`}>
                    {type.label}
                  </p>
                  <p className={`text-xs mt-0.5 ${
                    requestType === type.value ? 'text-indigo-700' : 'text-gray-600'
                  }`}>
                    {type.description}
                  </p>
                </button>
              ))}
            </div>
          </div>

          {/* Subject */}
          <div>
            <label htmlFor="subject" className="block text-sm font-semibold text-gray-900 mb-2">
              Subject
            </label>
            <input
              id="subject"
              type="text"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              placeholder="e.g., Question about Hobbiton tour upgrade"
              className="w-full px-4 py-2.5 border-2 border-gray-300 rounded-lg focus:border-indigo-600 focus:ring-2 focus:ring-indigo-200 outline-none transition-all"
            />
          </div>

          {/* Message */}
          <div>
            <label htmlFor="message" className="block text-sm font-semibold text-gray-900 mb-2">
              Message
            </label>
            <textarea
              id="message"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Describe your request in detail. The more information you provide, the faster your agent can respond..."
              rows={6}
              className="w-full px-4 py-2.5 border-2 border-gray-300 rounded-lg focus:border-indigo-600 focus:ring-2 focus:ring-indigo-200 outline-none resize-none transition-all"
            />
          </div>

          {/* Help Text */}
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <svg className="w-5 h-5 text-gray-600 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <div>
                <p className="text-sm font-semibold text-gray-900">What happens next?</p>
                <ul className="text-xs text-gray-600 mt-2 space-y-1">
                  <li>• Your agent will review your request within 24 hours</li>
                  <li>• They may update your itinerary or suggest alternatives</li>
                  <li>• You'll receive an email notification when they respond</li>
                  <li>• Your current changes are saved and won't be lost</li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        <DialogFooter>
          <div className="flex items-center gap-3 w-full">
            <button
              onClick={onClose}
              className="flex-1 px-4 py-2.5 text-gray-700 hover:text-gray-900 bg-white hover:bg-gray-100 border-2 border-gray-300 rounded-lg font-semibold transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleSubmit}
              disabled={!subject.trim() || !message.trim()}
              className={`flex-1 px-4 py-2.5 text-white rounded-lg font-semibold transition-all shadow-md ${
                !subject.trim() || !message.trim()
                  ? 'bg-gray-400 cursor-not-allowed'
                  : 'bg-indigo-600 hover:bg-indigo-700 hover:shadow-lg'
              }`}
            >
              Send to Agent
            </button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
