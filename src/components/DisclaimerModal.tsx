import React from 'react';

interface DisclaimerModalProps {
  isOpen: boolean;
  onAgree: () => void;
}

export default function DisclaimerModal({
  isOpen,
  onAgree
}: DisclaimerModalProps) {
  if (!isOpen) return null;

  const openTermsOfService = () => {
    window.open('/terms-of-service', '_blank');
  };

  return (
    <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4">
      <div className="bg-gray-900 rounded-xl border border-gray-700 shadow-2xl max-w-2xl w-full max-h-[85vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex items-center mb-6">
            <div className="flex-shrink-0">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-amber-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-white ml-3">
              Important Disclaimer
            </h2>
          </div>
          
          <div className="bg-red-950/70 border border-red-800/80 rounded-lg p-5 mb-6">
            <p className="text-white font-medium text-base leading-relaxed mb-5">
              BaseClean is a tool designed to assist users in identifying and removing unwanted or spam tokens & NFTs from their wallet. This action includes the irreversible burning of assets.
            </p>
            
            <p className="text-white font-semibold mb-4">
              By using BaseClean, you acknowledge and agree to the following:
            </p>
            
            <div className="space-y-3">
              <div className="flex items-start">
                <div className="flex-shrink-0 w-1.5 h-1.5 bg-red-400 rounded-full mt-2 mr-3"></div>
                <p className="text-gray-200 text-sm leading-relaxed">
                  You are solely responsible for any actions taken on this platform, including the selection and removal (burning) of tokens.
                </p>
              </div>
              
              <div className="flex items-start">
                <div className="flex-shrink-0 w-1.5 h-1.5 bg-red-400 rounded-full mt-2 mr-3"></div>
                <p className="text-gray-200 text-sm leading-relaxed">
                  BaseClean and its developers do not assume liability for any losses, mistakes, misclicks, technical errors, or unintended burns.
                </p>
              </div>
              
              <div className="flex items-start">
                <div className="flex-shrink-0 w-1.5 h-1.5 bg-red-400 rounded-full mt-2 mr-3"></div>
                <p className="text-gray-200 text-sm leading-relaxed">
                  You understand that token burning is permanent and irreversible.
                </p>
              </div>
              
              <div className="flex items-start">
                <div className="flex-shrink-0 w-1.5 h-1.5 bg-red-400 rounded-full mt-2 mr-3"></div>
                <p className="text-gray-200 text-sm leading-relaxed">
                  By proceeding, you explicitly release BaseClean, its operators, and affiliated parties from any claims or damages resulting from the use of this tool.
                </p>
              </div>
              
              <div className="flex items-start">
                <div className="flex-shrink-0 w-1.5 h-1.5 bg-red-400 rounded-full mt-2 mr-3"></div>
                <p className="text-gray-200 text-sm leading-relaxed font-medium">
                  Use at your own risk. Review token selections carefully before confirming any transaction.
                </p>
              </div>
            </div>
          </div>

          <div className="mb-6 text-center">
            <button
              onClick={openTermsOfService}
              className="text-blue-400 hover:text-blue-300 underline text-sm transition-colors"
            >
              View Complete Terms of Service
            </button>
          </div>

          <div className="flex justify-center">
            <button
              type="button"
              className="px-8 py-3 bg-blue-600 hover:bg-blue-500 text-white rounded-lg transition-all duration-200 font-semibold shadow-lg hover:shadow-xl transform hover:scale-105"
              onClick={onAgree}
            >
              Agree and Continue
            </button>
          </div>
        </div>
      </div>
    </div>
  );
} 