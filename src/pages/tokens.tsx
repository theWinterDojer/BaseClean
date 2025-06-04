import Head from 'next/head';
import MainLayout from '@/layout/MainLayout';
import TokenScanner from '@/features/token-scanning/components/TokenScanner';

export default function TokensPage() {
  return (
    <>
      <Head>
        <title>BaseClean - Tokens</title>
        <meta name="description" content="Easily identify and burn spam tokens on Base blockchain" />
      </Head>
      
      <MainLayout>
        <div className="max-w-7xl mx-auto">
          <TokenScanner />
        </div>
      </MainLayout>
    </>
  );
} 