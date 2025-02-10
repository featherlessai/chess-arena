import { useRef, useState, useEffect } from 'react';
import { Chess } from 'chess.js';
import { Chessboard } from 'react-chessboard';
import { chatCompletion, textCompletion, fetchModels} from './services/featherless-api';
import { GameState } from './components/GameState';
import { PromptConfig } from './components/PromptConfig';
import { PlayerConfig } from './components/PlayerConfig';
import { GameMetrics } from './components/GameMetrics';
import Logo from './assets/logo.svg';
type GameStatus = 'playing' | 'checkmate' | 'stalemate' | 'draw';

type Model = {
  id: string;
  is_gated: boolean;
  created: number;
  model_class: string;
  owned_by: string;
  context_length: number;
  max_completion_tokens: number;
  available_on_current_plan: boolean;
};

export default function Game() {
  const gameRef = useRef(new Chess());
  const [position, setPosition] = useState(gameRef.current.fen());
  const [gameStatus, setGameStatus] = useState<GameStatus>('playing');
  const [turn, setTurn] = useState<'w' | 'b'>('w');
  const [pgn, setPgn] = useState<string>(gameRef.current.pgn());
  const [apiResponse, setApiResponse] = useState<string>('');
  const [fullApiResponse, setFullApiResponse] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);
  // Add these state variables with the other useState declarations
  const [models, setModels] = useState<Model[]>([]);
  const [whitePlayer, setWhitePlayer] = useState<PlayerConfig>({
    model: 'meta-llama/Meta-Llama-3.1-8B-Instruct',
    type: 'chat'
  });
  const [blackPlayer, setBlackPlayer] = useState<PlayerConfig>({
    model: 'meta-llama/Meta-Llama-3.1-8B-Instruct',
    type: 'chat'
  });
    const [systemPrompt, setSystemPrompt] = useState<string>(`You are a chess master`)
    const [userPromptTemplate, setUserPromptTemplate] = useState<string>(`# Chess Engine Instructions

You are a chess engine that provides thorough position analysis before making moves. Your analysis should be methodical and self-questioning.

## Analysis Process

1. Evaluate the position systematically:
   - Current material balance
   - Piece activity and coordination
   - Pawn structure
   - King safety
   - Control of key squares/lines

2. Calculate concrete variations:
   - Examine forced sequences
   - Consider opponent's strongest responses
   - Evaluate resulting positions
   - Note tactical themes and opportunities

3. Strategic considerations:
   - Long-term pawn structure implications
   - Piece placement optimization
   - Control of key squares
   - Development and initiative

## Response Format

<analysis>
[Detailed position evaluation]
- Current assessment
- Key variations calculated
- Strategic considerations
- Potential improvements found during analysis
</analysis>

<move_choice>
- Best move in algebraic notation
- Brief justification
- Key variations supporting the choice
- Notable alternatives considered
</move_choice>

## Key Principles

- Use algebraic notation (e.g., e4, Nf6)
- Include evaluation symbols when relevant (±, ∓, =)
- Show complete variations with proper numbering
- Express uncertainty when positions are unclear
- Revise assessments as analysis deepens

## Sample Games for Reference
1. c4 e6 2. Nf3 d5 3. d4 Nf6 4. Nc3 Be7 5. Bg5 O-O 6. e3 h6 7. Bh4 b6 8. cxd5 Nxd5 9. Bxe7 Qxe7 10. Nxd5 exd5 11. Rc1 Be6 12. Qa4 c5 13. Qa3 Rc8 14. Bb5 a6 15. dxc5 bxc5 16. O-O Ra7 17. Be2 Nd7 18. Nd4 Qf8 19. Nxe6 fxe6 20. e4 d4 21. f4 Qe7 22. e5 Rb8 23. Bc4 Kh8 24. Qh3 Nf8 25. b3 a5 26. f5 exf5 27. Rxf5 Nh7 28. Rcf1 Qd8 29. Qg3 Re7 30. h4 Rbb7 31. e6 Rbc7 32. Qe5 Qe8 33. a4 Qd8 34. R1f2 Qe8 35. R2f3 Qd8 36. Bd3 Qe8 37. Qe4 Nf6 38. Rxf6 gxf6 39. Rxf6 Kg8 40. Bc4 Kh8 41. Qf4 1-0

1. e4 c5 2. Nf3 e6 3. d4 cxd4 4. Nxd4 Nc6 5. Nb5 d6 6. c4 Nf6 7. N1c3 a6 8. Na3 d5 9. cxd5 exd5 10. exd5 Nb4 11. Be2 Bc5 12. O-O O-O 13. Bf3 Bf5 14. Bg5 Re8 15. Qd2 b5 16. Rad1 Nd3 17. Nab1 h6 18. Bh4 b4 19. Na4 Bd6 20. Bg3 Rc8 21. b3 g5 22. Bxd6 Qxd6 23. g3 Nd7 24. Bg2 Qf6 25. a3 a5 26. axb4 axb4 27. Qa2 Bg6 28. d6 g4 29. Qd2 Kg7 30. f3 Qxd6 31. fxg4 Qd4+ 32. Kh1 Nf6 33. Rf4 Ne4 34. Qxd3 Nf2+ 35. Rxf2 Bxd3 36. Rfd2 Qe3 37. Rxd3 Rc1 38. Nb2 Qf2 39. Nd2 Rxd1+ 40. Nxd1 Re1+ 41. Nf1 Qxf1+ 1-0

1. e4 e5 2. Nf3 Nc6 3. Bb5 Nf6 4. d3 Bc5 5. Bxc6 dxc6 6. O-O Bg4 7. h3 h5 8. hxg4 hxg4 9. Nxe5 Qd4 10. Nxg4 Qxg4 11. Qxg4 Rxh2 12. Kxh2 Rh8+ 13. Kg1 Rh1# 1/2-1/2

Here is your current position:
{pgn}
You are playing as {color}.
Always end your response with the best move in algebraic notation. End your response with only the move, no other text or explanation.
`);
  const [isAutoPlaying, setIsAutoPlaying] = useState(false);
  const [autoPlayDelay, setAutoPlayDelay] = useState(3000); // 3 seconds delay between moves
  const [formattedPrompt, setFormattedPrompt] = useState<string>('');
  const [useFailsafes, setUseFailsafes] = useState(true);
  const [whiteFallbacks, setWhiteFallbacks] = useState({ lichess: 0, stockfish: 0 });
  const [blackFallbacks, setBlackFallbacks] = useState({ lichess: 0, stockfish: 0 });
  const [moveHistory, setMoveHistory] = useState<Array<{ 
    player: 'white' | 'black',
    move: string,
    source: 'model' | 'lichess' | 'stockfish',
    responseTime?: number
  }>>([]);

  const updateGameStatus = (): GameStatus => {
    if (gameRef.current.isCheckmate()) return 'checkmate';
    if (gameRef.current.isStalemate()) return 'stalemate';
    if (gameRef.current.isDraw()) return 'draw';
    return 'playing';
  };

  const onDrop = (sourceSquare: string, targetSquare: string) => {
    try {
      const move = gameRef.current.move({
        from: sourceSquare,
        to: targetSquare,
        promotion: 'q',
      });

      if (!move) return false;

      setPosition(gameRef.current.fen());
      setTurn(gameRef.current.turn());
      setGameStatus(updateGameStatus());
      setPgn(gameRef.current.pgn());
      return true;
    } catch (error) {
      console.error('Move error:', error);
      return false;
    }
  };
  useEffect(() => {
    const loadModels = async () => {
      const availableModels = await fetchModels();
      setModels(availableModels);
    };
    loadModels();
  }, []);
  const makeMove = (move: string): boolean => {
    try {
      const result = gameRef.current.move(move);
      
      if (!result) return false;

      setPosition(gameRef.current.fen());
      setTurn(gameRef.current.turn());
      setGameStatus(updateGameStatus());
      setPgn(gameRef.current.pgn());
      return true;
    } catch (error) {
      console.error('Invalid move:', error);
      return false;
    }
  };

  const isValidChessMove = (move: string): boolean => {
    try {
      // Create a temporary chess instance to validate the move
      const tempGame = new Chess(gameRef.current.fen());
      return tempGame.move(move) !== null;
    } catch {
      return false;
    }
  };

  const testAPI = async (type: 'chat' | 'completion') => {
    setIsLoading(true);
    try {
      let response;
      const currentFen = gameRef.current.fen(); // Get fresh FEN
      const currentPgn = gameRef.current.pgn(); // Get fresh PGN
      const currentTurn = gameRef.current.turn(); // Get fresh turn
      
      const formattedUserPrompt = userPromptTemplate
        .replace('{fen}', currentFen)
        .replace('{pgn}', currentPgn)
        .replace('{color}', currentTurn === 'w' ? 'White' : 'Black');

      const currentPlayer = currentTurn === 'w' ? whitePlayer : blackPlayer;
      
      if (type === 'chat') {
          response = await chatCompletion([
            { role: 'system', content: systemPrompt },
            { role: 'user', content: formattedUserPrompt }
          ], currentPlayer.model);
      } else {
        response = await textCompletion(
          `${systemPrompt}\n\n${formattedUserPrompt}`,
          currentPlayer.model
        );
      }
      setFullApiResponse(response);
      
      // Find all possible chess moves in the response
      const moveMatches = response.match(/\b([NBRQK]?[a-h]?[1-8]?x?[a-h][1-8](?:=[NBRQnbrq])?|O-O-O|O-O|0-0-0-0)[+#]?\b/gi) || [];
      
      // Find the first valid move by checking in reverse order
      let validMove = null;
      for (let i = moveMatches.length - 1; i >= 0; i--) {
        const move = moveMatches[i];
        if (isValidChessMove(move)) {
          validMove = move;
          break;
        }
      }
      /*
      // Regular order
      let validMove = null;
      for (let i = 0; i < moveMatches.length; i++) {
        const move = moveMatches[i];
        if (isValidChessMove(move)) {
          validMove = move;
          break;
        }
      }
      */
      setApiResponse(validMove || response);
      setFormattedPrompt(`${systemPrompt}\n\n${formattedUserPrompt}`);
    } catch (error) {
      console.error('API test error:', error);
      setApiResponse('Error calling API');
      setFullApiResponse('Error calling API');
    } finally {
      setIsLoading(false);
    }
  };

  // Reset the board to the initial position
  const resetBoard = () => {
    gameRef.current = new Chess();
    setPosition(gameRef.current.fen());
    setTurn('w');
    setGameStatus('playing');
    setPgn(gameRef.current.pgn());
    setApiResponse('');
    setFullApiResponse('');
    setFormattedPrompt('');
    setWhiteFallbacks({ lichess: 0, stockfish: 0 });
    setBlackFallbacks({ lichess: 0, stockfish: 0 });
    setMoveHistory([]);
  };


type StockfishResponse = {
  success: boolean;
  evaluation?: number;
  mate?: number | null;
  bestmove?: string;
  continuation?: string;
  depth?: number;
  moves?: string[];  // Add this to store multiple moves
};

async function getStockfishAnalysis(fen: string, depths: number[] = [1, 3, 5]): Promise<StockfishResponse> {
  try {
    console.log("Getting Stockfish analysis for FEN:", fen);
    // Get analysis at different depths
    const analyses = await Promise.all(
      depths.map(async (depth) => {
        const url = `https://stockfish.online/api/s/v2.php?fen=${encodeURIComponent(fen)}&depth=${depth}`;
        const response = await fetch(url);
        const data = await response.json();
        return { ...data, depth };
      })
    );

    // Extract best moves from each depth
    const moves = analyses
      .filter(analysis => analysis.success && analysis.bestmove)
      .map(analysis => analysis.bestmove)
      .filter((move, index, self) => self.indexOf(move) === index) // Remove duplicates
      .sort(() => Math.random() - 0.5) // Shuffle moves
      .slice(0, 3); // Take top 3 moves

    return {
      success: true,
      moves,
      // Return the deepest analysis evaluation
      evaluation: analyses[analyses.length - 1]?.evaluation,
      continuation: analyses[analyses.length - 1]?.continuation
    };
  } catch (error) {
    console.error('Stockfish API error:', error);
    return { success: false };
  }
}

// Fetch moves from Lichess
const fetchLichessMoves = async (fen: string): Promise<string[]> => {
  try {
    console.log("Getting Lichess moves for FEN:", fen);
    const response = await fetch(`https://lichess.org/api/cloud-eval?fen=${encodeURIComponent(fen)}&multiPv=10`);
    const data = await response.json();
    
    // Get first move from each principal variation
    const firstMoves = data.pvs
      .map((pv: { moves: string }) => pv.moves.split(' ')[0]) // Get first move from each variation
      .sort(() => Math.random() - 0.5) // Shuffle the moves
      .slice(0, 3); // Take first 3 moves
    
    return firstMoves;
  } catch (error) {
    console.error('Error fetching Lichess moves:', error);
    return [];
  }
};

  const handleAutoPlay = async (retryCount = 0, previousSuggestions: string[] = []) => {
    if (!isAutoPlaying) return;

    // Get the current player based on turn
    const currentTurn = gameRef.current.turn();
    const currentPlayer = currentTurn === 'w' ? whitePlayer : blackPlayer;


    try {
      setIsLoading(true);
      const currentFen = gameRef.current.fen();
      const currentPgn = gameRef.current.pgn();
      const currentTurn = gameRef.current.turn();
      // Use different prompt when retrying with engine moves
      const promptToUse = retryCount > 0 
        ? `You are a chess grandmaster. Choose one of these suggested moves: {suggestions}. 
           You are playing as {color}.${currentPgn ? ' Current position PGN: {pgn}' : ''}
           Always end your response with the best move in algebraic notation.`
        : userPromptTemplate;

      const formattedUserPrompt = promptToUse
        .replace(/\{fen\}/g, currentFen)
        .replace(/\{pgn\}/g, currentPgn)
        .replace(/\{color\}/g, currentTurn === 'w' ? 'White' : 'Black')
        .replace(/\{suggestions\}/g, previousSuggestions.join(', '));

      let response;
      if (currentPlayer.type === 'chat') {

          response = await chatCompletion([
            { role: 'system', content: systemPrompt },
            { role: 'user', content: formattedUserPrompt }
          ], currentPlayer.model);
      } else {
        response = await textCompletion(
          `${systemPrompt}\n\n${formattedUserPrompt}`,
          currentPlayer.model
        );
      }

      setFullApiResponse(response);
      
      // Find all possible chess moves in the response
      const moveMatches = response.match(/\b([NBRQK]?[a-h]?[1-8]?x?[a-h][1-8](?:=[NBRQnbrq])?|O-O-O|O-O|0-0-0-0)[+#]?\b/gi) || [];
      
      // Find the first valid move
      let validMove = null;
      for (let i = moveMatches.length - 1; i >= 0; i--) {
        const move = moveMatches[i];
        if (isValidChessMove(move)) {
          validMove = move;
          break;
        }
      }
      /*
      // Regular order
      let validMove = null;
      for (let i = 0; i < moveMatches.length; i++) {
        const move = moveMatches[i];
        if (isValidChessMove(move)) {
          validMove = move;
          break;
        }
      }
      */

      if (validMove) {
        const success = makeMove(validMove);
        setApiResponse(validMove);
        
        if (!success) {
          setIsAutoPlaying(false);
          return;
        }
      } else {
        if (useFailsafes) {
          if (retryCount === 0) {
            // First retry - use Lichess moves
            const lichessMoves = await fetchLichessMoves(currentFen);
            setWhiteFallbacks(prev => currentTurn === 'w' ? {...prev, lichess: prev.lichess + 1} : prev);
            setBlackFallbacks(prev => currentTurn === 'b' ? {...prev, lichess: prev.lichess + 1} : prev);
            return handleAutoPlay(retryCount + 1, lichessMoves);
          } else if (retryCount === 1) {
            // Second retry - use Stockfish
            const stockfishAnalysis = await getStockfishAnalysis(currentFen);
            if (stockfishAnalysis.success && stockfishAnalysis.moves && stockfishAnalysis.moves.length > 0) {
              // Pass the Stockfish moves to another retry attempt
              setWhiteFallbacks(prev => currentTurn === 'w' ? {...prev, stockfish: prev.stockfish + 1} : prev);
              setBlackFallbacks(prev => currentTurn === 'b' ? {...prev, stockfish: prev.stockfish + 1} : prev);
              return handleAutoPlay(retryCount + 1, stockfishAnalysis.moves);
            } else {
              // Last resort - force a random Stockfish move with depth 1
              const forcedAnalysis = await getStockfishAnalysis(currentFen, [1]);
              if (forcedAnalysis.success && forcedAnalysis.moves && forcedAnalysis.moves.length > 0) {
                const success = makeMove(forcedAnalysis.moves[0]);
                if (success) {
                  setApiResponse(forcedAnalysis.moves[0]);
                  setWhiteFallbacks(prev => currentTurn === 'w' ? {...prev, stockfish: prev.stockfish + 1} : prev);
                  setBlackFallbacks(prev => currentTurn === 'b' ? {...prev, stockfish: prev.stockfish + 1} : prev);
                }
              }
            }
          }
        }
        if (!gameRef.current.history().slice(-1)[0]) {  // If no move was made
          setApiResponse('No valid move found');
          setIsAutoPlaying(false);
          return;
        }
      }

    } catch (error) {
      console.error('Autoplay error:', error);
      setApiResponse('Error during autoplay');
      setIsAutoPlaying(false);
    } finally {
      setIsLoading(false);
    }

    // Check if game is over
    const status = updateGameStatus();
    if (status !== 'playing') {
      setIsAutoPlaying(false);
      return;
    }

    // Schedule next move
    setTimeout(handleAutoPlay, autoPlayDelay);
  };

  useEffect(() => {
    if (isAutoPlaying) {
      handleAutoPlay();
    }
  }, [isAutoPlaying]); // Only trigger when autoplay state changes



  return (
    <div className="min-h-screen p-8 bg-gray-50 dark:bg-gray-900 transition-colors duration-200">
    <div className="max-w-7xl mx-auto">
      <div className="flex flex-col items-center justify-center gap-1 mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-0">LLM Chess Arena</h1>
        <a
          href="https://featherless.ai"
          target="_blank"
          rel="noopener noreferrer"
          className="-ml-8"
        >
          <img 
            src={Logo} 
            alt="Chess Logo" 
            className="h-10 w-auto mt-0" 
          />
        </a>
      </div>
    
    <div className="flex flex-col lg:flex-row gap-8">
      {/* Left Column - Chessboard and Autoplay */}
      <div className="flex-shrink-0">
        <div className="flex flex-col items-center">
          <Chessboard
            position={position}
            onPieceDrop={onDrop}
            boardWidth={400}
          />
          <div className="mt-4 space-y-2 text-center text-sm">
            <div>Turn: {turn === 'w' ? 'White' : 'Black'}</div>
            <div>Status: {gameStatus}</div>
          </div>
          
          {/* Autoplay Controls */}
          <div className="mt-4 w-full bg-white dark:bg-gray-800 rounded-lg shadow p-4">
            <div className="flex justify-between items-center mb-2">
              <h3 className="font-semibold">Autoplay Controls</h3>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  min="1000"
                  max="10000"
                  step="500"
                  value={autoPlayDelay}
                  onChange={(e) => setAutoPlayDelay(Number(e.target.value))}
                  className="w-20 px-2 py-1 text-sm border rounded"
                />
                <span className="text-sm">ms</span>
              </div>
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-1">
                  <span className="text-sm">Use Lichess/Stockfish Failsafes</span>
                  <div className="relative group">
                    <svg 
                      xmlns="http://www.w3.org/2000/svg" 
                      viewBox="0 0 20 20" 
                      fill="currentColor" 
                      className="w-4 h-4 text-gray-400 cursor-help"
                    >
                      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a.75.75 0 000 1.5h.253a.25.25 0 01.244.304l-.459 2.066A1.75 1.75 0 0010.747 15H11a.75.75 0 000-1.5h-.253a.25.25 0 01-.244-.304l.459-2.066A1.75 1.75 0 009.253 9H9z" clipRule="evenodd" />
                    </svg>
                    <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 w-64 p-2 bg-gray-800 dark:bg-gray-900 text-white dark:text-gray-100 text-xs rounded shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200">                      When enabled, if the AI fails to generate a valid chess move, the system will:
                      <ol className="list-decimal ml-4 mt-1">
                        <li>First try using Lichess opening book moves</li>
                        <li>If that fails, use Stockfish engine analysis</li>
                      </ol>
                    </div>
                  </div>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    className="sr-only peer"
                    checked={useFailsafes}
                    onChange={() => setUseFailsafes(!useFailsafes)}
                  />
                  <div className={`
                    w-11 h-6 rounded-full peer 
                    peer-checked:after:translate-x-full 
                    peer-checked:after:border-white 
                    after:content-[''] 
                    after:absolute 
                    after:top-[2px] 
                    after:left-[2px] 
                    after:bg-white 
                    after:border-gray-300 
                    after:border 
                    after:rounded-full 
                    after:h-5 
                    after:w-5 
                    after:transition-all
                    ${useFailsafes 
                      ? 'bg-blue-500' 
                      : 'bg-gray-200'
                    }
                  `}></div>
                </label>
              </div>
              <button
                onClick={() => setIsAutoPlaying(!isAutoPlaying)}
                disabled={isLoading || gameStatus !== 'playing'}
                className={`w-full py-2 rounded-md text-white ${
                  isAutoPlaying 
                    ? 'bg-red-500 hover:bg-red-600' 
                    : 'bg-green-500 hover:bg-green-600'
                } disabled:opacity-50`}
              >
                {isAutoPlaying ? 'Stop Autoplay' : 'Start Autoplay'}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Right Column - Panels */}
      <div className="flex-grow grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 auto-rows-min">
            {/* Move History */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
              <h3 className="font-semibold mb-2 text-gray-900 dark:text-gray-100">Move History</h3>
              <div className="h-64 overflow-y-auto font-mono text-sm whitespace-pre-wrap break-words text-gray-700 dark:text-gray-300">
                {pgn || 'No moves yet'}
              </div>
            </div>

            {/* Make Move */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
              <h3 className="font-semibold mb-2">Make Move</h3>
              <form onSubmit={(e) => {
                e.preventDefault();
                const input = e.currentTarget.elements.namedItem('move') as HTMLInputElement;
                if (input.value) {
                  const success = makeMove(input.value);
                  if (success) {
                    input.value = '';
                  }
                }
              }}>
                <input
                  type="text"
                  name="move"
                  className="w-full px-3 py-2 border rounded-md mb-2 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-100 dark:placeholder-gray-400"
                  placeholder="e.g., e4 or Nf3"
                />
                <button
                  type="submit"
                  className="w-full bg-blue-500 text-white py-2 rounded-md hover:bg-blue-600 dark:bg-blue-600 dark:hover:bg-blue-700"
                >
                  Make Move
                </button>
              </form>
            </div>

            {/* Player Configuration */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
              <h3 className="font-semibold mb-2">Player Configuration</h3>
              <div className="space-y-4">
                <PlayerConfig 
                  player={whitePlayer}
                  setPlayer={setWhitePlayer}
                  models={models}
                  playerColor="White"
                />
                <PlayerConfig 
                  player={blackPlayer}
                  setPlayer={setBlackPlayer}
                  models={models}
                  playerColor="Black"
                />
              </div>
            </div>

            {/* Game State */}
            <GameState fen={position} pgn={pgn} />

            {/* Prompt Configuration */}
            <PromptConfig
              systemPrompt={systemPrompt}
              setSystemPrompt={setSystemPrompt}
              userPromptTemplate={userPromptTemplate}
              setUserPromptTemplate={setUserPromptTemplate}
            />

            {/* Model Response */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
              <div className="flex justify-between items-center mb-2">
                <h3 className="font-semibold">Model Response</h3>
                <button
                  onClick={resetBoard}
                  className="px-3 py-1 text-sm bg-red-500 text-white rounded-md hover:bg-red-600"
                >
                  Reset Board
                </button>
              </div>
              <div className="space-y-2">
                <button
                  onClick={() => testAPI('chat')}
                  disabled={isLoading}
                  className="w-full bg-green-500 text-white py-2 rounded-md hover:bg-green-600 disabled:opacity-50"
                >
                  Ask Chat Model
                </button>
                <button
                  onClick={() => testAPI('completion')}
                  disabled={isLoading}
                  className="w-full bg-blue-500 text-white py-2 rounded-md hover:bg-blue-600 disabled:opacity-50"
                >
                  Ask Completion Model
                </button>
                <div className="mt-2 space-y-4">
                {formattedPrompt && (
                    <div className="p-2 bg-gray-100 rounded text-sm">
                      <div className="font-medium mb-1">Prompt Sent:</div>
                      <div className="whitespace-pre-wrap">{formattedPrompt}</div>
                    </div>
                  )}
                  {isLoading ? (
                    <div className="p-2 bg-gray-100 rounded text-sm">Loading...</div>
                  ) : (
                    <>
                      <div className="p-2 bg-gray-100 rounded text-sm">
                        <div className="font-medium mb-1">Extracted Move:</div>
                        <div>{apiResponse || 'No move extracted'}</div>
                        {apiResponse && isValidChessMove(apiResponse) && (
                          <button
                            onClick={() => makeMove(apiResponse)}
                            className="w-full mt-2 bg-green-500 text-white py-2 rounded-md hover:bg-green-600"
                          >
                            Play This Move
                          </button>
                        )}
                      </div>
                      <div className="p-2 bg-gray-100 rounded text-sm">
                        <div className="font-medium mb-1">Full Response:</div>
                        <div className="whitespace-pre-wrap">{fullApiResponse || 'Waiting for response...'}</div>
                      </div>
                    </>
                  )}
                </div>
              </div>
            </div>

            {/* Game Metrics */}
            {gameStatus !== 'playing' && (
              <GameMetrics 
                whiteFallbacks={whiteFallbacks}
                blackFallbacks={blackFallbacks}
                moveHistory={moveHistory}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}