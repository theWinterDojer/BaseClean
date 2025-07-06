# 📚 BaseClean Technical Documentation

Technical documentation for BaseClean's zero-approval token burning architecture and security implementation.

## 🎯 About BaseClean

BaseClean is a Web3 application that implements a **zero-approval architecture** for safely burning unwanted ERC-20 tokens and NFTs on Base network. The system eliminates traditional approval-based attack vectors through direct wallet transfers with **value-first protection** - any token worth more than $0.10 is automatically protected from spam filtering.

## 🏗️ **Architecture Overview**

### 🔒 **Zero-Approval System**
- **Direct transfers**: Uses `transfer()`, `transferFrom()`, and `safeTransferFrom()` calls without approvals
- **No intermediary contracts**: Wallet calls token contracts directly, no burner contracts
- **Sequential processing**: Each asset burned in separate transactions for maximum transparency

### 🛡️ **Security Model**
- **Eliminated attack surface**: No token approvals = no approval-based vulnerabilities
- **Value-first protection**: Tokens > $0.10 automatically protected from spam filtering
- **User control**: Every transaction requires explicit user confirmation
- **Transparent operations**: All burns visible on-chain with clear transaction hashes

## 📋 **Available Documentation**

| Document | Technical Focus | Audience |
|----------|-----------------|----------|
| [SPAM_DETECTION.md](SPAM_DETECTION.md) | 3-filter spam detection with value-first protection | Security Engineers, Developers |
| [Feature Architecture](../src/features/README.md) | Feature architecture and system organization | Software Architects, Developers |

## 🔬 **Technical Implementation**

### ⚡ **Performance Characteristics**
- **Network**: Optimized for Base L2 (~2-3 second confirmations)
- **Gas efficiency**: Direct transfers use automatic gas estimation for optimal efficiency
- **Scalability**: Sequential processing prevents wallet overload
- **Optimized filtering**: Single-pass analysis with early exit for valuable tokens

### 🧠 **Spam Detection Engine**
- **3-filter system**: Low/Zero Value, Suspicious Names/Symbols, Airdrops/Junk
- **Value-first protection**: $0.10 threshold prevents false positives on valuable assets
- **ScamSniffer integration**: Community threat intelligence via GitHub database
- **Efficient processing**: Pre-calculated values with sorted results (highest to lowest USD value)

### 📊 **Data Architecture**
- **Local-first**: No external user tracking or data collection
- **Wallet-specific**: Burn history stored per wallet address
- **Export capabilities**: CSV format for record keeping
- **Optimized calculations**: Direct numeric value calculations prevent formatting bugs

## 🔧 **Development Philosophy**

BaseClean prioritizes **security over convenience** and **transparency over efficiency**:

- **Security first**: Every architectural decision evaluated for attack vectors
- **Value protection**: Automatic safeguards prevent accidental burning of valuable assets
- **User sovereignty**: No permissions, approvals, or third-party dependencies  
- **Open development**: Public codebase enables community security review

## 🤝 **For Security Researchers**

The codebase is structured for security analysis:
- **Clear separation**: Burn logic isolated in dedicated modules
- **Value protection**: Multiple layers prevent false positive burns
- **Error handling**: Comprehensive user rejection vs. technical failure distinction
- **Audit trails**: Complete transaction history with gas tracking

---

*Technical documentation maintained for transparency and community contribution.* 🔍 