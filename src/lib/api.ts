import { Token } from '@/types/token';
import { API_CONFIG } from '@/config/web3';

// Enhanced cache for token logo URLs with permanent storage
const TOKEN_LOGO_CACHE: Record<string, string> = {};

// Add new caches for performance optimization
const TOKEN_METADATA_CACHE: Record<string, TokenMetadata> = {};
const TOKEN_PRICE_CACHE: Record<string, {price: number, source: string, timestamp: number}> = {};

// Cache duration for prices (5 minutes)
const PRICE_CACHE_DURATION = 5 * 60 * 1000;

// Type definitions for better type safety
interface TokenMetadata {
  symbol?: string;
  name?: string;
  decimals?: number;
}

interface AlchemyTokenBalance {
  contractAddress: string;
  tokenBalance: string;
  error?: string;
}

interface AlchemyResponse {
  result?: {
    tokenBalances?: AlchemyTokenBalance[];
    pageKey?: string;
  };
}



// Load cache from localStorage if available (client-side only)
if (typeof window !== 'undefined') {
  try {
    const cachedLogos = localStorage.getItem('token_logo_cache');
    if (cachedLogos) {
      const cachedLogoData = JSON.parse(cachedLogos);
      Object.assign(TOKEN_LOGO_CACHE, cachedLogoData);
    }
    
    // Load metadata cache
    const cachedMetadata = localStorage.getItem('token_metadata_cache');
    if (cachedMetadata) {
      const cachedMetadataData = JSON.parse(cachedMetadata);
      Object.assign(TOKEN_METADATA_CACHE, cachedMetadataData);
    }
  } catch {
    console.debug('Failed to load caches from localStorage');
  }
}

/**
 * Save token logo URL to cache including localStorage
 */
const saveToCache = (address: string, url: string): void => {
  // Always save to memory cache for current session
  TOKEN_LOGO_CACHE[address] = url;
  
  // Only save to localStorage if it's NOT a fallback SVG image
  // This allows fallback images to be generated fresh each session,
  // giving external sources a chance to be retried
  if (typeof window !== 'undefined' && !url.startsWith('data:image/svg+xml')) {
    try {
      localStorage.setItem('token_logo_cache', JSON.stringify(TOKEN_LOGO_CACHE));
      console.log(`🎯 Cached external URL for ${address.substring(0, 8)}...`);
    } catch {
      console.debug('Failed to save token logo cache to localStorage');
    }
  } else if (url.startsWith('data:image/svg+xml')) {
    console.log(`⚡ Using fallback SVG for ${address.substring(0, 8)}... (not cached permanently)`);
  }
};

/**
 * Save token metadata to cache including localStorage
 */
const saveMetadataToCache = (address: string, metadata: TokenMetadata): void => {
  TOKEN_METADATA_CACHE[address] = metadata;
  
  if (typeof window !== 'undefined') {
    try {
      localStorage.setItem('token_metadata_cache', JSON.stringify(TOKEN_METADATA_CACHE));
    } catch {
      console.debug('Failed to save token metadata cache to localStorage');
    }
  }
};

/**
 * Save price data to cache with timestamp
 */
const savePriceToCache = (address: string, price: number, source: string): void => {
  TOKEN_PRICE_CACHE[address] = {
    price,
    source,
    timestamp: Date.now()
  };
};

/**
 * Get cached price if still valid
 */
const getCachedPrice = (address: string): {price: number, source: string} | null => {
  const cached = TOKEN_PRICE_CACHE[address];
  if (cached && (Date.now() - cached.timestamp) < PRICE_CACHE_DURATION) {
    return { price: cached.price, source: cached.source };
  }
  return null;
};

/**
 * Safely encode strings to base64 with fallback for problematic characters
 */
function safeEncode(str: string): string {
  if (typeof window !== 'undefined') {
    try {
      return btoa(str.replace(/[^\x00-\x7F]/g, '_'));
    } catch {
      return 'PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCA0MCA0MCIgaGVpZ2h0PSI0MCIgd2lkdGg9IjQwIj48Y2lyY2xlIGN4PSIyMCIgY3k9IjIwIiByPSIyMCIgZmlsbD0iIzYwN0Q4QiIvPjx0ZXh0IHg9IjIwIiB5PSIyNSIgZm9udC1zaXplPSIxNiIgZmlsbD0iI2ZmZiIgdGV4dC1hbmNob3I9Im1pZGRsZSI+WDwvdGV4dD48L3N2Zz4=';
    }
  }
  // Fallback for server-side rendering
  return 'PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCA0MCA0MCIgaGVpZ2h0PSI0MCIgd2lkdGg9IjQwIj48Y2lyY2xlIGN4PSIyMCIgY3k9IjIwIiByPSIyMCIgZmlsbD0iIzYwN0Q4QiIvPjx0ZXh0IHg9IjIwIiB5PSIyNSIgZm9udC1zaXplPSIxNiIgZmlsbD0iI2ZmZiIgdGV4dC1hbmNob3I9Im1pZGRsZSI+WDwvdGV4dD48L3N2Zz4=';
}

/**
 * Enhanced token logo sources with better Base blockchain coverage
 * Prioritized by reliability, speed, and CORS compatibility
 */
/**
 * SIMPLIFIED: Use only Zapper API - proven to work 100% for Base tokens
 * Analysis showed ALL successful token images come from this source
 */
