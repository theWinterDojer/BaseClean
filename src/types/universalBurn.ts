import { Token } from '@/types/token';
import { NFT, BurnableItem } from '@/types/nft';

// Enhanced burn flow item with metadata and quantity support
export interface BurnFlowItem {
  id: string;
  type: 'token' | 'nft';
  data: Token | NFT;
  selectedQuantity?: number; // For ERC-1155 NFTs
  metadata?: {
    displayName?: string;
    value?: number;
    imageUrl?: string;
  };
}

// Comprehensive burn context with all necessary information
export interface BurnFlowContext {
  // Original items with quantity information
  originalItems: BurnableItem[];
  
  // Asset categorization
  tokens: Token[];
  nfts: NFT[];
  totalItems: number; // Total count including NFT quantities
  totalUniqueItems: number; // Just the number of unique assets
  
  // Value calculations (tokens only)
  totalTokenValue: number;
  hasHighValueTokens: boolean; // > $0.10 threshold
  hasETH: boolean;
  
  // NFT specifics
  nftCollectionCount: number;
  nftsByCollection: Map<string, NFT[]>;
  nftTotalQuantity: number; // Total NFT quantity including ERC-1155 quantities
  
  // Flow type detection
  burnType: 'tokens-only' | 'nfts-only' | 'mixed';
  
  // Estimated gas costs
  estimatedGasCost?: bigint;
  estimatedTransactionCount: number; // Based on total quantities
}

// Enhanced error types for better user feedback
export type BurnErrorType = 
  | 'user_rejection' 
  | 'insufficient_gas' 
  | 'contract_restriction' 
  | 'network_error' 
  | 'invalid_token'
  | 'unknown';

// Comprehensive burn result with enhanced error information
export interface BurnResult {
  item: BurnFlowItem;
  success: boolean;
  txHash?: string;
  error?: Error;
  errorMessage?: string;
  errorType?: BurnErrorType;
  isUserRejection: boolean;
  isCancelled?: boolean; // When user cancels the burn process
  timestamp: number;
  gasCostGwei?: number; // Gas cost in GWEI at time of transaction
}

// Batch processing options for performance optimization
export interface UniversalBurnFlowOptions {
  batchMode?: boolean; // Process multiple items in parallel when safe
  batchSize?: number; // Default: 5
  delayBetweenBatches?: number; // Default: 100ms
  skipValueWarnings?: boolean; // For experienced users
  preferredGasSpeed?: 'slow' | 'normal' | 'fast';
}

// State machine for cleaner modal flow management
export type BurnFlowState = 
  | { type: 'idle' }
  | { type: 'confirming'; context: BurnFlowContext }
  | { type: 'burning'; progress: UniversalBurnFlowStatus }
  | { type: 'complete'; results: BurnResult[] }
  | { type: 'error'; error: Error };

// Comprehensive burn flow status
export interface UniversalBurnFlowStatus {
  // Modal states
  isConfirmationOpen: boolean;
  isProgressOpen: boolean;
  
  // Burn context
  burnContext: BurnFlowContext | null;
  
  // Execution state
  inProgress: boolean;
  success: boolean;
  error: string | null;
  
  // Progress tracking
  processedItems: number;
  totalItems: number;
  
  // Enhanced timing information
  startTime?: number;
  estimatedTimeRemaining?: number;
  averageTimePerItem?: number;
  
  // Results categorization
  results: {
    successful: BurnResult[];
    failed: BurnResult[];
    userRejected: BurnResult[];
    cancelled: BurnResult[];
  };
  
  // Current operation
  currentItem: BurnFlowItem | null;
  currentStepMessage: string | null;
  currentBatch?: number;
  totalBatches?: number;
}

// Telemetry callbacks for analytics and debugging
export interface UniversalBurnFlowCallbacks {
  onBurnStart?: (context: BurnFlowContext) => void;
  onItemProcessed?: (result: BurnResult, index: number, total: number) => void;
  onBatchComplete?: (batchNumber: number, results: BurnResult[]) => void;
  onBurnComplete?: (summary: BurnSummary, allResults: BurnResult[]) => void;
  onError?: (error: Error, item?: BurnFlowItem) => void;
}

// Burn summary for completion analytics
export interface BurnSummary {
  totalItems: number;
  successfulBurns: number;
  failedBurns: number;
  userRejections: number;
  totalValue: number;
  totalGasUsed: bigint; // Legacy field for backwards compatibility
  totalGasCostGwei?: number; // Total gas cost in GWEI - new field
  duration: number; // milliseconds
  burnType: 'tokens-only' | 'nfts-only' | 'mixed';
}

// User preferences that can be persisted
export interface BurnPreferences {
  showDetails: boolean; // Remember if user likes expanded view
  skipValueWarnings?: boolean; // For experienced users
  preferredGasSpeed?: 'slow' | 'normal' | 'fast';
  enableBatchMode?: boolean;
  preferredBatchSize?: number;
}

// Helper type guards (currently unused - kept for potential future use)
export function isToken(asset: Token | NFT): asset is Token {
  return 'contract_ticker_symbol' in asset;
}

export function isNFT(asset: Token | NFT): asset is NFT {
  return 'token_id' in asset;
}

// Helper to categorize error types
export function categorizeError(error: unknown): BurnErrorType {
  if (!error) return 'unknown';
  
  const errorMessage = error instanceof Error ? error.message.toLowerCase() : String(error).toLowerCase();
  
  if (errorMessage.includes('user rejected') || errorMessage.includes('user denied')) {
    return 'user_rejection';
  }
  if (errorMessage.includes('insufficient funds') || errorMessage.includes('insufficient balance')) {
    return 'insufficient_gas';
  }
  if (errorMessage.includes('execution reverted') || errorMessage.includes('transfer failed')) {
    return 'contract_restriction';
  }
  if (errorMessage.includes('network') || errorMessage.includes('timeout')) {
    return 'network_error';
  }
  if (errorMessage.includes('invalid token') || errorMessage.includes('not found')) {
    return 'invalid_token';
  }
  
  return 'unknown';
} 