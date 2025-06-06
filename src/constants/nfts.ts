// NFT value thresholds for filtering
export const NFT_VALUE_THRESHOLDS = [0.01, 0.1, 1, 10]; // ETH values

// Minimum floor price (in ETH) for an NFT collection to be considered valuable
export const MIN_VALUABLE_NFT_FLOOR_PRICE = 0.001;

// Types for legitimate NFT collections
type AddressMap = Record<string, boolean>;
type LegitimateCollectionMap = Record<number, AddressMap>;

// Whitelist of legitimate NFT collections that should never be flagged as spam
export const LEGITIMATE_NFT_COLLECTIONS: LegitimateCollectionMap = {
  // Base chain (8453)
  8453: {
    // Add known legitimate Base NFT collections here
    // Example: '0x1234...': true,
  }
};

// Common spam keywords found in many spam NFT collections
export const NFT_SPAM_KEYWORDS = [
  'airdrop', 'claim', 'reward', 'free', 'gift', 'bonus',
  'elon', 'musk', 'trump', 'pump', 'moon', '1000x',
  'twitter', 'discord', 'telegram', 'promo', 'giveaway',
  'launch', 'presale', 'ico', 'whitelist', 'mint',
  'inu', 'pepe', 'doge', 'shib', 'safe', 'baby',
  '.com', '.io', 'www.', 'http', 'https',
  'nft', 'collection', 'pfp', 'avatar', 'drop',
  'scam', 'legit', 'trust', 'burn', 'gpt', 'fork',
  'fair', 'floki', 'cat', 'dog', 'chatgpt', 'openai',
  'gem', 'viral', 'ponzi', 'honeypot', 'rugpull'
];

// Regex patterns for suspicious NFT collection naming
export const SUSPICIOUS_NFT_NAME_PATTERNS = [
  /\.(com|io|xyz|org|net|fi)\b/i, // Domain names
  /https?:\/\//i,                 // URLs
  /t\.me\//i,                     // Telegram links
  /\d{5,}/,                       // Long numbers
  /\$+[a-z]+\$+/i,                // Dollar signs wrapping text
  /[0-9]{4,}/,                    // Year-like numbers
  /\([^)]*\)/,                    // Text in parentheses (often contains instructions)
  /v[0-9]+(\.[0-9]+)*/i,          // Version numbers (v1, v2.0 etc.)
  /[@#$%^&*!]/,                   // Special characters often used in spam
  /[A-Z]{6,}/,                    // Long all-caps sequences
  /^[a-z0-9]{10,}$/i,             // Long alphanumeric sequences
  /[A-Z]{2,}[0-9]{2,}/,           // Capital letters followed by numbers
  /airdrop|free|claim/i,          // Direct airdrop words
  /[0-9]+x$/i,                    // Numbers followed by "x" (like 1000x)
  /base|arbitrum|optimism|eth/i,  // Chain names (often used to make spam seem legit)
];

// Suspicious NFT collection patterns
export const SUSPICIOUS_NFT_PATTERNS = {
  // Large collection sizes that are often spam
  LARGE_COLLECTION_SIZES: [10000, 5555, 8888, 9999, 6969, 4200, 1337],
  
  // Sequential token IDs that suggest bulk minting (spam)
  SEQUENTIAL_TOKEN_PATTERNS: [
    /^[0-9]+$/, // Pure numeric IDs like 1, 2, 3...
  ],
  
  // Suspicious metadata patterns
  METADATA_SPAM_INDICATORS: [
    'generated', 'random', 'procedural', 'ai generated',
    'auto generated', 'batch minted', 'bulk mint'
  ]
};

// NFT spam detection signals
export const NFT_SPAM_SIGNALS = {
  // Collection naming issues
  NAMING: {
    SUSPICIOUS_PREFIXES: ['free', 'airdrop', 'claim', 'get', 'take', 'win'],
    SUSPICIOUS_SUFFIXES: ['nft', 'collection', 'pfp', 'avatar', 'drop', 'mint'],
    SUSPICIOUS_NAMES: ['pepe', 'doge', 'shib', 'moon', 'safe', 'elon', 'inu', 'baby'],
    MIN_NAME_LENGTH: 2,
    MAX_NAME_LENGTH: 50,
  },
  
  // Collection value issues
  VALUE: {
    MIN_FLOOR_PRICE: 0.001, // Minimum floor price in ETH
    ZERO_VOLUME_THRESHOLD: 30, // Days without trading activity
    SUSPICIOUS_SUPPLY: 10000, // Collection sizes often used by spam
  },
  
  // Bulk airdrop signals
  AIRDROP: {
    MAX_COLLECTION_SIZE: 100000, // Collections larger than this are suspicious
    BULK_MINT_THRESHOLD: 1000, // NFTs minted to same wallet
    SEQUENTIAL_THRESHOLD: 10, // Sequential token IDs suggesting bulk operation
  },
  
  // High risk indicators
  HIGH_RISK: {
    BLACKLISTED_COLLECTIONS: [
      // Add known spam collection addresses here
      '0x0000000000000000000000000000000000000000',
    ],
    MIN_SUSPICIOUS_FACTORS: 3, // Number of factors needed for high risk classification
    UNVERIFIED_CREATOR_PENALTY: true, // Flag collections from unverified creators
  },
};

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

// NFT image sources for fallbacks (similar to token logos)
export const NFT_IMAGE_SOURCES = [
  // 1. OpenSea CDN - Most reliable for NFT images
  (contractAddress: string, tokenId: string) => 
    `https://img.reservoir.tools/images/v2/base/${contractAddress}/${tokenId}?width=512`,
  
  // 2. Alchemy NFT Media API
  (contractAddress: string, tokenId: string) => 
    `https://base-mainnet.g.alchemy.com/nft/v3/media/${contractAddress}/${tokenId}`,
  
  // 3. Simple placeholder for failed loads
  () => `data:image/svg+xml;base64,${btoa(`
    <svg width="200" height="200" xmlns="http://www.w3.org/2000/svg">
      <rect width="200" height="200" fill="#1f2937"/>
      <text x="100" y="100" text-anchor="middle" fill="#6b7280" font-family="Arial" font-size="14">NFT</text>
    </svg>
  `)}`
];

// Maximum number of NFTs to display per page (for performance)
export const NFT_PAGINATION = {
  ITEMS_PER_PAGE: 24, // Grid-friendly number
  LAZY_LOAD_THRESHOLD: 5, // Load more when user is 5 items from end
  MAX_INITIAL_LOAD: 100, // Maximum NFTs to load initially
}; 