const TOKEN_LOGO_SOURCES = [
  // Zapper API - The only reliable source we need for Base tokens
  (address: string) => `https://storage.googleapis.com/zapper-fi-assets/tokens/base/${address}.png`,
];

/**
 * Multiple ETH logo sources to try in order (native ETH, not WETH)
 */
const ETH_LOGO_SOURCES = [
  'https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/ethereum/info/logo.png', // TrustWallet Ethereum logo - WORKS
  'https://assets.coingecko.com/coins/images/279/small/ethereum.png', // CoinGecko ETH - WORKS
  'https://cryptologos.cc/logos/ethereum-eth-logo.png', // CryptoLogos ETH
  'https://ethereum.org/static/6b935ac0e6194247347855dc3d328e83/81d9f/eth-diamond-glyph.png' // Official Ethereum.org logo
];

/**
 * Get the best available ETH logo URL
 */
async function getBestETHLogoUrl(): Promise<string> {
  for (const logoUrl of ETH_LOGO_SOURCES) {
    try {
      const isValid = await testImageUrl(logoUrl);
      if (isValid) {
        return logoUrl;
      }
    } catch {
      continue;
    }
  }
  // If all fail, return the first one as fallback
  return ETH_LOGO_SOURCES[0];
}

/**
 * OPTIMIZED: Well-known token addresses with Zapper URLs where available
 * Using proven working Zapper API for Base tokens
 */
const COMMON_TOKENS: Record<string, string> = {
  // Native ETH (special handling for zero address) - using working TrustWallet logo
  '0x0000000000000000000000000000000000000000': 'https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/ethereum/info/logo.png',
  
  // Major Base tokens by address (lowercase) - using Zapper API
  '0x4200000000000000000000000000000000000006': 'https://storage.googleapis.com/zapper-fi-assets/tokens/base/0x4200000000000000000000000000000000000006.png', // WETH
  '0x833589fcd6edb6e08f4c7c32d4f71b54bda02913': 'https://storage.googleapis.com/zapper-fi-assets/tokens/base/0x833589fcd6edb6e08f4c7c32d4f71b54bda02913.png', // USDC
  '0x50c5725949a6f0c72e6c4a641f24049a917db0cb': 'https://storage.googleapis.com/zapper-fi-assets/tokens/base/0x50c5725949a6f0c72e6c4a641f24049a917db0cb.png', // DAI
  '0xd9aaec86b65d86f6a7b5b1b0c42ffa531710b6ca': 'https://storage.googleapis.com/zapper-fi-assets/tokens/base/0xd9aaec86b65d86f6a7b5b1b0c42ffa531710b6ca.png', // USDbC
  
  // By symbol for quick lookups
  'eth': 'https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/ethereum/info/logo.png',
  'weth': 'https://storage.googleapis.com/zapper-fi-assets/tokens/base/0x4200000000000000000000000000000000000006.png',
  'usdc': 'https://storage.googleapis.com/zapper-fi-assets/tokens/base/0x833589fcd6edb6e08f4c7c32d4f71b54bda02913.png',
  'usdt': 'https://icons.llama.fi/icons/tokens/1/0xdac17f958d2ee523a2206206994597c13d831ec7?w=64&h=64',
  'dai': 'https://storage.googleapis.com/zapper-fi-assets/tokens/base/0x50c5725949a6f0c72e6c4a641f24049a917db0cb.png',
};

/**
 * Enhanced color palettes for different token categories
 * All colors optimized for dark backgrounds with high contrast
 */
const TOKEN_COLOR_PALETTES = {
  defi: [
    { primary: '#8B5CF6', secondary: '#A78BFA', accent: '#EC4899', bg: '#1F1B2E' }, // Purple DeFi
    { primary: '#06B6D4', secondary: '#67E8F9', accent: '#10B981', bg: '#0F1B1C' }, // Cyan DeFi  
    { primary: '#F59E0B', secondary: '#FCD34D', accent: '#EF4444', bg: '#1F1611' }, // Gold DeFi
  ],
  meme: [
    { primary: '#FF6B6B', secondary: '#FFE66D', accent: '#4ECDC4', bg: '#1A0F0F' }, // Vibrant coral
    { primary: '#A8E6CF', secondary: '#88D8A3', accent: '#45B7D1', bg: '#0F1A0F' }, // Mint green
    { primary: '#FFD93D', secondary: '#6BCF7F', accent: '#4D96FF', bg: '#1A1A0F' }, // Bright yellow
  ],
  gaming: [
    { primary: '#9333EA', secondary: '#C084FC', accent: '#06D6A0', bg: '#1A0F1A' }, // Gaming purple
    { primary: '#EF4444', secondary: '#F87171', accent: '#FBBF24', bg: '#1A0F0F' }, // Gaming red
    { primary: '#3B82F6', secondary: '#60A5FA', accent: '#34D399', bg: '#0F1319' }, // Gaming blue
  ],
  stablecoin: [
    { primary: '#10B981', secondary: '#6EE7B7', accent: '#059669', bg: '#0F1A14' }, // Stable green
    { primary: '#3B82F6', secondary: '#93C5FD', accent: '#1D4ED8', bg: '#0F1319' }, // Stable blue
    { primary: '#8B5CF6', secondary: '#C4B5FD', accent: '#7C3AED', bg: '#1A0F1A' }, // Stable purple
  ],
  utility: [
    { primary: '#06B6D4', secondary: '#22D3EE', accent: '#0891B2', bg: '#0F1B1C' }, // Bright cyan
    { primary: '#F59E0B', secondary: '#FBBF24', accent: '#D97706', bg: '#1F1611' }, // Bright amber
    { primary: '#EF4444', secondary: '#F87171', accent: '#DC2626', bg: '#1A0F0F' }, // Bright red
    { primary: '#8B5CF6', secondary: '#A78BFA', accent: '#7C3AED', bg: '#1A0F1A' }, // Bright purple
    { primary: '#10B981', secondary: '#34D399', accent: '#059669', bg: '#0F1A14' }, // Bright green
    { primary: '#EC4899', secondary: '#F472B6', accent: '#DB2777', bg: '#1A0F17' }, // Bright pink
  ],
  spam: [
    { primary: '#EF4444', secondary: '#FCA5A5', accent: '#B91C1C', bg: '#1A0F0F' }, // Warning red
    { primary: '#F97316', secondary: '#FDBA74', accent: '#C2410C', bg: '#1A1207' }, // Warning orange
    { primary: '#EAB308', secondary: '#FDE047', accent: '#A16207', bg: '#1A1A0F' }, // Warning yellow
  ]
};

