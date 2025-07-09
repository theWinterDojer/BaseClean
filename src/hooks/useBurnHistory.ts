import { useState, useCallback, useEffect } from 'react';
import { useAccount } from 'wagmi';
import { BurnSummary, BurnResult } from '@/types/universalBurn';

// Enhanced history entry structure
export interface BurnHistoryEntry {
  id: string;
  timestamp: number;
  walletAddress: string;
  summary: BurnSummary;
  results: BurnResult[];
  burnType: 'tokens-only' | 'nfts-only' | 'mixed';
  totalItems: number;
  successfulBurns: number;
  failedBurns: number;
  userRejections: number; // Always 0 for new entries (kept for backwards compatibility)
  totalValue: number;
  duration: number;
  gasUsed?: string; // Stored as string to avoid BigInt serialization issues (legacy)
  gasCostGwei?: number; // Gas cost in GWEI - new field
  txHashes: string[];
}

// History storage key
const HISTORY_STORAGE_KEY = 'baseclean_burn_history';

// Hook for managing burn transaction history
export function useBurnHistory() {
  const { address } = useAccount();
  const [history, setHistory] = useState<BurnHistoryEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Load history from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(HISTORY_STORAGE_KEY);
      if (stored) {
        const parsed: BurnHistoryEntry[] = JSON.parse(stored);
        // Filter by current wallet address if connected
        const filteredHistory = address 
          ? parsed.filter(entry => entry.walletAddress.toLowerCase() === address.toLowerCase())
          : parsed;
        setHistory(filteredHistory);
      }
    } catch (error) {
      console.error('Failed to load burn history:', error);
    } finally {
      setIsLoading(false);
    }
  }, [address]);

  // Save history to localStorage
  const saveToStorage = useCallback((newHistory: BurnHistoryEntry[]) => {
    try {
      // Get all history entries, not just current wallet
      const existingStored = localStorage.getItem(HISTORY_STORAGE_KEY);
      let allHistory: BurnHistoryEntry[] = [];
      
      if (existingStored) {
        allHistory = JSON.parse(existingStored);
      }
      
      // Remove old entries for current wallet and add new ones
      if (address) {
        allHistory = allHistory.filter(entry => 
          entry.walletAddress.toLowerCase() !== address.toLowerCase()
        );
        allHistory.push(...newHistory);
      }
      
      // Sort by timestamp (newest first) and limit to 100 total entries
      allHistory.sort((a, b) => b.timestamp - a.timestamp);
      allHistory = allHistory.slice(0, 100);
      
      localStorage.setItem(HISTORY_STORAGE_KEY, JSON.stringify(allHistory, (key, value) => {
        // Convert any BigInt values to strings for safe serialization
        return typeof value === 'bigint' ? value.toString() : value;
      }));
    } catch (error) {
      console.error('Failed to save burn history:', error);
    }
  }, [address]);

  // Add new burn to history (only receives actual burn attempts)
  const addBurnToHistory = useCallback((
    summary: BurnSummary,
    results: BurnResult[]
  ) => {
    if (!address) return;

    // Don't save to history if no burn attempts
    if (results.length === 0) {
      return;
    }

    const txHashes = results
      .filter(result => result.txHash)
      .map(result => result.txHash!);

    // Calculate burn stats from provided results
    const actualSuccessful = results.filter(r => r.success).length;
    const actualFailed = results.filter(r => !r.success).length;

    // Use total gas cost from summary if available, otherwise calculate from individual results
    const totalGasCostGwei = summary.totalGasCostGwei ?? results.reduce((sum, result) => {
      return sum + (result.gasCostGwei || 0);
    }, 0);

    const newEntry: BurnHistoryEntry = {
      id: `burn_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      timestamp: Date.now(),
      walletAddress: address,
      summary,
      results, // Store all provided results (already filtered by caller)
      burnType: summary.burnType,
      totalItems: results.length,
      successfulBurns: actualSuccessful,
      failedBurns: actualFailed,
      userRejections: 0, // Always 0 since caller excludes these
      totalValue: summary.totalValue,
      duration: summary.duration,
      gasUsed: summary.totalGasUsed?.toString(),
      gasCostGwei: totalGasCostGwei,
      txHashes
    };

    const updatedHistory = [newEntry, ...history];
    setHistory(updatedHistory);
    saveToStorage(updatedHistory);
  }, [address, history, saveToStorage]);

  // Clear history for current wallet
  const clearHistory = useCallback(() => {
    setHistory([]);
    if (address) {
      // Remove only current wallet's history
      try {
        const existingStored = localStorage.getItem(HISTORY_STORAGE_KEY);
        if (existingStored) {
          let allHistory: BurnHistoryEntry[] = JSON.parse(existingStored);
          allHistory = allHistory.filter(entry => 
            entry.walletAddress.toLowerCase() !== address.toLowerCase()
          );
          localStorage.setItem(HISTORY_STORAGE_KEY, JSON.stringify(allHistory, (key, value) => {
            // Convert any BigInt values to strings for safe serialization
            return typeof value === 'bigint' ? value.toString() : value;
          }));
        }
      } catch (error) {
        console.error('Failed to clear history:', error);
      }
    }
  }, [address]);

  // Get history stats
  const getHistoryStats = useCallback(() => {
    const totalBurns = history.length;
    const totalItemsBurned = history.reduce((sum, entry) => sum + entry.successfulBurns, 0);
    const totalValueBurned = history.reduce((sum, entry) => sum + entry.totalValue, 0);
    const totalGasCostGwei = history.reduce((sum, entry) => {
      return sum + (entry.gasCostGwei || 0);
    }, 0);
    
    // Legacy gas calculation (kept for backwards compatibility)
    const totalGasUsed = history.reduce((sum, entry) => {
      return sum + (entry.gasUsed ? parseInt(entry.gasUsed, 10) : 0);
    }, 0);

    return {
      totalBurns,
      totalItemsBurned,
      totalValueBurned,
      totalGasCostGwei,
      totalGasUsed, // Legacy field
      recentActivity: history.slice(0, 5) // Last 5 burns
    };
  }, [history]);

  // Filter history by timeframe
  const getFilteredHistory = useCallback((
    timeframe: 'all' | '24h' | '7d' | '30d' = 'all',
    burnType?: 'tokens-only' | 'nfts-only' | 'mixed'
  ) => {
    let filtered = [...history];

    // Filter by timeframe
    if (timeframe !== 'all') {
      const now = Date.now();
      const timeMap = {
        '24h': 24 * 60 * 60 * 1000,
        '7d': 7 * 24 * 60 * 60 * 1000,
        '30d': 30 * 24 * 60 * 60 * 1000
      };
      const cutoff = now - timeMap[timeframe];
      filtered = filtered.filter(entry => entry.timestamp >= cutoff);
    }

    // Filter by burn type
    if (burnType) {
      filtered = filtered.filter(entry => entry.burnType === burnType);
    }

    return filtered;
  }, [history]);

  // Export history as CSV
  const exportHistory = useCallback(() => {
    if (history.length === 0) return;

    // CSV Headers
    const headers = [
      'Date',
      'Type', 
      'Total Items',
      'Successful',
      'Failed',
      'Value Burned ($)',
      'Duration (s)',
      'Gas Cost (Gwei)',
      'Transaction Hashes'
    ];

    // Convert history to CSV rows
    const csvRows = history.map(entry => {
      const date = new Date(entry.timestamp).toLocaleDateString();
      const burnType = entry.burnType === 'tokens-only' ? 'Tokens' : 
                       entry.burnType === 'nfts-only' ? 'NFTs' : 'Mixed';
      const duration = Math.round(entry.duration / 1000); // Convert to seconds
      const gasCostGwei = entry.gasCostGwei ? entry.gasCostGwei.toFixed(1) : '0.0';
      const txHashes = entry.txHashes.join('; ');

      return [
        date,
        burnType,
        entry.totalItems,
        entry.successfulBurns,
        entry.failedBurns,
        entry.totalValue.toFixed(2),
        duration,
        gasCostGwei,
        txHashes
      ];
    });

    // Combine headers and rows
    const csvContent = [headers, ...csvRows]
      .map(row => row.map(field => `"${field}"`).join(','))
      .join('\n');

    const blob = new Blob([csvContent], {
      type: 'text/csv'
    });
    
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `baseclean-burn-history-${address?.slice(0, 6)}-${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }, [history, address]);

  return {
    history,
    isLoading,
    addBurnToHistory,
    clearHistory,
    getHistoryStats,
    getFilteredHistory,
    exportHistory,
    hasHistory: history.length > 0
  };
} 