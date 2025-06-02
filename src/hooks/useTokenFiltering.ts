import { useMemo, useCallback } from 'react';
import { Token, SpamFilters } from '@/types/token';
import { formatBalance, calculateTokenValue } from '@/lib/api';

// Types
type ChainId = number;
type AddressMap = Record<string, boolean>;
type LegitimateTokenMap = Record<ChainId, AddressMap>;

// Constants
// Whitelist of legitimate tokens that should never be flagged as spam
const LEGITIMATE_TOKENS: LegitimateTokenMap = {
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
const SPAM_KEYWORDS = [
  'airdrop', 'claim', 'reward', 'free', 'gift', 'bonus',
  'elon', 'musk', 'trump', 'pump', 'moon', '1000x',
  'twitter', 'discord', 'telegram', 'promo', 'giveaway',
  'launch', 'presale', 'ico', 'whitelist', 'defi', 'safemoon',
  'shib', 'doge', '.com', '.io', 'www.', 'http', 'https',
  'inu', 'tech', 'finance', 'meme', 'swap', 'game', 'dao',
  'nft', 'protocol', 'app', 'zk', 'dev', 'ai', 'metaverse',
  'token', 'coin', 'farm', 'yield', 'fomo', 'based',
  // Additional keywords for common spam patterns
  'scam', 'legit', 'trust', 'burn', 'gpt', 'drop', 'fork',
  'fair', 'safe', 'floki', 'cat', 'dog', 'chatgpt', 'openai',
  'gem', 'erc20', 'btc', 'eth', 'viral', 'ponzi', 'honeypot'
];

// Regex patterns for suspicious naming
const SUSPICIOUS_NAME_PATTERNS = [
  /\.(com|io|xyz|org|net|fi)\b/i, // Domain names
  /https?:\/\//i,             // URLs
  /t\.me\//i,                 // Telegram links
  /\d{5,}/,                   // Long numbers
  /\$+[a-z]+\$+/i,            // Dollar signs wrapping text
  /[0-9]{4,}/,                // Year-like numbers
  /\([^)]*\)/,                // Text in parentheses (often contains instructions)
  /v[0-9]+(\.[0-9]+)*/i,      // Version numbers (v1, v2.0 etc.)
  /[@#$%^&*!]/,               // Special characters often used in spam tokens
  /[A-Z]{6,}/,                // Long all-caps sequences
  /^[a-z0-9]{10,}$/i,         // Long alphanumeric sequences
  // Additional patterns for better detection
  /[A-Z]{2,}[0-9]{2,}/,       // Capital letters followed by numbers (common in spam)
  /airdrop|free|claim/i,      // Direct airdrop words with case insensitivity
  /[0-9]+x$/i,                // Numbers followed by "x" (like 1000x)
  /base|arbitrum|optimism/i,  // Chain names (often used to make spam seem legit)
];

// Common airdrop amounts often used in spam tokens
const COMMON_AIRDROP_AMOUNTS = [
  1337, 88888, 69420, 42069, 8008, 7777777, 1000000, 10000, 1234, 12345,
  8888, 9999, 6969, 4200, 4269, 800, 888, 69, 420, 666, 
  777, 7777, 101010, 123456, 654321,
  // Add more known airdrop amounts
  12321, 42424, 31337, 999999, 1111111, 7654321, 55555
];

/**
 * Custom hook to filter tokens based on spam criteria and maximum value
 * 
 * @param tokens - Array of tokens to filter
 * @param spamFilters - Configuration for spam detection filters
 * @param maxValue - Maximum USD value threshold (null means no limit)
 * @returns Object containing filtered token lists and helper functions
 */
export function useTokenFiltering(
  tokens: Token[],
  spamFilters: SpamFilters,
  maxValue: number | null
) {
  // Check if token has naming issues
  const hasNamingIssues = useCallback((token: Token): boolean => {
    if (!spamFilters.namingIssues) return false;
    
    const { contract_ticker_symbol: symbol, contract_name: name } = token;
    
    // Skip check for tokens with sufficient value (avoiding false positives)
    const balance = formatBalance(token.balance, token.contract_decimals);
    const usdValue = parseFloat(calculateTokenValue(balance, token.quote_rate) || '0');
    if (usdValue > 10) return false;
    
    // Missing or overly long symbol
    if (!symbol || symbol.length > 8) return true;
    
    // Missing or overly long name
    if (!name || name.length > 20) return true;
    
    // Some legitimate tokens may use all caps, only consider this spam
    // for tokens with very low value
    const isAllCaps = name && name.toUpperCase() === name && name.length > 3;
    if (isAllCaps && usdValue < 0.5) return true;
    
    // Suspicious naming patterns
    if (SUSPICIOUS_NAME_PATTERNS.some(pattern => 
      pattern.test(name) || pattern.test(symbol)
    )) return true;
    
    // Excessive special characters, but only for tokens with low value
    if (usdValue < 1 && /[^a-zA-Z0-9\s]/.test(name) && 
       (name.match(/[^a-zA-Z0-9\s]/g)?.length || 0) >= 3) return true;
    
    // Spam keywords - implement a smarter, weighted approach
    // More matches = higher spam probability
    let keywordMatches = 0;
    for (const keyword of SPAM_KEYWORDS) {
      if (name.toLowerCase().includes(keyword) || symbol.toLowerCase().includes(keyword)) {
        keywordMatches++;
        
        // If we find more than 2 spam keywords or certain high-confidence keywords, consider it spam
        if (keywordMatches >= 2 || 
            ['airdrop', 'claim', 'free', 'giveaway'].includes(keyword)) {
          return true;
        }
      }
    }
    
    return false;
  }, [spamFilters.namingIssues]);
  
  // Check if token has value issues
  const hasValueIssues = useCallback((token: Token, balance: number): boolean => {
    if (!spamFilters.valueIssues) return false;
    
    const usdValue = parseFloat(calculateTokenValue(balance.toString(), token.quote_rate) || '0');
    
    // Zero value tokens should ALWAYS be flagged when this filter is enabled
    if (token.quote_rate === 0 || usdValue === 0) return true;
    
    // Skip further checks for tokens with sufficient holdings AND actual value
    // This prevents legitimate tokens with low price but high holdings from being flagged
    if (balance > 100 && token.quote_rate > 0 && usdValue > 1.0) return false;
    
    // Extremely low value (less than $0.000001)
    if (token.quote_rate < 0.000001) return true;
    
    // Dust balance, but only if the token itself has low value
    if (balance < 0.001 && token.quote_rate < 0.01) return true;
    
    // Low total value - adjusted threshold to $1.00
    if (usdValue > 0 && usdValue < 1.0) return true;
    
    // No price data but has a large balance (suspicious "valueless" tokens)
    if (token.quote_rate === 0 && balance > 100000) return true;
    
    // Token has unusually high decimals (more than standard 18)
    // This is often seen in spam tokens trying to appear more valuable
    if (token.contract_decimals > 18 && token.quote_rate < 0.00001) return true;
    
    return false;
  }, [spamFilters.valueIssues]);
  
  // Check if token has airdrop signals
  const hasAirdropSignals = useCallback((token: Token, balance: number): boolean => {
    if (!spamFilters.airdropSignals) return false;
    
    // Skip check for tokens with real value
    const usdValue = parseFloat(calculateTokenValue(balance.toString(), token.quote_rate) || '0');
    if (usdValue > 5) return false;
    
    // Exact round numbers are suspicious (like 1000 or 1000000 tokens)
    if (/^[1-9]0*$/.test(balance.toString())) return true;
    
    // Repeating digits (e.g., 11111, 88888)
    if (/^(.)\1{3,}$/.test(balance.toString())) return true;
    
    // Common airdrop numbers with improved tolerance to handle slight variations
    if (COMMON_AIRDROP_AMOUNTS.some(num => {
      // If the token amount is very close to a known airdrop amount,
      // treat it as a potential spam signal
      return Math.abs(balance - num) < 0.5 || Math.abs(balance - num) / num < 0.01;
    })) return true;
    
    // Weird decimal patterns often seen in airdrops
    if (/\.\d{10,}$/.test(balance.toString())) return true;
    
    // Any token with extremely large integer balance (often junk)
    if (balance > 10000000 && token.quote_rate < 0.000001) return true;
    
    // Tokens with exactly 1.0 balance are often airdrops
    if (Math.abs(balance - 1.0) < 0.000001) return true;
    
    // Tokens with suspicious sequential patterns
    if (/^1234|4321|2345|5432|3456|6543|4567|7654|5678|8765/.test(balance.toString().replace('.', ''))) return true;
    
    // Recent trend: Spam tokens with specific balance precision to avoid detection
    // Check for balances with unusual precision that aren't normal decimal divisions
    if (balance.toString().includes('.') && 
        balance.toString().split('.')[1].length > 8 && 
        !(/0{5,}$/.test(balance.toString()))) return true;
    
    return false;
  }, [spamFilters.airdropSignals]);
  
  // Check if token has high risk indicators
  const hasHighRiskIndicators = useCallback((token: Token, balance: number, usdValue: number): boolean => {
    if (!spamFilters.highRiskIndicators) return false;
    
    // Must have very low value to be considered high risk
    if (usdValue >= 0.5) return false;
    
    // No logo found (often indicates unofficial or scam tokens) AND very low value
    if (!token.logo_url && token.quote_rate < 0.0001) return true;
    
    // Extremely low or zero price with large balance (likely worthless)
    if (token.quote_rate < 0.0000001 && balance > 1000) return true;
    
    // Suspicious token name patterns not caught by other filters
    if (token.contract_name && /\b(airdrop|free|claim)\b/i.test(token.contract_name)) return true;
    
    // Extremely large balance with no real value (common in scam tokens)
    if (balance > 1000000 && usdValue < 0.1) return true;
    
    // Tokens with unusual decimals (non-standard) - but only for low value tokens
    if (token.contract_decimals > 18 && token.quote_rate < 0.00001) return true;
    
    // Combination of multiple suspicious characteristics
    let suspiciousFactors = 0;
    
    // Factor 1: Unusual balance
    if (balance > 10000) suspiciousFactors++;
    
    // Factor 2: Lack of price info
    if (token.quote_rate === 0) suspiciousFactors++;
    
    // Factor 3: No logo
    if (!token.logo_url) suspiciousFactors++;
    
    // Factor 4: Very low value
    if (usdValue < 0.01) suspiciousFactors++;
    
    // If token exhibits multiple high-risk characteristics, flag it
    if (suspiciousFactors >= 3) return true;
    
    return false;
  }, [spamFilters.highRiskIndicators]);

  // Memoize the isSpamToken function to prevent unnecessary recreations
  const isSpamToken = useCallback((token: Token): boolean => {
    // Format balance once for efficiency
    const balance = formatBalance(token.balance, token.contract_decimals);
    const usdValue = parseFloat(calculateTokenValue(balance, token.quote_rate) || '0');
    const balanceNum = parseFloat(balance);
    
    // Check if token is on the legitimate whitelist - never flag these as spam
    const chainId: ChainId = 8453; // Base chain
    if (
      (LEGITIMATE_TOKENS[chainId]?.[token.contract_address.toLowerCase()]) || 
      (token.contract_ticker_symbol?.toLowerCase() === 'eth') ||
      // Protect tokens with significant value (> $5)
      (usdValue > 5)
    ) {
      return false;
    }
    
    // Smarter spam detection that requires multiple criteria for higher confidence
    // This reduces false positives while maintaining high detection rates
    let spamSignals = 0;
    
    // Count each spam signal
    if (hasNamingIssues(token)) spamSignals++;
    if (hasValueIssues(token, balanceNum)) spamSignals++;
    if (hasAirdropSignals(token, balanceNum)) spamSignals++;
    if (hasHighRiskIndicators(token, balanceNum, usdValue)) spamSignals++;
    
    // Adjusted thresholds to match new $1.00 low-value standard
    // If the token has low value (<$1.00), 1 signal is enough to flag it
    if (usdValue < 1.0 && spamSignals >= 1) return true;
    
    // For tokens with moderate value ($1.00-$5.00), require 2+ signals
    if (usdValue < 5.0 && spamSignals >= 2) return true;
    
    // For tokens with significant value (>$5.00), require 3+ signals
    if (usdValue >= 5.0 && spamSignals >= 3) return true;
    
    return false;
  }, [hasNamingIssues, hasValueIssues, hasAirdropSignals, hasHighRiskIndicators]);

  // Filter tokens by maximum value
  const visibleTokens = useMemo(() => {
    if (maxValue === null) return tokens;
    
    return tokens.filter((token) => {
      const displayBalance = formatBalance(token.balance, token.contract_decimals);
      const value = parseFloat(calculateTokenValue(displayBalance, token.quote_rate) || '0');
      return !token.quote_rate || value <= maxValue;
    });
  }, [tokens, maxValue]);

  // Split tokens into spam and non-spam categories
  const { spamTokens, nonSpamTokens } = useMemo(() => {
    const spam: Token[] = [];
    const regular: Token[] = [];
    
    visibleTokens.forEach(token => {
      if (isSpamToken(token)) {
        spam.push(token);
      } else {
        regular.push(token);
      }
    });
    
    return {
      spamTokens: spam,
      nonSpamTokens: regular
    };
  }, [visibleTokens, isSpamToken]);

  return {
    visibleTokens,
    spamTokens,
    nonSpamTokens,
    isSpamToken
  };
} 