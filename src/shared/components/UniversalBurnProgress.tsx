import React from 'react';
import Image from 'next/image';
import { UniversalBurnFlowStatus, BurnResult } from '@/types/universalBurn';
import NFTImage from '@/shared/components/NFTImage';
import { NFT } from '@/types/nft';
import BurnFailureEducationModal from '@/components/SpamNFTEducationModal';

interface UniversalBurnProgressProps {
  burnStatus: UniversalBurnFlowStatus;
  onClose: () => void;
}

export default function UniversalBurnProgress({
  burnStatus,
  onClose
}: UniversalBurnProgressProps) {
  const [showEducationModal, setShowEducationModal] = React.useState(false);
  
  const { 
    isProgressOpen,
    inProgress,
    success,
    error,
    processedItems,
    totalItems,
    results,
    currentItem,
    currentStepMessage,
    estimatedTimeRemaining,
    currentBatch,
    totalBatches
  } = burnStatus;

  // Don't render if modal should not be open
  if (!isProgressOpen) return null;

  // Calculate progress percentage
  const progressPercentage = totalItems > 0 
    ? Math.round((processedItems / totalItems) * 100)
    : 0;

  // Check if burning is complete
  const isComplete = !inProgress && (success || error);

  // Get completion statistics
  const successCount = results.successful.length;
  const failedCount = results.failed.length;
  const rejectedCount = results.userRejected.length;

  // Separate results by type and status
  const successfulTokens = results.successful.filter(r => r.item.type === 'token');
  const failedTokens = results.failed.filter(r => r.item.type === 'token');
  const cancelledTokens = results.userRejected.filter(r => r.item.type === 'token');
  
  const successfulNFTs = results.successful.filter(r => r.item.type === 'nft');
  const failedNFTs = results.failed.filter(r => r.item.type === 'nft');
  const cancelledNFTs = results.userRejected.filter(r => r.item.type === 'nft');

  // Group NFT results by collection for each status
  const groupNFTsByCollection = (nftBurnResults: BurnResult[]) => {
    return nftBurnResults.reduce((groups, result) => {
      if (result.item.type === 'nft' && 'collection_name' in result.item.data) {
        const collection = result.item.data.collection_name || 'Unknown Collection';
        if (!groups[collection]) groups[collection] = [];
        groups[collection].push(result);
      }
      return groups;
    }, {} as Record<string, BurnResult[]>);
  };

  const successfulNFTsByCollection = groupNFTsByCollection(successfulNFTs);
  const failedNFTsByCollection = groupNFTsByCollection(failedNFTs);
  const cancelledNFTsByCollection = groupNFTsByCollection(cancelledNFTs);

  // Get dynamic header title
  const getHeaderTitle = () => {
    if (isComplete) {
      if (successCount > 0 && failedCount === 0 && rejectedCount === 0) {
        return 'Burn Complete!';
      } else if (successCount > 0) {
        return 'Burn Process Complete';
      } else if (rejectedCount === totalItems) {
        return 'Burn Process Cancelled';
      } else {
        return 'Burn Process Complete';
      }
    }
    return `Burning Assets - ${progressPercentage}%`;
  };

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-gray-900 rounded-lg border border-gray-700 shadow-xl max-w-2xl w-full max-h-[90vh] overflow-hidden">
        <div className="p-6">
          {/* Header */}
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold text-white flex items-center">
              <div className="w-8 h-8 bg-red-600 rounded-full flex items-center justify-center mr-3">
                🔥
              </div>
              {getHeaderTitle()}
            </h2>
            {isComplete && (
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

          {/* Progress Bar */}
          {!isComplete && (
            <div className="mb-6">
              <div className="bg-gray-800 rounded-full h-3 overflow-hidden">
                <div 
                  className="bg-gradient-to-r from-red-600 to-orange-600 h-full transition-all duration-500"
                  style={{ width: `${progressPercentage}%` }}
                />
              </div>
              <div className="flex justify-between mt-2 text-sm">
                <span className="text-gray-400">
                  {processedItems} of {totalItems} processed
                </span>
                {estimatedTimeRemaining && (
                  <span className="text-blue-400">
                    ~{Math.ceil(estimatedTimeRemaining)} seconds remaining
                  </span>
                )}
              </div>
              {currentBatch && totalBatches && (
                <div className="text-center mt-1 text-sm text-blue-400">
                  Processing batch {currentBatch} of {totalBatches}
                </div>
              )}
            </div>
          )}

          {/* Summary Stats */}
          <div className="grid grid-cols-3 gap-4 mb-6">
            <div className="bg-gray-800 rounded-lg p-3 text-center">
              <div className="text-2xl font-bold text-blue-400">{totalItems}</div>
              <div className="text-xs text-gray-400">Total Items</div>
            </div>
            <div className="bg-gray-800 rounded-lg p-3 text-center">
              <div className="text-2xl font-bold text-green-400">{successCount}</div>
              <div className="text-xs text-gray-400">Successful</div>
            </div>
            <div className="bg-gray-800 rounded-lg p-3 text-center">
              <div className="text-2xl font-bold text-red-400">{failedCount + rejectedCount}</div>
              <div className="text-xs text-gray-400">Failed/Rejected</div>
            </div>
          </div>

          {/* Current Operation Display */}
          {inProgress && currentItem && (
            <div className="mb-6">
              <div className="bg-gray-800 rounded-lg p-4">
                <div className="flex items-center gap-3">
                  {/* Item Preview */}
                  <div className="w-12 h-12 rounded-lg overflow-hidden flex-shrink-0">
                    {currentItem.type === 'token' && currentItem.metadata?.imageUrl ? (
                      <Image
                        src={currentItem.metadata.imageUrl}
                        alt={currentItem.metadata.displayName || 'Token'}
                        width={48}
                        height={48}
                        className="w-full h-full object-cover"
                      />
                    ) : currentItem.type === 'nft' ? (
                      <NFTImage
                        tokenId={(currentItem.data as NFT).token_id}
                        name={(currentItem.data as NFT).name}
                        imageUrl={currentItem.metadata?.imageUrl}
                      />
                    ) : (
                      <div className="w-full h-full bg-gray-700 flex items-center justify-center">
                        <span className="text-gray-400 text-xs">?</span>
                      </div>
                    )}
                  </div>
                  
                  {/* Item Details */}
                  <div className="flex-1 min-w-0">
                    <p className="text-white font-medium truncate">
                      {currentItem.metadata?.displayName || 'Unknown Item'}
                    </p>
                    <p className="text-sm text-gray-400">
                      {currentStepMessage || 'Processing...'}
                    </p>
                  </div>

                  {/* Spinner */}
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-400"></div>
                </div>
              </div>
            </div>
          )}

          {/* Transaction Results */}
          {isComplete && (successfulTokens.length > 0 || failedTokens.length > 0 || cancelledTokens.length > 0 || successfulNFTs.length > 0 || failedNFTs.length > 0 || cancelledNFTs.length > 0) && (
            <div className="space-y-4 max-h-96 overflow-y-auto pr-2" style={{ scrollbarWidth: 'thin' }}>
              
              {/* Successful Tokens */}
              {successfulTokens.length > 0 && (
                <div>
                  <h3 className="text-white font-medium mb-2 flex items-center">
                    <div className="w-5 h-5 bg-blue-600 rounded-full flex items-center justify-center mr-2 text-xs">T</div>
                    Successful Token Burns ({successfulTokens.length})
                  </h3>
                  <div className="bg-gray-800 rounded-lg p-3 space-y-2">
                    {successfulTokens.map((result) => (
                      <div key={result.item.id} className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="w-6 h-6 rounded overflow-hidden flex-shrink-0">
                            {result.item.metadata?.imageUrl ? (
                              <Image
                                src={result.item.metadata.imageUrl}
                                alt={result.item.metadata.displayName || 'Token'}
                                width={24}
                                height={24}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <div className="w-full h-full bg-gray-700 flex items-center justify-center">
                                <span className="text-gray-400 text-xs font-bold">
                                  {result.item.metadata?.displayName?.charAt(0) || 'T'}
                                </span>
                              </div>
                            )}
                          </div>
                          <span className="text-white">{result.item.metadata?.displayName || 'Unknown Token'}</span>
                        </div>
                        <a 
                          href={`https://basescan.org/tx/${result.txHash}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-green-400 hover:text-green-300 text-sm"
                        >
                          ✓ View TX
                        </a>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Failed Tokens */}
              {failedTokens.length > 0 && (
                <div>
                  <h3 className="text-white font-medium mb-2 flex items-center">
                    <div className="w-5 h-5 bg-blue-600 rounded-full flex items-center justify-center mr-2 text-xs">T</div>
                    Failed Token Burns ({failedTokens.length})
                  </h3>
                  <div className="bg-red-900/10 rounded-lg p-3 mb-3">
                    <div className="flex items-start justify-between gap-2">
                      <span className="text-red-400 text-sm">These transactions were reverted on-chain</span>
                      <button
                        onClick={() => setShowEducationModal(true)}
                        className="text-blue-400 hover:text-blue-300 underline whitespace-nowrap flex-shrink-0 text-sm"
                      >
                        Learn More
                      </button>
                    </div>
                  </div>
                  <div className="bg-gray-800 rounded-lg p-3 space-y-2">
                    {failedTokens.map((result) => (
                      <div key={result.item.id} className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="w-6 h-6 rounded overflow-hidden flex-shrink-0">
                            {result.item.metadata?.imageUrl ? (
                              <Image
                                src={result.item.metadata.imageUrl}
                                alt={result.item.metadata.displayName || 'Token'}
                                width={24}
                                height={24}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <div className="w-full h-full bg-gray-700 flex items-center justify-center">
                                <span className="text-gray-400 text-xs font-bold">
                                  {result.item.metadata?.displayName?.charAt(0) || 'T'}
                                </span>
                              </div>
                            )}
                          </div>
                          <span className="text-white">{result.item.metadata?.displayName || 'Unknown Token'}</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm">
                          <span className="text-red-400">❌</span>
                          {result.txHash && (
                            <a 
                              href={`https://basescan.org/tx/${result.txHash}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-red-400 hover:text-red-300"
                            >
                              View TX
                            </a>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Cancelled Tokens */}
              {cancelledTokens.length > 0 && (
                <div>
                  <h3 className="text-white font-medium mb-2 flex items-center">
                    <div className="w-5 h-5 bg-blue-600 rounded-full flex items-center justify-center mr-2 text-xs">T</div>
                    Cancelled Token Burns ({cancelledTokens.length})
                  </h3>
                  <div className="bg-gray-800 rounded-lg p-3 space-y-2">
                    {cancelledTokens.map((result) => (
                      <div key={result.item.id} className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="w-6 h-6 rounded overflow-hidden flex-shrink-0">
                            {result.item.metadata?.imageUrl ? (
                              <Image
                                src={result.item.metadata.imageUrl}
                                alt={result.item.metadata.displayName || 'Token'}
                                width={24}
                                height={24}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <div className="w-full h-full bg-gray-700 flex items-center justify-center">
                                <span className="text-gray-400 text-xs font-bold">
                                  {result.item.metadata?.displayName?.charAt(0) || 'T'}
                                </span>
                              </div>
                            )}
                          </div>
                          <span className="text-white">{result.item.metadata?.displayName || 'Unknown Token'}</span>
                        </div>
                        <span className="text-yellow-400 text-sm">Cancelled</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Successful NFTs */}
              {successfulNFTs.length > 0 && (
                <div>
                  <h3 className="text-white font-medium mb-2 flex items-center">
                    <div className="w-5 h-5 bg-purple-600 rounded-full flex items-center justify-center mr-2 text-xs">N</div>
                    Successful NFT Burns ({successfulNFTs.length})
                  </h3>
                  <div className="bg-gray-800 rounded-lg p-3 space-y-4">
                    {Object.entries(successfulNFTsByCollection).map(([collection, collectionResults]) => (
                      <div key={collection}>
                        <h4 className="text-sm font-medium text-blue-400 mb-2 border-b border-gray-700 pb-1">
                          {collection} ({collectionResults.length} NFT{collectionResults.length > 1 ? 's' : ''})
                        </h4>
                        <div className="space-y-2">
                          {collectionResults.map((result) => (
                            <div key={result.item.id} className="flex items-center justify-between">
                              <div className="flex items-center gap-3">
                                <div className="w-6 h-6 rounded overflow-hidden flex-shrink-0">
                                  <NFTImage
                                    tokenId={(result.item.data as NFT).token_id}
                                    name={(result.item.data as NFT).name}
                                    imageUrl={result.item.metadata?.imageUrl}
                                  />
                                </div>
                                <span className="text-white text-sm">{result.item.metadata?.displayName || 'Unknown NFT'}</span>
                              </div>
                              <a 
                                href={`https://basescan.org/tx/${result.txHash}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-green-400 hover:text-green-300 text-sm"
                              >
                                ✓ View TX
                              </a>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Failed NFTs */}
              {failedNFTs.length > 0 && (
                <div>
                  <h3 className="text-white font-medium mb-2 flex items-center">
                    <div className="w-5 h-5 bg-purple-600 rounded-full flex items-center justify-center mr-2 text-xs">N</div>
                    Failed NFT Burns ({failedNFTs.length})
                  </h3>
                  <div className="bg-red-900/10 rounded-lg p-3 mb-3">
                    <div className="flex items-start justify-between gap-2">
                      <span className="text-red-400 text-sm">These transactions were reverted on-chain</span>
                      <button
                        onClick={() => setShowEducationModal(true)}
                        className="text-blue-400 hover:text-blue-300 underline whitespace-nowrap flex-shrink-0 text-sm"
                      >
                        Learn More
                      </button>
                    </div>
                  </div>
                  <div className="bg-gray-800 rounded-lg p-3 space-y-4">
                    {Object.entries(failedNFTsByCollection).map(([collection, collectionResults]) => (
                      <div key={collection}>
                        <h4 className="text-sm font-medium text-blue-400 mb-2 border-b border-gray-700 pb-1">
                          {collection} ({collectionResults.length} NFT{collectionResults.length > 1 ? 's' : ''})
                        </h4>
                        <div className="space-y-2">
                          {collectionResults.map((result) => (
                            <div key={result.item.id} className="flex items-center justify-between">
                              <div className="flex items-center gap-3">
                                <div className="w-6 h-6 rounded overflow-hidden flex-shrink-0">
                                  <NFTImage
                                    tokenId={(result.item.data as NFT).token_id}
                                    name={(result.item.data as NFT).name}
                                    imageUrl={result.item.metadata?.imageUrl}
                                  />
                                </div>
                                <span className="text-white text-sm">{result.item.metadata?.displayName || 'Unknown NFT'}</span>
                              </div>
                              <div className="flex items-center gap-2 text-sm">
                                <span className="text-red-400">❌</span>
                                {result.txHash && (
                                  <a 
                                    href={`https://basescan.org/tx/${result.txHash}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-red-400 hover:text-red-300"
                                  >
                                    View TX
                                  </a>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Cancelled NFTs */}
              {cancelledNFTs.length > 0 && (
                <div>
                  <h3 className="text-white font-medium mb-2 flex items-center">
                    <div className="w-5 h-5 bg-purple-600 rounded-full flex items-center justify-center mr-2 text-xs">N</div>
                    Cancelled NFT Burns ({cancelledNFTs.length})
                  </h3>
                  <div className="bg-gray-800 rounded-lg p-3 space-y-4">
                    {Object.entries(cancelledNFTsByCollection).map(([collection, collectionResults]) => (
                      <div key={collection}>
                        <h4 className="text-sm font-medium text-blue-400 mb-2 border-b border-gray-700 pb-1">
                          {collection} ({collectionResults.length} NFT{collectionResults.length > 1 ? 's' : ''})
                        </h4>
                        <div className="space-y-2">
                          {collectionResults.map((result) => (
                            <div key={result.item.id} className="flex items-center justify-between">
                              <div className="flex items-center gap-3">
                                <div className="w-6 h-6 rounded overflow-hidden flex-shrink-0">
                                  <NFTImage
                                    tokenId={(result.item.data as NFT).token_id}
                                    name={(result.item.data as NFT).name}
                                    imageUrl={result.item.metadata?.imageUrl}
                                  />
                                </div>
                                <span className="text-white text-sm">{result.item.metadata?.displayName || 'Unknown NFT'}</span>
                              </div>
                              <span className="text-yellow-400 text-sm">Cancelled</span>
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

          {/* Action Buttons */}
          <div className="flex gap-3 justify-end mt-6">
            <button
              type="button"
              className={`px-6 py-3 rounded-lg transition-all font-medium ${
                isComplete
                  ? 'bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-500 hover:to-blue-600 text-white'
                  : 'bg-gray-700 hover:bg-gray-600 text-white cursor-not-allowed opacity-50'
              }`}
              onClick={onClose}
              disabled={!isComplete}
            >
              {isComplete ? 'Done' : 'Burning in Progress...'}
            </button>
          </div>
        </div>
      </div>
      
             {/* Educational Modal */}
       <BurnFailureEducationModal 
         isOpen={showEducationModal}
         onClose={() => setShowEducationModal(false)}
       />
    </div>
  );
} 