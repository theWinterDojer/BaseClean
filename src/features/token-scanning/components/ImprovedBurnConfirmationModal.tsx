import React, { useState } from 'react';
import { Token } from '@/types/token';
import { formatBalance } from '@/lib/api';
import { getTokenValue } from '../utils/tokenUtils';

interface ImprovedBurnConfirmationModalProps {
  tokens: Token[];
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
}

export default function ImprovedBurnConfirmationModal({
  tokens,
  isOpen,
  onClose,
  onConfirm
}: ImprovedBurnConfirmationModalProps) {
  const [showAdvanced, setShowAdvanced] = useState(false);
  
  if (!isOpen) return null;

  const totalTokens = tokens.length;
  const totalValue = tokens.reduce((sum, token) => sum + getTokenValue(token), 0);

  return (
    <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4">
      <div className="bg-gray-900 rounded-lg border border-gray-700 shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <h2 className="text-xl font-bold text-white mb-4 flex items-center">
            <div className="w-8 h-8 bg-red-600 rounded-full flex items-center justify-center mr-3">
              🔥
            </div>
            Ready to Burn {totalTokens} Token{totalTokens > 1 ? 's' : ''}
          </h2>
          
          {/* Simple Process Explanation */}
          <div className="bg-blue-900/30 border border-blue-700 rounded-md p-4 mb-6">
            <div className="flex items-start">
              <div className="w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center mr-3 mt-0.5">
                <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div>
                <p className="text-white font-medium">🚀 Instant & Secure Process</p>
                <p className="text-gray-300 text-sm mt-1">
                  We&apos;ll burn each token with a direct transfer - <strong>no approvals needed!</strong> 
                  You&apos;ll sign {totalTokens} quick transaction{totalTokens > 1 ? 's' : ''}, and each token disappears immediately.
                </p>
              </div>
            </div>
          </div>

          {/* Why This is Better */}
          <div className="bg-gray-800 rounded-md p-4 mb-6">
            <h3 className="text-green-300 font-medium mb-2">✅ Why This Method is Superior:</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm text-gray-300">
              <div className="flex items-center">
                <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
                No approvals = Zero security risks
              </div>
              <div className="flex items-center">
                <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
                Each token burns instantly
              </div>
              <div className="flex items-center">
                <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
                One failure won&apos;t stop others
              </div>
              <div className="flex items-center">
                <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
                Lower total gas costs
              </div>
            </div>
          </div>

          {/* Quick Summary */}
          <div className="bg-gray-800 rounded-md p-4 mb-6">
            <div className="bg-gray-800 rounded-md p-4">
              <div className="flex justify-between items-center mb-3">
                <div>
                  <p className="text-white font-medium">🎯 Quick Summary</p>
                  <p className="text-gray-400 text-sm">Ready to clean up your wallet?</p>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-bold text-white">{totalTokens}</p>
                  <p className="text-gray-400 text-sm">token{totalTokens > 1 ? 's' : ''}</p>
                </div>
              </div>
              
              <div className="flex justify-between text-sm">
                <span className="text-gray-300">Est. total value:</span>
                <span className="text-yellow-400 font-medium">${totalValue.toFixed(2)}</span>
              </div>
            </div>
          </div>

          {/* Advanced Details (Collapsible) */}
          <div className="mb-6">
            <button
              onClick={() => setShowAdvanced(!showAdvanced)}
              className="flex items-center text-gray-400 hover:text-white transition-colors"
            >
              <svg 
                className={`w-4 h-4 mr-2 transition-transform ${showAdvanced ? 'rotate-90' : ''}`}
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
              {showAdvanced ? 'Hide' : 'Show'} token details
            </button>
            
            {showAdvanced && (
              <div className="mt-3 bg-gray-800 rounded-md p-3 max-h-60 overflow-y-auto">
                <ul className="divide-y divide-gray-700">
                  {tokens.map((token, index) => {
                    const value = getTokenValue(token);
                    const formattedBalance = formatBalance(token.balance, token.contract_decimals);
                    
                    return (
                      <li key={token.contract_address} className="py-2 first:pt-0 last:pb-0">
                        <div className="flex justify-between items-center">
                          <div className="flex items-center">
                            <div className="w-6 h-6 bg-gray-700 rounded-full flex items-center justify-center mr-3">
                              <span className="text-xs text-gray-300">{index + 1}</span>
                            </div>
                            <div>
                              <div className="text-white font-medium">
                                {token.contract_ticker_symbol || 'Unknown'}
                              </div>
                              <div className="text-gray-400 text-sm">
                                {formattedBalance} tokens
                              </div>
                            </div>
                          </div>
                          <div className="text-yellow-400 font-medium">
                            ${value.toFixed(2)}
                          </div>
                        </div>
                      </li>
                    );
                  })}
                </ul>
              </div>
            )}
          </div>

          {/* Warning */}
          <div className="bg-red-900/30 border border-red-700 rounded-md p-4 mb-6">
            <div className="flex items-start">
              <div className="w-6 h-6 bg-red-600 rounded-full flex items-center justify-center mr-3 mt-0.5">
                <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div>
                <p className="text-red-300 font-medium">⚠️ This is permanent!</p>
                <p className="text-gray-300 text-sm mt-1">
                  Burned tokens cannot be recovered. Only proceed if you&apos;re sure these tokens are worthless.
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
            >
              Cancel
            </button>
            <button
              type="button"
              className="px-6 py-3 bg-gradient-to-r from-red-600 to-orange-600 hover:from-red-500 hover:to-orange-500 text-white rounded-lg transition-all transform hover:scale-105 font-medium flex items-center"
              onClick={onConfirm}
            >
              🔥 Start Burning
              <svg className="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
} 