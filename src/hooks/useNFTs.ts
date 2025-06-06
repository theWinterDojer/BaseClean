import { useEffect, useState, useCallback } from 'react';
import { useAccount, useChainId } from 'wagmi';
import { NFT } from '@/types/nft';
import { fetchNFTs } from '@/lib/nftApi';
import { NFT_UI_TEXT } from '@/constants/nfts';

/**
 * Custom hook for fetching and managing NFT data
 * Follows the same pattern as TokenDataManager but for NFTs
 * 
 * @returns Object with NFT data, loading state, error handling, and utility functions
 */
export function useNFTs() {
  const { address, isConnected } = useAccount();
  const chainId = useChainId();
  const [nfts, setNFTs] = useState<NFT[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isClient, setIsClient] = useState(false);

  // Set isClient to true once component mounts in the client
  useEffect(() => {
    setIsClient(true);
  }, []);

  // Fetch NFTs when connected or chain changes
  const fetchNFTData = useCallback(async () => {
    if (!isConnected || !address) return;
    
    setLoading(true);
    setError(null);
    
    try {
      console.log('Fetching NFTs for address:', address);
      // Fetch NFTs from Base and Zora networks
      const supportedChains = [8453, 7777777]; // Base and Zora
      const nftItems = await fetchNFTs(address, supportedChains);
      setNFTs(nftItems);
      console.log(`Successfully loaded ${nftItems.length} NFTs`);
    } catch (err) {
      console.error('Failed to fetch NFTs:', err);
      setError('Failed to load NFTs. Please try again.');
    } finally {
      setLoading(false);
    }
  }, [address, isConnected, chainId]);

  // Auto-fetch NFTs when wallet connection changes
  useEffect(() => {
    fetchNFTData();
  }, [fetchNFTData]);

  // Manual refresh function
  const refreshNFTs = useCallback(() => {
    fetchNFTData();
  }, [fetchNFTData]);

  // Update NFTs when they change externally (e.g., after burning)
  const updateNFTs = useCallback((newNFTs: NFT[]) => {
    setNFTs(newNFTs);
  }, []);

  // Clear NFTs (e.g., when disconnecting wallet)
  const clearNFTs = useCallback(() => {
    setNFTs([]);
    setError(null);
  }, []);

  // Effect to clear NFTs when wallet disconnects
  useEffect(() => {
    if (!isConnected) {
      clearNFTs();
    }
  }, [isConnected, clearNFTs]);

  return {
    nfts,
    loading,
    error,
    isConnected,
    isClient,
    refreshNFTs,
    updateNFTs,
    clearNFTs,
    // Utility values
    hasNFTs: nfts.length > 0,
    nftCount: nfts.length,
  };
}

/**
 * Hook variant that follows the TokenDataManager pattern more closely
 * Useful for components that need the callback pattern
 */
export function useNFTsWithCallback(onNFTsLoaded: (nfts: NFT[]) => void) {
  const { address, isConnected } = useAccount();
  const chainId = useChainId();
  const [nfts, setNFTs] = useState<NFT[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isClient, setIsClient] = useState(false);

  // Set isClient to true once component mounts in the client
  useEffect(() => {
    setIsClient(true);
  }, []);

  // Fetch NFTs when connected or chain changes
  useEffect(() => {
    if (!isConnected || !address) return;
    
    const getNFTs = async () => {
      setLoading(true);
      setError(null);
      
      try {
        // Fetch NFTs from Base and Zora networks
        const supportedChains = [8453, 7777777]; // Base and Zora
        const nftItems = await fetchNFTs(address, supportedChains);
        setNFTs(nftItems);
        onNFTsLoaded(nftItems);
      } catch (err) {
        console.error('Failed to fetch NFTs:', err);
        setError('Failed to load NFTs. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    getNFTs();
  }, [address, isConnected, chainId, onNFTsLoaded]);

  // Update NFTs when they change externally (e.g., after burning)
  const updateNFTs = (newNFTs: NFT[]) => {
    setNFTs(newNFTs);
    onNFTsLoaded(newNFTs);
  };

  return {
    nfts,
    loading,
    error,
    isConnected,
    isClient,
    updateNFTs,
  };
}

/**
 * Simple hook for NFT statistics
 */
export function useNFTStatistics(nfts: NFT[]) {
  return {
    totalNFTs: nfts.length,
    totalCollections: new Set(nfts.map(nft => nft.collection_address)).size,
    erc721Count: nfts.filter(nft => nft.token_standard === 'ERC721').length,
    erc1155Count: nfts.filter(nft => nft.token_standard === 'ERC1155').length,
    collectionsMap: nfts.reduce((acc, nft) => {
      const collection = nft.collection_address;
      if (!acc[collection]) {
        acc[collection] = {
          name: nft.collection_name || 'Unknown Collection',
          address: collection,
          count: 0,
          nfts: []
        };
      }
      acc[collection].count++;
      acc[collection].nfts.push(nft);
      return acc;
    }, {} as Record<string, {
      name: string;
      address: string;
      count: number;
      nfts: NFT[];
    }>)
  };
} 