import { useState, useEffect } from 'react';
import { clearTokenLogoCache, getTokenLogoUrl } from '@/lib/api';
import Image from 'next/image';

export default function DebugPage() {
  const [message, setMessage] = useState('');
  const [testAddress, setTestAddress] = useState('0xa9a489ea2ba0e0af84150f88d1c33c866f466a80'); // ZORA by default
  const [testSymbol, setTestSymbol] = useState('ZORA');
  const [testImage, setTestImage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Show localStorage content
  const [cacheContent, setCacheContent] = useState<string>('');
  
  useEffect(() => {
    try {
      const cache = localStorage.getItem('token_logo_cache');
      setCacheContent(cache ? JSON.stringify(JSON.parse(cache), null, 2) : 'No cache found');
    } catch (e) {
      setCacheContent('Error loading cache: ' + e);
    }
  }, [message]);

  const handleClearCache = () => {
    clearTokenLogoCache();
    setMessage('Cache cleared successfully');
    setTimeout(() => setMessage(''), 3000);
  };

  const handleTestImage = async () => {
    setIsLoading(true);
    try {
      const url = await getTokenLogoUrl(testAddress, testSymbol);
      setTestImage(url);
      setMessage(`Image URL resolved: ${url.substring(0, 100)}${url.length > 100 ? '...' : ''}`);
    } catch (e) {
      setMessage('Error: ' + e);
      setTestImage(null);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">BaseClean Debug Tools</h1>
      
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-md mb-8">
        <h2 className="text-xl font-bold mb-4">Token Logo Cache Management</h2>
        <button 
          onClick={handleClearCache}
          className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 mb-4"
        >
          Clear Token Logo Cache
        </button>
        
        {message && (
          <div className="mt-4 p-3 bg-blue-100 dark:bg-blue-900 rounded text-blue-800 dark:text-blue-200">
            {message}
          </div>
        )}
      </div>
      
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-md mb-8">
        <h2 className="text-xl font-bold mb-4">Test Image Loading</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block mb-2">Token Address</label>
            <input 
              type="text" 
              value={testAddress} 
              onChange={(e) => setTestAddress(e.target.value)}
              className="w-full p-2 border rounded dark:bg-gray-700 dark:border-gray-600"
            />
          </div>
          <div>
            <label className="block mb-2">Token Symbol</label>
            <input 
              type="text" 
              value={testSymbol} 
              onChange={(e) => setTestSymbol(e.target.value)}
              className="w-full p-2 border rounded dark:bg-gray-700 dark:border-gray-600"
            />
          </div>
        </div>
        <button 
          onClick={handleTestImage}
          className="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          disabled={isLoading}
        >
          {isLoading ? 'Loading...' : 'Test Image Loading'}
        </button>
        
        {testImage && (
          <div className="mt-6 flex flex-col items-center">
            <div className="relative w-16 h-16 mb-2 rounded-full overflow-hidden bg-gray-100">
              <Image 
                src={testImage} 
                alt="Test Token" 
                width={64} 
                height={64}
                className="object-cover"
              />
            </div>
            <span className="text-sm text-gray-500 break-all">{testImage}</span>
          </div>
        )}
      </div>
      
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-md">
        <h2 className="text-xl font-bold mb-4">Current LocalStorage Cache</h2>
        <pre className="bg-gray-100 dark:bg-gray-900 p-4 rounded overflow-auto max-h-80 text-xs">
          {cacheContent}
        </pre>
      </div>
    </div>
  );
} 