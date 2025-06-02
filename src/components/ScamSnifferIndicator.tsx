import React from 'react';

interface ScamSnifferIndicatorProps {
  /** Whether the token is flagged by ScamSniffer */
  isFlagged: boolean;
  /** Additional CSS classes */
  className?: string;
  /** Size variant for the indicator */
  size?: 'sm' | 'md' | 'lg';
}

/**
 * ScamSnifferIndicator Component
 * 
 * Displays a nose emoji 👃 with tooltip when a token is flagged by ScamSniffer
 * as potentially malicious according to their community database.
 */
export default function ScamSnifferIndicator({ 
  isFlagged, 
  className = '',
  size = 'md' 
}: ScamSnifferIndicatorProps) {
  // Don't render anything if not flagged
  if (!isFlagged) {
    return null;
  }

  const sizeClasses = {
    sm: 'text-sm',
    md: 'text-base',
    lg: 'text-lg'
  };

  return (
    <span 
      className={`${sizeClasses[size]} cursor-help select-none ml-1 ${className}`}
      title="⚠️ ScamSniffer Alert: This token is flagged as potentially malicious by the ScamSniffer community database"
      role="img"
      aria-label="ScamSniffer Warning: Token flagged as potentially malicious"
    >
      👃
    </span>
  );
}

/**
 * Simplified version with just emoji and basic tooltip
 * Useful when you want minimal footprint
 */
export function SimpleScamSnifferIndicator({ isFlagged }: { isFlagged: boolean }) {
  if (!isFlagged) {
    return null;
  }

  return (
    <span 
      className="text-base cursor-help select-none ml-1"
      title="⚠️ ScamSniffer Alert: This token is flagged as potentially malicious"
      role="img"
      aria-label="ScamSniffer Warning"
    >
      ��
    </span>
  );
} 