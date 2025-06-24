# 🔥 BaseClean

A Web3 application for burning unwanted ERC-20 tokens and NFTs on Base network without requiring token approvals.

## 🎯 Overview

BaseClean allows users to permanently remove unwanted tokens from their wallets by transferring them directly to a burn address (`0x000000000000000000000000000000000000dEaD`). Unlike traditional token burners that require users to approve smart contracts, BaseClean uses direct wallet transfers.

## 🔧 Technical Approach

**✅ Direct Transfer Method:**
- Transfer tokens directly to burn address
- No smart contract approvals required
- Each token transfer is an independent transaction
- No batch transaction dependencies

**❌ Traditional Approval Method (not used):**
- Approve smart contract for each token
- Call batch burn function
- Creates permanent approval attack surface
- Complex transaction dependencies

## ✨ Features

- 🔍 **Token Discovery**: Scans wallet for ERC-20 tokens using Alchemy API
- 🖼️ **NFT Support**: Supports ERC-721 and ERC-1155 tokens on Base and Zora networks
- 🛡️ **Spam Detection**: Filters tokens by value, naming patterns, and metadata
- ⚡ **Visual Filtering**: Burned assets disappear from UI immediately
- 📊 **Transaction History**: Local storage of burn history with CSV export
- 🔒 **Zero Approvals**: No token approvals ever required

## 🛠️ Tech Stack

- **Framework**: Next.js 15.3.2 with TypeScript
- **Web3**: Wagmi v2.15.4, RainbowKit v2.2.5, Viem v2.29.4
- **Styling**: Tailwind CSS 3.4.3
- **APIs**: Alchemy for token/NFT data, ScamSniffer for security
- **Network**: Base mainnet (chain ID 8453)

## 🚀 Development Setup

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Run production server
npm start
```

## 🔑 Environment Variables

Required for production:
```bash
NEXT_PUBLIC_ALCHEMY_API_KEY=your_alchemy_api_key
NEXT_PUBLIC_WALLET_CONNECT_PROJECT_ID=your_walletconnect_project_id
```

## 📁 Project Structure

```
src/
├── 🧩 components/          # Shared UI components
├── 🔄 contexts/           # React context providers
├── 🎯 features/           # Feature-specific modules
│   ├── token-scanning/    # Token discovery and management
│   └── nft-scanning/      # NFT discovery and management
├── 🪝 hooks/              # Custom React hooks
├── 📚 lib/                # API clients and utilities
├── 📄 pages/              # Next.js routes
├── 🤝 shared/             # Shared components across features
├── 📝 types/              # TypeScript type definitions
└── 🔧 utils/              # Utility functions
```

## 🔑 Key Components

- `useUniversalBurnFlow.ts` - Core burning logic for tokens and NFTs
- `useBurnHistory.ts` - Transaction history management
- `directBurner.ts` - Wallet transaction execution
- `api.ts` - Token data fetching and caching
- `nftApi.ts` - NFT data fetching and metadata

## 🛡️ Security Considerations

- 🚫 No token approvals eliminates approval-based attack vectors
- 👀 Direct transfers are transparent and easily auditable
- 🎯 No smart contract dependencies reduces complexity
- 🏠 Local-only data storage (no external tracking)
- 📖 Open source codebase for security review

## 🌐 Deployment

The application is designed for deployment as a hosted service at `baseclean.io`. Key deployment requirements:

1. 🔧 Configure WalletConnect domains in Reown cloud dashboard
2. ⚙️ Set production environment variables
3. 🔒 Ensure HTTPS for wallet compatibility
4. 🛡️ Configure proper CSP headers for security

## 🧪 Testing

The application includes spam detection filters and visual feedback systems. Test with various token types and edge cases before production deployment.

## 📄 License

MIT License - see LICENSE file for details.