/**
 * Detect token category based on symbol and address for appropriate styling
 */
function detectTokenCategory(symbol: string, address: string): keyof typeof TOKEN_COLOR_PALETTES { // address used for deterministic pattern generation
  const symbolLower = symbol.toLowerCase();
  
  // Spam indicators
  const spamKeywords = ['airdrop', 'claim', 'free', 'reward', 'giveaway', 'elon', 'trump'];
  if (spamKeywords.some(keyword => symbolLower.includes(keyword))) {
    return 'spam';
  }
  
  // Stablecoin indicators
  const stablecoinKeywords = ['usd', 'dai', 'usdc', 'usdt', 'busd', 'tusd', 'frax'];
  if (stablecoinKeywords.some(keyword => symbolLower.includes(keyword))) {
    return 'stablecoin';
  }
  
  // Meme coin indicators
  const memeKeywords = ['doge', 'shib', 'pepe', 'inu', 'moon', 'safe', 'baby', 'rocket'];
  if (memeKeywords.some(keyword => symbolLower.includes(keyword))) {
    return 'meme';
  }
  
  // Gaming indicators
  const gamingKeywords = ['game', 'play', 'nft', 'meta', 'verse', 'land', 'hero', 'war'];
  if (gamingKeywords.some(keyword => symbolLower.includes(keyword))) {
    return 'gaming';
  }
  
  // DeFi indicators
  const defiKeywords = ['swap', 'pool', 'farm', 'yield', 'lp', 'vault', 'stake', 'bond'];
  if (defiKeywords.some(keyword => symbolLower.includes(keyword))) {
    return 'defi';
  }
  
  // Default to utility for unknown tokens
  return 'utility';
}

/**
 * Generate enhanced fallback SVG with gradients, shadows, and modern design
 */
function generateFallbackImage(address: string, symbol: string = ''): string {
  // Get display text (symbol initials or address hex)
  const displayText = symbol && symbol.length > 0 ? 
    symbol.substring(0, Math.min(2, symbol.length)).toUpperCase() : 
    address.substring(2, 4).toUpperCase();
  
  // Detect category and get appropriate colors
  const category = detectTokenCategory(symbol, address);
  const palettes = TOKEN_COLOR_PALETTES[category];
  
  // Use address to deterministically select palette and generate unique variations
  const addressSeed = parseInt(address.substring(2, 10), 16);
  const paletteIndex = addressSeed % palettes.length;
  const palette = palettes[paletteIndex];
  
  // Generate unique pattern based on address
  const patternSeed = parseInt(address.substring(10, 18), 16);
  const pattern = patternSeed % 3;
  
  // Removed unused rotation variable for visual variety
  
  // Create enhanced SVG with multiple design patterns
  let svgContent: string;
  
  if (pattern === 0) {
    // Pattern 0: Clean gradient with crisp text
    svgContent = `
      <svg width="48" height="48" viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <radialGradient id="grad_${addressSeed}" cx="50%" cy="50%" r="60%">
            <stop offset="0%" style="stop-color:${palette.secondary}" />
            <stop offset="100%" style="stop-color:${palette.primary}" />
          </radialGradient>
        </defs>
        <!-- Background circle -->
        <circle cx="24" cy="24" r="23" fill="${palette.bg}" stroke="${palette.primary}" stroke-width="1"/>
        <!-- Main gradient circle -->
        <circle cx="24" cy="24" r="21" fill="url(#grad_${addressSeed})"/>
        <!-- Clean text with perfect centering -->
        <text x="24" y="24" 
              font-family="system-ui, -apple-system, 'Segoe UI', Arial, sans-serif" 
              font-size="16" 
              font-weight="600" 
              text-anchor="middle" 
              fill="#FFFFFF" 
              dominant-baseline="central"
              text-rendering="optimizeLegibility">${displayText}</text>
      </svg>`;
  } else if (pattern === 1) {
    // Pattern 1: Simple linear gradient with clean text
    svgContent = `
      <svg width="48" height="48" viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <linearGradient id="linear_${addressSeed}" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" style="stop-color:${palette.primary}" />
            <stop offset="100%" style="stop-color:${palette.accent}" />
          </linearGradient>
        </defs>
        <!-- Background -->
        <circle cx="24" cy="24" r="23" fill="${palette.bg}" stroke="${palette.accent}" stroke-width="1"/>
        <!-- Main circle -->
        <circle cx="24" cy="24" r="21" fill="url(#linear_${addressSeed})"/>
        <!-- Clean text with perfect centering -->
        <text x="24" y="24" 
              font-family="system-ui, -apple-system, 'Segoe UI', Arial, sans-serif" 
              font-size="16" 
              font-weight="600" 
              text-anchor="middle" 
              fill="#FFFFFF" 
              dominant-baseline="central"
              text-rendering="optimizeLegibility">${displayText}</text>
      </svg>`;
  } else {
    // Pattern 2: Solid color with accent border - maximum clarity
    svgContent = `
      <svg width="48" height="48" viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg">
        <!-- Background -->
        <circle cx="24" cy="24" r="23" fill="${palette.bg}" stroke="${palette.accent}" stroke-width="2"/>
        <!-- Main solid circle -->
        <circle cx="24" cy="24" r="20" fill="${palette.primary}"/>
        <!-- Accent ring -->
        <circle cx="24" cy="24" r="18" fill="none" stroke="${palette.secondary}" stroke-width="1" opacity="0.6"/>
        <!-- Ultra-clean text with perfect centering -->
        <text x="24" y="24" 
              font-family="system-ui, -apple-system, 'Segoe UI', Arial, sans-serif" 
              font-size="16" 
              font-weight="700" 
              text-anchor="middle" 
              fill="#FFFFFF" 
              dominant-baseline="central"
              text-rendering="optimizeLegibility"
              shape-rendering="crispEdges">${displayText}</text>
      </svg>`;
  }
  
  // Create data URI and cache it
  const dataUri = `data:image/svg+xml;base64,${safeEncode(svgContent.trim())}`;
  saveToCache(address, dataUri);
  return dataUri;
}

