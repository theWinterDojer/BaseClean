import { useState } from 'react';
import { 
  useWriteContract, 
  useWaitForTransactionReceipt,
  usePublicClient
} from 'wagmi';
import { Token } from '@/types/token';
import { BURN_GAS_LIMIT, BURN_ADDRESS } from '@/config/web3';
import { parseWalletError, ParsedError, isUserRejectionError } from '@/utils/errorHandling';

// Minimal ERC20 ABI for direct transfer
export const ERC20_TRANSFER_ABI = [
  {
    "type": "function",
    "name": "transfer",
    "inputs": [
      { "name": "to", "type": "address" },
      { "name": "amount", "type": "uint256" }
    ],
    "outputs": [{ "name": "", "type": "bool" }],
    "stateMutability": "nonpayable"
  }
] as const;

// Result type for direct burn operations
export type DirectBurnResult = {
  token: Token;
  success: boolean;
  txHash?: `0x${string}`;
  error?: unknown;
  errorMessage?: string;
  timestamp?: number;
  parsedError?: ParsedError;
  isUserRejection?: boolean;
};

/**
 * 🔥 DIRECT TOKEN BURNER - ZERO APPROVALS NEEDED! 🔥
 * 
 * This is the SIMPLEST and SAFEST way to burn tokens:
 * 
 * ✅ NO approvals required (zero attack surface)
 * ✅ NO contract dependencies 
 * ✅ Immediate burning (each token burns when you click)
 * ✅ Full transparency (simple transfers to burn address)
 * 
 * Trade-off: Multiple transactions (1 per token)
 * Benefit: ZERO approvals = ZERO risk
 */
