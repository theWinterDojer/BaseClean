import { Token } from '@/types/token';

// Use environment variable with type checking and proper error handling
const BLOCKCHAIN_API_KEY = process.env.NEXT_PUBLIC_BLOCKCHAIN_API_KEY || '';

// Enhanced cache for token logo URLs with permanent storage
const TOKEN_LOGO_CACHE: Record<string, string> = {};

// Define missing types
type CovalentResponse = {
  data: {
    items: CovalentItem[];
  };
  error: boolean;
  error_message: string | null;
};

type CovalentItem = {
  type: string;
  contract_address: string;
  contract_ticker_symbol: string;
  contract_name: string;
  balance: string;
  contract_decimals: number;
  quote_rate: number;
  logo_url?: string;
};

// Load cache from localStorage if available (client-side only)
if (typeof window !== 'undefined') {
  try {
    const cachedLogos = localStorage.getItem('token_logo_cache');
    if (cachedLogos) {
      // Parse the cached logos
      const cachedLogoData = JSON.parse(cachedLogos);
      
      // Clean up problematic URLs before using the cache
      const problematicPatterns = [
        /uniswap\/assets\/master\/blockchains\/base\/assets\/0xA9A489EA2Ba0E0Af84150f88D1c33C866f466A80/i,
        /githubusercontent\.com.*\/base\/assets\//i
      ];
      
      // Filter out problematic URLs
      let hasRemovedEntries = false;
      Object.keys(cachedLogoData).forEach(address => {
        const url = cachedLogoData[address];
        if (typeof url === 'string' && problematicPatterns.some(pattern => pattern.test(url))) {
          delete cachedLogoData[address];
          hasRemovedEntries = true;
          console.log(`Removed problematic cached logo URL for ${address}`);
        }
      });
      
      // Save cleaned cache if needed
      if (hasRemovedEntries) {
        localStorage.setItem('token_logo_cache', JSON.stringify(cachedLogoData));
      }
      
      // Use the cleaned cache
      Object.assign(TOKEN_LOGO_CACHE, cachedLogoData);
    }
  } catch (e) {
    console.debug('Failed to load token logo cache from localStorage');
  }
}

/**
 * Save token logo URL to cache including localStorage
 */
const saveToCache = (address: string, url: string): void => {
  // Always update in-memory cache
  TOKEN_LOGO_CACHE[address] = url;
  
  // Update localStorage if available (client-side only)
  if (typeof window !== 'undefined') {
    try {
      localStorage.setItem('token_logo_cache', JSON.stringify(TOKEN_LOGO_CACHE));
    } catch (e) {
      console.debug('Failed to save token logo cache to localStorage');
    }
  }
};

/**
 * Safe btoa function that works with all characters and environments
 */
function safeEncode(str: string): string {
  try {
    // First, UTF-8 encode the string to handle special characters
    const utf8Bytes = new TextEncoder().encode(str);
    // Convert to base64 using only visible ASCII
    const base64 = btoa(
      Array.from(utf8Bytes)
        .map(byte => String.fromCharCode(byte))
        .join('')
    );
    return base64;
  } catch (error) {
    console.warn('Error in safeEncode:', error);
    
    // Last resort fallback - create a simpler encoded string
    try {
      // Use only ASCII characters that are safe for base64
      return btoa(str.replace(/[^\x00-\x7F]/g, '_'));
    } catch (e) {
      // Ultra-safe fallback if everything fails
      return 'PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCA0MCA0MCIgaGVpZ2h0PSI0MCIgd2lkdGg9IjQwIj48Y2lyY2xlIGN4PSIyMCIgY3k9IjIwIiByPSIyMCIgZmlsbD0iIzYwN0Q4QiIvPjx0ZXh0IHg9IjIwIiB5PSIyNSIgZm9udC1zaXplPSIxNiIgZmlsbD0iI2ZmZiIgdGV4dC1hbmNob3I9Im1pZGRsZSI+WDwvdGV4dD48L3N2Zz4=';
    }
  }
}

/**
 * Most reliable token logo sources for Base L2 tokens
 * These are prioritized by reliability and CORS compatibility
 */
const TOKEN_LOGO_SOURCES = [
  // 1. Zapper API - Most reliable for Base tokens
  (address: string) => `https://storage.googleapis.com/zapper-fi-assets/tokens/base/${address}.png`,
  
  // 2. DeFi Llama Icon Service - Very reliable for multiple chains
  (address: string) => `https://icons.llama.fi/base/${address}.png`,
  
  // 3. Base Chain Explorer Icons
  (address: string) => `https://basescan.org/token/images/${address}.png`,
  
  // 4. 1inch Token Repository - Good coverage for many tokens
  (address: string) => `https://tokens.1inch.io/${address}.png`,
  
  // 5. Trustwallet Assets - Community maintained
  (address: string) => `https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/base/assets/${address}/logo.png`,
];

