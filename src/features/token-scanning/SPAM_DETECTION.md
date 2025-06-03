# BaseClean Spam Detection System

## Overview

BaseClean uses a sophisticated **rule-based multi-signal detection system** combined with **ScamSniffer community intelligence** to identify spam and unwanted tokens. The system analyzes tokens across multiple dimensions and requires multiple suspicious signals before flagging a token as spam, minimizing false positives while maintaining high detection accuracy.

## Architecture

### Core Implementation
- **Primary Logic**: `src/hooks/useTokenFiltering.ts` (single source of truth for all spam detection)
- **ScamSniffer Integration**: `src/lib/scamSniffer.ts` & `src/hooks/useScamSniffer.ts`
- **Centralized Constants**: `src/constants/tokens.ts` (all spam detection constants)
- **Utility Functions**: `src/features/token-scanning/utils/tokenUtils.ts` (value calculations only)
- **Type Definitions**: `src/types/token.ts`

### Multi-Signal Detection Approach

The system uses **4 distinct detection categories** plus **external community intelligence**, each contributing to an overall spam confidence score:

1. **Naming Issues** - Suspicious token names/symbols
2. **Value Issues** - Economic red flags
3. **Airdrop Signals** - Common airdrop patterns
4. **High Risk Indicators** - Multiple risk factors
5. **ScamSniffer Alerts** - Community-reported malicious tokens

## Detection Categories

### 1. Naming Issues (`hasNamingIssues`)

**Purpose**: Detect tokens with suspicious names, symbols, or branding patterns commonly used by spam tokens.

**Key Features**:
- **67 spam keywords** covering meme coins, scams, promotional terms
- **15 regex patterns** for domains, URLs, special characters, version numbers
- **Smart keyword weighting**: Multiple matches or high-confidence keywords trigger detection
- **Length validation**: Excessively long names/symbols (>20 chars name, >8 chars symbol)

**Spam Keywords Include**:
```
'airdrop', 'claim', 'reward', 'free', 'gift', 'bonus', 'elon', 'musk', 
'trump', 'pump', 'moon', '1000x', 'giveaway', 'scam', 'ponzi', etc.
```

**Regex Patterns Detect**:
- Domain names (`.com`, `.io`, `.xyz`, etc.)
- URLs (`https://`, `t.me/`)
- Long numbers, version numbers (`v1`, `v2.0`)
- Special character patterns (`$TOKEN$`, excessive symbols)

### 2. Value Issues (`hasValueIssues`)

**Purpose**: Identify tokens with suspicious economic characteristics.

**Detection Criteria**:
- **Zero/extremely low price** (< $0.000001)
- **Dust balances** with low token value
- **No price data** but large balance (>100k tokens)
- **Unusual decimals** (>18 decimals with low value)
- **Low total value** (< $0.1 total holdings)

**Safeguards**:
- Tokens with >100 token balance and positive price are protected
- Progressive thresholds based on actual USD value

### 3. Airdrop Signals (`hasAirdropSignals`)

**Purpose**: Detect common airdrop patterns used by spam token distributors.

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
- **Unusual precision**: >8 decimal places
- **Exact 1.0 balance**: Often used in airdrops

**Advanced Detection**:
- Tolerance checking for near-matches (±0.5 or ±1% of known amounts)
- Balance precision analysis for evasion attempts

### 4. High Risk Indicators (`hasHighRiskIndicators`)

**Purpose**: Identify tokens with multiple risk factors that compound suspicion.

**Risk Factors**:
- **No logo** + very low price (< $0.0001)
- **Extremely low price** (< $0.0000001) + large balance
- **Direct spam keywords** in name (airdrop, free, claim)
- **Massive balance** (>1M tokens) + minimal value (< $0.1)
- **Non-standard decimals** (>18) + low value

**Multi-Factor Analysis**:
The system counts suspicious characteristics:
- Unusual balance (>10k tokens)
- No price information
- Missing logo
- Very low value (< $0.01)

**3+ factors = High Risk classification**

## Smart Decision Engine

### Progressive Threshold System

The system uses **value-aware thresholds** to minimize false positives:

```typescript
// Ultra-low value tokens: 1 signal = spam
if (usdValue < 0.01 && spamSignals >= 1) return true;

// Low value tokens: 2+ signals = spam  
if (usdValue < 1 && spamSignals >= 2) return true;

// Higher value tokens: 3+ signals = spam
if (usdValue >= 1 && spamSignals >= 3) return true;
```

### Whitelist Protection

**Never flagged as spam**:
- Whitelisted legitimate tokens (ETH, USDC, DAI, etc.)
- Tokens worth > $5 USD
- Recognized Base network tokens

**Base Network Whitelist**:
```
ETH: 0x4200000000000000000000000000000000000006
USDC: 0x833589fcd6edb6e08f4c7c32d4f71b54bda02913  
DAI: 0x50c5725949a6f0c72e6c4a641f24049a917db0cb
cbETH: 0x2ae3f1ec7f1f5012cfeab0185bfc7aa3cf0dec22
```

## Configuration

### Spam Filter Controls (`SpamFilters` type)

Users can toggle each detection category:

```typescript
type SpamFilters = {
  namingIssues: boolean;        // Name/symbol analysis
  valueIssues: boolean;         // Economic red flags  
  airdropSignals: boolean;      // Airdrop pattern detection
  highRiskIndicators: boolean;  // Multi-factor risk analysis
}
```

