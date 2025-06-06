import React from 'react';
import { NFT } from '@/types/nft';
import NFTImage from '@/shared/components/NFTImage';

interface NFTBurnConfirmationModalProps {
  nfts: NFT[];
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
}

export default function NFTBurnConfirmationModal({
  nfts,
  isOpen,
  onClose,
  onConfirm
}: NFTBurnConfirmationModalProps) {
  if (!isOpen) return null;

  const totalNFTs = nfts.length;
  const erc721Count = nfts.filter(nft => nft.token_standard === 'ERC721').length;
  const erc1155Count = nfts.filter(nft => nft.token_standard === 'ERC1155').length;

  // Group NFTs by collection for better display
  const groupedNFTs = nfts.reduce((groups, nft) => {
    const collectionName = nft.collection_name || 'Unknown Collection';
    if (!groups[collectionName]) {
      groups[collectionName] = [];
    }
    groups[collectionName].push(nft);
    return groups;
  }, {} as Record<string, NFT[]>);

  const collectionCount = Object.keys(groupedNFTs).length;

  return (
    <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4">
      <div className="bg-gray-900 rounded-lg border border-gray-700 shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <h2 className="text-xl font-bold text-white mb-4 flex items-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-yellow-500 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            Burn NFTs Confirmation
          </h2>
          
          <div className="bg-red-900/30 border border-red-700 rounded-md p-4 mb-6">
            <p className="text-white font-medium">⚠️ WARNING: This action is irreversible!</p>
            <p className="text-gray-300 text-sm mt-1">
              Once NFTs are burned, they cannot be recovered. Please review the NFTs below carefully before proceeding.
            </p>
          </div>

          {/* NFT Value Warning */}
          <div className="bg-yellow-900/30 border border-yellow-700 rounded-md p-4 mb-6">
            <p className="text-white font-medium">💎 NFT Value Notice</p>
            <p className="text-gray-300 text-sm mt-1">
              NFTs may have significant value. Consider checking OpenSea for floor prices before burning. 
              Each NFT card has an OpenSea link for quick value verification.
            </p>
          </div>

          <div className="mb-6">
            <h3 className="text-white font-medium mb-2">Summary:</h3>
            <div className="bg-gray-800 rounded-md p-3">
              <p className="text-gray-200">Total NFTs to burn: <span className="font-medium text-white">{totalNFTs}</span></p>
              <p className="text-gray-200">Collections affected: <span className="font-medium text-white">{collectionCount}</span></p>
              <div className="flex gap-4 mt-2">
                <p className="text-gray-400 text-sm">ERC-721: {erc721Count}</p>
                <p className="text-gray-400 text-sm">ERC-1155: {erc1155Count}</p>
              </div>
            </div>
          </div>

          <div className="mb-6">
            <h3 className="text-white font-medium mb-2">NFTs to be burned:</h3>
            <div className="bg-gray-800 rounded-md p-3 max-h-80 overflow-y-auto">
              {Object.entries(groupedNFTs).map(([collectionName, collectionNFTs]) => (
                <div key={collectionName} className="mb-4 last:mb-0">
                  <h4 className="text-blue-400 font-medium text-sm mb-2 border-b border-gray-600 pb-1">
                    {collectionName} ({collectionNFTs.length} NFT{collectionNFTs.length > 1 ? 's' : ''})
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {collectionNFTs.map((nft) => (
                      <div key={`${nft.contract_address}-${nft.token_id}`} className="flex items-center space-x-3 bg-gray-700/50 rounded-lg p-3">
                        <div className="w-12 h-12 flex-shrink-0 relative rounded-md overflow-hidden">
                          <NFTImage
                            contractAddress={nft.contract_address}
                            tokenId={nft.token_id}
                            name={nft.name}
                            imageUrl={nft.image_url}
                          />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="text-white font-medium text-sm truncate">
                            {nft.name || `#${nft.token_id}`}
                          </div>
                          <div className="text-gray-400 text-xs">
                            {nft.token_standard} • Token ID: {nft.token_id}
                          </div>
                          {nft.balance && nft.balance !== '1' && (
                            <div className="text-gray-400 text-xs">
                              Quantity: {nft.balance}
                            </div>
                          )}
                        </div>
                        <div className="flex-shrink-0">
                          <a
                            href={`https://opensea.io/assets/base/${nft.contract_address}/${nft.token_id}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center justify-center w-8 h-8 bg-blue-600 hover:bg-blue-500 rounded-full transition-colors"
                            title="View on OpenSea"
                          >
                            <svg className="w-4 h-4 text-white" viewBox="0 0 24 24" fill="currentColor">
                              <circle cx="12" cy="12" r="10"/>
                              <path d="M8.5 14.5L12 6l3.5 8.5H8.5z" fill="white"/>
                            </svg>
                          </a>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Zero Approval Info */}
          <div className="bg-blue-900/30 border border-blue-700 rounded-md p-4 mb-6">
            <p className="text-white font-medium">🔐 Zero-Approval Burning</p>
            <p className="text-gray-300 text-sm mt-1">
              Each NFT will be transferred directly to the burn address using your selected NFTs. No approvals required - just {totalNFTs} simple transfer transaction{totalNFTs > 1 ? 's' : ''}.
            </p>
          </div>

          {/* Cancel button on left, Burn button on right for safety */}
          <div className="flex gap-3">
            <button
              type="button"
              className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-md transition-colors"
              onClick={onClose}
            >
              Cancel
            </button>
            <button
              type="button"
              className="px-4 py-2 bg-red-600 hover:bg-red-500 text-white rounded-md transition-colors ml-auto flex items-center"
              onClick={onConfirm}
            >
              Burn {totalNFTs} NFT{totalNFTs > 1 ? 's' : ''}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
} 