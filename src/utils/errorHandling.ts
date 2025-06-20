/**
 * Error handling utilities for wallet and contract interactions
 */

export type WalletErrorType = 
  | 'USER_REJECTED'
  | 'INSUFFICIENT_FUNDS'
  | 'NETWORK_ERROR'
  | 'CONTRACT_ERROR'
  | 'TIMEOUT'
  | 'UNKNOWN';

export interface ParsedError {
  type: WalletErrorType;
  message: string;
  userFriendlyMessage: string;
  originalError: unknown;
}

/**
 * Checks if an error is a user rejection from wallet
 */
export function isUserRejectionError(error: unknown): boolean {
  if (!error) return false;
  
  const errorString = error.toString().toLowerCase();
  const errorMessage = (error as { message?: string })?.message?.toLowerCase() || '';
  const errorName = (error as { name?: string })?.name?.toLowerCase() || '';
  
  return (
    // Check error string content
    errorString.includes('user rejected') ||
    errorString.includes('user denied') ||
    errorString.includes('user cancelled') ||
    errorString.includes('user canceled') ||
    errorString.includes('rejected by user') ||
    errorString.includes('denied by user') ||
    // Check error message content
    errorMessage.includes('user rejected') ||
    errorMessage.includes('user denied') ||
    errorMessage.includes('user cancelled') ||
    errorMessage.includes('user canceled') ||
    errorMessage.includes('rejected by user') ||
    errorMessage.includes('denied by user') ||
    // Check for specific error types
    errorName.includes('userrejected') ||
    errorName.includes('actionrejected') ||
    // Check for ContractFunctionExecutionError with user rejection message
    (errorString.includes('contractfunctionexecutionerror') && errorString.includes('user rejected')) ||
    // Additional viem-specific patterns
    errorString.includes('user rejected the request') ||
    errorMessage.includes('user rejected the request')
  );
}

/**
 * Checks if an error is due to insufficient funds
 */
export function isInsufficientFundsError(error: unknown): boolean {
  if (!error) return false;
  
  const errorString = error.toString().toLowerCase();
  const errorMessage = (error as { message?: string })?.message?.toLowerCase() || '';
  
  return (
    errorString.includes('insufficient funds') ||
    errorString.includes('insufficient balance') ||
    errorString.includes('insufficient gas') ||
    errorMessage.includes('insufficient funds') ||
    errorMessage.includes('insufficient balance') ||
    errorMessage.includes('insufficient gas')
  );
}

/**
 * Checks if an error is network-related
 */
export function isNetworkError(error: unknown): boolean {
  if (!error) return false;
  
  const errorString = error.toString().toLowerCase();
  const errorMessage = (error as { message?: string })?.message?.toLowerCase() || '';
  
  return (
    errorString.includes('network error') ||
    errorString.includes('connection failed') ||
    errorString.includes('timeout') ||
    errorString.includes('fetch failed') ||
    errorMessage.includes('network error') ||
    errorMessage.includes('connection failed') ||
    errorMessage.includes('timeout') ||
    errorMessage.includes('fetch failed')
  );
}

/**
 * Parses any error and returns a structured error object with user-friendly messages
 */
