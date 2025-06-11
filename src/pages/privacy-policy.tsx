import Head from 'next/head';
import Link from 'next/link';

export default function PrivacyPolicy() {
  return (
    <>
      <Head>
        <title>Privacy Policy - BaseClean</title>
        <meta name="description" content="BaseClean Privacy Policy - How we handle your data and protect your privacy" />
        <meta name="robots" content="noindex, nofollow" />
      </Head>
      
      <div className="min-h-screen bg-gray-950 text-white">
        <div className="max-w-4xl mx-auto py-12 px-6">
          <div className="mb-8">
            <Link href="/" className="text-blue-400 hover:text-blue-300 underline">
              ← Back to BaseClean
            </Link>
          </div>

          <h1 className="text-4xl font-bold mb-8">Privacy Policy</h1>
          
          <div className="prose prose-invert max-w-none">
            <p className="text-lg mb-8 text-gray-300">
              Last Updated: {new Date().toLocaleDateString()}
            </p>

            <div className="mt-8 mb-12 p-6 bg-blue-900/30 border border-blue-700 rounded-lg">
              <h3 className="text-xl font-bold mb-4 text-blue-300">🔒 Privacy Summary</h3>
              <p className="font-medium">
                BaseClean is designed with privacy in mind. We collect minimal data necessary for functionality, 
                use browser storage for performance, and interact with blockchain APIs. We do not sell personal data 
                or track users for advertising. Your wallet interactions are public on the blockchain by design.
              </p>
            </div>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold mb-4">1. Information We Collect</h2>
              
              <div className="space-y-4">
                <h3 className="text-xl font-medium text-blue-300">1.1 Blockchain Data</h3>
                <ul className="list-disc pl-6 space-y-2">
                  <li><strong>Wallet Addresses:</strong> Your public wallet address when you connect to BaseClean</li>
                  <li><strong>Transaction Data:</strong> Public blockchain transactions you initiate through our service</li>
                  <li><strong>Token Holdings:</strong> Token and NFT balances associated with your connected wallet</li>
                  <li><strong>Network Information:</strong> Which blockchain networks you interact with (Base, Zora)</li>
                </ul>

                <h3 className="text-xl font-medium text-blue-300">1.2 Browser Data</h3>
                <ul className="list-disc pl-6 space-y-2">
                  <li><strong>Local Storage:</strong> Token logo cache, user preferences, and filter settings</li>
                  <li><strong>Session Data:</strong> Temporary data for current browsing session</li>
                  <li><strong>Connection State:</strong> Wallet connection status and user selections</li>
                </ul>

                <h3 className="text-xl font-medium text-blue-300">1.3 Technical Data</h3>
                <ul className="list-disc pl-6 space-y-2">
                  <li><strong>IP Addresses:</strong> Collected through standard web server logs</li>
                  <li><strong>Browser Information:</strong> User agent, device type, and browser version</li>
                  <li><strong>Usage Analytics:</strong> Page views, feature usage, and error reports (if implemented)</li>
                  <li><strong>API Requests:</strong> Interactions with third-party services for token/NFT data</li>
                </ul>
              </div>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold mb-4">2. Third-Party Services</h2>
              
              <div className="space-y-4">
                <p className="mb-4">BaseClean integrates with several third-party services that may collect data:</p>
                
                <h3 className="text-xl font-medium text-blue-300">2.1 Blockchain APIs</h3>
                <ul className="list-disc pl-6 space-y-2">
                  <li><strong>Alchemy:</strong> NFT metadata and blockchain data - subject to Alchemy&apos;s privacy policy</li>
                  <li><strong>Zapper API:</strong> Token logos and metadata - subject to Zapper&apos;s privacy policy</li>
                  <li><strong>Base/Zora Networks:</strong> Public blockchain queries and transactions</li>
                </ul>

                <h3 className="text-xl font-medium text-blue-300">2.2 Wallet Services</h3>
                <ul className="list-disc pl-6 space-y-2">
                  <li><strong>RainbowKit:</strong> Wallet connection interface - subject to Rainbow&apos;s privacy policy</li>
                  <li><strong>WalletConnect:</strong> Multi-wallet connection protocol - subject to WalletConnect&apos;s privacy policy</li>
                  <li><strong>MetaMask/Coinbase Wallet:</strong> Individual wallet privacy policies apply</li>
                </ul>

                <h3 className="text-xl font-medium text-blue-300">2.3 Block Explorers</h3>
                <ul className="list-disc pl-6 space-y-2">
                  <li><strong>BaseScan:</strong> Base network block explorer - subject to Etherscan&apos;s privacy policy</li>
                  <li><strong>Zora Explorer:</strong> Zora network block explorer - subject to Zora&apos;s privacy policy</li>
                </ul>
              </div>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold mb-4">3. How We Use Your Information</h2>
              
              <div className="space-y-4">
                <h3 className="text-xl font-medium text-blue-300">3.1 Core Functionality</h3>
                <ul className="list-disc pl-6 space-y-2">
                  <li>Display your token and NFT holdings</li>
                  <li>Execute burn transactions to the dead address</li>
                  <li>Cache images and metadata for improved performance</li>
                  <li>Remember your filter preferences and selections</li>
                </ul>

                <h3 className="text-xl font-medium text-blue-300">3.2 Service Improvement</h3>
                <ul className="list-disc pl-6 space-y-2">
                  <li>Analyze usage patterns to improve user experience</li>
                  <li>Debug errors and technical issues</li>
                  <li>Optimize API performance and caching strategies</li>
                  <li>Monitor service reliability and uptime</li>
                </ul>
              </div>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold mb-4">4. Future Features: $BCLEAN Token</h2>
              
              <div className="bg-purple-900/30 border border-purple-700 rounded-lg p-6 mb-4">
                <h3 className="text-lg font-semibold mb-2 text-purple-300">🚀 Planned Token Features</h3>
                <p className="text-sm">
                  When $BCLEAN token features are implemented, additional data collection may include:
                </p>
              </div>

              <div className="space-y-4">
                <h3 className="text-xl font-medium text-blue-300">4.1 Token Gating</h3>
                <ul className="list-disc pl-6 space-y-2">
                  <li><strong>$BCLEAN Holdings:</strong> Token balance verification for access control</li>
                  <li><strong>Access Levels:</strong> Premium features based on token holdings</li>
                  <li><strong>Staking Data:</strong> If staking mechanisms are implemented</li>
                </ul>

                <h3 className="text-xl font-medium text-blue-300">4.2 Gamification Features</h3>
                <ul className="list-disc pl-6 space-y-2">
                  <li><strong>Burn History:</strong> Record of tokens/NFTs burned for achievements</li>
                  <li><strong>Achievement Data:</strong> Progress tracking and reward systems</li>
                  <li><strong>Leaderboards:</strong> Ranking data (if competitive features are added)</li>
                  <li><strong>User Profiles:</strong> Optional profile information and preferences</li>
                </ul>

                <h3 className="text-xl font-medium text-blue-300">4.3 Enhanced Analytics</h3>
                <ul className="list-disc pl-6 space-y-2">
                  <li><strong>Usage Metrics:</strong> Feature adoption and user engagement</li>
                  <li><strong>Reward Distribution:</strong> $BCLEAN token rewards and distributions</li>
                  <li><strong>Community Features:</strong> Social interactions and sharing (if implemented)</li>
                </ul>
              </div>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold mb-4">5. Data Storage and Retention</h2>
              
              <div className="space-y-4">
                <h3 className="text-xl font-medium text-blue-300">5.1 Browser Storage</h3>
                <ul className="list-disc pl-6 space-y-2">
                  <li>Local storage data persists until you clear browser data</li>
                  <li>Session data is cleared when you close the browser</li>
                  <li>You can clear BaseClean data through browser settings</li>
                </ul>

                <h3 className="text-xl font-medium text-blue-300">5.2 Server-Side Data</h3>
                <ul className="list-disc pl-6 space-y-2">
                  <li>Minimal server-side data storage (primarily logs)</li>
                  <li>Log data retained for 30 days for debugging purposes</li>
                  <li>No permanent storage of personal information</li>
                </ul>

                <h3 className="text-xl font-medium text-blue-300">5.3 Blockchain Data</h3>
                <ul className="list-disc pl-6 space-y-2">
                  <li>All blockchain transactions are permanent and public</li>
                  <li>Burn transactions cannot be reversed or deleted</li>
                  <li>Wallet addresses and transaction history remain on-chain forever</li>
                </ul>
              </div>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold mb-4">6. Your Privacy Rights</h2>
              
              <div className="space-y-4">
                <h3 className="text-xl font-medium text-blue-300">6.1 Data Control</h3>
                <ul className="list-disc pl-6 space-y-2">
                  <li><strong>Disconnect Wallet:</strong> Stop data collection by disconnecting your wallet</li>
                  <li><strong>Clear Browser Data:</strong> Remove cached data through browser settings</li>
                  <li><strong>Opt-Out:</strong> Simply stop using the service to prevent further data collection</li>
                </ul>

                <h3 className="text-xl font-medium text-blue-300">6.2 Data Requests</h3>
                <ul className="list-disc pl-6 space-y-2">
                  <li><strong>Access:</strong> Request information about data we may have collected</li>
                  <li><strong>Deletion:</strong> Request deletion of any server-side data (excluding blockchain)</li>
                  <li><strong>Correction:</strong> Report inaccuracies in any collected data</li>
                </ul>

                <p className="mt-4 text-sm text-gray-400">
                  <strong>Note:</strong> Blockchain data cannot be deleted as it is permanently recorded on public networks.
                </p>
              </div>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold mb-4">7. Data Security</h2>
              <ul className="list-disc pl-6 space-y-2">
                <li>HTTPS encryption for all web communications</li>
                <li>Secure API connections to third-party services</li>
                <li>No storage of private keys or sensitive wallet information</li>
                <li>Regular security reviews and updates</li>
                <li>Limited data collection reduces attack surface</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold mb-4">8. Children&apos;s Privacy</h2>
              <p className="mb-4">
                BaseClean is not intended for use by children under 18. We do not knowingly collect personal 
                information from children. If we learn that we have collected information from a child under 18, 
                we will delete that information immediately.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold mb-4">9. International Users</h2>
              <p className="mb-4">
                BaseClean is operated from the United States. If you are accessing the service from other regions 
                with different privacy laws, please be aware that your data may be processed in the United States. 
                By using BaseClean, you consent to the transfer and processing of your data in the United States.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold mb-4">10. Changes to This Policy</h2>
              <p className="mb-4">
                We may update this Privacy Policy from time to time, especially when implementing new features 
                like $BCLEAN token functionality. We will notify users of significant changes by updating the 
                &quot;Last Updated&quot; date at the top of this policy. Continued use of BaseClean after changes 
                constitutes acceptance of the updated policy.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold mb-4">11. Related Policies</h2>
              <p className="mb-4">
                This Privacy Policy should be read in conjunction with our{' '}
                <Link href="/terms-of-service" className="text-blue-400 hover:text-blue-300 underline">
                  Terms of Service
                </Link>
                , which govern your use of BaseClean and outline important legal disclaimers.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold mb-4">12. Contact Us</h2>
              <p className="mb-4">
                If you have questions about this Privacy Policy or how we handle your data, please contact us at:
              </p>
              {/* TODO: Replace placeholder with actual contact email or form link before public launch */}
              <p className="mb-4">
                [Insert Contact Email or Form Link]
              </p>
              <p className="text-sm text-gray-400">
                For immediate privacy concerns, please include &quot;Privacy Policy&quot; in your subject line.
              </p>
            </section>

            <div className="mt-12 p-6 bg-green-900/30 border border-green-700 rounded-lg">
              <h3 className="text-xl font-bold mb-4 text-green-300">🔒 Privacy Commitment</h3>
              <p className="font-medium">
                BaseClean is committed to protecting your privacy while providing a secure, efficient token burning service. 
                We collect only the data necessary for functionality and never sell personal information to third parties. 
                Your trust is important to us.
              </p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
} 