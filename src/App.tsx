import Game from './Game';
import { ThemeProvider } from './context/ThemeContext';

export default function App() {
  return (
    <ThemeProvider>
      <div className="min-h-screen w-full flex items-center justify-center bg-gray-50 dark:bg-gray-900 transition-colors duration-200">
        <Game />
      </div>
    </ThemeProvider>
  );
}