import { useState, useCallback } from 'react';
import { useAccount } from 'wagmi';
import { Token, SpamFilters, TokenStatistics } from '@/types/token';
import FilterPanel from '@/shared/components/FilterPanel';
import { useTokenFiltering } from '@/hooks/useTokenFiltering';
import { useBurnFlow } from '@/hooks/useBurnFlow';
import { TOKEN_VALUE_THRESHOLDS } from '@/constants/tokens';
import TokenStatisticsComponent from './TokenStatistics';
import TokenListsContainer from './TokenListsContainer';
import BurnTransactionStatus from './BurnTransactionStatus';
import BurnConfirmationModal from './BurnConfirmationModal';
import TokenDataManager from './TokenDataManager';
import TokenSelectionManager from './TokenSelectionManager';
import SelectedTokensPanel from './SelectedTokensPanel';

export default function TokenScanner() {
    const { address } = useAccount();
    const [tokens, setTokens] = useState<Token[]>([]);
    const [selectedTokens, setSelectedTokens] = useState<Set<string>>(new Set());
    const [maxValue, setMaxValue] = useState<number | null>(10);

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
    }, []);

    // Handle burn confirmation
    const handleBurnSelected = useCallback(async () => {
        const selectedTokensList = tokens.filter(token => 
            selectedTokens.has(token.contract_address)
        );
        await showConfirmation(selectedTokensList);
    }, [tokens, selectedTokens, showConfirmation]);

    // Handle burn execution
    const handleConfirmBurn = useCallback(async (updateTokens: (tokens: Token[]) => void) => {
        if (!address) return;
        
        await executeBurn(
            address,
            updateTokens,
            setSelectedTokens
        );
    }, [address, executeBurn]);

    // Statistics data for display
    const statistics: TokenStatistics = {
        totalTokens: tokens.length,
        spamTokens: spamTokens.length,
        regularTokens: nonSpamTokens.length,
        selectedTokens: selectedTokens.size,
        spamPercentage: tokens.length > 0 ? Math.round((spamTokens.length / tokens.length) * 100) : 0
    };

    // Toggle individual token selection
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

    return (
        <TokenDataManager onTokensLoaded={handleTokensLoaded}>
            {({ loading, isConnected, isClient, updateTokens }) => (
                isClient && isConnected && !loading && (
                    <div className="space-y-5">
                        {/* Burn Transaction Status */}
                        <BurnTransactionStatus
                            inProgress={burnStatus.inProgress}
                            success={burnStatus.success}
                            error={burnStatus.error}
                            tokensBurned={burnStatus.tokensBurned}
                            tokensFailed={burnStatus.tokensFailed}
                            onClose={resetBurnStatus}
                            currentToken={burnStatus.currentToken}
                            processedTokens={burnStatus.processedTokens}
                            totalTokens={burnStatus.totalTokens}
                            isWaitingForConfirmation={isWaitingForConfirmation}
                        />

                        {/* Selected Tokens Panel - moved to top for better UX flow */}
                        <SelectedTokensPanel
                            selectedTokensCount={selectedTokens.size}
                            onBurnSelected={handleBurnSelected}
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
                            isSimulating={burnStatus.isSimulating}
                        />
                    </div>
                )
            )}
        </TokenDataManager>
    );
} 