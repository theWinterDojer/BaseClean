import React from 'react';
import { NFTBurnFlowStatus } from '@/hooks/useNFTBurnFlow';
import NFTImage from '@/shared/components/NFTImage';

interface NFTBurnTransactionStatusProps {
  burnStatus: NFTBurnFlowStatus;
  onClose: () => void;
  isWaitingForConfirmation: boolean;
}

export default function NFTBurnTransactionStatus({
  burnStatus,
  onClose,
  isWaitingForConfirmation
}: NFTBurnTransactionStatusProps) {
  const { 
    inProgress, 
    success, 
    error, 
    nftsBurned,
    nftsFailed,
    nftsRejectedByUser,
    processedNFTs,
    totalNFTs,
    burnResults,
    currentNFT
  } = burnStatus;

  if (!inProgress && !success && !error && !isWaitingForConfirmation) {
    return null;
  }

  // Categorize results  
  const actualFailures = burnResults?.filter(r => !r.success && !r.isUserRejection) || [];

  // Group NFTs by collection for better display
  const groupedResults = burnResults.reduce((groups, result) => {
    const collectionName = result.nft.collection_name || 'Unknown Collection';
    if (!groups[collectionName]) {
      groups[collectionName] = [];
    }
    groups[collectionName].push(result);
    return groups;
  }, {} as Record<string, typeof burnResults>);

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-gray-900 rounded-xl shadow-xl max-w-2xl w-full max-h-[80vh] overflow-hidden m-4">
        {/* Header */}
        <div className="flex justify-between items-center mb-4 p-6 pb-0">
          {!inProgress && (
            <h3 className="text-lg font-semibold text-white">
              {isWaitingForConfirmation && 'Confirm Transaction'}
              {success && (() => {
                if (nftsBurned === 0 && nftsRejectedByUser > 0 && nftsFailed === 0) {
                  return 'NFT Burn Transaction Rejected';
                } else if (nftsBurned > 0) {
                  return 'NFT Burn Complete!';
                } else {
                  return 'NFT Burn Process Complete';
                }
              })()}
              {error && 'NFT Burn Failed'}
            </h3>
          )}
          {(success || error) && (
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-200 transition-colors"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          )}
        </div>

        <div className="p-6 pt-4">
          {/* Waiting for confirmation */}
          {isWaitingForConfirmation && (
            <div className="text-center py-4">
              <div className="mb-4">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-400 mx-auto"></div>
              </div>
              <p className="text-sm text-gray-300 mb-2">
                Please confirm the transaction in your wallet
              </p>
              <p className="text-xs text-gray-400">
                Burning {totalNFTs} NFT{totalNFTs > 1 ? 's' : ''} with direct transfers
              </p>
              <p className="text-xs text-blue-300 mt-2">
                💡 You can cancel in your wallet if you change your mind
              </p>
            </div>
          )}

          {/* Burn in progress (but not waiting for initial confirmation) */}
          {inProgress && !isWaitingForConfirmation && (
            <div className="space-y-4">
              <div className="flex items-center space-x-3">
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-400"></div>
                <span className="text-sm font-medium text-white">
                  Burning {totalNFTs} NFT{totalNFTs > 1 ? 's' : ''}
                </span>
              </div>

              {/* Progress bar */}
              {totalNFTs > 0 && (
                <div className="space-y-3">
                  <div className="flex justify-between text-sm text-gray-300">
                    <span>Progress</span>
                    <span>{processedNFTs}/{totalNFTs}</span>
                  </div>
                  <div className="w-full bg-gray-700 rounded-full h-2">
                    <div 
                      className="bg-gradient-to-r from-blue-500 to-blue-400 h-2 rounded-full transition-all duration-300"
                      style={{ width: totalNFTs > 0 ? `${(processedNFTs / totalNFTs) * 100}%` : '0%' }}
                    ></div>
                  </div>
                  
                  {/* Current NFT being processed */}
                  {currentNFT && (
                    <div className="bg-gray-800 rounded-lg p-3 flex items-center space-x-3">
                      <div className="w-10 h-10 relative rounded overflow-hidden flex-shrink-0">
                        <NFTImage
                          tokenId={currentNFT.token_id}
                          name={currentNFT.name}
                          imageUrl={currentNFT.image_url}
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-white truncate">
                          Burning: {currentNFT.name || `NFT #${currentNFT.token_id}`}
                        </p>
                        <p className="text-xs text-gray-400">
                          {currentNFT.collection_name || 'Unknown Collection'}
                        </p>
                      </div>
                    </div>
                  )}
                  
                  <p className="text-xs text-gray-400 text-center">
                    Each NFT will prompt a burn transfer. No contract approvals necessary.
                  </p>
                  <p className="text-xs text-blue-300 text-center">
                    You can cancel any transaction in your wallet
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Success state */}
          {success && !inProgress && (
            <div className="space-y-4">
              <div className="text-center py-4">
                <div className="mb-4">
                  <div className={`mx-auto w-12 h-12 rounded-full flex items-center justify-center ${
                    nftsBurned > 0 
                      ? 'bg-green-900/30 border border-green-700' 
                      : 'bg-red-900/30 border border-red-700'
                  }`}>
                    {nftsBurned > 0 ? (
                      <svg className="w-6 h-6 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    ) : (
                      <svg className="w-6 h-6 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    )}
                  </div>
                </div>
                <h4 className={`text-lg font-semibold mb-2 ${
                  nftsBurned > 0 
                    ? 'text-green-400' 
                    : 'text-red-400'
                }`}>
                  {nftsBurned > 0 
                    ? '🎉 NFT Burn Process Complete!' 
                    : '❌ NFT Burn Process Complete'}
                </h4>
                
                {/* Text summary */}
                <div className="text-sm text-gray-300">
                  {nftsBurned > 0 && (
                    <p className="text-green-400 mb-1">
                      ✅ {nftsBurned} NFT{nftsBurned > 1 ? 's' : ''} successfully burned
                    </p>
                  )}
                  {nftsRejectedByUser > 0 && (
                    <p className="text-yellow-400 mb-1">
                      ⏭️ {nftsRejectedByUser} transaction{nftsRejectedByUser > 1 ? 's' : ''} cancelled by user
                    </p>
                  )}
                  {actualFailures.length > 0 && (
                    <p className="text-red-400 mb-1">
                      ❌ {actualFailures.length} NFT{actualFailures.length > 1 ? 's' : ''} failed to burn
                    </p>
                  )}
                </div>
              </div>

              {/* Detailed results */}
              {burnResults.length > 0 && (
                <div className="space-y-4 max-h-64 overflow-y-auto bg-gray-800 rounded-lg p-4">
                  <h5 className="text-sm font-semibold text-white mb-3">Transaction Details:</h5>
                  
                  {Object.entries(groupedResults).map(([collectionName, results]) => (
                    <div key={collectionName} className="mb-4 last:mb-0">
                      <h6 className="text-xs font-medium text-blue-400 mb-2 border-b border-gray-700 pb-1">
                        {collectionName} ({results.length} NFT{results.length > 1 ? 's' : ''})
                      </h6>
                      <div className="space-y-2">
                        {results.map((result, index) => (
                          <div key={index} className="flex items-center justify-between text-xs">
                            <div className="flex items-center space-x-2 flex-1 min-w-0">
                              <span className={`w-2 h-2 rounded-full flex-shrink-0 ${
                                result.success ? 'bg-green-500' : 
                                result.isUserRejection ? 'bg-yellow-500' : 'bg-red-500'
                              }`} />
                              <span className="text-gray-300 truncate">
                                {result.nft.name || `NFT #${result.nft.token_id}`}
                              </span>
                            </div>
                            <div className="flex items-center space-x-2">
                              {result.success ? (
                                <>
                                  <span className="text-green-400">Success</span>
                                  {result.txHash && (
                                    <a
                                      href={`https://basescan.org/tx/${result.txHash}`}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className="text-blue-400 hover:text-blue-300 underline"
                                    >
                                      View TX
                                    </a>
                                  )}
                                </>
                              ) : result.isUserRejection ? (
                                <span className="text-yellow-400">Cancelled</span>
                              ) : (
                                <>
                                  <span className="text-red-400">Failed</span>
                                  {result.txHash && (
                                    <a
                                      href={`https://basescan.org/tx/${result.txHash}`}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className="text-blue-400 hover:text-blue-300 underline"
                                    >
                                      View TX
                                    </a>
                                  )}
                                </>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Close button */}
              <button
                onClick={onClose}
                className="w-full bg-blue-600 hover:bg-blue-500 text-white font-medium py-2 px-4 rounded-lg transition-colors"
              >
                Done
              </button>
            </div>
          )}

          {/* Error state */}
          {error && !inProgress && (
            <div className="text-center py-4">
              <div className="mb-4">
                <div className="mx-auto w-12 h-12 rounded-full bg-red-900/30 border border-red-700 flex items-center justify-center">
                  <svg className="w-6 h-6 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </div>
              </div>
              <h4 className="text-lg font-semibold text-red-400 mb-2">Error</h4>
              <p className="text-sm text-gray-300 mb-4">{error}</p>
              <button
                onClick={onClose}
                className="bg-gray-700 hover:bg-gray-600 text-white font-medium py-2 px-4 rounded-lg transition-colors"
              >
                Close
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
} 