import { useWriteContract, useWaitForTransactionReceipt, useReadContract } from 'wagmi';
import { useState } from 'react';
import { Token } from '@/types/token';
import { BURN_GAS_LIMIT } from '@/config/web3';

// BatchBurner contract configuration
export const BATCH_BURNER_CONFIG = {
  // This will be populated after deployment
  address: process.env.NEXT_PUBLIC_BATCH_BURNER_ADDRESS as `0x${string}` || '0x',
  
  // Contract ABI - only the functions we need
  abi: [
    {
      "type": "function",
      "name": "batchBurnERC20",
      "inputs": [
        {
          "name": "tokens",
          "type": "address[]",
          "internalType": "address[]"
        },
        {
          "name": "amounts",
          "type": "uint256[]",
          "internalType": "uint256[]"
        }
      ],
      "outputs": [],
      "stateMutability": "nonpayable"
    },
    {
      "type": "function",
      "name": "batchBurnERC721",
      "inputs": [
        {
          "name": "contracts",
          "type": "address[]",
          "internalType": "address[]"
        },
        {
          "name": "tokenIds",
          "type": "uint256[]",
          "internalType": "uint256[]"
        }
      ],
      "outputs": [],
      "stateMutability": "nonpayable"
    },
    {
      "type": "function",
      "name": "batchBurnERC1155",
      "inputs": [
        {
          "name": "contracts",
          "type": "address[]",
          "internalType": "address[]"
        },
        {
          "name": "tokenIds",
          "type": "uint256[]",
          "internalType": "uint256[]"
        },
        {
          "name": "amounts",
          "type": "uint256[]",
          "internalType": "uint256[]"
        }
      ],
      "outputs": [],
      "stateMutability": "nonpayable"
    },
    {
      "type": "function",
      "name": "isOperational",
      "inputs": [],
      "outputs": [
        {
          "name": "",
          "type": "bool",
          "internalType": "bool"
        }
      ],
      "stateMutability": "view"
    },
    {
      "type": "function",
      "name": "MAX_BATCH_SIZE",
      "inputs": [],
      "outputs": [
        {
          "name": "",
          "type": "uint256",
          "internalType": "uint256"
        }
      ],
      "stateMutability": "view"
    },
    {
      "type": "event",
      "name": "ERC20BatchBurn",
      "inputs": [
        {
          "name": "user",
          "type": "address",
          "indexed": true,
          "internalType": "address"
        },
        {
          "name": "tokens",
          "type": "address[]",
          "indexed": false,
          "internalType": "address[]"
        },
        {
          "name": "amounts",
          "type": "uint256[]",
          "indexed": false,
          "internalType": "uint256[]"
        },
        {
          "name": "timestamp",
          "type": "uint256",
          "indexed": false,
          "internalType": "uint256"
        }
      ],
      "anonymous": false
    }
  ] as const,
} as const;

// ERC20 approval ABI for batch operations
export const ERC20_APPROVAL_ABI = [
  {
    "type": "function",
    "name": "approve",
    "inputs": [
      { "name": "spender", "type": "address" },
      { "name": "amount", "type": "uint256" }
    ],
    "outputs": [{ "name": "", "type": "bool" }],
    "stateMutability": "nonpayable"
  },
  {
    "type": "function",
    "name": "allowance",
    "inputs": [
      { "name": "owner", "type": "address" },
      { "name": "spender", "type": "address" }
    ],
    "outputs": [{ "name": "", "type": "uint256" }],
    "stateMutability": "view"
  }
] as const;

// Result type for batch burn operations
export type BatchBurnResult = {
  tokens: Token[];
  success: boolean;
  txHash?: `0x${string}`;
  error?: unknown;
  gasUsed?: bigint;
};

