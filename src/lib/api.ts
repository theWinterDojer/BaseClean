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
      const cachedLogoData = JSON.parse(cachedLogos);
      Object.assign(TOKEN_LOGO_CACHE, cachedLogoData);
    }
  } catch {
    console.debug('Failed to load token logo cache from localStorage');
  }
}

/**
 * Save token logo URL to cache including localStorage
 */
const saveToCache = (address: string, url: string): void => {
  TOKEN_LOGO_CACHE[address] = url;
  
  if (typeof window !== 'undefined') {
    try {
      localStorage.setItem('token_logo_cache', JSON.stringify(TOKEN_LOGO_CACHE));
    } catch {
      console.debug('Failed to save token logo cache to localStorage');
    }
  }
};

/**
 * Safe btoa function that works with all characters and environments
 */
function safeEncode(str: string): string {
  try {
    const utf8Bytes = new TextEncoder().encode(str);
    const base64 = btoa(
      Array.from(utf8Bytes)
        .map(byte => String.fromCharCode(byte))
        .join('')
    );
    return base64;
  } catch {
    console.warn('Error in safeEncode:');
    try {
      return btoa(str.replace(/[^\x00-\x7F]/g, '_'));
    } catch {
      return 'PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCA0MCA0MCIgaGVpZ2h0PSI0MCIgd2lkdGg9IjQwIj48Y2lyY2xlIGN4PSIyMCIgY3k9IjIwIiByPSIyMCIgZmlsbD0iIzYwN0Q4QiIvPjx0ZXh0IHg9IjIwIiB5PSIyNSIgZm9udC1zaXplPSIxNiIgZmlsbD0iI2ZmZiIgdGV4dC1hbmNob3I9Im1pZGRsZSI+WDwvdGV4dD48L3N2Zz4=';
    }
  }
}

/**
 * Enhanced token logo sources with better Base blockchain coverage
 * Prioritized by reliability, speed, and CORS compatibility
 */
const TOKEN_LOGO_SOURCES = [
  // 1. Zapper API - Most reliable for Base tokens
  (address: string) => `https://storage.googleapis.com/zapper-fi-assets/tokens/base/${address}.png`,
  
  // 2. DeFi Llama Icon Service - Very reliable for multiple chains  
  (address: string) => `https://icons.llama.fi/icons/tokens/8453/${address}?w=64&h=64`,
  
  // 3. Alternative DeFi Llama format
  (address: string) => `https://icons.llama.fi/base/${address}.png`,
  
  // 4. Web3Icons CDN - New comprehensive source
  (address: string) => `https://cdn.jsdelivr.net/gh/0xa3k5/web3icons@latest/raw-svgs/tokens/branded/${address.toUpperCase().substring(2, 6)}.svg`,
  
  // 5. Base Chain Explorer Icons
  (address: string) => `https://basescan.org/token/images/${address}.png`,
  
  // 6. CoinGecko API (requires different approach but very reliable)
  (address: string) => `https://api.coingecko.com/api/v3/coins/base/contract/${address}`,
  
  // 7. 1inch Token Repository
  (address: string) => `https://tokens.1inch.io/${address}.png`,
  
  // 8. Moralis Token API format
  (address: string) => `https://api.moralis.io/token/logo/${address}`,
  
  // 9. Trustwallet Assets - Community maintained
  (address: string) => `https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/base/assets/${address}/logo.png`,
];

/**
 * Addresses that should always use SVG fallbacks
 */
const ALWAYS_USE_FALLBACK = new Set([
  '0xa9a489ea2ba0e0af84150f88d1c33c866f466a80', // ZORA token - known issues
]);

/**
 * Well-known token addresses with verified icon URLs
 */
