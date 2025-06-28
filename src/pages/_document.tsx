import { Html, Head, Main, NextScript } from "next/document";
import Document, { DocumentContext } from "next/document";

class MyDocument extends Document {
  static async getInitialProps(ctx: DocumentContext) {
    const initialProps = await Document.getInitialProps(ctx);
    return { ...initialProps };
  }

  render() {
    return (
      <Html lang="en">
        <Head>
          {/* Favicon Configuration - 512x512 optimized */}
          <link rel="icon" type="image/png" sizes="32x32" href="/favicon.png" />
          <link rel="icon" type="image/png" sizes="16x16" href="/favicon.png" />
          <link rel="shortcut icon" href="/favicon.png" />
          <link rel="apple-touch-icon" sizes="180x180" href="/favicon.png" />
          <link rel="apple-touch-icon" sizes="152x152" href="/favicon.png" />
          <link rel="apple-touch-icon" sizes="120x120" href="/favicon.png" />
          <link rel="apple-touch-icon" sizes="76x76" href="/favicon.png" />
          <meta name="theme-color" content="#0052FF" />
          <meta name="msapplication-TileColor" content="#0052FF" />
          <meta name="msapplication-square150x150logo" content="/favicon.png" />
          <meta name="msapplication-config" content="none" />
        </Head>
        <body className="bg-gray-900 text-white">
          <Main />
          <NextScript />
        </body>
      </Html>
    );
  }
}

export default MyDocument;
