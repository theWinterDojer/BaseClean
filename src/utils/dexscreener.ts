/**
 * DexScreener utilities for BaseClean
 * Provides URL generation for token pages on DexScreener
 */

/**
 * Generate DexScreener URL for a Base network token
 * @param tokenAddress - Token contract address (0x...)
 * @returns Complete DexScreener URL for the token
 */
export function getDexScreenerUrl(tokenAddress: string): string {
  if (!tokenAddress || typeof tokenAddress !== 'string') {
    throw new Error('Invalid token address provided to getDexScreenerUrl');
  }
  
  // Ensure address starts with 0x and is properly formatted
  const cleanAddress = tokenAddress.startsWith('0x') 
    ? tokenAddress 
    : `0x${tokenAddress}`;
  
  return `https://dexscreener.com/base/${cleanAddress}`;
}

/**
 * Open DexScreener page for a token in a new tab
 * @param tokenAddress - Token contract address
 * @param tokenSymbol - Optional token symbol for error logging
 */
export function openDexScreener(tokenAddress: string, tokenSymbol?: string): void {
  try {
    const url = getDexScreenerUrl(tokenAddress);
    window.open(url, '_blank', 'noopener,noreferrer');
  } catch (error) {
    console.error(`Failed to open DexScreener for ${tokenSymbol || tokenAddress}:`, error);
  }
} 