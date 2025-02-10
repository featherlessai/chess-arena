# LLM Chess Arena - powered by [featherless.ai](https://featherless.ai) 🪶

![Chess Arena Logo](/src/assets/chessarena.png)

LLM Chess Arena is an interactive platform where you can play chess against various large language models such as DeepSeek, Mistral, Llama and other open-source models, powered by [Featherless.ai](https://featherless.ai). Watch LLMs play against each other, analyze positions, and experiment with different prompting strategies.

## Features

### 🎮 Interactive Chess Board
- Full chess game implementation with move validation
- Support for all standard chess moves including castling, en passant, and pawn promotion
- Visual move history and game state tracking

### 🤖 AI Integration
- Connect with multiple LLM models through Featherless.ai
- Support for both chat and completion-based models
- Customizable system and user prompts
- Real-time move extraction from AI responses

### ⚡ Advanced Features
- Autoplay mode for LLM vs LLM matches
- Adjustable delay between moves
- Failsafe system using Lichess moves and Stockfish engine
- Copy/paste support for FEN and PGN notations

### 🎨 Modern UI
- Responsive design that works on desktop and mobile
- Dark mode interface
- Real-time game status updates
- Configurable player settings

## Getting Started

1. Clone the repository:
```bash
git clone https://github.com/yourusername/chess-arena.git
cd chess-arena
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env` file in the root directory and follow below steps:

Quick Setup API

- Sign up for a [Featherless](https://featherless.ai/register) account

- Subscribe to a plan that fits your needs

- Navigate to the API Keys section in your dashboard

- Create a new API Key
- add your Featherless API key in your .env file:
VITE_FEATHERLESS_API_KEY=your_api_key_here

4. Start the development server:
```bash
npm run dev
```

## Configuration

### AI Models
The platform supports various AI models through Featherless.ai. You can configure:
- Model selection for both White and Black players
- Choice between chat and completion interfaces
- Custom system prompts and user templates

### Prompt Engineering
Customize how the AI interprets the chess position with:
- System prompts to set the AI's role and behavior
- User prompt templates with support for FEN and PGN notation
- Move extraction patterns and validation

## Technology Stack

- React
- TypeScript
- Vite
- chess.js for game logic
- react-chessboard for the UI
- TailwindCSS for styling
- Featherless.ai API for LLM integration
- Lichess API for opening book moves
- Stockfish.js for engine analysis

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request. For major changes, please open an issue first to discuss what you would like to change.

## Community & Support
Our growing community of developers, enthusiasts, and AI practitioners is here to help you get the most out of Featherless:
- Join our [Discord](https://discord.gg/7gybCMPjVA) community to connect with other users
- Share your experiences with us!
- Follow us on [X](https://x.com/FeatherlessAI)(@FeatherlessAI) for the latest updates
- Try out [DeepSeek-R1](https://featherless.ai/blog/deepseek-r1-available-for-premium-users) with unlimited tokens on our premium plan!

## License

[MIT License](LICENSE)

## Acknowledgments

- [Featherless.ai](https://featherless.ai) for AI model access
- [chess.js](https://github.com/jhlywa/chess.js) for chess logic
- [react-chessboard](https://github.com/Clariity/react-chessboard) for the chessboard UI
- [Lichess](https://lichess.org) for fallback moves
- [Stockfish](https://stockfishchess.org) for chess engine analysis