/**
 * Optimized logo URL testing with faster timeout
 */
const testImageUrl = async (url: string): Promise<boolean> => {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 1000); // Increased from 300ms to 1000ms for reliability
    
    const response = await fetch(url, {
      method: 'HEAD',
      signal: controller.signal
    });
    
    clearTimeout(timeoutId);
    return response.ok;
  } catch {
    return false;
  }
};

/**
 * Track success rates of different image sources for analysis
 */
const IMAGE_SOURCE_STATS = {
  zapper: 0,
  defillama_tokens: 0, 
  defillama_base: 0,
  web3icons: 0,
  basescan: 0,
  coingecko: 0,
  oneinch: 0,
  moralis: 0,
  trustwallet: 0,
  fallback_svg: 0
};

/**
 * Log which image source was successful (for analysis and simplification)
 */


/**
 * Export current image source statistics for analysis
 */
export function getImageSourceStats(): typeof IMAGE_SOURCE_STATS {
  return { ...IMAGE_SOURCE_STATS };
}

/**
 * Log current image source statistics to console
 */
export function logImageSourceStats(): void {
  console.log('📊 Image Source Success Statistics:', IMAGE_SOURCE_STATS);
  const total = Object.values(IMAGE_SOURCE_STATS).reduce((sum, count) => sum + count, 0);
  if (total > 0) {
    console.log('📈 Success Percentages:');
    Object.entries(IMAGE_SOURCE_STATS).forEach(([source, count]) => {
      if (count > 0) {
        console.log(`  ${source}: ${count} (${Math.round((count / total) * 100)}%)`);
      }
    });
  }
}

// Make stats available in browser console for analysis
if (typeof window !== 'undefined') {
  (window as unknown as { getImageStats: typeof getImageSourceStats; logImageStats: typeof logImageSourceStats }).getImageStats = getImageSourceStats;
  (window as unknown as { getImageStats: typeof getImageSourceStats; logImageStats: typeof logImageSourceStats }).logImageStats = logImageSourceStats;
  console.log('💡 Image source analysis available: Run getImageStats() or logImageStats() in console');
}

/**
 * Enhanced token logo resolver with optimized performance
 */