const COMMON_TOKENS: Record<string, string> = {
  // Major Base tokens by address (lowercase)
  '0x4200000000000000000000000000000000000006': 'https://icons.llama.fi/icons/tokens/8453/0x4200000000000000000000000000000000000006?w=64&h=64', // ETH
  '0x833589fcd6edb6e08f4c7c32d4f71b54bda02913': 'https://icons.llama.fi/icons/tokens/8453/0x833589fcd6edb6e08f4c7c32d4f71b54bda02913?w=64&h=64', // USDC
  '0x50c5725949a6f0c72e6c4a641f24049a917db0cb': 'https://icons.llama.fi/icons/tokens/8453/0x50c5725949a6f0c72e6c4a641f24049a917db0cb?w=64&h=64', // DAI
  '0xd9aaec86b65d86f6a7b5b1b0c42ffa531710b6ca': 'https://icons.llama.fi/icons/tokens/8453/0xd9aaec86b65d86f6a7b5b1b0c42ffa531710b6ca?w=64&h=64', // USDbC
  
  // By symbol
  'eth': 'https://icons.llama.fi/icons/tokens/8453/0x4200000000000000000000000000000000000006?w=64&h=64',
  'weth': 'https://icons.llama.fi/icons/tokens/8453/0x4200000000000000000000000000000000000006?w=64&h=64',
  'usdc': 'https://icons.llama.fi/icons/tokens/8453/0x833589fcd6edb6e08f4c7c32d4f71b54bda02913?w=64&h=64',
  'usdt': 'https://icons.llama.fi/icons/tokens/1/0xdac17f958d2ee523a2206206994597c13d831ec7?w=64&h=64',
  'dai': 'https://icons.llama.fi/icons/tokens/8453/0x50c5725949a6f0c72e6c4a641f24049a917db0cb?w=64&h=64',
};

/**
 * Generate a fallback SVG image when no external image is available
 */
function generateFallbackImage(address: string, symbol: string = ''): string {
  const initialChar = symbol && symbol.length > 0 ? 
    symbol.substring(0, Math.min(2, symbol.length)).toUpperCase() : 
    address.substring(2, 4).toUpperCase();
  
  const addressSeed = parseInt(address.substring(2, 10), 16);
  const colors = [
    '#F44336', '#E91E63', '#9C27B0', '#673AB7', '#3F51B5',
    '#2196F3', '#03A9F4', '#00BCD4', '#009688', '#4CAF50',
    '#8BC34A', '#CDDC39', '#FFEB3B', '#FFC107', '#FF9800'
  ];
  
  const colorIndex = addressSeed % colors.length;
  const bgColor = colors[colorIndex];
  
  const svgContent = `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 40 40" width="40" height="40">
  <circle cx="20" cy="20" r="20" fill="${bgColor}"/>
  <text x="20" y="25" font-family="Arial, sans-serif" font-size="${initialChar.length > 1 ? '14' : '16'}" font-weight="bold" text-anchor="middle" fill="white">${initialChar}</text>
</svg>`;
  
  const dataUri = `data:image/svg+xml;base64,${safeEncode(svgContent.trim())}`;
  saveToCache(address, dataUri);
  return dataUri;
}

/**
 * Test if URL returns a valid image
 */
async function testImageUrl(url: string, timeout: number = 800): Promise<boolean> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeout);
  
  try {
    const response = await fetch(url, { 
      method: 'HEAD', 
      signal: controller.signal,
      mode: 'cors'
    });
    
    clearTimeout(timeoutId);
    
    // Check if response is ok and content type is an image
    if (response.ok) {
      const contentType = response.headers.get('content-type');
      return contentType ? contentType.startsWith('image/') : true;
    }
    
    return false;
  } catch {
    clearTimeout(timeoutId);
    return false;
  }
}

/**
 * Enhanced token logo resolver with comprehensive fallback strategy
 */
