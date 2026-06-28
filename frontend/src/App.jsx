import { useState, useEffect } from 'react';
import './App.css';
import { getMinimaxMove } from './minimax';
import { mlpPredict } from './model';

const WIN_LINES = [
  [0, 1, 2], [3, 4, 5], [6, 7, 8],
  [0, 3, 6], [1, 4, 7], [2, 5, 8],
  [0, 4, 8], [2, 4, 6],
];

function winner(board) {
  for (const [a, b, c] of WIN_LINES) {
    if (board[a] !== 0 && board[a] === board[b] && board[b] === board[c]) {
      return board[a];
    }
  }
  return 0;
}

function isFull(board) {
  return board.every(v => v !== 0);
}

function getMlMove(board, player) {
  const probs = mlpPredict(board, player);
  let bestIndex = -1;
  let bestProb = -1;
  for (let i = 0; i < 9; i++) {
    if (board[i] === 0 && probs[i] > bestProb) {
      bestProb = probs[i];
      bestIndex = i;
    }
  }
  return bestIndex;
}

// Returns probabilities for empty cells only, renormalized to sum to 1.
// (Filled cells get 0 - they're not real options.)
function getDisplayProbs(board, player) {
  const probs = mlpPredict(board, player);
  const masked = probs.map((p, i) => (board[i] === 0 ? p : 0));
  const sum = masked.reduce((a, b) => a + b, 0);
  if (sum === 0) return masked;
  return masked.map(p => p / sum);
}

function App() {
  const [board, setBoard] = useState(Array(9).fill(0));
  const [isXTurn, setIsXTurn] = useState(true);
  const [mode, setMode] = useState('minimax');
  const [modeChanged, setModeChanged] = useState(false);

  const win = winner(board);
  const draw = !win && isFull(board);
  const gameOver = win !== 0 || draw;

  // Shows whoever's about to move's predicted move - X's perspective on
  // your turn, O's perspective on the bot's turn.
  const heatmapProbs = gameOver ? null : getDisplayProbs(board, isXTurn ? 1 : -1);

  useEffect(() => {
    if (isXTurn || gameOver) return;

    const timer = setTimeout(() => {
      const move = mode === 'minimax'
        ? getMinimaxMove(board, -1)
        : getMlMove(board, -1);

      const newBoard = [...board];
      newBoard[move] = -1;
      setBoard(newBoard);
      setIsXTurn(true);
    }, 400);

    return () => clearTimeout(timer);
  }, [isXTurn, board, gameOver, mode]);

  function handleClick(index) {
    if (!isXTurn) return;
    if (board[index] !== 0) return;
    if (gameOver) return;

    const newBoard = [...board];
    newBoard[index] = 1;
    setBoard(newBoard);
    setIsXTurn(false);
  }

  function resetGame() {
    setBoard(Array(9).fill(0));
    setIsXTurn(true);
  }

  function switchMode(newMode) {
    setMode(newMode);
    resetGame();
    setModeChanged(true);
    setTimeout(() => setModeChanged(false), 500);
  }

  function cellSymbol(value) {
    if (value === 1) return 'X';
    if (value === -1) return 'O';
    return '';
  }

  function statusMessage() {
    if (win === 1) return 'You win!';
    if (win === -1) return 'Bot wins!';
    if (draw) return "It's a draw.";
    return isXTurn ? 'Your turn' : 'Bot is thinking...';
  }

  return (
    <div className="game">
      {/* <svg style={{ position: 'absolute', width: 0, height: 0 }}>
        <filter id="squiggle">
          <feTurbulence
            type="fractalNoise"
            baseFrequency="0.02 0.3"
            numOctaves="2"
            result="noise"
            seed="3"
          />
          <feDisplacementMap
            in="SourceGraphic"
            in2="noise"
            scale="4"
          />
        </filter>
      </svg> */}

      <h1>Tic-Tac-Toe</h1>

      <div className="mode-toggle">
        <button
          className={mode === 'minimax' ? 'active' : ''}
          onClick={() => switchMode('minimax')}
        >
          Minimax bot
        </button>
        <button
          className={mode === 'ml' ? 'active' : ''}
          onClick={() => switchMode('ml')}
        >
          ML bot
        </button>
      </div>

      <p className="status">{statusMessage()}</p>

      <p className="heatmap-label">
        {isXTurn ? "What the model thinks you'll play" : 'What O (the bot) is thinking'}
      </p>

      <div className={`board ${modeChanged ? 'board-flash' : ''}`}>
        {board.map((value, index) => {
          const prob = heatmapProbs ? heatmapProbs[index] : 0;
          const isEmpty = value === 0;
          const filledClass = value === 1 ? 'cell-x' : value === -1 ? 'cell-o' : '';
          return (
            <button
              key={index}
              className={`cell ${filledClass}`}
              onClick={() => handleClick(index)}
              disabled={value !== 0 || gameOver || !isXTurn}
              style={{
                backgroundColor: isEmpty
                  ? `rgba(255, 80, 80, ${prob})`
                  : '#f7f2e4',
              }}
            >
              {isEmpty
                ? (prob > 0 ? `${Math.round(prob * 100)}%` : '')
                : cellSymbol(value)}
            </button>
          );
        })}
      </div>

      <p className="heatmap-caption">
        This shows the model's live guess for whoever's about to move — you, or the bot.
      </p>

      <button className="reset" onClick={resetGame}>Reset</button>

      {gameOver && (
        <div className="modal-overlay">
          <div className="modal-box">
            <h2 className="modal-title">{statusMessage()}</h2>
            <button className="modal-button" onClick={resetGame}>
              Play again
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