/**
 * Addresses that should always use SVG fallbacks
 * These are tokens with persistent image loading issues
 */
const ALWAYS_USE_FALLBACK = new Set([
  '0xa9a489ea2ba0e0af84150f88d1c33c866f466a80', // ZORA token
]);

/**
 * Well-known token addresses with verified icon URLs
 */
const COMMON_TOKENS: Record<string, string> = {
  // Major tokens by address (lowercase for consistency)
  '0x4200000000000000000000000000000000000006': 'https://storage.googleapis.com/zapper-fi-assets/tokens/ethereum/0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2.png', // ETH on Base
  '0x833589fcd6edb6e08f4c7c32d4f71b54bda02913': 'https://storage.googleapis.com/zapper-fi-assets/tokens/base/0x833589fcd6edb6e08f4c7c32d4f71b54bda02913.png', // USDC on Base
  '0x50c5725949a6f0c72e6c4a641f24049a917db0cb': 'https://storage.googleapis.com/zapper-fi-assets/tokens/base/0x50c5725949a6f0c72e6c4a641f24049a917db0cb.png', // DAI on Base
  '0xd9aaec86b65d86f6a7b5b1b0c42ffa531710b6ca': 'https://storage.googleapis.com/zapper-fi-assets/tokens/base/0xd9aaec86b65d86f6a7b5b1b0c42ffa531710b6ca.png', // USDbC
  
  // By symbol for quick lookups
  'eth': 'https://storage.googleapis.com/zapper-fi-assets/tokens/ethereum/0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2.png',
  'weth': 'https://storage.googleapis.com/zapper-fi-assets/tokens/ethereum/0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2.png',
  'usdc': 'https://storage.googleapis.com/zapper-fi-assets/tokens/base/0x833589fcd6edb6e08f4c7c32d4f71b54bda02913.png',
  'usdt': 'https://storage.googleapis.com/zapper-fi-assets/tokens/ethereum/0xdac17f958d2ee523a2206206994597c13d831ec7.png',
  'dai': 'https://storage.googleapis.com/zapper-fi-assets/tokens/base/0x50c5725949a6f0c72e6c4a641f24049a917db0cb.png',
  'usdbc': 'https://storage.googleapis.com/zapper-fi-assets/tokens/base/0xd9aaec86b65d86f6a7b5b1b0c42ffa531710b6ca.png',
};

/**
 * Generate a fallback SVG image when no external image is available
 * @param address Token contract address
 * @param symbol Token symbol 
 * @returns Data URI for SVG image
 */
function generateFallbackImage(address: string, symbol: string = ''): string {
  const initialChar = symbol && symbol.length > 0 ? 
    symbol.substring(0, Math.min(2, symbol.length)).toUpperCase() : 
    address.substring(2, 4).toUpperCase();
  
  // Generate a deterministic color from the address
  const addressSeed = parseInt(address.substring(2, 10), 16);
  
  // Color palette based on material design
  const colors = [
    '#F44336', '#E91E63', '#9C27B0', '#673AB7', '#3F51B5',
    '#2196F3', '#03A9F4', '#00BCD4', '#009688', '#4CAF50',
    '#8BC34A', '#CDDC39', '#FFEB3B', '#FFC107', '#FF9800'
  ];
  
  const colorIndex = addressSeed % colors.length;
  const bgColor = colors[colorIndex];
  
  // Create a simple SVG with the token initials
  const svgContent = `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 40 40" width="40" height="40">
  <circle cx="20" cy="20" r="20" fill="${bgColor}"/>
  <text x="20" y="25" font-family="Arial, sans-serif" font-size="${initialChar.length > 1 ? '14' : '16'}" font-weight="bold" text-anchor="middle" fill="white">${initialChar}</text>
</svg>`;
  
  // Create a data URI with the SVG and encode it safely
  const dataUri = `data:image/svg+xml;base64,${safeEncode(svgContent.trim())}`;
  saveToCache(address, dataUri);
  return dataUri;
}

/**
 * Simplified token logo resolver with reliable fallbacks
 * @param address Token contract address
 * @param symbol Token symbol
 * @returns URL to token logo or fallback image data URI
 */
