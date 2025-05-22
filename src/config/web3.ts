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

export const BURN_GAS_LIMIT = 100000; // Default gas limit for burn transactions 