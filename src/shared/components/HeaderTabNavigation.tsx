import React from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { useSelectedItems } from '@/contexts/SelectedItemsContext';

export default function HeaderTabNavigation() {
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
    <div className="flex items-center justify-center gap-8">
      {tabs.map((tab) => (
        <Link
          key={tab.id}
          href={tab.href}
          className={`
            relative flex items-center gap-2.5 px-4 py-2.5
            text-xl font-medium transition-all duration-300 ease-out
            cursor-pointer group
            ${tab.isActive
              ? 'text-white shadow-sm'
              : 'text-gray-400 hover:text-gray-100'
            }
          `}
        >
          <span className="relative font-semibold">
            {tab.label}
            {/* Enhanced glow effect for active tab */}
            {tab.isActive && (
              <>
                <div className="absolute inset-0 text-[#0052FF] blur-sm opacity-30">
                  {tab.label}
                </div>
                <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 w-full h-0.5 bg-gradient-to-r from-[#0052FF] to-blue-400 rounded opacity-90"></div>
              </>
            )}
            {/* Subtle hover glow effect for inactive tabs */}
            {!tab.isActive && (
              <div className="absolute inset-0 text-gray-200 blur-sm opacity-0 group-hover:opacity-15 transition-opacity duration-300">
                {tab.label}
              </div>
            )}
          </span>
          
          {tab.count > 0 && (
            <span
              className={`
                inline-flex items-center justify-center min-w-[20px] h-[20px] px-2 
                rounded-full text-xs font-semibold leading-none transition-all duration-300
                ${tab.isActive
                  ? 'bg-[#0052FF] text-white shadow-md ring-1 ring-[#0052FF]/30'
                  : 'bg-gray-700 text-gray-300 group-hover:bg-gray-600 group-hover:text-white'
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