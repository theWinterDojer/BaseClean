import { useState, useCallback } from 'react';
import Head from 'next/head';
import MainLayout from '@/layout/MainLayout';
import TokenScanner from '@/features/token-scanning/components/TokenScanner';
import StickySelectedTokensBarContainer from '@/shared/components/StickySelectedTokensBarContainer';
import { Token } from '@/types/token';

export default function Home() {
  const [tokens, setTokens] = useState<Token[]>([]);
  const [burnSelectedHandler, setBurnSelectedHandler] = useState<((tokens: Token[]) => void) | null>(null);

  const handleBurnSelected = useCallback((selectedTokensList: Token[]) => {
    if (burnSelectedHandler) {
      burnSelectedHandler(selectedTokensList);
    }
  }, [burnSelectedHandler]);

  const stickyHeaderContent = (
    <StickySelectedTokensBarContainer 
      tokens={tokens}
      onBurnSelected={handleBurnSelected}
    />
  );

  return (
    <>
      <Head>
        <title>BaseClean</title>
        <meta name="description" content="Easily identify and burn spam tokens on Base blockchain" />
      </Head>
      
      <MainLayout stickyHeaderContent={stickyHeaderContent}>
        <div className="max-w-7xl mx-auto">
          <TokenScanner 
            onTokensUpdate={setTokens}
            onBurnHandlerUpdate={setBurnSelectedHandler}
          />
        </div>
      </MainLayout>
    </>
  );
}