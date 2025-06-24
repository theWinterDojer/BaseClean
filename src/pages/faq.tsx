import Head from 'next/head';
import MainLayout from '@/layout/MainLayout';

export default function FAQ() {
  const faqs = [
    {
      category: "🔒 Security & Architecture",
      questions: [
        {
          question: "How does BaseClean&apos;s zero-approval architecture work?",
          answer: "BaseClean uses direct ERC-20 transfer() and ERC-721/1155 transferFrom() calls to send tokens directly to the burn address (0x000...dEaD). Unlike traditional burners that require approve() calls to smart contracts, BaseClean eliminates the approval attack surface entirely. Each burn is an independent, transparent on-chain transaction."
        },
        {
          question: "What makes BaseClean safer than approval-based token burners?",
          answer: "Approval-based burners create permanent attack vectors where malicious contracts can drain approved tokens later. BaseClean&apos;s direct transfers are atomic operations - once complete, there&apos;s zero residual risk. No smart contract holds permissions over your tokens, ever."
        },
        {
          question: "Can I verify what BaseClean is doing on-chain?",
          answer: "Absolutely. Every burn transaction is a standard ERC-20/721/1155 transfer to 0x000000000000000000000000000000000000dEaD. You can verify on BaseScan that BaseClean never calls approve(), only transfer functions. The entire codebase is open source for audit."
        }
      ]
    },
    {
      category: "🛡️ Spam Detection & Filtering",
      questions: [
        {
          question: "How does BaseClean identify spam tokens?",
          answer: "BaseClean uses a multi-layer system: value analysis (tokens <$0.50), pattern recognition (67+ spam keywords, 15 regex patterns), airdrop detection (70+ common amounts like 1337, 88888), and ScamSniffer community intelligence. Multiple signals are required to flag tokens, minimizing false positives."
        },
        {
          question: "What is ScamSniffer integration and how does it work?",
          answer: "ScamSniffer provides community-sourced threat intelligence used by Binance, OpenSea, and Phantom. BaseClean integrates their GitHub database via a CORS proxy, checking token addresses against known malicious contracts. Data is cached for 24 hours to optimize performance."
        },
        {
          question: "Can I override the spam filters if I disagree?",
          answer: "Yes. All filters are user-configurable and can be disabled entirely. BaseClean provides warnings and context, but you maintain complete control over which tokens to burn. The system protects legitimate tokens (ETH, USDC, DAI) and high-value assets automatically."
        }
      ]
    },
    {
      category: "⚡ Performance & Network",
      questions: [
        {
          question: "Why does BaseClean process burns sequentially instead of batching?",
          answer: "Sequential processing maintains the zero-approval architecture while preventing wallet UI overload. On Base L2, each transaction confirms in ~2-3 seconds with ~150k gas. Batching would require smart contracts and approvals, compromising security for marginal time savings."
        },
        {
          question: "What are the gas costs for burning tokens and NFTs?",
          answer: "Direct transfers use approximately 150k gas per ERC-20 token and 200k gas per NFT. On Base L2, this typically costs under $0.001 per transaction. The zero-approval architecture eliminates approve() transaction costs that traditional burners require."
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
          answer: "BaseClean stores burn history and filter preferences locally in your browser&apos;s localStorage. No wallet addresses, transaction data, or personal information is sent to external servers. Token metadata is fetched from Alchemy API but not stored permanently."
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
          answer: "Failed burns are clearly indicated in the progress UI with specific error messages. Common causes include insufficient ETH for gas, network congestion, or token contract restrictions. Failed transactions don&apos;t charge gas fees and can be retried."
        }
      ]
    }
  ];

  return (
    <>
      <Head>
        <title>FAQ - BaseClean</title>
        <meta name="description" content="Frequently asked questions about BaseClean&apos;s zero-approval token burning architecture, security model, and technical implementation." />
      </Head>
      
      <MainLayout>
        <div className="min-h-screen py-8">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-12">
              <h1 className="text-4xl font-bold text-white mb-4">
                Frequently Asked Questions
              </h1>
              <p className="text-xl text-gray-300 max-w-3xl mx-auto">
                Technical answers for blockchain-savvy users about BaseClean&apos;s zero-approval architecture, 
                security model, and advanced features.
              </p>
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
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <a 
                  href="https://github.com/theWinterDojer/BaseClean" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="inline-flex items-center px-6 py-3 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors"
                >
                  📖 View Source Code
                </a>
                <a 
                  href="https://github.com/theWinterDojer/BaseClean/tree/master/docs" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="inline-flex items-center px-6 py-3 bg-blue-600 hover:bg-blue-500 text-white rounded-lg transition-colors"
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