export async function getTokenLogoUrl(address: string, symbol: string = ''): Promise<string> {
  const cleanAddress = address?.toLowerCase();
  const cleanSymbol = symbol?.toLowerCase();
  
  if (!cleanAddress || cleanAddress === '0x0000000000000000000000000000000000000000') {
    return generateFallbackImage('0x000000', symbol);
  }

  // Special case: Always use fallbacks for problematic tokens
  if (ALWAYS_USE_FALLBACK.has(cleanAddress)) {
    return generateFallbackImage(cleanAddress, cleanSymbol);
  }

  // 1. Check cache first (highest priority for speed)
  if (TOKEN_LOGO_CACHE[cleanAddress]) {
    return TOKEN_LOGO_CACHE[cleanAddress];
  }

  // 2. Check for well-known tokens
  if (COMMON_TOKENS[cleanAddress]) {
    const url = COMMON_TOKENS[cleanAddress];
    saveToCache(cleanAddress, url);
    return url;
  }
  
  // 3. Check by symbol if available
  if (cleanSymbol && COMMON_TOKENS[cleanSymbol]) {
    const url = COMMON_TOKENS[cleanSymbol];
    saveToCache(cleanAddress, url);
    return url;
  }
  
  // 4. Generate fallback image for tokens with common spam symbols
  // This avoids network requests for likely spam tokens
  if (cleanSymbol) {
    const spamIndicators = ['airdrop', 'free', 'elon', 'musk', 'trump', 'pepe', 'doge', 
      'shib', 'inu', 'claim', 'give', 'moon', 'pump', 'dump', 'reward', 'prize', 'win'];
    
    if (spamIndicators.some(indicator => cleanSymbol.includes(indicator))) {
      const fallback = generateFallbackImage(cleanAddress, cleanSymbol);
      saveToCache(cleanAddress, fallback);
      return fallback;
    }
  }
  
  // 5. For efficiency, we'll only try the most reliable sources
  // This reduces network requests for less reliable sources
  const reliableSources = TOKEN_LOGO_SOURCES.slice(0, 2); // Only use first 2 most reliable sources
  
  for (const getSourceUrl of reliableSources) {
    try {
      const url = getSourceUrl(cleanAddress);
      
      // Use AbortController for faster timeout
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 300); // Short timeout
      
      try {
        const response = await fetch(url, { 
          method: 'HEAD', 
          signal: controller.signal
        });
        
        clearTimeout(timeoutId);
        
        if (response.ok) {
          saveToCache(cleanAddress, url);
          return url;
        }
      } catch (err) {
        // If aborted or any other error, continue to next source
        clearTimeout(timeoutId);
      }
    } catch (error) {
      // Continue to next source
    }
  }

  // 6. Fall back to generated SVG if all sources fail
  const fallbackImage = generateFallbackImage(cleanAddress, cleanSymbol);
  saveToCache(cleanAddress, fallbackImage);
  return fallbackImage;
}

/**
 * Clears the token logo cache completely
 * Call this if you encounter persistent image loading issues
 */
export function clearTokenLogoCache(): void {
  // Clear in-memory cache
  for (const key of Object.keys(TOKEN_LOGO_CACHE)) {
    delete TOKEN_LOGO_CACHE[key];
  }
  
  // Clear localStorage cache if available
  if (typeof window !== 'undefined') {
    try {
      localStorage.removeItem('token_logo_cache');
      console.log('Token logo cache successfully cleared');
    } catch (e) {
      console.error('Failed to clear token logo cache from localStorage', e);
    }
  }
}

/**
 * Fetches token balances for a given address
 * 
 * @param address - The wallet address to fetch balances for
 * @returns Promise<Token[]> - Array of tokens or empty array on error
 */
