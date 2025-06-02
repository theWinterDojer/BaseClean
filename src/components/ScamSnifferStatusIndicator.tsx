import React, { useState, useEffect } from 'react';
import { getScamSnifferCacheStats, isScamSnifferFlagged } from '@/lib/scamSniffer';

export function ScamSnifferStatusIndicator() {
  const [isOperational, setIsOperational] = useState<boolean | null>(null);
  const [cacheSize, setCacheSize] = useState(0);

  useEffect(() => {
    checkStatus();
  }, []);

  const checkStatus = async () => {
    try {
      // Check API status and trigger cache initialization
      const response = await fetch('/api/scamsniffer');
      const apiWorking = response.ok;
      
      if (apiWorking) {
        // Trigger cache initialization by checking a dummy address
        // This will populate the cache if it's empty
        await isScamSnifferFlagged('0x0000000000000000000000000000000000000000');
        
        // Now check cache status
        const cacheStats = getScamSnifferCacheStats();
        const hasData = cacheStats.size > 0;
        
        setIsOperational(hasData);
        setCacheSize(cacheStats.size);
      } else {
        setIsOperational(false);
        setCacheSize(0);
      }
    } catch (error) {
      console.debug('ScamSniffer status check failed:', error);
      setIsOperational(false);
      setCacheSize(0);
    }
  };

  const getStatusIcon = () => {
    if (isOperational === null) return '⏳'; // Loading
    return isOperational ? '🟢' : '🔴'; // Green dot for operational, red for issues
  };

  const getStatusText = () => {
    if (isOperational === null) return 'checking...';
    if (isOperational) return `monitoring ${cacheSize.toLocaleString()} threats`;
    return 'offline';
  };

  const getStatusColor = () => {
    if (isOperational === null) return 'text-gray-400';
    return isOperational ? 'text-green-400' : 'text-red-400';
  };

  return (
    <div className="flex items-center gap-1 text-xs">
      <span className="text-xs">{getStatusIcon()}</span>
      <span className={getStatusColor()}>
        {getStatusText()}
      </span>
    </div>
  );
} 