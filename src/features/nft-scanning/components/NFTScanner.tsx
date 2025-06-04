import React from 'react';
import { useAccount } from 'wagmi';
import { useSelectedItems } from '@/contexts/SelectedItemsContext';

export default function NFTScanner() {
  const { address } = useAccount();
  const { selectedNFTsCount } = useSelectedItems();

  return (
    <div className="space-y-6">
      {/* Coming Soon Header */}
      <div className="text-center py-12">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-[#0052FF] to-blue-600 rounded-full mb-6">
          <svg 
            className="w-8 h-8 text-white" 
            fill="none" 
            stroke="currentColor" 
            viewBox="0 0 24 24"
          >
            <path 
              strokeLinecap="round" 
              strokeLinejoin="round" 
              strokeWidth={2} 
              d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" 
            />
          </svg>
        </div>
        
        <h2 className="text-3xl font-bold text-white mb-4">
          NFT Scanner
        </h2>
        
        <p className="text-lg text-gray-400 mb-8 max-w-2xl mx-auto">
          Identify and burn spam NFTs on Base blockchain. Coming soon with powerful spam detection and bulk burning capabilities.
        </p>
        
        <div className="inline-flex items-center gap-2 bg-gradient-to-r from-[#0052FF]/20 to-blue-600/20 border border-[#0052FF]/30 rounded-lg px-6 py-3">
          <div className="w-2 h-2 bg-[#0052FF] rounded-full animate-pulse"></div>
          <span className="text-[#0052FF] font-medium">Under Development</span>
        </div>
      </div>

      {/* Feature Preview */}
      <div className="grid md:grid-cols-3 gap-6">
        <div className="bg-gray-800/50 border border-gray-700 rounded-lg p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-emerald-600 rounded-lg flex items-center justify-center">
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-white">Smart Detection</h3>
          </div>
          <p className="text-gray-400 text-sm">
            Advanced algorithms to identify spam and unwanted NFTs in your wallet automatically.
          </p>
        </div>

        <div className="bg-gray-800/50 border border-gray-700 rounded-lg p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-violet-600 rounded-lg flex items-center justify-center">
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-white">Bulk Operations</h3>
          </div>
          <p className="text-gray-400 text-sm">
            Select and burn multiple NFTs at once to clean your wallet efficiently.
          </p>
        </div>

        <div className="bg-gray-800/50 border border-gray-700 rounded-lg p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-gradient-to-br from-orange-500 to-red-600 rounded-lg flex items-center justify-center">
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-white">Secure Burning</h3>
          </div>
          <p className="text-gray-400 text-sm">
            Zero-approval secure burning using direct transfers to the burn address.
          </p>
        </div>
      </div>

      {/* Wallet Connection Status */}
      {!address && (
        <div className="text-center py-8">
          <div className="bg-gray-800/50 border border-gray-700 rounded-lg p-6 max-w-md mx-auto">
            <svg className="w-12 h-12 text-gray-500 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
            <h3 className="text-lg font-medium text-white mb-2">Connect Your Wallet</h3>
            <p className="text-gray-400 text-sm">
              Connect your wallet to access NFT scanning features when available.
            </p>
          </div>
        </div>
      )}

      {/* Current Selection Status */}
      {selectedNFTsCount > 0 && (
        <div className="bg-[#0052FF]/10 border border-[#0052FF]/30 rounded-lg p-4">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-[#0052FF] rounded-full flex items-center justify-center">
              <span className="text-white text-sm font-bold">{selectedNFTsCount}</span>
            </div>
            <div>
              <p className="text-white font-medium">
                {selectedNFTsCount} NFT{selectedNFTsCount !== 1 ? 's' : ''} selected
              </p>
              <p className="text-gray-400 text-sm">
                NFT burning functionality will be available soon.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 