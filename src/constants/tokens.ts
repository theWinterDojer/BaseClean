// Token value thresholds
export const TOKEN_VALUE_THRESHOLDS = [1, 10, 50, 100];

// Minimum value (in USD) for a token to be considered valuable
export const MIN_VALUABLE_TOKEN_VALUE = 0.01;

// Types for legitimate tokens
type AddressMap = Record<string, boolean>;
type LegitimateTokenMap = Record<number, AddressMap>;

// Whitelist of legitimate tokens that should never be flagged as spam
export const LEGITIMATE_TOKENS: LegitimateTokenMap = {
  // Base chain (8453)
  8453: {
    // ETH on Base
    '0x4200000000000000000000000000000000000006': true,
    'eth': true, // Symbolic reference for ETH
    // Zora token
    '0x6b5caa3711550c862bd35c390e08ad9504854b72': true,
    // Base platform token
    '0x833589fcd6edb6e08f4c7c32d4f71b54bda02913': true, // USDC on Base
    // Add more known legitimate tokens for Base chain
    '0x50c5725949a6f0c72e6c4a641f24049a917db0cb': true, // DAI on Base
    '0x2ae3f1ec7f1f5012cfeab0185bfc7aa3cf0dec22': true, // cbETH on Base
    '0xd9aaec86b65d86f6a7b5b1b0c42ffa531710b6ca': true, // USD Coin on Base
    '0x4158734d47fc9692176b5085e0f52ee0da5d47f1': true, // Compound on Base
  }
};

// Common spam keywords found in many airdrop/scam tokens
// Phase 17.1: Cleaned up to reduce false positives - removed legitimate industry terms
export const SPAM_KEYWORDS = [
  // Clear airdrop/giveaway indicators
  'airdrop', 'claim', 'reward', 'free', 'gift', 'bonus', 'giveaway',
  
  // Celebrity/meme exploitation
  'elon', 'musk', 'trump', 
  
  // Obvious scam language
  'pump', 'moon', '1000x', 'scam', 'legit', 'trust', 'ponzi', 'honeypot',
  
  // Promotional/marketing spam
  'promo', 'launch', 'presale', 'ico', 'whitelist',
  
  // URL/Social media indicators (usually spam)
  '.com', '.io', 'www.', 'http', 'https', 'twitter', 'discord', 'telegram', 't.me',
  
  // Known scam token names
  'safemoon', 'fomo',
  
  // Obvious fakes/copies
  'chatgpt', 'openai', 'gpt',
  
  // Generic spam terms
  'viral', 'gem', 'drop', 'fair'
];

// REMOVED LEGITIMATE INDUSTRY TERMS (Phase 17.1):
// These were causing false positives for real projects:
// 'tech', 'finance', 'meme', 'swap', 'game', 'dao', 'nft', 'protocol', 
// 'app', 'zk', 'dev', 'ai', 'metaverse', 'token', 'coin', 'farm', 
// 'yield', 'based', 'defi', 'burn', 'fork', 'safe', 'erc20', 'btc', 'eth'

// Regex patterns for suspicious naming
// Phase 17.1: Refined to focus on clear spam indicators while reducing false positives
// Phase 17.3: Removed ALL CAPS detection to prevent false positives on legitimate tokens
export const SUSPICIOUS_NAME_PATTERNS = [
  /\.(com|io|xyz|org|net|fi)\b/i, // Domain names in token names
  /https?:\/\//i,                 // URLs in token names
  /t\.me\//i,                     // Telegram links
  /\d{6,}/,                       // Very long numbers (6+ digits, more specific than before)
  /\$+[a-z]+\$+/i,               // Dollar signs wrapping text
  /\([^)]*\)/,                    // Text in parentheses (often spam instructions)
  /[@#$%^&*!]{2,}/,              // Multiple special characters together
  /^[a-z0-9]{12,}$/i,            // Very long random alphanumeric sequences (12+ chars)
  /airdrop|free|claim/i,          // Direct airdrop words with case insensitivity
  /[0-9]+x$/i,                    // Numbers followed by "x" (like 1000x)
];

// REMOVED OVERLY BROAD PATTERNS (Phase 17.1):
// These were flagging legitimate tokens:
// /[0-9]{4,}/ - Year numbers (many legit tokens have years)
// /v[0-9]+/ - Version numbers (legitimate for some projects)
// /[A-Z]{6,}/ - Reduced to 8+ to allow shorter legitimate caps
// /[A-Z]{2,}[0-9]{2,}/ - Too broad, caught legitimate naming
// /base|arbitrum|optimism/i - Chain names are legitimate for multi-chain projects

// Common airdrop amounts often used in spam tokens
export const COMMON_AIRDROP_AMOUNTS = [
  1337, 88888, 69420, 42069, 8008, 7777777, 1000000, 10000, 1234, 12345,
  8888, 9999, 6969, 4200, 4269, 800, 888, 69, 420, 666, 
  777, 7777, 101010, 123456, 654321,
  // Add more known airdrop amounts
  12321, 42424, 31337, 999999, 1111111, 7654321, 55555,
  // Phase 17.6: Added meme decimal amounts
  0.69
];

// Spam detection signals (updated with consolidated values)
export const SPAM_SIGNALS = {
  // Naming issues
  NAMING: {
    SUSPICIOUS_PREFIXES: ['free', 'airdrop', 'claim', 'get', 'take'],
    SUSPICIOUS_SUFFIXES: [], // Phase 17.1: Removed legitimate industry suffixes
    SUSPICIOUS_NAMES: ['safemoon'], // Phase 17.1: Reduced to only known scam names
    MIN_NAME_LENGTH: 1, // Allow single character symbols (like X, Y, etc.)
    MAX_SYMBOL_LENGTH: 30, // Increased to match name length for legitimate tokens with longer symbols
    MAX_NAME_LENGTH: 30,   // Increased from 20 to allow longer legitimate names
  },
  
  // Value issues
  VALUE: {
    MIN_QUOTE_RATE: 0.000001,
    MAX_SUPPLY_THRESHOLD: 1_000_000_000_000, // 1 trillion
    SUSPICIOUS_DECIMALS: [0, 1, 2], // Most legitimate tokens use 18 decimals
    LOW_VALUE_THRESHOLD: 0.10, // Changed from 1.0 to 0.10 for better spam detection
  },
  
  // Airdrop signals
  AIRDROP: {
    MAX_TOKEN_COUNT: 100,
    ROUND_NUMBER_THRESHOLD: 0.001, // Difference from round number to be suspicious
  },
  
  // High risk indicators
  HIGH_RISK: {
    BLACKLISTED_CONTRACTS: [
      // Add known spam contract addresses here
      '0x0000000000000000000000000000000000000000',
    ],
    SUSPICIOUS_CREATION_TIME_DAYS: 30, // Tokens created in the last 30 days
    MIN_SUSPICIOUS_FACTORS: 3, // Number of factors needed for high risk classification
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