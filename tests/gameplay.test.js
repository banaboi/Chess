function loadCoreModules() {
  const constants = require("../src/constants.js");
  const storeModule = require("../src/store.js");
  require("../src/utils.js");
  require("../src/rules.js");
  require("../src/audio.js");
  require("../src/modal.js");
  require("../src/ui.js");
  require("../src/notation.js");
  require("../src/moveApplier.js");
  const gameplay = require("../src/gameplay.js");

  return {
    constants,
    store: storeModule.store,
    resetStoreGameState: storeModule.resetStoreGameState,
    gameplay,
  };
}

describe("ChessGameplay.boardToFen", () => {
  test("produces initial position FEN", () => {
    const { store, gameplay } = loadCoreModules();

    // Reset to known initial state
    store.game.turn = 0;
    store.game.whiteToMove = true;
    store.game.blackToMove = false;
    store.castling.whiteKingMoved = false;
    store.castling.whiteLeftRookMoved = false;
    store.castling.whiteRightRookMoved = false;
    store.castling.blackKingMoved = false;
    store.castling.blackLeftRookMoved = false;
    store.castling.blackRightRookMoved = false;

    const fen = gameplay.boardToFen();
    expect(fen).toBe("rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1");
  });
});

describe("ChessGameplay.scoreMove heuristic", () => {
  test("prefers capturing a higher-value piece", () => {
    const { store, gameplay } = loadCoreModules();

    // Simplified board: white rook can capture either a pawn or a queen
    for (let row = 0; row < 8; row++) {
      for (let col = 0; col < 8; col++) {
        store.game.state[row][col] = " ";
      }
    }

    // White rook on a1
    store.game.state[7][0] = "rw";
    store.game.whiteKingLocation = { i: 7, j: 4 };
    store.game.blackKingLocation = { i: 0, j: 4 };

    // Targets on a3 (pawn) and a5 (queen)
    store.game.state[5][0] = "pb";
    store.game.state[3][0] = "qb";

    // Minimal grid so getLegalMovesForColor can reference DOM nodes
    store.grid = [];
    for (let row = 0; row < 8; row++) {
      store.grid[row] = [];
      for (let col = 0; col < 8; col++) {
        const square = document.createElement("div");
        square.classList.add((row + col) % 2 === 0 ? "light-square" : "dark-square");
        square.id = `test-${row}-${col}`;
        store.grid[row][col] = square;
      }
    }

    // Mark legal moves manually to avoid relying on full move generation here
    const capturePawnMove = {
      fromRow: 7,
      fromCol: 0,
      toRow: 5,
      toCol: 0,
      piece: "rw",
      targetPiece: "pb",
      isCastle: false,
    };
    const captureQueenMove = {
      fromRow: 7,
      fromCol: 0,
      toRow: 3,
      toCol: 0,
      piece: "rw",
      targetPiece: "qb",
      isCastle: false,
    };

    const pawnScore = gameplay.scoreMove(capturePawnMove, "medium");
    const queenScore = gameplay.scoreMove(captureQueenMove, "medium");

    expect(queenScore).toBeGreaterThan(pawnScore);
  });
});

describe("Capture state", () => {
  test("game state includes capturedByWhite and capturedByBlack", () => {
    const { store } = loadCoreModules();
    expect(store.game).toHaveProperty("capturedByWhite");
    expect(store.game).toHaveProperty("capturedByBlack");
    expect(Array.isArray(store.game.capturedByWhite)).toBe(true);
    expect(Array.isArray(store.game.capturedByBlack)).toBe(true);
  });

  test("resetStoreGameState clears capture lists", () => {
    const { store, resetStoreGameState } = loadCoreModules();
    store.game.capturedByWhite.push("pb");
    store.game.capturedByBlack.push("pw", "Nw");
    resetStoreGameState();
    expect(store.game.capturedByWhite).toHaveLength(0);
    expect(store.game.capturedByBlack).toHaveLength(0);
  });
});
