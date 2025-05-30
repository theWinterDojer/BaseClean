import { useState, useCallback, useEffect } from 'react';
import { useAccount } from 'wagmi';
import { Token, SpamFilters, TokenStatistics } from '@/types/token';
import FilterPanel from '@/shared/components/FilterPanel';
import { useTokenFiltering } from '@/hooks/useTokenFiltering';
import { useBurnFlow } from '@/hooks/useBurnFlow';
import { useSelectedTokens } from '@/contexts/SelectedTokensContext';
import { TOKEN_VALUE_THRESHOLDS } from '@/constants/tokens';
import TokenStatisticsComponent from './TokenStatistics';
import TokenListsContainer from './TokenListsContainer';
import BurnTransactionStatus from './BurnTransactionStatus';
import BurnConfirmationModal from './BurnConfirmationModal';
import TokenDataManager from './TokenDataManager';
import TokenSelectionManager from './TokenSelectionManager';

interface TokenScannerProps {
    onTokensUpdate?: (tokens: Token[]) => void;
    onBurnHandlerUpdate?: (handler: (selectedTokensList: Token[]) => void) => void;
}

export default function TokenScanner({ onTokensUpdate, onBurnHandlerUpdate }: TokenScannerProps = {}) {
    const { address } = useAccount();
    const [tokens, setTokens] = useState<Token[]>([]);
    const [maxValue, setMaxValue] = useState<number | null>(10);

    // Use the global selected tokens context
    const { selectedTokens, selectedTokensCount, toggleToken, setSelectedTokens } = useSelectedTokens();

    // Default spam filters - enable all for best detection
    const [spamFilters, setSpamFilters] = useState<SpamFilters>({
        namingIssues: true,
        valueIssues: true,
        airdropSignals: true,
        highRiskIndicators: true
    });

    // Use the extracted burn flow hook
    const {
        burnStatus,
        showConfirmation,
        closeConfirmation,
        executeBurn,
        resetBurnStatus,
        isWaitingForConfirmation,
    } = useBurnFlow();

    // Filter tokens using the existing hook
    const { spamTokens, nonSpamTokens } = useTokenFiltering(tokens, spamFilters, maxValue);

    // Handle tokens loaded from TokenDataManager
    const handleTokensLoaded = useCallback((loadedTokens: Token[]) => {
        setTokens(loadedTokens);
        onTokensUpdate?.(loadedTokens);
    }, [onTokensUpdate]);

    // Handle burn confirmation with proper null checks
    const handleBurnSelected = useCallback(async (selectedTokensList: Token[]) => {
        // Ensure we have valid tokens and the array is not null/undefined
        if (!selectedTokensList || !Array.isArray(selectedTokensList) || selectedTokensList.length === 0) {
            console.warn('No tokens selected for burning');
            return;
        }
        await showConfirmation(selectedTokensList);
    }, [showConfirmation]);

    // Expose burn handler to parent component only after tokens are loaded
    useEffect(() => {
        // Only expose the handler if we have tokens loaded and the callback exists
        if (onBurnHandlerUpdate && tokens.length > 0) {
            onBurnHandlerUpdate(handleBurnSelected);
        }
    }, [handleBurnSelected, onBurnHandlerUpdate, tokens.length]);

    // Handle burn execution
    const handleConfirmBurn = useCallback(async (updateTokens: (tokens: Token[]) => void) => {
        if (!address) return;
        
        try {
            await executeBurn(
                address,
                updateTokens,
                setSelectedTokens
            );
        } catch (error) {
            // This catch block ensures any unhandled errors in the burn process
            // are captured and don't bubble up to React's error boundary
            console.error('Error in burn execution:', error);
            
            // The error should already be handled by the useBurnFlow hook,
            // but this provides an additional safety net
        }
    }, [address, executeBurn, setSelectedTokens]);

    // Statistics data for display
    const statistics: TokenStatistics = {
        totalTokens: tokens.length,
        spamTokens: spamTokens.length,
        regularTokens: nonSpamTokens.length,
        selectedTokens: selectedTokensCount,
        spamPercentage: tokens.length > 0 ? Math.round((spamTokens.length / tokens.length) * 100) : 0
    };

    return (
        <TokenDataManager onTokensLoaded={handleTokensLoaded}>
            {({ loading, isConnected, isClient, updateTokens }) => (
                isClient && isConnected && !loading && (
                    <div className="space-y-5">
                        {/* Spacer for fixed sticky header when tokens are selected */}
                        {selectedTokensCount > 0 && (
                            <div className="h-12" />
                        )}

                        {/* Burn Transaction Status */}
                        <BurnTransactionStatus
                            burnStatus={burnStatus}
                            onClose={resetBurnStatus}
                            isWaitingForConfirmation={isWaitingForConfirmation}
                        />

                        {/* Filter Panel (includes Value Threshold and Spam Detection) */}
                        <FilterPanel 
                            spamFilters={spamFilters}
                            setSpamFilters={setSpamFilters}
                            maxValue={maxValue}
                            setMaxValue={setMaxValue}
                            valueFilters={TOKEN_VALUE_THRESHOLDS}
                        />
                        
                        {/* Token Selection Management (includes Bulk Actions only) */}
                        <TokenSelectionManager
                            spamTokens={spamTokens}
                            selectedTokens={selectedTokens}
                            onSelectedTokensChange={setSelectedTokens}
                        />

                        {/* Token Statistics */}
                        <TokenStatisticsComponent statistics={statistics} />
                        
                        {/* Token Lists Container */}
                        <TokenListsContainer
                            spamTokens={spamTokens}
                            nonSpamTokens={nonSpamTokens}
                            selectedTokens={selectedTokens}
                            toggleToken={toggleToken}
                        />
                        
                        {/* Burn Confirmation Modal */}
                        <BurnConfirmationModal
                            tokens={burnStatus.tokensToConfirm}
                            isOpen={burnStatus.isConfirmationOpen}
                            onClose={closeConfirmation}
                            onConfirm={() => handleConfirmBurn(updateTokens)}
                        />
                    </div>
                )
            )}
        </TokenDataManager>
    );
} 