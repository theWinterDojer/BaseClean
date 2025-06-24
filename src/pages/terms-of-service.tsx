import Head from 'next/head';
import Link from 'next/link';
import MainLayout from '@/layout/MainLayout';

export default function TermsOfService() {
  return (
    <>
      <Head>
        <title>Terms of Service - BaseClean</title>
        <meta name="description" content="BaseClean Terms of Service and Legal Disclaimers" />
        <meta name="robots" content="noindex, nofollow" />
      </Head>
      
      <MainLayout hideNavigation={true}>
        <div className="min-h-screen py-8">
          <div className="max-w-4xl mx-auto">
            <div className="mb-8">
              <Link href="/" className="text-blue-400 hover:text-blue-300 underline">
                ← Back to BaseClean
              </Link>
            </div>

            <h1 className="text-4xl font-bold text-white mb-8">Terms of Service</h1>
          
          <div className="prose prose-invert max-w-none">
            <p className="text-lg mb-8 text-gray-300">
              Last Updated: {new Date().toLocaleDateString()}
            </p>

            <div className="mt-8 mb-12 p-6 bg-yellow-900/30 border border-yellow-700 rounded-lg">
              <h3 className="text-xl font-bold mb-4 text-yellow-300">⚠️ Quick Summary (Non-Legal Summary)</h3>
              <p className="font-medium">
                Using BaseClean is entirely at your own risk. Burning tokens is permanent and cannot be undone. 
                You are solely responsible for any losses. BaseClean provides no guarantees and is not liable 
                for any issues that may arise. Please read the full terms below carefully.
              </p>
            </div>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-white mb-4">1. Acceptance of Terms</h2>
              <p className="mb-4 text-gray-300">
                By accessing, using, or interacting with BaseClean (&quot;Service&quot;, &quot;Platform&quot;, &quot;Application&quot;), you (&quot;User&quot;, &quot;You&quot;) 
                expressly agree to be bound by these Terms of Service (&quot;Terms&quot;) and all applicable laws and regulations. 
                If you do not agree with any of these terms, you are prohibited from using this service.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-white mb-4">2. Service Description</h2>
              <p className="mb-4 text-gray-300">
                BaseClean is a decentralized application that facilitates the permanent destruction of ERC-20 tokens and NFTs 
                through direct transfers to a burn address (0x000000000000000000000000000000000000dEaD). The Service operates 
                without smart contracts, using direct wallet-to-wallet transfers.
              </p>
              <p className="mb-4 font-semibold text-red-300">
                ALL ACTIONS PERFORMED THROUGH THIS SERVICE ARE PERMANENT, IRREVERSIBLE, AND UNRECOVERABLE.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-white mb-4">3. User Responsibilities and Acknowledgments</h2>
              <div className="space-y-4">
                <h3 className="text-xl font-medium text-blue-300">3.1 Sole Responsibility</h3>
                <p className="text-gray-300">You acknowledge and agree that you are solely and exclusively responsible for:</p>
                <ul className="list-disc pl-6 space-y-2 text-gray-300">
                  <li>All decisions regarding token selection and burning</li>
                  <li>Verifying the correctness of all transactions before confirmation</li>
                  <li>Understanding the permanent nature of all actions</li>
                  <li>Any and all consequences resulting from use of the Service</li>
                  <li>Maintaining the security of your wallet and private keys</li>
                </ul>
                
                <h3 className="text-xl font-medium text-blue-300">3.2 Technical Understanding</h3>
                <p className="text-gray-300">You represent that you understand:</p>
                <ul className="list-disc pl-6 space-y-2 text-gray-300">
                  <li>Blockchain technology and its immutable nature</li>
                  <li>The function and risks of token burning</li>
                  <li>The operation of Web3 wallets and transaction signing</li>
                  <li>Gas fees and transaction costs</li>
                </ul>
              </div>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-white mb-4">4. Disclaimers and Limitation of Liability</h2>
              <div className="space-y-4">
                <h3 className="text-xl font-medium text-blue-300">4.1 Complete Disclaimer of Liability</h3>
                <p className="text-gray-300">TO THE MAXIMUM EXTENT PERMITTED BY LAW, BASECLEAN, ITS DEVELOPERS, OPERATORS, CONTRIBUTORS, AND AFFILIATED PARTIES DISCLAIM ALL LIABILITY FOR:</p>
                <ul className="list-disc pl-6 space-y-2 text-gray-300">
                  <li>Any losses, damages, or destruction of digital assets</li>
                  <li>Technical errors, bugs, or malfunctions</li>
                  <li>User errors, misclicks, or unintended actions</li>
                  <li>Network congestion or failed transactions</li>
                  <li>Wallet security breaches or compromises</li>
                  <li>Third-party service interruptions</li>
                  <li>Any direct, indirect, incidental, consequential, or punitive damages</li>
                </ul>

                <h3 className="text-xl font-medium text-blue-300">4.2 No Warranties</h3>
                <p className="text-gray-300">THE SERVICE IS PROVIDED &quot;AS IS&quot; AND &quot;AS AVAILABLE&quot; WITHOUT WARRANTIES OF ANY KIND, WHETHER EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO:</p>
                <ul className="list-disc pl-6 space-y-2 text-gray-300">
                  <li>Warranties of merchantability or fitness for a particular purpose</li>
                  <li>Warranties of uninterrupted or error-free operation</li>
                  <li>Warranties regarding the accuracy or reliability of information</li>
                  <li>Warranties of security or data protection</li>
                </ul>

                <h3 className="text-xl font-medium text-blue-300">4.3 Maximum Liability Cap</h3>
                <p className="text-gray-300">In no event shall the total liability of BaseClean exceed $0.00 USD.</p>
              </div>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-white mb-4">5. Release and Indemnification</h2>
              <div className="space-y-4">
                <h3 className="text-xl font-medium text-blue-300">5.1 General Release</h3>
                <p className="text-gray-300">
                  You hereby release, waive, discharge, and covenant not to sue BaseClean, 
                  its developers, operators, contributors, and affiliated parties from any and all claims, demands, damages, 
                  actions, or causes of action arising out of or relating to your use of the Service.
                </p>
                
                <h3 className="text-xl font-medium text-blue-300">5.2 Indemnification</h3>
                <p className="text-gray-300">
                  You agree to indemnify, defend, and hold harmless BaseClean and its 
                  affiliated parties from any claims, damages, losses, or expenses (including attorney fees) arising from your 
                  use of the Service or violation of these Terms.
                </p>
              </div>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-white mb-4">6. Prohibited Uses</h2>
              <p className="mb-4 text-gray-300">You agree not to use the Service:</p>
              <ul className="list-disc pl-6 space-y-2 text-gray-300">
                <li>For any illegal or unauthorized purpose</li>
                <li>To violate any applicable laws or regulations</li>
                <li>To burn tokens you do not legally own</li>
                <li>To interfere with or disrupt the Service</li>
                <li>To attempt to reverse engineer or exploit the platform</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-white mb-4">7. Intellectual Property</h2>
              <p className="mb-4 text-gray-300">
                BaseClean and its content are protected by intellectual property laws. You may not reproduce, 
                distribute, or create derivative works without express written permission.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-white mb-4">8. Termination</h2>
              <p className="mb-4 text-gray-300">
                We reserve the right to terminate or suspend access to the Service immediately, without prior notice, 
                for any reason, including but not limited to:
              </p>
              <ul className="list-disc pl-6 space-y-2 text-gray-300">
                <li>Violation of these Terms</li>
                <li>Suspicion of abuse, exploitation, or malicious activity</li>
                <li>Legal or regulatory obligations</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-white mb-4">9. Governing Law and Jurisdiction</h2>
              <p className="mb-4 text-gray-300">
                These Terms shall be governed by and construed in accordance with the laws of the State of Florida, 
                United States, without regard to conflict of law principles. Any disputes shall be resolved exclusively 
                in the state or federal courts located in Florida.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-white mb-4">10. Severability</h2>
              <p className="mb-4 text-gray-300">
                If any provision of these Terms is deemed invalid or unenforceable, the remaining provisions shall 
                remain in full force and effect.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-white mb-4">11. Changes to Terms</h2>
              <p className="mb-4 text-gray-300">
                We reserve the right to modify these Terms at any time. Continued use of the Service after changes 
                constitutes acceptance of the modified Terms.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-white mb-4">12. Related Policies</h2>
              <p className="mb-4 text-gray-300">
                These Terms of Service should be read in conjunction with our{' '}
                <Link href="/privacy-policy" className="text-blue-400 hover:text-blue-300 underline">
                  Privacy Policy
                </Link>
                , which explains how we collect, use, and protect your data.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-white mb-4">13. Contact Information</h2>
              <p className="mb-4 text-gray-300">
                For questions about these Terms, please contact us at{' '}
                <a href="mailto:contact@baseclean.io" className="text-blue-400 hover:text-blue-300 underline">
                  contact@baseclean.io
                </a>.
              </p>
            </section>

            <div className="mt-12 p-6 bg-red-900/30 border border-red-700 rounded-lg">
              <h3 className="text-xl font-bold mb-4 text-red-300">⚠️ FINAL WARNING</h3>
              <p className="font-semibold">
                BY USING BASECLEAN, YOU ACKNOWLEDGE THAT YOU HAVE READ, UNDERSTOOD, AND AGREE TO BE BOUND BY THESE TERMS. 
                YOU UNDERSTAND THAT TOKEN BURNING IS PERMANENT AND IRREVERSIBLE. YOU ASSUME ALL RISKS AND RELEASE ALL CLAIMS.
              </p>
            </div>
          </div>
        </div>
        </div>
      </MainLayout>
    </>
  );
} 