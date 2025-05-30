interface StickySelectedTokensBarProps {
  selectedTokensCount: number;
  onBurnSelected: () => void;
}

export default function StickySelectedTokensBar({
  selectedTokensCount,
  onBurnSelected
}: StickySelectedTokensBarProps) {
  // Only render when tokens are selected
  if (selectedTokensCount === 0) {
    return null;
  }

  return (
    <div 
      className="fixed top-[97px] left-0 right-0 z-20 transition-all duration-300 ease-in-out animate-in slide-in-from-top-2"
      style={{
        backdropFilter: 'blur(16px)',
        background: 'rgba(0, 0, 0, 0.2)'
      }}
    >
      <div className="container mx-auto px-4 py-3">
        <div 
          className="max-w-7xl mx-auto bg-gradient-to-r from-emerald-600/70 to-green-500/70 border-2 border-emerald-400/90 rounded-lg p-4 transition-all duration-300"
          style={{
            backdropFilter: 'blur(20px)',
            boxShadow: '0 8px 32px -4px rgba(0, 0, 0, 0.6), 0 0 0 1px rgba(16, 185, 129, 0.4), 0 0 20px rgba(16, 185, 129, 0.3)'
          }}
        >
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-7 h-7 bg-emerald-500/90 rounded-full flex items-center justify-center shadow-lg flex-shrink-0 ring-2 ring-emerald-300/40">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5 text-white" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
              </div>
              <div>
                <h4 className="text-base font-bold text-white leading-tight drop-shadow-md">
                  {selectedTokensCount} {selectedTokensCount > 1 ? 'Tokens' : 'Token'} Selected
                </h4>
                <p className="text-xs text-emerald-100 font-medium drop-shadow-sm">Ready to clean from your wallet</p>
              </div>
            </div>
            <button
              onClick={onBurnSelected}
              className="px-4 py-2.5 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-500 hover:to-red-600 text-white rounded-md text-sm font-bold transition-all duration-200 shadow-xl hover:shadow-2xl hover:scale-105 flex items-center gap-2 border border-red-400/60 flex-shrink-0 ring-2 ring-white/30"
              aria-label={`Burn ${selectedTokensCount} selected tokens`}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M12.395 2.553a1 1 0 00-1.45-.385c-.345.23-.614.558-.822.88-.214.33-.403.713-.57 1.116-.334.804-.614 1.768-.84 2.734a31.365 31.365 0 00-.613 3.58 2.64 2.64 0 01-.945-1.067c-.328-.68-.398-1.534-.398-2.654A1 1 0 005.05 6.05 6.981 6.981 0 003 11a7 7 0 1011.95-4.95c-.592-.591-.98-.985-1.348-1.467-.363-.476-.724-1.063-1.207-2.03zM12.12 15.12A3 3 0 017 13s.879.5 2.5.5c0-1 .5-4 1.25-4.5.5 1 .786 1.293 1.371 1.879A2.99 2.99 0 0113 13a2.99 2.99 0 01-.879 2.121z" clipRule="evenodd" />
              </svg>
              <span className="hidden sm:inline">Burn Selected</span>
              <span className="sm:hidden">Burn</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
} 