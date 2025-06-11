import Head from 'next/head';
import MainLayout from '@/layout/MainLayout';
import NFTScanner from '@/features/nft-scanning/components/NFTScanner';

interface NFTsPageProps {
  showDisclaimer: boolean;
}

export default function NFTsPage({ showDisclaimer }: NFTsPageProps) {
  return (
    <>
      <Head>
        <title>BaseClean - NFTs</title>
        <meta name="description" content="Identify and burn spam NFTs on Base blockchain" />
      </Head>
      
      <MainLayout>
        <div className="max-w-7xl mx-auto">
          <NFTScanner showDisclaimer={showDisclaimer} />
        </div>
      </MainLayout>
    </>
  );
} 