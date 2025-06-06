import React from 'react';
import Image from 'next/image';
import WalletConnectButton from '@/shared/components/WalletConnectButton';
import HeaderTabNavigation from '@/shared/components/HeaderTabNavigation';
import Link from 'next/link';
import { SelectedItemsProvider } from '@/contexts/SelectedItemsContext';
import { ScamSnifferStatusIndicator } from '@/components/ScamSnifferStatusIndicator';

type MainLayoutProps = {
  children: React.ReactNode;
  stickyHeaderContent?: React.ReactNode;
};

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
          <div className="md:hidden border-t border-gray-700/50 bg-gray-800/60">
            <div className="container mx-auto px-4 flex justify-center py-2">
              <HeaderTabNavigation />
            </div>
          </div>
        </header>
        
        {/* Sticky Selected Items Bar - positioned between header and content */}
        {stickyHeaderContent}
        
        <main className="max-w-7xl mx-auto px-6 py-8">
          {children}
        </main>
        
        <footer className="mt-auto py-8 border-t border-gray-800 bg-gray-900/50">
          <div className="container mx-auto px-4">
            <div className="flex flex-col md:flex-row justify-between items-center gap-6">
              <div className="flex flex-col items-center md:items-start">
                <div className="mb-3 overflow-hidden rounded-full">
                  <Image 
                    src="/BaseCleanlogo.png" 
                    alt="BaseClean Logo" 
                    width={64}
                    height={64}
                    className="w-16 h-16"
                  />
                </div>
                <div className="text-sm text-gray-400">
                  &copy; {new Date().getFullYear()} BaseClean
                </div>
              </div>
              
              {/* ScamSniffer Attribution - Center */}
              <div className="flex flex-col items-center gap-2">
                <div className="flex items-center gap-2 text-xs text-gray-500">
                  <span>Enhanced by</span>
                  <a 
                    href="https://x.com/realScamSniffer" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="flex items-center gap-1 text-gray-400 hover:text-green-400 transition-colors"
                  >
                    <span className="text-sm">👃</span>
                    <span className="font-medium">ScamSniffer</span>
                  </a>
                  <span>community intelligence</span>
                </div>
                <ScamSnifferStatusIndicator />
              </div>
              
              <div className="grid grid-cols-3 gap-8">
                <div className="flex flex-col items-center md:items-start">
                  <h3 className="text-sm font-semibold text-gray-300 mb-2">Resources</h3>
                  <div className="flex flex-col space-y-2">
                    <a href="https://docs.base.org" target="_blank" rel="noopener noreferrer" className="text-xs text-gray-400 hover:text-green-400 transition-colors">
                      Base Docs
                    </a>
                    <a href="https://bridge.base.org" target="_blank" rel="noopener noreferrer" className="text-xs text-gray-400 hover:text-green-400 transition-colors">
                      Base Bridge
                    </a>
                  </div>
                </div>
                
                <div className="flex flex-col items-center md:items-start">
                  <h3 className="text-sm font-semibold text-gray-300 mb-2">Community</h3>
                  <div className="flex flex-col space-y-2">
                    <a href="https://x.com/Base_Clean" target="_blank" rel="noopener noreferrer" className="text-xs text-gray-400 hover:text-green-400 transition-colors">
                      Twitter
                    </a>
                  </div>
                </div>
                
                <div className="flex flex-col items-center md:items-start">
                  <h3 className="text-sm font-semibold text-gray-300 mb-2">About</h3>
                  <div className="flex flex-col space-y-2">
                    <a href="https://github.com/theWinterDojer/BaseClean" target="_blank" rel="noopener noreferrer" className="text-xs text-gray-400 hover:text-green-400 transition-colors">
                      GitHub
                    </a>
                    <Link href="/terms-of-service" className="text-xs text-gray-400 hover:text-green-400 transition-colors">
                      Terms of Service
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </footer>
      </div>
    </SelectedItemsProvider>
  );
} 