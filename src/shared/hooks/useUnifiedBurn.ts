import { useState, useCallback } from 'react';
import { useAccount } from 'wagmi';
import { BurnableItem } from '@/types/nft';
import { useDirectBurner } from '@/lib/directBurner';
import { useSelectedItems } from '@/contexts/SelectedItemsContext';

export interface UnifiedBurnTransaction {
  id: string;
  item: BurnableItem;
  status: 'pending' | 'success' | 'error';
  hash?: `0x${string}`;
  error?: Error;
  errorMessage?: string;
}

export interface UnifiedBurnProgress {
  totalItems: number;
  completedItems: number;
  failedItems: number;
  transactions: UnifiedBurnTransaction[];
  isComplete: boolean;
}

export function useUnifiedBurn() {
  const { address } = useAccount();
  const { clearAllSelectedItems } = useSelectedItems();
  const { burnSingleToken, burnSingleNFT, isBurning: isBurningFromHook } = useDirectBurner();
  
  const [isBurning, setIsBurning] = useState(false);
  const [burnProgress, setBurnProgress] = useState<UnifiedBurnProgress>({
    totalItems: 0,
    completedItems: 0,
    failedItems: 0,
    transactions: [],
    isComplete: false
  });

  const burnItems = useCallback(async (items: BurnableItem[]) => {
    if (!address) {
      console.error('No wallet connected');
      return;
    }

    setIsBurning(true);
    
    // Initialize progress
    const initialTransactions: UnifiedBurnTransaction[] = items.map((item, index) => ({
      id: `${item.type}-${index}`,
      item,
      status: 'pending' as const
    }));

    setBurnProgress({
      totalItems: items.length,
      completedItems: 0,
      failedItems: 0,
      transactions: initialTransactions,
      isComplete: false
    });

    let completedCount = 0;
    let failedCount = 0;

    // Process each item
    for (let i = 0; i < items.length; i++) {
      const item = items[i];
      const transactionId = `${item.type}-${i}`;
      
      try {
        let result;
        
        if (item.type === 'token') {
          result = await burnSingleToken(item.data);
        } else {
          result = await burnSingleNFT(item.data, address);
        }

        if (result.success) {
          completedCount++;
          setBurnProgress(prev => ({
            ...prev,
            completedItems: completedCount,
            transactions: prev.transactions.map(tx => 
              tx.id === transactionId 
                ? { ...tx, status: 'success' as const, hash: result.txHash }
                : tx
            )
          }));
        } else {
          failedCount++;
          setBurnProgress(prev => ({
            ...prev,
            failedItems: failedCount,
            transactions: prev.transactions.map(tx => 
              tx.id === transactionId 
                ? { 
                    ...tx, 
                    status: 'error' as const, 
                    hash: result.txHash,
                    error: result.error as Error,
                    errorMessage: result.errorMessage
                  }
                : tx
            )
          }));
        }
      } catch (error) {
        console.error('Burn error:', error);
        failedCount++;
        
        setBurnProgress(prev => ({
          ...prev,
          failedItems: failedCount,
          transactions: prev.transactions.map(tx => 
            tx.id === transactionId 
              ? { 
                  ...tx, 
                  status: 'error' as const, 
                  error: error as Error,
                  errorMessage: error instanceof Error ? error.message : 'Unknown error'
                }
              : tx
          )
        }));
      }
    }

    // Mark as complete
    setBurnProgress(prev => ({
      ...prev,
      isComplete: true
    }));

    setIsBurning(false);
  }, [address, burnSingleToken, burnSingleNFT]);

  const resetBurnProgress = useCallback(() => {
    setBurnProgress({
      totalItems: 0,
      completedItems: 0,
      failedItems: 0,
      transactions: [],
      isComplete: false
    });
  }, []);

  const clearSelections = useCallback(() => {
    clearAllSelectedItems();
  }, [clearAllSelectedItems]);

  return {
    isBurning: isBurning || isBurningFromHook,
    burnProgress,
    burnItems,
    resetBurnProgress,
    clearSelections
  };
} 