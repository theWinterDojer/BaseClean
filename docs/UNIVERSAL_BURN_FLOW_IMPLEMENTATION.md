# Universal Burn Flow - Implementation Plan

## 🎯 **Project Overview**

**Objective**: Consolidate three separate burn flows (tokens, NFTs, unified) into a single, cohesive universal burn flow that provides consistent UX across all asset types while preserving and enhancing all current features.

**Current State**: 
- 3 separate burn hooks: `useBurnFlow.ts` (276 lines), `useNFTBurnFlow.ts` (257 lines), `useUnifiedBurn.ts` (158 lines)
- 6+ different modal components with inconsistent UX
- Duplicate logic (~90% code similarity between token and NFT flows)
- Inconsistent warning systems and progress tracking

**Target State**:
- Single universal burn flow handling all asset types
- Consistent, professional modal design across all scenarios
- Smart contextual warnings (value warnings only when applicable)
- Reduced codebase by ~60% (700+ lines eliminated)
- Enhanced user experience with unified progress tracking

## 📊 **Benefits Analysis**

### **Code Reduction**
- **Before**: 3 hooks (~700 lines) + 6 modal components (~800 lines) = **1,500 lines**
- **After**: 1 hook (~400 lines) + 2 modal components (~400 lines) = **800 lines**
- **Net Reduction**: **700 lines** of maintained code **(60% reduction)**

### **UX Improvements**
- ✅ Consistent modal design across all burn types
- ✅ Smart contextual warnings (value warnings only for tokens)
- ✅ Enhanced ETH-specific warnings
- ✅ Unified progress tracking with better categorization
- ✅ Professional layout with adaptive stats display

### **Maintenance Benefits**
- ✅ Single source of truth for burn logic
- ✅ Easier testing and debugging
- ✅ Future-proof architecture for new asset types
- ✅ Reduced complexity in component integration

## 🏗️ **Implementation Plan**

### **PHASE 1: Universal Hook Architecture** (2-3 hours)

#### 1.1 Create Core Types
**File**: `src/types/universalBurn.ts`

```typescript
import { Token } from '@/types/token';
import { NFT } from '@/types/nft';

// Universal asset type for burning
export type BurnableAsset = Token | NFT;

export interface BurnFlowItem {
  id: string;
  type: 'token' | 'nft';
  data: Token | NFT;
}

export interface BurnFlowContext {
  // Asset categorization
  tokens: Token[];
  nfts: NFT[];
  totalItems: number;
  
  // Value calculations (tokens only)
  totalTokenValue: number;
  hasHighValueTokens: boolean; // > $1.00 threshold
  hasETH: boolean;
  
  // NFT specifics
  nftCollectionCount: number;
  
  // Flow type detection
  burnType: 'tokens-only' | 'nfts-only' | 'mixed';
}

export interface BurnResult {
  item: BurnFlowItem;
  success: boolean;
  txHash?: string;
  error?: Error;
  errorMessage?: string;
  isUserRejection: boolean;
  timestamp: number;
}

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
  
  // Results categorization
  results: {
    successful: BurnResult[];
    failed: BurnResult[];
    userRejected: BurnResult[];
  };
  
  // Current operation
  currentItem: BurnFlowItem | null;
  currentStepMessage: string | null;
}
```

#### 1.2 Create Universal Hook
**File**: `src/hooks/useUniversalBurnFlow.ts`

