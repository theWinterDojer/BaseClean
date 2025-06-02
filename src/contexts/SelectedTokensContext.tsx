import React, { createContext, useContext, useState, useCallback } from 'react';
import { Token } from '@/types/token';
import EthSelectionModal from '@/shared/components/EthSelectionModal';

interface SelectedTokensContextValue {
  selectedTokens: Set<string>;
  selectedTokensCount: number;
  toggleToken: (contractAddress: string, tokens?: Token[]) => void;
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

// ETH token addresses on Base network
const ETH_ADDRESSES = [
  '0x4200000000000000000000000000000000000006', // Wrapped ETH on Base
];

const isEthToken = (contractAddress: string, symbol?: string): boolean => {
  const normalizedAddress = contractAddress.toLowerCase();
  const normalizedSymbol = symbol?.toLowerCase();
  
  return ETH_ADDRESSES.some(addr => addr.toLowerCase() === normalizedAddress) ||
         normalizedSymbol === 'eth' ||
         normalizedSymbol === 'weth';
};

export function SelectedTokensProvider({ children }: SelectedTokensProviderProps) {
  const [selectedTokens, setSelectedTokens] = useState<Set<string>>(new Set());
  const [showEthModal, setShowEthModal] = useState(false);
  const [pendingEthToken, setPendingEthToken] = useState<Token | null>(null);
  const [pendingEthAddress, setPendingEthAddress] = useState<string>('');

  const toggleToken = useCallback((contractAddress: string, tokens?: Token[]) => {
    // Check if this is an ETH token and we're trying to select it
    const token = tokens?.find(t => t.contract_address === contractAddress);
    const isEth = isEthToken(contractAddress, token?.contract_ticker_symbol);
    const isCurrentlySelected = selectedTokens.has(contractAddress);
    
    // If we're selecting (not deselecting) an ETH token, show confirmation modal
    if (isEth && !isCurrentlySelected && token) {
      setPendingEthToken(token);
      setPendingEthAddress(contractAddress);
      setShowEthModal(true);
      return;
    }

    // For non-ETH tokens or deselecting ETH, proceed normally
    setSelectedTokens(prev => {
      const newSet = new Set(prev);
      if (newSet.has(contractAddress)) {
        newSet.delete(contractAddress);
      } else {
        newSet.add(contractAddress);
      }
      return newSet;
    });
  }, [selectedTokens]);

  const handleEthConfirm = useCallback(() => {
    if (pendingEthAddress) {
      setSelectedTokens(prev => {
        const newSet = new Set(prev);
        newSet.add(pendingEthAddress);
        return newSet;
      });
    }
    setShowEthModal(false);
    setPendingEthToken(null);
    setPendingEthAddress('');
  }, [pendingEthAddress]);

  const handleEthCancel = useCallback(() => {
    setShowEthModal(false);
    setPendingEthToken(null);
    setPendingEthAddress('');
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
      <EthSelectionModal
        isOpen={showEthModal}
        onClose={handleEthCancel}
        onConfirm={handleEthConfirm}
        ethToken={pendingEthToken}
      />
    </SelectedTokensContext.Provider>
  );
} 