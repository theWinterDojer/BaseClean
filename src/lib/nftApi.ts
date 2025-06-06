import { NFT } from '@/types/nft';
import { API_CONFIG } from '@/config/web3';
import { NFT_IMAGE_SOURCES, NFT_PAGINATION } from '@/constants/nfts';

// Cache for NFT images and metadata with permanent storage
const NFT_IMAGE_CACHE: Record<string, string> = {};
const NFT_METADATA_CACHE: Record<string, AlchemyNFTMetadata> = {};

// Cache duration for NFT data (10 minutes)
const NFT_CACHE_DURATION = 10 * 60 * 1000;

// Type definitions for Alchemy NFT API responses
interface AlchemyNFTMetadata {
  name?: string;
  description?: string;
  image?: string;
  external_url?: string;
  attributes?: Array<{
    trait_type: string;
    value: string | number;
  }>;
}

interface AlchemyNFTContract {
  address: string;
  name?: string;
  symbol?: string;
  totalSupply?: string;
  tokenType: 'ERC721' | 'ERC1155';
}

interface AlchemyNFT {
  contract: AlchemyNFTContract;
  tokenId: string;
  tokenType: 'ERC721' | 'ERC1155';
  name?: string;
  description?: string;
  image?: {
    cachedUrl?: string;
    thumbnailUrl?: string;
    pngUrl?: string;
    contentType?: string;
    size?: number;
    originalUrl?: string;
  };
  raw?: {
    metadata?: AlchemyNFTMetadata;
    tokenUri?: string;
  };
  collection?: {
    name?: string;
    slug?: string;
    externalUrl?: string;
    bannerImageUrl?: string;
  };
  mint?: {
    mintAddress?: string;
    blockNumber?: number;
    timestamp?: string;
    transactionHash?: string;
  };
  balance?: string; // For ERC1155
}

interface AlchemyNFTResponse {
  ownedNfts: AlchemyNFT[];
  totalCount: number;
  pageKey?: string;
}

// Cache helper functions
const saveToNFTImageCache = (key: string, url: string): void => {
  NFT_IMAGE_CACHE[key] = url;
  
  // Save to localStorage for persistence
  if (typeof window !== 'undefined') {
    try {
      localStorage.setItem(`nft_image_${key}`, url);
    } catch (error) {
      console.debug('Failed to save NFT image to localStorage:', error);
    }
  }
};

const getCachedNFTImage = (key: string): string | null => {
  // Check memory cache first
  if (NFT_IMAGE_CACHE[key]) {
    return NFT_IMAGE_CACHE[key];
  }
  
  // Check localStorage
  if (typeof window !== 'undefined') {
    try {
      const cached = localStorage.getItem(`nft_image_${key}`);
      if (cached) {
        NFT_IMAGE_CACHE[key] = cached; // Restore to memory cache
        return cached;
      }
    } catch (error) {
      console.debug('Failed to read NFT image from localStorage:', error);
    }
  }
  
  return null;
};

const saveMetadataToNFTCache = (key: string, metadata: AlchemyNFTMetadata): void => {
  NFT_METADATA_CACHE[key] = metadata;
  
  // Save to localStorage for persistence
  if (typeof window !== 'undefined') {
    try {
      localStorage.setItem(`nft_metadata_${key}`, JSON.stringify(metadata));
    } catch (error) {
      console.debug('Failed to save NFT metadata to localStorage:', error);
    }
  }
};

/**
 * Get NFT image URL with fallback sources and caching
 */
export async function getNFTImageUrl(contractAddress: string, tokenId: string, alchemyImage?: AlchemyNFT['image']): Promise<string> {
  const cacheKey = `${contractAddress}_${tokenId}`;
  
  // Check cache first
  const cached = getCachedNFTImage(cacheKey);
  if (cached) {
    return cached;
  }
  
  // Try Alchemy-provided image first
  if (alchemyImage) {
    const alchemyUrls = [
      alchemyImage.cachedUrl,
      alchemyImage.thumbnailUrl,
      alchemyImage.pngUrl,
      alchemyImage.originalUrl
    ].filter((url): url is string => Boolean(url)).filter(isValidImageUrl); // Pre-filter invalid URLs
    
    console.debug(`🖼️ Testing ${alchemyUrls.length} Alchemy image URLs for ${contractAddress}/${tokenId}`);
    
    for (const url of alchemyUrls) {
      if (url && await testImageUrl(url)) {
        console.debug(`✅ NFT image found: ${url.substring(0, 50)}...`);
        saveToNFTImageCache(cacheKey, url);
        return url;
      }
    }
  }
  
  // Try fallback sources
  for (const sourceFunc of NFT_IMAGE_SOURCES) {
    try {
      const url = sourceFunc(contractAddress, tokenId);
      if (url && await testImageUrl(url)) {
        saveToNFTImageCache(cacheKey, url);
        return url;
      }
    } catch (error) {
      console.debug(`NFT image source failed for ${contractAddress}/${tokenId}:`, error);
    }
  }
  
  // Return final fallback
  const fallbackUrl = NFT_IMAGE_SOURCES[NFT_IMAGE_SOURCES.length - 1](contractAddress, tokenId);
  saveToNFTImageCache(cacheKey, fallbackUrl);
  return fallbackUrl;
}

