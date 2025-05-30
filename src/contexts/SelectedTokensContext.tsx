import React, { createContext, useContext, useState, useCallback } from 'react';

interface SelectedTokensContextValue {
  selectedTokens: Set<string>;
  selectedTokensCount: number;
  toggleToken: (contractAddress: string) => void;
  setSelectedTokens: React.Dispatch<React.SetStateAction<Set<string>>>;
  clearSelectedTokens: () => void;
}

const SelectedTokensContext = createContext<SelectedTokensContextValue | undefined>(undefined);

export function useSelectedTokens() {
  const context = useContext(SelectedTokensContext);
  if (context === undefined) {
    throw new Error('useSelectedTokens must be used within a SelectedTokensProvider');
  }
  return context;
}

interface SelectedTokensProviderProps {
  children: React.ReactNode;
}

export function SelectedTokensProvider({ children }: SelectedTokensProviderProps) {
  const [selectedTokens, setSelectedTokens] = useState<Set<string>>(new Set());

  const toggleToken = useCallback((contractAddress: string) => {
    setSelectedTokens(prev => {
      const newSet = new Set(prev);
      if (newSet.has(contractAddress)) {
        newSet.delete(contractAddress);
      } else {
        newSet.add(contractAddress);
      }
      return newSet;
    });
  }, []);

  const clearSelectedTokens = useCallback(() => {
    setSelectedTokens(new Set());
  }, []);

  const value: SelectedTokensContextValue = {
    selectedTokens,
    selectedTokensCount: selectedTokens.size,
    toggleToken,
    setSelectedTokens,
    clearSelectedTokens,
  };

  return (
    <SelectedTokensContext.Provider value={value}>
      {children}
    </SelectedTokensContext.Provider>
  );
} 