// NFT value thresholds for filtering (user-controlled)
export const NFT_VALUE_THRESHOLDS = [0.01, 0.1, 1, 10]; // ETH values

// Minimum floor price (in ETH) for an NFT collection to be considered valuable
export const MIN_VALUABLE_NFT_FLOOR_PRICE = 0.001;

// NFT burn confirmation messages
export const NFT_BURN_MESSAGES = {
  CONFIRM_VALUABLE: 'You\'re about to burn NFTs potentially worth {{value}} ETH! Are you sure?',
  CONFIRM_REGULAR: 'Burning {{count}} NFT(s) with no significant floor price.',
  SUCCESS: 'Successfully burned {{count}} NFT(s).',
  ERROR: 'Error burning NFTs: {{error}}',
  MIXED_ITEMS: 'Burning {{tokenCount}} token(s) and {{nftCount}} NFT(s).',
};

// NFT UI text constants
export const NFT_UI_TEXT = {
  CONNECT_WALLET: 'Please connect your wallet to view your NFT collection',
  LOADING: 'Loading your NFT collection...',
  NO_NFTS: 'No NFTs found in this wallet',
  NO_SPAM_NFTS: 'No spam NFTs detected with current filters',
  NO_REGULAR_NFTS: 'No regular NFTs match current filters',
  COLLECTION_STATS: '{{count}} NFTs from {{collections}} collections',
  FILTER_RESULTS: 'Showing {{visible}} of {{total}} NFTs',
};

// NFT image sources for fallbacks - only real image APIs, no generic fallbacks
export const NFT_IMAGE_SOURCES = [
  // 1. Alchemy NFT Media API - Primary source
  (contractAddress: string, tokenId: string) => 
    `https://base-mainnet.g.alchemy.com/nft/v3/media/${contractAddress}/${tokenId}`,
  
  // Note: No generic SVG fallback - NFTs without images should show "No image" UI
  // This allows the "show NFTs without images" filter to work properly
];

// Maximum number of NFTs to display per page (for performance)
export const NFT_PAGINATION = {
  ITEMS_PER_PAGE: 24, // Grid-friendly number
  LAZY_LOAD_THRESHOLD: 5, // Load more when user is 5 items from end
  MAX_INITIAL_LOAD: 100, // Maximum NFTs to load initially
}; 