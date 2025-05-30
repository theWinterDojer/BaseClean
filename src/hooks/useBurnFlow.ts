import { useState, useCallback } from 'react';
import { Token } from '@/types/token';
import { useDirectTokenBurner, DirectBurnResult } from '@/lib/directBurner';
import { fetchTokenBalances } from '@/lib/api';
import { parseWalletError, isUserRejectionError } from '@/utils/errorHandling';

// Enhanced burn status type for direct transfer approach
export type BurnFlowStatus = {
  // Confirmation modal state
  isConfirmationOpen: boolean;
  tokensToConfirm: Token[];
  
  // Burn execution state  
  inProgress: boolean;
  success: boolean;
  error: string | null;
  tokensBurned: number;
  tokensFailed: number;
  tokensRejectedByUser: number; // New field for user rejections
  
  // Current operation details - simplified for direct transfers
  currentStep: 'burning' | 'complete' | null;
  currentStepMessage: string | null;
  currentToken: Token | null;
  
  // Progress tracking
  processedTokens: number;
  totalTokens: number;
  
  // Results with transaction hashes
  burnResults: DirectBurnResult[];
  
  // Error categorization
  hasUserRejections: boolean; // New field to track if any rejections occurred
};

const initialBurnStatus: BurnFlowStatus = {
  isConfirmationOpen: false,
  tokensToConfirm: [],
  inProgress: false,
  success: false,
  error: null,
  tokensBurned: 0,
  tokensFailed: 0,
  tokensRejectedByUser: 0,
  currentStep: null,
  currentStepMessage: null,
  currentToken: null,
  processedTokens: 0,
  totalTokens: 0,
  burnResults: [],
  hasUserRejections: false,
};

/**
 * Custom hook to manage the complete burn flow using Direct Transfer approach
 * ZERO APPROVALS NEEDED! Each token burns with a simple transfer transaction.
 */