### Performance Optimizations

- **Memoized functions** prevent unnecessary recalculations
- **Early returns** for whitelisted/high-value tokens
- **Efficient pattern matching** with compiled regex
- **Cached calculations** for balance formatting

## Detection Statistics

Based on analysis of the current implementation:

- **67 spam keywords** monitored
- **15 regex patterns** for name analysis  
- **70+ airdrop amounts** tracked
- **4 rule-based risk categories** evaluated
- **ScamSniffer community database** with thousands of flagged addresses
- **Progressive thresholds** by token value
- **Whitelist protection** for 8+ legitimate tokens

## Integration Points

### Frontend Integration
- Filter UI controls in `src/shared/components/FilterPanel.tsx`
- Token statistics in `src/features/token-scanning/components/TokenStatistics.tsx`
- Visual indicators in token lists with ScamSniffer nose emoji 👃
- ScamSniffer indicator component in `src/components/ScamSnifferIndicator.tsx`

### ScamSniffer Community Intelligence

**Implementation**: 
- Service: `src/lib/scamSniffer.ts`
- Hook: `src/hooks/useScamSniffer.ts`
- UI Component: `src/components/ScamSnifferIndicator.tsx`
- **API Route**: `src/pages/api/scamsniffer.ts` (CORS bypass)

**Features**:
- **Free Tier Integration**: Uses ScamSniffer's open-source GitHub database
- **CORS Solution**: Server-side API route bypasses browser CORS restrictions
- **24-hour Cache**: Reduces API calls and improves performance
- **Batch Checking**: Efficiently checks multiple tokens at once
- **7-day Delay**: Acceptable delay for community-maintained blacklist
- **Fallback Resilience**: Graceful degradation if service is unavailable

**Technical Implementation**:
```
Browser Request → /api/scamsniffer → GitHub ScamSniffer DB → Server Cache → Browser
```

**Visual Indicator**:
- **Nose Emoji 👃**: Displayed next to flagged token names
- **Hover Tooltip**: Explains ScamSniffer detection
- **No Color Changes**: Maintains existing UI consistency
- **Accessibility**: Proper ARIA labels and screen reader support

**Data Source**:
```
GitHub Repository: https://github.com/scamsniffer/scam-database
API Route: /api/scamsniffer (server-side fetch)
Update Frequency: Daily (with 7-day public delay)
Cache Duration: 24 hours (client + server)
```

**Integration Benefits**:
- **Community Wisdom**: Leverages crowd-sourced threat intelligence
- **Real-world Validation**: Tokens flagged by actual victims/researchers
- **Cross-chain Coverage**: Includes Base network malicious addresses
- **Industry Trust**: Used by Binance, OpenSea, Phantom, and other major platforms
- **CORS-Free**: Server-side fetching eliminates browser limitations

### Future Enhancement Opportunities

1. **External API Integration**
   - ✅ **ScamSniffer API** - Implemented with free tier
   - GoPlus Security API for additional validation
   - Honeypot.is integration for contract analysis
   - Token Sniffer API for trading behavior analysis

2. **Advanced Analysis**
   - Contract age analysis (block creation time)
   - Liquidity pool existence checks
   - Token holder distribution patterns
   - Cross-chain spam correlation

3. **Machine Learning Evolution**
   - User behavior learning (tokens burned vs kept)
   - Dynamic pattern recognition
   - Natural language processing for names
   - Graph analysis of token relationships

4. **Premium ScamSniffer Features**
   - Real-time API access ($999/month tier)
   - Advanced threat intelligence
   - Custom integration support

## Performance Characteristics

- **High Precision**: Multiple signals required reduces false positives
- **Scalable**: Rule-based approach handles large token lists efficiently  
- **Community-Enhanced**: ScamSniffer adds real-world threat intelligence
- **Maintainable**: Clear separation of detection logic by category
- **Configurable**: Users control detection sensitivity
- **Safe**: Whitelist protection prevents legitimate token loss
- **Resilient**: Graceful fallback if external services fail

## Development Notes

### Adding New Detection Rules

1. **Keyword Addition**: Update `SPAM_KEYWORDS` array in `useTokenFiltering.ts`
2. **Pattern Addition**: Add regex patterns to `SUSPICIOUS_NAME_PATTERNS`
3. **Airdrop Amounts**: Extend `COMMON_AIRDROP_AMOUNTS` array
4. **Whitelist Updates**: Add legitimate tokens to `LEGITIMATE_TOKENS`

### ScamSniffer Integration Maintenance

1. **Cache Management**: Monitor cache performance with `getScamSnifferCacheStats()`
2. **Manual Refresh**: Use `refreshScamSnifferCache()` for troubleshooting
3. **Error Handling**: Service degrades gracefully if ScamSniffer is unavailable
4. **Rate Limiting**: 24-hour cache prevents excessive API calls

### Testing Considerations

- Test with known spam tokens to verify detection
- Verify legitimate tokens are never flagged
- Test ScamSniffer integration with network failures
- Test edge cases (empty balances, missing data)
- Performance testing with large token lists (1000+ tokens)
- Verify ScamSniffer indicators appear correctly in UI

---

*This documentation reflects the current rule-based implementation enhanced with ScamSniffer community intelligence. The system is designed to be robust, maintainable, and extensible for future enhancements.* 