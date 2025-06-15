import React, { useState } from 'react';
import Image from 'next/image';
import { BurnableItem } from '@/types/nft';
import { formatBalance } from '@/lib/api';
import { getTokenValue } from '@/features/token-scanning/utils/tokenUtils';
import NFTImage from '@/shared/components/NFTImage';

interface UnifiedBurnConfirmationModalProps {
  selectedItems: BurnableItem[];
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  isConfirming?: boolean;
}

export default function UnifiedBurnConfirmationModal({
  selectedItems,
  isOpen,
  onClose,
  onConfirm,
  isConfirming = false
}: UnifiedBurnConfirmationModalProps) {
  const [showDetails, setShowDetails] = useState(false);
  
  if (!isOpen) return null;

  // Separate tokens and NFTs
  const tokens = selectedItems.filter(item => item.type === 'token').map(item => item.data);
  const nfts = selectedItems.filter(item => item.type === 'nft').map(item => item.data);
  
  const totalItems = selectedItems.length;
  const tokenCount = tokens.length;
  const nftCount = nfts.length;

  // Calculate token value
  const totalTokenValue = tokens.reduce((sum, token) => sum + getTokenValue(token), 0);

  // Group NFTs by collection
  const groupedNFTs = nfts.reduce((groups, nft) => {
    const collectionName = nft.collection_name || 'Unknown Collection';
    if (!groups[collectionName]) {
      groups[collectionName] = [];
    }
    groups[collectionName].push(nft);
    return groups;
  }, {} as Record<string, typeof nfts>);

  const collectionCount = Object.keys(groupedNFTs).length;

  return (
    <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4">
      <div className="bg-gray-900 rounded-lg border border-gray-700 shadow-xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          {/* Header */}
          <h2 className="text-xl font-bold text-white mb-4 flex items-center">
            <div className="w-8 h-8 bg-red-600 rounded-full flex items-center justify-center mr-3">
              🔥
            </div>
            Confirm Burn - {totalItems} Item{totalItems > 1 ? 's' : ''}
          </h2>
          
          {/* Summary Stats */}
          <div className="grid grid-cols-2 gap-4 mb-6">
            {tokenCount > 0 && (
              <div className="bg-gray-800 rounded-lg p-4">
                <div className="text-3xl font-bold text-white">{tokenCount}</div>
                <div className="text-gray-400 text-sm">Token{tokenCount > 1 ? 's' : ''}</div>
                <div className="text-yellow-400 text-sm mt-1">
                  Est. value: ${totalTokenValue.toFixed(2)}
                </div>
              </div>
            )}
            {nftCount > 0 && (
              <div className="bg-gray-800 rounded-lg p-4">
                <div className="text-3xl font-bold text-white">{nftCount}</div>
                <div className="text-gray-400 text-sm">NFT{nftCount > 1 ? 's' : ''}</div>
                <div className="text-blue-400 text-sm mt-1">
                  {collectionCount} collection{collectionCount > 1 ? 's' : ''}
                </div>
              </div>
            )}
          </div>

          {/* Zero-Approval Method */}
          <div className="bg-blue-900/30 border border-blue-700 rounded-md p-4 mb-6">
            <div className="flex items-start">
              <div className="w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center mr-3 mt-0.5">
                🔐
              </div>
              <div>
                <p className="text-white font-medium">Zero-Approval Architecture</p>
                <p className="text-gray-300 text-sm mt-1">
                  Direct transfers to burn address - no approvals needed. You&apos;ll sign {totalItems} transaction{totalItems > 1 ? 's' : ''} for immediate burning.
                </p>
              </div>
            </div>
          </div>

          {/* Item Details (Collapsible) */}
          <div className="mb-6">
            <button
              onClick={() => setShowDetails(!showDetails)}
              className="flex items-center text-gray-400 hover:text-white transition-colors"
            >
              <svg 
                className={`w-4 h-4 mr-2 transition-transform ${showDetails ? 'rotate-90' : ''}`}
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
              {showDetails ? 'Hide' : 'Show'} details
            </button>
            
            {showDetails && (
              <div className="mt-4 space-y-4">
                {/* Tokens Section */}
                {tokenCount > 0 && (
                  <div className="bg-gray-800 rounded-lg p-4">
                    <h3 className="text-white font-medium mb-3 flex items-center">
                      <div className="w-5 h-5 bg-blue-600 rounded-full flex items-center justify-center mr-2 text-xs">
                        T
                      </div>
                      Tokens ({tokenCount})
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
                {nftCount > 0 && (
                  <div className="bg-gray-800 rounded-lg p-4">
                    <h3 className="text-white font-medium mb-3 flex items-center">
                      <div className="w-5 h-5 bg-purple-600 rounded-full flex items-center justify-center mr-2 text-xs">
                        N
                      </div>
                      NFTs ({nftCount})
                    </h3>
                    <div className="space-y-3 max-h-60 overflow-y-auto">
                      {Object.entries(groupedNFTs).map(([collectionName, collectionNFTs]) => (
                        <div key={collectionName}>
                          <h4 className="text-blue-400 text-sm font-medium mb-2">
                            {collectionName} ({collectionNFTs.length})
                          </h4>
                          <div className="grid grid-cols-2 gap-2">
                            {collectionNFTs.map((nft) => (
                              <div 
                                key={`${nft.contract_address}-${nft.token_id}`} 
                                className="flex items-center space-x-2 bg-gray-700/50 rounded p-2"
                              >
                                <div className="w-8 h-8 flex-shrink-0 relative rounded overflow-hidden">
                                  <NFTImage
                                    tokenId={nft.token_id}
                                    name={nft.name}
                                    imageUrl={nft.image_url}
                                  />
                                </div>
                                <div className="flex-1 min-w-0">
                                  <div className="text-white text-sm truncate">
                                    {nft.name || `#${nft.token_id}`}
                                  </div>
                                  <div className="text-gray-500 text-xs">
                                    {nft.token_standard}
                                  </div>
                                </div>
                                <a
                                  href={`https://opensea.io/assets/base/${nft.contract_address}/${nft.token_id}`}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="w-6 h-6 bg-blue-600 hover:bg-blue-500 rounded-full flex items-center justify-center transition-colors"
                                  title="View on OpenSea"
                                >
                                  <Image 
                                    src="/opensealogo.png" 
                                    alt="OpenSea"
                                    width={12}
                                    height={12}
                                  />
                                </a>
                              </div>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Permanent Warning */}
          <div className="bg-red-900/30 border border-red-700 rounded-md p-4 mb-6">
            <div className="flex items-start">
              <div className="w-6 h-6 bg-red-600 rounded-full flex items-center justify-center mr-3 mt-0.5">
                ⚠️
              </div>
              <div>
                <p className="text-red-300 font-medium">This action is permanent</p>
                <p className="text-gray-300 text-sm mt-1">
                  Burned assets cannot be recovered. Verify you&apos;re burning the correct items.
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