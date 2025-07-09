import React, { useState, useCallback } from 'react';

interface GasDisplayProps {
  gasCostGwei?: number;
  className?: string;
}

/**
 * Gas cost display component that shows GWEI by default and converts to USD on click
 * Uses current ETH price for conversion (not historical)
 */
export default function GasDisplay({ gasCostGwei, className = '' }: GasDisplayProps) {
  const [showUSD, setShowUSD] = useState(false);
  const [usdValue, setUsdValue] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Fetch current ETH price and convert GWEI to USD
  const fetchUSDValue = useCallback(async () => {
    if (!gasCostGwei || usdValue !== null) return; // Already fetched
    
    setIsLoading(true);
    try {
      // Fetch current ETH price from DeFiLlama
      const response = await fetch(`https://coins.llama.fi/prices/current/base:0x4200000000000000000000000000000000000006`);
      
      if (!response.ok) {
        console.debug('Failed to fetch ETH price for gas conversion');
        return;
      }
      
      const data = await response.json();
      const ethPrice = data.coins?.[`base:0x4200000000000000000000000000000000000006`]?.price || 0;
      
      if (ethPrice === 0) {
        console.debug('ETH price not found for gas conversion');
        return;
      }
      
      // Convert GWEI to ETH, then to USD
      // Note: gasCostGwei is already the total cost in GWEI units
      // 1 ETH = 10^9 GWEI, so divide by 10^9 to get ETH
      const gasCostETH = gasCostGwei / Math.pow(10, 9); // GWEI to ETH
      const gasCostUSD = gasCostETH * ethPrice;
      
      setUsdValue(gasCostUSD);
    } catch (error) {
      console.debug('Failed to convert gas cost to USD:', error);
    } finally {
      setIsLoading(false);
    }
  }, [gasCostGwei, usdValue]);

  // Handle click to toggle between GWEI and USD
  const handleClick = useCallback(async () => {
    if (!gasCostGwei) return;
    
    if (!showUSD) {
      // Switching to USD - fetch price if needed
      await fetchUSDValue();
      setShowUSD(true);
    } else {
      // Switching back to GWEI
      setShowUSD(false);
    }
  }, [gasCostGwei, showUSD, fetchUSDValue]);

  // Don't render anything if no gas cost data
  if (!gasCostGwei || gasCostGwei === 0) {
    return <span className={className}>-</span>;
  }

  // Format display values
  const gweiDisplay = `${gasCostGwei.toFixed(1)} Gwei`;
  const usdDisplay = usdValue !== null ? `$${usdValue.toFixed(6)}` : '$--';

  return (
    <button
      onClick={handleClick}
      className={`${className} cursor-pointer hover:text-purple-300 transition-colors relative group`}
      title="Click for USD conversion"
    >
      {showUSD ? (
        isLoading ? '$...' : usdDisplay
      ) : (
        gweiDisplay
      )}
      
      {/* Hover tooltip */}
      <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 bg-gray-800 text-white text-xs rounded shadow-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-10">
        {showUSD ? 'Click for Gwei' : 'Click for USD'}
      </div>
    </button>
  );
} 