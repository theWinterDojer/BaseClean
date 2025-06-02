import { useEffect, useState } from 'react';
import { useAccount, useChainId } from 'wagmi';
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
 * Loading Screen Component with animations and progress messages
 */
function LoadingScreen() {
  const [loadingMessage, setLoadingMessage] = useState('Scanning your wallet...');
  const [dots, setDots] = useState('');

  // Cycle through loading messages
  useEffect(() => {
    const messages = [
      'Scanning your wallet...',
      'Fetching token balances...',
      'Loading token metadata...',
      'Checking for spam tokens...',
      'Almost ready...'
    ];
    
    let messageIndex = 0;
    const messageInterval = setInterval(() => {
      messageIndex = (messageIndex + 1) % messages.length;
      setLoadingMessage(messages[messageIndex]);
    }, 2000);

    return () => clearInterval(messageInterval);
  }, []);

  // Animate dots
  useEffect(() => {
    const dotInterval = setInterval(() => {
      setDots(prev => {
        if (prev === '...') return '';
        return prev + '.';
      });
    }, 500);

    return () => clearInterval(dotInterval);
  }, []);

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-8">
      {/* Animated Logo/Icon */}
      <div className="relative">
        <div className="w-20 h-20 bg-gradient-to-r from-blue-500 to-green-500 rounded-full flex items-center justify-center animate-pulse">
          <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center">
            <svg 
              className="w-8 h-8 text-blue-600 animate-spin" 
              fill="none" 
              viewBox="0 0 24 24"
            >
              <circle 
                className="opacity-25" 
                cx="12" 
                cy="12" 
                r="10" 
                stroke="currentColor" 
                strokeWidth="4"
              />
              <path 
                className="opacity-75" 
                fill="currentColor" 
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              />
            </svg>
          </div>
        </div>
        
        {/* Rotating rings */}
        <div className="absolute inset-0 w-20 h-20 border-4 border-transparent border-t-blue-400 rounded-full animate-spin"></div>
        <div className="absolute inset-2 w-16 h-16 border-4 border-transparent border-r-green-400 rounded-full animate-spin-slow"></div>
      </div>

      {/* Loading Message */}
      <div className="text-center space-y-4">
        <h2 className="text-2xl font-bold text-white">
          Please wait while we fetch your token balances
        </h2>
        
        <p className="text-lg text-gray-300 min-h-[28px]">
          {loadingMessage}
          <span className="inline-block w-6 text-left">{dots}</span>
        </p>
        
        {/* Progress bar animation */}
        <div className="w-64 mx-auto bg-gray-700 rounded-full h-2 overflow-hidden">
          <div className="h-full bg-gradient-to-r from-blue-500 to-green-500 rounded-full animate-progress"></div>
        </div>
        
        <p className="text-sm text-gray-400 max-w-md mx-auto">
          This may take a few moments while we securely scan your wallet for tokens
        </p>
      </div>

      {/* Floating particles animation */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {[...Array(6)].map((_, i) => (
          <div
            key={i}
            className={`absolute w-2 h-2 bg-blue-400 rounded-full opacity-30 animate-float-${i % 3 + 1}`}
            style={{
              left: `${20 + (i * 12)}%`,
              top: `${30 + (i * 8)}%`,
              animationDelay: `${i * 0.5}s`
            }}
          />
        ))}
      </div>
    </div>
  );
}

/**
 * Component responsible for fetching and managing token data
 */
export default function TokenDataManager({ onTokensLoaded, children }: TokenDataManagerProps) {
  const { address, isConnected } = useAccount();
  const chainId = useChainId();
  const [tokens, setTokens] = useState<Token[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isClient, setIsClient] = useState(false);

  // Set isClient to true once component mounts in the client
  useEffect(() => {
    setIsClient(true);
  }, []);

  // Fetch tokens when connected or chain changes
  useEffect(() => {
    if (!isConnected || !address) return;
    
    const getTokens = async () => {
      setLoading(true);
      setError(null);
      
      try {
        const tokenItems = await fetchTokenBalances(address, chainId);
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
  }, [address, isConnected, chainId, onTokensLoaded]);

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

      {/* Enhanced Loading Screen */}
      {loading ? (
        <LoadingScreen />
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