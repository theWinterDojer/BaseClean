import React, { useCallback } from 'react';
import { useSelectedItems } from '@/contexts/SelectedItemsContext';

interface FloatingActionBarProps {
  onDeselectAll: () => void;
}

export default function FloatingActionBar({
  onDeselectAll
}: FloatingActionBarProps) {
  const { 
    selectedTokensCount, 
    selectedNFTsTotalQuantity,
    selectedItemsTotalQuantity,
    openBurnModal,
    isBurnModalOpen
  } = useSelectedItems();

  // Handle burn button click - must be defined before early return
  const handleBurnClick = useCallback(() => {
    // Always use the unified burn modal from context for consistency
    // This ensures burnStatus.isConfirmationOpen is properly set for hiding the FloatingActionBar
    openBurnModal();
  }, [openBurnModal]);

  // Only render when items are selected AND no burn process is active
  if (selectedItemsTotalQuantity === 0) {
    return null;
  }

  // Hide during the entire burn flow (confirmation and progress modals)
  if (isBurnModalOpen) {
    return null;
  }

  // Determine what type of items are selected
  const hasTokens = selectedTokensCount > 0;
  const hasNFTs = selectedNFTsTotalQuantity > 0;
  const isMixed = hasTokens && hasNFTs;

  // Generate appropriate labels using quantity-aware counts
  let selectionLabel = '';
  
  if (isMixed) {
    selectionLabel = `${selectedItemsTotalQuantity} Items Selected`;
  } else if (hasTokens) {
    selectionLabel = `${selectedTokensCount} Token${selectedTokensCount > 1 ? 's' : ''} Selected`;
  } else if (hasNFTs) {
    // Use total quantity for NFTs (accounts for ERC-1155 quantities)
    selectionLabel = `${selectedNFTsTotalQuantity} NFT${selectedNFTsTotalQuantity > 1 ? 's' : ''} Selected`;
  }

  return (
    <div 
      className="fixed bottom-6 md:bottom-12 left-4 right-4 z-50 transition-all duration-300 ease-in-out animate-in slide-in-from-bottom-2"
    >
      <div className="max-w-4xl mx-auto">
        <div 
          className="bg-gradient-to-r from-blue-900/95 to-blue-950/95 border-2 border-white/25 rounded-xl p-4 md:p-7 transition-all duration-300 shadow-2xl"
          style={{
            boxShadow: '0 25px 60px -12px rgba(0, 0, 0, 0.5), 0 0 25px rgba(0, 0, 0, 0.4), 0 0 20px rgba(255, 255, 255, 0.12), 0 0 0 1px rgba(59, 130, 246, 0.3)'
          }}
        >
          <div className="flex items-center justify-between gap-3 md:gap-4">
            {/* Left side - Selection info */}
            <div className="flex items-center gap-2 md:gap-3">
              <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center shadow-lg flex-shrink-0 ring-2 ring-white/30">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-white" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
              </div>
              <div>
                <h4 className="text-base md:text-lg font-bold text-white leading-tight drop-shadow-md">
                  {selectionLabel}
                </h4>
                <p className="text-xs text-blue-200 font-medium drop-shadow-sm">
                  {isMixed ? 'Ready to burn from your wallet' : hasTokens ? 'Ready to clean from your wallet' : 'Ready to burn from your wallet'}
                </p>
              </div>
            </div>
            
            {/* Right side - Action buttons */}
            <div className="flex items-center gap-2 md:gap-3">
              {/* Deselect All Button */}
              <button
                onClick={onDeselectAll}
                className="px-3 py-2 bg-white/20 hover:bg-white/30 text-white rounded-lg text-sm font-medium transition-all duration-200 shadow-lg hover:shadow-xl flex items-center gap-2 border border-white/30 flex-shrink-0"
                aria-label="Deselect all items"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
                <span className="hidden sm:inline">Deselect All</span>
                <span className="sm:hidden">Clear</span>
              </button>
              
              {/* Burn Selected Button */}
              <button
                onClick={handleBurnClick}
                className="px-4 py-2 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-500 hover:to-red-600 text-white rounded-lg text-sm font-bold transition-all duration-200 shadow-xl hover:shadow-2xl hover:scale-105 flex items-center gap-2 border border-red-400/60 flex-shrink-0 ring-2 ring-white/30"
                aria-label={`Burn ${selectedItemsTotalQuantity} selected items`}
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M12.395 2.553a1 1 0 00-1.45-.385c-.345.23-.614.558-.822.88-.214.33-.403.713-.57 1.116-.334.804-.614 1.768-.84 2.734a31.365 31.365 0 00-.613 3.58 2.64 2.64 0 01-.945-1.067c-.328-.68-.398-1.534-.398-2.654A1 1 0 005.05 6.05 6.981 6.981 0 003 11a7 7 0 1011.95-4.95c-.592-.591-.98-.985-1.348-1.467-.363-.476-.724-1.063-1.207-2.03zM12.12 15.12A3 3 0 017 13s.879.5 2.5.5c0-1 .5-4 1.25-4.5.5 1 .786 1.293 1.371 1.879A2.99 2.99 0 0113 13a2.99 2.99 0 01-.879 2.121z" clipRule="evenodd" />
                </svg>
                <span>Burn</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 