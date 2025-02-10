type GameMetricsProps = {
    whiteFallbacks: { lichess: number, stockfish: number };
    blackFallbacks: { lichess: number, stockfish: number };
    moveHistory: Array<{ 
      player: 'white' | 'black',
      move: string,
      source: 'model' | 'lichess' | 'stockfish'
    }>;
  };
  
  export function GameMetrics({ whiteFallbacks, blackFallbacks, moveHistory }: GameMetricsProps) {
    return (
      <div className="bg-white rounded-lg shadow p-4">
        <h3 className="font-semibold mb-2">Game Metrics</h3>
        <div className="space-y-4">
          <div>
            <h4 className="text-sm font-medium mb-1">Fallback Moves</h4>
            <div className="grid grid-cols-2 gap-4">
              <div className="text-sm">
                <div className="font-medium">White Player:</div>
                <div>Lichess: {whiteFallbacks.lichess}</div>
                <div>Stockfish: {whiteFallbacks.stockfish}</div>
              </div>
              <div className="text-sm">
                <div className="font-medium">Black Player:</div>
                <div>Lichess: {blackFallbacks.lichess}</div>
                <div>Stockfish: {blackFallbacks.stockfish}</div>
              </div>
            </div>
          </div>
          <div>
            <h4 className="text-sm font-medium mb-1">Move Sources</h4>
            <div className="text-sm space-y-1">
              {moveHistory.map((move, index) => (
                <div key={index} className="flex justify-between">
                  <span>{move.player} played {move.move}</span>
                  <span className="text-gray-500">({move.source})</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }