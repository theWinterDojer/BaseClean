# BaseClean Spam Detection System

## Overview

BaseClean uses a sophisticated **rule-based multi-signal detection system** combined with **ScamSniffer community intelligence** to identify spam and unwanted tokens. The system analyzes tokens across multiple dimensions with **value-first protection** - any token worth more than $0.10 is automatically protected from spam filtering, ensuring valuable assets are never accidentally flagged.

## Architecture

### Core Implementation
- **Primary Logic**: `src/hooks/useTokenFiltering.ts` (optimized single-pass filtering)
- **ScamSniffer Integration**: `src/lib/scamSniffer.ts` & `src/hooks/useScamSniffer.ts`
- **Centralized Constants**: `src/constants/tokens.ts` (all spam detection constants)
- **Type Definitions**: `src/types/token.ts`

### Optimized Detection Flow

The system uses **efficient order of operations** with early exit protection:

1. **Value Protection** - Tokens > $0.10 USD are immediately protected (never flagged as spam)
2. **Whitelist Protection** - Known legitimate tokens (ETH, USDC, etc.) are protected
3. **3-Filter Analysis** - Only low-value tokens proceed to spam detection
4. **Sorted Results** - All token lists sorted by USD value (highest to lowest)

## Detection Categories

### 1. Low/Zero Value (`valueIssues`)

**Purpose**: Identify tokens with suspicious economic characteristics or negligible value.

**Detection Criteria**:
- **Zero/extremely low price** (< $0.000001)
- **Dust balances** with low token value
- **No price data** available
- **Low total value** (< $0.10 total holdings)

**User Control**: When enabled, flags tokens with minimal economic value that likely represent dust or failed transactions.

### 2. Suspicious Names/Symbols (`namingIssues`)

**Purpose**: Detect tokens with suspicious names, symbols, or branding patterns commonly used by spam tokens.

**Key Features**:
- **Spam keywords** covering scam terms, promotional language, celebrity exploitation
- **Regex patterns** for domains, URLs, special characters, version numbers
- **Length validation**: Excessively long names/symbols

**Spam Keywords Include**:
```
'airdrop', 'claim', 'reward', 'free', 'gift', 'bonus', 'elon', 'musk', 
'trump', 'pump', 'moon', '1000x', 'giveaway', 'scam', 'ponzi', 
'promo', 'launch', 'presale', 'ico', 'whitelist', etc.
```

**Regex Patterns Detect**:
- Domain names (`.com`, `.io`, `.xyz`, etc.)
- URLs (`https://`, `t.me/`, `www.`)
- Version numbers (`v1`, `v2.0`)
- Special character patterns (`$TOKEN$`, excessive symbols)

### 3. Airdrops/Junk (`airdropSignals`)

**Purpose**: Detect common airdrop patterns and balance characteristics used by spam token distributors.

**Detection Methods**:

**Common Airdrop Amounts** (70+ patterns):
```
1337, 88888, 69420, 42069, 8008, 7777777, 1000000, 10000, 1234, 12345,
8888, 9999, 6969, 4200, 4269, 800, 888, 69, 420, 666, 777, 7777, etc.
```

**Pattern Recognition**:
- **Round numbers**: 1000, 10000, 1000000
- **Repeating digits**: 11111, 88888
- **Sequential patterns**: 1234, 4321, 2345
- **Small balances**: < 1 token (dust amounts)
- **Exact precision**: Suspiciously precise decimal amounts

**Advanced Detection**:
- Tolerance checking for near-matches of known airdrop amounts
- Balance precision analysis for evasion attempts

## Value Protection System

### Absolute Protection Threshold

**$0.10 USD Rule**: Any token with total value > $0.10 is **never flagged as spam**, regardless of other characteristics.

**Why $0.10?**
- Protects legitimate low-cap tokens from false positives
- Covers meaningful positions while filtering dust
- Balances security with usability

### Whitelist Protection

**Always Protected** (regardless of value):
- **Base Network Core Tokens**: ETH, USDC, DAI, cbETH
- **Recognized DeFi Tokens**: Major protocols and established projects
- **Contract Addresses**: Whitelisted by contract address for precision

**Base Network Whitelist**:
```
ETH: 0x4200000000000000000000000000000000000006
USDC: 0x833589fcd6edb6e08f4c7c32d4f71b54bda02913  
DAI: 0x50c5725949a6f0c72e6c4a641f24049a917db0cb
cbETH: 0x2ae3f1ec7f1f5012cfeab0185bfc7aa3cf0dec22
```

## Smart Decision Engine

### Efficient Order of Operations

**Step 1: Single Token Analysis**
- Calculate USD value once per token
- Determine protection status
- Format balance for display

