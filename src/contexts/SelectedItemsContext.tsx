import React, { createContext, useContext, useState, useCallback, useMemo } from 'react';
import { Token } from '@/types/token';
import { NFT, BurnableItem, BurnableItemToken, BurnableItemNFT } from '@/types/nft';
import EthSelectionModal from '@/shared/components/EthSelectionModal';
import UnifiedBurnManager from '@/shared/components/UnifiedBurnManager';

interface SelectedItemsContextValue {
  // Unified selection state
  selectedItems: BurnableItem[];
  selectedItemsCount: number;
  
  // Token-specific getters (for backward compatibility)
  selectedTokens: Set<string>;
  selectedTokensCount: number;
  
  // NFT-specific getters
  selectedNFTs: NFT[];
  selectedNFTsCount: number;
  
  // Selection methods
  toggleToken: (contractAddress: string, tokens?: Token[]) => void;
  toggleNFT: (nft: NFT) => void;
  toggleItem: (item: BurnableItem) => void;
  
  // Bulk operations
  setSelectedTokens: React.Dispatch<React.SetStateAction<Set<string>>>;
  setSelectedNFTs: (nfts: NFT[]) => void;
  setSelectedItems: (items: BurnableItem[]) => void;
  
  // Clear operations
  clearSelectedTokens: () => void;
  clearSelectedNFTs: () => void;
  clearAllSelectedItems: () => void;
  
  // Helper functions
  isTokenSelected: (contractAddress: string) => boolean;
  isNFTSelected: (contractAddress: string, tokenId: string) => boolean;
  getSelectedTokensList: (allTokens: Token[]) => Token[];
  
  // Burn modal state
  isBurnModalOpen: boolean;
  openBurnModal: () => void;
  closeBurnModal: () => void;
}

const SelectedItemsContext = createContext<SelectedItemsContextValue | undefined>(undefined);

export function useSelectedItems() {
  const context = useContext(SelectedItemsContext);
  if (context === undefined) {
    throw new Error('useSelectedItems must be used within a SelectedItemsProvider');
  }
  return context;
}

// Backward compatibility hook
export function useSelectedTokens() {
  const context = useSelectedItems();
  return {
    selectedTokens: context.selectedTokens,
    selectedTokensCount: context.selectedTokensCount,
    toggleToken: context.toggleToken,
    setSelectedTokens: context.setSelectedTokens,
    clearSelectedTokens: context.clearSelectedTokens,
  };
}