export async function getTokenLogoUrl(address: string, symbol: string = ''): Promise<string> {
  const cleanAddress = address?.toLowerCase();
  const cleanSymbol = symbol?.toLowerCase();
  
  if (!cleanAddress || cleanAddress === '0x0000000000000000000000000000000000000000') {
    return generateFallbackImage('0x000000', symbol);
  }

  // 1. Check cache first
  if (TOKEN_LOGO_CACHE[cleanAddress]) {
    return TOKEN_LOGO_CACHE[cleanAddress];
  }

  // 2. Special case: Always use fallbacks for problematic tokens
  if (ALWAYS_USE_FALLBACK.has(cleanAddress)) {
    return generateFallbackImage(cleanAddress, cleanSymbol);
  }

  // 3. Check for well-known tokens
  if (COMMON_TOKENS[cleanAddress]) {
    const url = COMMON_TOKENS[cleanAddress];
    saveToCache(cleanAddress, url);
    return url;
  }
  
  // 4. Check by symbol if available
  if (cleanSymbol && COMMON_TOKENS[cleanSymbol]) {
    const url = COMMON_TOKENS[cleanSymbol];
    saveToCache(cleanAddress, url);
    return url;
  }
  
  // 5. More conservative spam filtering - only skip obvious spam
  if (cleanSymbol) {
    const highConfidenceSpam = ['airdrop', 'claim', 'free', 'giveaway', 'reward'];
    if (highConfidenceSpam.some(spam => cleanSymbol.includes(spam))) {
      const fallback = generateFallbackImage(cleanAddress, cleanSymbol);
      saveToCache(cleanAddress, fallback);
      return fallback;
    }
  }
  
  // 6. Try multiple sources with enhanced logic
  const maxSourcesToTry = 4; // Increased from 2 to get better coverage
  const sourcesToTry = TOKEN_LOGO_SOURCES.slice(0, maxSourcesToTry);
  
  for (const getSourceUrl of sourcesToTry) {
    try {
      const url = getSourceUrl(cleanAddress);
      
      // Special handling for CoinGecko API
      if (url.includes('api.coingecko.com')) {
        try {
          const controller = new AbortController();
          const timeoutId = setTimeout(() => controller.abort(), 1000);
          
          const response = await fetch(url, { signal: controller.signal });
          clearTimeout(timeoutId);
          
          if (response.ok) {
            const data = await response.json();
            if (data.image && data.image.small) {
              const imageUrl = data.image.small;
              saveToCache(cleanAddress, imageUrl);
              return imageUrl;
            }
          }
        } catch {
          // Continue to next source
        }
      } else {
        // Regular image URL testing
        const isValid = await testImageUrl(url);
        if (isValid) {
          saveToCache(cleanAddress, url);
          return url;
        }
      }
    } catch {
      // Continue to next source
    }
  }

  // 7. Final fallback to generated SVG
  const fallbackImage = generateFallbackImage(cleanAddress, cleanSymbol);
  saveToCache(cleanAddress, fallbackImage);
  return fallbackImage;
}

/**
 * Clear the token logo cache
 */
export function clearTokenLogoCache(): void {
  for (const key of Object.keys(TOKEN_LOGO_CACHE)) {
    delete TOKEN_LOGO_CACHE[key];
  }
  
  if (typeof window !== 'undefined') {
    try {
      localStorage.removeItem('token_logo_cache');
      console.log('Token logo cache successfully cleared');
    } catch {
      console.error('Failed to clear token logo cache from localStorage');
    }
  }
}

/**
 * Fetches token balances for a given address on Base Mainnet
 * 
 * @param address - The wallet address to fetch balances for
 * @param chainId - The chain ID (8453 for Base Mainnet, ignored since we only support Base now)
 * @returns Promise<Token[]> - Array of tokens or empty array on error
 */
export const fetchTokenBalances = async (address: string, chainId?: number): Promise<Token[]> => {
  if (!address) {
    console.error('No address provided to fetchTokenBalances');
    return [];
  }

  try {
    if (!BLOCKCHAIN_API_KEY) {
      console.error('Missing blockchain API key');
      throw new Error('API key not configured');
    }

    // We only support Base Mainnet now
    const networkEndpoint = 'base-mainnet';
    console.log(`Fetching token balances from ${networkEndpoint} for chain ${chainId || 8453}`);

    const res = await fetch(
      `https://api.covalenthq.com/v1/${networkEndpoint}/address/${address}/balances_v2/?key=${BLOCKCHAIN_API_KEY}`,
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
          } catch {
            console.debug(`Failed to fetch alternative price data for ${token.contract_ticker_symbol}:`);
          }
        }
        
        return token;
      })
    );

    return processedTokens;
  } catch {
    console.error('Failed to fetch tokens:');
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
  } catch {
    console.debug(`DefiLlama price fetch failed for ${address}:`);
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
  } catch {
    console.debug(`CoinGecko price fetch failed for ${address}:`);
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
  } catch {
    console.error('Error formatting balance:');
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
  } catch {
    console.error('Error calculating token value:');
    return '';
  }
} 