/**
 * Validate if a URL looks like a valid image URL before testing
 */
const isValidImageUrl = (url: string): boolean => {
  try {
    const parsedUrl = new URL(url);
    
    // Check for invalid domains known to cause issues
    const invalidDomains = [
      'n1create.pages.dev',  // Known broken domain from logs
    ];
    
    if (invalidDomains.some(domain => parsedUrl.hostname.includes(domain))) {
      return false;
    }
    
    // Check for obviously invalid Cloudinary URLs (400 errors in logs)
    if (parsedUrl.hostname.includes('cloudinary.com') && 
        (parsedUrl.pathname.includes('/video/upload/') || 
         parsedUrl.pathname.includes('convert-png'))) {
      return false;
    }
    
    // Basic URL validation
    return parsedUrl.protocol === 'http:' || parsedUrl.protocol === 'https:';
  } catch {
    return false;
  }
};

/**
 * Test if an image URL is valid and loads successfully
 * Suppresses console errors from expected test failures
 */
const testImageUrl = async (url: string): Promise<boolean> => {
  // Pre-validate URL to avoid testing obviously broken ones
  if (!isValidImageUrl(url)) {
    return false;
  }
  
  return new Promise((resolve) => {
    const img = new Image();
    const timeout = setTimeout(() => {
      resolve(false);
    }, 1000); // Reduced timeout to 1 second for faster testing
    
    img.onload = () => {
      clearTimeout(timeout);
      resolve(true);
    };
    
    img.onerror = () => {
      clearTimeout(timeout);
      resolve(false);
    };
    
    // Suppress the console error by setting crossOrigin to handle CORS gracefully
    img.crossOrigin = 'anonymous';
    img.src = url;
  });
};

// Chain configuration for multi-chain NFT support
const CHAIN_CONFIG = {
  8453: { // Base Mainnet
    name: 'Base',
    rpcUrl: 'base-mainnet.g.alchemy.com',
    emoji: '🟦'
  },
  7777777: { // Zora Mainnet
    name: 'Zora',
    rpcUrl: 'zora-mainnet.g.alchemy.com',
    emoji: '🌈'
  }
} as const;

/**
 * Enhanced NFT fetching with multi-chain support and comprehensive debugging
 * @param address - The wallet address to fetch NFTs for
 * @param chainIds - Array of chain IDs to fetch from (defaults to [8453, 7777777] for Base and Zora)
 * @returns Promise<NFT[]> - Array of NFTs from all chains or empty array on error
 */
