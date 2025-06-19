import { useState, useCallback } from 'react';
import { useAccount } from 'wagmi';
import { Token, SpamFilters, TokenStatistics } from '@/types/token';
import FilterPanel from '@/shared/components/FilterPanel';
import { useTokenFiltering } from '@/hooks/useTokenFiltering';
import { useScamSniffer } from '@/hooks/useScamSniffer';
import { useUniversalBurnFlow } from '@/hooks/useUniversalBurnFlow';
import { useSelectedTokens } from '@/contexts/SelectedItemsContext';
import { TOKEN_VALUE_THRESHOLDS } from '@/constants/tokens';
import TokenStatisticsComponent from './TokenStatistics';
import TokenListsContainer from './TokenListsContainer';
import UniversalBurnConfirmationModal from '@/shared/components/UniversalBurnConfirmationModal';
import UniversalBurnProgress from '@/shared/components/UniversalBurnProgress';
import TokenDataManager from './TokenDataManager';

import FloatingActionBar from '@/shared/components/FloatingActionBar';

interface TokenScannerProps {
  showDisclaimer: boolean;
}

export default function TokenScanner({ showDisclaimer }: TokenScannerProps) {
    const { address } = useAccount();
    const [rawTokens, setRawTokens] = useState<Token[]>([]);
    const [maxValue, setMaxValue] = useState<number | null>(10);

    // Use the global selected tokens context
    const { selectedTokens, selectedTokensCount, toggleToken, setSelectedTokens } = useSelectedTokens();

    // Default spam filters - enable all for best detection
    // Phase 17.2: Simplified to 3 filters (removed high risk indicators)
    const [spamFilters, setSpamFilters] = useState<SpamFilters>({
        namingIssues: true,
        valueIssues: true,
        airdropSignals: true
    });

    // Enhance tokens with ScamSniffer data
    const { 
        tokens: scamSnifferEnhancedTokens, 
        isLoading: scamSnifferLoading
    } = useScamSniffer(rawTokens);

    // Use the universal burn flow hook instead of token-specific
    const {
        burnStatus,
        showConfirmation,
        closeConfirmation,
        executeBurn,
        closeProgress
    } = useUniversalBurnFlow();

    // Filter tokens using the existing hook with ScamSniffer-enhanced tokens
    const { spamTokens, nonSpamTokens } = useTokenFiltering(scamSnifferEnhancedTokens, spamFilters, maxValue);

    // Handle tokens loaded from TokenDataManager
    const handleTokensLoaded = useCallback((loadedTokens: Token[]) => {
        setRawTokens(loadedTokens);
        console.log(`TokenScanner: Loaded ${loadedTokens.length} raw tokens for ScamSniffer checking`);
    }, []);

    // Handle burn confirmation with proper null checks
    const handleBurnSelected = useCallback(async () => {
        const selectedTokensList = scamSnifferEnhancedTokens.filter(token => 
            selectedTokens.has(token.contract_address)
        );
        
        // Ensure we have valid tokens and the array is not null/undefined
        if (!selectedTokensList || selectedTokensList.length === 0) {
            console.warn('No tokens selected for burning');
            return;
        }
        showConfirmation(selectedTokensList);
    }, [scamSnifferEnhancedTokens, selectedTokens, showConfirmation]);

    // Handle deselect all
    const handleDeselectAll = useCallback(() => {
        setSelectedTokens(new Set());
    }, [setSelectedTokens]);

    // Handle burn execution
    const handleConfirmBurn = useCallback(async (updateTokens: (tokens: Token[]) => void) => {
        if (!address) return;
        
        await executeBurn();
        
        // After burn completes successfully, update the token list and clear selections
        if (burnStatus.success) {
            updateTokens(scamSnifferEnhancedTokens);
            setSelectedTokens(new Set());
        }
    }, [address, executeBurn, burnStatus.success, scamSnifferEnhancedTokens, setSelectedTokens]);

    // Handle progress modal close
    const handleCloseProgress = useCallback(() => {
        closeProgress();
        // Refresh tokens if needed
        if (burnStatus.success && burnStatus.results.successful.length > 0) {
            // The updateTokens function will be passed from TokenDataManager
        }
    }, [closeProgress, burnStatus]);

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
            {/* Universal Burn Progress Modal */}
            <UniversalBurnProgress
                burnStatus={burnStatus}
                onClose={handleCloseProgress}
            />

            <TokenDataManager onTokensLoaded={handleTokensLoaded} showDisclaimer={showDisclaimer}>
                {({ loading, isConnected, isClient, updateTokens }) => (
                    isClient && isConnected && !loading && (
                        <div className="space-y-5 pb-24">
                            {/* ScamSniffer Loading Indicator (subtle) */}
                            {scamSnifferLoading && (
                                <div className="text-xs text-gray-500 text-center py-1">
                                    🔍 Checking tokens against ScamSniffer database...
                                </div>
                            )}

                            {/* Filter Panel (includes Value Threshold and Spam Detection) */}
                            <FilterPanel 
                                spamFilters={spamFilters}
                                setSpamFilters={setSpamFilters}
                                maxValue={maxValue}
                                setMaxValue={setMaxValue}
                                valueFilters={TOKEN_VALUE_THRESHOLDS}
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
                            
                            {/* Universal Burn Confirmation Modal */}
                            {burnStatus.burnContext && (
                                <UniversalBurnConfirmationModal
                                    burnContext={burnStatus.burnContext}
                                    isOpen={burnStatus.isConfirmationOpen}
                                    onClose={closeConfirmation}
                                    onConfirm={() => handleConfirmBurn(updateTokens)}
                                    isConfirming={burnStatus.inProgress && !burnStatus.isProgressOpen}
                                />
                            )}
                        </div>
                    )
                )}
            </TokenDataManager>

            {/* Unified Floating Action Bar - appears when tokens are selected */}
            <FloatingActionBar
                onBurnSelected={handleBurnSelected}
                onDeselectAll={handleDeselectAll}
                isBurning={burnStatus.inProgress}
            />
        </>
    );
} 