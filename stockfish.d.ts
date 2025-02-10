declare module 'stockfish.js' {
    class Stockfish {
      constructor();
      postMessage(message: string): void;
      onmessage: ((e: { data: string }) => void) | null;
      terminate(): void;
    }
    export = Stockfish;
  }