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
    <div className="flex items-end pb-2 pt-4">
      {tabs.map((tab, index) => (
        <Link
          key={tab.id}
          href={tab.href}
          className={`
            relative flex items-center gap-3 px-6 py-3.5
            text-xl font-bold transition-all duration-300 ease-out
            tracking-wider cursor-pointer group
            ${tab.isActive
              ? 'text-white shadow-sm transform scale-105'
              : 'text-gray-400 hover:text-gray-100 hover:scale-102'
            }
            ${index > 0 ? 'ml-6' : ''}
          `}
        >
          <span className="relative font-extrabold">
            {tab.label}
            {/* Enhanced glow effect for active tab */}
            {tab.isActive && (
              <>
                <div className="absolute inset-0 text-[#0052FF] blur-sm opacity-40">
                  {tab.label}
                </div>
                <div className="absolute -bottom-3 left-1/2 transform -translate-x-1/2 w-full h-1 bg-gradient-to-r from-[#0052FF] to-blue-400 rounded opacity-90 shadow-lg"></div>
              </>
            )}
            {/* Subtle hover glow effect for inactive tabs */}
            {!tab.isActive && (
              <div className="absolute inset-0 text-gray-200 blur-sm opacity-0 group-hover:opacity-20 transition-opacity duration-300">
                {tab.label}
              </div>
            )}
          </span>
          
          {tab.count > 0 && (
            <span
              className={`
                inline-flex items-center justify-center min-w-[22px] h-[22px] px-2.5 
                rounded-full text-xs font-extrabold leading-none transition-all duration-300
                ${tab.isActive
                  ? 'bg-[#0052FF] text-white shadow-lg scale-110 ring-2 ring-[#0052FF]/30'
                  : 'bg-gray-700 text-gray-300 group-hover:bg-gray-600 group-hover:text-white group-hover:scale-105'
                }
              `}
              suppressHydrationWarning
            >
              {tab.count}
            </span>
          )}
        </Link>
      ))}
    </div>
  );
} 