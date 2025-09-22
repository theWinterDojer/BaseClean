import { useMemo, useCallback } from 'react';
import { Token, SpamFilters } from '@/types/token';
import { formatBalance } from '@/lib/api';
import { 
  LEGITIMATE_TOKENS, 
  SPAM_KEYWORDS, 
  SUSPICIOUS_NAME_PATTERNS, 
  COMMON_AIRDROP_AMOUNTS,
  SPAM_SIGNALS 
} from '@/constants/tokens';

// Types
type ChainId = number;
type TokenAnalysis = {
  balance: string;
  balanceNum: number;
  usdValue: number;
  isProtected: boolean;
};

/**
 * Custom hook to filter tokens based on spam criteria and maximum value
 * OPTIMIZED: Single-pass filtering with efficient order of operations
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
  // Pre-calculate token analysis for efficiency (single calculation per token)
  const analyzeToken = useCallback((token: Token): TokenAnalysis => {
    const balance = formatBalance(token.balance, token.contract_decimals);
    
    // FIXED: Calculate numeric values using raw balance, not formatted string
    // formatBalance() can return "105.53K" which breaks parseFloat
    const rawBalance = parseFloat(token.balance) / Math.pow(10, token.contract_decimals);
    const balanceNum = rawBalance; // Use raw numeric balance, not formatted string
    const usdValue = rawBalance * (token.quote_rate || 0);
    

    
    // Determine if token is protected from spam filtering
    const chainId: ChainId = 8453; // Base chain
    const isProtected = (
      // Whitelist protection
      (LEGITIMATE_TOKENS[chainId]?.[token.contract_address.toLowerCase()]) || 
      (token.contract_ticker_symbol?.toLowerCase() === 'eth') ||
      // Value protection: Any token > $0.10 is never spam
      (usdValue > SPAM_SIGNALS.VALUE.LOW_VALUE_THRESHOLD)
    );
    
    return { balance, balanceNum, usdValue, isProtected };
  }, []);

  // Efficient naming filter (no redundant value calculations)
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
    
    // Excessive special characters
    if (/[^a-zA-Z0-9\s]/.test(name) && 
       (name.match(/[^a-zA-Z0-9\s]/g)?.length || 0) >= 4) return true;
    
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
        if (keywordMatches >= 3) return true;
      }
    }
    
    return false;
  }, [spamFilters.namingIssues]);
  
  // Efficient value filter (no redundant value calculations)
  const hasValueIssues = useCallback((token: Token, analysis: TokenAnalysis): boolean => {
    if (!spamFilters.valueIssues) return false;
    
    const { balanceNum, usdValue } = analysis;
    
    // Zero value tokens should be flagged when this filter is enabled
    if (token.quote_rate === 0 || usdValue === 0) return true;
    
    // Extremely low value (less than $0.000001)
    if (token.quote_rate < SPAM_SIGNALS.VALUE.MIN_QUOTE_RATE) return true;
    
    // Dust balance with low token value
    if (balanceNum < 0.001 && token.quote_rate < 0.01) return true;
    
    // Low total value - using threshold from constants
    if (usdValue > 0 && usdValue < SPAM_SIGNALS.VALUE.LOW_VALUE_THRESHOLD) return true;
    
    // No price data but has a large balance (suspicious "valueless" tokens)
    if (token.quote_rate === 0 && balanceNum > 100000) return true;
    
    // Token has unusually high decimals with very low value
    if (token.contract_decimals > 18 && token.quote_rate < 0.00001) return true;
    
    return false;
  }, [spamFilters.valueIssues]);
  
  // Efficient airdrop filter (no redundant calculations or image checks)
  const hasAirdropSignals = useCallback((token: Token, analysis: TokenAnalysis): boolean => {
    if (!spamFilters.airdropSignals) return false;
    
    const { balanceNum } = analysis;
    
    // Tokens with very small balances (< 1 token) are often junk
    if (balanceNum < 1) return true;
    
    // Exact round numbers are suspicious (like 1000 or 1000000 tokens)
    if (/^[1-9]0*$/.test(balanceNum.toString())) return true;
    
    // Repeating digits (e.g., 11111, 88888)
    if (/^(.)\1{3,}$/.test(balanceNum.toString())) return true;
    
    // Common airdrop numbers - only match exact amounts (within 0.1% for floating-point rounding errors)
    if (COMMON_AIRDROP_AMOUNTS.some(num => {
      return Math.abs(balanceNum - num) / num < 0.001;
    })) return true;
    
    // Weird decimal patterns often seen in airdrops
    if (/\.\d{10,}$/.test(balanceNum.toString())) return true;
    
    // Any token with extremely large integer balance (often junk)
    if (balanceNum > 10000000) return true;
    
    // Tokens with exactly 1.0 balance are often airdrops
    if (Math.abs(balanceNum - 1.0) < 0.000001) return true;
    
    // Tokens with suspicious sequential patterns
    if (/^1234|4321|2345|5432|3456|6543|4567|7654|5678|8765/.test(balanceNum.toString().replace('.', ''))) return true;
    
    // Balances with extremely unusual precision (15+ decimal places with non-zero trailing digits)
    // This catches artificially crafted spam tokens while allowing normal ERC-20 precision
    if (balanceNum.toString().includes('.') && 
        balanceNum.toString().split('.')[1].length >= 15 && 
        !(/0{8,}$/.test(balanceNum.toString()))) return true;
    
    return false;
  }, [spamFilters.airdropSignals]);

  // OPTIMIZED: Single-pass spam detection with efficient order of operations
  const isSpamToken = useCallback((token: Token): boolean => {
    // Step 1: Calculate values once
    const analysis = analyzeToken(token);
    
    // Step 2: Early exit for protected tokens (most efficient path)
    if (analysis.isProtected) {
      return false; // Never spam
    }
    
    // Step 3: Only run filters on unprotected, low-value tokens
    // This is highly efficient since we've already excluded valuable tokens
    let spamSignals = 0;
    
    if (hasNamingIssues(token)) spamSignals++;
    if (hasValueIssues(token, analysis)) spamSignals++;
    if (hasAirdropSignals(token, analysis)) spamSignals++;
    
    // Step 4: Simple classification (any spam signal = spam for low-value tokens)
    return spamSignals >= 1;
  }, [analyzeToken, hasNamingIssues, hasValueIssues, hasAirdropSignals]);

  // Filter tokens by maximum value threshold
  const visibleTokens = useMemo(() => {
    if (maxValue === null) return tokens;
    
    return tokens.filter((token) => {
      const analysis = analyzeToken(token);
      return !token.quote_rate || analysis.usdValue <= maxValue;
    });
  }, [tokens, maxValue, analyzeToken]);

  // OPTIMIZED: Split and sort tokens with pre-calculated values
  const { spamTokens, nonSpamTokens } = useMemo(() => {
    const spam: Token[] = [];
    const regular: Token[] = [];
    
    // Pre-calculate analysis for all tokens to avoid redundant calculations during sorting
    const tokenAnalysisMap = new Map<string, TokenAnalysis>();
    
    visibleTokens.forEach(token => {
      const analysis = analyzeToken(token);
      tokenAnalysisMap.set(token.contract_address, analysis);
      
      if (isSpamToken(token)) {
        spam.push(token);
      } else {
        regular.push(token);
      }
    });
    
    // Efficient sorting using pre-calculated values
    const sortByValue = (a: Token, b: Token) => {
      const analysisA = tokenAnalysisMap.get(a.contract_address);
      const analysisB = tokenAnalysisMap.get(b.contract_address);
      const valueA = analysisA?.usdValue || 0;
      const valueB = analysisB?.usdValue || 0;
      
      // Threshold for "effectively zero" USD values (displays as $0.00 in UI)
      const DISPLAY_ZERO_THRESHOLD = 0.01;
      
      // Check if both values are below the display threshold (both show as $0.00)
      const valueAIsDisplayZero = valueA < DISPLAY_ZERO_THRESHOLD;
      const valueBIsDisplayZero = valueB < DISPLAY_ZERO_THRESHOLD;
      
      // If both values display as $0.00, sort by balance instead
      if (valueAIsDisplayZero && valueBIsDisplayZero) {
        const balanceA = analysisA?.balanceNum || 0;
        const balanceB = analysisB?.balanceNum || 0;
        

        
        return balanceB - balanceA; // Sort by balance (highest first)
      }
      
      // Primary sort: USD value (highest first) for tokens with meaningful USD differences
      return valueB - valueA;
    };
    
    return {
      spamTokens: spam.sort(sortByValue),
      nonSpamTokens: regular.sort(sortByValue)
    };
  }, [visibleTokens, isSpamToken, analyzeToken]);

  return {
    visibleTokens,
    spamTokens,
    nonSpamTokens,
    isSpamToken
  };
} 