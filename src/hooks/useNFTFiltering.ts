import { useState, useMemo, useEffect, useCallback } from 'react';
import { NFT } from '@/types/nft';

export interface NFTFilterOptions {
  searchTerm: string;
  showOnlyWithoutImages: boolean;
  sortByCollection: boolean;
  showOnlySingleNFTs: boolean;
  showERC721: boolean;
  showERC1155: boolean;
}

export const useNFTFiltering = (
  nfts: NFT[]
) => {
  const [filters, setFilters] = useState<NFTFilterOptions>({
    searchTerm: '',
    showOnlyWithoutImages: false,
    sortByCollection: false,
    showOnlySingleNFTs: false,
    showERC721: true,
    showERC1155: true,
  });

  // Separate debounced search term for filtering performance
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('');

  // Debounce search term updates (300ms delay)
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchTerm(filters.searchTerm);
    }, 300);

    return () => clearTimeout(timer);
  }, [filters.searchTerm]);

  // Apply all filters using debounced search term
  const filteredNFTs = useMemo(() => {
    let result = [...nfts];

    // 1. Filter by token standard (ERC-721/ERC-1155)
    if (!filters.showERC721 || !filters.showERC1155) {
      result = result.filter(nft => {
        if (!filters.showERC721 && nft.token_standard === 'ERC721') {
          return false;
        }
        if (!filters.showERC1155 && nft.token_standard === 'ERC1155') {
          return false;
        }
        return true;
      });
    }

    // 2. Search by collection name (using debounced term)
    if (debouncedSearchTerm.trim()) {
      const searchLower = debouncedSearchTerm.toLowerCase();
      result = result.filter(nft => 
        (nft.collection_name || '').toLowerCase().includes(searchLower) ||
        (nft.name || '').toLowerCase().includes(searchLower)
      );
    }

    // 3. Show only NFTs without images
    if (filters.showOnlyWithoutImages) {
      result = result.filter(nft => 
        !nft.image_url || 
        nft.image_url.trim() === '' || 
        nft.image_url.includes('data:image/svg+xml') // Include placeholder images
      );
    }

    // 4. Show only single NFTs (collections with only 1 NFT)
    if (filters.showOnlySingleNFTs) {
      // Count NFTs per collection
      const collectionCounts = result.reduce((acc, nft) => {
        const key = nft.collection_address || nft.contract_address;
        acc[key] = (acc[key] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);

      // Show only collections with 1 NFT
      result = result.filter(nft => {
        const key = nft.collection_address || nft.contract_address;
        return collectionCounts[key] === 1;
      });
    }

    // 5. Sort by collection
    if (filters.sortByCollection) {
      result.sort((a, b) => {
        const collectionA = (a.collection_name || '').toLowerCase();
        const collectionB = (b.collection_name || '').toLowerCase();
        
        if (collectionA === collectionB) {
          // Secondary sort by token ID
          return parseInt(a.token_id) - parseInt(b.token_id);
        }
        
        return collectionA.localeCompare(collectionB);
      });
    }

    return result;
  }, [nfts, debouncedSearchTerm, filters.showOnlyWithoutImages, filters.sortByCollection, filters.showOnlySingleNFTs, filters.showERC721, filters.showERC1155]);

  // Update individual filter options
  const updateFilter = useCallback((key: keyof NFTFilterOptions, value: boolean | string) => {
    setFilters(prev => ({
      ...prev,
      [key]: value
    }));
  }, []);

  // Reset all filters
  const resetFilters = useCallback(() => {
    setFilters({
      searchTerm: '',
      showOnlyWithoutImages: false,
      sortByCollection: false,
      showOnlySingleNFTs: false,
      showERC721: true,
      showERC1155: true,
    });
    setDebouncedSearchTerm(''); // Also reset debounced term
  }, []);

  // Get filter statistics
  const filterStats = useMemo(() => {
    const totalNFTs = nfts.length;
    const filteredCount = filteredNFTs.length;
    const hiddenCount = totalNFTs - filteredCount;
    const isFiltered = filteredCount !== totalNFTs;

    return {
      totalNFTs,
      filteredCount,
      hiddenCount,
      isFiltered
    };
  }, [nfts.length, filteredNFTs.length]);

  return {
    filters,
    filteredNFTs,
    updateFilter,
    resetFilters,
    filterStats,
    isSearching: filters.searchTerm !== debouncedSearchTerm, // Indicator for search in progress
  };
}; 