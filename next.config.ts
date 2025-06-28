import type { NextConfig } from "next";

/**
 * Next.js configuration with security and performance optimizations
 */
const nextConfig: NextConfig = {
  reactStrictMode: true,
  
  // Enable the standalone output mode for smaller builds and better performance
  output: 'standalone',
  
  // Optimize build for production with detailed stats
  webpack(config, { isServer }) {
    // Add optimizations for client bundles
    if (!isServer) {
      config.optimization = {
        ...config.optimization,
        splitChunks: {
          chunks: 'all',
          cacheGroups: {
            commons: {
              test: /[\\/]node_modules[\\/]/,
              name: 'vendors',
              chunks: 'all',
            },
          },
        },
      };
    }
    
    return config;
  },
  
  // Define allowed image sources for Next.js Image component
  images: {
    minimumCacheTTL: 86400, // 24 hours cache for images
    dangerouslyAllowSVG: true, // Allow SVG images (needed for token logos)
    contentDispositionType: 'attachment', // Recommended for security with SVGs
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;", // CSP for SVGs
    formats: ['image/webp', 'image/avif'],
    unoptimized: true, // Skip image optimization to prevent 404 errors in console
    remotePatterns: [
      // Zapper token images - highly reliable
      {
        protocol: 'https',
        hostname: 'storage.googleapis.com',
        pathname: '/zapper-fi-assets/tokens/**',
      },
      
      // GitHub repositories for token images
      {
        protocol: 'https',
        hostname: 'raw.githubusercontent.com',
      },
      
      // 1inch protocol token images
      {
        protocol: 'https',
        hostname: 'tokens.1inch.io',
      },
      
      // DefiLlama icons
      {
        protocol: 'https',
        hostname: 'icons.llama.fi',
      },
      
      // Base chain explorer images
      {
        protocol: 'https',
        hostname: 'basescan.org',
      },
      
      // Trustwallet assets
      {
        protocol: 'https',
        hostname: 'trustwallet.com',
      },
      
      // Base chain resources
      {
        protocol: 'https',
        hostname: 'basechain.org',
      },
      {
        protocol: 'https',
        hostname: 'base.org',
      },
      {
        protocol: 'https',
        hostname: '**.base.org',
      }
    ],
    // Data URLs are automatically allowed for SVG fallbacks
  },
  
  // Configure logging to suppress specific error messages
  logging: {
    fetches: {
      fullUrl: true,
    },
  },
  
  // Add security headers
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: 'X-XSS-Protection',
            value: '1; mode=block',
          },
          {
            key: 'Referrer-Policy',
            value: 'origin-when-cross-origin',
          },
          {
            key: 'Permissions-Policy',
            value: 'camera=(), microphone=(), geolocation=(), interest-cohort=()',
          },
          {
            key: 'Content-Security-Policy',
            value: [
              "default-src 'self'",
              "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://va.vercel-scripts.com", // Allowing inline scripts for Next.js + Vercel Analytics
              "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com", // Allowing inline styles for Tailwind + Google Fonts
              "img-src 'self' data: blob: https:", // Liberal image policy (your images are already secured via next.config)
              "font-src 'self' data: https://fonts.gstatic.com",
              "connect-src 'self' https://coins.llama.fi https://base-mainnet.g.alchemy.com https://zora-mainnet.g.alchemy.com https://mainnet.base.org https://api.github.com https://raw.githubusercontent.com https://nft-cdn.alchemy.com https://res.cloudinary.com https://ipfs.io https://i.seadn.io https://i2c.seadn.io https://raw2.seadn.io https://gateway.pinata.cloud https://cloudflare-ipfs.com https://gateway.ipfs.io https://dweb.link https://nftstorage.link https://openseauserdata.com https://lh3.googleusercontent.com https://assets.coingecko.com https://assets.poap.xyz https://arweave.net https://storage.googleapis.com https://va.vercel-scripts.com https://api.web3modal.org https://pulse.walletconnect.org wss:",
              "frame-src 'none'",
              "object-src 'none'",
              "base-uri 'self'",
              "form-action 'self'",
              "frame-ancestors 'none'"
            ].join('; ')
          }
        ],
      },
    ];
  },
  
  // Enable environment variables type checking
  env: {
    NEXT_PUBLIC_BLOCKCHAIN_API_KEY: process.env.NEXT_PUBLIC_BLOCKCHAIN_API_KEY,
    NEXT_PUBLIC_WALLET_CONNECT_PROJECT_ID: process.env.NEXT_PUBLIC_WALLET_CONNECT_PROJECT_ID,
  },
};

export default nextConfig;