// Hook for checking if BatchBurner contract is operational
export function useBatchBurnerStatus() {
  const { data: isOperational, isLoading, error } = useReadContract({
    ...BATCH_BURNER_CONFIG,
    functionName: 'isOperational',
  });

  const { data: maxBatchSize } = useReadContract({
    ...BATCH_BURNER_CONFIG,
    functionName: 'MAX_BATCH_SIZE',
  });

  return {
    isOperational: isOperational ?? false,
    maxBatchSize: maxBatchSize ? Number(maxBatchSize) : 100,
    isLoading,
    error,
    isContractAvailable: !!BATCH_BURNER_CONFIG.address && BATCH_BURNER_CONFIG.address !== '0x',
  };
}

// Enhanced hook for batch burning tokens
export function useBatchTokenBurner() {
  const [isBurning, setIsBurning] = useState(false);
  const [currentOperation, setCurrentOperation] = useState<string | null>(null);
  const [currentTxHash, setCurrentTxHash] = useState<`0x${string}` | null>(null);
  
  const { writeContractAsync, isPending, isError, error } = useWriteContract();
  const { isLoading: isConfirming, isSuccess: isConfirmed } = useWaitForTransactionReceipt({
    hash: currentTxHash || undefined,
  });

  // Get contract status
  const { isOperational, maxBatchSize, isContractAvailable } = useBatchBurnerStatus();

  /**
   * Batch burn ERC20 tokens using the BatchBurner contract
   */
  const batchBurnERC20 = async (tokens: Token[]): Promise<BatchBurnResult> => {
    if (!isContractAvailable) {
      throw new Error('BatchBurner contract not available');
    }

    if (!isOperational) {
      throw new Error('BatchBurner contract is not operational');
    }

    if (tokens.length === 0) {
      throw new Error('No tokens to burn');
    }

    if (tokens.length > maxBatchSize) {
      throw new Error(`Batch size exceeds maximum of ${maxBatchSize}`);
    }

    try {
      setIsBurning(true);
      setCurrentOperation('Preparing batch burn transaction...');

      // Prepare contract call data
      const tokenAddresses = tokens.map(token => token.contract_address as `0x${string}`);
      const amounts = tokens.map(token => BigInt(token.balance));

      setCurrentOperation('Submitting batch burn transaction...');
      
      // Submit the batch burn transaction
      const txHash = await writeContractAsync({
        ...BATCH_BURNER_CONFIG,
        functionName: 'batchBurnERC20',
        args: [tokenAddresses, amounts],
        gas: BigInt(BURN_GAS_LIMIT * tokens.length), // Scale gas with batch size
      });

      setCurrentTxHash(txHash);
      setCurrentOperation('Waiting for transaction confirmation...');

      // Return success result
      return {
        tokens,
        success: true,
        txHash,
      };
    } catch (err) {
      console.error('Error in batch burn:', err);
      return {
        tokens,
        success: false,
        error: err,
      };
    } finally {
      setIsBurning(false);
      setCurrentOperation(null);
    }
  };

  /**
   * Approve tokens for batch burning
   */
  const approveTokensForBurning = async (tokens: Token[]) => {
    const approvalResults: Record<string, { success: boolean; txHash?: `0x${string}`; error?: unknown }> = {};

    for (const token of tokens) {
      try {
        setCurrentOperation(`Approving ${token.contract_ticker_symbol || 'token'}...`);
        
        const txHash = await writeContractAsync({
          address: token.contract_address as `0x${string}`,
          abi: ERC20_APPROVAL_ABI,
          functionName: 'approve',
          args: [BATCH_BURNER_CONFIG.address, BigInt(token.balance)],
          gas: BigInt(100000), // Standard approval gas
        });

        approvalResults[token.contract_address] = {
          success: true,
          txHash,
        };
      } catch (err) {
        console.error(`Error approving token ${token.contract_address}:`, err);
        approvalResults[token.contract_address] = {
          success: false,
          error: err,
        };
      }
    }

    return approvalResults;
  };

  return {
    batchBurnERC20,
    approveTokensForBurning,
    
    // State
    isBurning,
    currentOperation,
    currentTxHash,
    
    // Transaction status
    isPending,
    isConfirming,
    isConfirmed,
    isError,
    error,
    
    // Contract status
    isOperational,
    maxBatchSize,
    isContractAvailable,
    
    // Loading state
    isLoading: isPending || isBurning || isConfirming,
  };
} 