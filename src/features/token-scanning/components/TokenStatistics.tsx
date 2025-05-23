import { TokenStatistics as TokenStatisticsType } from '@/types/token';

interface TokenStatisticsProps {
  statistics: TokenStatisticsType;
}

export default function TokenStatistics({ statistics }: TokenStatisticsProps) {
  return (
    <div className="bg-gray-800/20 border border-gray-700 p-5 rounded-lg">
      <h3 className="text-lg font-semibold text-white mb-4">Wallet Summary</h3>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
        {/* Total Tokens */}
        <div className="flex flex-col">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-8 h-8 rounded-full bg-gray-700/60 flex items-center justify-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-gray-300" viewBox="0 0 20 20" fill="currentColor">
                <path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v3h8v-3zM6 8a2 2 0 11-4 0 2 2 0 014 0zM16 18v-3a5.972 5.972 0 00-.75-2.906A3.005 3.005 0 0119 15v3h-3zM4.75 12.094A5.973 5.973 0 004 15v3H1v-3a3 3 0 013.75-2.906z" />
              </svg>
            </div>
            <span className="text-sm font-medium text-gray-300">Total Tokens</span>
          </div>
          <div className="text-3xl font-bold text-white">{statistics.totalTokens}</div>
          <div className="text-xs text-gray-400 mt-1">All tokens in wallet</div>
          
          {/* Progress Bar */}
          <div className="w-full h-1 bg-gray-700 rounded-full mt-2 overflow-hidden">
            <div className="h-full bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full" style={{ width: '100%' }}></div>
          </div>
        </div>
        
        {/* Spam Tokens */}
        <div className="flex flex-col">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-8 h-8 rounded-full bg-red-900/40 flex items-center justify-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
            </div>
            <span className="text-sm font-medium text-red-400">Spam Tokens</span>
          </div>
          <div className="text-3xl font-bold text-red-300">{statistics.spamTokens}</div>
          <div className="text-xs text-red-400/80 mt-1">{statistics.spamTokens > 0 ? `${statistics.spamPercentage}% of total` : 'None detected'}</div>
          
          {/* Progress Bar */}
          <div className="w-full h-1 bg-gray-700 rounded-full mt-2 overflow-hidden">
            <div 
              className="h-full bg-gradient-to-r from-red-500 to-red-600 rounded-full" 
              style={{ width: `${statistics.spamPercentage}%` }}
            ></div>
          </div>
        </div>
        
        {/* Regular Tokens */}
        <div className="flex flex-col">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-8 h-8 rounded-full bg-blue-900/40 flex items-center justify-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-blue-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
            </div>
            <span className="text-sm font-medium text-blue-400">Regular Tokens</span>
          </div>
          <div className="text-3xl font-bold text-blue-300">{statistics.regularTokens}</div>
          <div className="text-xs text-blue-400/80 mt-1">Legitimate tokens</div>
          
          {/* Progress Bar */}
          <div className="w-full h-1 bg-gray-700 rounded-full mt-2 overflow-hidden">
            <div 
              className="h-full bg-gradient-to-r from-blue-500 to-blue-600 rounded-full" 
              style={{ width: `${100 - statistics.spamPercentage}%` }}
            ></div>
          </div>
        </div>
        
        {/* Selected Tokens */}
        <div className="flex flex-col">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-8 h-8 rounded-full bg-green-900/40 flex items-center justify-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-green-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
            </div>
            <span className="text-sm font-medium text-green-400">Selected</span>
          </div>
          <div className="text-3xl font-bold text-green-300">{statistics.selectedTokens}</div>
          <div className="text-xs text-green-400/80 mt-1">Ready to clean</div>
          
          {/* Progress Bar */}
          <div className="w-full h-1 bg-gray-700 rounded-full mt-2 overflow-hidden">
            <div 
              className="h-full bg-gradient-to-r from-green-500 to-green-600 rounded-full" 
              style={{ width: statistics.totalTokens > 0 ? `${(statistics.selectedTokens / statistics.totalTokens) * 100}%` : '0%' }}
            ></div>
          </div>
        </div>
      </div>
    </div>
  );
} 