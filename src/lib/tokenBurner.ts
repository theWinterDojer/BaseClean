import { parseUnits } from 'viem';
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
  },
  {
    constant: true,
    inputs: [{ name: '_owner', type: 'address' }],
    name: 'balanceOf',
    outputs: [{ name: 'balance', type: 'uint256' }],
    payable: false,
    stateMutability: 'view',
    type: 'function'
  }
];

/**
 * Custom hook for burning tokens
 * @returns Object with burn function, loading state, and transaction receipt
 */
export function useTokenBurner() {
  const [txHash, setTxHash] = useState<`0x${string}` | null>(null);
  const { writeContract, isPending, isError, error } = useWriteContract();
  const { isLoading, isSuccess, data: receipt } = useWaitForTransactionReceipt({ 
    hash: txHash as `0x${string}`,
    enabled: !!txHash
  });

  /**
   * Burns a token by sending it to a dead address
   * @param token Token to burn
   * @returns Promise that resolves when transaction is sent
   */
  const burnToken = async (token: Token) => {
    try {
      const hash = await writeContract({
        address: token.contract_address as `0x${string}`,
        abi: ERC20_ABI,
        functionName: 'transfer',
        args: [BURN_ADDRESS, token.balance],
        gas: BigInt(BURN_GAS_LIMIT)
      });
      
      setTxHash(hash);
      return hash;
    } catch (err) {
      console.error('Error burning token:', err);
      throw err;
    }
  };

  /**
   * Burns multiple tokens sequentially
   * @param tokens Array of tokens to burn
   * @returns Promise that resolves when all tokens are burned
   */
  const burnTokens = async (tokens: Token[]) => {
    const results = [];
    
    for (const token of tokens) {
      try {
        const hash = await burnToken(token);
        results.push({ token, hash, success: true });
      } catch (err) {
        results.push({ token, error: err, success: false });
      }
    }
    
    return results;
  };

  return {
    burnToken,
    burnTokens,
    isPending,
    isLoading: isPending || isLoading,
    isSuccess,
    isError,
    error,
    receipt,
    txHash
  };
} 