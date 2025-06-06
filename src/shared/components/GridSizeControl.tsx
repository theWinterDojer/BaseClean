import React from 'react';

export type GridSize = 'small' | 'medium' | 'large';

interface GridSizeControlProps {
  currentSize: GridSize;
  onSizeChange: (size: GridSize) => void;
  className?: string;
}

export default function GridSizeControl({ 
  currentSize, 
  onSizeChange, 
  className = '' 
}: GridSizeControlProps) {
  const sizes: { value: GridSize; label: string; icon: React.ReactNode }[] = [
    {
      value: 'small',
      label: 'Small grid',
      icon: (
        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
          <rect x="2" y="2" width="2" height="2" rx="0.5" />
          <rect x="6" y="2" width="2" height="2" rx="0.5" />
          <rect x="10" y="2" width="2" height="2" rx="0.5" />
          <rect x="14" y="2" width="2" height="2" rx="0.5" />
          <rect x="2" y="6" width="2" height="2" rx="0.5" />
          <rect x="6" y="6" width="2" height="2" rx="0.5" />
          <rect x="10" y="6" width="2" height="2" rx="0.5" />
          <rect x="14" y="6" width="2" height="2" rx="0.5" />
          <rect x="2" y="10" width="2" height="2" rx="0.5" />
          <rect x="6" y="10" width="2" height="2" rx="0.5" />
          <rect x="10" y="10" width="2" height="2" rx="0.5" />
          <rect x="14" y="10" width="2" height="2" rx="0.5" />
        </svg>
      )
    },
    {
      value: 'medium',
      label: 'Medium grid',
      icon: (
        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
          <rect x="2" y="2" width="3" height="3" rx="0.5" />
          <rect x="7" y="2" width="3" height="3" rx="0.5" />
          <rect x="12" y="2" width="3" height="3" rx="0.5" />
          <rect x="2" y="7" width="3" height="3" rx="0.5" />
          <rect x="7" y="7" width="3" height="3" rx="0.5" />
          <rect x="12" y="7" width="3" height="3" rx="0.5" />
          <rect x="2" y="12" width="3" height="3" rx="0.5" />
          <rect x="7" y="12" width="3" height="3" rx="0.5" />
          <rect x="12" y="12" width="3" height="3" rx="0.5" />
        </svg>
      )
    },
    {
      value: 'large',
      label: 'Large grid',
      icon: (
        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
          <rect x="2" y="2" width="6" height="6" rx="0.5" />
          <rect x="10" y="2" width="6" height="6" rx="0.5" />
          <rect x="2" y="10" width="6" height="6" rx="0.5" />
          <rect x="10" y="10" width="6" height="6" rx="0.5" />
        </svg>
      )
    }
  ];

  return (
    <div className={`flex items-center gap-1 ${className}`}>
      <span className="text-sm text-gray-500 dark:text-gray-400 mr-2">Grid:</span>
      {sizes.map((size) => (
        <button
          key={size.value}
          onClick={() => onSizeChange(size.value)}
          title={size.label}
          className={`p-2 rounded-lg transition-colors duration-200 ${
            currentSize === size.value
              ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400'
              : 'text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 hover:text-gray-700 dark:hover:text-gray-300'
          }`}
        >
          {size.icon}
        </button>
      ))}
    </div>
  );
} 