type GameStateProps = {
  fen: string;
  pgn: string;
}

export function GameState({ fen, pgn }: GameStateProps) {
  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  return (
    <div className="w-64 bg-white dark:bg-gray-800 rounded-lg shadow p-4">
  <h3 className="font-semibold mb-2 text-gray-900 dark:text-gray-100">Game State</h3>
  <div className="space-y-4">
    <div>
      <div className="flex justify-between items-center mb-1">
        <label className="text-sm font-medium text-gray-700 dark:text-gray-300">FEN</label>
        <button
          onClick={() => copyToClipboard(fen)}
          className="text-xs text-blue-500 hover:text-blue-600 dark:text-blue-400"
        >
          Copy
        </button>
      </div>
      <div className="text-xs bg-gray-50 dark:bg-gray-700 p-2 rounded break-all text-gray-600 dark:text-gray-300">
        {fen}
      </div>
    </div>
        <div>
          <div className="flex justify-between items-center mb-1">
            <label className="text-sm font-medium">PGN</label>
            <button
              onClick={() => copyToClipboard(pgn)}
              className="text-xs text-blue-500 hover:text-blue-600"
            >
              Copy
            </button>
          </div>
          <div className="text-xs bg-gray-50 p-2 rounded break-all">
            {pgn}
          </div>
        </div>
      </div>
    </div>
  )
} 