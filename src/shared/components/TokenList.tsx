import { Token } from '@/types/token';
import TokenCard from './TokenCard';
import { useMemo, useCallback } from 'react';

type TokenListProps = {
  tokens: Token[];
  selectedTokens: Set<string>;
  toggleToken: (address: string, tokens?: Token[]) => void;
  isSpam?: boolean;
};

export default function TokenList({
  tokens,
  selectedTokens,
  toggleToken,
  isSpam = false
}: TokenListProps) {
  // Calculate how many tokens from this list are currently selected
  const selectedCount = useMemo(() => {
    return Array.from(selectedTokens).filter(
      address => tokens.some(token => token.contract_address === address)
    ).length;
  }, [tokens, selectedTokens]);
  
  // Calculate total value of tokens in the list - fixed calculation
  const totalValue = useMemo(() => {
    return tokens.reduce((sum, token) => {
      const balance = parseFloat(token.balance) / (10 ** token.contract_decimals);
      const value = balance * (token.quote_rate || 0);
      return sum + value;
    }, 0);
  }, [tokens]);
  
  // Handle bulk selection of all tokens in the current view
  const handleSelectAll = useCallback(() => {
    tokens.forEach(token => {
      if (!selectedTokens.has(token.contract_address)) {
        toggleToken(token.contract_address, tokens);
      }
    });
  }, [tokens, toggleToken, selectedTokens]);
  
  // Handle deselecting all tokens in the current view
  const handleDeselectAll = useCallback(() => {
    tokens.forEach(token => {
      if (selectedTokens.has(token.contract_address)) {
        toggleToken(token.contract_address, tokens);
      }
    });
  }, [tokens, toggleToken, selectedTokens]);

  // Create a wrapper function to pass tokens array
  const handleTokenToggle = useCallback((address: string) => {
    toggleToken(address, tokens);
  }, [toggleToken, tokens]);
  
  return (
    <div className="p-5">
      {tokens.length === 0 ? (
        <div className="flex flex-col items-center justify-center p-8 text-center">
          <p className="text-gray-400">No tokens match your current filters.</p>
          <p className="text-sm text-gray-500 mt-2">Try adjusting your filter settings above.</p>
        </div>
      ) : (
        <>
          {/* List header with information */}
          <div className="mb-4 pb-3 border-b border-gray-700/50 flex items-center justify-between">
            <div className="flex items-center gap-3 text-sm">
              <span className={`px-3 py-1.5 rounded-full ${
                isSpam 
                  ? 'bg-red-900/20 text-red-300 border border-red-900/30' 
                  : 'bg-blue-900/20 text-blue-300 border border-blue-900/30'
              }`}>
                {tokens.length} token{tokens.length !== 1 ? 's' : ''}
              </span>
              
              <span className="text-gray-400">
                Total: ${totalValue.toLocaleString(undefined, { maximumFractionDigits: 2 })}
              </span>
            </div>
          </div>

          {/* Simple token list */}
          <div className="space-y-3 max-h-[500px] overflow-y-auto border border-gray-700/30 rounded-md p-3 shadow-md">
            {tokens.map((token) => (
              <TokenCard
                key={token.contract_address}
                token={token}
                isSpam={isSpam}
                isSelected={selectedTokens.has(token.contract_address)}
                onToggle={handleTokenToggle}
              />
            ))}
          </div>
          
          <div className="mt-5 pt-3 border-t border-gray-700/50 flex justify-between items-center">
            <span className="text-sm text-gray-400">
              {selectedCount > 0 
                ? `${selectedCount} of ${tokens.length} selected` 
                : "Click tokens to select"}
            </span>
            
            <div className="flex gap-2">
              {/* Only show Select All button for spam tokens */}
              {isSpam && selectedCount < tokens.length && (
                <button 
                  onClick={handleSelectAll}
                  className="text-sm px-4 py-2 rounded-md bg-blue-700/70 hover:bg-blue-600 text-white transition-colors"
                  aria-label={`Select all ${tokens.length} tokens in this list`}
                >
                  Select All
                </button>
              )}
              
              {/* Show warning text for regular tokens instead of Select All button */}
              {!isSpam && (
                <span className="text-sm text-yellow-400 font-medium px-2 py-1">
                  ⚠️ Use precaution selecting here
                </span>
              )}
              
              {selectedCount > 0 && (
                <button 
                  onClick={handleDeselectAll}
                  className="text-sm px-4 py-2 rounded-md bg-gray-700/70 hover:bg-gray-600 text-white transition-colors"
                  aria-label={`Deselect all selected tokens in this list`}
                >
                  Deselect All
                </button>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}