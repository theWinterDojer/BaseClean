import React, { useState, useCallback } from 'react';
import { useAccount } from 'wagmi';
import { NFT } from '@/types/nft';
import { useSelectedItems } from '@/contexts/SelectedItemsContext';
import { useNFTFiltering } from '@/hooks/useNFTFiltering';
import { useDirectBurner } from '@/lib/directBurner';
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

  return (
    <NFTDataManager onNFTsLoaded={handleNFTsLoaded}>
      {({ nfts, loading, error, isConnected, isClient, updateNFTs }) => (
        <>
          {/* Add bottom padding when NFTs are selected to prevent overlap with floating bar */}
          <div className={`flex flex-col lg:flex-row gap-6 ${selectedNFTsCount > 0 ? 'pb-24' : ''}`}>
            {/* Main Content */}
            <div className="flex-1">
              {/* Grid Size Control */}
              {allNFTs.length > 0 && (
                <div className="mb-4 flex justify-end items-center">
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