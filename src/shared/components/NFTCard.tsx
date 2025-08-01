import React, { useState, memo } from 'react';
import Image from 'next/image';
import { NFT } from '@/types/nft';
import NFTImage from './NFTImage';
import { useSelectedItems } from '@/contexts/SelectedItemsContext';

interface NFTCardProps {
  nft: NFT;
  onNFTSelect?: (nft: NFT) => void;
  isSelected?: boolean;
  isSpam?: boolean;
  onToggle?: (contractAddress: string, tokenId: string) => void;
}

const NFTCard = memo(function NFTCard({ 
  nft, 
  onNFTSelect, 
  isSelected = false,
  isSpam = false,
  onToggle
}: NFTCardProps) {
  const [hover, setHover] = useState(false);
  
  // Use context for quantity management
  const { 
    toggleNFT, 
    getNFTSelectedQuantity, 
    incrementNFTQuantity, 
    decrementNFTQuantity 
  } = useSelectedItems();

  // Get current state from context
  const selectedQuantity = getNFTSelectedQuantity(nft.contract_address, nft.token_id);
  const isNFTSelected = selectedQuantity > 0;
  
  // Use context selection state if available, otherwise fall back to prop
  const actuallySelected = isNFTSelected || isSelected;

  const handleCardClick = () => {
    if (onNFTSelect) {
      onNFTSelect(nft);
    }
    if (onToggle) {
      onToggle(nft.contract_address, nft.token_id);
    } else {
      // Use context method if no onToggle prop provided
      toggleNFT(nft);
    }
  };
  
  // Quantity control handlers
  const handleIncrement = (e: React.MouseEvent) => {
    e.stopPropagation();
    const maxQuantity = parseInt(nft.balance || '1');
    incrementNFTQuantity(nft.contract_address, nft.token_id, maxQuantity);
  };
  
  const handleDecrement = (e: React.MouseEvent) => {
    e.stopPropagation();
    decrementNFTQuantity(nft.contract_address, nft.token_id);
  };

  // Generate display name
  const displayName = nft.name || `#${nft.token_id}`;
  const shortName = displayName.length > 20 ? displayName.substring(0, 18) + '...' : displayName;
  
  // Collection name display
  const collectionName = nft.collection_name || 'Unknown Collection';
  const shortCollectionName = collectionName.length > 15 ? collectionName.substring(0, 13) + '...' : collectionName;

  // Token standard badge
  const tokenStandard = nft.token_standard;
  const isERC1155 = tokenStandard === 'ERC1155';
  const balance = nft.balance && nft.balance !== '1' ? ` (${nft.balance})` : '';
  
  // Generate OpenSea URL
  const openSeaUrl = `https://opensea.io/assets/base/${nft.contract_address}/${nft.token_id}`;
  
  // Handle OpenSea link click
  const handleOpenSeaClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    window.open(openSeaUrl, '_blank', 'noopener,noreferrer');
  };



  return (
    <div 
      className={`relative rounded-lg cursor-pointer transition-all duration-200 group overflow-hidden ${
        actuallySelected 
          ? isSpam 
            ? 'ring-2 ring-red-400 dark:ring-red-500 shadow-lg transform scale-[1.02]'
            : 'ring-2 ring-blue-400 dark:ring-blue-500 shadow-lg transform scale-[1.02]' 
          : hover 
            ? 'shadow-md transform scale-[1.01]' 
            : 'shadow-sm hover:shadow-md'
      }`}
      onClick={handleCardClick}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
    >
      {/* Image Container */}
      <div className="relative aspect-square bg-gray-100 dark:bg-gray-800 overflow-hidden">
        <NFTImage 
          tokenId={nft.token_id}
          name={nft.name}
          imageUrl={nft.image_url}
        />
        
        {/* Selection Indicator */}
        {actuallySelected && (
          <div className={`absolute top-2 right-2 w-6 h-6 rounded-full flex items-center justify-center ${
            isSpam ? 'bg-red-500' : 'bg-blue-500'
          } text-white shadow-md`}>
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
            </svg>
          </div>
        )}

        {/* Token Standard Badge */}
        <div className="absolute top-2 left-2">
          <span className={`px-2 py-1 rounded text-xs font-medium ${
            isERC1155 
              ? 'bg-purple-500/90 text-white' 
              : 'bg-green-500/90 text-white'
          }`}>
            {tokenStandard}
          </span>
        </div>

        {/* ERC1155 Balance Badge */}
        {isERC1155 && nft.balance && nft.balance !== '1' && (
          <div className="absolute bottom-2 right-2">
            <span className="bg-black/70 text-white px-2 py-1 rounded text-xs font-medium">
              ×{nft.balance}
            </span>
          </div>
        )}

        {/* Spam Indicator */}
        {isSpam && (
          <div className="absolute inset-0 bg-red-500/20 flex items-center justify-center">
            <div className="bg-red-500 text-white px-2 py-1 rounded-full text-xs font-bold">
              SPAM
            </div>
          </div>
        )}

        {/* Quantity Controls Overlay (for selected ERC-1155s with balance > 1) */}
        {actuallySelected && isERC1155 && parseInt(nft.balance || '1') > 1 && (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="bg-blue-500/80 backdrop-blur-sm px-3 py-2 rounded-lg">
              <div className="flex items-center justify-center gap-3">
                <button
                  onClick={handleDecrement}
                  className="w-6 h-6 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center text-white transition-colors"
                  title="Decrease quantity"
                >
                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
                  </svg>
                </button>
                <span className="text-sm font-bold text-white min-w-[16px] text-center">
                  {selectedQuantity}
                </span>
                <button
                  onClick={handleIncrement}
                  className="w-6 h-6 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center text-white transition-colors"
                  disabled={selectedQuantity >= parseInt(nft.balance || '1')}
                  title="Increase quantity"
                >
                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                  </svg>
                </button>
              </div>
            </div>
          </div>
        )}

      </div>

            {/* Info Container */}
      <div className="p-3 bg-white dark:bg-gray-800">
        {/* NFT Name */}
        <div className="font-medium text-gray-900 dark:text-gray-100 text-sm mb-1 truncate" title={displayName}>
          {shortName}
        </div>
        
        {/* Collection Name */}
        <div className="text-xs text-gray-500 dark:text-gray-400 truncate mb-2" title={collectionName}>
          {shortCollectionName}
        </div>



        {/* Additional Info Row */}
        <div className="flex justify-between items-center text-xs">
          <div className="text-gray-500 dark:text-gray-400">
            #{nft.token_id}{balance}
          </div>
          <div className="flex items-center gap-2">
            {nft.floor_price && (
              <div className="text-green-600 dark:text-green-400 font-medium">
                {nft.floor_price} ETH
              </div>
            )}
            
            {/* OpenSea Link */}
            <button
              onClick={handleOpenSeaClick}
              className="w-5 h-5 opacity-70 hover:opacity-100 transition-opacity duration-200 flex-shrink-0"
              title="View on OpenSea"
            >
              <Image 
                src="/opensealogo.png" 
                alt="OpenSea" 
                width={20} 
                height={20}
                className="w-full h-full rounded-full"
              />
            </button>
          </div>
        </div>

        {/* Rarity Rank (if available) */}
        {nft.rarity_rank && (
          <div className="mt-2 pt-2 border-t border-gray-200 dark:border-gray-700">
            <div className="text-xs text-gray-600 dark:text-gray-300">
              Rank #{nft.rarity_rank}
            </div>
          </div>
        )}
      </div>

      {/* Hover Overlay */}
      {hover && !actuallySelected && (
        <div className="absolute inset-0 bg-blue-500/10 pointer-events-none transition-opacity duration-200" />
      )}
    </div>
  );
});

export default NFTCard; 