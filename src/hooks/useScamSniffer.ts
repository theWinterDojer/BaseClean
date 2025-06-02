import { useEffect, useState, useCallback } from 'react';
import { Token } from '@/types/token';
import { batchCheckScamSniffer, getScamSnifferCacheStats } from '@/lib/scamSniffer';

/**
 * Custom hook to handle ScamSniffer integration for tokens
 * 
 * @param tokens - Array of tokens to check against ScamSniffer
 * @returns Object with ScamSniffer-enhanced tokens and utility functions
 */
export function useScamSniffer(tokens: Token[]) {
  const [enhancedTokens, setEnhancedTokens] = useState<Token[]>(tokens);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [cacheStats, setCacheStats] = useState(getScamSnifferCacheStats());

  // Check tokens against ScamSniffer when tokens change
  const checkTokensWithScamSniffer = useCallback(async (tokensToCheck: Token[]) => {
    if (!tokensToCheck || tokensToCheck.length === 0) {
      setEnhancedTokens([]);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      // Extract addresses for batch checking
      const addresses = tokensToCheck.map(token => token.contract_address);
      
      // Batch check against ScamSniffer
      const scamSnifferResults = await batchCheckScamSniffer(addresses);
      
      // Enhance tokens with ScamSniffer flags
      const enhanced = tokensToCheck.map(token => ({
        ...token,
        scamSnifferFlagged: scamSnifferResults.get(token.contract_address) ?? false
      }));

      setEnhancedTokens(enhanced);
      setCacheStats(getScamSnifferCacheStats());
      
      // Log results for debugging
      const flaggedCount = enhanced.filter(t => t.scamSnifferFlagged).length;
      if (flaggedCount > 0) {
        console.debug(`ScamSniffer: ${flaggedCount} of ${enhanced.length} tokens flagged as potentially malicious`);
      }

    } catch (err) {
      console.error('ScamSniffer check failed:', err);
      setError(err instanceof Error ? err.message : 'Unknown error occurred');
      
      // Fall back to original tokens without ScamSniffer flags
      setEnhancedTokens(tokensToCheck.map(token => ({
        ...token,
        scamSnifferFlagged: false
      })));
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Effect to check tokens when they change
  useEffect(() => {
    checkTokensWithScamSniffer(tokens);
  }, [tokens, checkTokensWithScamSniffer]);

  // Manual refresh function
  const refresh = useCallback(() => {
    checkTokensWithScamSniffer(tokens);
  }, [tokens, checkTokensWithScamSniffer]);

  // Get statistics about ScamSniffer flags
  const getScamSnifferStats = useCallback(() => {
    const totalTokens = enhancedTokens.length;
    const flaggedTokens = enhancedTokens.filter(t => t.scamSnifferFlagged).length;
    
    return {
      totalTokens,
      flaggedTokens,
      flaggedPercentage: totalTokens > 0 ? (flaggedTokens / totalTokens) * 100 : 0,
      cacheStats
    };
  }, [enhancedTokens, cacheStats]);

  return {
    /** Tokens enhanced with ScamSniffer flags */
    tokens: enhancedTokens,
    /** Whether ScamSniffer checking is in progress */
    isLoading,
    /** Error message if ScamSniffer check failed */
    error,
    /** Function to manually refresh ScamSniffer data */
    refresh,
    /** Get statistics about ScamSniffer detection */
    getScamSnifferStats,
    /** Cache statistics for debugging */
    cacheStats
  };
} 