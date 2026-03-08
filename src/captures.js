(() => {
const { PIECE_VALUES } = window.ChessConstants || { PIECE_VALUES: { p: 1, N: 3, b: 3, r: 5, q: 9, k: 0 } };

/**
 * Sum material value of a list of piece codes (e.g. ["pb", "Nw"]).
 * @param {string[]} pieceCodes
 * @returns {number}
 */
function sumCaptureValue(pieceCodes) {
  let total = 0;
  for (const code of pieceCodes) {
    const type = code && code[0];
    if (type && PIECE_VALUES[type] !== undefined) {
      total += PIECE_VALUES[type];
    }
  }
  return total;
}

/**
 * Material balance from capture lists. Positive = White ahead, negative = Black ahead.
 * @param {string[]} capturedByWhite - Piece codes White has captured (e.g. "pb", "Nb").
 * @param {string[]} capturedByBlack - Piece codes Black has captured (e.g. "pw", "qw").
 * @returns {number} whiteValue - blackValue (so > 0 means White is up material).
 */
function getMaterialBalance(capturedByWhite, capturedByBlack) {
  const whiteValue = sumCaptureValue(capturedByWhite || []);
  const blackValue = sumCaptureValue(capturedByBlack || []);
  return whiteValue - blackValue;
}

window.ChessCaptures = {
  PIECE_VALUES,
  sumCaptureValue,
  getMaterialBalance,
};
})();

if (typeof module !== "undefined" && module.exports && typeof window !== "undefined") {
  module.exports = window.ChessCaptures;
}
