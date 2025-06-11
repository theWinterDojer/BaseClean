import Head from 'next/head';
import MainLayout from '@/layout/MainLayout';
import TokenScanner from '@/features/token-scanning/components/TokenScanner';

interface HomeProps {
  showDisclaimer: boolean;
}

export default function Home({ showDisclaimer }: HomeProps) {
  return (
    <>
      <Head>
        <title>BaseClean</title>
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