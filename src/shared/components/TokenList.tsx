import { Token } from '@/types/token';
import TokenCard from './TokenCard';
import { FixedSizeList as List } from 'react-window';
import { useEffect, useState, useMemo, useCallback, memo } from 'react';

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
  const [listHeight, setListHeight] = useState(500); // Increased default height
  const itemSize = 100; // Reverted back to original 100px spacing
  
  // List key is used to force re-render of the virtualized list when necessary
  const [listKey, setListKey] = useState(0);
  
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
  
  // Adjust list height based on token count, but keep it limited
  useEffect(() => {
    const calculatedHeight = Math.min(Math.max(tokens.length * itemSize, 300), 600);
    setListHeight(calculatedHeight);
    
    // Force a re-render of the list when tokens change (only when count changes)
    setListKey(prevKey => prevKey + 1);
  }, [tokens.length, itemSize]);
  
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
  
  // Optimized row renderer component
  const RowComponent = memo(({ index, style }: { index: number; style: React.CSSProperties }) => {
    const token = tokens[index];
    
    if (!token) return null;
    
    return (
      <div style={style}>
        <TokenCard
          token={token}
          isSpam={isSpam}
          isSelected={selectedTokens.has(token.contract_address)}
          onToggle={handleTokenToggle}
        />
      </div>
    );
  });
  
  RowComponent.displayName = 'TokenListRow';
  
  return (
    <div className="p-5"> {/* Increased padding */}
      {tokens.length === 0 ? (
        <div className="flex flex-col items-center justify-center p-8 text-center">
          <p className="text-gray-400">No tokens match your current filters.</p>
          <p className="text-sm text-gray-500 mt-2">Try adjusting your filter settings above.</p>
        </div>
      ) : (
        <>
          {/* List header with information */}
          <div className="mb-4 pb-3 border-b border-gray-700/50 flex items-center justify-between">
            <div className="flex items-center gap-3 text-sm"> {/* Increased text size and spacing */}
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

          {/* Fixed size virtualized list for performance */}
          <div className="relative border border-gray-700/30 rounded-md overflow-hidden shadow-md">
            <List
              key={listKey}
              height={listHeight}
              width="100%"
              itemCount={tokens.length}
              itemSize={itemSize}
              className="token-list scrollbar-thin scrollbar-thumb-gray-700 scrollbar-track-transparent"
              overscanCount={5} // Render more items for smoother scrolling
              initialScrollOffset={0}
            >
              {RowComponent}
            </List>
            
            {/* Fade effect at bottom for scroll indication */}
            {tokens.length > 4 && (
              <div className="absolute bottom-0 left-0 right-0 h-10 bg-gradient-to-t from-gray-900/90 to-transparent pointer-events-none" 
                   aria-hidden="true"></div>
            )}
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