import React, { useState, useEffect } from 'react';
import { Token } from '@/types/token';
import { DirectBurnResult } from '@/lib/directBurner';

interface SeamlessBurnProgressProps {
  isOpen: boolean;
  tokens: Token[];
  currentToken: Token | null;
  burnResults: DirectBurnResult[];
  processedCount: number;
  totalCount: number;
  onClose: () => void;
  isComplete: boolean;
  hasErrors: boolean;
}

export default function SeamlessBurnProgress({
  isOpen,
  tokens,
  currentToken,
  burnResults,
  processedCount,
  totalCount,
  onClose,
  isComplete,
  hasErrors
}: SeamlessBurnProgressProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [showDetails, setShowDetails] = useState(false);
  
  useEffect(() => {
    if (processedCount > 0) {
      setCurrentStep(processedCount);
    }
  }, [processedCount]);

  if (!isOpen) return null;

  const progressPercentage = totalCount > 0 ? (processedCount / totalCount) * 100 : 0;
  const successCount = burnResults.filter(r => r.success).length;
  const failCount = burnResults.filter(r => !r.success).length;

  return (
    <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4">
      <div className="bg-gray-900 rounded-xl border border-gray-700 shadow-2xl max-w-lg w-full">
        
        {/* Header */}
        <div className="p-6 border-b border-gray-700">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <div className="w-10 h-10 bg-gradient-to-r from-red-600 to-orange-600 rounded-full flex items-center justify-center mr-3">
                {isComplete ? '✅' : '🔥'}
              </div>
              <div>
                <h3 className="text-lg font-bold text-white">
                  {isComplete ? 'Burn Complete!' : 'Burning Tokens...'}
                </h3>
                <p className="text-gray-400 text-sm">
                  {isComplete 
                    ? `Processed ${totalCount} token${totalCount > 1 ? 's' : ''}`
                    : `Processing ${totalCount} token${totalCount > 1 ? 's' : ''} - no approvals needed!`
                  }
                </p>
              </div>
            </div>
            
            {isComplete && (
              <button
                onClick={onClose}
                className="text-gray-400 hover:text-white transition-colors"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            )}
          </div>
        </div>

        {/* Progress Section */}
        <div className="p-6">
          
          {/* Overall Progress */}
          <div className="mb-6">
            <div className="flex justify-between items-center mb-2">
              <span className="text-white font-medium">Overall Progress</span>
              <span className="text-gray-400 text-sm">
                {processedCount} / {totalCount}
              </span>
            </div>
            
            <div className="relative">
              <div className="w-full bg-gray-700 rounded-full h-3">
                <div 
                  className="bg-gradient-to-r from-red-500 to-orange-500 h-3 rounded-full transition-all duration-500 ease-out relative overflow-hidden"
                  style={{ width: `${progressPercentage}%` }}
                >
                  {!isComplete && (
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent animate-pulse"></div>
                  )}
                </div>
              </div>
              
              <div className="flex justify-between mt-2 text-xs text-gray-400">
                <span>Started</span>
                <span className="font-medium text-white">{Math.round(progressPercentage)}%</span>
                <span>Complete</span>
              </div>
            </div>
          </div>

          {/* Current Action */}
          {!isComplete && currentToken && (
            <div className="mb-6 bg-gray-800 rounded-lg p-4">
              <div className="flex items-center">
                <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center mr-3">
                  <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full"></div>
                </div>
                <div>
                  <p className="text-white font-medium">
                    Burning {currentToken.contract_ticker_symbol || 'Token'}
                  </p>
                  <p className="text-gray-400 text-sm">
                    Direct transfer - no approval needed ✨
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Results Summary (when complete) */}
          {isComplete && (
            <div className="mb-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-green-900/30 border border-green-700 rounded-lg p-4 text-center">
                  <div className="text-2xl font-bold text-green-400">{successCount}</div>
                  <div className="text-green-300 text-sm">Successfully Burned</div>
                </div>
                
                {failCount > 0 && (
                  <div className="bg-red-900/30 border border-red-700 rounded-lg p-4 text-center">
                    <div className="text-2xl font-bold text-red-400">{failCount}</div>
                    <div className="text-red-300 text-sm">Failed</div>
                  </div>
                )}
                
                {failCount === 0 && (
                  <div className="bg-blue-900/30 border border-blue-700 rounded-lg p-4 text-center">
                    <div className="text-2xl font-bold text-blue-400">0</div>
                    <div className="text-blue-300 text-sm">Errors</div>
                  </div>
                )}
              </div>

              {/* Failed Transactions */}
              {failCount > 0 && (
                <div className="bg-red-900/20 border border-red-700 rounded-lg p-4">
                  <h5 className="text-red-300 font-medium mb-3 flex items-center">
                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    Failed Transactions
                  </h5>
                  <div className="max-h-40 overflow-y-auto space-y-2">
                    {burnResults
                      .filter(r => !r.success)
                      .map((result, index) => (
                        <div key={result.txHash || index} className="bg-red-900/30 rounded p-2">
                          <div className="flex items-center justify-between">
                            <span className="text-red-200 text-sm truncate">
                              {result.token.contract_ticker_symbol || `Token ${index + 1}`}
                            </span>
                            {result.txHash && (
                              <a
                                href={`https://basescan.org/tx/${result.txHash}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-red-400 hover:text-red-300 text-sm underline ml-2 flex-shrink-0"
                              >
                                View Failed Tx ↗
                              </a>
                            )}
                          </div>
                          {result.errorMessage && (
                            <p className="text-red-300 text-xs mt-1">{result.errorMessage}</p>
                          )}
                        </div>
                      ))}
                  </div>
                </div>
              )}

              {/* Transaction Links */}
              {successCount > 0 && (
                <div className="bg-gray-800 rounded-lg p-4">
                  <h5 className="text-white font-medium mb-3 flex items-center">
                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                    </svg>
                    Successful Transactions
                  </h5>
                  <div className="max-h-40 overflow-y-auto space-y-2">
                    {burnResults
                      .filter(r => r.success && r.txHash)
                      .map((result, index) => (
                        <div key={result.txHash} className="flex items-center justify-between bg-gray-700 rounded p-2">
                          <span className="text-gray-300 text-sm truncate">
                            {result.token.contract_ticker_symbol || `Token ${index + 1}`}
                          </span>
                          <a
                            href={`https://basescan.org/tx/${result.txHash}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-400 hover:text-blue-300 text-sm underline ml-2 flex-shrink-0"
                          >
                            View on BaseScan ↗
                          </a>
                        </div>
                      ))}
                  </div>
                  <p className="text-gray-400 text-xs mt-2">
                    All successful transactions are viewable on the Base blockchain explorer
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Step-by-step progress */}
          {totalCount <= 5 && (
            <div className="mb-6">
              <h4 className="text-white font-medium mb-3">Token Progress:</h4>
              <div className="space-y-2">
                {tokens.map((token, index) => {
                  const result = burnResults.find(r => r.token.contract_address === token.contract_address);
                  const isProcessed = index < processedCount;
                  const isCurrent = currentToken?.contract_address === token.contract_address;
                  
                  return (
                    <div 
                      key={token.contract_address}
                      className={`flex items-center p-3 rounded-lg border ${
                        result?.success 
                          ? 'bg-green-900/20 border-green-700' 
                          : result && !result.success
                          ? 'bg-red-900/20 border-red-700'
                          : isCurrent
                          ? 'bg-blue-900/20 border-blue-700'
                          : isProcessed
                          ? 'bg-gray-800 border-gray-600'
                          : 'bg-gray-900 border-gray-700'
                      }`}
                    >
                      <div className="w-6 h-6 mr-3 flex items-center justify-center">
                        {result?.success ? (
                          <div className="w-5 h-5 bg-green-600 rounded-full flex items-center justify-center">
                            <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                          </div>
                        ) : result && !result.success ? (
                          <div className="w-5 h-5 bg-red-600 rounded-full flex items-center justify-center">
                            <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                          </div>
                        ) : isCurrent ? (
                          <div className="w-5 h-5 border-2 border-blue-400 border-t-transparent rounded-full animate-spin"></div>
                        ) : isProcessed ? (
                          <div className="w-5 h-5 bg-gray-600 rounded-full"></div>
                        ) : (
                          <div className="w-5 h-5 bg-gray-700 rounded-full"></div>
                        )}
                      </div>
                      
                      <div className="flex-1">
                        <div className="text-white font-medium">
                          {token.contract_ticker_symbol || 'Unknown Token'}
                        </div>
                        <div className="text-gray-400 text-sm">
                          {isCurrent ? 'Burning now...' : result?.success ? 'Burned successfully' : result && !result.success ? 'Failed to burn' : 'Waiting...'}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Show Details Toggle (for large batches) */}
          {totalCount > 5 && (
            <div className="mb-6">
              <button
                onClick={() => setShowDetails(!showDetails)}
                className="text-blue-400 hover:text-blue-300 text-sm font-medium"
              >
                {showDetails ? 'Hide' : 'Show'} detailed progress ({totalCount} tokens)
              </button>
              
              {showDetails && (
                <div className="mt-3 max-h-40 overflow-y-auto bg-gray-800 rounded-lg p-3">
                  {/* Detailed list for large batches */}
                  <div className="space-y-1 text-sm">
                    {tokens.map((token, index) => {
                      const result = burnResults.find(r => r.token.contract_address === token.contract_address);
                      const isCurrent = currentToken?.contract_address === token.contract_address;
                      
                      return (
                        <div key={token.contract_address} className="flex justify-between items-center">
                          <span className="text-gray-300">
                            {index + 1}. {token.contract_ticker_symbol || 'Unknown'}
                          </span>
                          <span className={`text-xs ${
                            result?.success ? 'text-green-400' : 
                            result && !result.success ? 'text-red-400' :
                            isCurrent ? 'text-blue-400' : 'text-gray-500'
                          }`}>
                            {isCurrent ? 'Burning...' : 
                             result?.success ? 'Done' : 
                             result && !result.success ? 'Failed' : 'Waiting'}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Action Button */}
          {isComplete && (
            <button
              onClick={onClose}
              className="w-full bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-500 hover:to-blue-500 text-white font-medium py-3 px-4 rounded-lg transition-all transform hover:scale-105"
            >
              {hasErrors ? 'Close (Some Failed)' : '🎉 Perfect! Close'}
            </button>
          )}

          {/* Status message for non-complete */}
          {!isComplete && (
            <div className="text-center">
              <p className="text-gray-400 text-sm">
                💡 Each token burns with a simple transfer - much safer than approvals!
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
} 