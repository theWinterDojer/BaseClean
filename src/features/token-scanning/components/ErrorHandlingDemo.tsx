import React from 'react';
import { parseWalletError, isUserRejectionError, getShortErrorMessage } from '@/utils/errorHandling';

/**
 * Demo component showing how different wallet errors are handled
 * This is for development/testing purposes to show the improved error handling
 */
export default function ErrorHandlingDemo() {
  // Example errors that might occur
  const exampleErrors = [
    new Error('User rejected the request.'),
    new Error('ContractFunctionExecutionError: User rejected the request.'),
    new Error('User denied transaction signature'),
    new Error('Insufficient funds for gas'),
    new Error('Network request failed'),
    new Error('Transaction timeout'),
    new Error('Contract execution reverted'),
  ];

  const handleTestError = (error: Error) => {
    const parsed = parseWalletError(error);
    const isRejection = isUserRejectionError(error);
    const shortMessage = getShortErrorMessage(error);

    console.log('Error Analysis:', {
      originalError: error.message,
      parsedType: parsed.type,
      userFriendlyMessage: parsed.userFriendlyMessage,
      isUserRejection: isRejection,
      shortMessage,
    });

    alert(`
Error Type: ${parsed.type}
Is User Rejection: ${isRejection}
Short Message: ${shortMessage}
User-Friendly: ${parsed.userFriendlyMessage}
    `.trim());
  };

  return (
    <div className="p-6 bg-gray-800 rounded-lg border border-gray-700">
      <h3 className="text-white font-bold mb-4">🧪 Error Handling Demo</h3>
      <p className="text-gray-300 text-sm mb-4">
        This demo shows how different wallet errors are categorized and handled gracefully.
        Check the console for detailed analysis.
      </p>
      
      <div className="space-y-2">
        {exampleErrors.map((error, index) => (
          <button
            key={index}
            onClick={() => handleTestError(error)}
            className="block w-full text-left p-3 bg-gray-700 hover:bg-gray-600 rounded text-sm text-gray-200 transition-colors"
          >
            <div className="font-mono text-xs text-gray-400 mb-1">
              Test Error {index + 1}:
            </div>
            <div className="truncate">
              {error.message}
            </div>
            <div className="text-xs mt-1">
              {isUserRejectionError(error) && (
                <span className="text-yellow-400">👤 User Rejection</span>
              )}
              {!isUserRejectionError(error) && (
                <span className="text-red-400">❌ System Error</span>
              )}
            </div>
          </button>
        ))}
      </div>

      <div className="mt-4 p-3 bg-blue-900/20 border border-blue-700 rounded">
        <h4 className="text-blue-300 font-medium mb-2">✅ Error Handling Features:</h4>
        <ul className="text-blue-200 text-xs space-y-1">
          <li>• User rejections are clearly identified and handled gracefully</li>
          <li>• Different error types get appropriate user-friendly messages</li>
          <li>• Errors are categorized (user rejection, network, contract, etc.)</li>
          <li>• No more scary technical error messages for users</li>
          <li>• Users understand when they cancelled vs when something actually failed</li>
        </ul>
      </div>
    </div>
  );
} 