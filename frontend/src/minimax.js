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

function minimax(board, player, memo) {
    const key = board.join(',') + '|' + player;
    if (memo.has(key)) return memo.get(key);

    const w = winner(board);
    if (w !== 0) {
        const result = [w * player, null];
        memo.set(key, result);
        return result;
    }
    if (isFull(board)) {
        const result = [0, null];
        memo.set(key, result);
        return result;
    }

    let bestScore = -2;
    let bestMoves = [];

    for (let i = 0; i < 9; i++) {
        if (board[i] === 0) {
            board[i] = player;
            const [s] = minimax(board, -player, memo);
            const score = -s;
            board[i] = 0;

            if (score > bestScore) {
                bestScore = score;
                bestMoves = [i];
            } else if (score === bestScore) {
                bestMoves.push(i);
            }
        }
    }

    const result = [bestScore, bestMoves];
    memo.set(key, result);
    return result;
}

// This is the function we'll actually call from App.jsx.
export function getMinimaxMove(board, player) {
    const memo = new Map();
    const [, bestMoves] = minimax([...board], player, memo);
    // randomly pick among equally-good moves, same as the Python version
    return bestMoves[Math.floor(Math.random() * bestMoves.length)];
}