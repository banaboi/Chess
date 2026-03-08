(() => {
/**
 * Applies a move to store.game.state and castling state. No DOM.
 * @param {object} store - ChessStore.store
 * @param {object} opts - { fromRow, fromCol, toRow, toCol, pieceCode, isCastle?, promotionPieceCode? }
 */
function applyMoveToState(store, opts) {
  const { fromRow, fromCol, toRow, toCol, pieceCode, isCastle, promotionPieceCode } = opts;
  const state = store.game.state;

  const pieceToPlace = promotionPieceCode || pieceCode;

  if (isCastle) {
    state[fromRow][fromCol] = " ";
    state[toRow][toCol] = pieceCode;

    if (toRow === 7 && toCol === 2) {
      state[7][0] = " ";
      state[7][3] = "rw";
    } else if (toRow === 7 && toCol === 6) {
      state[7][7] = " ";
      state[7][5] = "rw";
    } else if (toRow === 0 && toCol === 2) {
      state[0][0] = " ";
      state[0][3] = "rb";
    } else if (toRow === 0 && toCol === 6) {
      state[0][7] = " ";
      state[0][5] = "rb";
    }
  } else {
    state[fromRow][fromCol] = " ";
    state[toRow][toCol] = pieceToPlace;
  }

  if (pieceCode === "kw") {
    store.game.whiteKingLocation.i = toRow;
    store.game.whiteKingLocation.j = toCol;
  } else if (pieceCode === "kb") {
    store.game.blackKingLocation.i = toRow;
    store.game.blackKingLocation.j = toCol;
  }

  if (pieceCode === "kw" && fromRow === 7 && fromCol === 4) {
    store.castling.whiteKingMoved = true;
  } else if (pieceCode === "kb" && fromRow === 0 && fromCol === 4) {
    store.castling.blackKingMoved = true;
  } else if (fromRow === 7 && fromCol === 0) {
    store.castling.whiteLeftRookMoved = true;
  } else if (fromRow === 7 && fromCol === 7) {
    store.castling.whiteRightRookMoved = true;
  } else if (fromRow === 0 && fromCol === 0) {
    store.castling.blackLeftRookMoved = true;
  } else if (fromRow === 0 && fromCol === 7) {
    store.castling.blackRightRookMoved = true;
  }
}

window.ChessMoveApplier = {
  applyMoveToState,
};
})();

if (typeof module !== "undefined" && module.exports && typeof window !== "undefined") {
  module.exports = window.ChessMoveApplier;
}
