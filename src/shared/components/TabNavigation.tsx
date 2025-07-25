import React from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { useSelectedItems } from '@/contexts/SelectedItemsContext';

interface TabNavigationProps {
  className?: string;
}

export default function TabNavigation({ className = '' }: TabNavigationProps) {
  const router = useRouter();
  const { selectedTokensCount, selectedNFTsTotalQuantity } = useSelectedItems();

  // Determine active tab based on current route
  const isTokensActive = router.pathname === '/' || router.pathname === '/tokens';
  const isNFTsActive = router.pathname === '/nfts';

  const tabs = [
    {
      id: 'tokens',
      label: 'Tokens',
      href: '/',
      isActive: isTokensActive,
      count: selectedTokensCount,
    },
    {
      id: 'nfts',
      label: 'NFTs',
      href: '/nfts',
      isActive: isNFTsActive,
      count: selectedNFTsTotalQuantity,
    },
  ];

  return (
    <div className={`w-full ${className}`}>
      <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-lg p-1">
        <div className="flex gap-1">
          {tabs.map((tab) => (
            <Link
              key={tab.id}
              href={tab.href}
              className={`
                flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-md
                text-xs font-medium transition-all duration-200
                ${tab.isActive
                  ? 'bg-[#0052FF] text-white shadow-lg shadow-[#0052FF]/25'
                  : 'text-gray-400 hover:text-white hover:bg-gray-700/50'
                }
              `}
            >
              <span>{tab.label}</span>
              {tab.count > 0 && (
                <span
                  className={`
                    inline-flex items-center justify-center min-w-[16px] h-4 px-1.5 rounded-full
                    text-xs font-bold leading-none
                    ${tab.isActive
                      ? 'bg-white text-[#0052FF]'
                      : 'bg-gray-600 text-white'
                    }
                  `}
                >
                  {tab.count}
                </span>
              )}
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
} 