import React, { Component, ReactNode, ErrorInfo } from 'react';
import { parseWalletError, isUserRejectionError } from '@/utils/errorHandling';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
  errorInfo?: ErrorInfo;
}

/**
 * Error Boundary that specifically handles wallet-related errors
 * Prevents technical error messages from showing to users for common wallet interactions
 */
class WalletErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    // Update state so the next render will show the fallback UI
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    // Check if this is a wallet error we should handle gracefully
    const isWalletError = this.isWalletRelatedError(error);
    
    if (isWalletError) {
      // Log for debugging but don't show scary error to user
      console.log('Wallet interaction error (handled gracefully):', error.message);
      this.setState({ error, errorInfo });
    } else {
      // For non-wallet errors, log normally
      console.error('Application error:', error, errorInfo);
      this.setState({ error, errorInfo });
    }
  }

  private isWalletRelatedError(error: Error): boolean {
    const errorString = error.toString().toLowerCase();
    const message = error.message?.toLowerCase() || '';
    
    return (
      isUserRejectionError(error) ||
      errorString.includes('contract') ||
      errorString.includes('transaction') ||
      errorString.includes('wallet') ||
      errorString.includes('metamask') ||
      errorString.includes('coinbase') ||
      errorString.includes('rainbow') ||
      message.includes('user rejected') ||
      message.includes('user denied') ||
      message.includes('transaction failed')
    );
  }

  private handleRetry = () => {
    this.setState({ hasError: false, error: undefined, errorInfo: undefined });
  };

  private handleDismiss = () => {
    this.setState({ hasError: false, error: undefined, errorInfo: undefined });
  };

  render() {
    if (this.state.hasError && this.state.error) {
      const isWalletError = this.isWalletRelatedError(this.state.error);
      
      if (isWalletError) {
        const parsedError = parseWalletError(this.state.error);
        
        return (
          <div className="min-h-screen bg-gray-950 flex items-center justify-center p-4">
            <div className="bg-gray-900 border border-gray-700 rounded-xl p-6 max-w-md w-full">
              <div className="text-center">
                {parsedError.type === 'USER_REJECTED' ? (
                  <div className="mb-4">
                    <div className="mx-auto w-12 h-12 rounded-full bg-yellow-900/30 border border-yellow-700 flex items-center justify-center mb-4">
                      <svg className="w-6 h-6 text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                      </svg>
                    </div>
                    <h3 className="text-lg font-semibold text-yellow-400 mb-2">
                      Transaction Cancelled
                    </h3>
                  </div>
                ) : (
                  <div className="mb-4">
                    <div className="mx-auto w-12 h-12 rounded-full bg-red-900/30 border border-red-700 flex items-center justify-center mb-4">
                      <svg className="w-6 h-6 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <h3 className="text-lg font-semibold text-red-400 mb-2">
                      Wallet Error
                    </h3>
                  </div>
                )}
                
                <p className="text-gray-300 mb-6">
                  {parsedError.userFriendlyMessage}
                </p>
                
                <div className="flex gap-3 justify-center">
                  <button
                    onClick={this.handleDismiss}
                    className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors"
                  >
                    Dismiss
                  </button>
                  {parsedError.type !== 'USER_REJECTED' && (
                    <button
                      onClick={this.handleRetry}
                      className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg transition-colors"
                    >
                      Try Again
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        );
      }
      
      // For non-wallet errors, show a generic error screen
      return (
        <div className="min-h-screen bg-gray-950 flex items-center justify-center p-4">
          <div className="bg-gray-900 border border-gray-700 rounded-xl p-6 max-w-md w-full text-center">
            <div className="mb-4">
              <div className="mx-auto w-12 h-12 rounded-full bg-red-900/30 border border-red-700 flex items-center justify-center mb-4">
                <svg className="w-6 h-6 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-red-400 mb-2">
                Something went wrong
              </h3>
            </div>
            
            <p className="text-gray-300 mb-6">
              An unexpected error occurred. Please try refreshing the page.
            </p>
            
            <div className="flex gap-3 justify-center">
              <button
                onClick={() => window.location.reload()}
                className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors"
              >
                Refresh Page
              </button>
              <button
                onClick={this.handleRetry}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg transition-colors"
              >
                Try Again
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default WalletErrorBoundary; 