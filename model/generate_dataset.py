"""
Step 1: Generate a fully-labeled tic-tac-toe dataset using minimax.

Board encoding: a list of 9 numbers.
    0  = empty cell
    1  = X
   -1  = O
Cell positions map to a 3x3 grid like this:
    0 1 2
    3 4 5
    6 7 8

For every reachable (legal) board state, we compute the minimax-optimal
move(s) for whoever's turn it is, and save one labeled example per state.
"""

import json
import random

# The 8 ways to win: 3 rows, 3 columns, 2 diagonals.
WIN_LINES = [
    (0,1,2), (3,4,5), (6,7,8),   # rows
    (0,3,6), (1,4,7), (2,5,8),   # columns
    (0,4,8), (2,4,6),            # diagonals
]


def winner(board):
    """Returns 1 if X has won, -1 if O has won, 0 if nobody has won yet."""
    for a, b, c in WIN_LINES:
        if board[a] != 0 and board[a] == board[b] == board[c]:
            return board[a]
    return 0


def is_full(board):
    """True if there are no empty cells left."""
    return 0 not in board


def minimax(board, player, memo):
    """
    Returns (best_score, best_moves) for `player` to move on `board`.
    best_score: +1 if this player can force a win, -1 if they will lose
                with perfect opposing play, 0 if it's a forced draw.
    best_moves: list of all cell indices that achieve best_score (there
                can be several equally good moves, especially early game).
    `memo` caches already-solved positions so we don't redo work.
    """
    key = (tuple(board), player)
    if key in memo:
        return memo[key]

    w = winner(board)
    if w != 0:
        memo[key] = (w * player, None)
        return memo[key]
    if is_full(board):
        memo[key] = (0, None)
        return memo[key]

    best_score = -2
    best_moves = []

    for i in range(9):
        if board[i] == 0:
            board[i] = player
            score, _ = minimax(board, -player, memo)
            score = -score
            board[i] = 0

            if score > best_score:
                best_score = score
                best_moves = [i]
            elif score == best_score:
                best_moves.append(i)

    memo[key] = (best_score, best_moves)
    return memo[key]


def collect_states(board, player, memo, dataset, seen):
    """
    Recursively walks every reachable board state via legal play and
    records each one (with its minimax-optimal move(s)) into `dataset`.
    """
    key = tuple(board)
    if key in seen:
        return
    seen.add(key)

    w = winner(board)
    if w != 0 or is_full(board):
        return

    score, best_moves = minimax(board[:], player, memo)
    dataset.append({
        "board": board[:],
        "player": player,
        "best_moves": best_moves,
    })

    for i in range(9):
        if board[i] == 0:
            board[i] = player
            collect_states(board, -player, memo, dataset, seen)
            board[i] = 0


def main():
    memo = {}
    dataset = []
    seen = set()

    collect_states([0] * 9, 1, memo, dataset, seen)

    print(f"Collected {len(dataset)} unique reachable board states")

    random.seed(42)
    examples = []
    for d in dataset:
        label = random.choice(d["best_moves"])
        examples.append({
            "board": d["board"],
            "player": d["player"],
            "label": label,
        })

    with open("tictactoe_dataset.json", "w") as f:
        json.dump(examples, f)

    print(f"Saved {len(examples)} training examples to tictactoe_dataset.json")


if __name__ == "__main__":
    main()