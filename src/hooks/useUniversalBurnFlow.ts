import { useState, useCallback, useRef, useMemo } from 'react';
import { useAccount } from 'wagmi';
import { 
  BurnFlowContext, 
  UniversalBurnFlowStatus, 
  BurnResult, 
  BurnFlowItem,
  UniversalBurnFlowOptions,
  UniversalBurnFlowCallbacks,
  BurnSummary,
  categorizeError,
  BurnFlowState
} from '@/types/universalBurn';
import { BurnableItem } from '@/types/nft';
import { useDirectBurner } from '@/lib/directBurner';
import { getTokenValue } from '@/features/token-scanning/utils/tokenUtils';
import { Token } from '@/types/token';
import { NFT } from '@/types/nft';

// Default options
const DEFAULT_OPTIONS: UniversalBurnFlowOptions = {
  batchMode: false,
  batchSize: 5,
  delayBetweenBatches: 100,
  skipValueWarnings: false,
  preferredGasSpeed: 'normal'
};

// Initial burn status
const initialBurnStatus: UniversalBurnFlowStatus = {
  isConfirmationOpen: false,
  isProgressOpen: false,
  burnContext: null,
  inProgress: false,
  success: false,
  error: null,
  processedItems: 0,
  totalItems: 0,
  startTime: undefined,
  estimatedTimeRemaining: undefined,
  averageTimePerItem: undefined,
  results: {
    successful: [],
    failed: [],
    userRejected: [],
    cancelled: []
  },
  currentItem: null,
  currentStepMessage: null,
  currentBatch: undefined,
  totalBatches: undefined
};

/**
 * Universal burn flow hook that handles all asset types with enhanced features
 */
