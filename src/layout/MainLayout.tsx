import React, { ReactNode } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import HeaderTabNavigation from '@/shared/components/HeaderTabNavigation';
import TabNavigation from '@/shared/components/TabNavigation';
import WalletConnectButton from '@/shared/components/WalletConnectButton';
import BurnHistoryButton from '@/shared/components/BurnHistoryButton';
import { ScamSnifferStatusIndicator } from '@/components/ScamSnifferStatusIndicator';
import TipButton from '@/shared/components/TipButton';

interface MainLayoutProps {
  children: ReactNode;
  stickyHeaderContent?: ReactNode;
  hideNavigation?: boolean;
}

export default function MainLayout({ children, stickyHeaderContent, hideNavigation = false }: MainLayoutProps) {
  // Scroll to top function
  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-gray-950 text-white flex flex-col">
      <header className="bg-gray-800/80 backdrop-blur-sm border-b border-gray-700 py-4 md:py-6 md:sticky md:top-0 z-10">
        <div className="container mx-auto px-4 relative">
          {/* Mobile Layout: Two Rows */}
          <div className="flex flex-col md:hidden">
            {/* Row 1: Logo and Slogan (Mobile) */}
            <Link href="/" className="flex items-center gap-4 mb-4">
              <div className="relative flex-shrink-0 overflow-hidden rounded-full">
                <Image 
                  src="/BaseCleanlogo.png" 
                  alt="BaseClean Logo" 
                  width={72}
                  height={72}
                  className="w-16 h-16"
                />
              </div>
              <div>
                <h1 className="text-2xl font-extrabold text-white flex items-center tracking-tight leading-none">
                  <span className="text-[#0052FF] drop-shadow-sm">Base</span>
                  <span className="relative">
                    <span className="bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">Clean</span>
                    <span className="absolute -bottom-1 left-0 w-full h-0.5 bg-gradient-to-r from-[#0052FF] to-transparent rounded"></span>
                  </span>
                </h1>
                <p className="text-sm text-gray-400 mt-1.5">Clean your wallet. Strengthen your Base.</p>
              </div>
            </Link>
            
            {/* Row 2: Wallet Controls (Mobile) */}
            <div className="flex items-center justify-center gap-3">
              <WalletConnectButton />
              <BurnHistoryButton />
            </div>
          </div>

          {/* Desktop Layout: Original Two Columns */}
          <div className="hidden md:flex items-center justify-between">
            <Link href="/" className="flex items-center gap-4">
              <div className="relative flex-shrink-0 overflow-hidden rounded-full">
                <Image 
                  src="/BaseCleanlogo.png" 
                  alt="BaseClean Logo" 
                  width={72}
                  height={72}
                  className="w-18 h-18"
                />
              </div>
              <div>
                <h1 className="text-3xl font-extrabold text-white flex items-center tracking-tight leading-none">
                  <span className="text-[#0052FF] drop-shadow-sm">Base</span>
                  <span className="relative">
                    <span className="bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">Clean</span>
                    <span className="absolute -bottom-1 left-0 w-full h-0.5 bg-gradient-to-r from-[#0052FF] to-transparent rounded"></span>
                  </span>
                </h1>
                <p className="text-sm text-gray-400 mt-1.5">Clean your wallet. Strengthen your Base.</p>
              </div>
            </Link>
            
            <div className="flex items-center gap-4">
              <WalletConnectButton />
              <BurnHistoryButton />
            </div>
          </div>
          
          {/* Tab Navigation in Header - Absolutely Centered */}
          {!hideNavigation && (
            <div className="hidden md:flex absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
              <HeaderTabNavigation />
            </div>
          )}
        </div>
        
        {/* Mobile Tab Navigation */}
        {!hideNavigation && (
          <div className="md:hidden mt-4">
            <TabNavigation />
          </div>
        )}
        
        {/* Sticky header content for announcements, etc. */}
        {stickyHeaderContent && (
          <div className="border-t border-gray-700 mt-4 pt-4">
            {stickyHeaderContent}
          </div>
        )}
      </header>
      
      <main className="container mx-auto px-4 py-2 md:py-4 flex-1">
        {children}
      </main>
      
      {/* Footer */}
      <footer className="bg-gray-900/80 backdrop-blur-sm border-t border-gray-700 py-6 md:py-8 mt-auto">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 md:gap-8 items-center">
            {/* Column 1 - BaseClean Logo/Copyright */}
            <div className="flex flex-col items-center md:items-start gap-2">
              <div className="flex items-center gap-3">
                <button 
                  onClick={scrollToTop}
                  className="overflow-hidden rounded-full cursor-pointer hover:scale-105 transition-transform duration-200 focus:outline-none"
                  aria-label="Scroll to top"
                  title="Click to scroll to top"
                >
                  <Image 
                    src="/BaseCleanlogo.png" 
                    alt="BaseClean Logo" 
                    width={64}
                    height={64}
                    className="w-16 h-16"
                  />
                </button>
                <span className="text-sm text-gray-400">© 2025 BaseClean</span>
              </div>
            </div>
            
            {/* Column 2 - ScamSniffer Info */}
            <div className="flex flex-col items-center gap-1">
              <div className="text-xs text-gray-400 text-center">
                Enhanced by <Link href="https://x.com/realScamSniffer" target="_blank" rel="noopener noreferrer" className="text-gray-300 hover:text-white transition-colors">Scam Sniffer</Link> community intelligence 👃
              </div>
              <div className="text-xs text-gray-400 flex justify-center">
                <ScamSnifferStatusIndicator />
              </div>
            </div>
            
            {/* Column 3 - Tip Section */}
            <div className="flex flex-col items-center gap-2">
              <TipButton address="0x92e40F4A6ceb168de63f8b6A06984083065AFD14" />
            </div>
            
            {/* Column 4 - Website Links */}
            <div className="flex flex-row justify-center md:justify-end gap-4 sm:gap-6 md:gap-8">
              {/* Resources Section */}
              <div className="flex flex-col gap-2">
                <h4 className="text-sm font-medium text-white mb-1">Resources</h4>
                <Link href="/faq" className="text-xs text-gray-400 hover:text-white transition-colors">
                  FAQ
                </Link>
                <Link href="https://relay.link/bridge/base?fromChainId=1&fromCurrency=0x0000000000000000000000000000000000000000&toCurrency=0x0000000000000000000000000000000000000000" target="_blank" rel="noopener noreferrer" className="text-xs text-gray-400 hover:text-white transition-colors">
                  Base Bridge
                </Link>
              </div>
              
              {/* Community Section */}
              <div className="flex flex-col gap-2">
                <h4 className="text-sm font-medium text-white mb-1">Community</h4>
                <Link href="https://x.com/Base_Clean" target="_blank" rel="noopener noreferrer" className="text-xs text-gray-400 hover:text-white transition-colors">
                  Twitter
                </Link>
                <Link href="https://github.com/theWinterDojer/BaseClean" target="_blank" rel="noopener noreferrer" className="text-xs text-gray-400 hover:text-white transition-colors">
                  GitHub
                </Link>
              </div>
              
              {/* About Section */}
              <div className="flex flex-col gap-2">
                <h4 className="text-sm font-medium text-white mb-1">About</h4>
                <Link href="/terms-of-service" className="text-xs text-gray-400 hover:text-white transition-colors">
                  Terms of Service
                </Link>
                <Link href="/privacy-policy" className="text-xs text-gray-400 hover:text-white transition-colors">
                  Privacy Policy
                </Link>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
} 