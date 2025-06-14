import { useEffect, useState, useCallback } from 'react';
import { useAccount, useChainId } from 'wagmi';
import { NFT } from '@/types/nft';
import { fetchNFTs } from '@/lib/nftApi';

interface NFTDataManagerProps {
  onNFTsLoaded: (nfts: NFT[]) => void;
  showDisclaimer: boolean; // Passed down from _app.tsx
  children: (props: {
    nfts: NFT[];
    loading: boolean;
    error: string | null;
    isConnected: boolean;
    isClient: boolean;
    updateNFTs: (newNFTs: NFT[]) => void;
    refreshNFTs: () => void;
    showDisclaimer: boolean;
  }) => React.ReactNode;
}

/**
 * Component responsible for fetching and managing NFT data
 * Follows the exact pattern of TokenDataManager but for NFTs
 */
export default function NFTDataManager({ onNFTsLoaded, showDisclaimer, children }: NFTDataManagerProps) {
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

  // Fetch NFTs function (extracted for reuse)
  const fetchNFTData = useCallback(async () => {
    if (!isConnected || !address || showDisclaimer) return;
    
    setLoading(true);
    setError(null);
    
    try {
      // Fetch NFTs from Base and Zora networks
      const supportedChains = [8453, 7777777]; // Base and Zora
      const nftItems = await fetchNFTs(address, supportedChains);
      setNFTs(nftItems);
      onNFTsLoaded(nftItems);
      
      // Log NFT image loading summary after processing completes
      const { logNFTImageLoadingSummary } = await import('../../../lib/nftApi');
      logNFTImageLoadingSummary();
    } catch (err) {
      console.error('Failed to fetch NFTs:', err);
      setError('Failed to load NFTs. Please try again.');
    } finally {
      setLoading(false);
    }
  }, [address, isConnected, onNFTsLoaded, showDisclaimer]);

  // Fetch NFTs when connected or chain changes - BUT ONLY if disclaimer is accepted
  useEffect(() => {
    fetchNFTData();
  }, [fetchNFTData, chainId]);

  // Manual refresh function
  const refreshNFTs = useCallback(() => {
    fetchNFTData();
  }, [fetchNFTData]);

  // Update NFTs when they change externally (e.g., after burning)
  const updateNFTs = (newNFTs: NFT[]) => {
    setNFTs(newNFTs);
    onNFTsLoaded(newNFTs);
  };

  return (
    <>
      {/* Only render children when disclaimer is NOT showing */}
      {(!showDisclaimer || !isClient || !isConnected) && (
        children({
          nfts,
          loading,
          error,
          isConnected,
          isClient,
          updateNFTs,
          refreshNFTs,
          showDisclaimer,
        })
      )}
    </>
  );
} 