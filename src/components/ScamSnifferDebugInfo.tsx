import React, { useState, useEffect } from 'react';
import { getScamSnifferCacheStats, refreshScamSnifferCache } from '@/lib/scamSniffer';

interface ScamSnifferDebugInfoProps {
  tokenCount?: number;
  flaggedCount?: number;
}

export function ScamSnifferDebugInfo({ tokenCount = 0, flaggedCount = 0 }: ScamSnifferDebugInfoProps) {
  const [cacheStats, setCacheStats] = useState(getScamSnifferCacheStats());
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [apiStatus, setApiStatus] = useState<'checking' | 'ok' | 'error'>('checking');

  useEffect(() => {
    // Check API status on mount
    checkApiStatus();
  }, []);

  const checkApiStatus = async () => {
    try {
      const response = await fetch('/api/scamsniffer');
      if (response.ok) {
        const data = await response.json();
        setApiStatus('ok');
        console.log('ScamSniffer API Status:', data);
      } else {
        setApiStatus('error');
        console.error('ScamSniffer API Error:', response.status);
      }
    } catch (error) {
      setApiStatus('error');
      console.error('ScamSniffer API Check Failed:', error);
    }
  };

  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      await refreshScamSnifferCache();
      setCacheStats(getScamSnifferCacheStats());
      await checkApiStatus(); // Recheck API status
    } catch (error) {
      console.error('Failed to refresh ScamSniffer cache:', error);
    } finally {
      setIsRefreshing(false);
    }
  };

  const getCacheAgeString = () => {
    if (cacheStats.cacheAge === 0) return 'Not initialized';
    const ageMinutes = Math.floor(cacheStats.cacheAge / (1000 * 60));
    const ageHours = Math.floor(ageMinutes / 60);
    
    if (ageHours > 0) {
      return `${ageHours}h ${ageMinutes % 60}m ago`;
    }
    return `${ageMinutes}m ago`;
  };

  const getStatusIcon = () => {
    switch (apiStatus) {
      case 'ok': return '✅';
      case 'error': return '❌';
      default: return '⏳';
    }
  };

  return (
    <div className="bg-gray-800/50 border border-gray-700 rounded-lg p-4 text-sm">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-gray-300 font-medium flex items-center gap-2">
          <span className="text-lg">👃</span>
          ScamSniffer Status
        </h3>
        <button
          onClick={handleRefresh}
          disabled={isRefreshing}
          className="px-3 py-1 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 rounded text-xs transition-colors"
        >
          {isRefreshing ? 'Refreshing...' : 'Refresh'}
        </button>
      </div>
      
      <div className="grid grid-cols-2 gap-4 text-xs">
        <div className="space-y-2">
          <div className="flex justify-between">
            <span className="text-gray-400">API Status:</span>
            <span className="flex items-center gap-1">
              {getStatusIcon()}
              {apiStatus}
            </span>
          </div>
          
          <div className="flex justify-between">
            <span className="text-gray-400">Blacklist Size:</span>
            <span className="text-green-400">{cacheStats.size.toLocaleString()}</span>
          </div>
          
          <div className="flex justify-between">
            <span className="text-gray-400">Cache Age:</span>
            <span className="text-blue-400">{getCacheAgeString()}</span>
          </div>
        </div>
        
        <div className="space-y-2">
          <div className="flex justify-between">
            <span className="text-gray-400">Tokens Checked:</span>
            <span className="text-gray-300">{tokenCount}</span>
          </div>
          
          <div className="flex justify-between">
            <span className="text-gray-400">Flagged Tokens:</span>
            <span className={flaggedCount > 0 ? 'text-orange-400' : 'text-green-400'}>
              {flaggedCount}
            </span>
          </div>
          
          <div className="flex justify-between">
            <span className="text-gray-400">Detection Rate:</span>
            <span className="text-gray-300">
              {tokenCount > 0 ? `${((flaggedCount / tokenCount) * 100).toFixed(1)}%` : '0%'}
            </span>
          </div>
        </div>
      </div>
      
      {apiStatus === 'error' && (
        <div className="mt-3 p-2 bg-red-900/30 border border-red-800 rounded text-xs text-red-300">
          ⚠️ ScamSniffer API is not accessible. Check browser console for details.
        </div>
      )}
      
      {cacheStats.size === 0 && (
        <div className="mt-3 p-2 bg-yellow-900/30 border border-yellow-800 rounded text-xs text-yellow-300">
          ⚠️ No blacklist data loaded. This could indicate API issues.
        </div>
      )}
    </div>
  );
} 