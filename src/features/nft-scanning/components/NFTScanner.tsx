import React, { useState, useCallback } from 'react';
import { useAccount } from 'wagmi';
import { NFT } from '@/types/nft';
import { useSelectedItems } from '@/contexts/SelectedItemsContext';
import { useNFTFiltering } from '@/hooks/useNFTFiltering';
import { useDirectBurner } from '@/lib/directBurner';
import { clearNFTImageCache } from '@/lib/nftApi';
import NFTDataManager from './NFTDataManager';
import NFTListsContainer from './NFTListsContainer';
import NFTStatistics from './NFTStatistics';
import NFTBurnConfirmationModal from './NFTBurnConfirmationModal';
import GridSizeControl, { type GridSize } from '@/shared/components/GridSizeControl';
import FloatingActionBar from '@/shared/components/FloatingActionBar';

export default function NFTScanner() {
  const { address } = useAccount();
  const { selectedNFTs, toggleNFT, selectedNFTsCount, clearAllSelectedItems } = useSelectedItems();
  const [allNFTs, setAllNFTs] = useState<NFT[]>([]);
  
  // Network filtering state
  const [selectedNetworks, setSelectedNetworks] = useState<Set<number>>(new Set([8453, 7777777])); // Default: show all networks
  
  // Grid size state
  const [gridSize, setGridSize] = useState<GridSize>('medium');

  // NFT Burning state and hooks
  const { 
    burnSingleNFT,
    burnMultipleNFTs,
    isBurning, 
    currentNFT,
    burnResults,
    getNFTBurnStats
  } = useDirectBurner();
  
  const [showBurnConfirmation, setShowBurnConfirmation] = useState(false);
  const [nftsToBurn, setNftsToBurn] = useState<NFT[]>([]);

  // Handle NFT data loading
  const handleNFTsLoaded = useCallback((nfts: NFT[]) => {
    setAllNFTs(nfts);
  }, []);

  // Filter NFTs by selected networks
  const networkFilteredNFTs = allNFTs.filter(nft => {
    const chainId = (nft.metadata?.chainId as number) || 8453;
    return selectedNetworks.has(chainId);
  });

  // Apply basic filters (search, hide without images, etc.)
  const { filters, filteredNFTs, updateFilter, resetFilters, filterStats, isSearching } = useNFTFiltering(networkFilteredNFTs);

  // Handle network filter toggle
  const handleNetworkToggle = useCallback((chainId: number) => {
    setSelectedNetworks(prev => {
      const newSet = new Set(prev);
      if (newSet.has(chainId)) {
        // Allow unchecking all networks
        newSet.delete(chainId);
      } else {
        newSet.add(chainId);
      }
      return newSet;
    });
  }, []);

  // Handle NFT selection toggle
  const handleNFTToggle = useCallback((contractAddress: string, tokenId: string) => {
    const nft = filteredNFTs.find(n => n.contract_address === contractAddress && n.token_id === tokenId);
    if (nft) {
      toggleNFT(nft);
    }
  }, [filteredNFTs, toggleNFT]);



  // Handle bulk burn of selected NFTs
  const handleBurnSelectedNFTs = useCallback(() => {
    const selectedNFTsArray = Array.from(selectedNFTs);
    if (selectedNFTsArray.length > 0) {
      setNftsToBurn(selectedNFTsArray);
      setShowBurnConfirmation(true);
    }
  }, [selectedNFTs]);

  // Handle deselect all for the unified action bar
  const handleDeselectAll = useCallback(() => {
    clearAllSelectedItems();
  }, [clearAllSelectedItems]);

  // Execute the burn after confirmation
  const executeBurn = useCallback(async () => {
    setShowBurnConfirmation(false);
    
    if (!address) {
      console.error('No wallet address available for burning');
      return;
    }
    
    if (nftsToBurn.length === 1) {
      // Single NFT burn
      await burnSingleNFT(nftsToBurn[0], address);
    } else if (nftsToBurn.length > 1) {
      // Multiple NFT burn
      await burnMultipleNFTs(nftsToBurn, address);
    }
    
    // Clear the NFTs to burn
    setNftsToBurn([]);
  }, [nftsToBurn, burnSingleNFT, burnMultipleNFTs, address]);

  // Close burn confirmation
  const closeBurnConfirmation = useCallback(() => {
    setShowBurnConfirmation(false);
    setNftsToBurn([]);
  }, []);

  // Convert selected NFTs Set to use our NFT key format
  const selectedNFTKeys = new Set(
    Array.from(selectedNFTs).map(nft => `${nft.contract_address}-${nft.token_id}`)
  );

  // Handle refresh metadata
  const handleRefreshMetadata = useCallback((refreshFn: () => void) => {
    // Clear cached images and metadata for fresh data
    clearNFTImageCache();
    // Trigger refresh of NFT data
    refreshFn();
  }, []);

  return (
    <NFTDataManager onNFTsLoaded={handleNFTsLoaded}>
      {({ nfts, loading, error, isConnected, isClient, updateNFTs, refreshNFTs }) => (
        <>
          {/* Add bottom padding when NFTs are selected to prevent overlap with floating bar */}
          <div className={`flex flex-col lg:flex-row gap-6 ${selectedNFTsCount > 0 ? 'pb-24' : ''}`}>
            {/* Main Content */}
            <div className="flex-1">
              {/* Header Controls */}
              {allNFTs.length > 0 && (
                <div className="mb-4 flex justify-between items-center">
                  {/* Refresh Metadata Button */}
                  <button
                    onClick={() => handleRefreshMetadata(refreshNFTs)}
                    disabled={loading}
                    className="inline-flex items-center px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    title="Refresh NFT metadata and images"
                  >
                    <svg 
                      className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} 
                      fill="none" 
                      stroke="currentColor" 
                      viewBox="0 0 24 24"
                    >
                      <path 
                        strokeLinecap="round" 
                        strokeLinejoin="round" 
                        strokeWidth={2} 
                        d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" 
                      />
                    </svg>
                    {loading ? 'Refreshing...' : 'Refresh Metadata'}
                  </button>

                  {/* Grid Size Control */}
                  <GridSizeControl 
                    currentSize={gridSize}
                    onSizeChange={setGridSize}
                  />
                </div>
              )}
              
              <NFTListsContainer 
                nfts={filteredNFTs}
                loading={loading}
                error={error}
                isConnected={isConnected}
                selectedNFTs={selectedNFTKeys}
                onNFTToggle={handleNFTToggle}
                regularNFTs={filteredNFTs}
                spamNFTs={[]}
                gridSize={gridSize}
                totalNFTs={allNFTs.length}
              />
            </div>

            {/* Statistics Sidebar - Show when connected and NFTs have been loaded */}
            {isConnected && !loading && (
              <div className="lg:w-80 xl:w-96">
                <NFTStatistics 
                  nfts={filteredNFTs}
                  allNFTs={allNFTs}
                  selectedNFTs={selectedNFTKeys}
                  selectedNetworks={selectedNetworks}
                  onNetworkToggle={handleNetworkToggle}
                  filters={filters}
                  onFilterChange={updateFilter}
                  onResetFilters={resetFilters}
                  filterStats={filterStats}
                  isSearching={isSearching}
                />
              </div>
            )}
          </div>

          {/* Floating Action Bar */}
          <FloatingActionBar
            onBurnSelected={handleBurnSelectedNFTs}
            onDeselectAll={handleDeselectAll}
            isBurning={isBurning}
          />

          {/* NFT Burn Confirmation Modal */}
          <NFTBurnConfirmationModal
            nfts={nftsToBurn}
            isOpen={showBurnConfirmation}
            onClose={closeBurnConfirmation}
            onConfirm={executeBurn}
          />
        </>
      )}
    </NFTDataManager>
  );
} 