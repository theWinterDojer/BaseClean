interface SelectedTokensPanelProps {
  selectedTokensCount: number;
  onBurnSelected: () => void;
}

export default function SelectedTokensPanel({
  selectedTokensCount,
  onBurnSelected
}: SelectedTokensPanelProps) {
  // Only render when tokens are selected
  if (selectedTokensCount === 0) {
    return null;
  }

  return (
    <div className="bg-gradient-to-r from-emerald-600/40 to-green-500/40 border-2 border-emerald-400/60 rounded-lg p-4 shadow-lg shadow-emerald-500/20">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-emerald-500/60 rounded-full flex items-center justify-center shadow-md">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-emerald-100" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
            </svg>
          </div>
          <div>
            <h4 className="text-xl font-bold text-emerald-200">
              {selectedTokensCount} {selectedTokensCount > 1 ? 'Tokens' : 'Token'} Selected
            </h4>
            <p className="text-sm text-emerald-300/90 font-medium">Ready to clean from your wallet</p>
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
  );
} 