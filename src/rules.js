(() => {
const { HEIGHT, WIDTH, COLUMNS, ROWS } = window.ChessConstants;
const { store } = window.ChessStore;
const { isEmptyCell, isOpposingPieceCode, isSameColorCode } = window.ChessUtils;

function kingLocationForColor(color) {
  return color === "w" ? store.game.whiteKingLocation : store.game.blackKingLocation;
}

function squareId(row, col) {
  return `${COLUMNS[col]}${ROWS[row]}`;
}

function moveValidator(color, fromRow, fromCol, toRow, toCol, kingRow, kingCol, movingPiece, moveKeys) {
  const capturedPiece = store.game.state[toRow][toCol];
  store.game.state[toRow][toCol] = movingPiece;
  store.game.state[fromRow][fromCol] = " ";

  if (!isAttacked(color, kingRow, kingCol)) {
    moveKeys.add(`${toRow},${toCol}`);
  }

  store.game.state[toRow][toCol] = capturedPiece;
  store.game.state[fromRow][fromCol] = movingPiece;
}

function whitePawnMoves(color, row, col, moveKeys) {
  const state = store.game.state;
  if (row === 6 && isEmptyCell(state[row - 2][col]) && isEmptyCell(state[row - 1][col])) {
    moveValidator(color, row, col, row - 2, col, store.game.whiteKingLocation.i, store.game.whiteKingLocation.j, "pw", moveKeys);
  }
  if (row - 1 >= 0 && isEmptyCell(state[row - 1][col])) {
    moveValidator(color, row, col, row - 1, col, store.game.whiteKingLocation.i, store.game.whiteKingLocation.j, "pw", moveKeys);
  }
  if (row - 1 >= 0 && col - 1 >= 0 && isOpposingPieceCode(color, state[row - 1][col - 1])) {
    moveValidator(color, row, col, row - 1, col - 1, store.game.whiteKingLocation.i, store.game.whiteKingLocation.j, "pw", moveKeys);
  }
  if (row - 1 >= 0 && col + 1 < WIDTH && isOpposingPieceCode(color, state[row - 1][col + 1])) {
    moveValidator(color, row, col, row - 1, col + 1, store.game.whiteKingLocation.i, store.game.whiteKingLocation.j, "pw", moveKeys);
  }
}

function blackPawnMoves(color, row, col, moveKeys) {
  const state = store.game.state;
  if (row === 1 && isEmptyCell(state[row + 2][col]) && isEmptyCell(state[row + 1][col])) {
    moveValidator(color, row, col, row + 2, col, store.game.blackKingLocation.i, store.game.blackKingLocation.j, "pb", moveKeys);
  }
  if (row + 1 < HEIGHT && isEmptyCell(state[row + 1][col])) {
    moveValidator(color, row, col, row + 1, col, store.game.blackKingLocation.i, store.game.blackKingLocation.j, "pb", moveKeys);
  }
  if (row + 1 < HEIGHT && col - 1 >= 0 && isOpposingPieceCode(color, state[row + 1][col - 1])) {
    moveValidator(color, row, col, row + 1, col - 1, store.game.blackKingLocation.i, store.game.blackKingLocation.j, "pb", moveKeys);
  }
  if (row + 1 < HEIGHT && col + 1 < WIDTH && isOpposingPieceCode(color, state[row + 1][col + 1])) {
    moveValidator(color, row, col, row + 1, col + 1, store.game.blackKingLocation.i, store.game.blackKingLocation.j, "pb", moveKeys);
  }
}

function knightMoves(color, row, col, moveKeys) {
  const king = kingLocationForColor(color);
  const knight = color === "w" ? "Nw" : "Nb";
  const state = store.game.state;
  const offsets = [[-2, -1], [-2, 1], [-1, 2], [-1, -2], [2, -1], [2, 1], [1, 2], [1, -2]];

  for (const [rowOffset, colOffset] of offsets) {
    const nextRow = row + rowOffset;
    const nextCol = col + colOffset;
    if (
      nextRow >= 0 && nextRow < HEIGHT && nextCol >= 0 && nextCol < WIDTH &&
      (isEmptyCell(state[nextRow][nextCol]) || isOpposingPieceCode(color, state[nextRow][nextCol]))
    ) {
      moveValidator(color, row, col, nextRow, nextCol, king.i, king.j, knight, moveKeys);
    }
  }
}

function bishopMoves(color, row, col, moveKeys) {
  const king = kingLocationForColor(color);
  const bishop = color === "w" ? "bw" : "bb";
  const state = store.game.state;
  const directions = [[-1, -1], [-1, 1], [1, -1], [1, 1]];

  for (const [rowDir, colDir] of directions) {
    let currentRow = row + rowDir;
    let currentCol = col + colDir;
    while (
      currentRow >= 0 && currentRow < HEIGHT && currentCol >= 0 && currentCol < WIDTH &&
      !isSameColorCode(color, state[currentRow][currentCol])
    ) {
      moveValidator(color, row, col, currentRow, currentCol, king.i, king.j, bishop, moveKeys);
      if (isOpposingPieceCode(color, state[currentRow][currentCol])) break;
      currentRow += rowDir;
      currentCol += colDir;
    }
  }
}

function rookMoves(color, row, col, moveKeys) {
  const king = kingLocationForColor(color);
  const rook = color === "w" ? "rw" : "rb";
  const state = store.game.state;
  const directions = [[-1, 0], [1, 0], [0, -1], [0, 1]];

  for (const [rowDir, colDir] of directions) {
    let currentRow = row + rowDir;
    let currentCol = col + colDir;
    while (
      currentRow >= 0 && currentRow < HEIGHT && currentCol >= 0 && currentCol < WIDTH &&
      !isSameColorCode(color, state[currentRow][currentCol])
    ) {
      moveValidator(color, row, col, currentRow, currentCol, king.i, king.j, rook, moveKeys);
      if (isOpposingPieceCode(color, state[currentRow][currentCol])) break;
      currentRow += rowDir;
      currentCol += colDir;
    }
  }
}

function squaresAllowCastling(color, startCol, endCol, row) {
  const state = store.game.state;
  for (let col = startCol; col < endCol; col++) {
    if (!isEmptyCell(state[row][col]) || isAttacked(color, row, col)) {
      return false;
    }
  }
  return true;
}

/** Returns array of square ids that are valid castling destinations (no DOM). */
function getCastlingTargets(color) {
  const out = [];
  if (color === "w" && store.game.whiteCheck) return out;
  if (color === "b" && store.game.blackCheck) return out;

  if (
    color === "w" &&
    !store.castling.whiteKingMoved &&
    !store.castling.whiteLeftRookMoved &&
    squaresAllowCastling(color, 1, 4, 7)
  ) {
    out.push(squareId(7, 2));
  }
  if (
    color === "w" &&
    !store.castling.whiteKingMoved &&
    !store.castling.whiteRightRookMoved &&
    squaresAllowCastling(color, 5, 7, 7)
  ) {
    out.push(squareId(7, 6));
  }
  if (
    color === "b" &&
    !store.castling.blackKingMoved &&
    !store.castling.blackLeftRookMoved &&
    squaresAllowCastling(color, 1, 4, 0)
  ) {
    out.push(squareId(0, 2));
  }
  if (
    color === "b" &&
    !store.castling.blackKingMoved &&
    !store.castling.blackRightRookMoved &&
    squaresAllowCastling(color, 5, 7, 0)
  ) {
    out.push(squareId(0, 6));
  }
  return out;
}

function kingMoves(color, row, col, moveKeys, castleIds) {
  const king = color === "w" ? "kw" : "kb";
  const state = store.game.state;
  const targets = getCastlingTargets(color);
  castleIds.push(...targets);

  for (let candidateRow = row - 1; candidateRow <= row + 1; candidateRow++) {
    for (let candidateCol = col - 1; candidateCol <= col + 1; candidateCol++) {
      if (
        candidateRow >= 0 && candidateRow < HEIGHT && candidateCol >= 0 && candidateCol < WIDTH &&
        !isSameColorCode(color, state[candidateRow][candidateCol])
      ) {
        moveValidator(color, row, col, candidateRow, candidateCol, candidateRow, candidateCol, king, moveKeys);
      }
    }
  }
}

/**
 * Returns valid move targets for a piece (no DOM). Caller should apply highlights via applyHighlights.
 * @param {string} pieceCode - e.g. "pw", "kb"
 * @param {number} row - from row
 * @param {number} col - from col
 * @returns {{ moveKeys: Set<string>, castleIds: string[] }} moveKeys are "row,col"; castleIds are square ids like "C1"
 */
function getValidMoves(pieceCode, row, col) {
  const moveKeys = new Set();
  const castleIds = [];
  const color = pieceCode[1] === "w" ? "w" : "b";

  if (pieceCode === "pw") whitePawnMoves(color, row, col, moveKeys);
  else if (pieceCode === "pb") blackPawnMoves(color, row, col, moveKeys);
  else if (pieceCode.startsWith("N")) knightMoves(color, row, col, moveKeys);
  else if (pieceCode.startsWith("b")) bishopMoves(color, row, col, moveKeys);
  else if (pieceCode.startsWith("r")) rookMoves(color, row, col, moveKeys);
  else if (pieceCode.startsWith("k")) kingMoves(color, row, col, moveKeys, castleIds);
  else if (pieceCode.startsWith("q")) {
    bishopMoves(color, row, col, moveKeys);
    rookMoves(color, row, col, moveKeys);
  }

  return { moveKeys, castleIds };
}

/**
 * Returns valid moves for the piece on the given square. Accepts either a DOM square (uses classList[1]) or a pieceCode string.
 * Caller must apply highlights via ChessUI.applyHighlights(result).
 */
function showValidMoves(squareOrPieceCode, row, col) {
  const pieceCode = squareOrPieceCode && squareOrPieceCode.classList
    ? squareOrPieceCode.classList[1]
    : squareOrPieceCode;
  return getValidMoves(pieceCode, row, col);
}

function pawnChecks(color, row, col) {
  const state = store.game.state;
  const hasDirection = color === "w" ? row - 1 >= 0 : row + 1 < HEIGHT;
  const attackRow = color === "w" ? row - 1 : row + 1;
  const attackingPawn = color === "w" ? "pb" : "pw";
  if (hasDirection && col - 1 >= 0 && state[attackRow][col - 1] === attackingPawn) return true;
  if (hasDirection && col + 1 < WIDTH && state[attackRow][col + 1] === attackingPawn) return true;
  return false;
}

function knightChecks(color, row, col) {
  const state = store.game.state;
  const attackingKnight = color === "w" ? "Nb" : "Nw";
  const offsets = [[-2, -1], [-2, 1], [-1, 2], [-1, -2], [2, -1], [2, 1], [1, 2], [1, -2]];
  for (const [rowOffset, colOffset] of offsets) {
    const checkRow = row + rowOffset;
    const checkCol = col + colOffset;
    if (checkRow >= 0 && checkRow < HEIGHT && checkCol >= 0 && checkCol < WIDTH && state[checkRow][checkCol] === attackingKnight) {
      return true;
    }
  }
  return false;
}

function diagonalChecks(color, row, col) {
  const state = store.game.state;
  const attackingBishop = color === "w" ? "bb" : "bw";
  const attackingQueen = color === "w" ? "qb" : "qw";
  const directions = [[-1, -1], [-1, 1], [1, -1], [1, 1]];
  for (const [rowDir, colDir] of directions) {
    let currentRow = row + rowDir;
    let currentCol = col + colDir;
    while (currentRow >= 0 && currentRow < HEIGHT && currentCol >= 0 && currentCol < WIDTH) {
      const piece = state[currentRow][currentCol];
      if (piece === attackingBishop || piece === attackingQueen) return true;
      if (!isEmptyCell(piece)) break;
      currentRow += rowDir;
      currentCol += colDir;
    }
  }
  return false;
}

function verticalAndHorizontalChecks(color, row, col) {
  const state = store.game.state;
  const attackingRook = color === "w" ? "rb" : "rw";
  const attackingQueen = color === "w" ? "qb" : "qw";
  const directions = [[-1, 0], [1, 0], [0, -1], [0, 1]];
  for (const [rowDir, colDir] of directions) {
    let currentRow = row + rowDir;
    let currentCol = col + colDir;
    while (currentRow >= 0 && currentRow < HEIGHT && currentCol >= 0 && currentCol < WIDTH) {
      const piece = state[currentRow][currentCol];
      if (piece === attackingRook || piece === attackingQueen) return true;
      if (!isEmptyCell(piece)) break;
      currentRow += rowDir;
      currentCol += colDir;
    }
  }
  return false;
}

function kingChecks(color, row, col) {
  const state = store.game.state;
  const attackingKing = color === "w" ? "kb" : "kw";
  for (let checkRow = row - 1; checkRow <= row + 1; checkRow++) {
    for (let checkCol = col - 1; checkCol <= col + 1; checkCol++) {
      if (
        checkRow >= 0 && checkRow < HEIGHT && checkCol >= 0 && checkCol < WIDTH &&
        (checkRow !== row || checkCol !== col) &&
        state[checkRow][checkCol] === attackingKing
      ) {
        return true;
      }
    }
  }
  return false;
}

function isAttacked(color, row, col) {
  return (
    diagonalChecks(color, row, col) ||
    verticalAndHorizontalChecks(color, row, col) ||
    pawnChecks(color, row, col) ||
    knightChecks(color, row, col) ||
    kingChecks(color, row, col)
  );
}

window.ChessRules = {
  getValidMoves,
  getCastlingTargets,
  showValidMoves,
  isAttacked,
  squaresAllowCastling,
};
})();

if (typeof module !== "undefined" && module.exports && typeof window !== "undefined") {
  module.exports = window.ChessRules;
}
