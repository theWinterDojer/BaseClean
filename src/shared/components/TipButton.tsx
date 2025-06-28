import React, { useState } from 'react';

interface TipButtonProps {
  address: string;
  className?: string;
}

export default function TipButton({ address, className = '' }: TipButtonProps) {
  const [showCopied, setShowCopied] = useState(false);
  
  // Truncate address for display
  const truncatedAddress = `${address.slice(0, 6)}...${address.slice(-4)}`;
  
  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(address);
      setShowCopied(true);
      
      // Haptic feedback on mobile devices
      if ('vibrate' in navigator) {
        navigator.vibrate(50);
      }
      
      // Hide "Copied!" after 2 seconds
      setTimeout(() => {
        setShowCopied(false);
      }, 2000);
    } catch (error) {
      console.error('Failed to copy address:', error);
      // Fallback for older browsers
      const textArea = document.createElement('textarea');
      textArea.value = address;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
      
      // Haptic feedback on mobile devices
      if ('vibrate' in navigator) {
        navigator.vibrate(50);
      }
      
      setShowCopied(true);
      setTimeout(() => {
        setShowCopied(false);
      }, 2000);
    }
  };

  return (
    <div className={`relative ${className}`}>
      <div className="text-sm text-gray-400 text-center">
        <span>Buy me a </span>
        <button
          onClick={handleCopy}
          title={`Click to copy full address: ${address}`}
          aria-label={`Copy crypto tip address ${address}`}
          className="text-gray-300 hover:text-white hover:scale-110 transition-all duration-200 cursor-pointer select-none inline-flex items-center gap-1 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 rounded px-1"
        >
          <span>🍺</span>
          <span>/</span>
          <span>🍵</span>
        </button>
        <span>: </span>
        <button
          onClick={handleCopy}
          title={`Click to copy full address: ${address}`}
          aria-label={`Copy crypto tip address ${address}`}
          className="text-gray-300 hover:text-white hover:bg-gray-700 transition-all duration-200 cursor-pointer underline decoration-dashed underline-offset-2 font-mono text-xs focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 rounded px-1 py-0.5"
        >
          {truncatedAddress}
        </button>
      </div>
      
      {/* Copied notification */}
      {showCopied && (
        <div className="absolute top-full left-1/2 transform -translate-x-1/2 mt-2 px-2 py-1 bg-green-600 text-white text-xs rounded shadow-lg z-10">
          Copied! ❤️🙏
        </div>
      )}
    </div>
  );
} 