import React, { useState, useMemo, useEffect, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { useBurnHistory } from '@/hooks/useBurnHistory';
import { isToken, isNFT } from '@/types/universalBurn';
import { Token } from '@/types/token';
import { NFT } from '@/types/nft';

interface BurnHistoryModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function BurnHistoryModal({ isOpen, onClose }: BurnHistoryModalProps) {
  const { 
    isLoading, 
    clearHistory, 
    getHistoryStats, 
    getFilteredHistory, 
    exportHistory,
    hasHistory 
  } = useBurnHistory();

  const [selectedTimeframe, setSelectedTimeframe] = useState<'all' | '24h' | '7d' | '30d'>('all');
  const [selectedBurnType, setSelectedBurnType] = useState<'all' | 'tokens-only' | 'nfts-only' | 'mixed'>('all');
  const [expandedEntries, setExpandedEntries] = useState<Set<string>>(new Set());
  const [showClearConfirmation, setShowClearConfirmation] = useState(false);

  // Filter history based on selections
  const filteredHistory = useMemo(() => {
    return getFilteredHistory(
      selectedTimeframe,
      selectedBurnType === 'all' ? undefined : selectedBurnType
    );
  }, [getFilteredHistory, selectedTimeframe, selectedBurnType]);

  // Get overall stats
  const stats = getHistoryStats();

  // Toggle expanded state for history entries
  const toggleExpanded = (entryId: string) => {
    const newExpanded = new Set(expandedEntries);
    if (newExpanded.has(entryId)) {
      newExpanded.delete(entryId);
    } else {
      newExpanded.add(entryId);
    }
    setExpandedEntries(newExpanded);
  };

  // Simple close handler
  const handleClose = useCallback(() => {
    onClose();
  }, [onClose]);

  // Handle escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        handleClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      return () => document.removeEventListener('keydown', handleEscape);
    }
  }, [isOpen, handleClose]);

  if (!isOpen) return null;

  // Check if we're in the browser
  if (typeof window === 'undefined') return null;

  // Format timestamp
  const formatTimestamp = (timestamp: number) => {
    return new Date(timestamp).toLocaleString();
  };

  // Format duration
  const formatDuration = (duration: number) => {
    const seconds = Math.floor(duration / 1000);
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    
    if (minutes > 0) {
      return `${minutes}m ${remainingSeconds}s`;
    }
    return `${remainingSeconds}s`;
  };

  // Main history view - render using portal to bypass header constraints
  return createPortal(
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70"
      onClick={handleClose}
    >
      <div 
        className="bg-gray-900 rounded-lg border border-gray-700 shadow-xl max-w-4xl w-full max-h-[85vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-6">
          {/* Header */}
          <div className="flex justify-between items-center mb-6">
            <div>
              <h2 className="text-xl font-bold text-white flex items-center">
                <svg className="w-6 h-6 mr-2 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Burn History
              </h2>
              <p className="text-gray-400 text-sm mt-1">
                Track your wallet cleanup progress
              </p>
            </div>
            <button
              onClick={handleClose}
              className="text-gray-400 hover:text-gray-200 transition-colors"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {isLoading ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-400 mx-auto mb-4"></div>
              <p className="text-gray-400">Loading history...</p>
            </div>
          ) : !hasHistory ? (
            <div className="text-center py-12">
              <svg className="w-16 h-16 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <p className="text-xl font-medium text-gray-300 mb-2">No burn history yet</p>
              <p className="text-gray-400">Start burning spam tokens and NFTs to see your history here</p>
            </div>
          ) : (
            <>
              {/* Stats Overview */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                <div className="bg-gray-800 rounded-lg p-4 text-center">
                  <div className="text-2xl font-bold text-blue-400">{stats.totalBurns}</div>
                  <div className="text-sm text-gray-400">Total Burns</div>
                </div>
                <div className="bg-gray-800 rounded-lg p-4 text-center">
                  <div className="text-2xl font-bold text-green-400">{stats.totalItemsBurned}</div>
                  <div className="text-sm text-gray-400">Items Burned</div>
                </div>
                <div className="bg-gray-800 rounded-lg p-4 text-center">
                  <div className="text-2xl font-bold text-yellow-400">${stats.totalValueBurned.toFixed(2)}</div>
                  <div className="text-sm text-gray-400">Value Burned</div>
                </div>
                <div className="bg-gray-800 rounded-lg p-4 text-center">
                  <div className="text-2xl font-bold text-purple-400">{stats.totalGasUsed.toLocaleString()}</div>
                  <div className="text-sm text-gray-400">Gas Used</div>
                </div>
              </div>

              {/* Filters */}
              <div className="flex flex-wrap gap-4 mb-6">
                <div className="flex items-center gap-2">
                  <label className="text-sm text-gray-400">Timeframe:</label>
                  <select
                    value={selectedTimeframe}
                    onChange={(e) => setSelectedTimeframe(e.target.value as 'all' | '24h' | '7d' | '30d')}
                    className="bg-gray-800 border border-gray-600 rounded px-3 py-1 text-white text-sm"
                  >
                    <option value="all">All Time</option>
                    <option value="24h">Last 24h</option>
                    <option value="7d">Last 7 days</option>
                    <option value="30d">Last 30 days</option>
                  </select>
                </div>

                <div className="flex items-center gap-2">
                  <label className="text-sm text-gray-400">Type:</label>
                  <select
                    value={selectedBurnType}
                    onChange={(e) => setSelectedBurnType(e.target.value as 'all' | 'tokens-only' | 'nfts-only' | 'mixed')}
                    className="bg-gray-800 border border-gray-600 rounded px-3 py-1 text-white text-sm"
                  >
                    <option value="all">All Types</option>
                    <option value="tokens-only">Tokens Only</option>
                    <option value="nfts-only">NFTs Only</option>
                    <option value="mixed">Mixed</option>
                  </select>
                </div>

                <div className="flex items-center gap-2 ml-auto">
                  <button
                    onClick={exportHistory}
                    className="bg-blue-600 hover:bg-blue-500 text-white px-3 py-1 rounded text-sm transition-colors"
                  >
                    Export
                  </button>
                  <button
                    onClick={() => setShowClearConfirmation(true)}
                    className="bg-red-600 hover:bg-red-500 text-white px-3 py-1 rounded text-sm transition-colors"
                  >
                    Clear
                  </button>
                </div>
              </div>

              {/* History List */}
              <div className="space-y-3 max-h-96 overflow-y-auto custom-scrollbar">
                {filteredHistory.length === 0 ? (
                  <div className="text-center py-8">
                    <p className="text-gray-400">No burns found for selected filters</p>
                  </div>
                ) : (
                  filteredHistory.map((entry) => {
                    const isExpanded = expandedEntries.has(entry.id);
                    
                    return (
                      <div
                        key={entry.id}
                        className="bg-gray-800 hover:bg-gray-750 rounded-lg border border-gray-700 hover:border-gray-600 transition-colors"
                      >
                        {/* Main Entry Header - Clickable */}
                        <div 
                          className="p-4 cursor-pointer"
                          onClick={() => toggleExpanded(entry.id)}
                        >
                          <div className="flex justify-between items-start">
                            <div className="flex-1">
                              <div className="flex items-center gap-3 mb-2">
                                <span className="text-white font-medium">
                                  {entry.burnType === 'tokens-only' ? '🪙 Tokens' : 
                                   entry.burnType === 'nfts-only' ? '🖼️ NFTs' : 
                                   '🔄 Mixed'}
                                </span>
                                <span className="text-sm text-gray-400">
                                  {formatTimestamp(entry.timestamp)}
                                </span>
                                <button className="ml-2 text-gray-400 hover:text-gray-200 transition-colors">
                                  <svg 
                                    className={`w-4 h-4 transition-transform ${isExpanded ? 'rotate-180' : ''}`} 
                                    fill="none" 
                                    stroke="currentColor" 
                                    viewBox="0 0 24 24"
                                  >
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                  </svg>
                                </button>
                              </div>
                              
                              <div className="flex items-center gap-4 text-sm">
                                <span className="text-green-400">✓ {entry.successfulBurns}</span>
                                {entry.failedBurns > 0 && (
                                  <span className="text-red-400">❌ {entry.failedBurns}</span>
                                )}
                                <span className="text-gray-400">
                                  {formatDuration(entry.duration)}
                                </span>
                              </div>
                            </div>
                            
                            <div className="text-right">
                              <div className="text-yellow-400 font-medium">
                                ${entry.totalValue.toFixed(2)}
                              </div>
                              <div className="text-xs text-gray-400">
                                {entry.totalItems} items
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Expanded Details */}
                        {isExpanded && entry.results && entry.results.length > 0 && (
                          <div className="border-t border-gray-700 p-4 pt-3">
                            <div className="space-y-2">
                              {entry.results.map((result, index) => {
                                const item = result.item;
                                const isTokenItem = isToken(item.data);
                                const isNFTItem = isNFT(item.data);
                                
                                return (
                                  <div 
                                    key={`${entry.id}-${index}`}
                                    className="flex items-center gap-3 p-2 rounded-lg bg-gray-700/50"
                                  >
                                    {/* Status Icon */}
                                    <div className="flex-shrink-0">
                                      {result.success ? (
                                        <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
                                          <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                          </svg>
                                        </div>
                                      ) : (
                                        <div className="w-6 h-6 bg-red-500 rounded-full flex items-center justify-center">
                                          <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                          </svg>
                                        </div>
                                      )}
                                    </div>

                                    {/* Item Image */}
                                    <div className="flex-shrink-0 w-8 h-8 rounded-lg overflow-hidden bg-gray-600">
                                      {isTokenItem && (() => {
                                        const token = item.data as Token;
                                        return (
                                          <img 
                                            src={token.logo_url || `https://storage.googleapis.com/zapper-fi-assets/tokens/base/${token.contract_address}.png`}
                                            alt={token.contract_ticker_symbol}
                                            className="w-full h-full object-cover"
                                            onError={(e) => {
                                              const target = e.target as HTMLImageElement;
                                              target.style.display = 'none';
                                              target.parentElement!.innerHTML = `<div class="w-full h-full bg-gray-600 flex items-center justify-center text-xs font-bold text-gray-300">${token.contract_ticker_symbol?.charAt(0) || '?'}</div>`;
                                            }}
                                          />
                                        );
                                      })()}
                                      {isNFTItem && (() => {
                                        const nft = item.data as NFT;
                                        return (
                                          <img 
                                            src={nft.image_url || ''}
                                            alt={nft.name || 'NFT'}
                                            className="w-full h-full object-cover"
                                            onError={(e) => {
                                              const target = e.target as HTMLImageElement;
                                              target.style.display = 'none';
                                              target.parentElement!.innerHTML = `<div class="w-full h-full bg-gray-600 flex items-center justify-center text-xs font-bold text-gray-300">NFT</div>`;
                                            }}
                                          />
                                        );
                                      })()}
                                    </div>

                                    {/* Item Details */}
                                    <div className="flex-1 min-w-0">
                                      <div className="text-sm font-medium text-white truncate">
                                        {isTokenItem ? (() => {
                                          const token = item.data as Token;
                                          return `${token.contract_ticker_symbol} - ${parseFloat(token.balance || '0').toLocaleString()}`;
                                        })() : (() => {
                                          const nft = item.data as NFT;
                                          return `${nft.name || 'Unknown NFT'} #${nft.token_id}`;
                                        })()}
                                      </div>
                                      <div className="text-xs text-gray-400 truncate">
                                        {isTokenItem ? (() => {
                                          const token = item.data as Token;
                                          return token.contract_name;
                                        })() : (() => {
                                          const nft = item.data as NFT;
                                          return nft.collection_name || 'NFT Collection';
                                        })()}
                                      </div>
                                    </div>

                                    {/* Transaction Link */}
                                    {result.success && result.txHash && (
                                      <a
                                        href={`https://basescan.org/tx/${result.txHash}`}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="flex-shrink-0 text-blue-400 hover:text-blue-300 transition-colors"
                                        title="View on BaseScan"
                                      >
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                                        </svg>
                                      </a>
                                    )}
                                  </div>
                                );
                              })}
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })
                )}
              </div>
            </>
          )}
        </div>
      </div>
      
      {/* Clear Confirmation Dialog */}
      {showClearConfirmation && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/80">
          <div className="bg-gray-800 rounded-lg border border-gray-600 shadow-xl max-w-md w-full p-6">
            <div className="flex items-center mb-4">
              <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center mr-3">
                <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-white">Clear Burn History</h3>
            </div>
            
            <p className="text-gray-300 mb-6">
              Are you sure you want to clear your burn history?
            </p>
            
            <div className="flex justify-between">
              <button
                onClick={() => setShowClearConfirmation(false)}
                className="px-4 py-2 text-gray-300 hover:text-white border border-gray-600 hover:border-gray-500 rounded transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  clearHistory();
                  setShowClearConfirmation(false);
                }}
                className="px-4 py-2 bg-red-600 hover:bg-red-500 text-white rounded transition-colors"
              >
                Yes, Clear History
              </button>
            </div>
          </div>
        </div>
      )}
    </div>,
    document.body
  );
} 