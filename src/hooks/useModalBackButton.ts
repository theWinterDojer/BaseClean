import { useEffect, useRef, useCallback } from 'react';

/**
 * Custom hook to handle browser back button for modals
 * When a modal is open and the back button is pressed, this hook will close the modal
 * instead of navigating to the previous page.
 * 
 * @param isOpen - Whether the modal is currently open
 * @param onClose - Function to call when the modal should be closed
 */
export function useModalBackButton(isOpen: boolean, onClose: () => void): void {
  const hasAddedHistoryState = useRef(false);
  const isOpenRef = useRef(isOpen);
  const onCloseRef = useRef(onClose);

  // Keep refs updated with current values
  isOpenRef.current = isOpen;
  onCloseRef.current = onClose;

  // Create stable handler that uses current ref values
  const handlePopState = useCallback(() => {
    // When back button is pressed, if modal is open, close it
    if (isOpenRef.current) {
      onCloseRef.current();
    }
  }, []);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    if (isOpen && !hasAddedHistoryState.current) {
      // Modal just opened - push a fake history state
      window.history.pushState({ modalBackButton: true }, '', window.location.href);
      hasAddedHistoryState.current = true;
      
      // Start listening for back button
      window.addEventListener('popstate', handlePopState);
    }

    if (!isOpen && hasAddedHistoryState.current) {
      // Modal closed normally - stop listening and reset
      window.removeEventListener('popstate', handlePopState);
      hasAddedHistoryState.current = false;
    }

    // Cleanup when effect re-runs or component unmounts
    return () => {
      window.removeEventListener('popstate', handlePopState);
    };
  }, [isOpen, handlePopState]);

  // Reset on unmount
  useEffect(() => {
    return () => {
      hasAddedHistoryState.current = false;
    };
  }, []);
} 