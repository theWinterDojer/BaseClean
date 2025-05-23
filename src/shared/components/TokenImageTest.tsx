import { useState, useEffect } from 'react';
import { getTokenLogoUrl, clearTokenLogoCache } from '@/lib/api';

/**
 * Test component to verify token image loading improvements
 * This component can be temporarily added to your app to test the new image loading logic
 */
export default function TokenImageTest() {
  const [testResults, setTestResults] = useState<Array<{
    address: string;
    symbol: string;
    url: string;
    loadTime: number;
    success: boolean;
  }>>([]);
  const [isLoading, setIsLoading] = useState(false);

  // Test tokens from Base blockchain
  const testTokens = [
    { address: '0x4200000000000000000000000000000000000006', symbol: 'ETH' },
    { address: '0x833589fcd6edb6e08f4c7c32d4f71b54bda02913', symbol: 'USDC' },
    { address: '0x50c5725949a6f0c72e6c4a641f24049a917db0cb', symbol: 'DAI' },
    { address: '0xd9aaec86b65d86f6a7b5b1b0c42ffa531710b6ca', symbol: 'USDbC' },
    { address: '0x0000000000000000000000000000000000000000', symbol: 'NULL' }, // Should fallback
    { address: '0x1234567890123456789012345678901234567890', symbol: 'TEST' }, // Random address
  ];

  const runTest = async () => {
    setIsLoading(true);
    setTestResults([]);
    
    const results = [];
    
    for (const token of testTokens) {
      const startTime = Date.now();
      try {
        const url = await getTokenLogoUrl(token.address, token.symbol);
        const endTime = Date.now();
        
        results.push({
          address: token.address,
          symbol: token.symbol,
          url,
          loadTime: endTime - startTime,
          success: !url.startsWith('data:image/svg+xml') // SVG means fallback was used
        });
      } catch (error) {
        const endTime = Date.now();
        results.push({
          address: token.address,
          symbol: token.symbol,
          url: 'Error',
          loadTime: endTime - startTime,
          success: false
        });
      }
    }
    
    setTestResults(results);
    setIsLoading(false);
  };

  const clearCache = () => {
    clearTokenLogoCache();
    setTestResults([]);
  };

  return (
    <div className="p-6 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
      <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-gray-100">
        Token Image Loading Test
      </h3>
      
      <div className="flex gap-3 mb-4">
        <button
          onClick={runTest}
          disabled={isLoading}
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50"
        >
          {isLoading ? 'Testing...' : 'Run Test'}
        </button>
        
        <button
          onClick={clearCache}
          className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
        >
          Clear Cache
        </button>
      </div>

      {testResults.length > 0 && (
        <div className="space-y-3">
          <h4 className="font-medium text-gray-900 dark:text-gray-100">Results:</h4>
          {testResults.map((result, index) => (
            <div 
              key={index}
              className="p-3 border border-gray-200 dark:border-gray-600 rounded flex items-center gap-4"
            >
              <div className="w-12 h-12 rounded-full overflow-hidden bg-gray-100 dark:bg-gray-700 flex-shrink-0">
                {result.success && !result.url.startsWith('data:') ? (
                  <img 
                    src={result.url} 
                    alt={result.symbol}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.style.display = 'none';
                    }}
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-white bg-blue-500 text-sm font-bold">
                    {result.symbol.substring(0, 2)}
                  </div>
                )}
              </div>
              
              <div className="flex-grow">
                <div className="text-sm font-medium text-gray-900 dark:text-gray-100">
                  {result.symbol} ({result.address.substring(0, 8)}...)
                </div>
                <div className="text-xs text-gray-500 dark:text-gray-400">
                  {result.loadTime}ms - {result.success ? 'Success' : 'Fallback'}
                </div>
                <div className="text-xs text-gray-400 dark:text-gray-500 truncate max-w-md">
                  {result.url.length > 50 ? result.url.substring(0, 50) + '...' : result.url}
                </div>
              </div>
            </div>
          ))}
          
          <div className="mt-4 p-3 bg-gray-50 dark:bg-gray-700 rounded">
            <div className="text-sm text-gray-700 dark:text-gray-300">
              <strong>Summary:</strong> {testResults.filter(r => r.success).length}/{testResults.length} images loaded successfully
              <br />
              <strong>Average load time:</strong> {Math.round(testResults.reduce((sum, r) => sum + r.loadTime, 0) / testResults.length)}ms
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 