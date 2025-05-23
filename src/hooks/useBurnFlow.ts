import { useState, useCallback } from 'react';
import { Token } from '@/types/token';
import { useTokenBurner } from '@/lib/tokenBurner';
import { fetchTokenBalances } from '@/lib/api';

// Consolidated burn status type
export type BurnFlowStatus = {
  // Confirmation modal state
  isConfirmationOpen: boolean;
  tokensToConfirm: Token[];
  isSimulating: boolean;
  
  // Burn execution state  
  inProgress: boolean;
  success: boolean;
  error: string | null;
  tokensBurned: number;
  tokensFailed: number;
  
  // Current operation details
  currentToken: Token | null;
  processedTokens: number;
  totalTokens: number;
  currentTxHash: `0x${string}` | null;
};

const initialBurnStatus: BurnFlowStatus = {
  isConfirmationOpen: false,
  tokensToConfirm: [],
  isSimulating: false,
  inProgress: false,
  success: false,
  error: null,
  tokensBurned: 0,
  tokensFailed: 0,
  currentToken: null,
  processedTokens: 0,
  totalTokens: 0,
  currentTxHash: null,
};

/**
 * Custom hook to manage the complete burn flow including confirmation, simulation, and execution
 */
export function useBurnFlow() {
  const [burnStatus, setBurnStatus] = useState<BurnFlowStatus>(initialBurnStatus);
  
  const { 
    burnTokens, 
    isPending, 
    isLoading: isBurning, 
    currentTxHash,
    currentToken,
    processedTokens,
    totalTokens: burnTotalTokens,
    error: burnError 
  } = useTokenBurner();

  // Simulate the burn transaction
  const simulateBurn = useCallback(async (tokens: Token[]): Promise<boolean> => {
    setBurnStatus(prev => ({ ...prev, isSimulating: true }));
    
    // Simple simulation - just a delay for UI feedback
    // In a real implementation, you would call an actual simulation method
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    setBurnStatus(prev => ({ ...prev, isSimulating: false }));
    return true; // Assume simulation is successful
  }, []);

  // Show confirmation modal for selected tokens
  const showConfirmation = useCallback(async (tokens: Token[]) => {
    if (tokens.length === 0) return;
    
    setBurnStatus(prev => ({
      ...prev,
      isConfirmationOpen: true,
      tokensToConfirm: tokens,
    }));
    
    // Start simulation after showing modal
    await simulateBurn(tokens);
  }, [simulateBurn]);

  // Close confirmation modal
  const closeConfirmation = useCallback(() => {
    setBurnStatus(prev => ({
      ...prev,
      isConfirmationOpen: false,
      tokensToConfirm: [],
      isSimulating: false,
    }));
  }, []);

  // Execute the burn operation after confirmation
  const executeBurn = useCallback(async (
    walletAddress: string,
    onTokensUpdated: (tokens: Token[]) => void,
    onSelectedTokensUpdated: (updateFn: (prev: Set<string>) => Set<string>) => void
  ) => {
    if (burnStatus.tokensToConfirm.length === 0) return;
    
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
        currentToken,
        processedTokens,
        totalTokens: burnTotalTokens,
        currentTxHash,
      }));
      
      // Execute the burn operation
      const results = await burnTokens(burnStatus.tokensToConfirm);
      
      // Calculate results
      const successCount = results.filter(r => r.success).length;
      const failCount = results.length - successCount;
      
      // Update status to show completion
      setBurnStatus(prev => ({
        ...prev,
        inProgress: false,
        success: successCount > 0,
        error: failCount > 0 ? `Failed to burn ${failCount} tokens` : null,
        tokensBurned: successCount,
        tokensFailed: failCount,
        tokensToConfirm: [],
      }));
      
      // Clear selected tokens that were successfully burned
      const successfullyBurned = new Set(
        results
          .filter(r => r.success)
          .map(r => r.token.contract_address)
      );
      
      onSelectedTokensUpdated(prev => {
        const newSet = new Set(prev);
        for (const address of successfullyBurned) {
          newSet.delete(address);
        }
        return newSet;
      });
      
      // Refresh token list after burning
      if (successCount > 0) {
        const tokenItems = await fetchTokenBalances(walletAddress);
        onTokensUpdated(tokenItems);
      }
    } catch (err) {
      console.error("Failed to burn tokens:", err);
      setBurnStatus(prev => ({
        ...prev,
        inProgress: false,
        success: false,
        error: err instanceof Error ? err.message : "Unknown error occurred",
        tokensBurned: 0,
        tokensFailed: prev.tokensToConfirm.length,
        tokensToConfirm: [],
      }));
    }
  }, [burnStatus.tokensToConfirm, burnTokens, currentToken, processedTokens, burnTotalTokens, currentTxHash]);

  // Reset burn status
  const resetBurnStatus = useCallback(() => {
    setBurnStatus(initialBurnStatus);
  }, []);

  // Update current operation details from useTokenBurner
  const isWaitingForConfirmation = isBurning && !burnStatus.inProgress;
  
  const consolidatedStatus: BurnFlowStatus = {
    ...burnStatus,
    currentToken: burnStatus.currentToken || currentToken,
    processedTokens: burnStatus.inProgress ? processedTokens : burnStatus.processedTokens,
    totalTokens: burnStatus.inProgress ? burnTotalTokens : burnStatus.totalTokens,
    currentTxHash: burnStatus.inProgress ? currentTxHash : burnStatus.currentTxHash,
  };

  return {
    burnStatus: consolidatedStatus,
    showConfirmation,
    closeConfirmation,
    executeBurn,
    resetBurnStatus,
    isWaitingForConfirmation,
    // Expose underlying states for compatibility
    isPending,
    isBurning,
  };
} 