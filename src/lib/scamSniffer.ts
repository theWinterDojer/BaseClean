/**
 * ScamSniffer Integration Service
 * 
 * Integrates with ScamSniffer's open-source scam database to identify
 * potentially malicious token addresses on Base network.
 * 
 * Uses our server-side API route to bypass CORS restrictions.
 */

// Cache for ScamSniffer blacklist data
let scamSnifferCache: Set<string> | null = null;
let lastFetchTime = 0;
const CACHE_DURATION = 24 * 60 * 60 * 1000; // 24 hours in milliseconds

/**
 * Fetch the latest ScamSniffer blacklist from our API route
 */
async function fetchScamSnifferBlacklist(): Promise<Set<string>> {
  try {
    console.debug('Fetching ScamSniffer blacklist from API...');
    
    const response = await fetch('/api/scamsniffer', {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        'Cache-Control': 'no-cache'
      }
    });

    if (!response.ok) {
      throw new Error(`API responded with status ${response.status}`);
    }

    const data = await response.json();
    
    if (!data.addresses || !Array.isArray(data.addresses)) {
      throw new Error('Invalid response format from ScamSniffer API');
    }

    // Convert to lowercase Set for efficient lookups
    const validAddresses: string[] = data.addresses
      .filter((addr: string): addr is string => typeof addr === 'string' && addr.length === 42 && addr.startsWith('0x'))
      .map((addr: string) => addr.toLowerCase());
      
    const blacklistSet = new Set<string>(validAddresses);

    const cacheInfo = data.cached ? 'cached' : 'fresh';
    const staleInfo = data.stale ? ' (stale)' : '';
    console.log(`🛡️ ScamSniffer: Loaded ${blacklistSet.size} blacklisted addresses from ${cacheInfo} data${staleInfo}`);
    
    return blacklistSet;

  } catch (error) {
    console.error('ScamSniffer: Failed to fetch from API:', error);
    
    // Return empty set rather than throwing to avoid breaking the app
    console.warn('ScamSniffer: Using empty blacklist due to fetch failures');
    return new Set<string>();
  }
}

/**
 * Initialize or refresh the ScamSniffer cache
 */
async function initializeScamSnifferCache(): Promise<void> {
  const now = Date.now();
  
  // Only fetch if cache is empty or expired
  if (!scamSnifferCache || (now - lastFetchTime) > CACHE_DURATION) {
    try {
      console.debug('ScamSniffer: Initializing cache...');
      scamSnifferCache = await fetchScamSnifferBlacklist();
      lastFetchTime = now;
      
      // Store in localStorage for persistence (with timestamp)
      if (typeof window !== 'undefined') {
        try {
          const cacheData = {
            addresses: Array.from(scamSnifferCache),
            timestamp: now
          };
          localStorage.setItem('scamsniffer_cache', JSON.stringify(cacheData));
          console.debug(`ScamSniffer: Cached ${scamSnifferCache.size} addresses to localStorage`);
        } catch (e) {
          console.debug('Failed to store ScamSniffer cache in localStorage:', e);
        }
      }
    } catch (error) {
      console.error('Failed to initialize ScamSniffer cache:', error);
      
      // Try to load from localStorage as fallback
      if (typeof window !== 'undefined') {
        try {
          const cached = localStorage.getItem('scamsniffer_cache');
          if (cached) {
            const cacheData = JSON.parse(cached);
            // Use cached data even if old (better than nothing)
            scamSnifferCache = new Set(cacheData.addresses || []);
            console.debug(`ScamSniffer: Using cached data (${scamSnifferCache.size} addresses)`);
          }
        } catch (e) {
          console.debug('Failed to load ScamSniffer cache from localStorage:', e);
        }
      }
      
      // If everything fails, use empty set
      if (!scamSnifferCache) {
        scamSnifferCache = new Set<string>();
        console.warn('ScamSniffer: Using empty cache due to all failures');
      }
    }
  } else {
    console.debug(`ScamSniffer: Using existing cache (${scamSnifferCache.size} addresses, age: ${Math.round((now - lastFetchTime) / 1000 / 60)} minutes)`);
  }
}

/**
 * Check if a token address is flagged by ScamSniffer
 * 
 * @param address - Token contract address to check
 * @returns Promise<boolean> - true if flagged as malicious, false otherwise
 */
export async function isScamSnifferFlagged(address: string): Promise<boolean> {
  if (!address || typeof address !== 'string') {
    return false;
  }

  // Ensure cache is initialized
  await initializeScamSnifferCache();
  
  // Check if address is in blacklist (case-insensitive)
  const normalizedAddress = address.toLowerCase();
  return scamSnifferCache?.has(normalizedAddress) ?? false;
}

/**
 * Batch check multiple addresses against ScamSniffer blacklist
 * More efficient for checking multiple tokens at once
 * 
 * @param addresses - Array of token addresses to check
 * @returns Promise<Map<string, boolean>> - Map of address -> isFlagged
 */
export async function batchCheckScamSniffer(addresses: string[]): Promise<Map<string, boolean>> {
  const results = new Map<string, boolean>();
  
  if (!addresses || addresses.length === 0) {
    return results;
  }

  // Ensure cache is initialized
  await initializeScamSnifferCache();
  
  // Check each address
  for (const address of addresses) {
    if (address && typeof address === 'string') {
      const normalizedAddress = address.toLowerCase();
      const isFlagged = scamSnifferCache?.has(normalizedAddress) ?? false;
      results.set(address, isFlagged);
    }
  }
  
  return results;
}

/**
 * Get cache statistics for debugging/monitoring
 */
export function getScamSnifferCacheStats(): {
  size: number;
  lastFetch: Date | null;
  cacheAge: number;
} {
  return {
    size: scamSnifferCache?.size ?? 0,
    lastFetch: lastFetchTime > 0 ? new Date(lastFetchTime) : null,
    cacheAge: lastFetchTime > 0 ? Date.now() - lastFetchTime : 0
  };
}

/**
 * Force refresh the ScamSniffer cache
 * Useful for manual cache invalidation
 */
export async function refreshScamSnifferCache(): Promise<void> {
  scamSnifferCache = null;
  lastFetchTime = 0;
  await initializeScamSnifferCache();
}

/**
 * Clear the ScamSniffer cache
 * Useful for testing or troubleshooting
 */
export function clearScamSnifferCache(): void {
  scamSnifferCache = null;
  lastFetchTime = 0;
  
  if (typeof window !== 'undefined') {
    try {
      localStorage.removeItem('scamsniffer_cache');
      console.debug('ScamSniffer: Cache cleared from localStorage');
    } catch (e) {
      console.debug('Failed to clear ScamSniffer cache from localStorage:', e);
    }
  }
} 