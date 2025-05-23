import { useCallback } from 'react';
import { Token } from '@/types/token';
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

  // Select all spam tokens
  const selectAllSpam = useCallback(() => {
    onSelectedTokensChange(new Set(spamTokens.map(t => t.contract_address)));
  }, [spamTokens, onSelectedTokensChange]);

  // Deselect all tokens
  const deselectAll = useCallback(() => {
    onSelectedTokensChange(new Set());
  }, [onSelectedTokensChange]);

  return (
    <BulkActions 
      onSelectAllSpam={selectAllSpam}
      spamTokensCount={spamTokens.length}
      selectedTokensCount={selectedTokens.size}
      onDeselectAll={deselectAll}
    />
  );
} 