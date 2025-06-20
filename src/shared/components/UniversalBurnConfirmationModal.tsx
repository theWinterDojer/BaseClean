import React, { useState } from 'react';
import { BurnFlowContext } from '@/types/universalBurn';
import { formatBalance } from '@/lib/api';
import { getTokenValue } from '@/features/token-scanning/utils/tokenUtils';
import NFTImage from '@/shared/components/NFTImage';
import Image from 'next/image';

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
          <div className={`grid ${tokens.length > 0 && nfts.length > 0 ? 'grid-cols-2' : 'grid-cols-1'} gap-4 mb-6`}>
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
              Direct transfers to burn address - no approvals needed. You&apos;ll sign {totalItems} transaction{totalItems > 1 ? 's' : ''} for immediate burning.
            </p>
          </div>

          {/* Prominent Details Toggle */}
          <div className="mb-6">
            <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-white font-medium">Review Items to Burn</p>
                  <p className="text-gray-400 text-sm">Click to see the complete list of tokens and NFTs</p>
                </div>
                <button
                  onClick={() => setShowDetails(!showDetails)}
                  className="flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg transition-all font-medium"
                >
                  {showDetails ? 'Hide Details' : 'View Details'}
                  <svg 
                    className={`w-4 h-4 ml-2 transform transition-transform ${showDetails ? 'rotate-180' : ''}`}
                    fill="none" 
                    stroke="currentColor" 
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
              </div>
            </div>

            {showDetails && (
              <div className="mt-4 space-y-4">
                {/* Tokens Section */}
                {tokens.length > 0 && (
                  <div className="bg-gray-800 rounded-lg p-4">
                    <h3 className="text-white font-medium mb-3 flex items-center">
                      <div className="w-5 h-5 bg-blue-600 rounded-full flex items-center justify-center mr-2 text-xs">T</div>
                      Tokens ({tokens.length})
                    </h3>
                    <div className="space-y-2 max-h-64 overflow-y-auto pr-2" style={{ scrollbarWidth: 'thin' }}>
                      {tokens.map((token, index) => {
                        const value = getTokenValue(token);
                        const formattedBalance = formatBalance(token.balance, token.contract_decimals);
                        
                        return (
                          <div key={token.contract_address} className="flex justify-between items-center py-1">
                            <div className="flex items-center">
                              <span className="text-gray-500 text-sm mr-2">{index + 1}.</span>
                              <div className="flex items-center">
                                {token.logo_url ? (
                                  <img 
                                    src={token.logo_url} 
                                    alt={token.contract_ticker_symbol || ''} 
                                    className="w-5 h-5 rounded-full mr-2"
                                    onError={(e) => {
                                      (e.target as HTMLImageElement).style.display = 'none';
                                    }}
                                  />
                                ) : (
                                  <div className="w-5 h-5 bg-gray-700 rounded-full mr-2 flex items-center justify-center text-xs text-gray-400">
                                    {token.contract_ticker_symbol?.[0] || '?'}
                                  </div>
                                )}
                                <div>
                                  <span className="text-white font-medium">
                                    {token.contract_ticker_symbol || 'Unknown'}
                                  </span>
                                  <span className="text-gray-400 text-sm ml-2">
                                    {formattedBalance}
                                  </span>
                                </div>
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
                    <div className="space-y-2 max-h-64 overflow-y-auto pr-2" style={{ scrollbarWidth: 'thin' }}>
                      {nfts.map((nft, index) => (
                        <div key={`${nft.contract_address}-${nft.token_id}`} className="flex justify-between items-center py-1">
                          <div className="flex items-center">
                            <span className="text-gray-500 text-sm mr-2">{index + 1}.</span>
                            <div className="w-8 h-8 mr-2 relative overflow-hidden rounded">
                              <NFTImage
                                tokenId={nft.token_id}
                                name={nft.name}
                                imageUrl={nft.image_url}
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
                            className="text-blue-400 hover:text-blue-300 text-sm flex items-center"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <Image
                              src="/opensealogo.png"
                              alt="OpenSea"
                              width={16}
                              height={16}
                              className="mr-1"
                            />
                            View
                          </a>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 justify-end">
            <button
              type="button"
              className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors font-medium"
              onClick={onClose}
              disabled={isConfirming}
            >
              Cancel
            </button>
            <button
              type="button"
              className="px-4 py-2 bg-gradient-to-r from-red-600 to-orange-600 hover:from-red-500 hover:to-orange-500 disabled:from-red-800 disabled:to-orange-800 text-white rounded-lg transition-all transform hover:scale-105 disabled:scale-100 font-medium flex items-center disabled:cursor-not-allowed"
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