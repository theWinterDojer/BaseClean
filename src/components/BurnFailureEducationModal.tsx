import React from 'react';
import { useModalBackButton } from '@/hooks/useModalBackButton';

interface BurnFailureEducationModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function BurnFailureEducationModal({ isOpen, onClose }: BurnFailureEducationModalProps) {
  // Handle browser back button to close modal
  useModalBackButton(isOpen, onClose);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-gray-900 border border-gray-700 rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-bold text-white">
              Why Some Burns Fail
            </h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-200 text-2xl font-bold"
            >
              ×
            </button>
          </div>
          
          <div className="space-y-6 text-gray-300">
            <div>
              <h3 className="text-lg font-semibold text-white mb-2">
                Common Spam Asset Behaviors
              </h3>
              <ul className="space-y-2 list-disc list-inside">
                <li><strong>Phantom Ownership:</strong> Assets appear in your wallet but you don&apos;t actually own them</li>
                <li><strong>Transfer Restrictions:</strong> Contracts prevent transfers to make removal difficult</li>
                <li><strong>Zero Balance:</strong> Assets show up due to indexing issues but have no real balance</li>
                <li><strong>Invalid References:</strong> Point to non-existent or destroyed tokens</li>
              </ul>
            </div>

            <div>
              <h3 className="text-lg font-semibold text-white mb-2">
                Why This Happens
              </h3>
              <ul className="space-y-2 list-disc list-inside">
                <li>They want their assets to stay visible in wallets for advertising</li>
                <li>They use non-standard implementations that break normal transfer rules</li>
                <li>They exploit wallet indexing to show assets without real ownership</li>
                <li>They add complex restrictions that only allow specific interactions</li>
              </ul>
            </div>

            <div>
              <h3 className="text-lg font-semibold text-white mb-2">
                TLDR;
              </h3>
              <div className="bg-blue-900/30 border border-blue-700 rounded-lg p-4">
                <p className="text-blue-200">
                  <strong>Don&apos;t worry about failed burns</strong> - they are intentionally non-transferable by design.
                  Most wallets will hide these tokens by default. BaseClean exists to help identify and attempt removal of transferable spam.
                </p>
              </div>
            </div>

          </div>

          <div className="mt-6 flex justify-end">
            <button
              onClick={onClose}
              className="px-6 py-2 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-500 hover:to-blue-600 text-white rounded-lg font-medium transition-all"
            >
              Got it!
            </button>
          </div>
        </div>
      </div>
    </div>
  );
} 