export const fetchTokenBalances = async (address: string): Promise<Token[]> => {
  if (!address) {
    console.error('No address provided to fetchTokenBalances');
    return [];
  }

  try {
    if (!BLOCKCHAIN_API_KEY) {
      console.error('Missing blockchain API key');
      throw new Error('API key not configured');
    }

    const res = await fetch(
      `https://api.covalenthq.com/v1/base-mainnet/address/${address}/balances_v2/?key=${BLOCKCHAIN_API_KEY}`,
      {
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );
    
    if (!res.ok) {
      throw new Error(`API error: ${res.status}`);
    }
    
    const data: CovalentResponse = await res.json();

    if (data.error) {
      throw new Error(`Covalent API error: ${data.error_message}`);
    }

    const tokens = data.data.items.filter(
      (item: CovalentItem) => item.type === 'cryptocurrency'
    );
    
    // Process tokens with parallel logo fetching and enhanced price data
    const processedTokens = await Promise.all(
      tokens.map(async (item) => {
        // Get token logo URL with the new simplified function
        const logoUrl = await getTokenLogoUrl(
          item.contract_address,
          item.contract_ticker_symbol || ''
        );

        // Initial token with Covalent data
        const token = {
          contract_address: item.contract_address,
          contract_ticker_symbol: item.contract_ticker_symbol || '',
          contract_name: item.contract_name || '',
          balance: item.balance,
          contract_decimals: item.contract_decimals,
          quote_rate: item.quote_rate,
          logo_url: logoUrl,
          price_source: 'covalent'
        };

        // If token has no price data from Covalent, try fetching from alternative sources
        if (token.quote_rate === 0 && token.contract_ticker_symbol) {
          try {
            // Try DefiLlama first (fast API, no rate limits)
            const defiLlamaPrice = await fetchDefiLlamaPrice(token.contract_address);
            if (defiLlamaPrice > 0) {
              token.quote_rate = defiLlamaPrice;
              token.price_source = 'defillama';
              return token;
            }

            // If DefiLlama fails, try CoinGecko as fallback
            const coingeckoPrice = await fetchCoinGeckoPrice(token.contract_address);
            if (coingeckoPrice > 0) {
              token.quote_rate = coingeckoPrice;
              token.price_source = 'coingecko';
              return token;
            }
          } catch (err) {
            console.debug(`Failed to fetch alternative price data for ${token.contract_ticker_symbol}:`, err);
          }
        }
        
        return token;
      })
    );

    return processedTokens;
  } catch (err) {
    console.error('Failed to fetch tokens:', err);
    return [];
  }
};

/**
 * Fetch token price from DefiLlama API
 * 
 * @param address Contract address to fetch price for
 * @returns Price in USD or 0 if not found
 */
async function fetchDefiLlamaPrice(address: string): Promise<number> {
  try {
    const response = await fetch(`https://coins.llama.fi/prices/current/base:${address}`);
    
    if (!response.ok) {
      return 0;
    }
    
    const data = await response.json();
    const priceKey = `base:${address.toLowerCase()}`;
    
    return data.coins?.[priceKey]?.price || 0;
  } catch (err) {
    console.debug(`DefiLlama price fetch failed for ${address}:`, err);
    return 0;
  }
}

/**
 * Fetch token price from CoinGecko API
 * 
 * @param address Contract address to fetch price for
 * @returns Price in USD or 0 if not found
 */
async function fetchCoinGeckoPrice(address: string): Promise<number> {
  try {
    // Note: Free API has strict rate limits (10-20 calls/min)
    const response = await fetch(
      `https://api.coingecko.com/api/v3/simple/token_price/base?contract_addresses=${address}&vs_currencies=usd`,
      { 
        headers: { 'accept': 'application/json' }
      }
    );
    
    if (!response.ok) {
      return 0;
    }
    
    const data = await response.json();
    return data[address.toLowerCase()]?.usd || 0;
  } catch (err) {
    console.debug(`CoinGecko price fetch failed for ${address}:`, err);
    return 0;
  }
}

/**
 * Format token balance with appropriate decimals
 * @param balance The token balance as a string
 * @param decimals The number of decimals the token uses
 * @returns The formatted balance as a number
 */
export function formatBalance(balance: string, decimals: number): string {
  if (!balance || isNaN(decimals)) {
    return '0';
  }
  
  try {
    // Parse the balance
    const parsedBalance = parseFloat(balance);
    if (isNaN(parsedBalance)) return '0';
    
    // Get the balance with proper decimal places
    const adjustedBalance = parsedBalance / Math.pow(10, decimals);
    
    // Format based on size
    if (adjustedBalance >= 1000000) {
      return (adjustedBalance / 1000000).toFixed(2) + 'M';
    } else if (adjustedBalance >= 1000) {
      return (adjustedBalance / 1000).toFixed(2) + 'K';
    } else if (adjustedBalance >= 1) {
      return adjustedBalance.toFixed(2);
    } else if (adjustedBalance > 0) {
      // For very small numbers, show more decimal places
      return adjustedBalance.toFixed(Math.min(6, decimals));
    } else {
      return '0';
    }
  } catch (error) {
    console.error('Error formatting balance:', error);
    return '0';
  }
}

/**
 * Calculate the USD value of a token
 * @param balance The token balance as a string
 * @param quoteRate The token's price in USD
 * @returns The token value formatted as a string
 */
export function calculateTokenValue(balance: string, quoteRate: number): string {
  if (!balance || !quoteRate) return '';
  
  try {
    // Parse the balance as a float
    const balanceFloat = parseFloat(balance);
    if (isNaN(balanceFloat)) return '';
    
    // Calculate the value
    const value = balanceFloat * quoteRate;
    
    // Format based on value size
    if (value >= 1000000) {
      return (value / 1000000).toFixed(2) + 'M';
    } else if (value >= 1000) {
      return (value / 1000).toFixed(2) + 'K';
    } else if (value >= 1) {
      return value.toFixed(2);
    } else if (value > 0) {
      return value.toFixed(4);
    } else {
      return '0.00';
    }
  } catch (error) {
    console.error('Error calculating token value:', error);
    return '';
  }
} 