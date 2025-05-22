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
  'token', 'coin', 'farm', 'yield', 'fomo', 'based'
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
];

// Common airdrop amounts often used in spam tokens
const COMMON_AIRDROP_AMOUNTS = [
  1337, 88888, 69420, 42069, 8008, 7777777, 1000000, 10000, 1234, 12345,
  8888, 9999, 6969, 4200, 4269, 800, 888, 69, 420, 666, 
  777, 7777, 101010, 123456, 654321
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
    
    // Missing or overly long symbol
    if (!symbol || symbol.length > 8) return true;
    
    // Missing or overly long name
    if (!name || name.length > 20) return true;
    
    // Suspicious naming patterns
    if (SUSPICIOUS_NAME_PATTERNS.some(pattern => 
      pattern.test(name) || pattern.test(symbol)
    )) return true;
    
    // Excessive capitalization
    if (name && name.toUpperCase() === name) return true;
    
    // Excessive special characters
    if (/[^a-zA-Z0-9\s]/.test(name) && 
       (name.match(/[^a-zA-Z0-9\s]/g)?.length || 0) >= 3) return true;
    
    // Spam keywords
    if (SPAM_KEYWORDS.some(keyword => 
      name.toLowerCase().includes(keyword.toLowerCase()) ||
      symbol.toLowerCase().includes(keyword.toLowerCase())
    )) return true;
    
    return false;
  }, [spamFilters.namingIssues]);
  
  // Check if token has value issues
  const hasValueIssues = useCallback((token: Token, balance: number): boolean => {
    if (!spamFilters.valueIssues) return false;
    
    const usdValue = calculateTokenValue(balance, token.quote_rate);
    
    // Zero value
    if (token.quote_rate === 0) return true;
    
    // Extremely low value (less than $0.000001)
    if (token.quote_rate < 0.000001) return true;
    
    // Dust balance
    if (balance < 0.001) return true;
    
    // Low total value
    if (usdValue > 0 && usdValue < 0.1) return true;
    
    // No price data but has a large balance (suspicious "valueless" tokens)
    if (token.quote_rate === 0 && balance > 100000) return true;
    
    return false;
  }, [spamFilters.valueIssues]);
  
  // Check if token has airdrop signals
  const hasAirdropSignals = useCallback((token: Token, balance: number): boolean => {
    if (!spamFilters.airdropSignals) return false;
    
    // Exact round numbers are suspicious (like 1000 or 1000000 tokens)
    if (/^[1-9]0*$/.test(balance.toString())) return true;
    
    // Repeating digits (e.g., 11111, 88888)
    if (/^(.)\1{3,}$/.test(balance.toString())) return true;
    
    // Common airdrop numbers
    if (COMMON_AIRDROP_AMOUNTS.some(num => 
      Math.abs(balance - num) < 0.001
    )) return true;
    
    // Weird decimal patterns often seen in airdrops
    if (/\.\d{10,}$/.test(balance.toString())) return true;
    
    // Any token with extremely large integer balance (often junk)
    if (balance > 10000000 && token.quote_rate < 0.000001) return true;
    
    // Tokens with exactly 1.0 balance are often airdrops
    if (Math.abs(balance - 1.0) < 0.000001) return true;
    
    // Tokens with suspicious sequential patterns
    if (/^1234|4321|2345|5432|3456|6543|4567|7654|5678|8765/.test(balance.toString().replace('.', ''))) return true;
    
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
    
    return false;
  }, [spamFilters.highRiskIndicators]);

  // Memoize the isSpamToken function to prevent unnecessary recreations
  const isSpamToken = useCallback((token: Token): boolean => {
    // Format balance once for efficiency
    const balance = formatBalance(token.balance, token.contract_decimals);
    const usdValue = calculateTokenValue(balance, token.quote_rate);
    
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
    
    // Check each spam criteria
    return hasNamingIssues(token) || 
           hasValueIssues(token, balance) || 
           hasAirdropSignals(token, balance) || 
           hasHighRiskIndicators(token, balance, usdValue);
  }, [hasNamingIssues, hasValueIssues, hasAirdropSignals, hasHighRiskIndicators]);

  // Filter tokens by maximum value
  const visibleTokens = useMemo(() => {
    if (maxValue === null) return tokens;
    
    return tokens.filter((token) => {
      const displayBalance = formatBalance(token.balance, token.contract_decimals);
      const value = calculateTokenValue(displayBalance, token.quote_rate);
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