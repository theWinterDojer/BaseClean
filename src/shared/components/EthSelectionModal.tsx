import React from 'react';
import { Token } from '@/types/token';

interface EthSelectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  ethToken: Token | null;
}

export default function EthSelectionModal({
  isOpen,
  onClose,
  onConfirm,
  ethToken
}: EthSelectionModalProps) {
  if (!isOpen || !ethToken) return null;

  // Calculate ETH value
  const ethBalance = parseFloat(ethToken.balance) / Math.pow(10, ethToken.contract_decimals);
  const ethValue = ethBalance * (ethToken.quote_rate || 0);

  return (
    <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4">
      <div className="bg-gray-900 rounded-lg border border-gray-700 shadow-xl max-w-md w-full">
        <div className="p-6">
          <h2 className="text-xl font-bold text-white mb-4 flex items-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-yellow-500 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            ETH Selection Warning
          </h2>
          
          <div className="bg-yellow-900/30 border border-yellow-700 rounded-md p-4 mb-6">
            <p className="text-white font-medium">⚠️ You have selected ETH!</p>
            <p className="text-gray-300 text-sm mt-2">
              ETH is the native gas token for Base network. Burning ETH means you will lose your ability to pay for transaction fees.
            </p>
          </div>

          <div className="mb-6">
            <h3 className="text-white font-medium mb-2">Selected Token Details:</h3>
            <div className="bg-gray-800 rounded-md p-3">
              <div className="flex justify-between items-center">
                <div>
                  <div className="text-white font-medium">
                    {ethToken.contract_ticker_symbol} ({ethToken.contract_name})
                  </div>
                  <div className="text-gray-400 text-sm">
                    {ethBalance.toFixed(6)} ETH
                  </div>
                </div>
                <div className="text-yellow-400 font-medium">
                  ${ethValue.toFixed(2)}
                </div>
              </div>
            </div>
          </div>

          <p className="text-gray-300 text-sm mb-6">
            Are you sure you want to proceed with burning your ETH? This action cannot be undone.
          </p>

          <div className="flex gap-3 justify-end">
            <button
              type="button"
              className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-md transition-colors"
              onClick={onClose}
            >
              Cancel
            </button>
            <button
              type="button"
              className="px-4 py-2 bg-yellow-600 hover:bg-yellow-500 text-white rounded-md transition-colors"
              onClick={onConfirm}
            >
              Yes, I understand
            </button>
          </div>
        </div>
      </div>
    </div>
  );
} 