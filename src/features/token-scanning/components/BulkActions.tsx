interface BulkActionsProps {
  spamTokensCount: number;
  selectedTokensCount: number;
  onSelectAllSpam: () => void;
  onDeselectAll: () => void;
  onBurnSelected: () => void;
}

export default function BulkActions({
  spamTokensCount,
  selectedTokensCount,
  onSelectAllSpam,
  onDeselectAll,
  onBurnSelected
}: BulkActionsProps) {
  return (
    <div className="bg-gray-800/60 border border-gray-700 rounded-lg p-5">
      {/* Selected Tokens Indicator - shows when tokens are selected */}
      {selectedTokensCount > 0 && (
        <div className="bg-gradient-to-r from-blue-600/40 to-blue-500/40 border-2 border-blue-400/60 rounded-lg p-4 mb-5 shadow-lg shadow-blue-500/20 animate-pulse">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-500/60 rounded-full flex items-center justify-center shadow-md">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-blue-100" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
              </div>
              <div>
                <h4 className="text-xl font-bold text-blue-200">
                  {selectedTokensCount} {selectedTokensCount > 1 ? 'Tokens' : 'Token'} Selected
                </h4>
                <p className="text-sm text-blue-300/90 font-medium">Ready to clean from your wallet</p>
              </div>
            </div>
            <button
              onClick={onBurnSelected}
              className="px-5 py-2.5 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-500 hover:to-red-600 text-white rounded-lg text-sm font-bold transition-all duration-200 shadow-lg hover:shadow-xl hover:scale-105 flex items-center gap-2 border border-red-500"
              aria-label={`Burn ${selectedTokensCount} selected tokens`}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M12.395 2.553a1 1 0 00-1.45-.385c-.345.23-.614.558-.822.88-.214.33-.403.713-.57 1.116-.334.804-.614 1.768-.84 2.734a31.365 31.365 0 00-.613 3.58 2.64 2.64 0 01-.945-1.067c-.328-.68-.398-1.534-.398-2.654A1 1 0 005.05 6.05 6.981 6.981 0 003 11a7 7 0 1011.95-4.95c-.592-.591-.98-.985-1.348-1.467-.363-.476-.724-1.063-1.207-2.03zM12.12 15.12A3 3 0 017 13s.879.5 2.5.5c0-1 .5-4 1.25-4.5.5 1 .786 1.293 1.371 1.879A2.99 2.99 0 0113 13a2.99 2.99 0 01-.879 2.121z" clipRule="evenodd" />
              </svg>
              Burn Selected Tokens
            </button>
          </div>
        </div>
      )}

      {/* Bulk Actions Header and Buttons */}
      <h3 className="text-lg font-semibold text-green-300 mb-4 flex items-center gap-2">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-green-400" viewBox="0 0 20 20" fill="currentColor">
          <path d="M7 9a2 2 0 012-2h6a2 2 0 012 2v6a2 2 0 01-2 2H9a2 2 0 01-2-2V9z" />
          <path d="M5 3a2 2 0 00-2 2v6a2 2 0 002 2V5h8a2 2 0 00-2-2H5z" />
        </svg>
        Bulk Actions
      </h3>
      <div className="flex flex-wrap gap-3">
        <button
          onClick={onSelectAllSpam}
          className="bg-red-600/80 hover:bg-red-500/80 border border-red-500 text-white px-4 py-1.5 rounded-md text-sm font-medium transition-colors shadow-sm hover:shadow-md flex items-center gap-2"
          disabled={spamTokensCount === 0}
          aria-label={`Select all ${spamTokensCount} spam tokens`}
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M3 5a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm1 3a1 1 0 100 2h6a1 1 0 100-2H4zm0 3a1 1 0 100 2h6a1 1 0 100-2H4z" clipRule="evenodd" />
          </svg>
          Select All Spam Tokens ({spamTokensCount})
        </button>
        <button
          onClick={onDeselectAll}
          className="bg-gray-700/60 hover:bg-gray-600/60 border border-gray-600 text-white px-4 py-1.5 rounded-md text-sm font-medium transition-colors flex items-center gap-2"
          disabled={selectedTokensCount === 0}
          aria-label="Deselect all tokens"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
          </svg>
          Deselect All
        </button>
      </div>
    </div>
  );
} 