import Head from 'next/head';
import MainLayout from '@/layout/MainLayout';
import TokenScanner from '@/features/token-scanning/components/TokenScanner';

interface TokensPageProps {
  showDisclaimer: boolean;
}

export default function TokensPage({ showDisclaimer }: TokensPageProps) {
  return (
    <>
      <Head>
        <title>BaseClean - Tokens</title>
        <meta name="description" content="Easily identify and burn spam tokens on Base blockchain" />
      </Head>
      
      <MainLayout>
        <div className="max-w-7xl mx-auto">
          <TokenScanner showDisclaimer={showDisclaimer} />
        </div>
      </MainLayout>
    </>
  );
} 