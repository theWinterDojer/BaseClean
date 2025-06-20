import { useState } from 'react';
import { 
  useWriteContract, 
  useWaitForTransactionReceipt,
  usePublicClient
} from 'wagmi';
import { Token } from '@/types/token';
import { NFT } from '@/types/nft';
import { BURN_GAS_LIMIT, NFT_BURN_GAS_LIMIT, BURN_ADDRESS } from '@/config/web3';
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

// Minimal ERC721 ABI for direct transfer - NO APPROVALS NEEDED!
export const ERC721_TRANSFER_ABI = [
  {
    "type": "function",
    "name": "transferFrom",
    "inputs": [
      { "name": "from", "type": "address" },
      { "name": "to", "type": "address" },
      { "name": "tokenId", "type": "uint256" }
    ],
    "outputs": [],
    "stateMutability": "nonpayable"
  }
] as const;

// Minimal ERC1155 ABI for direct transfer - NO APPROVALS NEEDED!
export const ERC1155_TRANSFER_ABI = [
  {
    "type": "function",
    "name": "safeTransferFrom",
    "inputs": [
      { "name": "from", "type": "address" },
      { "name": "to", "type": "address" },
      { "name": "id", "type": "uint256" },
      { "name": "amount", "type": "uint256" },
      { "name": "data", "type": "bytes" }
    ],
    "outputs": [],
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

// Result type for direct NFT burn operations
export type DirectNFTBurnResult = {
  nft: NFT;
  success: boolean;
  txHash?: `0x${string}`;
  error?: unknown;
  errorMessage?: string;
  timestamp?: number;
  parsedError?: ParsedError;
  isUserRejection?: boolean;
};

// Union type for all burn results
export type DirectBurnAnyResult = DirectBurnResult | DirectNFTBurnResult;

/**
 * 🔥 DIRECT BURNER - TOKENS & NFTs - ZERO APPROVALS NEEDED! 🔥
 * 
 * This is the SIMPLEST and SAFEST way to burn tokens and NFTs:
 * 
 * ✅ NO approvals required (zero attack surface)
 * ✅ NO contract dependencies 
 * ✅ Immediate burning (each item burns when you click)
 * ✅ Full transparency (simple transfers to burn address)
 * ✅ Supports ERC-20, ERC-721, and ERC-1155
 * 
 * Trade-off: Multiple transactions (1 per item)
 * Benefit: ZERO approvals = ZERO risk
 */
export function useDirectBurner() {
  const [isBurning, setIsBurning] = useState(false);
  const [currentToken, setCurrentToken] = useState<Token | null>(null);
  const [currentNFT, setCurrentNFT] = useState<NFT | null>(null);
  const [burnResults, setBurnResults] = useState<DirectBurnResult[]>([]);
  const [nftBurnResults, setNFTBurnResults] = useState<DirectNFTBurnResult[]>([]);
  
  const { writeContractAsync, isPending, isError, error } = useWriteContract();
  const publicClient = usePublicClient();

  /**
   * Burn a single token directly - NO APPROVALS NEEDED!
   * User calls token.transfer(burnAddress, amount) directly
   */
  const burnSingleToken = async (token: Token): Promise<DirectBurnResult> => {
    setCurrentToken(token);
    
    try {
      // Check if this is native ETH (cannot be burned using ERC-20 methods)
      if (token.contract_address === '0x0000000000000000000000000000000000000000' || 
          token.contract_address.toLowerCase() === '0x0000000000000000000000000000000000000000') {
        throw new Error('Native ETH cannot be burned using token burn methods. ETH is needed for gas fees on the network.');
      }
      
      // Call transfer() directly on the token contract
      // This transfers from user's wallet to burn address - NO APPROVAL NEEDED!
      let txHash: `0x${string}`;
      
      // Convert balance to proper BigInt format
      // token.balance is already in the smallest unit (wei) as a string
      let balanceBigInt: bigint;
      try {
        // Handle scientific notation properly without losing precision
        const balanceString = token.balance.toString();
        if (balanceString.includes('e') || balanceString.includes('E')) {
          // Convert scientific notation to full integer string without precision loss
          const [coefficient, exponent] = balanceString.toLowerCase().split('e');
          const exp = parseInt(exponent, 10);
          const coefficientParts = coefficient.split('.');
          const integerPart = coefficientParts[0];
          const fractionalPart = coefficientParts[1] || '';
          
          if (exp >= 0) {
            // Positive exponent: add zeros to the right
            const zerosToAdd = Math.max(0, exp - fractionalPart.length);
            const fullIntegerString = integerPart + fractionalPart + '0'.repeat(zerosToAdd);
            balanceBigInt = BigInt(fullIntegerString);
          } else {
            // Negative exponent would create a decimal, but token balances should be integers
            throw new Error(`Token balance has negative exponent (fractional): ${balanceString}`);
          }
        } else {
          // Regular string number, convert directly
          balanceBigInt = BigInt(balanceString);
        }
      } catch (balanceError) {
        console.error(`Error converting balance to BigInt for token ${token.contract_address}:`, balanceError);
        throw new Error(`Invalid token balance format: ${token.balance}`);
      }
      
      try {
        txHash = await writeContractAsync({
          address: token.contract_address as `0x${string}`,
          abi: ERC20_TRANSFER_ABI,
          functionName: 'transfer',
          args: [BURN_ADDRESS as `0x${string}`, balanceBigInt],
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
   * Burn a single NFT directly - NO APPROVALS NEEDED!
   * User calls transferFrom (ERC-721) or safeTransferFrom (ERC-1155) directly
   */
  const burnSingleNFT = async (nft: NFT, userAddress: string): Promise<DirectNFTBurnResult> => {
    setCurrentNFT(nft);
    
    try {
      let txHash: `0x${string}`;
      
      // Convert token_id to BigInt
      const tokenIdBigInt = BigInt(nft.token_id);
      
      if (nft.token_standard === 'ERC721') {
        // ERC-721: Use transferFrom - NO APPROVAL NEEDED!
        try {
          txHash = await writeContractAsync({
            address: nft.contract_address as `0x${string}`,
            abi: ERC721_TRANSFER_ABI,
            functionName: 'transferFrom',
            args: [
              userAddress as `0x${string}`, 
              BURN_ADDRESS as `0x${string}`, 
              tokenIdBigInt
            ],
            gas: BigInt(NFT_BURN_GAS_LIMIT), // Use higher gas limit for NFTs
          });
        } catch (writeError) {
          const isRejection = isUserRejectionError(writeError);
          if (isRejection) {
            console.log(`User cancelled burn transaction for NFT ${nft.contract_address}:${nft.token_id}`);
          }
          throw writeError;
        }
      } else if (nft.token_standard === 'ERC1155') {
        // ERC-1155: Use safeTransferFrom - NO APPROVAL NEEDED!
        const amount = BigInt(nft.balance || '1'); // Default to 1 if balance not specified
        
        try {
          txHash = await writeContractAsync({
            address: nft.contract_address as `0x${string}`,
            abi: ERC1155_TRANSFER_ABI,
            functionName: 'safeTransferFrom',
            args: [
              userAddress as `0x${string}`, 
              BURN_ADDRESS as `0x${string}`, 
              tokenIdBigInt,
              amount,
              '0x' as `0x${string}` // Empty data parameter
            ],
            gas: BigInt(NFT_BURN_GAS_LIMIT), // Use higher gas limit for NFTs
          });
        } catch (writeError) {
          const isRejection = isUserRejectionError(writeError);
          if (isRejection) {
            console.log(`User cancelled burn transaction for NFT ${nft.contract_address}:${nft.token_id}`);
          }
          throw writeError;
        }
      } else {
        throw new Error(`Unsupported NFT standard: ${nft.token_standard}`);
      }

      // Wait for transaction to be mined and check if it was successful
      try {
        const receipt = await publicClient?.waitForTransactionReceipt({
          hash: txHash,
          timeout: 30_000, // Optimized: 30 second timeout (Base is fast)
        });

        const isSuccessful = receipt?.status === 'success';

        const result: DirectNFTBurnResult = {
          nft,
          success: isSuccessful,
          txHash,
          timestamp: Date.now(),
          error: !isSuccessful ? 'Transaction was reverted on-chain' : undefined,
          errorMessage: !isSuccessful ? 'Transaction was reverted on-chain' : undefined,
        };
        
        setNFTBurnResults(prev => [...prev, result]);
        return result;
        
      } catch (receiptError) {
        console.error(`Error waiting for transaction receipt ${txHash}:`, receiptError);
        
        // Parse the receipt error for better handling
        const parsedError = parseWalletError(receiptError);
        
        // Transaction was submitted but we couldn't confirm its status
        const result: DirectNFTBurnResult = {
          nft,
          success: false,
          txHash,
          error: receiptError,
          errorMessage: parsedError.userFriendlyMessage,
          timestamp: Date.now(),
          parsedError,
          isUserRejection: false, // Receipt errors are not user rejections
        };
        
        setNFTBurnResults(prev => [...prev, result]);
        return result;
      }
      
    } catch (err) {
      // Parse the error for better handling first
      const parsedError = parseWalletError(err);
      const isRejection = isUserRejectionError(err);
      
      // Only log actual errors, not user rejections (which are normal behavior)
      if (!isRejection) {
        console.error(`Error burning NFT ${nft.contract_address}:${nft.token_id}:`, err);
      } else {
        // Log user rejections as info only for debugging purposes
        console.log(`User cancelled burn transaction for NFT ${nft.contract_address}:${nft.token_id}`);
      }
      
      const result: DirectNFTBurnResult = {
        nft,
        success: false,
        error: err,
        errorMessage: parsedError.userFriendlyMessage,
        timestamp: Date.now(),
        parsedError,
        isUserRejection: isRejection,
      };
      
      setNFTBurnResults(prev => [...prev, result]);
      return result;
    } finally {
      setCurrentNFT(null);
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
   * Burn multiple NFTs sequentially - NO APPROVALS NEEDED!
   * Each NFT is burned in a separate transaction
   */
  const burnMultipleNFTs = async (nfts: NFT[], userAddress: string): Promise<DirectNFTBurnResult[]> => {
    if (nfts.length === 0) {
      throw new Error('No NFTs to burn');
    }

    const results: DirectNFTBurnResult[] = [];
    setIsBurning(true);
    
    try {
      for (const nft of nfts) {
        const result = await burnSingleNFT(nft, userAddress);
        results.push(result);
      }
      
      return results;
      
    } finally {
      setIsBurning(false);
    }
  };

  /**
   * Get burn statistics for tokens
   */
  const getTokenBurnStats = () => {
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
   * Get burn statistics for NFTs
   */
  const getNFTBurnStats = () => {
    const totalBurns = nftBurnResults.length;
    const successfulBurns = nftBurnResults.filter(r => r.success).length;
    const failedBurns = nftBurnResults.filter(r => !r.success).length;
    
    return {
      totalBurns,
      successfulBurns,
      failedBurns,
      successRate: totalBurns > 0 ? (successfulBurns / totalBurns) * 100 : 0,
    };
  };

  /**
   * Get combined burn statistics
   */
  const getCombinedBurnStats = () => {
    const tokenStats = getTokenBurnStats();
    const nftStats = getNFTBurnStats();
    
    const totalBurns = tokenStats.totalBurns + nftStats.totalBurns;
    const successfulBurns = tokenStats.successfulBurns + nftStats.successfulBurns;
    const failedBurns = tokenStats.failedBurns + nftStats.failedBurns;
    
    return {
      totalBurns,
      successfulBurns,
      failedBurns,
      successRate: totalBurns > 0 ? (successfulBurns / totalBurns) * 100 : 0,
      tokens: tokenStats,
      nfts: nftStats,
    };
  };

  /**
   * Clear all burn history
   */
  const clearBurnHistory = () => {
    setBurnResults([]);
    setNFTBurnResults([]);
  };

  return {
    // Main functions
    burnSingleToken,
    burnSingleNFT,
    burnMultipleTokens,
    burnMultipleNFTs,
    
    // State
    isBurning,
    currentToken,
    currentNFT,
    burnResults,
    nftBurnResults,
    
    // Utilities
    getTokenBurnStats,
    getNFTBurnStats,
    getCombinedBurnStats,
    clearBurnHistory,
    
    // Transaction status
    isPending,
    isError,
    error,
  };
}

// Legacy alias for backward compatibility
export const useDirectTokenBurner = useDirectBurner;

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
      // Check if this is native ETH (cannot be burned using ERC-20 methods)
      if (token.contract_address === '0x0000000000000000000000000000000000000000' || 
          token.contract_address.toLowerCase() === '0x0000000000000000000000000000000000000000') {
        throw new Error('Native ETH cannot be burned using token burn methods. ETH is needed for gas fees on the network.');
      }
      
      // Convert balance to proper BigInt format
      // token.balance might be in scientific notation (e.g., "5.8451e+22")
      let balanceBigInt: bigint;
      try {
        // Handle scientific notation properly without losing precision
        const balanceString = token.balance.toString();
        if (balanceString.includes('e') || balanceString.includes('E')) {
          // Convert scientific notation to full integer string without precision loss
          const [coefficient, exponent] = balanceString.toLowerCase().split('e');
          const exp = parseInt(exponent, 10);
          const coefficientParts = coefficient.split('.');
          const integerPart = coefficientParts[0];
          const fractionalPart = coefficientParts[1] || '';
          
          if (exp >= 0) {
            // Positive exponent: add zeros to the right
            const zerosToAdd = Math.max(0, exp - fractionalPart.length);
            const fullIntegerString = integerPart + fractionalPart + '0'.repeat(zerosToAdd);
            balanceBigInt = BigInt(fullIntegerString);
          } else {
            // Negative exponent would create a decimal, but token balances should be integers
            throw new Error(`Token balance has negative exponent (fractional): ${balanceString}`);
          }
        } else {
          // Regular string number, convert directly
          balanceBigInt = BigInt(balanceString);
        }
      } catch (balanceError) {
        console.error(`Error converting balance to BigInt for token ${token.contract_address}:`, balanceError);
        throw new Error(`Invalid token balance format: ${token.balance}`);
      }
      
      const txHash = await writeContractAsync({
        address: token.contract_address as `0x${string}`,
        abi: ERC20_TRANSFER_ABI,
        functionName: 'transfer',
        args: [BURN_ADDRESS as `0x${string}`, balanceBigInt],
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

 