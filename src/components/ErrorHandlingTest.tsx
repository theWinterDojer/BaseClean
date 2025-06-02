import React, { useState } from 'react';
import { useWriteContract } from 'wagmi';
import { parseWalletError, isUserRejectionError } from '@/utils/errorHandling';

/**
 * Test component to verify that user rejection errors are handled gracefully
 * This can be temporarily added to any page to test the error handling
 */
export default function ErrorHandlingTest() {
  const [testResult, setTestResult] = useState<string>('');
  const { writeContractAsync } = useWriteContract();

  const simulateUserRejection = async () => {
    try {
      setTestResult('Simulating user rejection...');
      
      // This will fail if no wallet is connected or will prompt user to reject
      await writeContractAsync({
        address: '0x0000000000000000000000000000000000000001', // Invalid address to trigger error
        abi: [{
          name: 'transfer',
          type: 'function',
          inputs: [
            { name: 'to', type: 'address' },
            { name: 'amount', type: 'uint256' }
          ],
          outputs: [{ name: '', type: 'bool' }],
          stateMutability: 'nonpayable'
        }],
        functionName: 'transfer',
        args: ['0x0000000000000000000000000000000000000001', BigInt(1)],
      });
      
      setTestResult('❌ Transaction succeeded (unexpected)');
    } catch (error) {
      const isRejection = isUserRejectionError(error);
      const parsed = parseWalletError(error);
      
      if (isRejection) {
        setTestResult('✅ User rejection handled correctly: ' + parsed.userFriendlyMessage);
      } else {
        setTestResult('⚠️ Other error: ' + parsed.userFriendlyMessage);
      }
    }
  };

  const testErrorDetection = () => {
    // Test various error patterns
    const testErrors = [
      { error: new Error('ContractFunctionExecutionError: User rejected the request.'), expected: true },
      { error: new Error('User rejected the request'), expected: true },
      { error: new Error('user denied transaction'), expected: true },
      { error: new Error('Network error'), expected: false },
    ];

    const results = testErrors.map(({ error, expected }) => {
      const detected = isUserRejectionError(error);
      return {
        error: error.message,
        expected,
        detected,
        correct: detected === expected
      };
    });

    const allCorrect = results.every(r => r.correct);
    setTestResult(
      allCorrect 
        ? '✅ All error detection tests passed' 
        : '❌ Some error detection tests failed: ' + JSON.stringify(results, null, 2)
    );
  };

  return (
    <div className="bg-gray-800 p-6 rounded-lg max-w-md mx-auto mt-8">
      <h3 className="text-white font-bold mb-4">🧪 Error Handling Test</h3>
      
      <div className="space-y-4">
        <button
          onClick={simulateUserRejection}
          className="w-full px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-500"
        >
          Test User Rejection Handling
        </button>
        
        <button
          onClick={testErrorDetection}
          className="w-full px-4 py-2 bg-green-600 text-white rounded hover:bg-green-500"
        >
          Test Error Detection Logic
        </button>
        
        {testResult && (
          <div className="bg-gray-700 p-3 rounded text-white text-sm">
            <strong>Result:</strong><br />
            {testResult}
          </div>
        )}
      </div>
      
      <div className="mt-4 text-xs text-gray-400">
        <p>This component tests that user rejection errors are caught and handled gracefully without showing scary technical messages.</p>
      </div>
    </div>
  );
} 