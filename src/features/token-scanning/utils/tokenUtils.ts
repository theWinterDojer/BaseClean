import { Token } from '@/types/token';
import { formatBalance, calculateTokenValue } from '@/lib/api';

/**
 * Check if a token is likely to be spam based on its name
 * @param token The token to check
 * @returns boolean indicating if the token has suspicious naming
 */
export function hasNamingIssues(token: Token): boolean {
  const { contract_name, contract_ticker_symbol } = token;
  
  // Check for missing name or symbol
  if (!contract_name || !contract_ticker_symbol) {
    return true;
  }
  
  // Check for extremely long names or symbols (often spam)
  if (contract_name.length > 30 || contract_ticker_symbol.length > 10) {
    return true;
  }
  
  // Check for suspicious keywords in name
  const suspiciousKeywords = [
    'airdrop', 'free', 'claim', 'reward', 'bonus', 'gift', 'win', 'giveaway',
    'elon', 'musk', 'moon', 'lambo', 'safe', 'gem', 'pepe', 'doge', 'shib',
    'inu', 'baby', 'token', 'coin', 'dao', 'protocol', 'finance'
  ];
  
  const nameLower = contract_name.toLowerCase();
  const symbolLower = contract_ticker_symbol.toLowerCase();
  
  return suspiciousKeywords.some(keyword => 
    nameLower.includes(keyword) || symbolLower.includes(keyword)
  );
}

/**
 * Check if a token has suspicious value characteristics
 * @param token The token to check
 * @returns boolean indicating if the token has suspicious value
 */
export function hasValueIssues(token: Token): boolean {
  const balance = formatBalance(token.balance, token.contract_decimals);
  const value = parseFloat(calculateTokenValue(balance, token.quote_rate) || '0');
  
  // Zero value
  if (token.quote_rate === 0) return true;
  
  // Extremely low value (less than $0.000001)
  if (token.quote_rate < 0.000001) return true;
  
  // Low total value
  if (value > 0 && value < 0.1) return true;
  
  return false;
}

/**
 * Check if a token has characteristics of an airdrop
 * @param token The token to check
 * @returns boolean indicating if the token has airdrop signals
 */
export function hasAirdropSignals(token: Token): boolean {
  const balance = formatBalance(token.balance, token.contract_decimals);
  const balanceNum = parseFloat(balance);
  
  // Common airdrop amounts
  const commonAirdropAmounts = [10, 100, 1000, 10000, 1000000];
  
  // Check if balance is very close to a common airdrop amount
  if (commonAirdropAmounts.some(amount => Math.abs(balanceNum - amount) < 0.001)) {
    return true;
  }
  
  // Check for round numbers (like 1000 or 1000000 tokens)
  if (/^[1-9]0*(\.[0]+)?$/.test(balance)) {
    return true;
  }
  
  // Check for repeating digits (e.g., 11111, 88888)
  if (/^(.)\1{3,}$/.test(balance.replace('.', ''))) {
    return true;
  }
  
  return false;
}

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