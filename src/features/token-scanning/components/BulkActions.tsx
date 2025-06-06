interface BulkActionsProps {
  spamTokensCount: number;
  selectedTokensCount: number;
  onSelectAllSpam: () => void;
  onDeselectAll: () => void;
}

export default function BulkActions({
  spamTokensCount,
  selectedTokensCount,
  onSelectAllSpam,
  onDeselectAll
}: BulkActionsProps) {
  return (
    <div className="bg-gray-800/60 border border-gray-700 rounded-lg p-5">
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
          className="bg-red-600/80 hover:bg-red-500/80 border border-red-500 text-white px-4 py-1.5 rounded-md text-sm font-medium transition-colors shadow-sm hover:shadow-md"
          disabled={spamTokensCount === 0}
          aria-label={`Select all ${spamTokensCount} spam tokens`}
        >
          Select All Spam Tokens ({spamTokensCount})
        </button>
        <button
          onClick={onDeselectAll}
          className="bg-blue-600/80 hover:bg-blue-500/80 border border-blue-500 text-white px-4 py-1.5 rounded-md text-sm font-medium transition-colors shadow-sm hover:shadow-md flex items-center gap-2"
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