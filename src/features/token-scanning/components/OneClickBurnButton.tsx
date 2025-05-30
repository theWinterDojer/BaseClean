import React, { useState } from 'react';
import { Token } from '@/types/token';

interface OneClickBurnButtonProps {
  selectedTokens: Token[];
  onBurnStart: (tokens: Token[]) => void;
  disabled?: boolean;
}

export default function OneClickBurnButton({
  selectedTokens,
  onBurnStart,
  disabled = false
}: OneClickBurnButtonProps) {
  const [isHovered, setIsHovered] = useState(false);
  const [showPreview, setShowPreview] = useState(false);

  const tokenCount = selectedTokens.length;
  
  if (tokenCount === 0) {
    return (
      <button
        disabled
        className="px-6 py-3 bg-gray-600 text-gray-400 rounded-lg font-medium cursor-not-allowed"
      >
        Select tokens to burn
      </button>
    );
  }

  const handleClick = () => {
    if (!disabled && tokenCount > 0) {
      onBurnStart(selectedTokens);
    }
  };

  return (
    <div className="relative">
      {/* Main Button */}
      <button
        onClick={handleClick}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        disabled={disabled}
        className={`
          relative overflow-hidden px-8 py-4 rounded-xl font-bold text-lg transition-all duration-300 transform
          ${disabled 
            ? 'bg-gray-600 text-gray-400 cursor-not-allowed' 
            : 'bg-gradient-to-r from-red-600 to-orange-600 hover:from-red-500 hover:to-orange-500 text-white hover:scale-105 hover:shadow-xl'
          }
        `}
      >
        {/* Button Content */}
        <div className="relative z-10 flex items-center justify-center">
          <div className="mr-3 text-2xl">🔥</div>
          <div>
            <div className="leading-tight">
              Burn {tokenCount} Token{tokenCount > 1 ? 's' : ''}
            </div>
            <div className="text-xs text-gray-400 mt-1">
              {tokenCount} quick transfers - no approvals needed!
            </div>
          </div>
        </div>

        {/* Animated Background Effect */}
        {!disabled && (
          <div className="absolute inset-0 bg-gradient-to-r from-yellow-400/20 to-red-400/20 opacity-0 hover:opacity-100 transition-opacity duration-300" />
        )}
      </button>

      {/* Hover Preview */}
      {isHovered && !disabled && tokenCount <= 5 && (
        <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 bg-gray-900 border border-gray-700 rounded-lg p-4 shadow-xl z-20 min-w-64">
          <div className="text-white font-medium mb-2">🚀 What will happen:</div>
          <div className="space-y-1 text-sm">
            {selectedTokens.slice(0, 3).map((token, index) => (
              <div key={token.contract_address} className="flex items-center text-gray-300">
                <div className="w-5 h-5 bg-red-600 rounded-full flex items-center justify-center mr-2 text-xs">
                  {index + 1}
                </div>
                Transfer {token.contract_ticker_symbol} → 🔥
              </div>
            ))}
            {tokenCount > 3 && (
              <div className="text-gray-400 text-xs ml-7">
                + {tokenCount - 3} more token{tokenCount - 3 > 1 ? 's' : ''}...
              </div>
            )}
          </div>
          <div className="mt-3 pt-2 border-t border-gray-700 text-xs text-gray-400">
            ✨ Each burns instantly • 🔒 Maximum security
          </div>
        </div>
      )}

      {/* Large Batch Preview */}
      {isHovered && !disabled && tokenCount > 5 && (
        <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 bg-gray-900 border border-gray-700 rounded-lg p-4 shadow-xl z-20 min-w-72">
          <div className="text-white font-medium mb-2">🚀 Batch Burn Process:</div>
          
          <div className="bg-gray-800 rounded-lg p-3 mb-3">
            <div className="flex justify-between items-center mb-2">
              <span className="text-gray-300">Total tokens:</span>
              <span className="text-white font-bold">{tokenCount}</span>
            </div>
            <div className="flex justify-between items-center mb-2">
              <span className="text-gray-300">Method:</span>
              <span className="text-green-400">Direct Transfer</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-300">Approvals needed:</span>
              <span className="text-blue-400 font-bold">ZERO</span>
            </div>
          </div>

          <div className="text-sm text-gray-400">
            <div className="flex items-center mb-1">
              <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
              Each token burns with one signature
            </div>
            <div className="flex items-center mb-1">
              <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
              Progress shown in real-time
            </div>
            <div className="flex items-center">
              <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
              Failed tokens won&apos;t stop others
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// Usage Example Component
export function BurnButtonDemo() {
  const [selectedTokens, setSelectedTokens] = useState<Token[]>([]);
  const [isBurning, setIsBurning] = useState(false);

  const handleBurnStart = async (tokens: Token[]) => {
    setIsBurning(true);
    
    // This is where you'd call your burn function
    console.log(`Starting burn process for ${tokens.length} tokens`);
    
    // Simulate burn process
    setTimeout(() => {
      setIsBurning(false);
      setSelectedTokens([]); // Clear selection after burn
    }, 3000);
  };

  return (
    <div className="p-6 bg-gray-800 rounded-lg">
      <h3 className="text-white font-bold mb-4">🔥 One-Click Burn Demo</h3>
      
      {/* Mock token selection */}
      <div className="mb-6">
        <p className="text-gray-300 mb-2">Selected tokens: {selectedTokens.length}</p>
        <button
          onClick={() => setSelectedTokens([
            { contract_address: '0x1', contract_ticker_symbol: 'SPAM', balance: '1000', contract_decimals: 18 } as Token,
            { contract_address: '0x2', contract_ticker_symbol: 'SCAM', balance: '2000', contract_decimals: 18 } as Token,
            { contract_address: '0x3', contract_ticker_symbol: 'JUNK', balance: '3000', contract_decimals: 18 } as Token,
          ])}
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-500"
        >
          Select 3 Test Tokens
        </button>
      </div>

      {/* The One-Click Burn Button */}
      <OneClickBurnButton
        selectedTokens={selectedTokens}
        onBurnStart={handleBurnStart}
        disabled={isBurning}
      />

      {isBurning && (
        <div className="mt-4 p-4 bg-yellow-900/30 border border-yellow-700 rounded-lg">
          <div className="text-yellow-300">🔥 Burn process started! (This is where your progress modal would appear)</div>
        </div>
      )}
    </div>
  );
} 