export function useDirectTokenBurner() {
  const [isBurning, setIsBurning] = useState(false);
  const [currentToken, setCurrentToken] = useState<Token | null>(null);
  const [burnResults, setBurnResults] = useState<DirectBurnResult[]>([]);
  
  const { writeContractAsync, isPending, isError, error } = useWriteContract();
  const publicClient = usePublicClient();

  /**
   * Burn a single token directly - NO APPROVALS NEEDED!
   * User calls token.transfer(burnAddress, amount) directly
   */
  const burnSingleToken = async (token: Token): Promise<DirectBurnResult> => {
    setCurrentToken(token);
    
    try {
      // Call transfer() directly on the token contract
      // This transfers from user's wallet to burn address - NO APPROVAL NEEDED!
      let txHash: `0x${string}`;
      
      try {
        txHash = await writeContractAsync({
          address: token.contract_address as `0x${string}`,
          abi: ERC20_TRANSFER_ABI,
          functionName: 'transfer',
          args: [BURN_ADDRESS as `0x${string}`, BigInt(token.balance)],
          gas: BigInt(BURN_GAS_LIMIT),
        });
      } catch (writeError) {
        // Immediately check if this is a user rejection and handle it gracefully
        const isRejection = isUserRejectionError(writeError);
        if (isRejection) {
          // Log as info, not error, since this is normal user behavior
          console.log(`User cancelled burn transaction for token ${token.contract_address}`);
        }
        // Re-throw the error to be handled by the outer catch block
        throw writeError;
      }

      // Wait for transaction to be mined and check if it was successful
      try {
        const receipt = await publicClient?.waitForTransactionReceipt({
          hash: txHash,
          timeout: 30_000, // Optimized: 30 second timeout (Base is fast)
        });

        const isSuccessful = receipt?.status === 'success';

        const result: DirectBurnResult = {
          token,
          success: isSuccessful,
          txHash,
          timestamp: Date.now(),
          error: !isSuccessful ? 'Transaction was reverted on-chain' : undefined,
          errorMessage: !isSuccessful ? 'Transaction was reverted on-chain' : undefined,
        };
        
        setBurnResults(prev => [...prev, result]);
        return result;
        
      } catch (receiptError) {
        console.error(`Error waiting for transaction receipt ${txHash}:`, receiptError);
        
        // Parse the receipt error for better handling
        const parsedError = parseWalletError(receiptError);
        
        // Transaction was submitted but we couldn't confirm its status
        const result: DirectBurnResult = {
          token,
          success: false,
          txHash,
          error: receiptError,
          errorMessage: parsedError.userFriendlyMessage,
          timestamp: Date.now(),
          parsedError,
          isUserRejection: false, // Receipt errors are not user rejections
        };
        
        setBurnResults(prev => [...prev, result]);
        return result;
      }
      
    } catch (err) {
      // Parse the error for better handling first
      const parsedError = parseWalletError(err);
      const isRejection = isUserRejectionError(err);
      
      // Only log actual errors, not user rejections (which are normal behavior)
      if (!isRejection) {
        console.error(`Error burning token ${token.contract_address}:`, err);
      } else {
        // Log user rejections as info only for debugging purposes
        console.log(`User cancelled burn transaction for token ${token.contract_address}`);
      }
      
      const result: DirectBurnResult = {
        token,
        success: false,
        error: err,
        errorMessage: parsedError.userFriendlyMessage,
        timestamp: Date.now(),
        parsedError,
        isUserRejection: isRejection,
      };
      
      setBurnResults(prev => [...prev, result]);
      return result;
    } finally {
      setCurrentToken(null);
    }
  };

  /**
   * Burn multiple tokens sequentially - NO APPROVALS NEEDED!
   * Each token is burned in a separate transaction
   */
  const burnMultipleTokens = async (tokens: Token[]): Promise<DirectBurnResult[]> => {
    if (tokens.length === 0) {
      throw new Error('No tokens to burn');
    }

    const results: DirectBurnResult[] = [];
    setIsBurning(true);
    
    try {
      for (const token of tokens) {
        const result = await burnSingleToken(token);
        results.push(result);
      }
      
      return results;
      
    } finally {
      setIsBurning(false);
    }
  };

  /**
   * Get burn statistics
   */
  const getBurnStats = () => {
    const totalBurns = burnResults.length;
    const successfulBurns = burnResults.filter(r => r.success).length;
    const failedBurns = burnResults.filter(r => !r.success).length;
    
    return {
      totalBurns,
      successfulBurns,
      failedBurns,
      successRate: totalBurns > 0 ? (successfulBurns / totalBurns) * 100 : 0,
    };
  };

  /**
   * Clear burn history
   */
  const clearBurnHistory = () => {
    setBurnResults([]);
  };

  return {
    // Main functions
    burnSingleToken,
    burnMultipleTokens,
    
    // State
    isBurning,
    currentToken,
    burnResults,
    
    // Utilities
    getBurnStats,
    clearBurnHistory,
    
    // Transaction status
    isPending,
    isError,
    error,
  };
}

/**
 * Hook for individual token burning with transaction monitoring
 */
export function useIndividualTokenBurner() {
  const [currentTxHash, setCurrentTxHash] = useState<`0x${string}` | null>(null);
  
  const { writeContractAsync, isPending } = useWriteContract();
  const { isLoading: isConfirming, isSuccess: isConfirmed } = useWaitForTransactionReceipt({
    hash: currentTxHash || undefined,
  });

  /**
   * Burn a token and monitor the transaction
   */
  const burnTokenWithMonitoring = async (token: Token): Promise<DirectBurnResult> => {
    try {
      const txHash = await writeContractAsync({
        address: token.contract_address as `0x${string}`,
        abi: ERC20_TRANSFER_ABI,
        functionName: 'transfer',
        args: [BURN_ADDRESS as `0x${string}`, BigInt(token.balance)],
        gas: BigInt(BURN_GAS_LIMIT),
      });

      setCurrentTxHash(txHash);

      return {
        token,
        success: true,
        txHash,
        timestamp: Date.now(),
      };
      
    } catch (err) {
      // Parse the error for better handling
      const parsedError = parseWalletError(err);
      const isRejection = isUserRejectionError(err);
      
      return {
        token,
        success: false,
        error: err,
        errorMessage: parsedError.userFriendlyMessage,
        timestamp: Date.now(),
        parsedError,
        isUserRejection: isRejection,
      };
    }
  };

  return {
    burnTokenWithMonitoring,
    currentTxHash,
    isPending,
    isConfirming,
    isConfirmed,
  };
} 