```typescript
import { useState, useCallback } from 'react';
import { useAccount } from 'wagmi';
import { BurnableAsset, BurnFlowContext, UniversalBurnFlowStatus, BurnResult, BurnFlowItem } from '@/types/universalBurn';
import { useDirectBurner } from '@/lib/directBurner';
import { getTokenValue } from '@/features/token-scanning/utils/tokenUtils';
import { NATIVE_ETH_ADDRESS } from '@/constants/tokens';

const initialBurnStatus: UniversalBurnFlowStatus = {
  isConfirmationOpen: false,
  isProgressOpen: false,
  burnContext: null,
  inProgress: false,
  success: false,
  error: null,
  processedItems: 0,
  totalItems: 0,
  results: {
    successful: [],
    failed: [],
    userRejected: []
  },
  currentItem: null,
  currentStepMessage: null
};

export function useUniversalBurnFlow() {
  const { address } = useAccount();
  const [burnStatus, setBurnStatus] = useState<UniversalBurnFlowStatus>(initialBurnStatus);
  const { burnSingleToken, burnSingleNFT } = useDirectBurner();

  // Auto-detect burn context from mixed assets
  const createBurnContext = useCallback((assets: BurnableAsset[]): BurnFlowContext => {
    const tokens = assets.filter(asset => 'contract_ticker_symbol' in asset) as Token[];
    const nfts = assets.filter(asset => 'token_id' in asset) as NFT[];
    
    // Calculate token values and warnings
    const totalTokenValue = tokens.reduce((sum, token) => sum + getTokenValue(token), 0);
    const hasHighValueTokens = totalTokenValue > 1.0;
    const hasETH = tokens.some(token => 
      token.contract_ticker_symbol?.toLowerCase() === 'eth' ||
      token.contract_address?.toLowerCase() === NATIVE_ETH_ADDRESS?.toLowerCase()
    );
    
    // Calculate NFT collections
    const nftCollectionCount = new Set(nfts.map(nft => nft.contract_address)).size;
    
    // Determine burn type
    let burnType: 'tokens-only' | 'nfts-only' | 'mixed';
    if (tokens.length > 0 && nfts.length === 0) burnType = 'tokens-only';
    else if (nfts.length > 0 && tokens.length === 0) burnType = 'nfts-only';  
    else burnType = 'mixed';
    
    return {
      tokens,
      nfts,
      totalItems: assets.length,
      totalTokenValue,
      hasHighValueTokens,
      hasETH,
      nftCollectionCount,
      burnType
    };
  }, []);

  // Universal confirmation trigger
  const showConfirmation = useCallback((assets: BurnableAsset[]) => {
    if (assets.length === 0) return;
    
    const context = createBurnContext(assets);
    setBurnStatus(prev => ({
      ...prev,
      isConfirmationOpen: true,
      isProgressOpen: false,
      burnContext: context,
      error: null,
      results: { successful: [], failed: [], userRejected: [] }
    }));
  }, [createBurnContext]);

  // Close confirmation modal
  const closeConfirmation = useCallback(() => {
    setBurnStatus(prev => ({
      ...prev,
      isConfirmationOpen: false,
      burnContext: null,
      error: null
    }));
  }, []);

  // Universal burn execution
  const executeBurn = useCallback(async () => {
    if (!burnStatus.burnContext || !address) return;
    
    const { tokens, nfts } = burnStatus.burnContext;
    const allAssets: BurnableAsset[] = [...tokens, ...nfts];
    
    // Convert to BurnFlowItems
    const burnItems: BurnFlowItem[] = [
      ...tokens.map((token, index) => ({
        id: `token-${index}`,
        type: 'token' as const,
        data: token
      })),
      ...nfts.map((nft, index) => ({
        id: `nft-${index}`,
        type: 'nft' as const,
        data: nft
      }))
    ];

    // Close confirmation and start progress
    setBurnStatus(prev => ({
      ...prev,
      isConfirmationOpen: false,
      isProgressOpen: true,
      inProgress: true,
      success: false,
      error: null,
      processedItems: 0,
      totalItems: burnItems.length,
      currentItem: null,
      currentStepMessage: `Starting burn process for ${burnItems.length} items...`
    }));

    const results: BurnResult[] = [];

    // Process each item
    for (let i = 0; i < burnItems.length; i++) {
      const item = burnItems[i];
      
      // Update current item
      setBurnStatus(prev => ({
        ...prev,
        currentItem: item,
        currentStepMessage: `Processing ${item.type} ${i + 1} of ${burnItems.length}...`
      }));

      try {
        let result;
        
        if (item.type === 'token') {
          result = await burnSingleToken(item.data as Token);
        } else {
          result = await burnSingleNFT(item.data as NFT, address);
        }

        // Create burn result
        const burnResult: BurnResult = {
          item,
          success: result.success,
          txHash: result.txHash,
          error: result.error as Error,
          errorMessage: result.errorMessage,
          isUserRejection: result.isUserRejection || false,
          timestamp: Date.now()
        };

        results.push(burnResult);

        // Update progress
        const successful = results.filter(r => r.success);
        const userRejected = results.filter(r => r.isUserRejection);
        const failed = results.filter(r => !r.success && !r.isUserRejection);

        setBurnStatus(prev => ({
          ...prev,
          processedItems: i + 1,
          results: {
            successful,
            failed,
            userRejected
          }
        }));

      } catch (error) {
        console.error('Burn error:', error);
        
        const burnResult: BurnResult = {
          item,
          success: false,
          error: error as Error,
          errorMessage: error instanceof Error ? error.message : 'Unknown error',
          isUserRejection: false,
          timestamp: Date.now()
        };

        results.push(burnResult);

        setBurnStatus(prev => ({
          ...prev,
          processedItems: i + 1,
          results: {
            ...prev.results,
            failed: [...prev.results.failed, burnResult]
          }
        }));
      }
    }

    // Complete the burn process
    setBurnStatus(prev => ({
      ...prev,
      inProgress: false,
      success: true,
      currentItem: null,
      currentStepMessage: 'Burn process completed'
    }));

  }, [burnStatus.burnContext, address, burnSingleToken, burnSingleNFT]);

  // Close progress modal
  const closeProgress = useCallback(() => {
    setBurnStatus(initialBurnStatus);
  }, []);

  // Reset everything
  const resetBurnFlow = useCallback(() => {
    setBurnStatus(initialBurnStatus);
  }, []);

  return {
    burnStatus,
    showConfirmation,
    closeConfirmation,
    executeBurn,
    closeProgress,
    resetBurnFlow
  };
}
```

