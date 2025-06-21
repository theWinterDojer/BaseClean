import { useState, useCallback } from 'react';
import { Token, SpamFilters, TokenStatistics } from '@/types/token';
import FilterPanel from '@/shared/components/FilterPanel';
import { useTokenFiltering } from '@/hooks/useTokenFiltering';
import { useScamSniffer } from '@/hooks/useScamSniffer';
import { useSelectedTokens, useSelectedItems } from '@/contexts/SelectedItemsContext';
import { TOKEN_VALUE_THRESHOLDS } from '@/constants/tokens';
import TokenStatisticsComponent from './TokenStatistics';
import TokenListsContainer from './TokenListsContainer';
import TokenDataManager from './TokenDataManager';
import FloatingActionBar from '@/shared/components/FloatingActionBar';

interface TokenScannerProps {
  showDisclaimer: boolean;
}

export default function TokenScanner({ showDisclaimer }: TokenScannerProps) {
    const [rawTokens, setRawTokens] = useState<Token[]>([]);
    const [maxValue, setMaxValue] = useState<number | null>(10);

    // Use the global selected tokens context
    const { selectedTokens, selectedTokensCount, toggleToken, setSelectedTokens } = useSelectedTokens();
    
    // Get burned token addresses from context
    const { burnedTokenAddresses } = useSelectedItems();

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

    // Filter out successfully burned tokens
    const visibleTokens = scamSnifferEnhancedTokens.filter(
        token => !burnedTokenAddresses.has(token.contract_address)
    );

    // Filter tokens using the existing hook with visible tokens only
    const { spamTokens, nonSpamTokens } = useTokenFiltering(visibleTokens, spamFilters, maxValue);

    // Handle tokens loaded from TokenDataManager
    const handleTokensLoaded = useCallback((loadedTokens: Token[]) => {
        setRawTokens(loadedTokens);
        console.log(`TokenScanner: Loaded ${loadedTokens.length} raw tokens for ScamSniffer checking`);
    }, []);

    // Note: Burn handling is now fully managed by the SelectedItemsContext
    // and triggered through the FloatingActionBar using openBurnModal()

    // Handle deselect all
    const handleDeselectAll = useCallback(() => {
        setSelectedTokens(new Set());
    }, [setSelectedTokens]);

    // Statistics data for display (using visible tokens only)
    const statistics: TokenStatistics = {
        totalTokens: visibleTokens.length,
        spamTokens: spamTokens.length,
        regularTokens: nonSpamTokens.length,
        selectedTokens: selectedTokensCount,
        spamPercentage: visibleTokens.length > 0 ? Math.round((spamTokens.length / visibleTokens.length) * 100) : 0
    };

    return (
        <>
            <TokenDataManager onTokensLoaded={handleTokensLoaded} showDisclaimer={showDisclaimer}>
                {({ loading, isConnected, isClient }) => (
                    <>
                        {isClient && isConnected && !loading && (
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
                            </div>
                        )}
                    </>
                )}
            </TokenDataManager>

            {/* Unified Floating Action Bar - appears when tokens are selected */}
            <FloatingActionBar
                onDeselectAll={handleDeselectAll}
            />
        </>
    );
} 