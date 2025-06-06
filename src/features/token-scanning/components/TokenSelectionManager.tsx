import { useCallback } from 'react';
import { Token } from '@/types/token';
import { useSelectedItems } from '@/contexts/SelectedItemsContext';
import BulkActions from './BulkActions';

interface TokenSelectionManagerProps {
  spamTokens: Token[];
  selectedTokens: Set<string>;
  onSelectedTokensChange: (newSelection: Set<string>) => void;
}

/**
 * Component responsible for managing token selection state and bulk actions
 */
export default function TokenSelectionManager({
  spamTokens,
  selectedTokens,
  onSelectedTokensChange,
}: TokenSelectionManagerProps) {

  // Get direct access to the context to work around the setSelectedTokens limitation
  const { setSelectedItems, selectedItems, clearSelectedTokens } = useSelectedItems();

  // Select all spam tokens - work directly with selectedItems to avoid Set<string> limitations
  const selectAllSpam = useCallback(() => {
    // Get current non-token items (e.g., NFTs)
    const currentNonTokenItems = selectedItems.filter(item => item.type !== 'token');
    
    // Create token items for all spam tokens
    const spamTokenItems = spamTokens.map(token => ({
      type: 'token' as const,
      data: token
    }));
    
    // Set the new selection with non-tokens plus all spam tokens
    setSelectedItems([...currentNonTokenItems, ...spamTokenItems]);
  }, [spamTokens, selectedItems, setSelectedItems]);

  // Deselect all tokens - use the working clearSelectedTokens method
  const deselectAll = useCallback(() => {
    clearSelectedTokens();
  }, [clearSelectedTokens]);

  return (
    <BulkActions 
      onSelectAllSpam={selectAllSpam}
      spamTokensCount={spamTokens.length}
      selectedTokensCount={selectedTokens.size}
      onDeselectAll={deselectAll}
    />
  );
} 