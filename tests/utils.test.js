function loadCoreModules() {
  const constants = require("../src/constants.js");
  const storeModule = require("../src/store.js");
  const utils = require("../src/utils.js");

  return {
    constants,
    store: storeModule.store,
    utils,
  };
}

describe("ChessUtils pure board-state helpers", () => {
  test("isEmptyCell works on piece codes", () => {
    const { utils } = loadCoreModules();
    expect(utils.isEmptyCell(" ")).toBe(true);
    expect(utils.isEmptyCell("")).toBe(true);
    expect(utils.isEmptyCell("pw")).toBe(false);
    expect(utils.isEmptyCell("kb")).toBe(false);
  });

  test("getPieceColor returns w or b from piece code", () => {
    const { utils } = loadCoreModules();
    expect(utils.getPieceColor("pw")).toBe("w");
    expect(utils.getPieceColor("kb")).toBe("b");
    expect(utils.getPieceColor(" ")).toBe(null);
    expect(utils.getPieceColor("")).toBe(null);
  });

  test("isOpposingPieceCode and isSameColorCode work on piece codes", () => {
    const { utils } = loadCoreModules();
    expect(utils.isOpposingPieceCode("w", "pb")).toBe(true);
    expect(utils.isOpposingPieceCode("w", "pw")).toBe(false);
    expect(utils.isOpposingPieceCode("b", "qw")).toBe(true);
    expect(utils.isSameColorCode("w", "pw")).toBe(true);
    expect(utils.isSameColorCode("w", "kb")).toBe(false);
    expect(utils.isSameColorCode("b", "rb")).toBe(true);
  });
});

describe("ChessUtils piece/color helpers", () => {
  test("isEmpty works on board state values", () => {
    const { utils } = loadCoreModules();
    expect(utils.isEmpty(" ")).toBe(true);
    expect(utils.isEmpty("pw")).toBe(false);
  });

  test("isWhitePiece and isBlackPiece detect color from DOM classes", () => {
    const { utils } = loadCoreModules();

    const whiteSquare = document.createElement("div");
    whiteSquare.classList.add("light-square", "pw");

    const blackSquare = document.createElement("div");
    blackSquare.classList.add("dark-square", "kb");

    expect(utils.isWhitePiece(whiteSquare)).toBe(true);
    expect(utils.isWhitePiece(blackSquare)).toBe(false);

    expect(utils.isBlackPiece(blackSquare)).toBe(true);
    expect(utils.isBlackPiece(whiteSquare)).toBe(false);
  });

  test("isOpposingPiece and isSamePiece compare color correctly", () => {
    const { utils } = loadCoreModules();

    const whitePiece = document.createElement("div");
    whitePiece.classList.add("light-square", "pw");

    const blackPiece = document.createElement("div");
    blackPiece.classList.add("dark-square", "kb");

    expect(utils.isOpposingPiece("w", blackPiece)).toBe(true);
    expect(utils.isOpposingPiece("w", whitePiece)).toBe(false);
    expect(utils.isOpposingPiece("b", whitePiece)).toBe(true);

    expect(utils.isSamePiece("w", whitePiece)).toBe(true);
    expect(utils.isSamePiece("w", blackPiece)).toBe(false);
  });
});

describe("ChessUtils.boardHasMoves", () => {
  test("returns true when any square has moves class", () => {
    const { store, utils } = loadCoreModules();

    // Prepare a minimal 8x8 grid of divs
    store.grid = [];
    for (let row = 0; row < 8; row++) {
      store.grid[row] = [];
      for (let col = 0; col < 8; col++) {
        const square = document.createElement("div");
        if (row === 0 && col === 0) {
          square.classList.add("moves");
        }
        store.grid[row][col] = square;
      }
    }

    expect(utils.boardHasMoves()).toBe(true);
  });

  test("returns false when no squares have moves class", () => {
    const { store, utils } = loadCoreModules();

    store.grid = [];
    for (let row = 0; row < 8; row++) {
      store.grid[row] = [];
      for (let col = 0; col < 8; col++) {
        const square = document.createElement("div");
        store.grid[row][col] = square;
      }
    }

    expect(utils.boardHasMoves()).toBe(false);
  });

  test("boardHasMoves(highlightSet) returns true when set is non-empty (no DOM)", () => {
    const { utils } = loadCoreModules();
    expect(utils.boardHasMoves(new Set())).toBe(false);
    expect(utils.boardHasMoves(new Set(["3,4"]))).toBe(true);
  });
});

