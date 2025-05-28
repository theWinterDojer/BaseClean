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
  BASE_GOERLI: {
    id: 84531,
    name: 'Base Goerli',
    network: 'base-goerli',
    nativeCurrency: {
      decimals: 18,
      name: 'Ethereum',
      symbol: 'ETH',
    },
    rpcUrls: {
      public: { http: ['https://goerli.base.org'] },
      default: { http: ['https://goerli.base.org'] },
    },
    blockExplorers: {
      etherscan: { name: 'BaseScan', url: 'https://goerli.basescan.org' },
      default: { name: 'BaseScan', url: 'https://goerli.basescan.org' },
    },
    testnet: true,
  },
};

export const DEFAULT_CHAIN = SUPPORTED_CHAINS.BASE;

export const RPC_URLS = {
  [SUPPORTED_CHAINS.BASE.id]: SUPPORTED_CHAINS.BASE.rpcUrls.default.http[0],
  [SUPPORTED_CHAINS.BASE_GOERLI.id]: SUPPORTED_CHAINS.BASE_GOERLI.rpcUrls.default.http[0],
};

export const COVALENT_API_KEY = process.env.NEXT_PUBLIC_COVALENT_API_KEY || '';

export const WALLET_CONNECT_PROJECT_ID = process.env.NEXT_PUBLIC_WALLET_CONNECT_PROJECT_ID || '';

// Gas limits for different operations
export const BURN_GAS_LIMIT = 100000; // Default gas limit for burn transactions 
export const BATCH_BURN_GAS_LIMIT = 150000; // Gas limit per token in batch operations
export const APPROVAL_GAS_LIMIT = 80000; // Gas limit for token approvals

// BatchBurner contract addresses (will be populated after deployment)
export const BATCH_BURNER_ADDRESSES = {
  [SUPPORTED_CHAINS.BASE.id]: process.env.NEXT_PUBLIC_BATCH_BURNER_ADDRESS_MAINNET || '',
  [SUPPORTED_CHAINS.BASE_GOERLI.id]: process.env.NEXT_PUBLIC_BATCH_BURNER_ADDRESS_TESTNET || '',
} as const;

// Dead address for token burning
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