import { useState, useCallback } from 'react';
import { NFT } from '@/types/nft';
import { useDirectBurner, DirectNFTBurnResult } from '@/lib/directBurner';
import { clearNFTImageCache } from '@/lib/nftApi';

// NFT burn status type for tracking the entire flow
export type NFTBurnFlowStatus = {
  // Confirmation modal state
  isConfirmationOpen: boolean;
  nftsToConfirm: NFT[];
  
  // Burn execution state  
  inProgress: boolean;
  success: boolean;
  error: string | null;
  nftsBurned: number;
  nftsFailed: number;
  nftsRejectedByUser: number;
  
  // Current operation details
  currentStep: 'burning' | 'complete' | null;
  currentStepMessage: string | null;
  currentNFT: NFT | null;
  
  // Progress tracking
  processedNFTs: number;
  totalNFTs: number;
  
  // Results with transaction hashes
  burnResults: DirectNFTBurnResult[];
  
  // Error categorization
  hasUserRejections: boolean;
};

const initialBurnStatus: NFTBurnFlowStatus = {
  isConfirmationOpen: false,
  nftsToConfirm: [],
  inProgress: false,
  success: false,
  error: null,
  nftsBurned: 0,
  nftsFailed: 0,
  nftsRejectedByUser: 0,
  currentStep: null,
  currentStepMessage: null,
  currentNFT: null,
  processedNFTs: 0,
  totalNFTs: 0,
  burnResults: [],
  hasUserRejections: false,
};

/**
 * Custom hook to manage the complete NFT burn flow
 * Similar to useBurnFlow but specific to NFTs
 */
