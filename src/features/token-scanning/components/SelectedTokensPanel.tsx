interface SelectedTokensPanelProps {
  selectedTokensCount: number;
  onDeselectAll: () => void;
  onBurnSelected: () => void;
}

export default function SelectedTokensPanel({
  selectedTokensCount,
  onDeselectAll,
  onBurnSelected
}: SelectedTokensPanelProps) {
  if (selectedTokensCount === 0) {
    return null;
  }

  return (
    <div className="bg-gradient-to-r from-green-900/20 to-green-800/20 border border-green-700 rounded-lg p-5 shadow-lg">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-green-700/40 rounded-full flex items-center justify-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-green-300" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M3 6a3 3 0 013-3h10a1 1 0 01.8 1.6L14.25 8l2.55 3.4A1 1 0 0116 13H6a1 1 0 00-1 1v3a1 1 0 11-2 0V6z" clipRule="evenodd" />
            </svg>
          </div>
          <div>
            <h3 className="text-xl font-semibold text-green-300">
              {selectedTokensCount} {selectedTokensCount > 1 ? 'Tokens' : 'Token'} Selected
            </h3>
            <p className="text-sm text-green-500/80">Ready to clean from your wallet</p>
          </div>
        </div>
        <div className="flex gap-3">
          <button
            onClick={onDeselectAll}
            className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-gray-200 rounded-md text-sm font-medium transition-colors flex items-center gap-2"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
            </svg>
            Clear Selection
          </button>
          <button
            onClick={onBurnSelected}
            className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-md text-sm font-medium transition-colors shadow-md hover:shadow-lg flex items-center gap-2"
            aria-label={`Burn ${selectedTokensCount} selected tokens`}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M12.395 2.553a1 1 0 00-1.45-.385c-.345.23-.614.558-.822.88-.214.33-.403.713-.57 1.116-.334.804-.614 1.768-.84 2.734a31.365 31.365 0 00-.613 3.58 2.64 2.64 0 01-.945-1.067c-.328-.68-.398-1.534-.398-2.654A1 1 0 005.05 6.05 6.981 6.981 0 003 11a7 7 0 1011.95-4.95c-.592-.591-.98-.985-1.348-1.467-.363-.476-.724-1.063-1.207-2.03zM12.12 15.12A3 3 0 017 13s.879.5 2.5.5c0-1 .5-4 1.25-4.5.5 1 .786 1.293 1.371 1.879A2.99 2.99 0 0113 13a2.99 2.99 0 01-.879 2.121z" clipRule="evenodd" />
            </svg>
            Burn Selected Tokens
          </button>
        </div>
      </div>
    </div>
  );
} 