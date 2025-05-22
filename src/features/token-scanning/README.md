# Token Scanning Feature

This feature provides the core functionality of BaseClean, allowing users to scan their wallets for tokens and identify potential spam tokens.

## Components

- **TokenScanner**: The main component that orchestrates the token scanning process
- **TokenStatistics**: Displays statistics about the tokens in the user's wallet
- **BulkActions**: Provides bulk actions for token selection and management
- **SelectedTokensPanel**: Shows information about selected tokens and actions
- **TokenListsContainer**: Container for displaying spam and regular token lists

## Architecture

The TokenScanner component has been refactored from a monolithic component into smaller, more focused components following these principles:

1. **Single Responsibility**: Each component has a clear, specific purpose
2. **Separation of Concerns**: UI rendering is separated from business logic
3. **Reusability**: Components are designed to be reusable
4. **Maintainability**: Smaller components are easier to understand and maintain

## Data Flow

1. The TokenScanner component fetches token data when a wallet is connected
2. The useTokenFiltering hook processes tokens to identify spam
3. The UI components render based on the processed data
4. User interactions (selecting tokens, applying filters) update the state
5. When the user chooses to burn tokens, safety checks are performed

## Future Improvements

- Add more sophisticated spam detection algorithms
- Implement batch burning for gas efficiency
- Add token whitelisting/blacklisting functionality
- Create a history of burned tokens 