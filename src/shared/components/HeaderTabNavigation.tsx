import React from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { useSelectedItems } from '@/contexts/SelectedItemsContext';

export default function HeaderTabNavigation() {
  const router = useRouter();
  const { selectedTokensCount, selectedNFTsCount } = useSelectedItems();

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
      count: selectedNFTsCount,
    },
  ];

  return (
    <div className="flex items-end pb-1">
      {tabs.map((tab, index) => (
        <Link
          key={tab.id}
          href={tab.href}
          className={`
            relative flex items-center gap-2.5 px-5 py-3
            text-base font-semibold transition-all duration-300
            border-b-2 tracking-wide
            ${tab.isActive
              ? 'text-white border-[#0052FF]'
              : 'text-gray-400 border-transparent hover:text-gray-200 hover:border-gray-600'
            }
            ${index > 0 ? 'ml-8' : ''}
          `}
        >
          <span className="relative">
            {tab.label}
            {/* Subtle glow effect for active tab */}
            {tab.isActive && (
              <div className="absolute inset-0 text-[#0052FF] blur-sm opacity-30">
                {tab.label}
              </div>
            )}
          </span>
          
          {tab.count > 0 && (
            <span
              className={`
                inline-flex items-center justify-center min-w-[20px] h-[20px] px-2 
                rounded-full text-xs font-bold leading-none
                ${tab.isActive
                  ? 'bg-[#0052FF] text-white'
                  : 'bg-gray-700 text-gray-300'
                }
              `}
            >
              {tab.count}
            </span>
          )}
        </Link>
      ))}
    </div>
  );
} 