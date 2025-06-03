import { Token } from '@/types/token';
import { formatBalance, calculateTokenValue } from '@/lib/api';

/**
 * Get the estimated value of a token in USD
 * @param token The token to calculate value for
 * @returns The value in USD as a number
 */
export function getTokenValue(token: Token): number {
  const balance = formatBalance(token.balance, token.contract_decimals);
  return parseFloat(calculateTokenValue(balance, token.quote_rate) || '0');
}

/**
 * Group tokens by their estimated value
 * @param tokens Array of tokens to group
 * @returns Object with tokens grouped by value range
 */
export function groupTokensByValue(tokens: Token[]): Record<string, Token[]> {
  return tokens.reduce((groups: Record<string, Token[]>, token) => {
    const value = getTokenValue(token);
    
    let group = 'no-value';
    if (value >= 1000) {
      group = 'high-value';
    } else if (value >= 10) {
      group = 'medium-value';
    } else if (value > 0) {
      group = 'low-value';
    }
    
    if (!groups[group]) {
      groups[group] = [];
    }
    
    groups[group].push(token);
    return groups;
  }, {});
} 