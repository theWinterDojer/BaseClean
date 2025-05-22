import React from 'react';
import { Token } from '@/types/token';

interface BurnTransactionStatusProps {
  inProgress: boolean;
  success: boolean;
  error: string | null;
  tokensBurned: number;
  tokensFailed: number;
  onClose: () => void;
  currentToken: Token | null;
  processedTokens: number;
  totalTokens: number;
  isWaitingForConfirmation: boolean;
}

export default function BurnTransactionStatus({
  inProgress,
  success,
  error,
  tokensBurned,
  tokensFailed,
  onClose,
  currentToken,
  processedTokens,
  totalTokens,
  isWaitingForConfirmation
}: BurnTransactionStatusProps) {
  if (!inProgress && !success && !error && !isWaitingForConfirmation) {
    return null;
  }

  return (
    <div className={`rounded-lg p-4 mb-6 shadow-lg ${getBgColor(inProgress, success, error, isWaitingForConfirmation)}`}>
      <div className="flex items-start justify-between">
        <div className="flex items-center">
          {getStatusIcon(inProgress, success, error, isWaitingForConfirmation)}
          <div className="ml-3">
            <h3 className="text-lg font-medium text-white">
              {getStatusTitle(inProgress, success, error, isWaitingForConfirmation)}
            </h3>
            <div className="mt-1 text-sm text-gray-200">
              {inProgress ? (
                <div>
                  <p>Processing burn transaction{totalTokens > 1 ? 's' : ''}...</p>
                  {totalTokens > 1 && (
                    <p className="text-xs text-gray-300 mt-1">
                      Processing token {processedTokens + 1} of {totalTokens}
                      {currentToken && (
                        <span className="ml-1">
                          ({currentToken.contract_ticker_symbol || 'Unknown'})
                        </span>
                      )}
                    </p>
                  )}
                </div>
              ) : isWaitingForConfirmation ? (
                <div>
                  <p>Waiting for transaction confirmation...</p>
                  <p className="text-xs text-gray-300 mt-1">
                    Completed {processedTokens} of {totalTokens} token burns
                  </p>
                </div>
              ) : (
                <>
                  {tokensBurned > 0 && (
                    <div>
                      <p className="text-green-300 font-medium">Successfully burned {tokensBurned} tokens</p>
                      <p className="text-gray-300 text-xs mt-1">
                        The tokens have been permanently removed from your wallet.
                      </p>
                    </div>
                  )}
                  {tokensFailed > 0 && (
                    <p className="text-red-300">Failed to burn {tokensFailed} tokens</p>
                  )}
                  {error && <p className="text-red-300 mt-1">{error}</p>}

                  {success && tokensBurned > 0 && (
                    <div className="mt-3 pt-3 border-t border-green-700/30">
                      <p className="text-blue-300">
                        Transaction completed successfully on Base network
                      </p>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
        {!inProgress && !isWaitingForConfirmation && (
          <button
            type="button"
            className="bg-gray-700/60 rounded-md p-1.5 inline-flex items-center justify-center text-gray-300 hover:text-white hover:bg-gray-700"
            onClick={onClose}
          >
            <span className="sr-only">Dismiss</span>
            <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
              <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
            </svg>
          </button>
        )}
      </div>
    </div>
  );
}

// Helper functions to get the appropriate colors and icons based on status
function getBgColor(inProgress: boolean, success: boolean, error: string | null, isWaitingForConfirmation: boolean): string {
  if (inProgress) return 'bg-blue-900/40 border border-blue-700';
  if (isWaitingForConfirmation) return 'bg-purple-900/40 border border-purple-700';
  if (error) return 'bg-red-900/40 border border-red-700';
  if (success) return 'bg-green-900/40 border border-green-700';
  return 'bg-gray-900/40 border border-gray-700';
}

function getStatusIcon(inProgress: boolean, success: boolean, error: string | null, isWaitingForConfirmation: boolean) {
  if (inProgress || isWaitingForConfirmation) {
    return (
      <div className="animate-spin h-6 w-6 border-2 border-blue-400 border-t-transparent rounded-full" />
    );
  }
  
  if (error) {
    return (
      <div className="flex-shrink-0 h-6 w-6 text-red-400">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      </div>
    );
  }
  
  if (success) {
    return (
      <div className="flex-shrink-0 h-6 w-6 text-green-400">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
        </svg>
      </div>
    );
  }
  
  return null;
}

function getStatusTitle(inProgress: boolean, success: boolean, error: string | null, isWaitingForConfirmation: boolean): string {
  if (inProgress) return 'Burning Tokens...';
  if (isWaitingForConfirmation) return 'Confirming Transaction...';
  if (error) return 'Error Burning Tokens';
  if (success) return 'Tokens Burned Successfully';
  return '';
} 