export function useNFTBurnFlow() {
  const [burnStatus, setBurnStatus] = useState<NFTBurnFlowStatus>(initialBurnStatus);
  
  const { 
    burnSingleNFT,
    isBurning, 
    currentNFT,
    nftBurnResults,
    getNFTBurnStats
  } = useDirectBurner();

  // Show confirmation modal for selected NFTs
  const showConfirmation = useCallback(async (nfts: NFT[]) => {
    if (nfts.length === 0) return;
    
    setBurnStatus(prev => ({
      ...prev,
      isConfirmationOpen: true,
      nftsToConfirm: nfts,
      error: null,
    }));
  }, []);

  // Close confirmation modal
  const closeConfirmation = useCallback(() => {
    setBurnStatus(prev => ({
      ...prev,
      isConfirmationOpen: false,
      nftsToConfirm: [],
      error: null,
    }));
  }, []);

  // Execute the burn operation
  const executeBurn = useCallback(async (
    walletAddress: string,
    onNFTsRefreshed?: () => void,
    onSelectedNFTsUpdated?: (clearFn: () => void) => void,
    nftsToProcess?: NFT[]
  ) => {
    // Use passed NFTs or fall back to current state
    const nfts = nftsToProcess || burnStatus.nftsToConfirm;
    
    if (nfts.length === 0) {
      console.error('No NFTs to burn');
      return;
    }
    
    try {
      // Close the confirmation modal and start burn process
      setBurnStatus(prev => ({
        ...prev,
        isConfirmationOpen: false,
        inProgress: true,
        success: false,
        error: null,
        nftsBurned: 0,
        nftsFailed: 0,
        nftsRejectedByUser: 0,
        currentStep: 'burning',
        currentStepMessage: `Burning ${nfts.length} NFT${nfts.length > 1 ? 's' : ''}...`,
        totalNFTs: nfts.length,
        processedNFTs: 0,
        burnResults: [],
      }));
      
      // Execute the burns with progress tracking
      const results: DirectNFTBurnResult[] = [];
      
      for (let i = 0; i < nfts.length; i++) {
        const nft = nfts[i];
        
        // Update current NFT being processed
        setBurnStatus(prev => ({
          ...prev,
          currentNFT: nft,
          currentStepMessage: `Burning ${nft.name || `NFT #${nft.token_id}`} (${i + 1}/${nfts.length})...`,
        }));
        
        try {
          // Use burnSingleNFT for individual burns
          const result = await burnSingleNFT(nft, walletAddress);
          results.push(result);
          
          // Update progress after each NFT
          const userRejections = results.filter(r => r.isUserRejection).length;
          setBurnStatus(prev => ({
            ...prev,
            processedNFTs: i + 1,
            burnResults: [...prev.burnResults, result],
            nftsBurned: results.filter(r => r.success).length,
            nftsFailed: results.filter(r => !r.success && !r.isUserRejection).length,
            nftsRejectedByUser: userRejections,
            hasUserRejections: userRejections > 0,
          }));
          
        } catch (error) {
          console.error(`Error processing NFT burn ${i + 1}:`, error);
          // This shouldn't happen as burnSingleNFT handles its own errors
          // but just in case...
          const userRejections = results.filter(r => r.isUserRejection).length;
          setBurnStatus(prev => ({
            ...prev,
            processedNFTs: i + 1,
            nftsFailed: prev.nftsFailed + 1,
            nftsRejectedByUser: userRejections,
            hasUserRejections: userRejections > 0,
          }));
        }
      }
      
      // Categorize final results
      const successfulBurns = results.filter(r => r.success);
      const userRejections = results.filter(r => r.isUserRejection);
      const actualFailures = results.filter(r => !r.success && !r.isUserRejection);
      
      // Determine completion message
      let completionMessage = '';
      if (successfulBurns.length > 0) {
        completionMessage = `🎉 Successfully burned ${successfulBurns.length} NFT${successfulBurns.length > 1 ? 's' : ''}!`;
        if (userRejections.length > 0) {
          completionMessage += ` (${userRejections.length} cancelled by user)`;
        }
        if (actualFailures.length > 0) {
          completionMessage += ` (${actualFailures.length} failed)`;
        }
      } else if (userRejections.length === nfts.length) {
        completionMessage = '⏭️ All transactions were cancelled. You can try again anytime.';
      } else if (userRejections.length > 0) {
        completionMessage = `⚠️ ${userRejections.length} transaction${userRejections.length > 1 ? 's' : ''} cancelled, ${actualFailures.length} failed due to NFT contract restrictions.`;
      } else {
        completionMessage = `❌ Unable to burn NFTs. These NFTs likely have transfer restrictions that prevent burning.`;
      }
      
      setBurnStatus(prev => ({
        ...prev,
        inProgress: false,
        success: true,
        error: null,
        nftsBurned: successfulBurns.length,
        nftsFailed: actualFailures.length,
        nftsRejectedByUser: userRejections.length,
        hasUserRejections: userRejections.length > 0,
        currentStep: 'complete',
        currentStepMessage: completionMessage,
        processedNFTs: nfts.length,
        currentNFT: null,
        burnResults: results,
      }));
      
      // Clear selected NFTs that were successfully burned
      if (successfulBurns.length > 0 && onSelectedNFTsUpdated) {
        // Clear all selected NFTs after successful burns
        onSelectedNFTsUpdated(() => {
          // This will be called with clearAllSelectedItems
        });
        
        // Clear NFT image cache and refresh after burning
        if (onNFTsRefreshed) {
          setTimeout(() => {
            clearNFTImageCache();
            onNFTsRefreshed();
          }, 2000); // 2 second delay to allow blockchain to update
        }
      }
      
    } catch (error) {
      setBurnStatus(prev => ({
        ...prev,
        inProgress: false,
        success: false,
        error: error instanceof Error ? error.message : 'Unexpected error occurred',
      }));
    }
  }, [burnSingleNFT]);

  // Reset burn status
  const resetBurnStatus = useCallback(() => {
    setBurnStatus(initialBurnStatus);
  }, []);

  // Check if we're currently waiting for wallet transaction confirmation
  // This is true when burn has started but no NFTs have been processed yet
  const isWaitingForConfirmation = burnStatus.inProgress && burnStatus.processedNFTs === 0 && burnStatus.burnResults.length === 0;

  return {
    burnStatus,
    showConfirmation,
    closeConfirmation,
    executeBurn,
    resetBurnStatus,
    isWaitingForConfirmation,
    
    // Contract status for UI
    isBurning,
    currentNFT,
    nftBurnResults,
    getNFTBurnStats
  };
} 