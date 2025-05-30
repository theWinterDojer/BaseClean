import React from 'react';
import { parseWalletError } from '@/utils/errorHandling';

/**
 * Test component to verify wallet error handling is working
 * Temporarily add this to your main page to test the improvements
 */
export default function ErrorHandlingTest() {
  const testUserRejection = () => {
    // Simulate the exact error you're experiencing
    const error = new Error('ContractFunctionExecutionError: User rejected the request.');
    const parsed = parseWalletError(error);
    
    console.log('🧪 Testing User Rejection:');
    console.log('Original Error:', error.message);
    console.log('Parsed Type:', parsed.type);
    console.log('User-Friendly Message:', parsed.userFriendlyMessage);
    
    alert(`✅ User Rejection Test Results:
    
Error Type: ${parsed.type}
Message: ${parsed.userFriendlyMessage}

Check console for details!`);
  };

  const testUnhandledRejection = () => {
    // Test the global unhandled rejection handler
    Promise.reject(new Error('User rejected the request.')).catch(() => {
      // Intentionally not handling this to test global handler
    });
    
    setTimeout(() => {
      alert('Check your console - the global error handler should have caught this!');
    }, 1000);
  };

  return (
    <div className="p-4 bg-gray-800 rounded-lg border border-gray-700 m-4">
      <h3 className="text-white font-bold mb-4">🧪 Error Handling Test Panel</h3>
      <p className="text-gray-300 text-sm mb-4">
        Use these buttons to verify that wallet error handling is working correctly.
      </p>
      
      <div className="space-y-3">
        <button
          onClick={testUserRejection}
          className="w-full p-3 bg-yellow-600 hover:bg-yellow-500 text-white rounded-lg transition-colors"
        >
          🔍 Test User Rejection Error Parsing
        </button>
        
        <button
          onClick={testUnhandledRejection}
          className="w-full p-3 bg-blue-600 hover:bg-blue-500 text-white rounded-lg transition-colors"
        >
          🌐 Test Global Error Handler
        </button>
      </div>
      
      <div className="mt-4 p-3 bg-green-900/20 border border-green-700 rounded">
        <h4 className="text-green-300 font-medium mb-2">✅ What should happen:</h4>
        <ul className="text-green-200 text-sm space-y-1">
          <li>• User rejections should show friendly messages instead of technical errors</li>
          <li>• Global handler should catch unhandled wallet errors</li>
          <li>• No scary stack traces in the console for normal user actions</li>
          <li>• Check browser console for friendly logged messages</li>
        </ul>
      </div>
    </div>
  );
} 