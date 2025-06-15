import React from 'react';
import { UnifiedBurnProgress as BurnProgressType } from '@/shared/hooks/useUnifiedBurn';

interface UnifiedBurnProgressProps {
  burnProgress: BurnProgressType;
  onClose: () => void;
}

export default function UnifiedBurnProgress({
  burnProgress,
  onClose
}: UnifiedBurnProgressProps) {
  const { totalItems, completedItems, failedItems, transactions, isComplete } = burnProgress;
  
  // Calculate progress percentage
  const progressPercentage = totalItems > 0 
    ? Math.round(((completedItems + failedItems) / totalItems) * 100)
    : 0;

  // Separate transactions by type
  const tokenTransactions = transactions.filter(tx => tx.item.type === 'token');
  const nftTransactions = transactions.filter(tx => tx.item.type === 'nft');

  return (
    <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4">
      <div className="bg-gray-900 rounded-lg border border-gray-700 shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          {/* Header */}
          <h2 className="text-xl font-bold text-white mb-4 flex items-center">
            <div className="w-8 h-8 bg-red-600 rounded-full flex items-center justify-center mr-3">
              🔥
            </div>
            {isComplete ? 'Burn Complete' : `Burning Assets - ${progressPercentage}%`}
          </h2>

          {/* Progress Bar */}
          <div className="mb-6">
            <div className="bg-gray-800 rounded-full h-3 overflow-hidden">
              <div 
                className="bg-gradient-to-r from-red-600 to-orange-600 h-full transition-all duration-500"
                style={{ width: `${progressPercentage}%` }}
              />
            </div>
            <div className="flex justify-between mt-2 text-sm">
              <span className="text-gray-400">
                {completedItems + failedItems} of {totalItems} processed
              </span>
              {failedItems > 0 && (
                <span className="text-red-400">
                  {failedItems} failed
                </span>
              )}
            </div>
          </div>

          {/* Summary Stats */}
          <div className="grid grid-cols-3 gap-4 mb-6">
            <div className="bg-gray-800 rounded-lg p-3 text-center">
              <div className="text-2xl font-bold text-blue-400">{totalItems}</div>
              <div className="text-xs text-gray-400">Total Items</div>
            </div>
            <div className="bg-gray-800 rounded-lg p-3 text-center">
              <div className="text-2xl font-bold text-green-400">{completedItems}</div>
              <div className="text-xs text-gray-400">Successful</div>
            </div>
            <div className="bg-gray-800 rounded-lg p-3 text-center">
              <div className="text-2xl font-bold text-red-400">{failedItems}</div>
              <div className="text-xs text-gray-400">Failed</div>
            </div>
          </div>

          {/* Transaction Details */}
          <div className="space-y-4 max-h-96 overflow-y-auto">
            {/* Tokens Section */}
            {tokenTransactions.length > 0 && (
              <div>
                <h3 className="text-white font-medium mb-2 flex items-center">
                  <div className="w-5 h-5 bg-blue-600 rounded-full flex items-center justify-center mr-2 text-xs">
                    T
                  </div>
                  Tokens ({tokenTransactions.length})
                </h3>
                <div className="bg-gray-800 rounded-lg p-3 space-y-2">
                  {tokenTransactions.map((tx) => (
                    <div key={tx.id} className="space-y-1">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className={`w-2 h-2 rounded-full ${
                            tx.status === 'success' ? 'bg-green-500' : 
                            tx.status === 'error' ? 'bg-red-500' : 
                            'bg-yellow-500 animate-pulse'
                          }`} />
                          <span className="text-white">
                            {tx.item.type === 'token' && tx.item.data.contract_ticker_symbol || 'Unknown'}
                          </span>
                        </div>
                        <div className="text-sm">
                          {tx.status === 'pending' && (
                            <span className="text-yellow-400">Burning...</span>
                          )}
                          {tx.status === 'success' && (
                            <a 
                              href={`https://basescan.org/tx/${tx.hash}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-green-400 hover:text-green-300"
                            >
                              ✓ View TX
                            </a>
                          )}
                          {tx.status === 'error' && (
                            <div className="flex items-center gap-2">
                              <span className="text-red-400">Failed</span>
                              {tx.hash && (
                                <a 
                                  href={`https://basescan.org/tx/${tx.hash}`}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-red-400 hover:text-red-300 text-xs"
                                >
                                  View TX
                                </a>
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                      {/* Error Details */}
                      {tx.status === 'error' && tx.errorMessage && (
                        <div className="ml-5 text-xs text-red-300 bg-red-900/20 rounded p-2">
                          {tx.errorMessage.includes('execution reverted')
                            ? 'Execution reverted on chain'
                            : tx.errorMessage.includes('insufficient funds')
                            ? 'Insufficient gas funds'
                            : tx.errorMessage.includes('User rejected') || tx.errorMessage.includes('cancelled') || tx.errorMessage.includes('canceled')
                            ? 'Transaction was canceled by user'
                            : tx.errorMessage.length > 50
                            ? `${tx.errorMessage.substring(0, 50)}...`
                            : tx.errorMessage
                          }
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* NFTs Section */}
            {nftTransactions.length > 0 && (
              <div>
                <h3 className="text-white font-medium mb-2 flex items-center">
                  <div className="w-5 h-5 bg-purple-600 rounded-full flex items-center justify-center mr-2 text-xs">
                    N
                  </div>
                  NFTs ({nftTransactions.length})
                </h3>
                <div className="bg-gray-800 rounded-lg p-3 space-y-2">
                  {nftTransactions.map((tx) => (
                    <div key={tx.id} className="space-y-1">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className={`w-2 h-2 rounded-full ${
                            tx.status === 'success' ? 'bg-green-500' : 
                            tx.status === 'error' ? 'bg-red-500' : 
                            'bg-yellow-500 animate-pulse'
                          }`} />
                          <span className="text-white">
                            {tx.item.type === 'nft' && (tx.item.data.name || `#${tx.item.data.token_id}`)}
                          </span>
                        </div>
                        <div className="text-sm">
                          {tx.status === 'pending' && (
                            <span className="text-yellow-400">Burning...</span>
                          )}
                          {tx.status === 'success' && (
                            <a 
                              href={`https://basescan.org/tx/${tx.hash}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-green-400 hover:text-green-300"
                            >
                              ✓ View TX
                            </a>
                          )}
                          {tx.status === 'error' && (
                            <div className="flex items-center gap-2">
                              <span className="text-red-400">Failed</span>
                              {tx.hash && (
                                <a 
                                  href={`https://basescan.org/tx/${tx.hash}`}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-red-400 hover:text-red-300 text-xs"
                                >
                                  View TX
                                </a>
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                      {/* Error Details */}
                      {tx.status === 'error' && tx.errorMessage && (
                        <div className="ml-5 text-xs text-red-300 bg-red-900/20 rounded p-2">
                          {tx.errorMessage.includes('execution reverted')
                            ? 'Execution reverted on chain'
                            : tx.errorMessage.includes('insufficient funds')
                            ? 'Insufficient gas funds'
                            : tx.errorMessage.includes('User rejected') || tx.errorMessage.includes('cancelled') || tx.errorMessage.includes('canceled')
                            ? 'Transaction was canceled by user'
                            : tx.errorMessage.length > 50
                            ? `${tx.errorMessage.substring(0, 50)}...`
                            : tx.errorMessage
                          }
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 justify-end mt-6">
            <button
              type="button"
              className={`px-6 py-3 rounded-lg transition-all font-medium ${
                isComplete
                  ? 'bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-500 hover:to-blue-600 text-white'
                  : 'bg-gray-700 hover:bg-gray-600 text-white cursor-not-allowed'
              }`}
              onClick={onClose}
              disabled={!isComplete}
            >
              {isComplete ? 'Done' : 'Close'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
} 