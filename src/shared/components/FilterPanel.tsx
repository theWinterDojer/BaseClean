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
    className={`py-1.5 px-4 text-sm rounded-md border transition-colors ${
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
  icon?: React.ReactNode;
};

const FilterCategory: React.FC<FilterCategoryProps> = ({ 
  title, 
  titleColor = 'text-blue-300', 
  children,
  description,
  highlighted = false,
  icon
}) => (
  <div className={`space-y-4 ${highlighted ? 'bg-blue-900/20 border border-blue-800 p-4 rounded-lg' : ''}`}>
    <div>
      <h4 className={`${titleColor} text-lg font-semibold flex items-center gap-2`}>
        {icon || (highlighted && (
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-blue-400" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M3 5a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm1 3a1 1 0 100 2h4a1 1 0 100-2H4zm0 3a1 1 0 100 2h4a1 1 0 100-2H4zm10-3a1 1 0 100 2 1 1 0 000-2zm0 3a1 1 0 100 2 1 1 0 000-2z" clipRule="evenodd" />
          </svg>
        ))}
        {title}
      </h4>
      {description && <p className="text-xs text-gray-400 mt-1">{description}</p>}
    </div>
    <div className="flex flex-wrap gap-2">{children}</div>
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
    valueIssues: {
      label: 'Low/Zero Value Tokens',
      description: 'Zero value, dust balances, or very low total value'
    },
    namingIssues: {
      label: 'Suspicious Names/Symbols',
      description: 'Missing/excessive/suspicious naming or spam keywords'
    },
    airdropSignals: {
      label: 'Airdrops/Junk',
      description: 'Suspicious token amounts and common airdrop patterns'
    },
    highRiskIndicators: {
      label: 'High Risk Indicators',
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
    <div className="space-y-5">
      {/* Value Threshold Section - Now more prominent */}
      <FilterCategory 
        title="Value Threshold"
        titleColor="text-blue-300"
        description="Hide tokens with USD value greater than selected threshold"
        highlighted={true}
        icon={
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-blue-400" viewBox="0 0 20 20" fill="currentColor">
            <path d="M8.433 7.418c.155-.103.346-.196.567-.267v1.698a2.305 2.305 0 01-.567-.267C8.07 8.34 8 8.114 8 8c0-.114.07-.34.433-.582zM11 12.849v-1.698c.22.071.412.164.567.267.364.243.433.468.433.582 0 .114-.07.34-.433.582a2.305 2.305 0 01-.567.267z" />
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-13a1 1 0 10-2 0v.092a4.535 4.535 0 00-1.676.662C6.602 6.234 6 7.009 6 8c0 .99.602 1.765 1.324 2.246.48.32 1.054.545 1.676.662v1.941c-.391-.127-.68-.317-.843-.504a1 1 0 10-1.51 1.31c.562.649 1.413 1.076 2.353 1.253V15a1 1 0 102 0v-.092a4.535 4.535 0 001.676-.662C13.398 13.766 14 12.991 14 12c0-.99-.602-1.765-1.324-2.246A4.535 4.535 0 0011 9.092V7.151c.391.127.68.317.843.504a1 1 0 101.511-1.31c-.563-.649-1.413-1.076-2.354-1.253V5z" clipRule="evenodd" />
          </svg>
        }
      >
        <div className="flex flex-wrap gap-2">
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
          highlighted={false}
          icon={
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-green-400" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
          }
        >
          <div className="flex flex-wrap gap-3 w-full">
            {['valueIssues', 'namingIssues', 'airdropSignals', 'highRiskIndicators'].map((key) => {
              const { label, description } = filterLabels[key as keyof SpamFilters] || { 
                label: key, 
                description: ''
              };
              
              return (
                <label
                  key={key}
                  htmlFor={`filter-${key}`}
                  className={`flex items-center gap-2 px-3 py-1.5 rounded-md cursor-pointer transition-colors ${
                    spamFilters[key as keyof SpamFilters] 
                      ? 'bg-green-700/60 border border-green-600 shadow-sm' 
                      : 'bg-gray-700/60 border border-gray-600 hover:bg-gray-700/80'
                  }`}
                  title={description}
                >
                  <input
                    id={`filter-${key}`}
                    type="checkbox"
                    checked={!!spamFilters[key as keyof SpamFilters]}
                    className="h-4 w-4 rounded accent-green-500"
                    onChange={() => toggleFilter(key as keyof SpamFilters)}
                  />
                  <span className="text-sm">{label}</span>
                </label>
              );
            })}
          </div>
        </FilterCategory>
      </div>
    </div>
  );
} 