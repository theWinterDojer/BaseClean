# 🔥 BaseClean

A Web3 application for burning unwanted ERC-20 tokens and NFTs on Base network without requiring token approvals.

## 🎯 What is BaseClean?

BaseClean allows users to permanently remove unwanted tokens from their wallets by transferring them directly to a burn address (`0x000000000000000000000000000000000000dEaD`). Unlike traditional token burners that require users to approve smart contracts, BaseClean uses direct wallet transfers.

## ✨ Features

- 🔍 **Token Discovery**: Automatically scans your wallet for ERC-20 tokens
- 🖼️ **NFT Support**: Supports ERC-721 and ERC-1155 tokens on Base and Zora networks
- 🛡️ **Spam Detection**: Smart filters to identify low-value and suspicious tokens
- ⚡ **Instant Updates**: Burned assets disappear from your wallet immediately
- 📊 **Transaction History**: Keep track of all your burn transactions
- 🔒 **Zero Approvals**: No token approvals ever required - maximum security

## 🔧 Why Zero Approvals Matter

**✅ BaseClean Direct Transfer (Safe):**
- Transfer tokens directly to burn address
- No smart contract approvals required
- Each transaction is independent and transparent
- Zero ongoing security risks

**❌ Traditional Approval Method (Risky):**
- Approve smart contract for each token
- Creates permanent approval attack surface
- Complex batch transactions that can fail
- Ongoing security vulnerabilities

## 🚀 For Developers

### Development Setup
```bash
# Clone the repository
git clone https://github.com/theWinterDojer/BaseClean.git
cd BaseClean/baseclean

# Install dependencies
npm install

# Start development server
npm run dev
```

### Tech Stack
- **Framework**: Next.js 15.3.2 with TypeScript
- **Web3**: Wagmi v2.15.4, RainbowKit v2.2.5, Viem v2.29.4
- **Styling**: Tailwind CSS 3.4.3
- **Network**: Base mainnet (chain ID 8453)

### Contributing
1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Make your changes and test thoroughly
4. Submit a pull request with a clear description

## 📚 Documentation

For detailed technical documentation, deployment guides, and testing instructions, see the [`docs/`](docs/) directory:

- [Technical Architecture](docs/DIRECT_TRANSFER_EXPLANATION.md)
- [Development Guide](docs/TESTING_GUIDE.md)
- [Quick Start Guide](docs/QUICK_START.md)

## 🛡️ Security

- 🚫 No token approvals eliminates approval-based attack vectors
- 👀 Direct transfers are transparent and easily auditable
- 🎯 No smart contract dependencies reduces complexity
- 🏠 Local-only data storage (no external tracking)
- 📖 Open source codebase for security review

## 📄 License

MIT License - see LICENSE file for details.

---

**🔥 Ready to clean your wallet safely? Connect and start burning unwanted tokens with zero approvals! 🔥**
