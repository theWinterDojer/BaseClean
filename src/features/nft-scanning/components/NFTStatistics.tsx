import React from 'react';
import { NFT } from '@/types/nft';
import { useNFTStatistics } from '@/hooks/useNFTs';
import { NFTFilterOptions } from '@/hooks/useNFTFiltering';

interface NFTStatisticsProps {
  nfts: NFT[];
  allNFTs?: NFT[]; // All NFTs (unfiltered) for showing full collection stats
  selectedNFTs: Set<string>;
  selectedNetworks?: Set<number>; // Currently selected networks for filtering
  onNetworkToggle?: (chainId: number) => void; // Handler for network filter toggle
  // Basic filtering props
  filters?: NFTFilterOptions;
  onFilterChange?: (key: keyof NFTFilterOptions, value: boolean | string) => void;
  onResetFilters?: () => void;
  filterStats?: {
    totalNFTs: number;
    filteredCount: number;
    hiddenCount: number;
    isFiltered: boolean;
  };
  isSearching?: boolean; // Indicates if search is being debounced
  className?: string;
}

/**
 * Component for displaying NFT collection statistics
 * Shows total counts, collection breakdown, and selected counts
 */
export default function NFTStatistics({ 
  nfts, 
  allNFTs,
  selectedNFTs, 
  selectedNetworks,
  onNetworkToggle,
  filters,
  onFilterChange,
  onResetFilters,
  filterStats,
  isSearching = false,
  className = "" 
}: NFTStatisticsProps) {
  // Use allNFTs for overall statistics if available, fallback to filtered nfts
  const statisticsSource = allNFTs && allNFTs.length > 0 ? allNFTs : nfts;
  const statistics = useNFTStatistics(statisticsSource);
  
  // Calculate selected statistics
  const selectedCount = selectedNFTs.size;

  // Top collections (by NFT count)
  const topCollections = Object.values(statistics.collectionsMap)
    .sort((a, b) => b.count - a.count)
    .slice(0, 3);

  // Chain breakdown (use allNFTs if available to show complete collection stats)
  const nftsForChainStats = allNFTs || nfts;
  const chainBreakdown = nftsForChainStats.reduce((acc, nft) => {
    const chainId = (nft.metadata?.chainId as number) || 8453;
    const chainName = (nft.metadata?.chainName as string) || 'Base';
    const key = `${chainId}-${chainName}`;
    
    if (!acc[key]) {
      acc[key] = { 
        chainId, 
        chainName, 
        count: 0,
        emoji: chainId === 8453 ? '🟦' : chainId === 7777777 ? '🌈' : '⚪'
      };
    }
    acc[key].count++;
    return acc;
  }, {} as Record<string, { chainId: number; chainName: string; count: number; emoji: string }>);

  const chainStats = Object.values(chainBreakdown).sort((a, b) => b.count - a.count);

  // Don't show statistics if there are no NFTs in wallet at all
  if ((!allNFTs || allNFTs.length === 0) && nfts.length === 0) {
    return null;
  }

  return (
    <div className={`bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6 ${className}`}>
      <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-6 flex items-center">
        <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v4a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
        </svg>
        NFT Collection Stats
      </h3>



      {/* Main Statistics Grid */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        {/* Total NFTs */}
        <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-5">
          <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
            {statistics.totalNFTs}
          </div>
          <div className="text-sm text-gray-600 dark:text-gray-300 mt-1">
            Total NFTs
          </div>
        </div>

        {/* Total Collections */}
        <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-5">
          <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">
            {statistics.totalCollections}
          </div>
          <div className="text-sm text-gray-600 dark:text-gray-300 mt-1">
            Collections
          </div>
        </div>

        {/* ERC-721 Count */}
        <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-5">
          <div className="text-2xl font-bold text-green-600 dark:text-green-400">
            {statistics.erc721Count}
          </div>
          <div className="text-sm text-gray-600 dark:text-gray-300 mt-1">
            ERC-721
          </div>
        </div>

        {/* ERC-1155 Count */}
        <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-5">
          <div className="text-2xl font-bold text-orange-600 dark:text-orange-400">
            {statistics.erc1155Count}
          </div>
          <div className="text-sm text-gray-600 dark:text-gray-300 mt-1">
            ERC-1155
          </div>
        </div>
      </div>

      {/* Basic Filters */}
      {filters && onFilterChange && (
        <div className="mb-6">
          <div className="flex items-center justify-between mb-4">
            <h4 className="text-md font-medium text-gray-900 dark:text-gray-100 flex items-center">
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
              </svg>
              Filters
            </h4>
            {filterStats?.isFiltered && onResetFilters && (
              <button
                onClick={onResetFilters}
                className="text-xs text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 font-medium"
              >
                Reset All
              </button>
            )}
          </div>

          {/* Search Input */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Search Collections
            </label>
            <div className="relative">
              <input
                type="text"
                value={filters.searchTerm}
                onChange={(e) => onFilterChange('searchTerm', e.target.value)}
                placeholder="Search by collection or NFT name..."
                className="w-full px-3 py-2 pl-10 pr-10 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <svg className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              {/* Search status indicator */}
              {isSearching && (
                <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                  <div className="w-3 h-3 border border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                </div>
              )}
            </div>
          </div>

          {/* Filter Toggles */}
          <div className="space-y-3">
            <label className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-600/50 transition-colors">
              <div className="flex items-center">
                <input
                  type="checkbox"
                  checked={filters.showOnlyWithoutImages}
                  onChange={(e) => onFilterChange('showOnlyWithoutImages', e.target.checked)}
                  className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600 mr-3"
                />
                <div className="text-gray-900 dark:text-gray-100 text-sm">
                  Show NFTs without images
                </div>
              </div>
            </label>

            <label className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-600/50 transition-colors">
              <div className="flex items-center">
                <input
                  type="checkbox"
                  checked={filters.showOnlySingleNFTs}
                  onChange={(e) => onFilterChange('showOnlySingleNFTs', e.target.checked)}
                  className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600 mr-3"
                />
                <div className="text-gray-900 dark:text-gray-100 text-sm">
                  Show single NFTs
                </div>
              </div>
            </label>

            <label className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-600/50 transition-colors">
              <div className="flex items-center">
                <input
                  type="checkbox"
                  checked={filters.sortByCollection}
                  onChange={(e) => onFilterChange('sortByCollection', e.target.checked)}
                  className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600 mr-3"
                />
                <div className="text-gray-900 dark:text-gray-100 text-sm">
                  Sort by collection alphabetically
                </div>
              </div>
            </label>
          </div>

          {/* Filter Results Display */}
          {filterStats?.isFiltered && (
            <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
              <div className="text-sm text-blue-800 dark:text-blue-200">
                <div className="font-medium">
                  Showing {filterStats.filteredCount} of {filterStats.totalNFTs} NFTs
                </div>
                {filterStats.hiddenCount > 0 && (
                  <div className="text-xs text-blue-600 dark:text-blue-300 mt-1">
                    {filterStats.hiddenCount} NFT{filterStats.hiddenCount !== 1 ? 's' : ''} hidden by filters
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Network Filter */}
      {chainStats.length > 1 && selectedNetworks && onNetworkToggle && (
        <div className="mb-6">
          <h4 className="text-md font-medium text-gray-900 dark:text-gray-100 mb-3">
            Network
          </h4>
          <div className="space-y-2">
            {chainStats.map((chain) => (
              <div
                key={`filter-${chain.chainId}-${chain.chainName}`}
                onClick={() => onNetworkToggle(chain.chainId)}
                className={`flex items-center justify-between p-3 rounded-lg cursor-pointer transition-colors ${
                  selectedNetworks.has(chain.chainId)
                    ? 'bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800'
                    : 'bg-gray-50 dark:bg-gray-700/50 hover:bg-gray-100 dark:hover:bg-gray-600/50'
                }`}
              >
                <div className="flex items-center">
                  <span className="mr-3 text-lg">{chain.emoji}</span>
                  <div className="font-medium text-gray-900 dark:text-gray-100 text-sm">
                    {chain.chainName}
                  </div>
                </div>
                <div className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                  {chain.count} NFT{chain.count !== 1 ? 's' : ''}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Top Collections */}
      {topCollections.length > 0 && (
        <div>
          <h4 className="text-md font-medium text-gray-900 dark:text-gray-100 mb-3">
            Top Collections
          </h4>
          <div className="space-y-2">
            {topCollections.map((collection, index) => (
              <div
                key={collection.address}
                className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg"
              >
                <div className="flex items-center min-w-0 flex-1 mr-3">
                  <div className={`w-2 h-2 rounded-full mr-2 flex-shrink-0 ${
                    index === 0 ? 'bg-blue-500' :
                    index === 1 ? 'bg-purple-500' :
                    'bg-gray-400'
                  }`} />
                  <div className="min-w-0 flex-1 overflow-hidden">
                    <div className="font-medium text-gray-900 dark:text-gray-100 text-sm truncate">
                      {collection.name}
                    </div>
                    <div className="text-xs text-gray-500 dark:text-gray-400 font-mono truncate max-w-[140px]">
                      {collection.address.substring(0, 8)}...{collection.address.slice(-4)}
                    </div>
                  </div>
                </div>
                <div className="text-sm font-semibold text-gray-700 dark:text-gray-300 flex-shrink-0 whitespace-nowrap">
                  {collection.count}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Quick Actions Info */}
      <div className="mt-6 pt-4 border-t border-gray-200 dark:border-gray-700">
        <div className="text-sm text-gray-500 dark:text-gray-400">
          <div className="flex items-center space-x-4">
            <div className="flex items-center">
              <div className="w-3 h-3 bg-green-500 rounded mr-2"></div>
              <span>ERC-721: Unique NFTs</span>
            </div>
            <div className="flex items-center">
              <div className="w-3 h-3 bg-purple-500 rounded mr-2"></div>
              <span>ERC-1155: Multi-edition NFTs</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 