import React, { useState, memo, useEffect, useCallback } from 'react';
import Image from 'next/image';
import { Token } from '@/types/token';
import { formatBalance } from '@/lib/api';
import { getTokenLogoUrl } from '@/lib/api';
import { SimpleScamSnifferIndicator } from '@/components/ScamSnifferIndicator';

interface TokenCardProps {
  token: Token;
  onTokenSelect?: (token: Token) => void;
  isSelected?: boolean;
  isSpam?: boolean;
  onToggle?: (address: string) => void;
}

/**
 * TokenImage Component
 * Enhanced component for handling token images with better error handling and retry logic
 */
const TokenImage = memo(function TokenImage({ 
  address, 
  symbol, 
  isSpam,
  logoUrl: initialLogoUrl
}: { 
  address: string; 
  symbol: string;
  isSpam?: boolean;
  logoUrl?: string;
}) {
  const [imageUrl, setImageUrl] = useState<string | null>(initialLogoUrl || null);
  const [isLoading, setIsLoading] = useState(!initialLogoUrl);
  const [hasError, setHasError] = useState(false);
  const [retryCount, setRetryCount] = useState(0);
  const [imageLoadAttempted, setImageLoadAttempted] = useState(false);

  // Generate initials for fallback
  const getInitials = useCallback(() => {
    if (symbol) {
      return symbol.substring(0, 2).toUpperCase();
    }
    return address.substring(2, 4).toUpperCase();
  }, [symbol, address]);

  // Load image with enhanced error handling and progressive fallbacks
  useEffect(() => {
    let mounted = true;
    let timeoutId: NodeJS.Timeout;
    
    // If we already have an initial logo URL and haven't failed, use it
    if (initialLogoUrl && !hasError && !imageLoadAttempted) {
      setImageUrl(initialLogoUrl);
      setIsLoading(false);
      setImageLoadAttempted(true);
      return;
    }
    
    // Only fetch if we don't have a URL or need to retry
    if ((!imageUrl || (hasError && retryCount < 3)) && !imageLoadAttempted) {
      setIsLoading(true);
      setHasError(false);
      setImageLoadAttempted(true);
      
      const loadImage = async () => {
        try {
          // Add a small delay to prevent race conditions with cache clearing
          timeoutId = setTimeout(async () => {
            if (!mounted) return;
            
            try {
              const url = await getTokenLogoUrl(address, symbol);
              if (mounted) {
                setImageUrl(url);
                setIsLoading(false);
                setRetryCount(0); // Reset retry count on success
              }
            } catch (error) {
              console.debug(`Failed to load image for ${symbol || address}:`, error);
              if (mounted) {
                setHasError(true);
                setIsLoading(false);
              }
            }
          }, 100); // Small delay to avoid race conditions
        } catch (error) {
          console.debug(`Failed to load image for ${symbol || address}:`, error);
          if (mounted) {
            setHasError(true);
            setIsLoading(false);
          }
        }
      };
      
      loadImage();
    }
    
    return () => {
      mounted = false;
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
    };
  }, [address, symbol, initialLogoUrl, retryCount, hasError, imageUrl, imageLoadAttempted]);

  const handleError = useCallback(() => {
    console.debug(`Image error for ${symbol || address}, retry count: ${retryCount}`);
    
    // If we haven't exceeded retry limit, try again with progressive backoff
    if (retryCount < 2) {
      setTimeout(() => {
        setRetryCount(prev => prev + 1);
        setImageUrl(null); // This will trigger a reload
        setImageLoadAttempted(false); // Allow new attempt
      }, (retryCount + 1) * 1000); // Progressive delay: 1s, 2s, 3s
    } else {
      setHasError(true);
    }
  }, [symbol, address, retryCount]);

  const handleLoad = useCallback(() => {
    setHasError(false);
    setIsLoading(false);
  }, []);

  if (isLoading) {
    return (
      <div className="absolute inset-0 flex items-center justify-center bg-gray-100 dark:bg-gray-700">
        <div className="w-5 h-5 border-2 border-gray-200 border-t-blue-500 rounded-full animate-spin"></div>
      </div>
    );
  }

  if (hasError || !imageUrl) {
    // Fallback to initials only if we truly have no image URL
    return (
      <div className={`absolute inset-0 flex items-center justify-center text-white font-bold text-lg 
        ${isSpam ? 'bg-red-500' : 'bg-blue-500'}`}>
        {getInitials()}
      </div>
    );
  }

  // Handle SVG data URIs (our enhanced fallbacks) with proper rendering
  if (imageUrl.startsWith('data:image/svg+xml')) {
    return (
      <div 
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: `url("${imageUrl}")` }}
        title={symbol || 'Token'}
      />
    );
  }

  return (
    <Image
      src={imageUrl}
      alt={symbol || 'Token'}
      width={48}
      height={48}
      className="object-cover"
      onError={handleError}
      onLoad={handleLoad}
      unoptimized
      placeholder="blur"
      blurDataURL="data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHZpZXdCb3g9IjAgMCA0MCA0MCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9IjQwIiBoZWlnaHQ9IjQwIiBmaWxsPSIjRjNGNEY2Ii8+Cjwvc3ZnPgo="
    />
  );
});

