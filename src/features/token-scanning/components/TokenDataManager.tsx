import { useEffect, useState, useCallback } from 'react';
import { useAccount, useChainId } from 'wagmi';
import { Token } from '@/types/token';
import { fetchTokenBalances } from '@/lib/api';

interface TokenDataManagerProps {
  onTokensLoaded: (tokens: Token[]) => void;
  showDisclaimer: boolean; // Passed down from _app.tsx
  children: (props: {
    tokens: Token[];
    loading: boolean;
    error: string | null;
    isConnected: boolean;
    isClient: boolean;
    updateTokens: (newTokens: Token[]) => void;
    showDisclaimer: boolean;
  }) => React.ReactNode;
}

interface LoadingProgress {
  phase: 'scanning' | 'found' | 'processing' | 'finalizing';
  tokenCount: number;
  processedTokens: Token[];
  currentTokenSymbol?: string;
  discoveryMessage?: string; // Real-time progress from API
}

/**
 * Enhanced Loading Screen with Smart Messages and Token Image Cycling
 */
function SmartLoadingScreen({ progress }: { progress: LoadingProgress }) {
  const [dots, setDots] = useState('');
  const [currentTokenIndex, setCurrentTokenIndex] = useState(0);

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

  // Cycle through loaded token images
  useEffect(() => {
    if (progress.processedTokens.length > 1) {
      const imageInterval = setInterval(() => {
        setCurrentTokenIndex(prev => (prev + 1) % progress.processedTokens.length);
      }, 800); // Show each token for 800ms

      return () => clearInterval(imageInterval);
    }
  }, [progress.processedTokens.length]);

  // Smart contextual messages based on actual progress
  const getSmartMessage = () => {
    // Use real-time discovery message if available
    if (progress.discoveryMessage) {
      return progress.discoveryMessage;
    }
    
    // Fallback to phase-based messages
    switch (progress.phase) {
      case 'scanning':
        return 'Connecting to Base network...';
      case 'found':
        return `Found ${progress.tokenCount} tokens, analyzing...`;
      case 'processing':
        return 'Processing token metadata...';
      case 'finalizing':
        return `Almost ready! Finalizing ${progress.tokenCount} tokens...`;
      default:
        return 'Loading...';
    }
  };

  const currentToken = progress.processedTokens[currentTokenIndex];

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-8">
      {/* Main Loading Icon with Token Image Cycling */}
      <div className="relative">
        {/* Animated gradient background */}
        <div className="w-20 h-20 bg-gradient-to-r from-blue-500 to-green-500 rounded-full flex items-center justify-center animate-pulse">
          <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center overflow-hidden">
            {currentToken ? (
              <div className="w-10 h-10 rounded-full overflow-hidden bg-gray-100">
                <img
                  src={currentToken.logo_url || `https://storage.googleapis.com/zapper-fi-assets/tokens/base/${currentToken.contract_address}.png`}
                  alt={currentToken.contract_ticker_symbol}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.style.display = 'none';
                    target.parentElement!.innerHTML = `
                      <div class="w-full h-full bg-blue-500 flex items-center justify-center text-white text-xs font-bold">
                        ${currentToken.contract_ticker_symbol?.substring(0, 2) || 'TK'}
                      </div>
                    `;
                  }}
                />
              </div>
            ) : (
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
            )}
          </div>
        </div>
        
        {/* Rotating rings */}
        <div className="absolute inset-0 w-20 h-20 border-4 border-transparent border-t-blue-400 rounded-full animate-spin"></div>
        <div className="absolute inset-2 w-16 h-16 border-4 border-transparent border-r-green-400 rounded-full animate-spin-slow"></div>
        
        {/* Token symbol overlay when cycling through images */}
        {currentToken && (
          <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 bg-gray-900 text-white text-xs px-2 py-1 rounded opacity-80">
            {currentToken.contract_ticker_symbol}
          </div>
        )}
      </div>

      {/* Smart Loading Messages */}
      <div className="text-center space-y-4">
        <h2 className="text-2xl font-bold text-white">
          {progress.tokenCount > 0 ? `Discovered ${progress.tokenCount} Tokens` : 'Scanning Your Wallet'}
        </h2>
        
        <p className="text-lg text-gray-300 min-h-[28px]">
          {getSmartMessage()}
          <span className="inline-block w-6 text-left">{dots}</span>
        </p>
        
        {/* Dynamic Progress Bar */}
        <div className="w-64 mx-auto bg-gray-700 rounded-full h-2 overflow-hidden">
          <div 
            className="h-full bg-gradient-to-r from-blue-500 to-green-500 rounded-full transition-all duration-500"
            style={{ 
              width: progress.phase === 'scanning' ? '20%' :
                     progress.phase === 'found' ? '40%' :
                     progress.phase === 'processing' ? '70%' : '95%'
            }}
          />
        </div>
        
        {/* Token Preview Strip */}
        {progress.processedTokens.length > 0 && (
          <div className="flex justify-center space-x-2 mt-4">
            {progress.processedTokens.slice(0, 6).map((token, index) => (
              <div 
                key={token.contract_address}
                className={`w-8 h-8 rounded-full border-2 transition-all duration-300 ${
                  index === currentTokenIndex ? 'border-blue-400 scale-110' : 'border-gray-600'
                }`}
              >
                <img
                  src={token.logo_url || `https://storage.googleapis.com/zapper-fi-assets/tokens/base/${token.contract_address}.png`}
                  alt={token.contract_ticker_symbol}
                  className="w-full h-full rounded-full object-cover"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.style.display = 'none';
                    target.parentElement!.innerHTML = `
                      <div class="w-full h-full bg-blue-500 rounded-full flex items-center justify-center text-white text-xs font-bold">
                        ${token.contract_ticker_symbol?.substring(0, 1) || 'T'}
                      </div>
                    `;
                  }}
                />
              </div>
            ))}
            {progress.processedTokens.length > 6 && (
              <div className="w-8 h-8 rounded-full bg-gray-700 flex items-center justify-center text-white text-xs">
                +{progress.processedTokens.length - 6}
              </div>
            )}
          </div>
        )}
        
        <p className="text-sm text-gray-400 max-w-md mx-auto">
          {progress.processedTokens.length > 0 
            ? `Processed ${progress.processedTokens.length} of ${progress.tokenCount} tokens`
            : 'Securely scanning your wallet for tokens'
          }
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
export default function TokenDataManager({ onTokensLoaded, showDisclaimer, children }: TokenDataManagerProps) {
  const { address, isConnected } = useAccount();
  const chainId = useChainId();
  const [tokens, setTokens] = useState<Token[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isClient, setIsClient] = useState(false);
  const [loadingProgress, setLoadingProgress] = useState<LoadingProgress>({
    phase: 'scanning',
    tokenCount: 0,
    processedTokens: []
  });

  // Set isClient to true once component mounts in the client
  useEffect(() => {
    setIsClient(true);
  }, []);

  // Enhanced token fetching with progress tracking
  const fetchTokensWithProgress = useCallback(async (walletAddress: string, currentChainId: number) => {
    setLoadingProgress({ phase: 'scanning', tokenCount: 0, processedTokens: [] });
    
    try {
      // Real-time progress callback for API
      const onProgress = (discovered: number, phase: string) => {
        setLoadingProgress(prev => ({
          ...prev,
          phase: phase.includes('Complete') ? 'finalizing' : 
                 phase.includes('Processing') || phase.includes('Fetching') ? 'processing' : 'scanning',
          tokenCount: discovered,
          discoveryMessage: phase
        }));
      };
      
      const tokenItems = await fetchTokenBalances(walletAddress, currentChainId, onProgress);
      
      // Final success state
      if (tokenItems.length > 0) {
        // Brief moment to show completion
        setLoadingProgress({
          phase: 'finalizing',
          tokenCount: tokenItems.length,
          processedTokens: tokenItems,
          discoveryMessage: `Ready! Found ${tokenItems.length} tokens`
        });
        
        // Longer delay to showcase the token images
        await new Promise(resolve => setTimeout(resolve, 1500));
        
        onTokensLoaded(tokenItems);
        setTokens(tokenItems);
        setLoading(false);
      } else {
        setTokens([]);
        setLoading(false);
      }
      
    } catch (error) {
      console.error('Error fetching tokens:', error);
      setError(error instanceof Error ? error.message : 'Failed to fetch tokens');
      setLoading(false);
    }
  }, [onTokensLoaded]);

  // Fetch tokens when connected or chain changes - BUT ONLY if disclaimer is accepted
  useEffect(() => {
    if (!isConnected || !address || showDisclaimer) {
      return;
    }
    
    const getTokens = async () => {
      setLoading(true);
      setError(null);
      
      try {
        await fetchTokensWithProgress(address, chainId);
      } catch (err) {
        console.error('Failed to fetch tokens:', err);
        setError('Failed to load tokens. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    getTokens();
  }, [address, isConnected, chainId, fetchTokensWithProgress, showDisclaimer]);

  // Update tokens when they change externally (e.g., after burning)
  const updateTokens = (newTokens: Token[]) => {
    setTokens(newTokens);
    onTokensLoaded(newTokens);
  };

  return (
    <section className="mt-4 space-y-5" aria-labelledby="wallet-token-management">
      {/* Not connected message - centered on page */}
      {isClient && !isConnected && (
        <div className="fixed inset-0 flex items-center justify-center bg-gray-900/80 backdrop-blur-sm">
          <div className="bg-gray-800/90 border border-gray-700 text-white p-8 rounded-xl shadow-2xl text-center max-w-md mx-4">
            <div className="mb-4">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-gray-400 mx-auto mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1-1H8a1 1 0 00-1 1v3M4 7h16" />
              </svg>
            </div>
            <span className="text-xl font-medium">Connect your wallet to start using BaseClean</span>
          </div>
        </div>
      )}

      {/* Disclaimer acceptance required message - show instead of children when disclaimer is active */}
      {isClient && isConnected && showDisclaimer && (
        <div className="bg-yellow-900/30 border border-yellow-700 text-white p-5 rounded-lg flex items-center justify-center">
          <div className="text-center">
            <div className="flex items-center justify-center mb-2">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-yellow-400 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
              <span className="text-lg font-medium">Please Acknowledge Disclaimer</span>
            </div>
            <p className="text-gray-300">
              Please read and accept the disclaimer to start scanning your tokens.
            </p>
          </div>
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

      {/* Only render children when disclaimer is NOT showing */}
      {isClient && isConnected && !showDisclaimer && (
        <>
          {/* Smart Loading Screen with Token Cycling */}
          {loading ? (
            <SmartLoadingScreen progress={loadingProgress} />
          ) : (
            children({
              tokens,
              loading,
              error,
              isConnected,
              isClient,
              updateTokens,
              showDisclaimer,
            })
          )}
        </>
      )}
    </section>
  );
} 