export const fetchNFTs = async (address: string, chainIds?: number[]): Promise<NFT[]> => {
  if (!address) {
    console.error('❌ No address provided to fetchNFTs');
    return [];
  }

  const chains = chainIds || [8453, 7777777]; // Default to Base and Zora
  console.log(`🔍 Fetching NFTs for address: ${address} on chains: ${chains.map(id => CHAIN_CONFIG[id as keyof typeof CHAIN_CONFIG]?.name || id).join(', ')}`);

  try {
    // Use Alchemy API for NFT discovery
    if (API_CONFIG.ALCHEMY_API_KEY) {
      console.log('🔑 Using Alchemy API for multi-chain NFT discovery...');
      console.log(`🌐 API Key configured: ${API_CONFIG.ALCHEMY_API_KEY.substring(0, 10)}...`);
      
      // Fetch NFTs from all chains in parallel
      const chainPromises = chains.map(chainId => fetchNFTsFromAlchemy(address, chainId));
      const chainResults = await Promise.allSettled(chainPromises);
      
      // Combine results from all chains
      const allNFTs: NFT[] = [];
      chainResults.forEach((result, index) => {
        const chainId = chains[index];
        const chainName = CHAIN_CONFIG[chainId as keyof typeof CHAIN_CONFIG]?.name || `Chain ${chainId}`;
        
        if (result.status === 'fulfilled') {
          const nfts = result.value;
          console.log(`✅ ${chainName}: Found ${nfts.length} NFTs`);
          allNFTs.push(...nfts);
        } else {
          console.error(`❌ ${chainName}: Failed to fetch NFTs:`, result.reason);
        }
      });
      
      if (allNFTs.length > 0) {
        console.log(`✅ Successfully discovered ${allNFTs.length} total NFTs across all chains`);
        
                 // Sort NFTs by chain, then collection, then token ID
         allNFTs.sort((a, b) => {
           // First sort by chain (Base first, then Zora)
           const aChain = (a.metadata?.chainId as number) || 8453;
           const bChain = (b.metadata?.chainId as number) || 8453;
           if (aChain !== bChain) {
             return aChain === 8453 ? -1 : 1; // Base first
           }
           
           // Then by collection
           const contractComparison = a.contract_address.localeCompare(b.contract_address);
           if (contractComparison !== 0) return contractComparison;
           
           // Finally by token ID numerically
           const aTokenId = parseInt(a.token_id);
           const bTokenId = parseInt(b.token_id);
           
           if (!isNaN(aTokenId) && !isNaN(bTokenId)) {
             return aTokenId - bTokenId;
           }
           
           return a.token_id.localeCompare(b.token_id);
         });
        
        return allNFTs;
      }
      
      console.log('ℹ️ No NFTs found in wallet across any supported chains');
      return [];
    }
    
    throw new Error('❌ No Alchemy API key configured - please add NEXT_PUBLIC_ALCHEMY_API_KEY to your .env.local file');
    
  } catch (error) {
    console.error('❌ Failed to fetch NFTs:', error);
    return [];
  }
};

/**
 * PERFORMANCE OPTIMIZED: Fetch NFTs using Alchemy NFT REST API with pagination and debugging
 * @param address - Wallet address to fetch NFTs for
 * @param chainId - Chain ID to fetch from (8453 for Base, 7777777 for Zora)
 */
