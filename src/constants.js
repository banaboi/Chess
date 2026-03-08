window.ChessConstants = {
  WIDTH: 8,
  HEIGHT: 8,
  COLUMNS: ["A", "B", "C", "D", "E", "F", "G", "H"],
  ROWS: [8, 7, 6, 5, 4, 3, 2, 1],
  /** Piece values for material and engine (pawn=1, knight=3, bishop=3, rook=5, queen=9, king=0). */
  PIECE_VALUES: {
    p: 1,
    N: 3,
    b: 3,
    r: 5,
    q: 9,
    k: 0,
  },
};

if (typeof module !== "undefined" && module.exports && typeof window !== "undefined") {
  module.exports = window.ChessConstants;
}
