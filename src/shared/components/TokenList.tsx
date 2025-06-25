import { Token } from '@/types/token';
import TokenCard from './TokenCard';
import { useMemo, useCallback, useState } from 'react';

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
  // Search state
  const [searchQuery, setSearchQuery] = useState('');

  // Filter tokens based on search query
  const filteredTokens = useMemo(() => {
    if (!searchQuery.trim()) {
      return tokens;
    }

    const query = searchQuery.toLowerCase().trim();
    return tokens.filter(token => 
      token.contract_name?.toLowerCase().includes(query) ||
      token.contract_ticker_symbol?.toLowerCase().includes(query) ||
      token.contract_address.toLowerCase().includes(query)
    );
  }, [tokens, searchQuery]);

  // Calculate how many tokens from this list are currently selected
  const selectedCount = useMemo(() => {
    return Array.from(selectedTokens).filter(
      address => filteredTokens.some(token => token.contract_address === address)
    ).length;
  }, [filteredTokens, selectedTokens]);
  

  
  // Handle bulk selection of all tokens in the current view
  const handleSelectAll = useCallback(() => {
    filteredTokens.forEach(token => {
      if (!selectedTokens.has(token.contract_address)) {
        toggleToken(token.contract_address, tokens);
      }
    });
  }, [filteredTokens, toggleToken, selectedTokens, tokens]);
  
  // Handle deselecting all tokens in the current view
  const handleDeselectAll = useCallback(() => {
    filteredTokens.forEach(token => {
      if (selectedTokens.has(token.contract_address)) {
        toggleToken(token.contract_address, tokens);
      }
    });
  }, [filteredTokens, toggleToken, selectedTokens, tokens]);

  // Create a wrapper function to pass tokens array
  const handleTokenToggle = useCallback((address: string) => {
    toggleToken(address, tokens);
  }, [toggleToken, tokens]);

  // Clear search
  const clearSearch = useCallback(() => {
    setSearchQuery('');
  }, []);
  
  return (
    <div className="p-5">
      {/* Search Bar */}
      <div className="mb-4">
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <svg className="h-4 w-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={`Search ${isSpam ? 'spam ' : ''}tokens...`}
            className="block w-full pl-10 pr-10 py-2 text-sm bg-gray-800/50 border border-gray-600 rounded-lg 
                     text-white placeholder-gray-400 
                     focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent
                     transition-colors duration-200"
          />
          {searchQuery && (
            <button
              onClick={clearSearch}
              className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-200 transition-colors"
              aria-label="Clear search"
            >
              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          )}
        </div>
        
        {/* Search Results Info */}
        {searchQuery && (
          <div className="text-xs text-gray-400">
            {filteredTokens.length === 0 ? (
              <>No tokens match &ldquo;{searchQuery}&rdquo;</>
            ) : (
              <>Showing {filteredTokens.length} of {tokens.length} tokens</>
            )}
          </div>
        )}
      </div>

      {filteredTokens.length === 0 ? (
        <div className="flex flex-col items-center justify-center p-8 text-center">
          {searchQuery ? (
            <>
              <svg className="h-10 w-10 text-gray-400 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <p className="text-gray-400">No tokens match your search</p>
              <p className="text-sm text-gray-500 mt-1">Try a different search term</p>
            </>
          ) : (
            <>
              <p className="text-gray-400">No tokens match your current filters.</p>
              <p className="text-sm text-gray-500 mt-2">Try adjusting your filter settings above.</p>
            </>
          )}
        </div>
      ) : (
        <>
          {/* Simple token list */}
          <div className="space-y-3 max-h-[500px] overflow-y-auto border border-gray-700/30 rounded-md p-3 shadow-md">
            {filteredTokens.map((token) => (
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
                ? `${selectedCount} of ${filteredTokens.length} selected` 
                : "Click tokens to select"}
            </span>
            
            <div className="flex gap-2">
              {/* Only show Select All button for spam tokens */}
              {isSpam && selectedCount < filteredTokens.length && (
                <button 
                  onClick={handleSelectAll}
                  className="text-sm px-4 py-2 rounded-md bg-blue-800/80 hover:bg-blue-700 text-white transition-colors"
                  aria-label={`Select all ${filteredTokens.length} tokens in this list`}
                >
                  {searchQuery ? 'Select All Filtered' : 'Select All'}
                </button>
              )}
              
              {/* Show warning text for regular tokens instead of Select All button */}
              {!isSpam && (
                <span className="text-sm text-yellow-400 font-medium px-2 py-2">
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