**Step 2: Early Exit Protection**
- Value > $0.10 → Immediately classified as "not spam"
- Whitelisted tokens → Immediately classified as "not spam"
- Skip all filtering logic for protected tokens

**Step 3: Filter Application** (only for unprotected tokens)
- Apply user-enabled filters
- Pure name/symbol analysis (no redundant calculations)
- Balance pattern matching
- Value-based filtering

**Step 4: Sorted Results**
- Both spam and regular tokens sorted by USD value (highest → lowest)
- Consistent ordering regardless of filter category

### User Filter Controls

Users can enable/disable each detection category:

```typescript
type SpamFilters = {
  valueIssues: boolean;         // Low/zero value detection
  namingIssues: boolean;        // Name/symbol analysis
  airdropSignals: boolean;      // Airdrop pattern detection
}
```

**Filter Independence**: Each filter operates independently - users can enable any combination based on their needs.

## ScamSniffer Community Intelligence

### Real-World Threat Detection

**Implementation**: 
- Service: `src/lib/scamSniffer.ts`
- Hook: `src/hooks/useScamSniffer.ts`
- UI Component: `src/components/ScamSnifferIndicator.tsx`
- **API Route**: `src/pages/api/scamsniffer.ts` (CORS bypass)

**Features**:
- **Community Database**: Leverages ScamSniffer's crowd-sourced threat intelligence
- **Industry Trust**: Used by Binance, OpenSea, Phantom, and other major platforms
- **24-hour Cache**: Optimized performance with reduced API calls
- **Batch Checking**: Efficiently validates multiple tokens simultaneously
- **Graceful Fallback**: System remains functional if ScamSniffer is unavailable

**Technical Implementation**:
```
Browser Request → /api/scamsniffer → GitHub ScamSniffer DB → Server Cache → Browser
```

**Visual Indicator**:
- **Nose Emoji 👃**: Displayed next to flagged token names
- **Hover Tooltip**: Explains community-based detection
- **Accessibility**: Proper ARIA labels and screen reader support

**Data Source**:
```
GitHub Repository: https://github.com/scamsniffer/scam-database
Update Frequency: Daily (with 7-day public delay)
Cache Duration: 24 hours (client + server)
```

## Performance Characteristics

### Optimization Features

- **Single-Pass Analysis**: Each token analyzed once with cached results
- **Early Exit Logic**: Valuable tokens bypass all filtering overhead
- **Memoized Functions**: Prevent unnecessary recalculations
- **Efficient Sorting**: Pre-calculated values used for consistent ordering
- **No Image Dependencies**: Filtering logic independent of image availability

### Accuracy Features

- **Value-First Protection**: Prevents false positives on valuable tokens
- **Multi-Signal Requirements**: Multiple suspicious characteristics needed for flagging
- **Progressive Thresholds**: Different sensitivity based on token characteristics
- **Community Validation**: ScamSniffer adds real-world threat confirmation

## Integration Points

### Frontend Integration
- **Filter Controls**: `src/shared/components/FilterPanel.tsx`
- **Token Statistics**: `src/features/token-scanning/components/TokenStatistics.tsx`
- **Visual Indicators**: ScamSniffer nose emoji 👃 in token lists
- **ScamSniffer Component**: `src/components/ScamSnifferIndicator.tsx`

### Configuration Management

**Spam Filter Constants** (`src/constants/tokens.ts`):
- `SPAM_KEYWORDS`: Centralized keyword list
- `SUSPICIOUS_NAME_PATTERNS`: Regex patterns for name analysis
- `COMMON_AIRDROP_AMOUNTS`: Known airdrop distribution amounts
- `LEGITIMATE_TOKENS`: Whitelist by network and contract address
- `SPAM_SIGNALS`: Threshold values and detection parameters

## Development Notes

### Adding New Detection Rules

1. **Keyword Addition**: Update `SPAM_KEYWORDS` array in `constants/tokens.ts`
2. **Pattern Addition**: Add regex patterns to `SUSPICIOUS_NAME_PATTERNS`
3. **Airdrop Amounts**: Extend `COMMON_AIRDROP_AMOUNTS` array
4. **Whitelist Updates**: Add legitimate tokens to `LEGITIMATE_TOKENS`

### Testing Considerations

- **Value Protection**: Verify tokens > $0.10 are never flagged
- **Whitelist Validation**: Ensure legitimate tokens always protected
- **Filter Independence**: Test each filter in isolation
- **Performance Testing**: Validate with large token lists (1000+ tokens)
- **ScamSniffer Integration**: Test with network failures and cache scenarios
- **Sorting Accuracy**: Verify consistent USD value ordering

---

*This documentation reflects the current optimized implementation with value-first protection and community-enhanced threat detection. The system prioritizes user safety while minimizing false positives through intelligent filtering and community validation.* 