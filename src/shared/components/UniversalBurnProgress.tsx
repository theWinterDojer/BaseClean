import React from 'react';
import Image from 'next/image';
import { UniversalBurnFlowStatus, BurnResult } from '@/types/universalBurn';
import NFTImage from '@/shared/components/NFTImage';
import { NFT } from '@/types/nft';
import BurnFailureEducationModal from '@/components/BurnFailureEducationModal';
import confetti from 'canvas-confetti';

interface UniversalBurnProgressProps {
  burnStatus: UniversalBurnFlowStatus;
  onClose: () => void;
  cancelBurn?: () => void;
  isCancelling?: boolean;
}

export default function UniversalBurnProgress({
  burnStatus,
  onClose,
  cancelBurn,
  isCancelling
}: UniversalBurnProgressProps) {
  const [showEducationModal, setShowEducationModal] = React.useState(false);
  const [hasTriggeredConfetti, setHasTriggeredConfetti] = React.useState(false);
  const [showCancelConfirmation, setShowCancelConfirmation] = React.useState(false);
  const [hasScrollbar, setHasScrollbar] = React.useState(false);
  const scrollContainerRef = React.useRef<HTMLDivElement>(null);
  
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
    currentBatch,
    totalBatches
  } = burnStatus;

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
  const cancelledCount = results.cancelled.length;

  // Trigger confetti for successful burns
  React.useEffect(() => {
    if (isComplete && successCount > 0 && !hasTriggeredConfetti && isProgressOpen) {
      // Trigger confetti celebration
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#0052FF', '#00D4AA', '#FFFFFF', '#22C55E'] // BaseClean blue, green, white, success green
      });
      
      // Mark that we've triggered confetti for this session
      setHasTriggeredConfetti(true);
    }
  }, [isComplete, successCount, hasTriggeredConfetti, isProgressOpen]);

  // Reset confetti trigger when modal closes
  React.useEffect(() => {
    if (!isProgressOpen) {
      setHasTriggeredConfetti(false);
    }
  }, [isProgressOpen]);

  // Check if scrollbar is needed
  React.useEffect(() => {
    const checkScrollbar = () => {
      if (scrollContainerRef.current) {
        const element = scrollContainerRef.current;
        const hasScroll = element.scrollHeight > element.clientHeight;
        setHasScrollbar(hasScroll);
      }
    };

    // Check on mount and when content changes
    checkScrollbar();
    
    // Use ResizeObserver for more accurate detection
    const resizeObserver = new ResizeObserver(checkScrollbar);
    if (scrollContainerRef.current) {
      resizeObserver.observe(scrollContainerRef.current);
    }

    return () => {
      resizeObserver.disconnect();
    };
  }, [isComplete, results]);

  // Don't render if modal should not be open
  if (!isProgressOpen) return null;

  // Separate results by type and status
  const successfulTokens = results.successful.filter(r => r.item.type === 'token');
  const failedTokens = results.failed.filter(r => r.item.type === 'token');
  const userRejectedTokens = results.userRejected.filter(r => r.item.type === 'token');
  const cancelledTokens = results.cancelled.filter(r => r.item.type === 'token');
  const allCancelledTokens = [...userRejectedTokens, ...cancelledTokens]; // Combined for display
  
  const successfulNFTs = results.successful.filter(r => r.item.type === 'nft');
  const failedNFTs = results.failed.filter(r => r.item.type === 'nft');
  const userRejectedNFTs = results.userRejected.filter(r => r.item.type === 'nft');
  const cancelledNFTs = results.cancelled.filter(r => r.item.type === 'nft');
  const allCancelledNFTs = [...userRejectedNFTs, ...cancelledNFTs]; // Combined for display

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
  const cancelledNFTsByCollection = groupNFTsByCollection(allCancelledNFTs);

  // Get dynamic header title
  const getHeaderTitle = () => {
    if (isComplete) {
      if (successCount > 0 && failedCount === 0 && rejectedCount === 0 && cancelledCount === 0) {
        return 'Burn Complete!';
      } else if (successCount > 0) {
        return 'Burn Process Complete';
      } else if (rejectedCount + cancelledCount === totalItems) {
        return 'Burn Process Cancelled';
      } else {
        return 'Burn Process Complete';
      }
    }
    return `Burning Assets - ${progressPercentage}%`;
  };

  // Generate dynamic tweet text based on burn results
  const generateTweetText = () => {
    const tokenCount = successfulTokens.length;
    const nftCount = successfulNFTs.length;

    // Fun messages based on what was burned
    let message = '';
    let emojis = '';

    if (tokenCount > 0 && nftCount > 0) {
      // Mixed burn
      message = `Just cleaned my wallet with @Base_Clean! 🧹 Burned ${tokenCount} spam tokens and ${nftCount} junk NFTs in one go!`;
      emojis = '🔥';
    } else if (tokenCount > 0) {
      // Token only burn
      if (tokenCount >= 10) {
        message = `Boom! Just torched ${tokenCount} spam tokens with @Base_Clean! 🔥 My wallet is sparkling clean!`;
        emojis = '🧹⚡️';
      } else if (tokenCount >= 5) {
        message = `Cleaned house! 🏠 Just burned ${tokenCount} junk tokens with @Base_Clean. Feeling fresh!`;
        emojis = '🔥💚✨';
      } else {
        message = `Just removed ${tokenCount} spam token${tokenCount > 1 ? 's' : ''} with @Base_Clean! Every bit counts! 🧹`;
        emojis = '✨';
      }
    } else if (nftCount > 0) {
      // NFT only burn
      if (nftCount >= 5) {
        message = `NFT cleanup complete! 🗑️ Just burned ${nftCount} junk NFTs with @Base_Clean. Wallet feels amazing!`;
        emojis = '🔥🎨';
      } else {
        message = `Cleaned up ${nftCount} unwanted NFT${nftCount > 1 ? 's' : ''} with @Base_Clean! 🎨 Clean wallet vibes!`;
        emojis = '✨🧹💫';
      }
    }

    // Add closing and hashtags
    const fullMessage = `${message} ${emojis}

Clean your wallet. Strengthen your Base 💪

#BaseClean`;

    return encodeURIComponent(fullMessage);
  };

  // Handle share to Twitter
  const handleShare = () => {
    const tweetText = generateTweetText();
    const twitterUrl = `https://twitter.com/intent/tweet?text=${tweetText}`;
    window.open(twitterUrl, '_blank', 'noopener,noreferrer');
  };

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-gray-900 rounded-lg border border-gray-700 shadow-xl max-w-[45rem] w-full max-h-[90vh] overflow-hidden">
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
              <div className="text-2xl font-bold text-red-400">{failedCount + rejectedCount + cancelledCount}</div>
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
          {isComplete && (successfulTokens.length > 0 || failedTokens.length > 0 || allCancelledTokens.length > 0 || successfulNFTs.length > 0 || failedNFTs.length > 0 || allCancelledNFTs.length > 0) && (
            <div 
              ref={scrollContainerRef}
              className={`space-y-4 max-h-96 overflow-y-auto custom-scrollbar ${hasScrollbar ? 'pr-4' : ''}`}
            >
              
              {/* Successful Tokens */}
              {successfulTokens.length > 0 && (
                <div>
                  <h3 className="text-white font-medium mb-2 flex items-center">
                    <span className="text-green-400 mr-2">✓</span>
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
                          className="text-blue-400 hover:text-blue-300 text-sm"
                        >
                          View TX
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
                    <span className="text-red-400 mr-2">❌</span>
                    Failed Token Burns ({failedTokens.length})
                  </h3>
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
                          {result.txHash && (
                            <a 
                              href={`https://basescan.org/tx/${result.txHash}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-blue-400 hover:text-blue-300"
                            >
                              View TX
                            </a>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="mt-1 p-1">
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
                </div>
              )}

              {/* Cancelled Tokens */}
              {allCancelledTokens.length > 0 && (
                <div>
                  <h3 className="text-white font-medium mb-2 flex items-center">
                    <span className="text-yellow-400 mr-2">❌</span>
                    Cancelled Token Burns ({allCancelledTokens.length})
                  </h3>
                  <div className="bg-gray-800 rounded-lg p-3 space-y-2">
                    {allCancelledTokens.map((result) => (
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
                    <span className="text-green-400 mr-2">✓</span>
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
                                className="text-blue-400 hover:text-blue-300 text-sm"
                              >
                                View TX
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
                    <span className="text-red-400 mr-2">❌</span>
                    Failed NFT Burns ({failedNFTs.length})
                  </h3>
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
                                {result.txHash && (
                                  <a 
                                    href={`https://basescan.org/tx/${result.txHash}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-blue-400 hover:text-blue-300"
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
                  <div className="mt-1 p-1">
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
                </div>
              )}

              {/* Cancelled NFTs */}
              {allCancelledNFTs.length > 0 && (
                <div>
                  <h3 className="text-white font-medium mb-2 flex items-center">
                    <span className="text-yellow-400 mr-2">❌</span>
                    Cancelled NFT Burns ({allCancelledNFTs.length})
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
          <div className="mt-6">
            {/* When burning is in progress - Cancel on left, Burning button on right */}
            {inProgress && !isComplete && (
              <div className="flex gap-3 justify-between">
                {/* Cancel Button - Left side, only show when cancel function is available */}
                {cancelBurn && (
                  <button
                    type="button"
                    onClick={() => setShowCancelConfirmation(true)}
                    disabled={isCancelling}
                    className={`px-6 py-3 rounded-lg transition-all font-medium ${
                      isCancelling 
                        ? 'bg-gray-700 text-gray-400 cursor-not-allowed'
                        : 'bg-red-600 hover:bg-red-700 text-white'
                    }`}
                  >
                    {isCancelling ? 'Cancelling...' : 'Cancel'}
                  </button>
                )}
                
                {/* Burning in Progress button on right */}
                <button
                  type="button"
                  className="px-6 py-3 rounded-lg transition-all font-medium bg-gray-700 hover:bg-gray-600 text-white cursor-not-allowed opacity-50"
                  disabled
                >
                  Burning in Progress...
                </button>
              </div>
            )}
            
            {/* When burn is complete - Share and Done buttons on right */}
            {isComplete && (
              <div className="flex gap-3 justify-end">
                {/* Share Button - Only show when there are successful burns */}
                {successCount > 0 && (
                  <button
                    type="button"
                    onClick={handleShare}
                    className="px-6 py-3 rounded-lg transition-all font-medium bg-gradient-to-r from-green-600 to-green-700 hover:from-green-500 hover:to-green-600 text-white flex items-center gap-2"
                  >
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z"/>
                    </svg>
                    Share
                  </button>
                )}
                
                <button
                  type="button"
                  className="px-6 py-3 rounded-lg transition-all font-medium bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-500 hover:to-blue-600 text-white"
                  onClick={onClose}
                >
                  Done
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
      
      {/* Cancel Confirmation Modal */}
      {showCancelConfirmation && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[60] flex items-center justify-center p-4">
          <div className="bg-gray-900 rounded-lg border border-gray-700 shadow-xl max-w-md w-full">
            <div className="p-6">
              <div className="text-center">
                <div className="w-12 h-12 bg-yellow-600/20 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl">⚠️</span>
                </div>
                <h3 className="text-xl font-bold text-white mb-3">Cancel Burn Process?</h3>
                <div className="mb-6">
                  <p className="text-gray-300 text-center">
                    This will cancel {totalItems - processedItems} remaining items in queue. Be sure to close current action in your wallet after this dialog.
                  </p>
                </div>
                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={() => setShowCancelConfirmation(false)}
                    className="flex-1 px-4 py-2 rounded-lg bg-gray-700 hover:bg-gray-600 text-white transition-colors"
                  >
                    Keep Burning
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setShowCancelConfirmation(false);
                      cancelBurn?.();
                    }}
                    className="flex-1 px-4 py-2 rounded-lg bg-red-600 hover:bg-red-700 text-white transition-colors"
                  >
                    Yes, Cancel Remaining
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
      
      {/* Educational Modal */}
       <BurnFailureEducationModal 
         isOpen={showEducationModal}
         onClose={() => setShowEducationModal(false)}
       />
    </div>
  );
} 