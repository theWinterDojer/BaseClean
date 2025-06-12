import { useMemo, useCallback } from 'react';
import { Token, SpamFilters } from '@/types/token';
import { formatBalance, calculateTokenValue } from '@/lib/api';
import { 
  LEGITIMATE_TOKENS, 
  SPAM_KEYWORDS, 
  SUSPICIOUS_NAME_PATTERNS, 
  COMMON_AIRDROP_AMOUNTS,
  SPAM_SIGNALS 
} from '@/constants/tokens';

// Types
type ChainId = number;

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
  // Phase 17.3: Removed all value-based logic - this filter is purely about names/symbols
  const hasNamingIssues = useCallback((token: Token): boolean => {
    if (!spamFilters.namingIssues) return false;
    
    const { contract_ticker_symbol: symbol, contract_name: name } = token;
    
    // Missing or overly long symbol
    if (!symbol || symbol.length > SPAM_SIGNALS.NAMING.MAX_SYMBOL_LENGTH) return true;
    
    // Missing or overly long name
    if (!name || name.length > SPAM_SIGNALS.NAMING.MAX_NAME_LENGTH) return true;
    
    // Suspicious naming patterns (URLs, domains, etc.)
    if (SUSPICIOUS_NAME_PATTERNS.some(pattern => 
      pattern.test(name) || pattern.test(symbol)
    )) return true;
    
    // Excessive special characters (regardless of value)
    if (/[^a-zA-Z0-9\s]/.test(name) && 
       (name.match(/[^a-zA-Z0-9\s]/g)?.length || 0) >= 4) return true; // Increased threshold to 4+
    
    // Spam keywords - focus on high-confidence indicators only
    let keywordMatches = 0;
    for (const keyword of SPAM_KEYWORDS) {
      if (name.toLowerCase().includes(keyword) || symbol.toLowerCase().includes(keyword)) {
        keywordMatches++;
        
        // High-confidence keywords immediately flag as spam
        if (['airdrop', 'claim', 'free', 'giveaway', 'scam', 'ponzi'].includes(keyword)) {
          return true;
        }
        
        // Multiple keyword matches indicate spam
        if (keywordMatches >= 3) return true; // Increased threshold to 3+
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
    if (balance > 100 && token.quote_rate > 0 && usdValue > SPAM_SIGNALS.VALUE.LOW_VALUE_THRESHOLD) return false;
    
    // Extremely low value (less than $0.000001)
    if (token.quote_rate < SPAM_SIGNALS.VALUE.MIN_QUOTE_RATE) return true;
    
    // Dust balance, but only if the token itself has low value
    if (balance < 0.001 && token.quote_rate < 0.01) return true;
    
    // Low total value - using threshold from constants
    if (usdValue > 0 && usdValue < SPAM_SIGNALS.VALUE.LOW_VALUE_THRESHOLD) return true;
    
    // No price data but has a large balance (suspicious "valueless" tokens)
    if (token.quote_rate === 0 && balance > 100000) return true;
    
    // Token has unusually high decimals (more than standard 18)
    // This is often seen in spam tokens trying to appear more valuable
    if (token.contract_decimals > 18 && token.quote_rate < 0.00001) return true;
    
    return false;
  }, [spamFilters.valueIssues]);
  
  // Check if token has airdrop signals
  // Phase 17.5: Removed value-based logic - this filter is purely about balance patterns and missing images
  const hasAirdropSignals = useCallback((token: Token, balance: number): boolean => {
    if (!spamFilters.airdropSignals) return false;
    
    // Phase 17.6: Tokens without proper images are often spam/airdrops
    if (!token.logo_url || token.logo_url.startsWith('data:image/svg+xml')) return true;
    
    // Phase 17.7: Tokens with very small balances (< 1 token) are often junk
    if (balance < 1) return true;
    
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
    
    // Any token with extremely large integer balance (often junk) - removed value check
    if (balance > 10000000) return true;
    
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
  
  // Phase 17.2: Removed high risk indicators filter entirely for simplicity

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
    // Phase 17.2: Simplified to 3 filters (removed high risk indicators)
    let spamSignals = 0;
    
    // Count each spam signal
    if (hasNamingIssues(token)) spamSignals++;
    if (hasValueIssues(token, balanceNum)) spamSignals++;
    if (hasAirdropSignals(token, balanceNum)) spamSignals++;
    
    // Adjusted thresholds for 3-filter system
    // If the token has low value, 1 signal is enough to flag it
    if (usdValue < SPAM_SIGNALS.VALUE.LOW_VALUE_THRESHOLD && spamSignals >= 1) return true;
    
    // For tokens with moderate value, require 2+ signals
    if (usdValue < 5.0 && spamSignals >= 2) return true;
    
    // For tokens with significant value (>$5.00), require all 3 signals
    if (usdValue >= 5.0 && spamSignals >= 3) return true;
    
    return false;
  }, [hasNamingIssues, hasValueIssues, hasAirdropSignals]); // Phase 17.2: Removed hasHighRiskIndicators

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