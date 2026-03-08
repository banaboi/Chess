// Helpers to bootstrap the globals the game code expects
function loadCoreModules() {
  // Jest's jsdom environment already provides window/document.
  const constants = require("../src/constants.js");
  const storeModule = require("../src/store.js");
  const utils = require("../src/utils.js");
  const rules = require("../src/rules.js");

  return {
    constants,
    store: storeModule.store,
    utils,
    rules,
  };
}

describe("ChessRules.isAttacked", () => {
  test("detects knight attacks correctly", () => {
    const { store, rules } = loadCoreModules();

    // Clear the board
    for (let row = 0; row < 8; row++) {
      for (let col = 0; col < 8; col++) {
        store.game.state[row][col] = " ";
      }
    }

    // Place white king on e4 (row 4, col 4 in 0-based indices) and black knight on f6
    store.game.whiteKingLocation = { i: 4, j: 4 };
    store.game.state[4][4] = "kw";
    store.game.state[2][5] = "Nb"; // knight two up, one right

    expect(rules.isAttacked("w", 4, 4)).toBe(true);
  });

  test("detects rook attacks along a file until blocked", () => {
    const { store, rules } = loadCoreModules();

    // Clear board
    for (let row = 0; row < 8; row++) {
      for (let col = 0; col < 8; col++) {
        store.game.state[row][col] = " ";
      }
    }

    // White king on e1, black rook on e8 with a blocking piece on e4
    store.game.whiteKingLocation = { i: 7, j: 4 };
    store.game.state[7][4] = "kw";
    store.game.state[0][4] = "rb";
    store.game.state[4][4] = "pw"; // blocking pawn

    expect(rules.isAttacked("w", 7, 4)).toBe(false);
  });

  test("detects adjacent enemy king attacks in all directions", () => {
    const { store, rules } = loadCoreModules();

    // Clear board
    for (let row = 0; row < 8; row++) {
      for (let col = 0; col < 8; col++) {
        store.game.state[row][col] = " ";
      }
    }

    // White king on d4
    store.game.whiteKingLocation = { i: 4, j: 3 };
    store.game.state[4][3] = "kw";

    // Place a black king directly above (d5)
    store.game.state[3][3] = "kb";
    expect(rules.isAttacked("w", 4, 3)).toBe(true);

    // Move black king to the right (e4)
    store.game.state[3][3] = " ";
    store.game.state[4][4] = "kb";
    expect(rules.isAttacked("w", 4, 3)).toBe(true);

    // Move black king on diagonal (e5)
    store.game.state[4][4] = " ";
    store.game.state[3][4] = "kb";
    expect(rules.isAttacked("w", 4, 3)).toBe(true);
  });
});

describe("ChessRules.squaresAllowCastling", () => {
  test("returns false when pieces block the path", () => {
    const { store, rules } = loadCoreModules();

    // Start from initial board and ensure white has full castling rights
    store.castling.whiteKingMoved = false;
    store.castling.whiteLeftRookMoved = false;

    // Ensure a blocking piece sits between king and rook on queenside (e.g. at c1 -> col 2)
    store.game.state[7][1] = "bw"; // a bishop between king and rook

    const canCastleQueenside = rules.squaresAllowCastling("w", 1, 4, 7);
    expect(canCastleQueenside).toBe(false);
  });

  test("returns true when path is empty and not attacked", () => {
    const { store, rules } = loadCoreModules();

    // Clear board
    for (let row = 0; row < 8; row++) {
      for (let col = 0; col < 8; col++) {
        store.game.state[row][col] = " ";
      }
    }

    // Place white king and rook in starting positions with no other pieces
    store.game.state[7][4] = "kw";
    store.game.whiteKingLocation = { i: 7, j: 4 };
    store.game.state[7][0] = "rw";

    const canCastleQueenside = rules.squaresAllowCastling("w", 1, 4, 7);
    expect(canCastleQueenside).toBe(true);
  });
});

