import React, { useState, memo } from 'react';
import { NFT } from '@/types/nft';
import NFTImage from './NFTImage';

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

  const handleCardClick = () => {
    if (onNFTSelect) {
      onNFTSelect(nft);
    }
    if (onToggle) {
      onToggle(nft.contract_address, nft.token_id);
    }
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
        isSelected 
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
          contractAddress={nft.contract_address}
          tokenId={nft.token_id}
          name={nft.name}
          isSpam={isSpam}
          imageUrl={nft.image_url}
        />
        
        {/* Selection Indicator */}
        {isSelected && (
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
              <svg
                viewBox="0 0 90 90"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                className="w-full h-full"
              >
                {/* Blue circular background */}
                <circle cx="45" cy="45" r="45" fill="#2081E2"/>
                {/* White OpenSea ship logo */}
                <path
                  d="M22.2011 46.512L22.3953 46.2069L34.1016 27.8939C34.2726 27.6257 34.6749 27.6535 34.8043 27.9447C36.76 32.3277 38.4475 37.7786 37.6569 41.1721C37.3194 42.5683 36.3948 44.4593 35.3545 46.2069C35.2204 46.4612 35.0725 46.7109 34.9153 46.9513C34.8413 47.0622 34.7165 47.127 34.5824 47.127H22.5432C22.2196 47.127 22.0301 46.7756 22.2011 46.512Z"
                  fill="white"
                />
                <path
                  d="M74.38 49.9149V52.8137C74.38 52.9801 74.2783 53.1281 74.1304 53.1928C73.2242 53.5812 70.1219 55.0052 68.832 56.799C65.5402 61.3807 63.0251 67.932 57.4031 67.932H33.949C25.6362 67.932 18.9 61.1727 18.9 52.8322V52.564C18.9 52.3421 19.0803 52.1618 19.3023 52.1618H32.377C32.6359 52.1618 32.8255 52.4022 32.8024 52.6565C32.7099 53.5072 32.8671 54.3764 33.2693 55.167C34.0461 56.7435 35.655 57.7283 37.3934 57.7283H43.866V52.675H37.4673C37.1391 52.675 36.9449 52.2959 37.1345 52.0277C37.2038 51.9214 37.2824 51.8104 37.3656 51.6856C37.9713 50.8257 38.8358 49.4895 39.6958 47.9684C40.2829 46.9421 40.8516 45.8463 41.3093 44.746C41.4018 44.5472 41.4758 44.3438 41.5497 44.1449C41.6746 43.7936 41.7857 43.4608 41.8784 43.1419C41.9665 42.8508 42.0269 42.5551 42.0731 42.2639C42.1655 41.5976 42.1748 40.9498 42.1071 40.3295C42.0824 40.0476 42.0485 39.7564 42.0192 39.4745C41.9945 39.2371 41.9607 38.9905 41.9422 38.7531C41.8969 38.1651 41.8878 37.6079 41.9422 37.0738C41.9607 36.8226 42.0007 36.5806 42.0269 36.3294C42.0592 36.0135 42.1007 35.7022 42.1655 35.3955C42.2073 35.2106 42.2491 35.031 42.3063 34.8469C42.4081 34.4819 42.5284 34.1261 42.6487 33.7564C42.7136 33.5715 42.7692 33.3866 42.8387 33.2109C43.2901 32.0691 43.8679 31.0151 44.746 30.1875C45.0034 29.9363 45.2562 29.7283 45.5136 29.5434C45.7618 29.3677 46.0007 29.2012 46.2488 29.0533C46.5201 28.9009 46.7959 28.758 47.0671 28.6289C47.2613 28.5326 47.4648 28.4409 47.6637 28.3583C47.9442 28.2479 48.2294 28.1467 48.5238 28.0824C48.7227 28.0363 48.9262 27.9902 49.1251 27.9626C49.2223 27.9441 49.3149 27.9302 49.4075 27.9208L49.8497 27.8515L50.2734 27.8193C50.3706 27.8101 50.4632 27.8054 50.5604 27.8054H52.9763C53.0735 27.8054 53.1707 27.8101 53.2587 27.8193L53.6824 27.8515L54.1246 27.9208C54.2172 27.9302 54.3098 27.9441 54.407 27.9626C54.6059 27.9902 54.8094 28.0363 55.0083 28.0824C55.3027 28.1467 55.5879 28.2479 55.8684 28.3583C56.0673 28.4409 56.2708 28.5326 56.465 28.6289C56.7362 28.758 57.012 28.9009 57.2833 29.0533C57.5314 29.2012 57.7703 29.3677 58.0185 29.5434C58.2759 29.7283 58.5287 29.9363 58.7861 30.1875C59.6642 31.0151 60.242 32.0691 60.6934 33.2109C60.7629 33.3866 60.8185 33.5715 60.8834 33.7564C61.0037 34.1261 61.124 34.4819 61.2258 34.8469C61.283 35.031 61.3248 35.2106 61.3666 35.3955C61.4314 35.7022 61.4729 36.0135 61.5052 36.3294C61.5314 36.5806 61.5714 36.8226 61.5899 37.0738C61.6443 37.6079 61.6352 38.1651 61.5899 38.7531C61.5714 38.9905 61.5376 39.2371 61.5129 39.4745C61.4836 39.7564 61.4497 40.0476 61.425 40.3295C61.3573 40.9498 61.3666 41.5976 61.459 42.2639C61.5052 42.5551 61.5656 42.8508 61.6537 43.1419C61.7464 43.4608 61.8575 43.7936 61.9824 44.1449C62.0563 44.3438 62.1303 44.5472 62.2228 44.746C62.6805 45.8463 63.2492 46.9421 63.8363 47.9684C64.6963 49.4895 65.5608 50.8257 66.1665 51.6856C66.2497 51.8104 66.3283 51.9214 66.3976 52.0277C66.5872 52.2959 66.393 52.675 66.0648 52.675H59.6661V57.7283H66.1388C67.8772 57.7283 69.486 56.7435 70.2629 55.167C70.665 54.3764 70.8222 53.5072 70.7298 52.6565C70.7067 52.4022 70.8962 52.1618 71.1551 52.1618H84.2299C84.4519 52.1618 84.6322 52.3421 84.6322 52.564V52.8322C84.6322 61.1727 77.896 67.932 69.5832 67.932H46.1288C40.5068 67.932 37.9917 61.3807 34.7 56.799C33.4101 55.0052 30.3078 53.5812 29.4016 53.1928C29.2537 53.1281 29.152 52.9801 29.152 52.8137V49.9149C29.152 49.5497 29.4524 49.2493 29.8176 49.2493H74.0647C74.4299 49.2493 74.7302 49.5497 74.7302 49.9149H74.38Z"
                  fill="white"
                />
              </svg>
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
      {hover && !isSelected && (
        <div className="absolute inset-0 bg-blue-500/10 pointer-events-none transition-opacity duration-200" />
      )}
    </div>
  );
});

export default NFTCard; 