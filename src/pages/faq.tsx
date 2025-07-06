import Head from 'next/head';
import Link from 'next/link';
import MainLayout from '@/layout/MainLayout';

export default function FAQ() {
  const faqs = [
    {
      category: "🔒 Security & Architecture",
      questions: [
        {
          question: "How does BaseClean's zero-approval architecture work?",
          answer: "BaseClean uses direct transfers where your wallet sends tokens straight to the burn address (0x000...dEaD) without any smart contract intermediaries. Unlike traditional burners that require approve() calls to smart contracts, BaseClean's direct transfer approach eliminates the approval attack surface entirely. Each burn is an independent, transparent on-chain transaction."
        },
        {
          question: "What makes BaseClean safer than approval-based token burners?",
          answer: "Approval-based burners create permanent attack vectors where malicious contracts can drain approved tokens later. BaseClean's direct transfers are atomic operations - once complete, there's zero residual risk. No smart contract holds permissions over your tokens, ever."
        },
        {
          question: "Can I verify what BaseClean is doing on-chain?",
          answer: "Absolutely. Every burn transaction is a standard direct transfer to 0x000000000000000000000000000000000000dEaD. You can verify on BaseScan that BaseClean never calls approve() or interacts with smart contracts - only direct transfers. The entire codebase is open source for audit."
        }
      ]
    },
    {
      category: "🛡️ Spam Detection & Filtering",
      questions: [
        {
          question: "How does BaseClean identify spam tokens?",
          answer: "BaseClean uses a 3-filter system with value-first protection: any token worth more than $0.10 is automatically protected from spam filtering. For lower-value tokens, you can enable: Low/Zero Value filter (dust and worthless tokens), Suspicious Names/Symbols filter (scam keywords and suspicious patterns), and Airdrops/Junk filter (common airdrop amounts like 1337, 88888). ScamSniffer community intelligence provides additional threat detection."
        },
        {
          question: "What is ScamSniffer integration and how does it work?",
          answer: "ScamSniffer provides community-sourced threat intelligence used by Binance, OpenSea, and Phantom. BaseClean integrates their GitHub database via a CORS proxy, checking token addresses against known malicious contracts. Data is cached for 24 hours to optimize performance."
        },
        {
          question: "Can I override the spam filters if I disagree?",
          answer: "Yes. All 3 filters are user-configurable and can be disabled entirely. BaseClean provides warnings and context, but you maintain complete control over which tokens to burn. The system automatically protects legitimate tokens (ETH, USDC, DAI) and any token worth more than $0.10, ensuring valuable assets are never accidentally flagged as spam."
        },
        {
          question: "How accurate is BaseClean's spam detection and price data?",
          answer: "Token prices come from third-party APIs (Alchemy) which can sometimes be delayed, inaccurate, or missing for newer tokens. Always double-check before burning valuable assets via the supplied DEX Screener and OpenSea links available during token selection. The system is designed to err on the side of caution, requiring user confirmation before burning and providing clear warnings for valuable tokens."
        }
      ]
    },
    {
      category: "⚡ Performance & Network",
      questions: [
        {
          question: "Why does BaseClean process burns sequentially instead of batching?",
          answer: "Sequential processing maintains the direct transfer architecture while preventing wallet UI overload. On Base L2, each transaction confirms in ~2-3 seconds with automatic gas estimation. Batching would require smart contracts and approvals, compromising security for marginal time savings."
        },
        {
          question: "What are the gas costs for burning tokens and NFTs?",
          answer: "Zero-approval transfers use automatic gas estimation for optimal efficiency, typically costing under $0.001 per transaction on Base L2. The zero-approval architecture eliminates approve() transaction costs that traditional burners require."
        },
        {
          question: "Does BaseClean support networks other than Base?",
          answer: "Currently Base mainnet for tokens and Base + Zora for NFTs. The architecture is network-agnostic and could expand to other EVM chains. Base L2 was chosen for optimal speed and cost for the core burning use case."
        }
      ]
    },
    {
      category: "📊 Data & Privacy",
      questions: [
        {
          question: "What data does BaseClean store about my wallet?",
          answer: "BaseClean stores burn history and filter preferences locally in your browser's localStorage. No wallet addresses, transaction data, or personal information is sent to external servers. Token metadata is fetched from Alchemy API but not stored permanently."
        },
        {
          question: "How does the burn history feature work?",
          answer: "Burn history is stored locally per wallet address with a 100-entry limit. Data includes transaction hashes, timestamps, gas usage, and burn summaries. You can export this data to CSV format. History persists across browser sessions but remains local only."
        },
        {
          question: "Can I use BaseClean with hardware wallets?",
          answer: "Yes. BaseClean integrates with RainbowKit which supports Ledger, Trezor, and other hardware wallets via MetaMask, Coinbase Wallet, and WalletConnect. Hardware wallet users get the same zero-approval security benefits."
        }
      ]
    },
    {
      category: "🔥 Burning Process",
      questions: [
        {
          question: "What happens to tokens after they're burned?",
          answer: "Burned tokens are transferred to 0x000000000000000000000000000000000000dEaD, a provably unspendable address (no private key exists). This effectively removes tokens from circulation permanently. The burn address is visible on any block explorer."
        },
        {
          question: "Can I recover tokens after burning them?",
          answer: "No. Burning is permanent and irreversible. The burn address has no private key, making recovery cryptographically impossible. BaseClean shows multiple warnings and confirmation dialogs before execution, especially for high-value tokens."
        },
        {
          question: "How does BaseClean handle ERC-1155 tokens with quantities?",
          answer: "BaseClean fully supports ERC-1155 quantity selection. You can burn specific amounts of semi-fungible tokens rather than your entire balance. The interface shows current quantities and allows precise selection before burning."
        },
        {
          question: "What if a burn transaction fails?",
          answer: "Failed burns are clearly indicated in the progress UI with specific error messages. Common causes include insufficient ETH for gas, network congestion, or token contract restrictions. Failed transactions don't charge gas fees and can be retried."
        },
        {
          question: "Why do some tokens and NFTs fail to burn, and how does BaseClean handle failures?",
          answer: "Many spam tokens and NFTs are deliberately designed to be non-transferable to prevent removal from wallets. Common issues include: phantom ownership (assets appear in your wallet but you don't actually own them), transfer restrictions built into contracts, zero balance due to indexing issues, invalid token references, and custom logic that breaks normal ERC standards. BaseClean uses zero-approval direct transfers for maximum safety, avoiding risky custom contract interactions. When burns fail, it's usually because spam creators intentionally disabled transfer functions to keep their assets visible in wallets for advertising. BaseClean prioritizes security over success rate - failed burns mean the system is protecting you from potentially malicious contract interactions."
        }
      ]
    }
  ];

  return (
    <>
      <Head>
        <title>FAQ - BaseClean</title>
        <meta name="description" content="Frequently asked questions about BaseClean's zero-approval token burning architecture, security model, and technical implementation." />
      </Head>
      
      <MainLayout hideNavigation={true}>
        <div className="min-h-screen py-8">
          <div className="max-w-4xl mx-auto">
            <div className="mb-8">
              <Link href="/" className="text-blue-400 hover:text-blue-300 underline">
                ← Back to BaseClean
              </Link>
            </div>

            <div className="text-center mb-12">
              <h1 className="text-4xl font-bold text-white mb-4">
                Frequently Asked Questions
              </h1>

            </div>

            <div className="space-y-12">
              {faqs.map((category, categoryIndex) => (
                <section key={categoryIndex} className="bg-gray-800/50 rounded-lg p-8 border border-gray-700">
                  <h2 className="text-2xl font-bold text-white mb-8">{category.category}</h2>
                  
                  <div className="space-y-8">
                    {category.questions.map((faq, faqIndex) => (
                      <div key={faqIndex} className="border-b border-gray-700 last:border-b-0 pb-6 last:pb-0">
                        <h3 className="text-lg font-semibold text-blue-400 mb-4">
                          {faq.question}
                        </h3>
                        <p className="text-gray-300 leading-relaxed">
                          {faq.answer}
                        </p>
                      </div>
                    ))}
                  </div>
                </section>
              ))}
            </div>

            <div className="mt-16 bg-blue-900/30 border border-blue-700 rounded-lg p-8 text-center">
              <h2 className="text-2xl font-bold text-white mb-4">Need More Technical Details?</h2>
              <p className="text-gray-300 mb-6">
                For comprehensive technical documentation, architecture details, and security implementation, 
                visit our technical documentation.
              </p>
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <a 
                  href="https://github.com/theWinterDojer/BaseClean" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="inline-flex items-center px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white text-sm rounded-lg transition-colors"
                >
                  📖 View Source Code
                </a>
                <a 
                  href="https://github.com/theWinterDojer/BaseClean/tree/master/docs" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="inline-flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white text-sm rounded-lg transition-colors"
                >
                  🔍 Technical Documentation
                </a>
              </div>
            </div>
          </div>
        </div>
      </MainLayout>
    </>
  );
} 