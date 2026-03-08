(() => {
const { store } = window.ChessStore;
const { HEIGHT, WIDTH } = window.ChessConstants;

// --- Pure board-state helpers (work on piece codes like "pw", "kb", " ") ---

function isEmptyCell(cell) {
  return cell === " " || cell === "";
}

function getPieceColor(pieceCode) {
  if (!pieceCode || isEmptyCell(pieceCode)) return null;
  const c = pieceCode[1];
  return c === "w" || c === "b" ? c : null;
}

function isOpposingPieceCode(color, pieceCode) {
  const pc = getPieceColor(pieceCode);
  return pc !== null && pc !== color;
}

function isSameColorCode(color, pieceCode) {
  return getPieceColor(pieceCode) === color;
}

// --- DOM / legacy helpers (delegate to pure helpers where possible) ---

function isEmpty(cell) {
  return isEmptyCell(cell);
}

function isReady(square) {
  return square.classList.contains("ready");
}

function isMoves(square) {
  return square.classList.contains("moves");
}

function isOpposingPiece(color, square) {
  const pieceCode = square.classList[1];
  return pieceCode ? isOpposingPieceCode(color, pieceCode) : false;
}

function isSamePiece(color, square) {
  const pieceCode = square.classList[1];
  return pieceCode ? isSameColorCode(color, pieceCode) : false;
}

function isWhitePiece(square) {
  return getPieceColor(square.classList[1]) === "w";
}

function isBlackPiece(square) {
  return getPieceColor(square.classList[1]) === "b";
}

/**
 * Returns true if there is at least one valid move.
 * @param {Set|undefined} highlightSet - Optional set of "row,col" (or any keys); if provided, returns true when non-empty (no DOM). If omitted, scans store.grid for "moves" class.
 */
function boardHasMoves(highlightSet) {
  if (highlightSet !== undefined) {
    return highlightSet.size > 0;
  }
  for (let row = 0; row < HEIGHT; row++) {
    for (let col = 0; col < WIDTH; col++) {
      if (isMoves(store.grid[row][col])) {
        return true;
      }
    }
  }
  return false;
}

window.ChessUtils = {
  isEmptyCell,
  getPieceColor,
  isOpposingPieceCode,
  isSameColorCode,
  isEmpty,
  isReady,
  isMoves,
  isOpposingPiece,
  isSamePiece,
  isWhitePiece,
  isBlackPiece,
  boardHasMoves,
};
})();

if (typeof module !== "undefined" && module.exports && typeof window !== "undefined") {
  module.exports = window.ChessUtils;
}
