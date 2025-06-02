import React from 'react';
import { BurnFlowStatus } from '@/hooks/useBurnFlow';

interface BurnTransactionStatusProps {
  burnStatus: BurnFlowStatus;
  onClose: () => void;
  isWaitingForConfirmation: boolean;
}

export default function BurnTransactionStatus({
  burnStatus,
  onClose,
  isWaitingForConfirmation
}: BurnTransactionStatusProps) {
  const { 
    inProgress, 
    success, 
    error, 
    tokensBurned,
    tokensFailed,
    tokensRejectedByUser,
    currentStep,
    processedTokens,
    totalTokens,
    burnResults
  } = burnStatus;

  if (!inProgress && !success && !error && !isWaitingForConfirmation) {
    return null;
  }

  // Categorize results
  const successfulBurns = burnResults?.filter(r => r.success && r.txHash) || [];
  const userRejections = burnResults?.filter(r => r.isUserRejection) || [];
  const actualFailures = burnResults?.filter(r => !r.success && !r.isUserRejection) || [];

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-gray-900 border border-gray-700 rounded-xl p-6 max-w-lg w-full mx-4 max-h-[90vh] overflow-y-auto shadow-2xl">
        {/* Header */}
        <div className="flex justify-between items-center mb-4">
          {!inProgress && (
            <h3 className="text-lg font-semibold text-white">
              {isWaitingForConfirmation && 'Confirm Transaction'}
              {success && 'Burn Complete!'}
              {error && 'Burn Failed'}
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
              Burning {totalTokens} token{totalTokens > 1 ? 's' : ''} with direct transfers
            </p>
            <p className="text-xs text-blue-300 mt-2">
              💡 You can cancel in your wallet if you change your mind
            </p>
          </div>
        )}

        {/* Burn in progress */}
        {inProgress && (
          <div className="space-y-4">
            <div className="flex items-center space-x-3">
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-400"></div>
              <span className="text-sm font-medium text-white">
                Burning {totalTokens} token{totalTokens > 1 ? 's' : ''}
              </span>
            </div>

            {/* Progress bar */}
            {currentStep === 'burning' && (
              <div className="space-y-3">
                <div className="flex justify-between text-sm text-gray-300">
                  <span>Progress</span>
                  <span>{processedTokens}/{totalTokens}</span>
                </div>
                <div className="w-full bg-gray-700 rounded-full h-2">
                  <div 
                    className="bg-gradient-to-r from-blue-500 to-blue-400 h-2 rounded-full transition-all duration-300"
                    style={{ width: totalTokens > 0 ? `${(processedTokens / totalTokens) * 100}%` : '0%' }}
                  ></div>
                </div>
                <p className="text-xs text-gray-400 text-center">
                  Each token will prompt a burn transfer. No contract approvals necessary.
                </p>
                <p className="text-xs text-blue-300 text-center">
                  You can cancel any transaction in your wallet
                </p>
              </div>
            )}
          </div>
        )}

        {/* Success state */}
        {success && (
          <div className="text-center py-4">
            <div className="mb-4">
              <div className="mx-auto w-12 h-12 rounded-full bg-green-900/30 border border-green-700 flex items-center justify-center">
                <svg className="w-6 h-6 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
            </div>
            <h4 className="text-lg font-semibold text-green-400 mb-2">
              🎉 Burn Process Complete!
            </h4>
            
            {/* Text summary */}
            <p className="text-sm text-gray-300 mb-4">
              {(() => {
                const parts = [];
                if (tokensBurned > 0) {
                  parts.push(`Successfully burned ${tokensBurned} token${tokensBurned !== 1 ? 's' : ''}`);
                }
                if (tokensRejectedByUser > 0) {
                  parts.push(`${tokensRejectedByUser} cancelled by user`);
                }
                if (tokensFailed > 0) {
                  parts.push(`${tokensFailed} failed`);
                }
                
                if (parts.length === 0) {
                  return 'No tokens were processed';
                } else if (parts.length === 1) {
                  return parts[0];
                } else if (parts.length === 2) {
                  return parts.join(' • ');
                } else {
                  return `${parts[0]} • ${parts[1]} • ${parts[2]}`;
                }
              })()}
            </p>
            
            {/* User rejections section */}
            {userRejections.length > 0 && (
              <div className="mb-4 text-left">
                <h5 className="text-sm font-medium text-yellow-300 mb-2 flex items-center">
                  <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                  Cancelled by You:
                </h5>
                <div className="max-h-24 overflow-y-auto bg-yellow-900/20 border border-yellow-700 rounded-lg p-3 space-y-1">
                  {userRejections.map((result, index) => (
                    <div key={index} className="text-xs text-yellow-300">
                      {result.token.contract_ticker_symbol || `Token ${index + 1}`}
                    </div>
                  ))}
                </div>
                <p className="text-xs text-yellow-400 mt-1">
                  These tokens weren&apos;t burned because you cancelled the transactions. You can try again anytime.
                </p>
              </div>
            )}

            {/* Actual failures section */}
            {actualFailures.length > 0 && (
              <div className="mb-4 text-left">
                <h5 className="text-sm font-medium text-red-300 mb-2">Failed Transactions:</h5>
                <div className="max-h-32 overflow-y-auto bg-red-900/20 border border-red-700 rounded-lg p-3 space-y-2">
                  {actualFailures.map((result, index) => (
                    <div key={result.txHash || index} className="text-xs">
                      <div className="flex items-center justify-between">
                        <span className="text-red-300 truncate">
                          {result.token.contract_ticker_symbol || `Token ${index + 1}`}
                        </span>
                        {result.txHash && (
                          <a
                            href={`https://basescan.org/tx/${result.txHash}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-red-400 hover:text-red-300 underline ml-2 flex-shrink-0 transition-colors"
                          >
                            View Tx
                          </a>
                        )}
                      </div>
                      {result.errorMessage && (
                        <p className="text-red-400 text-xs mt-1">{result.errorMessage}</p>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
            
            {/* Transaction links */}
            {successfulBurns.length > 0 && (
              <div className="mb-4 text-left">
                <h5 className="text-sm font-medium text-gray-200 mb-2">Successful Transactions:</h5>
                <div className="max-h-32 overflow-y-auto bg-gray-800 rounded-lg p-3 space-y-2">
                  {successfulBurns.map((result, index) => (
                    <div key={result.txHash} className="flex items-center justify-between text-xs">
                      <span className="text-gray-300 truncate">
                        {result.token.contract_ticker_symbol || `Token ${index + 1}`}
                      </span>
                      <a
                        href={`https://basescan.org/tx/${result.txHash}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-400 hover:text-blue-300 underline ml-2 flex-shrink-0 transition-colors"
                      >
                        View Tx
                      </a>
                    </div>
                  ))}
                </div>
                <p className="text-xs text-gray-400 mt-2">
                  Click &quot;View Tx&quot; to see the burn transaction on BaseScan
                </p>
              </div>
            )}
            
            <button
              onClick={onClose}
              className="w-full bg-green-600 hover:bg-green-700 text-white py-2 px-4 rounded-lg transition-colors"
            >
              Close
            </button>
          </div>
        )}

        {/* Error state */}
        {error && (
          <div className="text-center py-4">
            <div className="mb-4">
              <div className="mx-auto w-12 h-12 rounded-full bg-red-900/30 border border-red-700 flex items-center justify-center">
                <svg className="w-6 h-6 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </div>
            </div>
            <h4 className="text-lg font-semibold text-red-400 mb-2">Burn Failed</h4>
            <p className="text-sm text-gray-300 mb-4">{error}</p>
            <button
              onClick={onClose}
              className="w-full bg-red-600 hover:bg-red-700 text-white py-2 px-4 rounded-lg transition-colors"
            >
              Close
            </button>
          </div>
        )}
      </div>
    </div>
  );
} 