import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';

interface ConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  description: string;
  confirmLabel?: string;
  cancelLabel?: string;
  variant?: 'danger' | 'warning' | 'info';
}

export default function ConfirmationModal({
  isOpen,
  onClose,
  onConfirm,
  title,
  description,
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  variant = 'warning',
}: ConfirmationModalProps) {
  const handleConfirm = () => {
    onConfirm();
    onClose();
  };

  const icons = {
    danger: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" style={{ color: 'var(--le-error)' }}>
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
      </svg>
    ),
    warning: (
      <svg className="w-6 h-6 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
      </svg>
    ),
    info: (
      <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle
            className="flex items-center gap-3"
            style={{
              fontSize: 'var(--le-text-lg)',
              fontWeight: 'var(--le-font-bold)',
              color: 'var(--le-gray-900)',
            }}
          >
            {icons[variant]}
            {title}
          </DialogTitle>
        </DialogHeader>

        <div style={{ padding: 'var(--le-space-4) 0' }}>
          <p
            style={{
              fontSize: 'var(--le-text-sm)',
              color: 'var(--le-gray-700)',
              lineHeight: '1.6',
            }}
          >
            {description}
          </p>
        </div>

        <DialogFooter>
          <div className="flex items-center gap-3 w-full">
            <button
              onClick={onClose}
              className="le-button-secondary flex-1"
              style={{
                padding: 'var(--le-space-3)',
              }}
            >
              {cancelLabel}
            </button>
            <button
              onClick={handleConfirm}
              className="flex-1"
              style={{
                padding: 'var(--le-space-3)',
                background: variant === 'danger' ? 'var(--le-error)' : variant === 'warning' ? '#F59E0B' : 'var(--le-primary)',
                color: 'var(--le-white)',
                borderRadius: 'var(--le-radius-md)',
                fontWeight: 'var(--le-font-semibold)',
                fontSize: 'var(--le-text-sm)',
                border: 'none',
                cursor: 'pointer',
                transition: 'opacity var(--le-transition-base)',
              }}
              onMouseEnter={(e) => (e.currentTarget.style.opacity = '0.9')}
              onMouseLeave={(e) => (e.currentTarget.style.opacity = '1')}
            >
              {confirmLabel}
            </button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
