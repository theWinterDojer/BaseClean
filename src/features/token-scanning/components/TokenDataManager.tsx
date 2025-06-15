import React, { useEffect, useState, useCallback } from 'react';
import Image from 'next/image';
import { useAccount, useChainId } from 'wagmi';
import { Token } from '@/types/token';
import { fetchTokenBalances, generateTokenFallbackHTML } from '@/lib/api';

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

// Cycling messages for different phases - simplified and appropriate
const CYCLING_MESSAGES = {
  scanning: ['Connecting to Base network...'],
  found: ['Analyzing tokens...'],
  processing: [
    'Fetching metadata...',
    'Loading token details...',
    'Getting prices...',
    'Almost ready...'
  ],
  finalizing: ['Finalizing...']
} as const;

/**
 * Enhanced Loading Screen with Smart Messages and Token Image Cycling
 */
function SmartLoadingScreen({ progress }: { progress: LoadingProgress }) {
  const [dots, setDots] = useState('');
  const [currentTokenIndex, setCurrentTokenIndex] = useState(0);
  const [cyclingMessageIndex, setCyclingMessageIndex] = useState(0);

  // Generate dynamic messages based on token count
  const generateMessages = useCallback((phase: string, tokenCount: number) => {
    switch (phase) {
      case 'found':
        return [`Found ${tokenCount} tokens...`];
      case 'finalizing':
        return [`Ready! ${tokenCount} tokens processed`];
      default:
        return CYCLING_MESSAGES[phase as keyof typeof CYCLING_MESSAGES] || ['Loading...'];
    }
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

  // Cycle through messages ONLY during processing phase (when it feels slowest) 
  useEffect(() => {
    if (progress.phase === 'processing') {
      const currentMessages = generateMessages(progress.phase, progress.tokenCount);
      
      if (currentMessages.length > 1) {
        const messageInterval = setInterval(() => {
          setCyclingMessageIndex(prev => (prev + 1) % currentMessages.length);
        }, 2000); // 2 second intervals

        return () => clearInterval(messageInterval);
      }
    } else {
      setCyclingMessageIndex(0); // Reset when not processing
    }
  }, [progress.phase, progress.tokenCount, generateMessages]);

  // Cycle through loaded token images
  useEffect(() => {
    if (progress.processedTokens.length > 1) {
      const imageInterval = setInterval(() => {
        setCurrentTokenIndex(prev => (prev + 1) % progress.processedTokens.length);
      }, 800); // Show each token for 800ms

      return () => clearInterval(imageInterval);
    }
  }, [progress.processedTokens.length]);

  // Smart contextual messages with cycling support
  const getSmartMessage = () => {
    // For processing phase, ignore API discoveryMessage and use cycling messages
    if (progress.phase === 'processing') {
      const currentMessages = generateMessages(progress.phase, progress.tokenCount);
      const messageIndex = Math.min(cyclingMessageIndex, currentMessages.length - 1);
      return currentMessages[messageIndex];
    }
    
    // For other phases, use API message if available, otherwise use our messages
    if (progress.discoveryMessage) {
      return progress.discoveryMessage;
    }
    
    const currentMessages = generateMessages(progress.phase, progress.tokenCount);
    return currentMessages[0] || 'Loading...';
  };

  const currentToken = progress.processedTokens[currentTokenIndex];

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-8 relative">
      {/* Balanced Wavery Scanning Pattern Background - Constrained to 60vh */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {/* Balanced horizontal wavy scanning patterns */}
        <div className="absolute inset-0">
          {/* Primary balanced wavy scanning line */}
          <div className="absolute w-full h-1.5 animate-wavy-scan-1" style={{ top: '20%' }}>
            <div className="w-full h-full bg-gradient-to-r from-transparent via-blue-400/35 to-transparent animate-wave-flow-1"
                 style={{ 
                   clipPath: 'polygon(0% 50%, 8% 30%, 16% 70%, 24% 35%, 32% 65%, 40% 40%, 48% 60%, 56% 45%, 64% 55%, 72% 35%, 80% 65%, 88% 40%, 96% 60%, 100% 50%, 100% 100%, 0% 100%)'
                 }}></div>
          </div>
          
          {/* Secondary balanced wavy scanning line */}
          <div className="absolute w-full h-1.5 animate-wavy-scan-2" style={{ top: '45%', animationDelay: '2s' }}>
            <div className="w-full h-full bg-gradient-to-r from-transparent via-green-400/30 to-transparent animate-wave-flow-2"
                 style={{ 
                   clipPath: 'polygon(0% 50%, 12% 65%, 20% 35%, 28% 70%, 36% 30%, 44% 60%, 52% 40%, 60% 65%, 68% 35%, 76% 70%, 84% 30%, 92% 60%, 100% 50%, 100% 100%, 0% 100%)'
                 }}></div>
          </div>
          
          {/* Tertiary balanced wavy scanning line */}
          <div className="absolute w-full h-1 animate-wavy-scan-3" style={{ top: '70%', animationDelay: '4s' }}>
            <div className="w-full h-full bg-gradient-to-r from-transparent via-blue-300/25 to-transparent animate-wave-flow-3"
                 style={{ 
                   clipPath: 'polygon(0% 50%, 10% 45%, 20% 55%, 30% 40%, 40% 60%, 50% 50%, 60% 40%, 70% 60%, 80% 45%, 90% 55%, 100% 50%, 100% 100%, 0% 100%)'
                 }}></div>
          </div>
          
          {/* Fourth balanced wavy scanning line */}
          <div className="absolute w-full h-1 animate-wavy-scan-4" style={{ top: '85%', animationDelay: '6s' }}>
            <div className="w-full h-full bg-gradient-to-r from-transparent via-green-300/20 to-transparent animate-wave-flow-4"
            style={{
                   clipPath: 'polygon(0% 50%, 14% 60%, 28% 40%, 42% 65%, 56% 35%, 70% 55%, 84% 45%, 100% 50%, 100% 100%, 0% 100%)'
                 }}></div>
          </div>
        </div>
        
        {/* Balanced analysis lines */}
        <div className="absolute inset-0">
          <div className="absolute h-full w-0.5 bg-gradient-to-b from-transparent via-blue-400/15 to-transparent animate-analysis-line-1" 
               style={{ left: '20%' }}></div>
          <div className="absolute h-full w-0.5 bg-gradient-to-b from-transparent via-green-400/12 to-transparent animate-analysis-line-2" 
               style={{ left: '50%', animationDelay: '3s' }}></div>
          <div className="absolute h-full w-0.5 bg-gradient-to-b from-transparent via-blue-300/10 to-transparent animate-analysis-line-3" 
               style={{ left: '80%', animationDelay: '6s' }}></div>
        </div>
        
        {/* Dual breathing circles - Centered within 60vh */}
        <div className="absolute inset-0 flex items-center justify-center">
          {/* Primary breathing circle - slower and larger */}
          <div className="absolute w-48 h-48 border border-blue-400/6 rounded-full animate-pulse-gentle" 
               style={{ animationDuration: '6s' }}></div>
          {/* Secondary larger breathing circle - more subtle, starts simultaneously */}
          <div className="absolute w-80 h-80 border border-green-400/2 rounded-full animate-pulse-gentle" 
               style={{ animationDuration: '8s' }}></div>
        </div>
        
        {/* Synchronized orbital elements - Centered within 60vh */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="relative">
            {/* Three orbital dots with enhanced visibility */}
            <div className="animate-orbit-small">
              <div className="w-2 h-2 bg-blue-400/60 rounded-full shadow-sm shadow-blue-400/20"></div>
            </div>
            <div className="animate-orbit-medium">
              <div className="w-1.5 h-1.5 bg-green-400/50 rounded-full shadow-sm shadow-green-400/15"></div>
            </div>
            <div className="animate-orbit-large">
              <div className="w-1 h-1 bg-blue-300/70 rounded-full shadow-sm shadow-blue-300/25"></div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content - Layered over background within same 60vh container */}
      <div className="relative z-10 flex flex-col items-center justify-center space-y-8">
        {/* Main Loading Icon with Token Image Cycling */}
        <div className="relative">
          {/* Animated gradient background */}
          <div className="w-20 h-20 bg-gradient-to-r from-blue-500 to-green-500 rounded-full flex items-center justify-center animate-pulse">
            <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center overflow-hidden">
              {currentToken ? (
                <div className="w-10 h-10 rounded-full overflow-hidden bg-gray-100 relative">
                  <Image
                    src={currentToken.logo_url || `https://storage.googleapis.com/zapper-fi-assets/tokens/base/${currentToken.contract_address}.png`}
                    alt={currentToken.contract_ticker_symbol}
                    fill
                    className="object-cover"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.style.display = 'none';
                      target.parentElement!.innerHTML = generateTokenFallbackHTML(
                        currentToken.contract_address, 
                        currentToken.contract_ticker_symbol, 
                        'medium'
                      );
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
          
          <p className="text-lg text-gray-300 min-h-[28px] transition-all duration-300">
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
                  className={`w-8 h-8 rounded-full transition-all duration-300 ${
                    index === currentTokenIndex ? 'scale-110 ring-2 ring-blue-400 ring-offset-1 ring-offset-gray-900' : ''
                  }`}
                >
                  <div className="w-8 h-8 rounded-full overflow-hidden bg-gray-700 relative">
                    <Image
                      src={token.logo_url || `https://storage.googleapis.com/zapper-fi-assets/tokens/base/${token.contract_address}.png`}
                      alt={token.contract_ticker_symbol}
                      fill
                      className="object-cover"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.style.display = 'none';
                        target.parentElement!.innerHTML = generateTokenFallbackHTML(
                          token.contract_address, 
                          token.contract_ticker_symbol, 
                          'small'
                        );
                      }}
                    />
                  </div>
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
        
        // Extended delay to showcase the token images and completion state
        await new Promise(resolve => setTimeout(resolve, 3000));
        
        onTokensLoaded(tokenItems);
        setTokens(tokenItems);
        setLoading(false);
        
        // Log image loading summary after token processing completes
        const { logImageLoadingSummary } = await import('../../../lib/api');
        logImageLoadingSummary();
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
            <span className="text-xl font-medium">Connect your wallet to start using BaseClean. A zero-approval cleaning tool for Base.</span>
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