export async function getTokenLogoUrl(address: string, symbol: string = ''): Promise<string> {
  const cleanAddress = address?.toLowerCase();
  const cleanSymbol = symbol?.toLowerCase();
  
  // Special handling for ETH (native or wrapped)
  if (!cleanAddress || 
      cleanAddress === '0x0000000000000000000000000000000000000000' || 
      cleanAddress === '0x4200000000000000000000000000000000000006' ||
      cleanSymbol === 'eth' || 
      cleanSymbol === 'weth') {
    
    const ethLogoUrl = await getBestETHLogoUrl();
    const cacheKey = cleanAddress || '0x0000000000000000000000000000000000000000';
    saveToCache(cacheKey, ethLogoUrl);
    return ethLogoUrl;
  }

  // 1. Check cache first
  if (TOKEN_LOGO_CACHE[cleanAddress]) {
    console.log(`🎯 Image source success: cache (${TOKEN_LOGO_CACHE[cleanAddress].substring(0, 50)}...)`);
    return TOKEN_LOGO_CACHE[cleanAddress];
  }

  // 2. Check common tokens for immediate return
  if (COMMON_TOKENS[cleanAddress]) {
    const logoUrl = COMMON_TOKENS[cleanAddress];
    console.log(`🎯 Image source success: common_tokens (${logoUrl.substring(0, 50)}...)`);
    saveToCache(cleanAddress, logoUrl);
    return logoUrl;
  }

  // 3. More conservative spam filtering - only skip obvious spam
  if (cleanSymbol) {
    const highConfidenceSpam = ['airdrop', 'claim', 'free', 'giveaway', 'reward'];
    if (highConfidenceSpam.some(spam => cleanSymbol.includes(spam))) {
      const fallback = generateFallbackImage(cleanAddress, cleanSymbol);
      saveToCache(cleanAddress, fallback);
      return fallback;
    }
  }
  
  // 4. Try Zapper API (our only source now)
  try {
    const logoUrl = TOKEN_LOGO_SOURCES[0](cleanAddress);
    const isValid = await testImageUrl(logoUrl);
    
    if (isValid) {
      console.log(`🎯 Image source success: zapper (${logoUrl})`);
      IMAGE_SOURCE_STATS.zapper++;
      saveToCache(cleanAddress, logoUrl);
      return logoUrl;
    }
  } catch {
    console.log(`❌ Zapper API failed for ${cleanSymbol || cleanAddress.substring(0, 8)}`);
  }

  // 5. Generate enhanced fallback
  IMAGE_SOURCE_STATS.fallback_svg++;
  console.log(`🎨 Using SVG fallback for ${cleanSymbol || cleanAddress.substring(0, 8)}`);
  const fallback = generateFallbackImage(cleanAddress, cleanSymbol);
  saveToCache(cleanAddress, fallback);
  return fallback;
}

/**
 * Clear the token logo cache (enhanced to clear ETH cache specifically)
 */
export function clearTokenLogoCache(): void {
  // Clear memory cache
  for (const key of Object.keys(TOKEN_LOGO_CACHE)) {
    delete TOKEN_LOGO_CACHE[key];
  }
  
  // Clear localStorage cache
  if (typeof window !== 'undefined') {
    try {
      localStorage.removeItem('token_logo_cache');
      // Also clear any ETH-specific cache entries
      const ethAddresses = [
        '0x0000000000000000000000000000000000000000',
        '0x4200000000000000000000000000000000000006'
      ];
      ethAddresses.forEach(addr => {
        delete TOKEN_LOGO_CACHE[addr];
      });
      console.log('Token logo cache manually cleared (including ETH logos)');
    } catch {
      console.error('Failed to clear token logo cache from localStorage');
    }
  }
}

/**
 * Clear only outdated SVG fallback images while preserving successful external URLs
 */
export function clearOutdatedFallbacks(): void {
  if (typeof window !== 'undefined') {
    let clearedCount = 0;
    Object.keys(TOKEN_LOGO_CACHE).forEach(key => {
      if (TOKEN_LOGO_CACHE[key].startsWith('data:image/svg+xml')) {
        delete TOKEN_LOGO_CACHE[key];
        clearedCount++;
      }
    });
    
    if (clearedCount > 0) {
      console.log(`Cleared ${clearedCount} outdated SVG fallback images`);
      // Update localStorage
      try {
        localStorage.setItem('token_logo_cache', JSON.stringify(TOKEN_LOGO_CACHE));
      } catch {
        console.debug('Failed to update localStorage after fallback cleanup');
      }
    }
  }
}

/**
 * Token balance fetching using Alchemy API - PERFORMANCE OPTIMIZED
 * 
 * @param address - The wallet address to fetch balances for
 * @param chainId - The chain ID (8453 for Base Mainnet)
 * @param onProgress - Optional callback to report discovery progress
 * @returns Promise<Token[]> - Array of tokens or empty array on error
 */
export const fetchTokenBalances = async (
  address: string, 
  chainId?: number,
  onProgress?: (discovered: number, phase: string) => void
): Promise<Token[]> => {
  if (!address) {
    console.error('No address provided to fetchTokenBalances');
    return [];
  }

  try {
    console.log(`Fetching token balances for chain ${chainId || 8453}`);
    
    // Use Alchemy API for token discovery
    if (API_CONFIG.ALCHEMY_API_KEY) {
      console.log('Using Alchemy API for token discovery...');
      
      // Fetch ERC-20 tokens and native ETH balance in parallel
      const [alchemyTokens, ethBalance] = await Promise.all([
        fetchTokensFromAlchemy(address, onProgress),
        fetchNativeETHBalance(address)
      ]);
      
      const allTokens = [...alchemyTokens];
      
      // Add ETH to the list if balance > 0
      if (ethBalance && parseFloat(ethBalance.balance) > 0) {
        allTokens.unshift(ethBalance); // Add ETH at the beginning
        console.log(`Added native ETH balance: ${formatBalance(ethBalance.balance, ethBalance.contract_decimals)} ETH`);
        
        // Report progress including ETH
        onProgress?.(allTokens.length, 'ETH balance added');
      }
      
      if (allTokens.length > 0) {
        console.log(`Successfully discovered ${allTokens.length} tokens with balances (including ETH)`);
        
        // Report sorting phase
        onProgress?.(allTokens.length, 'Sorting by value');
        
        // Sort tokens by USD value (descending)
        allTokens.sort((a, b) => {
          const valueA = parseFloat(calculateTokenValue(
            formatBalance(a.balance, a.contract_decimals), 
            a.quote_rate
          ) || '0');
          const valueB = parseFloat(calculateTokenValue(
            formatBalance(b.balance, b.contract_decimals), 
            b.quote_rate
          ) || '0');
          
          return valueB - valueA; // Descending order (highest value first)
        });
        
        // Debug: Log some sample tokens with their values
        const sampleTokens = allTokens.slice(0, 5).map(token => ({
          symbol: token.contract_ticker_symbol,
          balance: formatBalance(token.balance, token.contract_decimals),
          usdValue: calculateTokenValue(formatBalance(token.balance, token.contract_decimals), token.quote_rate)
        }));
        console.log('Top 5 tokens by value:', sampleTokens);
        
        onProgress?.(allTokens.length, 'Complete');
        return allTokens;
      }
      console.log('No tokens found in wallet');
      return [];
    }
    
    throw new Error('No Alchemy API key configured - please add NEXT_PUBLIC_ALCHEMY_API_KEY to your .env.local file');
    
  } catch (error) {
    console.error('Failed to fetch tokens:', error);
    return [];
  }
};

