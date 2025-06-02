import React from 'react';
import { Token } from '@/types/token';
import { formatBalance } from '@/lib/api';
import { getTokenValue } from '../utils/tokenUtils';

interface BurnConfirmationModalProps {
  tokens: Token[];
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
}

export default function BurnConfirmationModal({
  tokens,
  isOpen,
  onClose,
  onConfirm
}: BurnConfirmationModalProps) {
  if (!isOpen) return null;

  const totalTokens = tokens.length;
  const totalValue = tokens.reduce((sum, token) => sum + getTokenValue(token), 0);

  // Check if any tokens have significant value
  const hasSignificantValue = totalValue > 1.0; // $1 threshold

  return (
    <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4">
      <div className="bg-gray-900 rounded-lg border border-gray-700 shadow-xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <h2 className="text-xl font-bold text-white mb-4 flex items-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-yellow-500 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            Burn Confirmation
          </h2>
          
          <div className="bg-red-900/30 border border-red-700 rounded-md p-4 mb-6">
            <p className="text-white font-medium">⚠️ WARNING: This action is irreversible!</p>
            <p className="text-gray-300 text-sm mt-1">
              Once tokens are burned, they cannot be recovered. Please review the tokens below carefully before proceeding.
            </p>
          </div>

          {/* Additional value warning if tokens have significant value */}
          {hasSignificantValue && (
            <div className="bg-yellow-900/30 border border-yellow-700 rounded-md p-4 mb-6">
              <p className="text-white font-medium">💰 Value Warning!</p>
              <p className="text-gray-300 text-sm mt-1">
                You are about to burn tokens worth <span className="font-bold text-yellow-400">${totalValue.toFixed(2)}</span>. 
                Please double-check that you really want to destroy these valuable tokens.
              </p>
            </div>
          )}

          <div className="mb-6">
            <h3 className="text-white font-medium mb-2">Summary:</h3>
            <div className="bg-gray-800 rounded-md p-3">
              <p className="text-gray-200">Total tokens to burn: <span className="font-medium text-white">{totalTokens}</span></p>
              <p className="text-gray-200">Total estimated value: <span className={`font-medium ${hasSignificantValue ? 'text-yellow-400' : 'text-white'}`}>${totalValue.toFixed(2)}</span></p>
            </div>
          </div>

          <div className="mb-6">
            <h3 className="text-white font-medium mb-2">Tokens to be burned:</h3>
            <div className="bg-gray-800 rounded-md p-3 max-h-60 overflow-y-auto">
              <ul className="divide-y divide-gray-700">
                {tokens.map((token) => {
                  const value = getTokenValue(token);
                  const formattedBalance = formatBalance(token.balance, token.contract_decimals);
                  
                  return (
                    <li key={token.contract_address} className="py-2 first:pt-0 last:pb-0">
                      <div className="flex justify-between items-center">
                        <div>
                          <div className="text-white font-medium">
                            {token.contract_ticker_symbol || 'Unknown'}
                          </div>
                          <div className="text-gray-400 text-sm">
                            {formattedBalance} tokens
                          </div>
                        </div>
                        <div className={`font-medium ${value > 0.1 ? 'text-yellow-400' : 'text-gray-300'}`}>
                          ${value.toFixed(2)}
                        </div>
                      </div>
                    </li>
                  );
                })}
              </ul>
            </div>
          </div>

          {/* Cancel button on left, Burn button on right for safety */}
          <div className="flex gap-3">
            <button
              type="button"
              className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-md transition-colors"
              onClick={onClose}
            >
              Cancel
            </button>
            <button
              type="button"
              className="px-4 py-2 bg-red-600 hover:bg-red-500 text-white rounded-md transition-colors ml-auto"
              onClick={onConfirm}
            >
              Burn Tokens
            </button>
          </div>
        </div>
      </div>
    </div>
  );
} 