import React, { useState, useEffect } from 'react';
import { NFT } from '@/types/nft';
import NFTCard from '@/shared/components/NFTCard';
import NFTImage from '@/shared/components/NFTImage';
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
  processedNFTs?: NFT[]; // NFTs loaded so far for cycling display
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
  processedNFTs = []
}: NFTListsContainerProps) {
  const [currentNFTIndex, setCurrentNFTIndex] = useState(0);
  const [dots, setDots] = useState('');
  
  // Animate dots during loading
  useEffect(() => {
    if (!loading) return;
    
    const dotInterval = setInterval(() => {
      setDots(prev => {
        if (prev === '...') return '';
        return prev + '.';
      });
    }, 500);

    return () => clearInterval(dotInterval);
  }, [loading]);

  // Cycle through loaded NFT images
  useEffect(() => {
    if (processedNFTs.length > 1) {
      const imageInterval = setInterval(() => {
        setCurrentNFTIndex(prev => (prev + 1) % processedNFTs.length);
      }, 800); // Show each NFT for 800ms (matches token screen timing)

      return () => clearInterval(imageInterval);
    }
  }, [processedNFTs.length]);
  
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

  // Get current NFT for display
  const currentNFT = processedNFTs[currentNFTIndex];

  // Loading state
  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-8 relative">
        {/* Balanced Wavery Scanning Pattern Background - Constrained to 60vh */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          {/* Balanced horizontal wavy scanning patterns */}
          <div className="absolute inset-0">
            {/* Primary balanced wavy scanning line */}
            <div className="absolute w-full h-1.5 animate-wavy-scan-1" style={{ top: '20%' }}>
              <div className="w-full h-full bg-gradient-to-r from-transparent via-blue-400/35 to-transparent animate-wave-flow-1"
                   style={{ 
                     clipPath: 'polygon(0% 50%, 8% 30%, 16% 70%, 24% 35%, 32% 65%, 40% 40%, 48% 60%, 56% 45%, 64% 55%, 72% 35%, 80% 65%, 88% 40%, 96% 60%, 100% 50%, 100% 100%, 0% 100%)'
                   }}></div>
            </div>
            
            {/* Secondary balanced wavy scanning line */}
            <div className="absolute w-full h-1.5 animate-wavy-scan-2" style={{ top: '45%', animationDelay: '2s' }}>
              <div className="w-full h-full bg-gradient-to-r from-transparent via-green-400/30 to-transparent animate-wave-flow-2"
                   style={{ 
                     clipPath: 'polygon(0% 50%, 12% 65%, 20% 35%, 28% 70%, 36% 30%, 44% 60%, 52% 40%, 60% 65%, 68% 35%, 76% 70%, 84% 30%, 92% 60%, 100% 50%, 100% 100%, 0% 100%)'
                   }}></div>
            </div>
            
            {/* Tertiary balanced wavy scanning line */}
            <div className="absolute w-full h-1 animate-wavy-scan-3" style={{ top: '70%', animationDelay: '4s' }}>
              <div className="w-full h-full bg-gradient-to-r from-transparent via-blue-300/25 to-transparent animate-wave-flow-3"
                   style={{ 
                     clipPath: 'polygon(0% 50%, 10% 45%, 20% 55%, 30% 40%, 40% 60%, 50% 50%, 60% 40%, 70% 60%, 80% 45%, 90% 55%, 100% 50%, 100% 100%, 0% 100%)'
                   }}></div>
            </div>
            
            {/* Fourth balanced wavy scanning line */}
            <div className="absolute w-full h-1 animate-wavy-scan-4" style={{ top: '85%', animationDelay: '6s' }}>
              <div className="w-full h-full bg-gradient-to-r from-transparent via-green-300/20 to-transparent animate-wave-flow-4"
              style={{
                     clipPath: 'polygon(0% 50%, 14% 60%, 28% 40%, 42% 65%, 56% 35%, 70% 55%, 84% 45%, 100% 50%, 100% 100%, 0% 100%)'
                   }}></div>
            </div>
          </div>
          
          {/* Balanced analysis lines */}
          <div className="absolute inset-0">
            <div className="absolute h-full w-0.5 bg-gradient-to-b from-transparent via-blue-400/15 to-transparent animate-analysis-line-1" 
                 style={{ left: '20%' }}></div>
            <div className="absolute h-full w-0.5 bg-gradient-to-b from-transparent via-green-400/12 to-transparent animate-analysis-line-2" 
                 style={{ left: '50%', animationDelay: '3s' }}></div>
            <div className="absolute h-full w-0.5 bg-gradient-to-b from-transparent via-blue-300/10 to-transparent animate-analysis-line-3" 
                 style={{ left: '80%', animationDelay: '6s' }}></div>
          </div>
          
          {/* Dual breathing circles - Centered within 60vh */}
          <div className="absolute inset-0 flex items-center justify-center">
            {/* Primary breathing circle - slower and larger */}
            <div className="absolute w-48 h-48 border border-blue-400/6 rounded-full animate-pulse-gentle" 
                 style={{ animationDuration: '6s' }}></div>
            {/* Secondary larger breathing circle - more subtle, starts simultaneously */}
            <div className="absolute w-80 h-80 border border-green-400/2 rounded-full animate-pulse-gentle" 
                 style={{ animationDuration: '8s' }}></div>
          </div>
          
          {/* Synchronized orbital elements - Centered within 60vh */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="relative">
              {/* Three orbital dots with enhanced visibility */}
              <div className="animate-orbit-small">
                <div className="w-2 h-2 bg-blue-400/60 rounded-full shadow-sm shadow-blue-400/20"></div>
              </div>
              <div className="animate-orbit-medium">
                <div className="w-1.5 h-1.5 bg-green-400/50 rounded-full shadow-sm shadow-green-400/15"></div>
              </div>
              <div className="animate-orbit-large">
                <div className="w-1 h-1 bg-blue-300/70 rounded-full shadow-sm shadow-blue-300/25"></div>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content - Layered over background within same 60vh container */}
        <div className="relative z-10 flex flex-col items-center justify-center space-y-8">
          {/* Main Loading Icon with NFT Image Cycling */}
          <div className="relative">
            {/* Animated gradient background */}
            <div className="w-20 h-20 bg-gradient-to-r from-blue-500 to-green-500 rounded-full flex items-center justify-center animate-pulse">
              <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center overflow-hidden">
                {currentNFT ? (
                  <div className="w-10 h-10 rounded-lg overflow-hidden bg-gray-100 relative">
                    <NFTImage
                      tokenId={currentNFT.token_id}
                      name={currentNFT.name}
                      imageUrl={currentNFT.image_url}
                    />
                  </div>
                ) : (
                  <svg 
                    className="w-8 h-8 text-blue-600 animate-spin" 
                    fill="none" 
                    viewBox="0 0 24 24"
                  >
                    <circle 
                      className="opacity-25" 
                      cx="12" 
                      cy="12" 
                      r="10" 
                      stroke="currentColor" 
                      strokeWidth="4"
                    />
                    <path 
                      className="opacity-75" 
                      fill="currentColor" 
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    />
                  </svg>
                )}
              </div>
            </div>
          
            {/* Rotating rings */}
            <div className="absolute inset-0 w-20 h-20 border-4 border-transparent border-t-blue-400 rounded-full animate-spin"></div>
            <div className="absolute inset-2 w-16 h-16 border-4 border-transparent border-r-green-400 rounded-full animate-spin-slow"></div>
          </div>

          {/* Smart Loading Messages */}
          <div className="text-center space-y-4">
            <h2 className="text-2xl font-bold text-white">
              {processedNFTs.length > 0 ? `Discovered ${processedNFTs.length} NFTs` : 'Loading your NFT collection'}
            </h2>
            
            <p className="text-lg text-gray-300 min-h-[28px] transition-all duration-300">
              Discovering NFTs on Base and Zora networks
              <span className="inline-block w-6 text-left">{dots}</span>
            </p>
            
            {/* Dynamic Progress Bar */}
            <div className="w-64 mx-auto bg-gray-700 rounded-full h-2 overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-blue-500 to-green-500 rounded-full transition-all duration-500"
                style={{ 
                  width: processedNFTs.length === 0 ? '20%' :
                         processedNFTs.length < totalNFTs * 0.5 ? '40%' :
                         processedNFTs.length < totalNFTs * 0.8 ? '70%' : '95%'
                }}
              />
            </div>
            
            {/* NFT Preview Strip */}
            {processedNFTs.length > 0 && (
              <div className="flex justify-center space-x-2 mt-4">
                {processedNFTs.slice(0, 6).map((nft, index) => (
                  <div 
                    key={`${nft.contract_address}-${nft.token_id}`}
                    className={`w-8 h-8 rounded-lg transition-all duration-300 ${
                      index === currentNFTIndex ? 'scale-110 ring-2 ring-blue-400 ring-offset-1 ring-offset-gray-900' : ''
                    }`}
                  >
                    <div className="w-8 h-8 rounded-lg overflow-hidden bg-gray-700 relative">
                      <NFTImage
                        tokenId={nft.token_id}
                        name={nft.name}
                        imageUrl={nft.image_url}
                      />
                    </div>
                  </div>
                ))}
                {processedNFTs.length > 6 && (
                  <div className="w-8 h-8 rounded-lg bg-gray-700 flex items-center justify-center text-white text-xs">
                    +{processedNFTs.length - 6}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
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
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <div className="mb-4">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-gray-400 mx-auto mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1-1H8a1 1 0 00-1 1v3M4 7h16" />
            </svg>
          </div>
          <span className="text-xl font-medium text-white">Connect your wallet to start using BaseClean.</span>
        </div>
      </div>
    );
  }

  // No NFTs state - distinguish between no NFTs at all vs filtered out
  if (totalNFTs === 0) {
    // Actually no NFTs in wallet
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <div className="mb-4">
            <svg className="w-16 h-16 text-gray-400 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </div>
          <p className="text-xl font-medium text-white mb-2">No NFTs found</p>
          <p className="text-gray-300 text-sm">Your wallet doesn&apos;t contain any NFTs on Base or Zora networks</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
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