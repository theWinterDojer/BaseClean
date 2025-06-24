import { getDefaultConfig } from '@rainbow-me/rainbowkit';
import { base } from 'wagmi/chains';

// Get environment variable with type checking and proper error handling
const WALLET_CONNECT_PROJECT_ID = process.env.NEXT_PUBLIC_WALLET_CONNECT_PROJECT_ID;

// Enhanced validation to prevent production issues
if (!WALLET_CONNECT_PROJECT_ID) {
  if (process.env.NODE_ENV === 'production') {
    throw new Error(
      'NEXT_PUBLIC_WALLET_CONNECT_PROJECT_ID is required in production. ' +
      'Get your Project ID from https://cloud.walletconnect.com'
    );
  } else {
    console.warn(
      '⚠️  DEVELOPMENT MODE: Using fallback WalletConnect Project ID. ' +
      'Set NEXT_PUBLIC_WALLET_CONNECT_PROJECT_ID for production deployment.'
    );
  }
}

/**
 * RainbowKit and Wagmi configuration for wallet connection
 * Supports Base mainnet only
 * 
 * Note: Fallback Project ID is only used in development mode.
 * Production deployments must set NEXT_PUBLIC_WALLET_CONNECT_PROJECT_ID.
 */
export const config = getDefaultConfig({
  appName: 'BaseClean',
  projectId: WALLET_CONNECT_PROJECT_ID || '399eb6cfd79646eaae8648161ce51643', // Development fallback only
  chains: [base],
  ssr: true, // Enable server-side rendering compatibility
});