interface SelectedItemsProviderProps {
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

export function SelectedItemsProvider({ children }: SelectedItemsProviderProps) {
  const [selectedItems, setSelectedItems] = useState<BurnableItem[]>([]);
  const [showEthModal, setShowEthModal] = useState(false);
  const [pendingEthToken, setPendingEthToken] = useState<Token | null>(null);
  const [pendingEthAddress, setPendingEthAddress] = useState<string>('');
  const [isBurnModalOpen, setIsBurnModalOpen] = useState(false);

  // Computed values for backward compatibility
  const selectedTokens = useMemo(() => {
    const tokenAddresses = selectedItems
      .filter((item): item is BurnableItemToken => item.type === 'token')
      .map(item => item.data.contract_address);
    return new Set(tokenAddresses);
  }, [selectedItems]);

  const selectedNFTs = useMemo(() => {
    return selectedItems
      .filter((item): item is BurnableItemNFT => item.type === 'nft')
      .map(item => item.data);
  }, [selectedItems]);

  const selectedTokensCount = selectedTokens.size;
  const selectedNFTsCount = selectedNFTs.length;
  const selectedItemsCount = selectedItems.length;

  // Helper functions
  const isTokenSelected = useCallback((contractAddress: string) => {
    return selectedTokens.has(contractAddress);
  }, [selectedTokens]);

  const isNFTSelected = useCallback((contractAddress: string, tokenId: string) => {
    return selectedItems.some(item => 
      item.type === 'nft' && 
      item.data.contract_address === contractAddress && 
      item.data.token_id === tokenId
    );
  }, [selectedItems]);

  const getSelectedTokensList = useCallback((allTokens: Token[]): Token[] => {
    return allTokens.filter(token => selectedTokens.has(token.contract_address));
  }, [selectedTokens]);

  // Token selection (maintains existing behavior)
  const toggleToken = useCallback((contractAddress: string, tokens?: Token[]) => {
    const token = tokens?.find(t => t.contract_address === contractAddress);
    const isEth = isEthToken(contractAddress, token?.contract_ticker_symbol);
    const isCurrentlySelected = isTokenSelected(contractAddress);
    
    // If we're selecting (not deselecting) an ETH token, show confirmation modal
    if (isEth && !isCurrentlySelected && token) {
      setPendingEthToken(token);
      setPendingEthAddress(contractAddress);
      setShowEthModal(true);
      return;
    }

    // Toggle token selection
    setSelectedItems(prev => {
      if (isCurrentlySelected) {
        // Remove token
        return prev.filter(item => 
          !(item.type === 'token' && item.data.contract_address === contractAddress)
        );
      } else if (token) {
        // Add token
        return [...prev, { type: 'token' as const, data: token }];
      }
      return prev;
    });
  }, [isTokenSelected]);

  // NFT selection
  const toggleNFT = useCallback((nft: NFT) => {
    const isCurrentlySelected = isNFTSelected(nft.contract_address, nft.token_id);
    
    setSelectedItems(prev => {
      if (isCurrentlySelected) {
        // Remove NFT
        return prev.filter(item => 
          !(item.type === 'nft' && 
            item.data.contract_address === nft.contract_address && 
            item.data.token_id === nft.token_id)
        );
      } else {
        // Add NFT
        return [...prev, { type: 'nft', data: nft }];
      }
    });
  }, [isNFTSelected]);

  // Generic item selection
  const toggleItem = useCallback((item: BurnableItem) => {
    if (item.type === 'token') {
      toggleToken(item.data.contract_address, [item.data]);
    } else {
      toggleNFT(item.data);
    }
  }, [toggleToken, toggleNFT]);

  // ETH confirmation handlers
  const handleEthConfirm = useCallback(() => {
    if (pendingEthAddress && pendingEthToken) {
      setSelectedItems(prev => [...prev, { type: 'token', data: pendingEthToken }]);
    }
    setShowEthModal(false);
    setPendingEthToken(null);
    setPendingEthAddress('');
  }, [pendingEthAddress, pendingEthToken]);

  const handleEthCancel = useCallback(() => {
    setShowEthModal(false);
    setPendingEthToken(null);
    setPendingEthAddress('');
  }, []);

  // Bulk setters
  const setSelectedTokens = useCallback((setter: React.SetStateAction<Set<string>>) => {
    // This is for backward compatibility - convert Set<string> back to items
    // Note: This is limited because we lose the actual Token objects
    // Components should migrate to using the new methods
    if (typeof setter === 'function') {
      const currentSet = selectedTokens;
      setter(currentSet); // Call setter but don't use result since we can't reconstruct Token objects
      
      // Remove all tokens and keep only NFTs
      setSelectedItems(prev => prev.filter(item => item.type === 'nft'));
      
      // This method has limitations - we can't add tokens without the full Token objects
      console.warn('setSelectedTokens with Set<string> has limitations. Consider using setSelectedItems or providing Token objects.');
    } else {
      // Direct set - also limited
      setSelectedItems(prev => prev.filter(item => item.type === 'nft'));
    }
  }, [selectedTokens]);

  const setSelectedNFTs = useCallback((nfts: NFT[]) => {
    setSelectedItems(prev => {
      const tokensOnly = prev.filter(item => item.type === 'token');
      const nftItems: BurnableItemNFT[] = nfts.map(nft => ({ type: 'nft', data: nft }));
      return [...tokensOnly, ...nftItems];
    });
  }, []);

  // Clear operations
  const clearSelectedTokens = useCallback(() => {
    setSelectedItems(prev => prev.filter(item => item.type === 'nft'));
  }, []);

  const clearSelectedNFTs = useCallback(() => {
    setSelectedItems(prev => prev.filter(item => item.type === 'token'));
  }, []);

  const clearAllSelectedItems = useCallback(() => {
    setSelectedItems([]);
  }, []);

  // Burn modal methods
  const openBurnModal = useCallback(() => {
    setIsBurnModalOpen(true);
  }, []);

  const closeBurnModal = useCallback(() => {
    setIsBurnModalOpen(false);
  }, []);

  // Handle burn completion
  const handleBurnComplete = useCallback(() => {
    clearAllSelectedItems();
  }, [clearAllSelectedItems]);

  const value: SelectedItemsContextValue = {
    // Unified state
    selectedItems,
    selectedItemsCount,
    
    // Token-specific (backward compatibility)
    selectedTokens,
    selectedTokensCount,
    
    // NFT-specific
    selectedNFTs,
    selectedNFTsCount,
    
    // Selection methods
    toggleToken,
    toggleNFT,
    toggleItem,
    
    // Bulk operations
    setSelectedTokens,
    setSelectedNFTs,
    setSelectedItems,
    
    // Clear operations
    clearSelectedTokens,
    clearSelectedNFTs,
    clearAllSelectedItems,
    
    // Helper functions
    isTokenSelected,
    isNFTSelected,
    getSelectedTokensList,
    
    // Burn modal state
    isBurnModalOpen,
    openBurnModal,
    closeBurnModal,
  };

  return (
    <SelectedItemsContext.Provider value={value}>
      {children}
      <EthSelectionModal
        isOpen={showEthModal}
        onClose={handleEthCancel}
        onConfirm={handleEthConfirm}
        ethToken={pendingEthToken}
      />
      <UnifiedBurnManager
        selectedItems={selectedItems}
        isOpen={isBurnModalOpen}
        onClose={closeBurnModal}
        onComplete={handleBurnComplete}
      />
    </SelectedItemsContext.Provider>
  );
} 