import React, { useState } from 'react';
import { useAccount } from 'wagmi';
import { useBurnHistory } from '@/hooks/useBurnHistory';
import BurnHistoryModal from './BurnHistoryModal';

export default function BurnHistoryButton() {
  const { isConnected } = useAccount();
  const { hasHistory, getHistoryStats } = useBurnHistory();
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Don't render if wallet not connected
  if (!isConnected) return null;

  const stats = getHistoryStats();
  const hasAnyHistory = hasHistory && stats.totalBurns > 0;

  return (
    <>
      <button
        onClick={() => setIsModalOpen(true)}
        className={`
          relative px-3 py-2 rounded-lg transition-all duration-200 flex items-center justify-center
          ${hasAnyHistory 
            ? 'bg-gray-800 hover:bg-gray-700 border border-gray-600 text-gray-200 hover:text-white' 
            : 'bg-gray-800/50 border border-gray-700 text-gray-400 hover:text-gray-300'
          }
        `}
        title={hasAnyHistory ? `View burn history (${stats.totalBurns} burns)` : 'No burn history yet'}
      >
        {/* History Icon */}
        <svg 
          className="w-5 h-5" 
          fill="none" 
          stroke="currentColor" 
          viewBox="0 0 24 24"
        >
          <path 
            strokeLinecap="round" 
            strokeLinejoin="round" 
            strokeWidth={2} 
            d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" 
          />
        </svg>
        

        
        {/* Activity Indicator */}
        {hasAnyHistory && (
          <div className="absolute -top-1 -right-1 w-3 h-3 bg-blue-500 rounded-full border-2 border-gray-800">
            <div className="w-full h-full bg-blue-400 rounded-full animate-pulse"></div>
          </div>
        )}
      </button>

      {/* History Modal */}
      <BurnHistoryModal 
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />
    </>
  );
} 