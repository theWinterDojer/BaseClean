# 🪙 Token Scanning Architecture

Technical implementation of BaseClean's token discovery and spam detection system for Base network assets.

## 🔍 **Discovery Engine**

### 📡 **Data Sources**
- **Primary**: Alchemy Token API for comprehensive token metadata
- **Fallback**: Direct contract calls for token information
- **Pricing**: Real-time USD values via token quote rates
- **Images**: CDN-cached logos with SVG fallback generation

### ⚡ **Performance Optimization**
- **Batch requests**: Efficient API usage with pagination
- **Caching layer**: Smart memoization of token data
- **Error resilience**: Graceful degradation for missing metadata

## 🛡️ **Spam Detection System**

### 🧠 **Multi-Layer Analysis**

#### 💰 **Value-Based Detection**
- **Threshold analysis**: Tokens below $0.50 flagged as low-value
- **Balance patterns**: Detection of dust amounts and fractional holdings
- **Price validation**: Missing or suspicious pricing data identification

#### 🚨 **Pattern Recognition**
- **Name analysis**: 67 spam keywords and 15 regex patterns
- **Symbol validation**: Length checks and special character detection
- **URL detection**: Domain patterns and suspicious link identification

#### 📦 **Airdrop Classification**
- **Amount patterns**: 70+ common airdrop quantities (1337, 88888, etc.)
- **Precision analysis**: Unusual decimal patterns indicating automation
- **Metadata gaps**: Missing images or contract information

### 🔗 **Community Intelligence**
- **ScamSniffer integration**: GitHub-based threat database
- **24-hour cache**: Performance optimization for threat data
- **CORS proxy**: Server-side API route for browser compatibility

## ⚙️ **Technical Implementation**

### 🏗️ **Component Architecture**
- **TokenScanner**: Main orchestration component
- **TokenDataManager**: API integration and data processing
- **Filtering hooks**: Configurable detection logic
- **Selection context**: Cross-component state management

### 🔄 **Processing Pipeline**
1. **Wallet scan**: Enumerate all token holdings
2. **Metadata fetch**: Retrieve token information and pricing
3. **Filter application**: Apply spam detection algorithms
4. **Categorization**: Organize results by filter type
5. **Selection management**: Handle user interaction and bulk operations

### 📊 **State Management**
- **React Query**: Server state caching and synchronization
- **Context providers**: Global selection and burn state
- **Local persistence**: User filter preferences and history

## 🔧 **Configuration & Extensibility**

### ⚙️ **Filter Configuration**
- **Threshold adjustments**: Customizable value and pattern limits
- **Whitelist management**: Protected token addresses
- **Detection sensitivity**: User-configurable spam detection levels

### 🔌 **API Integration**
- **Rate limiting**: Respectful API usage patterns
- **Error handling**: Comprehensive failure recovery
- **Monitoring**: Performance tracking and optimization 