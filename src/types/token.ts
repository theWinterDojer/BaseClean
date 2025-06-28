/**
 * Represents a token with its balance and metadata
 */
export type Token = {
  /** Contract address of the token */
  contract_address: string;
  /** Token symbol (e.g. "ETH") */
  contract_ticker_symbol: string;
  /** Token name (e.g. "Ethereum") */
  contract_name: string;
  /** Token balance in smallest unit (wei, satoshi, etc.) as string */
  balance: string;
  /** Number of decimal places for the token */
  contract_decimals: number;
  /** Current exchange rate to USD */
  quote_rate: number;
  /** URL to the token logo image */
  logo_url?: string;
  /** Original URL from API response (for fallback) */
  original_logo_url?: string;
  /** Source of the price data */
  price_source?: 'defillama' | 'none';
  /** Whether this token is flagged by ScamSniffer as potentially malicious */
  scamSnifferFlagged?: boolean;
};

/**
 * Configuration for spam token filtering
 * Phase 17.2: Simplified by removing high risk indicators filter
 */
export type SpamFilters = {
  /** Filter by name/symbol issues (missing, excessive length, suspicious patterns, spam keywords) */
  namingIssues: boolean;
  /** Filter by value issues (zero value, dust balance, low total value) */
  valueIssues: boolean;
  /** Filter by airdrop signals (suspicious amounts, common airdrop techniques) */
  airdropSignals: boolean;
};

/**
 * Statistics about token distribution
 */
export type TokenStatistics = {
  /** Total number of tokens in wallet */
  totalTokens: number;
  /** Number of tokens flagged as spam */
  spamTokens: number;
  /** Number of regular (non-spam) tokens */
  regularTokens: number;
  /** Number of currently selected tokens */
  selectedTokens: number;
  /** Percentage of tokens flagged as spam */
  spamPercentage: number;
}; 