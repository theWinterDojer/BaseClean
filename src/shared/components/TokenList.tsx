import { Token } from '@/types/token';
import TokenCard from './TokenCard';
import { FixedSizeList as List } from 'react-window';
import { useEffect, useState, useMemo, useCallback } from 'react';

type TokenListProps = {
  tokens: Token[];
  selectedTokens: Set<string>;
  toggleToken: (address: string) => void;
  isSpam?: boolean;
};

export default function TokenList({
  tokens,
  selectedTokens,
  toggleToken,
  isSpam = false
}: TokenListProps) {
  const [listHeight, setListHeight] = useState(500); // Increased default height
  const itemSize = 100; // Increased from 90 to 100px for more breathing room
  
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
    
    // Force a re-render of the list when tokens change
    setListKey(prevKey => prevKey + 1);
  }, [tokens.length, itemSize]);
  
  // Update list key when selections change to refresh rendering
  useEffect(() => {
    setListKey(prevKey => prevKey + 1);
  }, [selectedTokens]);
  
  // Handle bulk selection of all tokens in the current view
  const handleSelectAll = useCallback(() => {
    tokens.forEach(token => toggleToken(token.contract_address));
  }, [tokens, toggleToken]);
  
  // Memoize the row renderer for better performance
  const Row = useMemo(() => {
    const RowComponent = ({ index, style }: { index: number; style: React.CSSProperties }) => {
      const token = tokens[index];
      
      if (!token) return null;
      
      return (
        <div style={{...style, paddingBottom: '10px'}}> {/* Increased padding */}
          <TokenCard
            key={token.contract_address}
            token={token}
            isSpam={isSpam}
            isSelected={selectedTokens.has(token.contract_address)}
            onToggle={toggleToken}
          />
        </div>
      );
    };
    
    // Add display name for React DevTools and to satisfy linter
    RowComponent.displayName = 'TokenListRow';
    
    return RowComponent;
  }, [tokens, isSpam, selectedTokens, toggleToken]);
  
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
              {Row}
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
            <button 
              onClick={handleSelectAll}
              className={`text-sm px-4 py-2 rounded-md ${
                isSpam
                  ? 'bg-red-700/70 hover:bg-red-600 text-white'
                  : 'bg-blue-700/70 hover:bg-blue-600 text-white'
              } transition-colors`}
              aria-label={`Select all ${tokens.length} tokens in this list`}
            >
              {selectedCount === tokens.length ? 'Deselect All' : 'Select All'}
            </button>
          </div>
        </>
      )}
    </div>
  );
} 