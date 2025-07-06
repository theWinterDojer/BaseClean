# 🔥 BaseClean

A Web3 application for burning unwanted ERC-20 tokens and NFTs on Base network without requiring token approvals.

## 🎯 What is BaseClean?

BaseClean allows users to permanently remove unwanted tokens from their wallets by transferring them directly to the burn address (`0x000000000000000000000000000000000000dEaD`). 

## ✨ Features

- 🔍 **Token Discovery**: Automatically scans your wallet for ERC-20 tokens
- 🖼️ **NFT Support**: Supports ERC-721 and ERC-1155 tokens on Base and Zora networks
- 🛡️ **Spam Detection**: Smart filters to identify low-value and suspicious tokens
- ⚡ **Instant Updates**: Burned assets disappear from your wallet immediately
- 📊 **Transaction History**: Keep track of all your burn transactions (with CSV exports)
- 🔒 **Zero Approvals**: No token approvals ever required - maximum security
- 🏠 **Privacy-First**: All data stored locally in your browser (no external tracking)
- 📖 **Open Source**: Complete transparency for security review and audit

## 🔧 Why Zero Approvals Matter

**✅ BaseClean Direct Transfer (Safe):**
- Direct wallet-to-burn-address transfers (no intermediary contracts)
- Zero token approvals ever required
- Each transaction is independent and transparent  
- Real-time balance verification prevents invalid amount errors
- Maximum wallet compatibility with automatic gas estimation

**❌ Traditional Approval Method (Risky):**
- Approve smart contract for each token
- Creates permanent approval attack surface
- Complex batch transactions that can fail
- Ongoing security vulnerabilities

## 🌐 Access BaseClean

**BaseClean is a hosted Web3 application.** Visit [baseclean.io](https://baseclean.io) to start cleaning your wallet!

### Tech Stack
- **Framework**: Next.js 15.3.2 with TypeScript
- **Web3**: Wagmi v2.15.4, RainbowKit v2.2.5, Viem v2.29.4
- **Styling**: Tailwind CSS 3.4.3
- **Network**: Base mainnet (chain ID 8453)

## 📚 Documentation

For comprehensive technical documentation and architecture details, see the [`docs/`](docs/) directory:

- [Technical Documentation Index](docs/README.md) - Complete guide to BaseClean's architecture
- [Spam Detection System](docs/SPAM_DETECTION.md) - Deep-dive into threat detection algorithms

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

**🔥 Ready to clean your wallet safely? Connect and start burning unwanted tokens with zero approvals! 🔥**
