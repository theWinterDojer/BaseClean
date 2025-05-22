import { Token } from '@/types/token';
import { formatBalance, calculateTokenValue, getTokenLogoUrl } from '@/lib/api';
import { useState, useEffect, memo, useCallback } from 'react';
import Image from 'next/image';

interface TokenCardProps {
  token: Token;
  onTokenSelect?: (token: Token) => void;
  isSelected?: boolean;
  isSpam?: boolean;
  onToggle?: (address: string) => void;
}

/**
 * TokenImage Component
 * Dedicated component for handling token images with built-in fallback
 */
const TokenImage = memo(function TokenImage({ 
  address, 
  symbol, 
  isSpam 
}: { 
  address: string; 
  symbol: string;
  isSpam?: boolean;
}) {
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);

  // Generate initials for fallback
  const getInitials = useCallback(() => {
    if (symbol) {
      return symbol.substring(0, 2).toUpperCase();
    }
    return address.substring(2, 4).toUpperCase();
  }, [symbol, address]);

  // Load image with error handling
  useEffect(() => {
    let mounted = true;
    setIsLoading(true);
    
    const loadImage = async () => {
      try {
        const url = await getTokenLogoUrl(address, symbol);
        if (mounted) {
          setImageUrl(url);
          setIsLoading(false);
        }
      } catch (error) {
        if (mounted) {
          setHasError(true);
          setIsLoading(false);
        }
      }
    };
    
    loadImage();
    
    return () => {
      mounted = false; // Clean up to prevent setting state after unmount
    };
  }, [address, symbol]);

  const handleError = useCallback(() => {
    setHasError(true);
  }, []);

  if (isLoading) {
    return (
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="w-5 h-5 border-2 border-gray-200 border-t-blue-500 rounded-full animate-spin"></div>
      </div>
    );
  }

  if (hasError || !imageUrl) {
    return (
      <div className={`absolute inset-0 flex items-center justify-center text-white font-bold text-lg 
        ${isSpam ? 'bg-red-500' : 'bg-blue-500'}`}>
        {getInitials()}
      </div>
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
      unoptimized
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
  const tokenValue = calculateTokenValue(token.balance, token.quote_rate);

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
      className={`p-4 rounded-lg cursor-pointer transition-all duration-200 ${
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
        <div className="relative w-12 h-12 mr-4 rounded-full overflow-hidden bg-gray-100 dark:bg-gray-700 shadow-sm">
          <TokenImage 
            address={token.contract_address} 
            symbol={token.contract_ticker_symbol} 
            isSpam={isSpam}
          />
        </div>
        
        <div className="flex-grow">
          <div className="flex justify-between items-start mb-1">
            <div className="font-medium text-gray-900 dark:text-gray-100">
              {token.contract_ticker_symbol || token.contract_name || token.contract_address.substring(0, 8)}
            </div>
            <div className={`text-sm font-medium ${numericValue > 0.01 ? 'text-green-600 dark:text-green-400' : 'text-gray-500 dark:text-gray-400'}`}>
              ${numericValue > 0 ? numericValue.toFixed(2) : '0.00'}
            </div>
          </div>
          <div className="flex justify-between items-end">
            <div className="text-xs text-gray-500 dark:text-gray-400 leading-tight truncate max-w-[160px]">
              {token.contract_name || token.contract_address.substring(0, 10)}
            </div>
            <div className="text-xs text-gray-500 dark:text-gray-400 leading-tight">
              {formattedBalance}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
});

export default TokenCard; 