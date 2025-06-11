import React from 'react';
import { NFT } from '@/types/nft';
import NFTCard from '@/shared/components/NFTCard';
import { NFT_UI_TEXT } from '@/constants/nfts';
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
  isFiltered?: boolean; // Whether filters are currently applied
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
  totalNFTs = 0,
  isFiltered = false
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
      <div className="flex flex-col items-center justify-center py-12">
        <div className="w-12 h-12 border-4 border-gray-200 border-t-blue-500 rounded-full animate-spin mb-4"></div>
        <p className="text-gray-500 dark:text-gray-400 text-lg">{NFT_UI_TEXT.LOADING}</p>
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
      <div className="flex flex-col items-center justify-center py-12">
        <div className="w-16 h-16 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mb-4">
          <svg className="w-8 h-8 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
          </svg>
        </div>
        <p className="text-gray-500 dark:text-gray-400 text-lg">{NFT_UI_TEXT.CONNECT_WALLET}</p>
      </div>
    );
  }

  // No NFTs state - distinguish between no NFTs at all vs filtered out
  if (totalNFTs === 0) {
    // Actually no NFTs in wallet
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <div className="w-16 h-16 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mb-4">
          <svg className="w-8 h-8 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
        </div>
        <p className="text-gray-500 dark:text-gray-400 text-lg">{NFT_UI_TEXT.NO_NFTS}</p>
      </div>
    );
  }

  // All NFTs filtered out state
  if (nfts.length === 0 && totalNFTs > 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <div className="w-16 h-16 bg-amber-100 dark:bg-amber-900/30 rounded-full flex items-center justify-center mb-4">
          <svg className="w-8 h-8 text-amber-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 2v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
          </svg>
        </div>
        <p className="text-gray-500 dark:text-gray-400 text-lg font-medium mb-2">No NFTs match your filters</p>
        <p className="text-gray-400 dark:text-gray-500 text-sm">
          You have {totalNFTs} NFT{totalNFTs === 1 ? '' : 's'} in your wallet, but none match your current network or other filter settings.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Filter Status Text */}
      {isConnected && !loading && nfts.length > 0 && (
        <div className="text-sm text-gray-600 dark:text-gray-400">
          {isFiltered ? (
            <>Showing {nfts.length} of {totalNFTs} NFTs</>
          ) : (
            <>Showing {nfts.length} NFT{nfts.length === 1 ? '' : 's'}</>
          )}
        </div>
      )}

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