export function useUniversalBurnFlow(
  options: UniversalBurnFlowOptions = {},
  callbacks: UniversalBurnFlowCallbacks = {}
) {
  const { address } = useAccount();
  const [burnStatus, setBurnStatus] = useState<UniversalBurnFlowStatus>(initialBurnStatus);
  const [flowState, setFlowState] = useState<BurnFlowState>({ type: 'idle' });
  const { burnSingleToken, burnSingleNFT } = useDirectBurner();
  
  // Merge options with defaults
  const mergedOptions = useMemo(
    () => ({ ...DEFAULT_OPTIONS, ...options }),
    [options]
  );
  
  // Refs for timing calculations
  const itemTimings = useRef<number[]>([]);
  const startTimeRef = useRef<number | null>(null);
  
  // Cancellation state
  const [isCancelling, setIsCancelling] = useState(false);
  const cancelSignalRef = useRef(false);

  // Calculate average time per item for estimates
  const updateTimeEstimates = useCallback(() => {
    if (itemTimings.current.length === 0) return;
    
    const avgTime = itemTimings.current.reduce((a, b) => a + b, 0) / itemTimings.current.length;
    const remaining = burnStatus.totalItems - burnStatus.processedItems;
    const estimatedTimeRemaining = Math.round((avgTime * remaining) / 1000); // in seconds
    
    setBurnStatus(prev => ({
      ...prev,
      averageTimePerItem: avgTime,
      estimatedTimeRemaining
    }));
  }, [burnStatus.totalItems, burnStatus.processedItems]);

  // Auto-detect burn context from mixed items with quantities
  const createBurnContext = useCallback((items: BurnableItem[]): BurnFlowContext => {
    const tokenItems = items.filter(item => item.type === 'token');
    const nftItems = items.filter(item => item.type === 'nft');
    
    const tokens = tokenItems.map(item => item.data as Token);
    const nfts = nftItems.map(item => item.data as NFT);
    
    // Calculate token values and warnings
    const totalTokenValue = tokens.reduce((sum, token) => sum + getTokenValue(token), 0);
    const hasHighValueTokens = totalTokenValue > 0.10;
    const hasETH = tokens.some(token => 
      token.contract_ticker_symbol?.toLowerCase() === 'eth' ||
      token.contract_address?.toLowerCase() === '0x4200000000000000000000000000000000000006' // ETH on Base
    );
    
    // Calculate NFT collections
    const nftsByCollection = new Map<string, NFT[]>();
    nfts.forEach(nft => {
      const collection = nft.contract_address;
      if (!nftsByCollection.has(collection)) {
        nftsByCollection.set(collection, []);
      }
      nftsByCollection.get(collection)!.push(nft);
    });
    const nftCollectionCount = nftsByCollection.size;
    
    // Calculate NFT total quantity including ERC-1155 quantities
    const nftTotalQuantity = nftItems.reduce((total, item) => {
      return total + (item.selectedQuantity || 1);
    }, 0);
    
    // Calculate total items (tokens + NFT quantities)
    const totalItems = tokens.length + nftTotalQuantity;
    const totalUniqueItems = items.length;
    
    // Determine burn type
    let burnType: 'tokens-only' | 'nfts-only' | 'mixed';
    if (tokens.length > 0 && nfts.length === 0) burnType = 'tokens-only';
    else if (nfts.length > 0 && tokens.length === 0) burnType = 'nfts-only';  
    else burnType = 'mixed';
    
    // Calculate estimated transaction count (each item is one transaction)
    const estimatedTransactionCount = totalItems;
    
    return {
      originalItems: items,
      tokens,
      nfts,
      totalItems,
      totalUniqueItems,
      totalTokenValue,
      hasHighValueTokens,
      hasETH,
      nftCollectionCount,
      nftsByCollection,
      nftTotalQuantity,
      burnType,
      estimatedTransactionCount
    };
  }, []);



  // Universal confirmation trigger - now accepts BurnableItem[] with quantities
  const showConfirmation = useCallback((items: BurnableItem[]) => {
    if (items.length === 0) return;
    
    const context = createBurnContext(items);
    
    // Trigger onBurnStart callback if provided
    callbacks.onBurnStart?.(context);
    
    setBurnStatus(prev => ({
      ...prev,
      isConfirmationOpen: true,
      isProgressOpen: false,
      burnContext: context,
      error: null,
      results: { successful: [], failed: [], userRejected: [], cancelled: [] }
    }));
    
    setFlowState({ type: 'confirming', context });
  }, [createBurnContext, callbacks]);

  // Close confirmation modal
  const closeConfirmation = useCallback(() => {
    setBurnStatus(prev => ({
      ...prev,
      isConfirmationOpen: false,
      burnContext: null,
      error: null
    }));
    
    setFlowState({ type: 'idle' });
  }, []);

  // Cancel burn process
  const cancelBurn = useCallback(() => {
    cancelSignalRef.current = true;
    setIsCancelling(true);
  }, []);

  // Process a single item
  const processSingleItem = useCallback(async (
    item: BurnFlowItem,
    index: number,
    total: number
  ): Promise<BurnResult> => {
    const itemStartTime = Date.now();
    
    try {
      let result;
      
      if (item.type === 'token') {
        result = await burnSingleToken(item.data as Token);
      } else {
        result = await burnSingleNFT(item.data as NFT, address!, item.selectedQuantity);
      }

      const itemEndTime = Date.now();
      const itemDuration = itemEndTime - itemStartTime;
      itemTimings.current.push(itemDuration);

      const burnResult: BurnResult = {
        item,
        success: result.success,
        txHash: result.txHash,
        error: result.error as Error,
        errorMessage: result.errorMessage,
        errorType: result.error ? categorizeError(result.error) : undefined,
        isUserRejection: result.isUserRejection || false,
        timestamp: Date.now(),
        gasCostGwei: result.gasCostGwei
      };

      // Trigger callback
      callbacks.onItemProcessed?.(burnResult, index, total);

      return burnResult;

    } catch (error) {
      console.error('Burn error:', error);
      
      const burnResult: BurnResult = {
        item,
        success: false,
        error: error as Error,
        errorMessage: error instanceof Error ? error.message : 'Unknown error',
        errorType: categorizeError(error),
        isUserRejection: categorizeError(error) === 'user_rejection',
        timestamp: Date.now(),
        gasCostGwei: undefined // No gas cost data for failed transactions
      };

      // Trigger error callback
      callbacks.onError?.(error as Error, item);
      callbacks.onItemProcessed?.(burnResult, index, total);

      return burnResult;
    }
  }, [address, burnSingleToken, burnSingleNFT, callbacks]);

  // Update burn progress
  const updateBurnProgress = useCallback((result: BurnResult, processedCount: number) => {
    setBurnStatus(prev => {
      const successful = result.success ? [...prev.results.successful, result] : prev.results.successful;
      const userRejected = result.isUserRejection ? [...prev.results.userRejected, result] : prev.results.userRejected;
      const cancelled = result.isCancelled ? [...prev.results.cancelled, result] : prev.results.cancelled;
      const failed = (!result.success && !result.isUserRejection && !result.isCancelled) ? [...prev.results.failed, result] : prev.results.failed;

      return {
        ...prev,
        processedItems: processedCount,
        results: { successful, failed, userRejected, cancelled }
      };
    });

    updateTimeEstimates();
  }, [updateTimeEstimates]);

  // Process items in batches
  const processBatch = useCallback(async (
    items: BurnFlowItem[],
    batchNumber: number,
    totalBatches: number
  ): Promise<BurnResult[]> => {
    setBurnStatus(prev => ({
      ...prev,
      currentBatch: batchNumber,
      totalBatches,
      currentStepMessage: `Processing batch ${batchNumber} of ${totalBatches}...`
    }));

    const batchResults: BurnResult[] = [];
    
    // Process items in the batch sequentially
    for (let i = 0; i < items.length; i++) {
      // Check for cancellation before processing each item
      if (cancelSignalRef.current) {
        // Mark remaining items in this batch as cancelled
        const remainingItems = items.slice(i);
        const cancelledResults: BurnResult[] = remainingItems.map(item => ({
          item,
          success: false,
          isCancelled: true,
          isUserRejection: false,
          timestamp: Date.now(),
          gasCostGwei: undefined // No gas cost for cancelled items
        }));
        
        batchResults.push(...cancelledResults);
        
        // Update progress for all cancelled items in this batch
        for (let j = 0; j < cancelledResults.length; j++) {
          const processedCount = (batchNumber - 1) * mergedOptions.batchSize! + i + j + 1;
          updateBurnProgress(cancelledResults[j], processedCount);
        }
        
        break; // Exit the batch processing loop
      }
      
      const item = items[i];
      const globalIndex = (batchNumber - 1) * mergedOptions.batchSize! + i;
      
      setBurnStatus(prev => ({
        ...prev,
        currentItem: item,
        currentStepMessage: `Burning ${item.metadata?.displayName || 'item'} (${globalIndex + 1}/${prev.totalItems})...`
      }));

      const result = await processSingleItem(item, globalIndex, burnStatus.totalItems);
      batchResults.push(result);

      // Update progress after each item
      const processedCount = (batchNumber - 1) * mergedOptions.batchSize! + i + 1;
      updateBurnProgress(result, processedCount);
    }

    // Trigger batch complete callback
    callbacks.onBatchComplete?.(batchNumber, batchResults);

    return batchResults;
  }, [mergedOptions.batchSize, processSingleItem, burnStatus.totalItems, callbacks, updateBurnProgress]);

  // Universal burn execution
  const executeBurn = useCallback(async () => {
    if (!burnStatus.burnContext || !address) return;
    
    const { originalItems } = burnStatus.burnContext;
    
    // Convert BurnableItem[] to BurnFlowItem[] expanding ERC-1155 quantities for proper progress tracking
    const burnItems: BurnFlowItem[] = [];
    originalItems.forEach((item, index) => {
      if (item.type === 'token') {
        burnItems.push({
          id: `token-${item.data.contract_address}-${index}`,
          type: 'token' as const,
          data: item.data,
          metadata: {
            displayName: item.data.contract_ticker_symbol || 'Unknown Token',
            value: getTokenValue(item.data),
            imageUrl: item.data.logo_url
          }
        });
      } else {
        const quantity = item.selectedQuantity || 1;
        // For ERC-1155 with quantity > 1, create multiple entries for proper progress tracking
        for (let q = 0; q < quantity; q++) {
          burnItems.push({
            id: `nft-${item.data.contract_address}-${item.data.token_id}-${index}-${q}`,
            type: 'nft' as const,
            data: item.data,
            selectedQuantity: 1, // Each burn item represents 1 quantity
            metadata: {
              displayName: item.data.name || `NFT #${item.data.token_id}`,
              imageUrl: item.data.image_url || undefined
            }
          });
        }
      }
    });

    // Initialize burn process
    startTimeRef.current = Date.now();
    itemTimings.current = [];
    
    setBurnStatus(prev => ({
      ...prev,
      isConfirmationOpen: false,
      isProgressOpen: true,
      inProgress: true,
      success: false,
      error: null,
      processedItems: 0,
      totalItems: burnItems.length, // Now matches the actual expanded array length
      startTime: startTimeRef.current || undefined,
      currentItem: null,
      currentStepMessage: `Starting burn process for ${burnItems.length} items...`
    }));

    setFlowState({ type: 'burning', progress: burnStatus });

    const allResults: BurnResult[] = [];

    try {
      if (mergedOptions.batchMode && burnItems.length > mergedOptions.batchSize!) {
        // Process in batches
        const totalBatches = Math.ceil(burnItems.length / mergedOptions.batchSize!);
        
        for (let batchNum = 1; batchNum <= totalBatches; batchNum++) {
          const startIdx = (batchNum - 1) * mergedOptions.batchSize!;
          const endIdx = Math.min(startIdx + mergedOptions.batchSize!, burnItems.length);
          const batchItems = burnItems.slice(startIdx, endIdx);
          
          const batchResults = await processBatch(batchItems, batchNum, totalBatches);
          allResults.push(...batchResults);
          
          // Delay between batches if specified
          if (batchNum < totalBatches && mergedOptions.delayBetweenBatches! > 0) {
            await new Promise(resolve => setTimeout(resolve, mergedOptions.delayBetweenBatches));
          }
        }
      } else {
        // Process sequentially
        for (let i = 0; i < burnItems.length; i++) {
          // Check for cancellation before processing each item
          if (cancelSignalRef.current) {
            // Mark remaining items as cancelled
            const remainingItems = burnItems.slice(i);
            const cancelledResults: BurnResult[] = remainingItems.map(item => ({
              item,
              success: false,
              isCancelled: true,
              isUserRejection: false,
              timestamp: Date.now(),
              gasCostGwei: undefined // No gas cost for cancelled items
            }));
            
            // Add cancelled results and update progress
            allResults.push(...cancelledResults);
            
            // Update progress for all cancelled items
            for (let j = 0; j < cancelledResults.length; j++) {
              updateBurnProgress(cancelledResults[j], i + j + 1);
            }
            
            break; // Exit the burn loop
          }
          
          const item = burnItems[i];
          
          setBurnStatus(prev => ({
            ...prev,
            currentItem: item,
            currentStepMessage: `Burning ${item.metadata?.displayName || 'item'} (${i + 1}/${burnItems.length})...`
          }));

          const result = await processSingleItem(item, i, burnItems.length);
          allResults.push(result);
          updateBurnProgress(result, i + 1);
        }
      }

      // Calculate completion summary - use the original context totals, not expanded array
      const duration = Date.now() - startTimeRef.current!;
      
      // Calculate total gas cost in GWEI from all results
      const totalGasCostGwei = allResults.reduce((sum, result) => {
        return sum + (result.gasCostGwei || 0);
      }, 0);
      
      // Calculate total value ONLY from successfully burned tokens
      const totalValueBurned = allResults
        .filter(result => result.success && result.item.type === 'token')
        .reduce((sum, result) => {
          const token = result.item.data as Token;
          return sum + getTokenValue(token);
        }, 0);
      
      const summary: BurnSummary = {
        totalItems: burnStatus.burnContext.totalItems, // Use original total from context
        successfulBurns: allResults.filter(r => r.success).length,
        failedBurns: allResults.filter(r => !r.success && !r.isUserRejection && !r.isCancelled).length,
        userRejections: allResults.filter(r => r.isUserRejection).length,
        totalValue: totalValueBurned, // Only count successfully burned token values
        totalGasUsed: BigInt(0), // Legacy field for backwards compatibility
        totalGasCostGwei,
        duration,
        burnType: burnStatus.burnContext.burnType
      };

      // Trigger completion callback with all results
      callbacks.onBurnComplete?.(summary, allResults);

      // Complete the burn process
      setBurnStatus(prev => ({
        ...prev,
        inProgress: false,
        success: true,
        currentItem: null,
        currentStepMessage: createCompletionMessage(summary, allResults),
        currentBatch: undefined,
        totalBatches: undefined
      }));

      setFlowState({ type: 'complete', results: allResults });

    } catch (error) {
      console.error('Burn execution error:', error);
      
      setBurnStatus(prev => ({
        ...prev,
        inProgress: false,
        success: false,
        error: error instanceof Error ? error.message : 'Unexpected error occurred',
        currentItem: null,
        currentStepMessage: 'Burn process failed'
      }));

      setFlowState({ type: 'error', error: error as Error });
      callbacks.onError?.(error as Error);
    }
  }, [
    burnStatus, 
    address, 
    mergedOptions, 
    processBatch, 
    processSingleItem, 
    updateBurnProgress, 
    callbacks
  ]);

  // Create user-friendly completion message
  const createCompletionMessage = (summary: BurnSummary, results: BurnResult[]): string => {
    const { successfulBurns, failedBurns, userRejections } = summary;
    const cancelled = results.filter(r => r.isCancelled).length;
    
    if (cancelled > 0) {
      return `🛑 Burn process cancelled. ${successfulBurns} completed, ${cancelled} cancelled.`;
    } else if (successfulBurns > 0 && failedBurns === 0 && userRejections === 0) {
      return `🎉 Successfully burned ${successfulBurns} item${successfulBurns > 1 ? 's' : ''}!`;
    } else if (successfulBurns > 0) {
      let message = `✅ Burned ${successfulBurns} item${successfulBurns > 1 ? 's' : ''}`;
      if (userRejections > 0) {
        message += ` (${userRejections} cancelled)`;
      }
      if (failedBurns > 0) {
        message += ` (${failedBurns} failed)`;
      }
      return message;
    } else if (userRejections === summary.totalItems) {
      return '⏭️ All transactions were cancelled. You can try again anytime.';
    } else {
      return `❌ Unable to burn items. ${failedBurns} failed due to restrictions.`;
    }
  };

  // Close progress modal
  const closeProgress = useCallback(() => {
    setBurnStatus(initialBurnStatus);
    setFlowState({ type: 'idle' });
    setIsCancelling(false);
    cancelSignalRef.current = false;
  }, []);

  // Reset everything
  const resetBurnFlow = useCallback(() => {
    setBurnStatus(initialBurnStatus);
    setFlowState({ type: 'idle' });
    itemTimings.current = [];
    startTimeRef.current = null;
    setIsCancelling(false);
    cancelSignalRef.current = false;
  }, []);

  // Check if waiting for wallet confirmation
  const isWaitingForConfirmation = burnStatus.isConfirmationOpen && !burnStatus.inProgress;



  return {
    burnStatus,
    flowState,
    showConfirmation,
    closeConfirmation,
    executeBurn,
    closeProgress,
    resetBurnFlow,
    isWaitingForConfirmation,
    cancelBurn,
    isCancelling,
    options: mergedOptions
  };
} 