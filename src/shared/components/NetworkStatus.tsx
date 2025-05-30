import { useChainId } from 'wagmi';

/**
 * NetworkStatus component displays current network information
 * Updated for Direct Transfer approach - no contract dependency needed!
 * Now supports only Base Mainnet since testnet functionality was removed.
 */
export default function NetworkStatus() {
  const chainId = useChainId();

  // Direct transfer approach - we only need to know the network
  const getNetworkInfo = () => {
    switch (chainId) {
      case 8453: // Base Mainnet
        return {
          name: 'Base Mainnet',
          isSupported: true,
          color: 'bg-green-500'
        };
      default:
        return {
          name: 'Unsupported Network',
          isSupported: false,
          color: 'bg-red-500'
        };
    }
  };

  const networkInfo = getNetworkInfo();

  const getStatusText = () => {
    if (!networkInfo.isSupported) return 'Unsupported network';
    return 'Mainnet';
  };

  return (
    <div className="bg-gray-50 border border-gray-200 rounded-md p-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span 
            className={`w-2 h-2 rounded-full ${networkInfo.color}`}
            title={getStatusText()}
          />
          <span className="text-sm font-medium text-gray-900">{networkInfo.name}</span>
          <span className="text-xs text-gray-500">
            Chain {chainId}
          </span>
        </div>
        
        {/* Direct Transfer - no contract address needed */}
        <div className="text-xs text-green-600 font-medium">
          🔥 Direct Transfer
        </div>
      </div>
      
      {!networkInfo.isSupported && (
        <div className="mt-2 text-xs text-red-700 bg-red-50 rounded px-2 py-1">
          ⚠️ Please switch to Base Mainnet to use BaseClean
        </div>
      )}

      {networkInfo.isSupported && (
        <div className="mt-2 text-xs text-green-700 bg-green-50 rounded px-2 py-1">
          ✅ Direct token burning available - no contracts needed!
        </div>
      )}
    </div>
  );
} 