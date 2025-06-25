import '@/styles/globals.css';
import type { AppProps } from 'next/app';
import { useEffect } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';

import '@rainbow-me/rainbowkit/styles.css';
import { WagmiConfig } from 'wagmi';
import { RainbowKitProvider } from '@rainbow-me/rainbowkit';
import { config } from '@/lib/wallet';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import WalletErrorBoundary from '@/components/WalletErrorBoundary';
import DisclaimerModal from '@/components/DisclaimerModal';
import { useDisclaimer } from '@/hooks/useDisclaimer';
import { parseWalletError, isUserRejectionError } from '@/utils/errorHandling';
import { SelectedItemsProvider } from '@/contexts/SelectedItemsContext';

const queryClient = new QueryClient();

function AppContent(props: AppProps) {
  const { showDisclaimer, isLoading, handleAgree } = useDisclaimer();
  const { Component, pageProps } = props;
  const router = useRouter();

  // Don't show disclaimer on terms-of-service page
  const shouldShowDisclaimer = showDisclaimer && router.pathname !== '/terms-of-service';

  // Don't render anything while checking disclaimer status
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center">
        <div className="text-white">Loading...</div>
      </div>
    );
  }

  return (
    <>
      <Head>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>
      <DisclaimerModal isOpen={shouldShowDisclaimer} onAgree={handleAgree} />
      <Component {...pageProps} showDisclaimer={showDisclaimer} />
    </>
  );
}

export default function App(props: AppProps) {
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
          errorString.includes('transaction') ||
          // Specifically catch ContractFunctionExecutionError with user rejection
          (errorString.includes('contractfunctionexecutionerror') && errorString.includes('user rejected'))
        );
        
        if (isWalletError) {
          // Prevent the default unhandled rejection behavior
          event.preventDefault();
          
          const parsedError = parseWalletError(error);
          
          // Only log non-user-rejection errors
          if (parsedError.type !== 'USER_REJECTED') {
            console.log('Wallet error (handled gracefully):', parsedError.userFriendlyMessage);
          }
          
          // For user rejections, log minimal info only in development
          if (parsedError.type === 'USER_REJECTED' && process.env.NODE_ENV === 'development') {
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
          <SelectedItemsProvider>
            <WalletErrorBoundary>
              <AppContent {...props} />
            </WalletErrorBoundary>
          </SelectedItemsProvider>
        </RainbowKitProvider>
      </WagmiConfig>
    </QueryClientProvider>
  );
}
