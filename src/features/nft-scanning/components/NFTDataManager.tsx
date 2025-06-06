import { useEffect, useState } from 'react';
import { useAccount, useChainId } from 'wagmi';
import { NFT } from '@/types/nft';
import { fetchNFTs } from '@/lib/nftApi';
import { NFT_UI_TEXT } from '@/constants/nfts';

interface NFTDataManagerProps {
  onNFTsLoaded: (nfts: NFT[]) => void;
  children: (props: {
    nfts: NFT[];
    loading: boolean;
    error: string | null;
    isConnected: boolean;
    isClient: boolean;
    updateNFTs: (newNFTs: NFT[]) => void;
  }) => React.ReactNode;
}

/**
 * Component responsible for fetching and managing NFT data
 * Follows the exact pattern of TokenDataManager but for NFTs
 */
export default function NFTDataManager({ onNFTsLoaded, children }: NFTDataManagerProps) {
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

  return (
    <>
      {children({
        nfts,
        loading,
        error,
        isConnected,
        isClient,
        updateNFTs,
      })}
    </>
  );
} 