/**
 * Represents an NFT with its metadata and properties
 */
export type NFT = {
  /** Contract address of the NFT collection */
  contract_address: string;
  /** Unique token ID within the collection */
  token_id: string;
  /** NFT standard type */
  token_standard: 'ERC721' | 'ERC1155';
  /** NFT name/title */
  name?: string;
  /** NFT description */
  description?: string;
  /** URL to the NFT image - null when no real image is available */
  image_url?: string | null;
  /** Collection name */
  collection_name?: string;
  /** Collection contract address (same as contract_address for most cases) */
  collection_address: string;
  /** Balance/quantity (mainly for ERC1155, usually "1" for ERC721) */
  balance?: string;
  /** Additional metadata from the NFT */
  metadata?: Record<string, unknown>;
  /** Collection logo URL */
  collection_logo_url?: string;
  /** Floor price information if available */
  floor_price?: number;
  /** Last sale price if available */
  last_sale_price?: number;
  /** Rarity rank if available */
  rarity_rank?: number;
  /** Token URI for metadata */
  token_uri?: string;
};

/**
 * Union type for items that can be burned (tokens or NFTs)
 */
export type BurnableItem = {
  type: 'token';
  data: import('@/types/token').Token;
} | {
  type: 'nft';
  data: NFT;
};

/**
 * Helper type for creating burnable items
 */
export type BurnableItemToken = {
  type: 'token';
  data: import('@/types/token').Token;
};

export type BurnableItemNFT = {
  type: 'nft';
  data: NFT;
};



/**
 * Statistics about NFT distribution
 */
export type NFTStatistics = {
  /** Total number of NFTs in wallet */
  totalNFTs: number;
  /** Number of different collections */
  totalCollections: number;
  /** Number of ERC-721 NFTs */
  erc721Count: number;
  /** Number of ERC-1155 NFTs */
  erc1155Count: number;
  /** Number of currently selected NFTs */
  selectedNFTs: number;
  /** Total estimated value of selected NFTs */
  selectedValue?: number;
  /** Total estimated value of all NFTs */
  totalValue?: number;
};



/**
 * Combined statistics for tokens and NFTs
 */
export type WalletStatistics = {
  /** Token statistics */
  tokens: import('@/types/token').TokenStatistics;
  /** NFT statistics */
  nfts: NFTStatistics;
  /** Combined selected items count */
  totalSelectedItems: number;
}; 