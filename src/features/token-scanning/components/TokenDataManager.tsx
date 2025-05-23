import { useEffect, useState } from 'react';
import { useAccount } from 'wagmi';
import { Token } from '@/types/token';
import { fetchTokenBalances } from '@/lib/api';
import { UI_TEXT } from '@/constants/tokens';

interface TokenDataManagerProps {
  onTokensLoaded: (tokens: Token[]) => void;
  children: (props: {
    tokens: Token[];
    loading: boolean;
    error: string | null;
    isConnected: boolean;
    isClient: boolean;
    updateTokens: (newTokens: Token[]) => void;
  }) => React.ReactNode;
}

/**
 * Component responsible for fetching and managing token data
 */
export default function TokenDataManager({ onTokensLoaded, children }: TokenDataManagerProps) {
  const { address, isConnected } = useAccount();
  const [tokens, setTokens] = useState<Token[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isClient, setIsClient] = useState(false);

  // Set isClient to true once component mounts in the client
  useEffect(() => {
    setIsClient(true);
  }, []);

  // Fetch tokens when connected
  useEffect(() => {
    if (!isConnected || !address) return;
    
    const getTokens = async () => {
      setLoading(true);
      setError(null);
      
      try {
        const tokenItems = await fetchTokenBalances(address);
        setTokens(tokenItems);
        onTokensLoaded(tokenItems);
      } catch (err) {
        console.error('Failed to fetch tokens:', err);
        setError('Failed to load tokens. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    getTokens();
  }, [address, isConnected, onTokensLoaded]);

  // Update tokens when they change externally (e.g., after burning)
  const updateTokens = (newTokens: Token[]) => {
    setTokens(newTokens);
    onTokensLoaded(newTokens);
  };

  return (
    <section className="mt-4 space-y-5" aria-labelledby="wallet-token-management">
      {/* Not connected message - only show on client to avoid hydration mismatch */}
      {isClient && !isConnected && (
        <div className="bg-blue-900/30 border border-blue-700 text-white p-5 rounded-lg flex items-center justify-center">
          <span className="text-lg">{UI_TEXT.CONNECT_WALLET}</span>
        </div>
      )}

      {/* Error message */}
      {error && (
        <div className="bg-red-800/30 border border-red-600 text-white p-4 rounded-lg" role="alert">
          <div className="flex items-center gap-2">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <p>{error}</p>
          </div>
        </div>
      )}

      {/* Loading indicator */}
      {loading ? (
        <div className="flex items-center justify-center h-60">
          <div className="animate-spin rounded-full h-12 w-12 border-t-3 border-b-3 border-green-500" aria-label="Loading..."></div>
        </div>
      ) : (
        children({
          tokens,
          loading,
          error,
          isConnected,
          isClient,
          updateTokens,
        })
      )}
    </section>
  );
} 