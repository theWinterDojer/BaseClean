export const SUPPORTED_CHAINS = {
  BASE: {
    id: 8453,
    name: 'Base',
    network: 'base',
    nativeCurrency: {
      decimals: 18,
      name: 'Ethereum',
      symbol: 'ETH',
    },
    rpcUrls: {
      public: { http: ['https://mainnet.base.org'] },
      default: { http: ['https://mainnet.base.org'] },
    },
    blockExplorers: {
      etherscan: { name: 'BaseScan', url: 'https://basescan.org' },
      default: { name: 'BaseScan', url: 'https://basescan.org' },
    },
  },
};

export const DEFAULT_CHAIN = SUPPORTED_CHAINS.BASE;

// Environment configuration
export const IS_PRODUCTION = process.env.NODE_ENV === 'production';
export const IS_DEVELOPMENT = process.env.NODE_ENV === 'development';

// Now we always use Base Mainnet since we removed testnet support
export const RECOMMENDED_CHAIN = SUPPORTED_CHAINS.BASE;

export const RPC_URLS = {
  [SUPPORTED_CHAINS.BASE.id]: SUPPORTED_CHAINS.BASE.rpcUrls.default.http[0],
};

// API Configuration - Simplified for Alchemy primary
export const API_CONFIG = {
  // Alchemy API (primary provider)
  ALCHEMY_API_KEY: process.env.NEXT_PUBLIC_ALCHEMY_API_KEY || '',
  
  // Legacy compatibility (remove these after migration)
  BLOCKCHAIN_API_KEY: '', // Deprecated - use ALCHEMY_API_KEY
  COVALENT_API_KEY: '', // Deprecated - being removed
} as const;

// Legacy exports for backward compatibility
export const COVALENT_API_KEY = API_CONFIG.COVALENT_API_KEY;

export const WALLET_CONNECT_PROJECT_ID = process.env.NEXT_PUBLIC_WALLET_CONNECT_PROJECT_ID || '';

// Gas limits for different operations
export const BURN_GAS_LIMIT = 100000;
export const BATCH_BURN_GAS_LIMIT = 150000;
export const APPROVAL_GAS_LIMIT = 80000;

// Dead address for token burning - where tokens go to die
export const BURN_ADDRESS = '0x000000000000000000000000000000000000dEaD';

// Security configuration
export const SECURITY_CONFIG = {
  // Maximum number of tokens that can be burned in a single batch
  MAX_BATCH_SIZE: 100,
  
  // Minimum confirmation blocks to wait for critical operations
  MIN_CONFIRMATIONS: 2,
  
  // Maximum gas price to prevent sandwich attacks (in gwei)
  MAX_GAS_PRICE_GWEI: 50,
  
  // Transaction timeout in milliseconds
  TX_TIMEOUT_MS: 300000, // 5 minutes
} as const; 