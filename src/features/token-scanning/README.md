# 🪙 Token Scanning Feature

Core functionality for scanning wallets and identifying unwanted tokens on Base network.

## 🧩 Components

- **TokenScanner**: 🎯 Main component orchestrating the token scanning process
- **TokenDataManager**: 📊 Handles token data fetching and processing
- **TokenListsContainer**: 📋 Displays filtered token lists with spam detection
- **TokenStatistics**: 📈 Shows wallet token statistics and values
- **BulkActions**: ⚡ Provides token selection and bulk actions
- **TokenSelectionManager**: 🎛️ Manages token selection state

## 🏗️ Architecture

Components follow single responsibility principle:

1. **Data Management**: 📊 TokenDataManager handles API calls and data processing
2. **UI Presentation**: 🎨 Individual components for statistics, lists, actions
3. **State Management**: 🔄 Selection and filtering state managed separately
4. **Business Logic**: 🧠 Spam detection in useTokenFiltering hook

## 🔄 Data Flow

1. 🔌 TokenScanner initiates token fetching when wallet connects
2. 📡 TokenDataManager loads token data from Alchemy API
3. 🛡️ useTokenFiltering processes tokens for spam detection
4. 🖼️ UI components render filtered token lists
5. 🎛️ User selections managed through context
6. 🔥 Direct burn transfers executed via useUniversalBurnFlow

## 🛡️ Spam Detection

Three-filter system:
- **Low/Zero Value**: 💰 Tokens worth < $0.50
- **Suspicious Names/Symbols**: 🚨 Pattern matching for scam indicators
- **Airdrops/Junk**: 📦 Balance patterns and missing metadata 