export function parseWalletError(error: unknown): ParsedError {
  if (!error) {
    return {
      type: 'UNKNOWN',
      message: 'Unknown error',
      userFriendlyMessage: 'An unknown error occurred. Please try again.',
      originalError: error
    };
  }

  // User rejected the transaction
  if (isUserRejectionError(error)) {
    return {
      type: 'USER_REJECTED',
      message: 'User rejected the transaction',
      userFriendlyMessage: 'Transaction was cancelled. You can try again when ready.',
      originalError: error
    };
  }

  // Insufficient funds
  if (isInsufficientFundsError(error)) {
    return {
      type: 'INSUFFICIENT_FUNDS',
      message: 'Insufficient funds for transaction',
      userFriendlyMessage: 'Insufficient funds to complete the transaction. Please check your balance.',
      originalError: error
    };
  }

  // Network errors
  if (isNetworkError(error)) {
    return {
      type: 'NETWORK_ERROR',
      message: 'Network connection error',
      userFriendlyMessage: 'Network connection failed. Please check your internet connection and try again.',
      originalError: error
    };
  }

  // Contract-specific errors
  const errorString = error.toString().toLowerCase();
  const errorMessage = (error as { message?: string })?.message?.toLowerCase() || '';
  
  if (errorString.includes('contract') || errorString.includes('revert') || errorMessage.includes('execution reverted')) {
    let userMessage = 'Transaction failed due to a contract error.';
    
    // NFT-specific error patterns with educational context
    if (errorString.includes('not approved') || errorString.includes('caller is not owner') || errorString.includes('does not own')) {
      userMessage = 'This NFT cannot be burned because you don\'t actually own it. Many spam NFTs appear in wallets but aren\'t truly owned by your address.';
    } else if (errorString.includes('transfer restricted') || errorString.includes('transfers disabled')) {
      userMessage = 'This NFT has transfer restrictions built into its contract. Some NFTs are designed to be non-transferable and cannot be burned.';
    } else if (errorString.includes('insufficient balance') || errorString.includes('balance')) {
      userMessage = 'This NFT has zero balance in your wallet. It may be a phantom NFT that appears due to indexing issues but doesn\'t actually exist.';
    } else if (errorString.includes('invalid token') || errorString.includes('nonexistent token')) {
      userMessage = 'This NFT token ID doesn\'t exist or has been destroyed. Some spam NFTs reference invalid token IDs.';
    } else if (errorString.includes('gas')) {
      userMessage = 'Transaction failed due to insufficient gas. Some NFT contracts require more gas than estimated.';
    } else if (errorString.includes('token') || errorString.includes('nft')) {
      userMessage = 'This NFT cannot be burned due to contract restrictions. Many spam NFTs are designed to be non-transferable to prevent removal.';
    } else {
      userMessage = 'This asset cannot be burned due to contract limitations. Some tokens and NFTs have built-in restrictions that prevent burning.';
    }
    
    return {
      type: 'CONTRACT_ERROR',
      message: error.toString(),
      userFriendlyMessage: userMessage,
      originalError: error
    };
  }

  // Timeout errors
  if (errorString.includes('timeout')) {
    return {
      type: 'TIMEOUT',
      message: 'Transaction timeout',
      userFriendlyMessage: 'Transaction timed out. Please try again.',
      originalError: error
    };
  }

  // Fallback for unknown errors
  const message = (error as { message?: string })?.message || error.toString();
  return {
    type: 'UNKNOWN',
    message,
    userFriendlyMessage: 'An unexpected error occurred. Please try again.',
    originalError: error
  };
}

/**
 * Gets a short, user-friendly error message for display in UI
 */
export function getShortErrorMessage(error: unknown): string {
  const parsed = parseWalletError(error);
  
  switch (parsed.type) {
    case 'USER_REJECTED':
      return 'Transaction cancelled';
    case 'INSUFFICIENT_FUNDS':
      return 'Insufficient funds';
    case 'NETWORK_ERROR':
      return 'Network error';
    case 'CONTRACT_ERROR':
      return 'Contract error';
    case 'TIMEOUT':
      return 'Timeout';
    default:
      return 'Unknown error';
  }
}

/**
 * Determines if an error should be retried automatically
 */
export function shouldRetryError(error: unknown): boolean {
  const parsed = parseWalletError(error);
  
  // Don't retry user rejections or insufficient funds
  if (parsed.type === 'USER_REJECTED' || parsed.type === 'INSUFFICIENT_FUNDS') {
    return false;
  }
  
  // Network errors and timeouts can be retried
  return parsed.type === 'NETWORK_ERROR' || parsed.type === 'TIMEOUT';
} 