import React, { useMemo } from 'react';
import { SpamFilters } from '@/types/token';

type FilterPanelProps = {
  spamFilters: SpamFilters;
  setSpamFilters: React.Dispatch<React.SetStateAction<SpamFilters>>;
  maxValue: number | null;
  setMaxValue: React.Dispatch<React.SetStateAction<number | null>>;
  valueFilters: number[];
};

type FilterButtonProps = {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
  className?: string;
};

const FilterButton: React.FC<FilterButtonProps> = ({ active, onClick, children, className = '' }) => (
  <button
    onClick={onClick}
    className={`py-1 px-3 text-sm rounded border transition-colors ${
      active
        ? 'bg-blue-700/60 border-blue-600 text-white shadow-sm'
        : 'bg-gray-700/60 border-gray-600 text-gray-200 hover:bg-gray-700'
    } ${className}`}
  >
    {children}
  </button>
);

type FilterCategoryProps = {
  title: string;
  titleColor?: string;
  children: React.ReactNode;
  description?: string;
  highlighted?: boolean;
};

const FilterCategory: React.FC<FilterCategoryProps> = ({ 
  title, 
  titleColor = 'text-blue-300', 
  children,
  description,
  highlighted = false
}) => (
  <div className={`space-y-2 ${highlighted ? 'bg-blue-900/20 border border-blue-800 p-4 rounded-lg' : ''}`}>
    <h4 className={`${titleColor} font-medium ${highlighted ? 'text-lg' : ''} flex items-center gap-2`}>
      {highlighted && (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-blue-400" viewBox="0 0 20 20" fill="currentColor">
          <path fillRule="evenodd" d="M3 5a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm1 3a1 1 0 100 2h4a1 1 0 100-2H4zm0 3a1 1 0 100 2h4a1 1 0 100-2H4zm10-3a1 1 0 100 2 1 1 0 000-2zm0 3a1 1 0 100 2 1 1 0 000-2z" clipRule="evenodd" />
        </svg>
      )}
      {title}
    </h4>
    <div className="flex flex-wrap gap-2">{children}</div>
    {description && <p className="text-xs text-gray-400 mt-1">{description}</p>}
  </div>
);

export default function FilterPanel({
  spamFilters,
  setSpamFilters,
  maxValue,
  setMaxValue,
  valueFilters
}: FilterPanelProps) {
  const filterLabels = useMemo(() => ({
    namingIssues: {
      label: 'Suspicious names/symbols',
      description: 'Missing/excessive/suspicious naming or spam keywords'
    },
    valueIssues: {
      label: 'Low/zero value tokens',
      description: 'Zero value, dust balances, or very low total value'
    },
    airdropSignals: {
      label: 'Airdrops/Junk',
      description: 'Suspicious token amounts and common airdrop patterns'
    },
    highRiskIndicators: {
      label: 'High risk indicators',
      description: 'Tokens with high likelihood of being scams or having no value'
    }
  }), []);

  const toggleFilter = (key: keyof SpamFilters) => {
    setSpamFilters(prev => ({ ...prev, [key]: !prev[key] }));
  };

  // Quick filter presets
  const setAllFilters = (value: boolean) => {
    setSpamFilters({
      namingIssues: value,
      valueIssues: value,
      airdropSignals: value,
      highRiskIndicators: value
    });
  };

  return (
    <div className="space-y-6">
      {/* Value Threshold Section - Now more prominent */}
      <FilterCategory 
        title="Value Threshold"
        titleColor="text-blue-300"
        description="Hide tokens with USD value greater than selected threshold"
        highlighted={true}
      >
        <div className="flex flex-wrap gap-2 mt-2">
          {valueFilters.map((value) => (
            <FilterButton
              key={value}
              active={maxValue === value}
              onClick={() => setMaxValue(value)}
              className={maxValue === value ? 'bg-blue-600 border-blue-500 shadow-md' : ''}
            >
              Hide &gt; ${value}
            </FilterButton>
          ))}
          <FilterButton
            active={maxValue === null}
            onClick={() => setMaxValue(null)}
            className={maxValue === null ? 'bg-blue-600 border-blue-500 shadow-md' : ''}
          >
            Show All
          </FilterButton>
        </div>
      </FilterCategory>

      {/* Spam Detection Section */}
      <div className="bg-gray-800/60 border border-gray-700 rounded-lg p-4">
        <FilterCategory
          title="Spam Detection"
          titleColor="text-green-300"
          description="Enable detection rules to identify potential spam tokens"
        >
          <div className="flex flex-wrap gap-3 mb-3 w-full">
            <button
              onClick={() => setAllFilters(true)}
              className="px-3 py-2 bg-green-700/40 border border-green-600/50 rounded-md text-sm text-green-200 hover:bg-green-700/60 transition-colors"
            >
              Enable All
            </button>
            <button
              onClick={() => setAllFilters(false)}
              className="px-3 py-2 bg-gray-700/40 border border-gray-600/50 rounded-md text-sm text-gray-200 hover:bg-gray-700/60 transition-colors"
            >
              Disable All
            </button>
          </div>
          
          {(Object.keys(spamFilters) as Array<keyof SpamFilters>).map((key) => {
            const { label, description } = filterLabels[key] || { 
              label: key, 
              description: ''
            };
            
            return (
              <label
                key={key}
                htmlFor={`filter-${key}`}
                className={`flex items-center gap-2 px-3 py-2 rounded-md cursor-pointer transition-colors ${
                  spamFilters[key] 
                    ? 'bg-green-700/60 border border-green-600 shadow-sm' 
                    : 'bg-gray-700/60 border border-gray-600 hover:bg-gray-700/80'
                }`}
                title={description}
              >
                <input
                  id={`filter-${key}`}
                  type="checkbox"
                  checked={!!spamFilters[key]}
                  className="h-4 w-4 rounded accent-green-500"
                  onChange={() => toggleFilter(key)}
                />
                <span>{label}</span>
              </label>
            );
          })}
        </FilterCategory>
      </div>
    </div>
  );
} 