async function fetchNFTsFromAlchemy(address: string, chainId: number = 8453): Promise<NFT[]> {
  const ALCHEMY_API_KEY = API_CONFIG.ALCHEMY_API_KEY;
  if (!ALCHEMY_API_KEY) {
    console.error('❌ No Alchemy API key found');
    return [];
  }

  const chainConfig = CHAIN_CONFIG[chainId as keyof typeof CHAIN_CONFIG];
  if (!chainConfig) {
    console.error(`❌ Unsupported chain ID: ${chainId}`);
    return [];
  }

  console.log(`${chainConfig.emoji} Fetching NFTs from ${chainConfig.name} network (${chainId})`);

  const allNFTs: AlchemyNFT[] = [];
  let pageKey: string | undefined = undefined;
  let page = 1;

  try {
    // Step 1: Collect all NFTs with pagination using REST API
    do {
      console.log(`📄 ${chainConfig.emoji} ${chainConfig.name}: Fetching page ${page} of NFTs from Alchemy REST API...`);
      
      // Build URL with query parameters for REST API
      const baseUrl = `https://${chainConfig.rpcUrl}/nft/v3/${ALCHEMY_API_KEY}/getNFTsForOwner`;
      const params = new URLSearchParams({
        owner: address,
        pageSize: '100',
        excludeFilters: 'SPAM', // Let our own spam detection handle this
        withMetadata: 'true', // Changed from includeMetadata to withMetadata
        ...(pageKey && { pageKey })
      });
      
      const apiUrl = `${baseUrl}?${params.toString()}`;

      console.log(`🔗 ${chainConfig.emoji} ${chainConfig.name}: Calling Alchemy REST API:`, {
        url: `https://${chainConfig.rpcUrl}/nft/v3/${ALCHEMY_API_KEY.substring(0, 10)}.../getNFTsForOwner`,
        owner: address,
        pageSize: 100,
        pageKey: pageKey || 'none'
      });

      const response: Response = await fetch(apiUrl, {
        method: 'GET',
        headers: { 
          'Accept': 'application/json'
        }
      });

      console.log(`📡 ${chainConfig.emoji} ${chainConfig.name}: Response status: ${response.status} ${response.statusText}`);

      if (!response.ok) {
        console.error(`❌ ${chainConfig.emoji} ${chainConfig.name}: Alchemy NFT REST API error: ${response.status} ${response.statusText}`);
        const errorText = await response.text();
        console.error('📄 Error response body:', errorText);
        break;
      }

      console.log(`✅ ${chainConfig.emoji} ${chainConfig.name}: Successfully fetched data from Alchemy API`);

      const data: AlchemyNFTResponse = await response.json();
      console.log(`📊 Raw Alchemy response:`, {
        totalCount: data.totalCount,
        pageKey: data.pageKey,
        ownedNftsLength: data.ownedNfts?.length || 0
      });

      const nfts = data.ownedNfts || [];
      pageKey = data.pageKey;

      console.log(`📄 Page ${page}: Alchemy returned ${nfts.length} NFTs${pageKey ? ' (more pages available)' : ' (final page)'}`);
      
      // Log first NFT for debugging
      if (nfts.length > 0) {
        console.log(`🔍 Sample NFT from page ${page}:`, {
          contract: nfts[0].contract.address,
          tokenId: nfts[0].tokenId,
          name: nfts[0].name,
          collection: nfts[0].collection?.name
        });
      }
      
      allNFTs.push(...nfts);
      page++;
      
      // Safety break to prevent infinite loops
      if (page > 20) {
        console.warn('⚠️ Reached maximum page limit (20) for safety');
        break;
      }
      
      // Respect pagination limits
      if (allNFTs.length >= NFT_PAGINATION.MAX_INITIAL_LOAD) {
        console.log(`⏸️ Reached maximum initial load limit (${NFT_PAGINATION.MAX_INITIAL_LOAD} NFTs)`);
        break;
      }
      
    } while (pageKey);

    if (allNFTs.length === 0) {
      console.log('ℹ️ No NFTs found in Alchemy response (wallet may be empty on Base network)');
      return [];
    }

    console.log(`📦 Found ${allNFTs.length} total NFTs to process`);

    // Step 2: Process NFTs and normalize to our NFT type
    const processedNFTs = await Promise.all(
      allNFTs.map(async (nft: AlchemyNFT, index: number) => {
        console.log(`🔄 Processing NFT ${index + 1}/${allNFTs.length}: ${nft.contract.address}/${nft.tokenId}`);
        
        // Get image URL with fallbacks
        const imageUrl = await getNFTImageUrl(
          nft.contract.address,
          nft.tokenId,
          nft.image
        );
        
        // Extract metadata
        const metadata = nft.raw?.metadata || {};
        const collectionName = nft.collection?.name || nft.contract.name || 'Unknown Collection';
        
        // Convert to our NFT type
        const processedNFT: NFT = {
          contract_address: nft.contract.address,
          token_id: nft.tokenId,
          token_standard: nft.tokenType === 'ERC1155' ? 'ERC1155' : 'ERC721',
          name: nft.name || metadata.name || `#${nft.tokenId}`,
          description: nft.description || metadata.description,
          image_url: imageUrl,
          collection_name: collectionName,
          collection_address: nft.contract.address, // Same as contract address for most cases
          balance: nft.balance || '1', // ERC721 = 1, ERC1155 = actual balance
          metadata: {
            ...(metadata as Record<string, unknown>),
            chainId, // Add chain ID for sorting and identification
            chainName: chainConfig.name
          },
          token_uri: nft.raw?.tokenUri,
        };
        
        return processedNFT;
      })
    );

    console.log(`✅ ${chainConfig.emoji} ${chainConfig.name}: Successfully processed ${processedNFTs.length} NFTs`);
    return processedNFTs;
    
  } catch (error) {
    console.error('❌ Alchemy NFT fetch failed:', error);
    if (error instanceof Error) {
      console.error('📄 Error details:', error.message);
      console.error('📍 Stack trace:', error.stack);
    }
    return [];
  }
}

/**
 * Clear NFT image cache
 */
export function clearNFTImageCache(): void {
  // Clear memory cache
  Object.keys(NFT_IMAGE_CACHE).forEach(key => {
    delete NFT_IMAGE_CACHE[key];
  });
  
  // Clear localStorage cache
  if (typeof window !== 'undefined') {
    try {
      const keys = Object.keys(localStorage);
      keys.forEach(key => {
        if (key.startsWith('nft_image_') || key.startsWith('nft_metadata_')) {
          localStorage.removeItem(key);
        }
      });
    } catch (error) {
      console.debug('Failed to clear NFT cache from localStorage:', error);
    }
  }
  
  console.log('NFT image cache cleared');
}

/**
 * Get NFT cache statistics for debugging
 */
export function getNFTCacheStats(): { imageCache: number; metadataCache: number } {
  return {
    imageCache: Object.keys(NFT_IMAGE_CACHE).length,
    metadataCache: Object.keys(NFT_METADATA_CACHE).length,
  };
} 