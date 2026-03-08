(() => {
const { HEIGHT, WIDTH } = window.ChessConstants;
const { store } = window.ChessStore;

function pieceToFenChar(pieceClass) {
  if (pieceClass === " " || !pieceClass) return "";

  const type = pieceClass[0];
  const color = pieceClass[1];
  const isWhite = color === "w";

  if (type === "N") return isWhite ? "N" : "n";
  return isWhite ? type.toUpperCase() : type;
}

function boardToFen() {
  const fenRows = [];

  for (let row = 0; row < HEIGHT; row++) {
    let emptyCount = 0;
    let fenRow = "";

    for (let col = 0; col < WIDTH; col++) {
      const piece = store.game.state[row][col];
      if (piece === " ") {
        emptyCount += 1;
      } else {
        if (emptyCount > 0) {
          fenRow += String(emptyCount);
          emptyCount = 0;
        }
        fenRow += pieceToFenChar(piece);
      }
    }

    if (emptyCount > 0) {
      fenRow += String(emptyCount);
    }

    fenRows.push(fenRow);
  }

  const sideToMove = store.game.whiteToMove ? "w" : "b";
  let castling = "";

  if (!store.castling.whiteKingMoved && !store.castling.whiteRightRookMoved && store.game.state[7][7] === "rw") {
    castling += "K";
  }
  if (!store.castling.whiteKingMoved && !store.castling.whiteLeftRookMoved && store.game.state[7][0] === "rw") {
    castling += "Q";
  }
  if (!store.castling.blackKingMoved && !store.castling.blackRightRookMoved && store.game.state[0][7] === "rb") {
    castling += "k";
  }
  if (!store.castling.blackKingMoved && !store.castling.blackLeftRookMoved && store.game.state[0][0] === "rb") {
    castling += "q";
  }

  if (!castling) {
    castling = "-";
  }

  const enPassant = "-";
  const halfMoveClock = 0;
  const fullMoveNumber = Math.floor(store.game.turn / 2) + 1;

  return `${fenRows.join("/")} ${sideToMove} ${castling} ${enPassant} ${halfMoveClock} ${fullMoveNumber}`;
}

function uciSquareToIndices(square) {
  if (!/^[a-h][1-8]$/.test(square)) return null;
  const file = square.charCodeAt(0) - 97;
  const rank = Number(square[1]);
  return {
    row: 8 - rank,
    col: file,
  };
}

function parseUciMove(uciMove) {
  if (typeof uciMove !== "string" || !/^[a-h][1-8][a-h][1-8][qrbn]?$/.test(uciMove)) {
    return null;
  }

  const from = uciSquareToIndices(uciMove.substring(0, 2));
  const to = uciSquareToIndices(uciMove.substring(2, 4));
  if (!from || !to) return null;

  const promotionRaw = uciMove[4] || "";
  const promotion = promotionRaw === "n" ? "N" : promotionRaw;

  return {
    fromRow: from.row,
    fromCol: from.col,
    toRow: to.row,
    toCol: to.col,
    promotion,
  };
}

window.ChessNotation = {
  pieceToFenChar,
  boardToFen,
  uciSquareToIndices,
  parseUciMove,
};
})();

if (typeof module !== "undefined" && module.exports && typeof window !== "undefined") {
  module.exports = window.ChessNotation;
}