export function useBurnFlow() {
  const [burnStatus, setBurnStatus] = useState<BurnFlowStatus>(initialBurnStatus);
  
  const { 
    burnSingleToken,
    burnMultipleTokens,
    isBurning, 
    currentToken,
    burnResults,
    getBurnStats
  } = useDirectTokenBurner();

  // Show confirmation modal for selected tokens
  const showConfirmation = useCallback(async (tokens: Token[]) => {
    if (tokens.length === 0) return;
    
    setBurnStatus(prev => ({
      ...prev,
      isConfirmationOpen: true,
      tokensToConfirm: tokens,
      error: null, // Clear any previous errors
    }));
  }, []);

  // Close confirmation modal
  const closeConfirmation = useCallback(() => {
    setBurnStatus(prev => ({
      ...prev,
      isConfirmationOpen: false,
      tokensToConfirm: [],
      error: null,
    }));
  }, []);

  // Execute the burn operation using Direct Transfer - ZERO APPROVALS!
  const executeBurn = useCallback(async (
    walletAddress: string,
    onTokensUpdated: (tokens: Token[]) => void,
    onSelectedTokensUpdated: (updateFn: (prev: Set<string>) => Set<string>) => void
  ) => {
    if (burnStatus.tokensToConfirm.length === 0) return;
    
    const tokens = burnStatus.tokensToConfirm;
    
    try {
      // Close the confirmation modal and start burn process
      setBurnStatus(prev => ({
        ...prev,
        isConfirmationOpen: false,
        inProgress: true,
        success: false,
        error: null,
        tokensBurned: 0,
        tokensFailed: 0,
        tokensRejectedByUser: 0,
        currentStep: 'burning',
        currentStepMessage: `Burning ${tokens.length} token${tokens.length > 1 ? 's' : ''}...`,
        totalTokens: tokens.length,
        processedTokens: 0,
        burnResults: [],
      }));
      
      // Execute the direct burns with progress tracking
      const results: DirectBurnResult[] = [];
      
      for (let i = 0; i < tokens.length; i++) {
        const token = tokens[i];
        
        // Update current token being processed
        setBurnStatus(prev => ({
          ...prev,
          currentToken: token,
          currentStepMessage: `Burning ${token.contract_ticker_symbol || 'token'} (${i + 1}/${tokens.length})...`,
        }));
        
        try {
          // Use burnSingleToken directly for individual burns
          const result = await burnSingleToken(token);
          results.push(result);
          
          // Update progress after each token
          const userRejections = results.filter(r => r.isUserRejection).length;
          setBurnStatus(prev => ({
            ...prev,
            processedTokens: i + 1,
            burnResults: [...prev.burnResults, result],
            tokensBurned: results.filter(r => r.success).length,
            tokensFailed: results.filter(r => !r.success).length,
            tokensRejectedByUser: userRejections,
            hasUserRejections: userRejections > 0,
          }));
          
          // No delay needed - process tokens as fast as possible
          
        } catch (error) {
          // Parse the error for better handling
          const parsedError = parseWalletError(error);
          const isRejection = isUserRejectionError(error);
          
          const failedResult: DirectBurnResult = {
            token,
            success: false,
            error,
            errorMessage: parsedError.userFriendlyMessage,
            timestamp: Date.now(),
            parsedError,
            isUserRejection: isRejection,
          };
          results.push(failedResult);
          
          // Update progress even on failure
          const userRejections = results.filter(r => r.isUserRejection).length;
          setBurnStatus(prev => ({
            ...prev,
            processedTokens: i + 1,
            burnResults: [...prev.burnResults, failedResult],
            tokensBurned: results.filter(r => r.success).length,
            tokensFailed: results.filter(r => !r.success).length,
            tokensRejectedByUser: userRejections,
            hasUserRejections: userRejections > 0,
          }));
        }
      }
      
      const successfulBurns = results.filter(r => r.success);
      const failedBurns = results.filter(r => !r.success);
      const userRejections = results.filter(r => r.isUserRejection);
      const actualFailures = failedBurns.filter(r => !r.isUserRejection);
      
      // Create a more informative completion message
      let completionMessage = '';
      if (successfulBurns.length > 0) {
        completionMessage = `🎉 Successfully burned ${successfulBurns.length} token${successfulBurns.length > 1 ? 's' : ''}!`;
        if (userRejections.length > 0) {
          completionMessage += ` (${userRejections.length} cancelled by user)`;
        }
        if (actualFailures.length > 0) {
          completionMessage += ` (${actualFailures.length} failed)`;
        }
      } else if (userRejections.length === tokens.length) {
        completionMessage = '⏭️ All transactions were cancelled. You can try again anytime.';
      } else if (userRejections.length > 0) {
        completionMessage = `⚠️ ${userRejections.length} transaction${userRejections.length > 1 ? 's' : ''} cancelled, ${actualFailures.length} failed. Please try again.`;
      } else {
        completionMessage = `❌ Failed to burn tokens. Please try again.`;
      }
      
      setBurnStatus(prev => ({
        ...prev,
        inProgress: false,
        success: successfulBurns.length > 0,
        tokensBurned: successfulBurns.length,
        tokensFailed: actualFailures.length,
        tokensRejectedByUser: userRejections.length,
        hasUserRejections: userRejections.length > 0,
        currentStep: 'complete',
        currentStepMessage: completionMessage,
        processedTokens: tokens.length,
        currentToken: null,
        burnResults: results,
      }));
      
      // Clear selected tokens that were successfully burned
      if (successfulBurns.length > 0) {
        const successfullyBurned = new Set(successfulBurns.map(r => r.token.contract_address));
        
        onSelectedTokensUpdated(prev => {
          const newSet = new Set(prev);
          for (const address of successfullyBurned) {
            newSet.delete(address);
          }
          return newSet;
        });
        
        // Refresh token list after burning
        setTimeout(async () => {
          try {
            const tokenItems = await fetchTokenBalances(walletAddress);
            onTokensUpdated(tokenItems);
          } catch (error) {
            console.error('Failed to refresh tokens after burning:', error);
          }
        }, 2000); // 2 second delay to allow blockchain to update
      }
      
    } catch (error) {
      setBurnStatus(prev => ({
        ...prev,
        inProgress: false,
        success: false,
        error: error instanceof Error ? error.message : 'Unexpected error occurred',
      }));
    }
  }, [burnStatus.tokensToConfirm, burnSingleToken]);

  // Reset burn status
  const resetBurnStatus = useCallback(() => {
    setBurnStatus(initialBurnStatus);
  }, []);

  // Check if we're currently waiting for user confirmation
  const isWaitingForConfirmation = burnStatus.isConfirmationOpen && !burnStatus.inProgress;

  return {
    burnStatus,
    showConfirmation,
    closeConfirmation,
    executeBurn,
    resetBurnStatus,
    isWaitingForConfirmation,
    
    // Contract status for UI
    isBurning,
    currentToken,
    burnResults,
    getBurnStats
  };
} 