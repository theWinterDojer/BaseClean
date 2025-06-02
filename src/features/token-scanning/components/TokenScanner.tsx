import { useState, useCallback } from 'react';
import { useAccount } from 'wagmi';
import { Token, SpamFilters, TokenStatistics } from '@/types/token';
import FilterPanel from '@/shared/components/FilterPanel';
import { useTokenFiltering } from '@/hooks/useTokenFiltering';
import { useScamSniffer } from '@/hooks/useScamSniffer';
import { useBurnFlow } from '@/hooks/useBurnFlow';
import { useSelectedTokens } from '@/contexts/SelectedTokensContext';
import { TOKEN_VALUE_THRESHOLDS } from '@/constants/tokens';
import TokenStatisticsComponent from './TokenStatistics';
import TokenListsContainer from './TokenListsContainer';
import BurnTransactionStatus from './BurnTransactionStatus';
import BurnConfirmationModal from './BurnConfirmationModal';
import TokenDataManager from './TokenDataManager';
import TokenSelectionManager from './TokenSelectionManager';
import StickySelectedTokensBarContainer from '@/shared/components/StickySelectedTokensBarContainer';

export default function TokenScanner() {
    const { address } = useAccount();
    const [rawTokens, setRawTokens] = useState<Token[]>([]);
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

    // Enhance tokens with ScamSniffer data
    const { 
        tokens: scamSnifferEnhancedTokens, 
        isLoading: scamSnifferLoading
    } = useScamSniffer(rawTokens);

    // Use the extracted burn flow hook
    const {
        burnStatus,
        showConfirmation,
        closeConfirmation,
        executeBurn,
        resetBurnStatus,
        isWaitingForConfirmation,
    } = useBurnFlow();

    // Filter tokens using the existing hook with ScamSniffer-enhanced tokens
    const { spamTokens, nonSpamTokens } = useTokenFiltering(scamSnifferEnhancedTokens, spamFilters, maxValue);

    // Handle tokens loaded from TokenDataManager
    const handleTokensLoaded = useCallback((loadedTokens: Token[]) => {
        setRawTokens(loadedTokens);
        console.log(`TokenScanner: Loaded ${loadedTokens.length} raw tokens for ScamSniffer checking`);
    }, []);

    // Handle burn confirmation with proper null checks
    const handleBurnSelected = useCallback(async (selectedTokensList: Token[]) => {
        // Ensure we have valid tokens and the array is not null/undefined
        if (!selectedTokensList || !Array.isArray(selectedTokensList) || selectedTokensList.length === 0) {
            console.warn('No tokens selected for burning');
            return;
        }
        await showConfirmation(selectedTokensList);
    }, [showConfirmation]);

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

    // Statistics data for display (using ScamSniffer-enhanced tokens)
    const statistics: TokenStatistics = {
        totalTokens: scamSnifferEnhancedTokens.length,
        spamTokens: spamTokens.length,
        regularTokens: nonSpamTokens.length,
        selectedTokens: selectedTokensCount,
        spamPercentage: scamSnifferEnhancedTokens.length > 0 ? Math.round((spamTokens.length / scamSnifferEnhancedTokens.length) * 100) : 0
    };

    return (
        <>
            {/* Global Sticky Header - appears when tokens are selected */}
            {selectedTokensCount > 0 && (
                <div className="fixed top-16 left-0 right-0 z-20">
                    <StickySelectedTokensBarContainer 
                        tokens={scamSnifferEnhancedTokens}
                        onBurnSelected={handleBurnSelected}
                    />
                </div>
            )}
            
            <TokenDataManager onTokensLoaded={handleTokensLoaded}>
                {({ loading, isConnected, isClient, updateTokens }) => (
                    isClient && isConnected && !loading && (
                        <div className="space-y-5">
                            {/* Spacer for fixed sticky header when tokens are selected */}
                            {selectedTokensCount > 0 && (
                                <div className="h-12" />
                            )}

                            {/* ScamSniffer Loading Indicator (subtle) */}
                            {scamSnifferLoading && (
                                <div className="text-xs text-gray-500 text-center py-1">
                                    🔍 Checking tokens against ScamSniffer database...
                                </div>
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
        </>
    );
} 