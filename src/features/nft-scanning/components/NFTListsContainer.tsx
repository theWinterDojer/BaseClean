import React from 'react';
import { NFT } from '@/types/nft';
import NFTCard from '@/shared/components/NFTCard';
import { type GridSize } from '@/shared/components/GridSizeControl';

interface NFTListsContainerProps {
  nfts: NFT[];
  loading: boolean;
  error: string | null;
  isConnected: boolean;
  selectedNFTs: Set<string>;
  onNFTToggle: (contractAddress: string, tokenId: string) => void;
  spamNFTs?: NFT[];
  regularNFTs?: NFT[];
  gridSize?: GridSize;
  totalNFTs?: number; // Total NFTs in wallet (before filtering)
}

/**
 * Component responsible for displaying NFTs in grid layouts
 * Uses simple CSS Grid for optimal performance and reliability
 */
export default function NFTListsContainer({
  nfts,
  loading,
  error,
  isConnected,
  selectedNFTs,
  onNFTToggle,
  spamNFTs = [],
  regularNFTs = [],
  gridSize = 'medium',
  totalNFTs = 0
}: NFTListsContainerProps) {
  
  // Generate unique key for NFT selection
  const getNFTKey = (contractAddress: string, tokenId: string) => 
    `${contractAddress}-${tokenId}`;

  // Check if NFT is selected
  const isNFTSelected = (contractAddress: string, tokenId: string) =>
    selectedNFTs.has(getNFTKey(contractAddress, tokenId));

  // Get grid classes based on size
  const getGridClasses = (size: GridSize) => {
    switch (size) {
      case 'small':
        return 'grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 xl:grid-cols-7 2xl:grid-cols-8 gap-3';
      case 'medium':
        return 'grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-4';
      case 'large':
        return 'grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 2xl:grid-cols-4 gap-6';
      default:
        return 'grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-4';
    }
  };

  const gridClasses = getGridClasses(gridSize);

  // Loading state
  if (loading) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-gray-900/80 backdrop-blur-sm">
        <div className="bg-gray-800/90 border border-gray-700 text-white p-8 rounded-xl shadow-2xl text-center max-w-md mx-4">
          <div className="w-16 h-16 border-4 border-gray-600 border-t-blue-500 rounded-full animate-spin mx-auto mb-6"></div>
          <p className="text-xl font-medium mb-2">Loading your NFT collection...</p>
          <p className="text-gray-300 text-sm">Discovering your NFT collection across Base and Zora networks</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <div className="w-16 h-16 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center mb-4">
          <svg className="w-8 h-8 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <p className="text-red-600 dark:text-red-400 text-lg font-medium mb-2">Error Loading NFTs</p>
        <p className="text-gray-500 dark:text-gray-400 text-center max-w-md">{error}</p>
      </div>
    );
  }

  // Not connected state
  if (!isConnected) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-gray-900/80 backdrop-blur-sm">
        <div className="bg-gray-800/90 border border-gray-700 text-white p-8 rounded-xl shadow-2xl text-center max-w-md mx-4">
          <div className="mb-4">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-gray-400 mx-auto mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1-1H8a1 1 0 00-1 1v3M4 7h16" />
            </svg>
          </div>
          <span className="text-xl font-medium">Connect your wallet to start using BaseClean. A zero-approval cleaning tool for Base.</span>
        </div>
      </div>
    );
  }

  // No NFTs state - distinguish between no NFTs at all vs filtered out
  if (totalNFTs === 0) {
    // Actually no NFTs in wallet
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-gray-900/80 backdrop-blur-sm">
        <div className="bg-gray-800/90 border border-gray-700 text-white p-8 rounded-xl shadow-2xl text-center max-w-md mx-4">
          <div className="mb-4">
            <svg className="w-16 h-16 text-gray-400 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </div>
          <p className="text-xl font-medium mb-2">No NFTs found</p>
          <p className="text-gray-300 text-sm">Your wallet doesn&apos;t contain any NFTs on Base or Zora networks</p>
        </div>
      </div>
    );
  }

  // All NFTs filtered out state
  if (nfts.length === 0 && totalNFTs > 0) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-gray-900/80 backdrop-blur-sm">
        <div className="bg-amber-900/90 border border-amber-700 text-white p-8 rounded-xl shadow-2xl text-center max-w-md mx-4">
          <div className="mb-4">
            <svg className="w-16 h-16 text-amber-400 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 2v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
            </svg>
          </div>
          <p className="text-xl font-medium mb-2">No NFTs match your filters</p>
          <p className="text-amber-200 text-sm">
            You have {totalNFTs} NFT{totalNFTs === 1 ? '' : 's'} in your wallet, but none match your current network or other filter settings.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Regular NFTs Section */}
      {regularNFTs.length > 0 && (
        <div className={gridClasses}>
          {regularNFTs.map((nft) => (
            <NFTCard
              key={getNFTKey(nft.contract_address, nft.token_id)}
              nft={nft}
              isSelected={isNFTSelected(nft.contract_address, nft.token_id)}
              isSpam={false}
              onToggle={onNFTToggle}
            />
          ))}
        </div>
      )}

      {/* Spam NFTs Section */}
      {spamNFTs.length > 0 && (
        <div>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-red-600 dark:text-red-400">
              Potential Spam NFTs ({spamNFTs.length})
            </h3>
            <div className="text-sm text-gray-500 dark:text-gray-400">
              Review carefully before burning
            </div>
          </div>
          
          <div className={gridClasses}>
            {spamNFTs.map((nft) => (
              <NFTCard
                key={getNFTKey(nft.contract_address, nft.token_id)}
                nft={nft}
                isSelected={isNFTSelected(nft.contract_address, nft.token_id)}
                isSpam={true}
                onToggle={onNFTToggle}
              />
            ))}
          </div>
        </div>
      )}

      {/* All NFTs Fallback (when no spam detection is applied) */}
      {regularNFTs.length === 0 && spamNFTs.length === 0 && nfts.length > 0 && (
        <div className={gridClasses}>
          {nfts.map((nft) => (
            <NFTCard
              key={getNFTKey(nft.contract_address, nft.token_id)}
              nft={nft}
              isSelected={isNFTSelected(nft.contract_address, nft.token_id)}
              isSpam={false}
              onToggle={onNFTToggle}
            />
          ))}
        </div>
      )}
    </div>
  );
} 