/**
 * PERFORMANCE OPTIMIZED: Fetch tokens using Alchemy Token API with batched processing
 */
async function fetchTokensFromAlchemy(address: string, onProgress?: (discovered: number, phase: string) => void): Promise<Token[]> {
  const ALCHEMY_API_KEY = API_CONFIG.ALCHEMY_API_KEY;
  if (!ALCHEMY_API_KEY) return [];

  const allTokenBalances: AlchemyTokenBalance[] = [];
  let pageKey: string | undefined = undefined;
  let page = 1;

  try {
    // Step 1: Collect all token balances with pagination
    do {
      console.log(`Fetching page ${page} of tokens from Alchemy...`);
      
      // User-friendly progress messages instead of technical "scanning page X"
      if (page === 1) {
        onProgress?.(allTokenBalances.length, 'Connecting to Base network');
      } else {
        onProgress?.(allTokenBalances.length, 'Discovering more tokens');
      }
      
      const requestBody = {
        id: 1,
        jsonrpc: '2.0',
        method: 'alchemy_getTokenBalances',
        params: [
          address,
          "erc20", // Get ALL ERC-20 tokens, not just a specific list
          ...(pageKey ? [{ pageKey }] : [{}]) // Add pagination options if pageKey exists
        ]
      };

      const response: Response = await fetch(
        `https://base-mainnet.g.alchemy.com/v2/${ALCHEMY_API_KEY}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(requestBody)
        }
      );

      if (!response.ok) {
        console.warn('Alchemy API error:', response.status);
        break;
      }

      const data: AlchemyResponse = await response.json();
      const tokens = data.result?.tokenBalances || [];
      pageKey = data.result?.pageKey; // Get next page key

      console.log(`Page ${page}: Alchemy returned ${tokens.length} tokens${pageKey ? ' (more pages available)' : ' (final page)'}`);

      // Filter tokens with non-zero balances and meaningful amounts
      const nonZeroTokens = tokens.filter((token: AlchemyTokenBalance) => {
        if (!token.tokenBalance || token.error) return false;
        
        // Convert hex to decimal to check if truly zero
        const balanceDecimal = parseInt(token.tokenBalance, 16);
        
        // FIXED: Much less aggressive dust filtering - only filter truly microscopic amounts
        // This keeps legitimate small holdings while filtering extreme dust
        return balanceDecimal > 0; // Show all non-zero balances - let user decide what's valuable
      });

      console.log(`Page ${page}: After filtering zero balances: ${nonZeroTokens.length} tokens`);
      
      allTokenBalances.push(...nonZeroTokens);
      
      // Report progress with accumulating token count - user-friendly messages
      if (allTokenBalances.length > 0) {
        onProgress?.(allTokenBalances.length, `Discovered ${allTokenBalances.length} tokens`);
      }
      
      page++;
      
      // Safety break to prevent infinite loops
      if (page > 10) {
        console.warn('Reached maximum page limit (10) for safety');
        break;
      }
      
    } while (pageKey);

    if (allTokenBalances.length === 0) {
      console.log('No tokens with balances found');
      return [];
    }

    // OPTIMIZATION: Sort by balance size and prioritize larger holdings
    // This ensures we process the most valuable tokens first
    allTokenBalances.sort((a, b) => {
      const balanceA = parseInt(a.tokenBalance, 16);
      const balanceB = parseInt(b.tokenBalance, 16);
      return balanceB - balanceA; // Descending order (largest first)
    });

    // FIXED: Remove token limit - show all user's tokens
    // Users want to see everything they hold, even small amounts
    console.log(`Found ${allTokenBalances.length} tokens to process`);

    // Step 2: PERFORMANCE OPTIMIZATION - Batch process all tokens
    const contractAddresses = allTokenBalances.map(token => token.contractAddress);
    
    console.log('Starting batch processing for metadata, prices, and logos...');
    onProgress?.(allTokenBalances.length, 'Fetching metadata');
    
    // Fetch metadata and prices in parallel batches
    const [metadataMap, pricesMap] = await Promise.all([
      fetchTokensMetadataBatch(contractAddresses),
      fetchTokenPricesBatch(contractAddresses)
    ]);

    console.log('Batch processing complete, processing individual tokens...');
    onProgress?.(allTokenBalances.length, 'Processing tokens');

    // Step 3: Process tokens with batched data
    const processedTokens = await Promise.all(
      allTokenBalances.map(async (token: AlchemyTokenBalance) => {
        const contractAddress = token.contractAddress;
        
        // Get metadata from batch results
        const metadata = metadataMap[contractAddress] || { symbol: '', name: '', decimals: 18 };
        
        // Get price from batch results
        const priceData = pricesMap[contractAddress] || { price: 0, source: 'none' };
        
        // Get token logo URL (this can be async since it's cached efficiently)
        const logoUrl = await getTokenLogoUrl(contractAddress, metadata.symbol || '');
        
        // Convert hex balance to decimal string for easier processing
        const balanceDecimal = parseInt(token.tokenBalance, 16);
        
        return {
          contract_address: contractAddress,
          contract_ticker_symbol: metadata.symbol || '',
          contract_name: metadata.name || '',
          balance: balanceDecimal.toString(),
          contract_decimals: metadata.decimals || 18,
          quote_rate: priceData.price,
          logo_url: logoUrl,
          price_source: priceData.source
        };
      })
    );

    console.log(`Successfully processed ${processedTokens.length} tokens with optimized batching`);
    onProgress?.(processedTokens.length, 'Loading complete');
    return processedTokens;
    
  } catch (error) {
    console.debug('Alchemy token fetch failed:', error);
    return [];
  }
}

/**
 * PERFORMANCE OPTIMIZED: Batch fetch token metadata from Alchemy
 * Reduces API calls from N requests to ceil(N/20) requests
 */
async function fetchTokensMetadataBatch(contractAddresses: string[]): Promise<Record<string, TokenMetadata>> {
  const ALCHEMY_API_KEY = API_CONFIG.ALCHEMY_API_KEY;
  if (!ALCHEMY_API_KEY || contractAddresses.length === 0) return {};

  const results: Record<string, TokenMetadata> = {};
  
  // Check cache first
  const uncachedAddresses: string[] = [];
  contractAddresses.forEach(address => {
    const cached = TOKEN_METADATA_CACHE[address.toLowerCase()];
    if (cached) {
      results[address] = cached;
    } else {
      uncachedAddresses.push(address);
    }
  });

  if (uncachedAddresses.length === 0) {
    return results;
  }

  console.log(`Fetching metadata for ${uncachedAddresses.length} tokens individually (Alchemy doesn't support batch metadata)`);

  // NOTE: Alchemy doesn't support batch metadata requests (alchemy_getTokensMetadata doesn't exist)
  // Using individual requests with alchemy_getTokenMetadata
  console.log(`Processing individual metadata requests for ${uncachedAddresses.length} tokens`);
  
  for (const address of uncachedAddresses) {
    const metadata = await fetchTokenMetadataFromAlchemy(address);
    results[address] = metadata;
    
    // Small delay to be respectful to the API
    await new Promise(resolve => setTimeout(resolve, 10));
  }

  return results;
}

/**
 * PERFORMANCE OPTIMIZED: Batch fetch token prices from DeFiLlama
 * Reduces API calls from N requests to chunked batch requests with proper fallbacks
 */
async function fetchTokenPricesBatch(contractAddresses: string[]): Promise<Record<string, {price: number, source: string}>> {
  const results: Record<string, {price: number, source: string}> = {};
  
  if (contractAddresses.length === 0) return results;

  // Check cache first
  const uncachedAddresses: string[] = [];
  contractAddresses.forEach(address => {
    const cached = getCachedPrice(address.toLowerCase());
    if (cached) {
      results[address] = cached;
    } else {
      uncachedAddresses.push(address);
    }
  });

  if (uncachedAddresses.length === 0) {
    return results;
  }

  console.log(`Fetching prices for ${uncachedAddresses.length} tokens in chunks`);

  // FIXED: Use smaller chunks to avoid URL length limits and CORS issues
  const CHUNK_SIZE = 20; // Much smaller chunks to avoid URL limits
  const chunks = [];
  
  for (let i = 0; i < uncachedAddresses.length; i += CHUNK_SIZE) {
    chunks.push(uncachedAddresses.slice(i, i + CHUNK_SIZE));
  }

  console.log(`Processing ${chunks.length} chunks of up to ${CHUNK_SIZE} tokens each`);

  // Process chunks sequentially to avoid overwhelming the API
  for (let i = 0; i < chunks.length; i++) {
    const chunk = chunks[i];
    console.log(`Processing chunk ${i + 1}/${chunks.length} with ${chunk.length} tokens`);
    
    try {
      // Try batch request for this chunk
      const addressList = chunk.map(addr => `base:${addr}`).join(',');
      const response = await fetch(`https://coins.llama.fi/prices/current/${addressList}`);
      
      if (response.ok) {
        const data = await response.json();
        
        chunk.forEach(address => {
          const priceKey = `base:${address.toLowerCase()}`;
          const price = data.coins?.[priceKey]?.price || 0;
          const result = { price, source: price > 0 ? 'defillama' : 'none' };
          
          results[address] = result;
          if (price > 0) {
            savePriceToCache(address.toLowerCase(), price, 'defillama');
          }
        });
        
        console.log(`Successfully fetched prices for chunk ${i + 1} (${chunk.length} tokens)`);
      } else {
        console.warn(`Batch request failed for chunk ${i + 1}, status: ${response.status}`);
        // Fallback to individual requests for this chunk
        await processBatchFallback(chunk, results);
      }
    } catch (error) {
      console.warn(`Batch request failed for chunk ${i + 1}:`, error);
      // Fallback to individual requests for this chunk
      await processBatchFallback(chunk, results);
    }
    
    // Small delay between chunks to be respectful to the API
    if (i < chunks.length - 1) {
      await new Promise(resolve => setTimeout(resolve, 100));
    }
  }

  return results;
}

/**
 * Fallback to individual price requests when batch fails
 */
async function processBatchFallback(addresses: string[], results: Record<string, {price: number, source: string}>) {
  console.log(`Falling back to individual requests for ${addresses.length} tokens`);
  
  for (const address of addresses) {
    try {
      const price = await fetchDefiLlamaPrice(address);
      const result = { price, source: price > 0 ? 'defillama' : 'none' };
      results[address] = result;
      if (price > 0) {
        savePriceToCache(address.toLowerCase(), price, 'defillama');
      }
    } catch {
      results[address] = { price: 0, source: 'none' };
    }
    
    // Small delay between individual requests
    await new Promise(resolve => setTimeout(resolve, 50));
  }
}

/**
 * Fetch token metadata from Alchemy (fallback for individual requests)
 */
async function fetchTokenMetadataFromAlchemy(contractAddress: string): Promise<TokenMetadata> {
  const ALCHEMY_API_KEY = API_CONFIG.ALCHEMY_API_KEY;
  if (!ALCHEMY_API_KEY) return {};

  // Check cache first
  const cached = TOKEN_METADATA_CACHE[contractAddress.toLowerCase()];
  if (cached) return cached;

  try {
    const response = await fetch(
      `https://base-mainnet.g.alchemy.com/v2/${ALCHEMY_API_KEY}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: 1,
          jsonrpc: '2.0',
          method: 'alchemy_getTokenMetadata',
          params: [contractAddress]
        })
      }
    );

    if (!response.ok) return {};

    const data = await response.json();
    const metadata = data.result || {};
    
    // Cache the result
    saveMetadataToCache(contractAddress.toLowerCase(), metadata);
    
    return metadata;
  } catch (error) {
    console.debug('Token metadata fetch failed:', error);
    return {};
  }
}

/**
 * Enhanced price fetching from multiple sources (fallback function)
 */
async function fetchTokenPriceFromMultipleSources(
  contractAddress: string
): Promise<{price: number, source: string}> {
  
  // Check cache first
  const cached = getCachedPrice(contractAddress.toLowerCase());
  if (cached) return cached;
  
  // Use DeFiLlama as primary and only source (no rate limits, excellent Base coverage)
  try {
    const defiLlamaPrice = await fetchDefiLlamaPrice(contractAddress);
    if (defiLlamaPrice > 0) {
      savePriceToCache(contractAddress.toLowerCase(), defiLlamaPrice, 'defillama');
      return { price: defiLlamaPrice, source: 'defillama' };
    }
  } catch (error) {
    console.debug('DeFiLlama price fetch failed:', error);
  }

  // No fallback needed - DeFiLlama has excellent coverage and no rate limits
  return { price: 0, source: 'none' };
}

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

/**
 * Fetch native ETH balance
 */
async function fetchNativeETHBalance(address: string): Promise<Token | null> {
  const ALCHEMY_API_KEY = API_CONFIG.ALCHEMY_API_KEY;
  if (!ALCHEMY_API_KEY) return null;

  try {
    const response = await fetch(
      `https://base-mainnet.g.alchemy.com/v2/${ALCHEMY_API_KEY}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: 1,
          jsonrpc: '2.0',
          method: 'eth_getBalance',
          params: [address, 'latest']
        })
      }
    );

    if (!response.ok) return null;

    const data = await response.json();
    const balanceHex = data.result;
    
    if (!balanceHex || balanceHex === '0x0') return null;

    // Convert hex balance to decimal string
    const balanceDecimal = parseInt(balanceHex, 16);
    
    if (balanceDecimal === 0) return null;

    // Get ETH price from DeFiLlama using wrapped ETH address for price lookup
    let ethPrice = 0;
    let priceSource = 'none';
    
    try {
      const priceData = await fetchTokenPriceFromMultipleSources(
        '0x4200000000000000000000000000000000000006' // Wrapped ETH on Base for price lookup
      );
      ethPrice = priceData.price;
      priceSource = priceData.source;
    } catch (error) {
      console.debug('Failed to fetch ETH price:', error);
    }

    // Get ETH logo using native ETH address (zero address) to trigger our special handling
    const logoUrl = await getTokenLogoUrl(
      '0x0000000000000000000000000000000000000000', // Use native ETH address for logo lookup
      'ETH'
    );
    
    return {
      contract_address: '0x0000000000000000000000000000000000000000', // Native ETH doesn't have a contract
      contract_ticker_symbol: 'ETH',
      contract_name: 'Ethereum',
      balance: balanceDecimal.toString(),
      contract_decimals: 18,
      quote_rate: ethPrice,
      logo_url: logoUrl,
      price_source: priceSource
    };
    
  } catch (error) {
    console.debug('ETH balance fetch failed:', error);
    return null;
  }
} 