import React, { useState, useCallback, useEffect } from 'react';
import { useAccount } from 'wagmi';
import { NFT } from '@/types/nft';
import { useSelectedItems } from '@/contexts/SelectedItemsContext';
import { useNFTFiltering } from '@/hooks/useNFTFiltering';
import { clearNFTImageCache } from '@/lib/nftApi';
import NFTDataManager from './NFTDataManager';
import NFTListsContainer from './NFTListsContainer';
import NFTStatistics from './NFTStatistics';
import GridSizeControl, { type GridSize } from '@/shared/components/GridSizeControl';
import FloatingActionBar from '@/shared/components/FloatingActionBar';

interface NFTScannerProps {
  showDisclaimer: boolean;
}

export default function NFTScanner({ showDisclaimer }: NFTScannerProps) {
  const { isConnected } = useAccount();
  const { selectedNFTs, toggleNFT, selectedNFTsCount, clearAllSelectedItems, burnedNFTKeys } = useSelectedItems();
  const [allNFTs, setAllNFTs] = useState<NFT[]>([]);
  
  // Network filtering state
  const [selectedNetworks, setSelectedNetworks] = useState<Set<number>>(new Set([8453, 7777777])); // Default: show all networks
  
  // Grid size state - responsive default (small on mobile, medium on desktop)
  const [gridSize, setGridSize] = useState<GridSize>('small');

  // Set responsive grid size default
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const setResponsiveGridSize = () => {
        const isMobile = window.innerWidth < 768; // md breakpoint
        setGridSize(isMobile ? 'small' : 'medium');
      };
      
      // Set initial size
      setResponsiveGridSize();
      
      // Listen for resize events
      window.addEventListener('resize', setResponsiveGridSize);
      return () => window.removeEventListener('resize', setResponsiveGridSize);
    }
  }, []);

  // Clear NFT data when wallet disconnects
  useEffect(() => {
    if (!isConnected) {
      setAllNFTs([]);
      clearAllSelectedItems();
    }
  }, [isConnected, clearAllSelectedItems]);

  // Handle NFT data loading
  const handleNFTsLoaded = useCallback((nfts: NFT[]) => {
    setAllNFTs(nfts);
  }, []);

  // Filter NFTs by selected networks and burned status
  const networkFilteredNFTs = allNFTs.filter(nft => {
    const chainId = (nft.metadata?.chainId as number) || 8453;
    // Check if NFT is burned
    const nftKey = `${nft.contract_address}-${nft.token_id}`;
    return selectedNetworks.has(chainId) && !burnedNFTKeys.has(nftKey);
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

  // Note: Burn handling is now fully managed by the SelectedItemsContext
  // and triggered through the FloatingActionBar using openBurnModal()

  // Handle deselect all for the unified action bar
  const handleDeselectAll = useCallback(() => {
    clearAllSelectedItems();
  }, [clearAllSelectedItems]);

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
    <div className="mt-4">
      <NFTDataManager onNFTsLoaded={handleNFTsLoaded} showDisclaimer={showDisclaimer}>
        {({ loading, error, isConnected, processedNFTs, refreshNFTs }) => {
        return (
        <>
          {/* Add bottom padding when NFTs are selected to prevent overlap with floating bar */}
          <div className={`flex flex-col lg:flex-row gap-6 ${selectedNFTsCount > 0 ? 'pb-24' : ''}`}>
            {/* Main Content */}
            <div className="flex-1">
              {/* Header Controls - Mobile responsive layout */}
              {allNFTs.length > 0 && (
                <div className="mb-4 space-y-3 md:space-y-0">
                  {/* Mobile: Two rows layout */}
                  <div className="flex flex-col md:hidden space-y-3">
                    {/* Row 1: Refresh button + NFT count */}
                    <div className="flex justify-between items-center">
                      <button
                        onClick={() => handleRefreshMetadata(refreshNFTs)}
                        disabled={loading}
                        className="inline-flex items-center px-2 py-1 text-xs font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                        title="Refresh NFT metadata and images"
                      >
                        <svg 
                          className={`w-3 h-3 mr-1 ${loading ? 'animate-spin' : ''}`} 
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
                      
                      {!loading && (
                        <div className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                          {(filterStats.isFiltered || filteredNFTs.length < allNFTs.length) ? (
                            <>Showing {filteredNFTs.length} of {allNFTs.length} NFTs</>
                          ) : (
                            <>Showing all {allNFTs.length} NFT{allNFTs.length === 1 ? '' : 's'}</>
                          )}
                        </div>
                      )}
                    </div>
                    
                    {/* Row 2: Grid size control - centered */}
                    {!loading && (
                      <div className="flex justify-center">
                        <GridSizeControl 
                          currentSize={gridSize}
                          onSizeChange={setGridSize}
                        />
                      </div>
                    )}
                  </div>

                  {/* Desktop: Original single row layout */}
                  <div className="hidden md:flex justify-between items-center">
                    {/* Left side - Refresh Button */}
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

                    {/* Center - NFT Count */}
                    {!loading && (
                      <div className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                        {(filterStats.isFiltered || filteredNFTs.length < allNFTs.length) ? (
                          <>Showing {filteredNFTs.length} of {allNFTs.length} NFTs</>
                        ) : (
                          <>Showing all {allNFTs.length} NFT{allNFTs.length === 1 ? '' : 's'}</>
                        )}
                      </div>
                    )}

                    {/* Right side - Grid Size Control */}
                    {!loading && (
                      <GridSizeControl 
                        currentSize={gridSize}
                        onSizeChange={setGridSize}
                      />
                    )}
                  </div>
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
                processedNFTs={processedNFTs}
              />
            </div>

            {/* Statistics Sidebar - Show when connected and NFTs have been loaded */}
            {isConnected && !loading && (
              <div className="lg:w-80 xl:w-96">
                <NFTStatistics 
                  nfts={filteredNFTs}
                  allNFTs={allNFTs}
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
            onDeselectAll={handleDeselectAll}
          />
        </>
        );
      }}
    </NFTDataManager>
    </div>
  );
} 