const TokenCard = memo(function TokenCard({ 
  token, 
  onTokenSelect, 
  isSelected = false,
  isSpam = false,
  onToggle
}: TokenCardProps) {
  const [hover, setHover] = useState(false);
  
  const formattedBalance = formatBalance(token.balance, token.contract_decimals);

  // Calculate actual numeric value for display
  const numericValue = (() => {
    try {
      const balance = parseFloat(token.balance) / Math.pow(10, token.contract_decimals);
      return balance * (token.quote_rate || 0);
    } catch {
      return 0;
    }
  })();

  const handleCardClick = () => {
    if (onTokenSelect) {
      onTokenSelect(token);
    }
    if (onToggle) {
      onToggle(token.contract_address);
    }
  };

  return (
    <div 
      className={`p-4 rounded-lg cursor-pointer transition-all duration-200 group mb-1 ${
        isSelected 
          ? isSpam 
            ? 'bg-red-100 dark:bg-red-900/30 border-2 border-red-300 dark:border-red-700'
            : 'bg-blue-100 dark:bg-blue-900/30 border-2 border-blue-300 dark:border-blue-700' 
          : hover 
            ? 'bg-gray-100 dark:bg-gray-800/70' 
            : 'bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700'
      }`}
      onClick={handleCardClick}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
    >
      <div className="flex items-center">
        <div className="relative w-12 h-12 mr-4 rounded-full overflow-hidden bg-gray-100 dark:bg-gray-700 shadow-sm flex-shrink-0">
          <TokenImage 
            address={token.contract_address} 
            symbol={token.contract_ticker_symbol} 
            isSpam={isSpam}
            logoUrl={token.logo_url}
          />
        </div>
        
        <div className="flex-grow min-w-0">
          <div className="flex justify-between items-start mb-1">
            <div className="flex items-center font-medium text-gray-900 dark:text-gray-100 min-w-0 flex-grow mr-2">
              <span className="truncate">
                {token.contract_ticker_symbol || token.contract_name || token.contract_address.substring(0, 8)}
              </span>
              <div className="flex-shrink-0 ml-1">
                <SimpleScamSnifferIndicator isFlagged={token.scamSnifferFlagged ?? false} />
              </div>
            </div>
            <div className={`text-sm font-medium flex-shrink-0 ${numericValue > 0.01 ? 'text-green-600 dark:text-green-400' : 'text-gray-500 dark:text-gray-400'}`}>
              ${numericValue > 0 ? numericValue.toFixed(2) : '0.00'}
            </div>
          </div>
          <div className="flex justify-between items-end">
            <div className="text-xs text-gray-500 dark:text-gray-400 leading-tight truncate flex-grow mr-2">
              {token.contract_name || token.contract_address.substring(0, 10)}
            </div>
            <div className="text-xs text-gray-500 dark:text-gray-400 leading-tight flex-shrink-0">
              {formattedBalance}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
});

export default TokenCard; 