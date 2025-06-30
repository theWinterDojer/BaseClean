import { Token } from '@/types/token';
import TokenList from '@/shared/components/TokenList';
import { UI_TEXT } from '@/constants/tokens';
import { useMemo } from 'react';

interface TokenListsContainerProps {
  spamTokens: Token[];
  nonSpamTokens: Token[];
  selectedTokens: Set<string>;
  toggleToken: (contractAddress: string, tokens?: Token[]) => void;
}

export default function TokenListsContainer({
  spamTokens,
  nonSpamTokens,
  selectedTokens,
  toggleToken
}: TokenListsContainerProps) {
  // Calculate total values for each category
  const spamTotalValue = useMemo(() => {
    return spamTokens.reduce((sum, token) => {
      const balance = parseFloat(token.balance) / (10 ** token.contract_decimals);
      const value = balance * (token.quote_rate || 0);
      return sum + value;
    }, 0);
  }, [spamTokens]);

  const nonSpamTotalValue = useMemo(() => {
    return nonSpamTokens.reduce((sum, token) => {
      const balance = parseFloat(token.balance) / (10 ** token.contract_decimals);
      const value = balance * (token.quote_rate || 0);
      return sum + value;
    }, 0);
  }, [nonSpamTokens]);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-5">
      {/* Suspected Spam Tokens */}
      <div>
        <div className="bg-red-900/10 border border-red-900/30 rounded-lg overflow-hidden">
          <div className="flex items-center justify-between bg-red-900/20 px-4 py-3 border-b border-red-900/30">
            <div className="flex items-center gap-2">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-red-500" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
              <h3 className="font-bold text-red-400">Suspected Spam Tokens</h3>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-sm text-red-300 font-bold">
                Total: ${spamTotalValue.toLocaleString(undefined, { maximumFractionDigits: 2 })}
              </span>
              <span className="bg-red-800/50 text-red-200 text-xs px-2 py-1 rounded-full">{spamTokens.length} tokens</span>
            </div>
          </div>
          
          {spamTokens.length > 0 ? (
            <TokenList 
              tokens={spamTokens}
              selectedTokens={selectedTokens}
              toggleToken={toggleToken}
              isSpam={true}
            />
          ) : (
            <div className="flex flex-col items-center justify-center py-10 px-4 text-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-gray-400 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <p className="text-gray-400">{UI_TEXT.NO_SPAM_TOKENS}</p>
            </div>
          )}
        </div>
      </div>

      {/* Regular Tokens */}
      <div>
        <div className="bg-gray-800/40 border border-gray-700 rounded-lg overflow-hidden">
          <div className="flex items-center justify-between bg-gray-800/60 px-4 py-3 border-b border-gray-700">
            <div className="flex items-center gap-2">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-blue-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              <h3 className="font-bold text-blue-400">Regular Tokens</h3>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-sm text-blue-300 font-bold">
                Total: ${nonSpamTotalValue.toLocaleString(undefined, { maximumFractionDigits: 2 })}
              </span>
              <span className="bg-blue-800/50 text-blue-200 text-xs px-2 py-1 rounded-full">{nonSpamTokens.length} tokens</span>
            </div>
          </div>
          
          {nonSpamTokens.length > 0 ? (
            <TokenList 
              tokens={nonSpamTokens}
              selectedTokens={selectedTokens}
              toggleToken={toggleToken}
            />
          ) : (
            <div className="flex flex-col items-center justify-center py-10 px-4 text-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-gray-400 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 12H4" />
              </svg>
              <p className="text-gray-400">{UI_TEXT.NO_REGULAR_TOKENS}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
} 