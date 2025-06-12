import React, { ReactNode } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import HeaderTabNavigation from '@/shared/components/HeaderTabNavigation';
import TabNavigation from '@/shared/components/TabNavigation';
import WalletConnectButton from '@/shared/components/WalletConnectButton';
import { SelectedItemsProvider } from '@/contexts/SelectedItemsContext';

interface MainLayoutProps {
  children: ReactNode;
  stickyHeaderContent?: ReactNode;
}

export default function MainLayout({ children, stickyHeaderContent }: MainLayoutProps) {
  return (
    <SelectedItemsProvider>
      <div className="min-h-screen bg-gradient-to-b from-gray-900 to-gray-950 text-white">
        <header className="bg-gray-800/80 backdrop-blur-sm border-b border-gray-700 py-4 sticky top-0 z-10">
          <div className="container mx-auto px-4 flex items-center justify-between">
            <Link href="/" className="flex items-center gap-4">
              <div className="relative flex-shrink-0 overflow-hidden rounded-full">
                <Image 
                  src="/BaseCleanlogo.png" 
                  alt="BaseClean Logo" 
                  width={56}
                  height={56}
                  className="w-12 h-12 sm:w-14 sm:h-14"
                />
              </div>
              <div>
                <h1 className="text-2xl md:text-3xl font-extrabold text-white flex items-center tracking-tight leading-none">
                  <span className="text-[#0052FF] drop-shadow-sm">Base</span>
                  <span className="relative">
                    <span className="bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">Clean</span>
                    <span className="absolute -bottom-1 left-0 w-full h-0.5 bg-gradient-to-r from-[#0052FF] to-transparent rounded"></span>
                  </span>
                </h1>
                <p className="text-sm text-gray-400 mt-1.5">Clean your wallet. Strengthen your Base.</p>
              </div>
            </Link>
            
            {/* Tab Navigation in Header - Centered */}
            <div className="hidden md:flex flex-1 justify-center">
              <HeaderTabNavigation />
            </div>
            
            <div className="flex items-center gap-4">
              <WalletConnectButton />
            </div>
          </div>
          
          {/* Mobile Tab Navigation */}
          <div className="md:hidden mt-4">
            <TabNavigation />
          </div>
          
          {/* Sticky header content for announcements, etc. */}
          {stickyHeaderContent && (
            <div className="border-t border-gray-700 mt-4 pt-4">
              {stickyHeaderContent}
            </div>
          )}
        </header>
        
        <main className="container mx-auto px-4 py-8">
          {children}
        </main>
      </div>
    </SelectedItemsProvider>
  );
} 