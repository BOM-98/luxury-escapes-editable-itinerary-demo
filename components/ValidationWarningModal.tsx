import React from 'react';
import { ValidationWarning } from '@/lib/validation';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';

interface ValidationWarningModalProps {
  isOpen: boolean;
  warnings: ValidationWarning[];
  onClose: () => void;
  onProceed: () => void;
  onCancel: () => void;
}

export default function ValidationWarningModal({
  isOpen,
  warnings,
  onClose,
  onProceed,
  onCancel,
}: ValidationWarningModalProps) {
  const hasErrors = warnings.some(w => w.severity === 'error');
  const errors = warnings.filter(w => w.severity === 'error');
  const warningsOnly = warnings.filter(w => w.severity === 'warning');
  const info = warnings.filter(w => w.severity === 'info');

  const getIcon = (severity: ValidationWarning['severity']) => {
    switch (severity) {
      case 'error':
        return (
          <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        );
      case 'warning':
        return (
          <svg className="w-6 h-6 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
        );
      case 'info':
        return (
          <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        );
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold flex items-center gap-2">
            {hasErrors ? (
              <>
                <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Cannot Proceed
              </>
            ) : (
              <>
                <svg className="w-6 h-6 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
                Review Before Proceeding
              </>
            )}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 max-h-96 overflow-y-auto">
          {/* Errors */}
          {errors.length > 0 && (
            <div className="space-y-2">
              {errors.map((warning, idx) => (
                <div key={idx} className="bg-red-50 border-l-4 border-red-600 p-4 rounded">
                  <div className="flex items-start gap-3">
                    {getIcon('error')}
                    <div className="flex-1">
                      <p className="font-semibold text-red-900">{warning.message}</p>
                      {warning.suggestion && (
                        <p className="text-sm text-red-700 mt-1">{warning.suggestion}</p>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Warnings */}
          {warningsOnly.length > 0 && (
            <div className="space-y-2">
              {warningsOnly.map((warning, idx) => (
                <div key={idx} className="bg-amber-50 border-l-4 border-amber-600 p-4 rounded">
                  <div className="flex items-start gap-3">
                    {getIcon('warning')}
                    <div className="flex-1">
                      <p className="font-semibold text-amber-900">{warning.message}</p>
                      {warning.suggestion && (
                        <p className="text-sm text-amber-700 mt-1">{warning.suggestion}</p>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Info */}
          {info.length > 0 && (
            <div className="space-y-2">
              {info.map((warning, idx) => (
                <div key={idx} className="bg-blue-50 border-l-4 border-blue-600 p-4 rounded">
                  <div className="flex items-start gap-3">
                    {getIcon('info')}
                    <div className="flex-1">
                      <p className="font-semibold text-blue-900">{warning.message}</p>
                      {warning.suggestion && (
                        <p className="text-sm text-blue-700 mt-1">{warning.suggestion}</p>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <DialogFooter>
          <div className="flex items-center gap-3 w-full">
            <button
              onClick={onCancel}
              className="flex-1 px-4 py-2.5 text-gray-700 hover:text-gray-900 bg-white hover:bg-gray-100 border-2 border-gray-300 rounded-lg font-semibold transition-colors"
            >
              Cancel
            </button>
            {!hasErrors && (
              <button
                onClick={onProceed}
                className="flex-1 px-4 py-2.5 text-white bg-blue-600 hover:bg-blue-700 rounded-lg font-semibold transition-colors shadow-md hover:shadow-lg"
              >
                Proceed Anyway
              </button>
            )}
            {hasErrors && (
              <button
                onClick={onCancel}
                className="flex-1 px-4 py-2.5 text-white bg-red-600 hover:bg-red-700 rounded-lg font-semibold transition-colors shadow-md hover:shadow-lg"
              >
                Go Back
              </button>
            )}
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
