import '@/styles/globals.css';
import type { AppProps } from 'next/app';
import { useEffect } from 'react';

import '@rainbow-me/rainbowkit/styles.css';
import { WagmiConfig } from 'wagmi';
import { RainbowKitProvider } from '@rainbow-me/rainbowkit';
import { config } from '@/lib/wallet';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import WalletErrorBoundary from '@/components/WalletErrorBoundary';
import { parseWalletError, isUserRejectionError } from '@/utils/errorHandling';

const queryClient = new QueryClient();

export default function App({ Component, pageProps }: AppProps) {
  // Global error handler for unhandled promise rejections (like wallet errors)
  useEffect(() => {
    const handleUnhandledRejection = (event: PromiseRejectionEvent) => {
      const error = event.reason;
      
      // Check if this is a wallet-related error
      if (error && typeof error === 'object') {
        const errorString = error.toString().toLowerCase();
        const isWalletError = (
          isUserRejectionError(error) ||
          errorString.includes('user rejected') ||
          errorString.includes('user denied') ||
          errorString.includes('contract') ||
          errorString.includes('transaction')
        );
        
        if (isWalletError) {
          // Prevent the default unhandled rejection behavior
          event.preventDefault();
          
          const parsedError = parseWalletError(error);
          
          // Log for debugging but don't show scary console errors
          console.log('Wallet error (handled gracefully):', parsedError.userFriendlyMessage);
          
          // If it's a user rejection, we can silently handle it
          if (parsedError.type === 'USER_REJECTED') {
            console.log('User cancelled transaction - this is normal behavior');
          }
          
          return;
        }
      }
      
      // For non-wallet errors, let them be handled normally
      console.error('Unhandled promise rejection:', error);
    };

    // Add event listener for unhandled promise rejections
    window.addEventListener('unhandledrejection', handleUnhandledRejection);
    
    // Cleanup
    return () => {
      window.removeEventListener('unhandledrejection', handleUnhandledRejection);
    };
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <WagmiConfig config={config}>
        <RainbowKitProvider>
          <WalletErrorBoundary>
            <Component {...pageProps} />
          </WalletErrorBoundary>
        </RainbowKitProvider>
      </WagmiConfig>
    </QueryClientProvider>
  );
}
