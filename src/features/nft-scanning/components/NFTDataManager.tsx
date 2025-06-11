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
      {/* Disclaimer acceptance required message - show instead of children when disclaimer is active */}
      {isClient && isConnected && showDisclaimer && (
        <div className="bg-yellow-900/30 border border-yellow-700 text-white p-5 rounded-lg flex items-center justify-center mt-4">
          <div className="text-center">
            <div className="flex items-center justify-center mb-2">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-yellow-400 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
              <span className="text-lg font-medium">Please Acknowledge Disclaimer</span>
            </div>
            <p className="text-gray-300">
              Please read and accept the disclaimer to start scanning your NFTs.
            </p>
          </div>
        </div>
      )}

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