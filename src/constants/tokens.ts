// Token value thresholds
export const TOKEN_VALUE_THRESHOLDS = [1, 10, 50, 100];

// Minimum value (in USD) for a token to be considered valuable
export const MIN_VALUABLE_TOKEN_VALUE = 0.01;

// Spam detection signals
export const SPAM_SIGNALS = {
  // Naming issues
  NAMING: {
    SUSPICIOUS_PREFIXES: ['free', 'airdrop', 'claim', 'get', 'take'],
    SUSPICIOUS_SUFFIXES: ['token', 'coin', 'dao', 'protocol', 'finance'],
    SUSPICIOUS_NAMES: ['pepe', 'doge', 'shib', 'moon', 'safe', 'elon', 'inu', 'baby'],
    MIN_NAME_LENGTH: 2,
    MAX_SYMBOL_LENGTH: 10,
  },
  
  // Value issues
  VALUE: {
    MIN_QUOTE_RATE: 0.000001,
    MAX_SUPPLY_THRESHOLD: 1_000_000_000_000, // 1 trillion
    SUSPICIOUS_DECIMALS: [0, 1, 2], // Most legitimate tokens use 18 decimals
  },
  
  // Airdrop signals
  AIRDROP: {
    MAX_TOKEN_COUNT: 100,
    COMMON_AIRDROP_AMOUNTS: [10, 100, 1000, 10000],
    ROUND_NUMBER_THRESHOLD: 0.001, // Difference from round number to be suspicious
  },
  
  // High risk indicators
  HIGH_RISK: {
    BLACKLISTED_CONTRACTS: [
      // Add known spam contract addresses here
      '0x0000000000000000000000000000000000000000',
    ],
    SUSPICIOUS_CREATION_TIME_DAYS: 30, // Tokens created in the last 30 days
  },
};

// Burn confirmation messages
export const BURN_MESSAGES = {
  CONFIRM_VALUABLE: 'You\'re about to burn tokens worth ${{value}}! Are you sure?',
  CONFIRM_REGULAR: 'Burning {{count}} token(s) with no significant value.',
  SUCCESS: 'Successfully burned {{count}} token(s).',
  ERROR: 'Error burning tokens: {{error}}',
};

// UI text constants
export const UI_TEXT = {
  CONNECT_WALLET: 'Please connect your wallet to view your token balances',
  LOADING: 'Loading your token balances...',
  NO_TOKENS: 'No tokens found in this wallet',
  NO_SPAM_TOKENS: 'No spam tokens detected with current filters',
  NO_REGULAR_TOKENS: 'No regular tokens match current filters',
}; 