### **PHASE 2: Universal Confirmation Modal** (2-3 hours)

#### 2.1 Create Universal Confirmation Modal
**File**: `src/shared/components/UniversalBurnConfirmationModal.tsx`

```typescript
import React, { useState } from 'react';
import { BurnFlowContext } from '@/types/universalBurn';
import { formatBalance } from '@/lib/api';
import { getTokenValue } from '@/features/token-scanning/utils/tokenUtils';
import NFTImage from '@/shared/components/NFTImage';

interface UniversalBurnConfirmationModalProps {
  burnContext: BurnFlowContext;
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  isConfirming?: boolean;
}

export default function UniversalBurnConfirmationModal({
  burnContext,
  isOpen,
  onClose,
  onConfirm,
  isConfirming = false
}: UniversalBurnConfirmationModalProps) {
  const [showDetails, setShowDetails] = useState(false);

  if (!isOpen || !burnContext) return null;

  const { 
    tokens, nfts, totalItems, totalTokenValue, 
    hasHighValueTokens, hasETH, nftCollectionCount, burnType 
  } = burnContext;

  return (
    <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4">
      <div className="bg-gray-900 rounded-lg border border-gray-700 shadow-xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          {/* Dynamic Header */}
          <h2 className="text-xl font-bold text-white mb-4 flex items-center">
            <div className="w-8 h-8 bg-red-600 rounded-full flex items-center justify-center mr-3">🔥</div>
            {burnType === 'tokens-only' && `Confirm Burn - ${tokens.length} Token${tokens.length > 1 ? 's' : ''}`}
            {burnType === 'nfts-only' && `Confirm Burn - ${nfts.length} NFT${nfts.length > 1 ? 's' : ''}`}
            {burnType === 'mixed' && `Confirm Burn - ${totalItems} Items`}
          </h2>
          
          {/* Universal Irreversible Warning */}
          <div className="bg-red-900/30 border border-red-700 rounded-md p-4 mb-6">
            <p className="text-white font-medium">⚠️ WARNING: This action is irreversible!</p>
            <p className="text-gray-300 text-sm mt-1">
              Once assets are burned, they cannot be recovered. Please review carefully before proceeding.
            </p>
          </div>

          {/* Conditional Value Warning (Tokens only) */}
          {hasHighValueTokens && (
            <div className="bg-yellow-900/30 border border-yellow-700 rounded-md p-4 mb-6">
              <p className="text-white font-medium">💰 Value Warning!</p>
              <p className="text-gray-300 text-sm mt-1">
                You are about to burn tokens worth <span className="font-bold text-yellow-400">${totalTokenValue.toFixed(2)}</span>. 
                Please double-check that you really want to destroy these valuable tokens.
              </p>
            </div>
          )}

          {/* ETH Specific Warning */}
          {hasETH && (
            <div className="bg-orange-900/30 border border-orange-700 rounded-md p-4 mb-6">
              <p className="text-white font-medium">⚠️ ETH Gas Token Warning!</p>
              <p className="text-gray-300 text-sm mt-1">
                You selected ETH (native gas token). Burning ETH reduces your ability to pay transaction fees on Base network.
              </p>
            </div>
          )}

          {/* NFT Value Notice (NFTs present) */}
          {nfts.length > 0 && (
            <div className="bg-blue-900/30 border border-blue-700 rounded-md p-4 mb-6">
              <p className="text-white font-medium">💎 NFT Value Notice</p>
              <p className="text-gray-300 text-sm mt-1">
                NFTs may have significant value. Consider checking OpenSea for floor prices before burning. 
                Each NFT has an OpenSea link for quick verification.
              </p>
            </div>
          )}

          {/* Adaptive Summary Stats */}
          <div className="grid grid-cols-2 gap-4 mb-6">
            {tokens.length > 0 && (
              <div className="bg-gray-800 rounded-lg p-4">
                <div className="text-3xl font-bold text-white">{tokens.length}</div>
                <div className="text-gray-400 text-sm">Token{tokens.length > 1 ? 's' : ''}</div>
                <div className="text-yellow-400 text-sm mt-1">
                  Est. value: ${totalTokenValue.toFixed(2)}
                </div>
              </div>
            )}
            {nfts.length > 0 && (
              <div className="bg-gray-800 rounded-lg p-4">
                <div className="text-3xl font-bold text-white">{nfts.length}</div>
                <div className="text-gray-400 text-sm">NFT{nfts.length > 1 ? 's' : ''}</div>
                <div className="text-blue-400 text-sm mt-1">
                  {nftCollectionCount} collection{nftCollectionCount > 1 ? 's' : ''}
                </div>
              </div>
            )}
          </div>

          {/* Zero-Approval Architecture Explanation */}
          <div className="bg-blue-900/20 border border-blue-800 rounded-lg p-4 mb-6">
            <div className="flex items-center mb-2">
              <div className="w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center mr-2">
                <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <h3 className="text-blue-300 font-medium">Zero-Approval Architecture</h3>
            </div>
            <p className="text-gray-300 text-sm">
              Direct transfers to burn address - no approvals needed. You'll sign {totalItems} transaction{totalItems > 1 ? 's' : ''} for immediate burning.
            </p>
          </div>

          {/* Collapsible Details */}
          <div className="mb-6">
            <button
              onClick={() => setShowDetails(!showDetails)}
              className="flex items-center text-blue-400 hover:text-blue-300 transition-colors"
            >
              <svg 
                className={`w-4 h-4 mr-2 transform transition-transform ${showDetails ? 'rotate-90' : ''}`}
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
              {showDetails ? 'Hide details' : 'Show details'}
            </button>

            {showDetails && (
              <div className="mt-4 space-y-4">
                {/* Tokens Section */}
                {tokens.length > 0 && (
                  <div className="bg-gray-800 rounded-lg p-4">
                    <h3 className="text-white font-medium mb-3 flex items-center">
                      <div className="w-5 h-5 bg-blue-600 rounded-full flex items-center justify-center mr-2 text-xs">T</div>
                      Tokens ({tokens.length})
                    </h3>
                    <div className="space-y-2 max-h-40 overflow-y-auto">
                      {tokens.map((token, index) => {
                        const value = getTokenValue(token);
                        const formattedBalance = formatBalance(token.balance, token.contract_decimals);
                        
                        return (
                          <div key={token.contract_address} className="flex justify-between items-center py-1">
                            <div className="flex items-center">
                              <span className="text-gray-500 text-sm mr-2">{index + 1}.</span>
                              <div>
                                <span className="text-white font-medium">
                                  {token.contract_ticker_symbol || 'Unknown'}
                                </span>
                                <span className="text-gray-400 text-sm ml-2">
                                  {formattedBalance}
                                </span>
                              </div>
                            </div>
                            <span className="text-yellow-400 text-sm">
                              ${value.toFixed(2)}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* NFTs Section */}
                {nfts.length > 0 && (
                  <div className="bg-gray-800 rounded-lg p-4">
                    <h3 className="text-white font-medium mb-3 flex items-center">
                      <div className="w-5 h-5 bg-purple-600 rounded-full flex items-center justify-center mr-2 text-xs">N</div>
                      NFTs ({nfts.length})
                    </h3>
                    <div className="space-y-2 max-h-40 overflow-y-auto">
                      {nfts.map((nft, index) => (
                        <div key={`${nft.contract_address}-${nft.token_id}`} className="flex justify-between items-center py-1">
                          <div className="flex items-center">
                            <span className="text-gray-500 text-sm mr-2">{index + 1}.</span>
                            <div className="w-8 h-8 mr-2">
                              <NFTImage
                                src={nft.image_url}
                                alt={nft.name || `NFT #${nft.token_id}`}
                                className="w-8 h-8 rounded object-cover"
                              />
                            </div>
                            <div>
                              <span className="text-white font-medium">
                                {nft.name || `NFT #${nft.token_id}`}
                              </span>
                              <span className="text-gray-400 text-sm ml-2">
                                {nft.collection_name || 'Unknown Collection'}
                              </span>
                            </div>
                          </div>
                          <a
                            href={`https://opensea.io/assets/base/${nft.contract_address}/${nft.token_id}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-400 hover:text-blue-300 text-sm"
                          >
                            OpenSea ↗
                          </a>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Permanent Warning */}
          <div className="bg-red-900/20 border border-red-700 rounded-lg p-4 mb-6">
            <div className="flex items-center">
              <div className="w-6 h-6 bg-red-600 rounded-full flex items-center justify-center mr-3">
                <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div>
                <p className="text-red-300 font-medium">This action is permanent</p>
                <p className="text-gray-300 text-sm">
                  Burned assets cannot be recovered. Verify you're burning the correct items.
                </p>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 justify-end">
            <button
              type="button"
              className="px-6 py-3 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors font-medium"
              onClick={onClose}
              disabled={isConfirming}
            >
              Cancel
            </button>
            <button
              type="button"
              className="px-6 py-3 bg-gradient-to-r from-red-600 to-orange-600 hover:from-red-500 hover:to-orange-500 disabled:from-red-800 disabled:to-orange-800 text-white rounded-lg transition-all transform hover:scale-105 disabled:scale-100 font-medium flex items-center disabled:cursor-not-allowed"
              onClick={onConfirm}
              disabled={isConfirming}
            >
              {isConfirming ? (
                <>
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Confirming...
                </>
              ) : (
                <>
                  🔥 Burn {totalItems} Item{totalItems > 1 ? 's' : ''}
                  <svg className="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                  </svg>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
```

### **PHASE 3: Universal Progress Modal** (2-3 hours)

#### 3.1 Create Universal Progress Modal
**File**: `src/shared/components/UniversalBurnProgress.tsx`

```typescript
import React from 'react';
import { UniversalBurnFlowStatus } from '@/types/universalBurn';
import { formatBalance } from '@/lib/api';
import { getTokenValue } from '@/features/token-scanning/utils/tokenUtils';
import NFTImage from '@/shared/components/NFTImage';

interface UniversalBurnProgressProps {
  burnStatus: UniversalBurnFlowStatus;
  onClose: () => void;
}

export default function UniversalBurnProgress({
  burnStatus,
  onClose
}: UniversalBurnProgressProps) {
  const { 
    processedItems, totalItems, inProgress, 
    results, currentItem, currentStepMessage, burnContext 
  } = burnStatus;

  if (!burnContext) return null;

  const progressPercentage = totalItems > 0 ? (processedItems / totalItems) * 100 : 0;

  return (
    <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4">
      <div className="bg-gray-900 rounded-lg border border-gray-700 shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          {/* Header with Progress */}
          <h2 className="text-xl font-bold text-white mb-4 flex items-center">
            <div className="w-8 h-8 bg-red-600 rounded-full flex items-center justify-center mr-3">🔥</div>
            {inProgress ? 'Burning Assets' : 'Burn Complete'} - {Math.round(progressPercentage)}%
          </h2>
          
          {/* Progress Bar */}
          <div className="w-full bg-gray-700 rounded-full h-3 mb-6">
            <div 
              className="bg-gradient-to-r from-red-600 to-orange-500 h-3 rounded-full transition-all duration-300"
              style={{ width: `${progressPercentage}%` }}
            />
          </div>
          
          {/* Status Summary */}
          <div className="grid grid-cols-3 gap-4 mb-6">
            <div className="bg-gray-800 rounded-lg p-4 text-center">
              <div className="text-2xl font-bold text-white">{totalItems}</div>
              <div className="text-gray-400 text-sm">Total Items</div>
            </div>
            <div className="bg-green-900/30 rounded-lg p-4 text-center">
              <div className="text-2xl font-bold text-green-400">{results.successful.length}</div>
              <div className="text-gray-400 text-sm">Successful</div>
            </div>
            <div className="bg-red-900/30 rounded-lg p-4 text-center">
              <div className="text-2xl font-bold text-red-400">{results.failed.length}</div>
              <div className="text-gray-400 text-sm">Failed</div>
            </div>
          </div>

          {/* Current Operation */}
          {inProgress && currentItem && (
            <div className="bg-gray-800 rounded-lg p-4 mb-6">
              <div className="flex items-center">
                <div className="animate-spin w-5 h-5 border-2 border-blue-500 border-t-transparent rounded-full mr-3" />
                <div>
                  <p className="text-white font-medium">
                    {currentItem.type === 'token' ? 'Burning Token' : 'Burning NFT'}
                  </p>
                  <p className="text-gray-400 text-sm">{currentStepMessage}</p>
                </div>
              </div>
            </div>
          )}

          {/* Results by Type */}
          <div className="space-y-4">
            {/* Token Results */}
            {burnContext.tokens.length > 0 && (
              <div className="bg-gray-800 rounded-lg p-4">
                <h3 className="text-white font-medium mb-3 flex items-center">
                  <div className="w-5 h-5 bg-blue-600 rounded-full flex items-center justify-center mr-2 text-xs">T</div>
                  Tokens ({burnContext.tokens.length})
                </h3>
                <div className="space-y-2 max-h-60 overflow-y-auto">
                  {burnContext.tokens.map((token, index) => {
                    const tokenResult = results.successful.find(r => r.item.data === token) || 
                                     results.failed.find(r => r.item.data === token) ||
                                     results.userRejected.find(r => r.item.data === token);
                    
                    const value = getTokenValue(token);
                    const formattedBalance = formatBalance(token.balance, token.contract_decimals);
                    
                    return (
                      <div key={token.contract_address} className="flex justify-between items-center py-2">
                        <div className="flex items-center">
                          <div className={`w-4 h-4 rounded-full mr-3 ${
                            tokenResult?.success ? 'bg-green-500' : 
                            tokenResult?.isUserRejection ? 'bg-yellow-500' :
                            tokenResult ? 'bg-red-500' : 'bg-gray-500'
                          }`} />
                          <div>
                            <span className="text-white font-medium">
                              {token.contract_ticker_symbol || 'Unknown'}
                            </span>
                            <span className="text-gray-400 text-sm ml-2">
                              {formattedBalance}
                            </span>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-yellow-400 text-sm">${value.toFixed(2)}</span>
                          {tokenResult?.txHash && (
                            <a
                              href={`https://basescan.org/tx/${tokenResult.txHash}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-blue-400 hover:text-blue-300 text-sm"
                            >
                              View TX ↗
                            </a>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
            
            {/* NFT Results */}
            {burnContext.nfts.length > 0 && (
              <div className="bg-gray-800 rounded-lg p-4">
                <h3 className="text-white font-medium mb-3 flex items-center">
                  <div className="w-5 h-5 bg-purple-600 rounded-full flex items-center justify-center mr-2 text-xs">N</div>
                  NFTs ({burnContext.nfts.length})
                </h3>
                <div className="space-y-2 max-h-60 overflow-y-auto">
                  {burnContext.nfts.map((nft, index) => {
                    const nftResult = results.successful.find(r => r.item.data === nft) || 
                                    results.failed.find(r => r.item.data === nft) ||
                                    results.userRejected.find(r => r.item.data === nft);
                    
                    return (
                      <div key={`${nft.contract_address}-${nft.token_id}`} className="flex justify-between items-center py-2">
                        <div className="flex items-center">
                          <div className={`w-4 h-4 rounded-full mr-3 ${
                            nftResult?.success ? 'bg-green-500' : 
                            nftResult?.isUserRejection ? 'bg-yellow-500' :
                            nftResult ? 'bg-red-500' : 'bg-gray-500'
                          }`} />
                          <div className="w-8 h-8 mr-2">
                            <NFTImage
                              src={nft.image_url}
                              alt={nft.name || `NFT #${nft.token_id}`}
                              className="w-8 h-8 rounded object-cover"
                            />
                          </div>
                          <div>
                            <span className="text-white font-medium">
                              {nft.name || `NFT #${nft.token_id}`}
                            </span>
                            <span className="text-gray-400 text-sm ml-2">
                              {nft.collection_name || 'Unknown'}
                            </span>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          {nftResult?.txHash && (
                            <a
                              href={`https://basescan.org/tx/${nftResult.txHash}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-blue-400 hover:text-blue-300 text-sm"
                            >
                              View TX ↗
                            </a>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {/* Close Button - Only when complete */}
          {!inProgress && (
            <div className="flex justify-end mt-6">
              <button 
                onClick={onClose}
                className="px-6 py-3 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors font-medium"
              >
                Done
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
```

### **PHASE 4: Integration & Component Updates** (1-2 hours)

#### 4.1 Update TokenScanner Component
**File**: `src/features/token-scanning/components/TokenScanner.tsx`

```typescript
// Replace existing burn flow with universal flow
import { useUniversalBurnFlow } from '@/hooks/useUniversalBurnFlow';
import UniversalBurnConfirmationModal from '@/shared/components/UniversalBurnConfirmationModal';
import UniversalBurnProgress from '@/shared/components/UniversalBurnProgress';

// In TokenScanner component:
const { burnStatus, showConfirmation, executeBurn, closeConfirmation, closeProgress } = useUniversalBurnFlow();

const handleBurnSelected = useCallback(() => {
  const selectedTokenAssets = Array.from(selectedTokens)
    .map(address => tokens.find(t => t.contract_address === address))
    .filter(Boolean) as Token[];
  
  showConfirmation(selectedTokenAssets); 
}, [selectedTokens, tokens, showConfirmation]);

// Add modals to render
return (
  <>
    {/* Existing TokenScanner UI */}
    
    {/* Universal Burn Modals */}
    <UniversalBurnConfirmationModal
      burnContext={burnStatus.burnContext}
      isOpen={burnStatus.isConfirmationOpen}
      onClose={closeConfirmation}
      onConfirm={executeBurn}
    />
    
    <UniversalBurnProgress
      burnStatus={burnStatus}
      onClose={closeProgress}
    />
  </>
);
```

#### 4.2 Update NFTScanner Component
**File**: `src/features/nft-scanning/components/NFTScanner.tsx`

```typescript
// Similar pattern for NFTScanner
import { useUniversalBurnFlow } from '@/hooks/useUniversalBurnFlow';

const { burnStatus, showConfirmation, executeBurn, closeConfirmation, closeProgress } = useUniversalBurnFlow();

const handleBurnSelected = useCallback(() => {
  const selectedNFTAssets = Array.from(selectedNFTs)
    .map(id => allNFTs.find(nft => `${nft.contract_address}-${nft.token_id}` === id))
    .filter(Boolean) as NFT[];
  
  showConfirmation(selectedNFTAssets);
}, [selectedNFTs, allNFTs, showConfirmation]);
```

#### 4.3 Update FloatingActionBar
**File**: `src/shared/components/FloatingActionBar.tsx`

```typescript
// Update to use universal flow for mixed selections
import { useUniversalBurnFlow } from '@/hooks/useUniversalBurnFlow';

const { showConfirmation } = useUniversalBurnFlow();

const handleBurnMixed = useCallback(() => {
  const allAssets: BurnableAsset[] = [
    ...selectedTokenAssets,
    ...selectedNFTAssets
  ];
  
  showConfirmation(allAssets);
}, [selectedTokenAssets, selectedNFTAssets, showConfirmation]);
```

### **PHASE 5: Cleanup & Migration** (1 hour)

#### 5.1 Remove Legacy Files
- `src/hooks/useBurnFlow.ts` (276 lines)
- `src/hooks/useNFTBurnFlow.ts` (257 lines)
- `src/features/token-scanning/components/BurnConfirmationModal.tsx`
- `src/features/token-scanning/components/BurnTransactionStatus.tsx`
- `src/features/nft-scanning/components/NFTBurnConfirmationModal.tsx`
- `src/features/nft-scanning/components/NFTBurnTransactionStatus.tsx`
- `src/shared/hooks/useUnifiedBurn.ts` (existing unified flow)
- `src/shared/components/UnifiedBurnConfirmationModal.tsx` (existing)
- `src/shared/components/UnifiedBurnProgress.tsx` (existing)
- `src/shared/components/UnifiedBurnManager.tsx` (existing)

#### 5.2 Update All Import References
- Search and replace all imports of legacy burn components
- Update component references throughout the codebase
- Remove unused dependencies and types

## 🧪 **Testing Strategy**

### **Functional Testing**
1. **Token-Only Burns**: Test with various token types (ETH, high-value, spam)
2. **NFT-Only Burns**: Test with single and multiple NFTs from different collections
3. **Mixed Burns**: Test combinations of tokens and NFTs
4. **Edge Cases**: Test with 0 value tokens, missing metadata, failed transactions
5. **User Rejection**: Test wallet rejection scenarios
6. **Error Handling**: Test network errors, contract restrictions

### **UI/UX Testing**
1. **Modal Responsiveness**: Test on different screen sizes
2. **Warning Display**: Verify contextual warnings appear correctly
3. **Progress Tracking**: Verify real-time updates during burns
4. **Transaction Links**: Test BaseScan links for successful and failed transactions
5. **Collapsible Details**: Test show/hide functionality

### **Performance Testing**
1. **Large Batch Burns**: Test with 20+ items
2. **Mixed Asset Performance**: Test token+NFT combinations
3. **Memory Usage**: Monitor for memory leaks during long sessions
4. **Build Performance**: Verify build times remain under 4 seconds

## 📊 **Success Metrics**

### **Code Quality**
- ✅ 60% reduction in burn-related code (700+ lines eliminated)
- ✅ Single source of truth for burn logic
- ✅ Consistent error handling across all asset types
- ✅ Improved type safety with universal types

### **User Experience**
- ✅ Consistent modal design across all burn scenarios
- ✅ Smart contextual warnings (value warnings only when applicable)
- ✅ Enhanced progress tracking with better categorization
- ✅ Unified transaction result display

### **Maintainability**
- ✅ Easier testing with single flow
- ✅ Simplified debugging and error tracking
- ✅ Future-proof architecture for new asset types
- ✅ Reduced complexity in component integration

## 🚀 **Implementation Timeline**

**Total Estimated Time: 6-8 hours**

- **Day 1**: Phase 1-2 (Universal Hook + Confirmation Modal) - 4-5 hours
- **Day 2**: Phase 3-4 (Progress Modal + Integration) - 2-3 hours  
- **Day 3**: Phase 5 (Cleanup + Testing) - 1-2 hours

## 🎯 **Next Steps**

1. **Review and Approve**: Review this implementation plan
2. **Create Implementation Branch**: `feature/universal-burn-flow`
3. **Implement Phase by Phase**: Follow the structured approach
4. **Test Thoroughly**: Ensure no regressions in existing functionality
5. **Update Documentation**: Update PROJECT_STATUS_SUMMARY.md upon completion
6. **Deploy and Monitor**: Deploy to production and monitor for issues

## 📝 **Notes**

- This implementation maintains backward compatibility during development
- All existing functionality will be preserved
- The universal flow is designed to be a drop-in replacement
- Enhanced features (better warnings, progress tracking) come as bonuses
- Build performance should remain at current 3-4 second targets

---

**This implementation represents a major architectural improvement that will significantly enhance code maintainability, user experience consistency, and future development velocity.** 