import { getDefaultConfig } from '@rainbow-me/rainbowkit';
import { base } from 'wagmi/chains';

// Get environment variable with type checking and proper error handling
const WALLET_CONNECT_PROJECT_ID = process.env.NEXT_PUBLIC_WALLET_CONNECT_PROJECT_ID;

// Validate the project ID
if (!WALLET_CONNECT_PROJECT_ID) {
  console.warn(
    'Warning: NEXT_PUBLIC_WALLET_CONNECT_PROJECT_ID environment variable is not set. ' +
    'Using fallback ID, which may not work in production.'
  );
}

/**
 * RainbowKit and Wagmi configuration for wallet connection
 * Uses Base blockchain as the primary chain
 */
export const config = getDefaultConfig({
  appName: 'BaseClean',
  projectId: WALLET_CONNECT_PROJECT_ID || '399eb6cfd79646eaae8648161ce51643', // Fallback ID for development
  chains: [base],
  ssr: true, // Enable server-side rendering compatibility
});

