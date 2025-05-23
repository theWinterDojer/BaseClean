import { useEffect, useState, useCallback } from 'react';
import { useAccount } from 'wagmi';
import { Token, SpamFilters, TokenStatistics } from '@/types/token';
import { fetchTokenBalances, formatBalance } from '@/lib/api';
import FilterPanel from '@/shared/components/FilterPanel';
import { useTokenFiltering } from '@/hooks/useTokenFiltering';
import { TOKEN_VALUE_THRESHOLDS, MIN_VALUABLE_TOKEN_VALUE, UI_TEXT } from '@/constants/tokens';
import TokenStatisticsComponent from './TokenStatistics';
import BulkActions from './BulkActions';
import SelectedTokensPanel from './SelectedTokensPanel';
import TokenListsContainer from './TokenListsContainer';
import { useTokenBurner } from '@/lib/tokenBurner';
import BurnTransactionStatus from './BurnTransactionStatus';
import { getTokenValue } from '../utils/tokenUtils';
import BurnConfirmationModal from './BurnConfirmationModal';

export default function TokenScanner() {
    const { address, isConnected } = useAccount();
    const [tokens, setTokens] = useState<Token[]>([]);
    const [loading, setLoading] = useState(false);
    const [selectedTokens, setSelectedTokens] = useState<Set<string>>(new Set());
    const [maxValue, setMaxValue] = useState<number | null>(10);
    const [error, setError] = useState<string | null>(null);
    // Client-side rendering state to prevent hydration mismatch
    const [isClient, setIsClient] = useState(false);

    // Burn confirmation modal state
    const [isConfirmationOpen, setIsConfirmationOpen] = useState(false);
    const [tokensToConfirm, setTokensToConfirm] = useState<Token[]>([]);
    const [isSimulating, setIsSimulating] = useState(false);

    // Default spam filters - enable all for best detection
    const [spamFilters, setSpamFilters] = useState<SpamFilters>({
        namingIssues: true,
        valueIssues: true,
        airdropSignals: true,
        highRiskIndicators: true
    });

    // Set isClient to true once component mounts in the client
    useEffect(() => {
        setIsClient(true);
    }, []);

    const { spamTokens, nonSpamTokens } = useTokenFiltering(tokens, spamFilters, maxValue);

    // Toggle token selection
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

    // Select all spam tokens
    const selectAllSpam = useCallback(() => {
        setSelectedTokens(new Set(spamTokens.map(t => t.contract_address)));
    }, [spamTokens]);

    // Deselect all tokens
    const deselectAll = useCallback(() => setSelectedTokens(new Set()), []);

    // Use the token burner hook
    const { 
        burnTokens, 
        isPending, 
        isLoading: isBurning, 
        isSuccess,
        isConfirmed,
        currentTxHash,
        currentToken,
        processedTokens,
        totalTokens: burnTotalTokens,
        error: burnError 
    } = useTokenBurner();
    
    const [burnStatus, setBurnStatus] = useState<{
        inProgress: boolean;
        success: boolean;
        error: string | null;
        tokensBurned: number;
        tokensFailed: number;
    }>({
        inProgress: false,
        success: false,
        error: null,
        tokensBurned: 0,
        tokensFailed: 0
    });

    // Simulate the burn transaction
    const simulateBurn = useCallback(async (selectedTokensList: Token[]) => {
        setIsSimulating(true);
        
        // Simple simulation - just a delay for UI feedback
        // In a real implementation, you would call an actual simulation method
        // from your blockchain connection library
        await new Promise(resolve => setTimeout(resolve, 1500));
        
        setIsSimulating(false);
        return true; // Assume simulation is successful
    }, []);

    // Handle showing confirmation for selected tokens
    const handleShowConfirmation = useCallback(async () => {
        const selected = tokens.filter(token => selectedTokens.has(token.contract_address));
        
        if (selected.length === 0) return;
        
        // Set tokens to confirm immediately so UI can update
        setTokensToConfirm(selected);
        setIsConfirmationOpen(true);
        
        // Start simulation after showing modal
        await simulateBurn(selected);
        
    }, [tokens, selectedTokens, simulateBurn]);

    // Handle actual burn after confirmation
    const handleConfirmBurn = useCallback(async () => {
        if (tokensToConfirm.length === 0) return;
        
        try {
            // Close the confirmation modal
            setIsConfirmationOpen(false);
            
            // Start the burn process
            setBurnStatus({
                inProgress: true,
                success: false,
                error: null,
                tokensBurned: 0,
                tokensFailed: 0
            });
            
            // Execute the burn operation
            const results = await burnTokens(tokensToConfirm);
            
            // Update UI with results
            const successCount = results.filter(r => r.success).length;
            const failCount = results.length - successCount;
            
            // Update status to show completion
            setBurnStatus({
                inProgress: false,
                success: successCount > 0,
                error: failCount > 0 ? `Failed to burn ${failCount} tokens` : null,
                tokensBurned: successCount,
                tokensFailed: failCount
            });
            
            // Clear selected tokens that were successfully burned
            const successfullyBurned = new Set(
                results
                    .filter(r => r.success)
                    .map(r => r.token.contract_address)
            );
            
            setSelectedTokens(prev => {
                const newSet = new Set(prev);
                for (const address of successfullyBurned) {
                    newSet.delete(address);
                }
                return newSet;
            });
            
            // Refresh token list after burning
            if (successCount > 0 && address) {
                const tokenItems = await fetchTokenBalances(address);
                setTokens(tokenItems);
            }
        } catch (err) {
            console.error("Failed to burn tokens:", err);
            setBurnStatus({
                inProgress: false,
                success: false,
                error: err instanceof Error ? err.message : "Unknown error occurred",
                tokensBurned: 0,
                tokensFailed: tokensToConfirm.length
            });
        }
    }, [tokensToConfirm, burnTokens, address]);

    // Fetch tokens when connected
    useEffect(() => {
        if (!isConnected || !address) return;
        
        const getTokens = async () => {
            setLoading(true);
            setError(null);
            
            try {
                const tokenItems = await fetchTokenBalances(address);
                setTokens(tokenItems);
            } catch (err) {
                console.error('Failed to fetch tokens:', err);
                setError('Failed to load tokens. Please try again.');
            } finally {
                setLoading(false);
            }
        };

        getTokens();
    }, [address, isConnected]);

    // Statistics data for display
    const statistics: TokenStatistics = {
        totalTokens: tokens.length,
        spamTokens: spamTokens.length,
        regularTokens: nonSpamTokens.length,
        selectedTokens: selectedTokens.size,
        spamPercentage: tokens.length > 0 ? Math.round((spamTokens.length / tokens.length) * 100) : 0
    };

    return (
        <section className="mt-4 space-y-5" aria-labelledby="wallet-token-management">
            {/* Not connected message - only show on client to avoid hydration mismatch */}
            {isClient && !isConnected && (
                <div className="bg-blue-900/30 border border-blue-700 text-white p-5 rounded-lg flex items-center justify-center">
                    <span className="text-lg">{UI_TEXT.CONNECT_WALLET}</span>
                </div>
            )}

            {/* Error message */}
            {error && (
                <div className="bg-red-800/30 border border-red-600 text-white p-4 rounded-lg" role="alert">
                    <div className="flex items-center gap-2">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <p>{error}</p>
                    </div>
                </div>
            )}

            {/* Loading indicator */}
            {loading ? (
                <div className="flex items-center justify-center h-60">
                    <div className="animate-spin rounded-full h-12 w-12 border-t-3 border-b-3 border-green-500" aria-label="Loading..."></div>
                </div>
            ) : (isClient && isConnected) && (
                <div className="space-y-5">
                    {/* Burn Transaction Status */}
                    <BurnTransactionStatus
                        inProgress={burnStatus.inProgress}
                        success={burnStatus.success}
                        error={burnStatus.error}
                        tokensBurned={burnStatus.tokensBurned}
                        tokensFailed={burnStatus.tokensFailed}
                        onClose={() => setBurnStatus({
                            inProgress: false,
                            success: false,
                            error: null,
                            tokensBurned: 0,
                            tokensFailed: 0
                        })}
                        currentToken={currentToken}
                        processedTokens={processedTokens}
                        totalTokens={burnTotalTokens}
                        isWaitingForConfirmation={isBurning && !burnStatus.inProgress}
                    />
                    
                    {/* Selected tokens panel */}
                    <SelectedTokensPanel 
                        selectedTokensCount={selectedTokens.size}
                        onDeselectAll={deselectAll}
                        onBurnSelected={handleShowConfirmation}
                    />

                    {/* Filter Panel */}
                    <FilterPanel 
                        spamFilters={spamFilters}
                        setSpamFilters={setSpamFilters}
                        maxValue={maxValue}
                        setMaxValue={setMaxValue}
                        valueFilters={TOKEN_VALUE_THRESHOLDS}
                    />
                    
                    {/* Bulk Actions */}
                    <BulkActions 
                        onSelectAllSpam={selectAllSpam}
                        spamTokensCount={spamTokens.length}
                        selectedTokensCount={selectedTokens.size}
                        onDeselectAll={deselectAll}
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
                        tokens={tokensToConfirm}
                        isOpen={isConfirmationOpen}
                        onClose={() => setIsConfirmationOpen(false)}
                        onConfirm={handleConfirmBurn}
                        isSimulating={isSimulating}
                    />
                </div>
            )}
        </section>
    );
} 