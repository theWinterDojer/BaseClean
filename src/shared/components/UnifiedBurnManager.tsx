import React, { useState, useCallback, useEffect } from 'react';
import { BurnableItem } from '@/types/nft';
import UnifiedBurnConfirmationModal from './UnifiedBurnConfirmationModal';
import UnifiedBurnProgress from './UnifiedBurnProgress';
import { useUnifiedBurn } from '@/shared/hooks/useUnifiedBurn';

interface UnifiedBurnManagerProps {
  selectedItems: BurnableItem[];
  isOpen: boolean;
  onClose: () => void;
  onComplete: () => void;
}

export default function UnifiedBurnManager({
  selectedItems,
  isOpen,
  onClose,
  onComplete
}: UnifiedBurnManagerProps) {
  const [showConfirmation, setShowConfirmation] = useState(true);
  const [showProgress, setShowProgress] = useState(false);
  
  const { isBurning, burnProgress, burnItems, resetBurnProgress, clearSelections } = useUnifiedBurn();

  // Reset state when modal opens/closes
  useEffect(() => {
    if (isOpen) {
      setShowConfirmation(true);
      setShowProgress(false);
      resetBurnProgress();
    }
  }, [isOpen, resetBurnProgress]);

  // Handle burn confirmation
  const handleConfirm = useCallback(async () => {
    setShowConfirmation(false);
    setShowProgress(true);
    
    // Execute burn
    await burnItems(selectedItems);
  }, [selectedItems, burnItems]);

  // Handle manual close from progress modal
  const handleProgressClose = useCallback(() => {
    // Clear selections and complete the flow when user manually closes
    clearSelections();
    onComplete();
    onClose();
  }, [clearSelections, onComplete, onClose]);

  // Handle manual close from confirmation modal
  const handleConfirmationClose = useCallback(() => {
    if (!isBurning) {
      onClose();
    }
  }, [isBurning, onClose]);

  if (!isOpen) return null;

  return (
    <>
      {showConfirmation && (
        <UnifiedBurnConfirmationModal
          selectedItems={selectedItems}
          isOpen={true}
          onClose={handleConfirmationClose}
          onConfirm={handleConfirm}
          isConfirming={false}
        />
      )}
      
      {showProgress && (
        <UnifiedBurnProgress
          burnProgress={burnProgress}
          onClose={handleProgressClose}
        />
      )}
    </>
  );
} 