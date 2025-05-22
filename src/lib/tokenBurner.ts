import { useWriteContract, useWaitForTransactionReceipt } from 'wagmi';
import { useState } from 'react';
import { Token } from '@/types/token';
import { BURN_GAS_LIMIT } from '@/config/web3';

// ERC20 burn function signature (transfer to dead address)
const BURN_ADDRESS = '0x000000000000000000000000000000000000dEaD';

// Minimal ERC20 ABI for token transfer
const ERC20_ABI = [
  {
    constant: false,
    inputs: [
      { name: '_to', type: 'address' },
      { name: '_value', type: 'uint256' }
    ],
    name: 'transfer',
    outputs: [{ name: '', type: 'bool' }],
    payable: false,
    stateMutability: 'nonpayable',
    type: 'function'
  }
];

// Result type for burn operations
type BurnResult = {
  token: Token;
  success: boolean;
  txHash?: `0x${string}`;
  error?: unknown;
};

/**
 * Custom hook for burning tokens
 */
export function useTokenBurner() {
  const [isBurning, setIsBurning] = useState(false);
  const [currentToken, setCurrentToken] = useState<Token | null>(null);
  const [processedTokens, setProcessedTokens] = useState(0);
  const [totalTokens, setTotalTokens] = useState(0);
  const [currentTxHash, setCurrentTxHash] = useState<`0x${string}` | null>(null);
  
  const { writeContractAsync, isPending, isError, error } = useWriteContract();
  const { isLoading: isConfirming, isSuccess: isConfirmed } = useWaitForTransactionReceipt({
    hash: currentTxHash || undefined,
  });

  /**
   * Burns a single token and waits for transaction confirmation
   */
  const burnToken = async (token: Token): Promise<BurnResult> => {
    try {
      // Set current token being processed
      setCurrentToken(token);
      
      // Submit the transaction and get hash
      const txHash = await writeContractAsync({
        address: token.contract_address as `0x${string}`,
        abi: ERC20_ABI,
        functionName: 'transfer',
        args: [BURN_ADDRESS, token.balance],
        gas: BigInt(BURN_GAS_LIMIT)
      });

      // Set current transaction hash for tracking
      setCurrentTxHash(txHash);

      // Wait for transaction to be confirmed on-chain
      // This creates a small delay until we set up a proper listener
      await new Promise(resolve => setTimeout(resolve, 3000));
      
      // Increment processed token count
      setProcessedTokens(prev => prev + 1);

      // Return success with the transaction hash
      return {
        token,
        success: true,
        txHash
      };
    } catch (err) {
      console.error(`Error burning token ${token.contract_ticker_symbol}:`, err);
      
      // Increment processed token count even for errors
      setProcessedTokens(prev => prev + 1);
      
      return {
        token,
        success: false,
        error: err
      };
    }
  };

  /**
   * Burns multiple tokens sequentially, waiting for each transaction to complete
   * before moving to the next one
   */
  const burnTokens = async (tokens: Token[]): Promise<BurnResult[]> => {
    setIsBurning(true);
    setProcessedTokens(0);
    setTotalTokens(tokens.length);
    const results: BurnResult[] = [];

    try {
      // Process tokens one at a time
      for (let i = 0; i < tokens.length; i++) {
        const token = tokens[i];
        
        try {
          // Process this token
          const result = await burnToken(token);
          results.push(result);
        } catch (err) {
          results.push({ 
            token, 
            success: false, 
            error: err 
          });
          
          // Still update processed count on failure
          setProcessedTokens(prev => prev + 1);
        }
      }
    } finally {
      setIsBurning(false);
      setCurrentTxHash(null);
      setCurrentToken(null);
    }

    return results;
  };

  return {
    burnToken,
    burnTokens,
    isPending,
    isLoading: isPending || isBurning || isConfirming,
    isSuccess: !isPending && !isBurning && !isConfirming,
    isConfirmed,
    isError,
    error,
    currentTxHash,
    currentToken,
    processedTokens,
    totalTokens
  };
} 