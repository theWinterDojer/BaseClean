import { useCallback } from 'react';
import { Token } from '@/types/token';
import { useSelectedTokens } from '@/contexts/SelectedTokensContext';
import StickySelectedTokensBar from './StickySelectedTokensBar';

interface StickySelectedTokensBarContainerProps {
  tokens: Token[];
  onBurnSelected: (selectedTokensList: Token[]) => void;
}

export default function StickySelectedTokensBarContainer({
  tokens,
  onBurnSelected
}: StickySelectedTokensBarContainerProps) {
  const { selectedTokens, selectedTokensCount, clearSelectedTokens } = useSelectedTokens();

  const handleBurnSelected = useCallback(() => {
    const selectedTokensList = tokens.filter(token => 
      selectedTokens.has(token.contract_address)
    );
    
    // Only proceed if we have tokens selected
    if (selectedTokensList.length === 0) {
      console.warn('No tokens selected for burning');
      return;
    }
    
    onBurnSelected(selectedTokensList);
  }, [tokens, selectedTokens, onBurnSelected]);

  return (
    <StickySelectedTokensBar
      selectedTokensCount={selectedTokensCount}
      onBurnSelected={handleBurnSelected}
      onDeselectAll={clearSelectedTokens}
    />
  );
} 