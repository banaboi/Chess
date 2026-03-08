(() => {
const { COLUMNS, ROWS, HEIGHT, WIDTH } = window.ChessConstants;
const { store } = window.ChessStore;

function squareClassForPosition(row, col) {
  return (row + col) % 2 === 0 ? "light-square" : "dark-square";
}

function initBoard({ onSquareClick, onSquarePointerDown }) {
  store.boardElement = document.querySelector(".board");
  store.grid.length = 0;
  store.boardElement.innerHTML = "";

  for (let row = 0; row < HEIGHT; row++) {
    store.grid[row] = [];

    for (let col = 0; col < WIDTH; col++) {
      const square = document.createElement("div");
      square.id = `${COLUMNS[col]}${ROWS[row]}`;
      square.className = squareClassForPosition(row, col);

      square.addEventListener("click", () => {
        if (!store.drag.isDragging) {
          onSquareClick(square, row, col);
        }
      });

      square.addEventListener("mousedown", (event) => {
        onSquarePointerDown(event, square, row, col);
      });

      square.addEventListener(
        "touchstart",
        (event) => {
          onSquarePointerDown(event, square, row, col);
        },
        { passive: false }
      );

      store.boardElement.appendChild(square);
      store.grid[row][col] = square;
    }
  }
}

function syncPiecesFromState() {
  for (let row = 0; row < HEIGHT; row++) {
    for (let col = 0; col < WIDTH; col++) {
      const square = store.grid[row][col];
      square.classList.remove(
        "rb",
        "rw",
        "Nb",
        "Nw",
        "bb",
        "bw",
        "qb",
        "qw",
        "kb",
        "kw",
        "pb",
        "pw",
        "empty"
      );

      const piece = store.game.state[row][col];
      if (piece === " ") {
        square.classList.add("empty");
      } else {
        square.classList.add(piece);
      }
    }
  }
}

function clearHighlights() {
  for (let row = 0; row < HEIGHT; row++) {
    for (let col = 0; col < WIDTH; col++) {
      store.grid[row][col].classList.remove("ready", "moves", "castle", "dragging", "king-check-flash");
    }
  }
}

/**
 * Applies move/castle highlights from rules (getValidMoves/showValidMoves result).
 * @param {Set<string>} moveKeys - Set of "row,col" strings
 * @param {string[]} castleIds - Square ids e.g. ["C1", "G8"]
 */
function applyHighlights(moveKeys, castleIds) {
  if (!store.grid.length) return;
  for (const key of moveKeys) {
    const [r, c] = key.split(",").map(Number);
    if (store.grid[r] && store.grid[r][c]) {
      store.grid[r][c].classList.add("moves");
    }
  }
  for (const id of castleIds || []) {
    for (let row = 0; row < HEIGHT; row++) {
      for (let col = 0; col < WIDTH; col++) {
        if (store.grid[row][col].id === id) {
          store.grid[row][col].classList.add("castle");
          break;
        }
      }
    }
  }
}

const PIECE_TYPE_NAMES = { p: "pawn", N: "knight", b: "bishop", r: "rook", q: "queen", k: "king" };
const COLOR_NAMES = { w: "white", b: "black" };

/** Image filename for each piece code (same as board assets in images/). */
const PIECE_CODE_TO_IMAGE = {
  rb: "b_rook_1x.png", rw: "w_rook_1x.png",
  Nb: "b_knight_1x.png", Nw: "w_knight_1x.png",
  bb: "b_bishop_1x.png", bw: "w_bishop_1x.png",
  qb: "b_queen_1x.png", qw: "w_queen_1x.png",
  kb: "b_king_1x.png", kw: "w_king_1x.png",
  pb: "b_pawn_1x.png", pw: "w_pawn_1x.png",
};

function pieceCodeToAriaLabel(pieceCode) {
  if (!pieceCode || pieceCode.length < 2) return "Captured piece";
  const type = PIECE_TYPE_NAMES[pieceCode[0]] || "piece";
  const color = COLOR_NAMES[pieceCode[1]];
  const colorLabel = color ? color + " " : "";
  return "Captured: " + colorLabel + type;
}

function renderCaptureList(listElement, pieceCodes) {
  listElement.innerHTML = "";
  listElement.setAttribute("aria-label", pieceCodes.length ? "Captured pieces" : "No captures");
  for (const code of pieceCodes) {
    const icon = document.createElement("span");
    icon.className = "capture-icon";
    icon.setAttribute("role", "listitem");
    icon.setAttribute("aria-label", pieceCodeToAriaLabel(code));
    icon.style.display = "inline-block";
    icon.style.width = "28px";
    icon.style.height = "28px";
    const imgFile = PIECE_CODE_TO_IMAGE[code];
    if (imgFile) {
      icon.style.backgroundImage = "url(images/" + imgFile + ")";
      icon.style.backgroundSize = "contain";
      icon.style.backgroundRepeat = "no-repeat";
      icon.style.backgroundPosition = "center";
    }
    listElement.appendChild(icon);
  }
}

function updateCaptureAnnotation() {
  const listWhite = document.getElementById("captureListWhite");
  const listBlack = document.getElementById("captureListBlack");
  const scoreWhite = document.getElementById("captureScoreWhite");
  const scoreBlack = document.getElementById("captureScoreBlack");
  if (!listWhite || !listBlack || !scoreWhite || !scoreBlack) return;

  const capturedByWhite = store.game.capturedByWhite || [];
  const capturedByBlack = store.game.capturedByBlack || [];
  renderCaptureList(listWhite, capturedByWhite);
  renderCaptureList(listBlack, capturedByBlack);

  const { getMaterialBalance } = window.ChessCaptures || {};
  const balance = typeof getMaterialBalance === "function"
    ? getMaterialBalance(capturedByWhite, capturedByBlack)
    : 0;

  // Only show positive score: +N on the side that is ahead (White = bottom panel, Black = top panel).
  const whiteAdvantage = balance > 0 ? balance : 0;
  const blackAdvantage = balance < 0 ? -balance : 0;
  scoreWhite.textContent = whiteAdvantage ? "+" + whiteAdvantage : "";
  scoreBlack.textContent = blackAdvantage ? "+" + blackAdvantage : "";
}

window.ChessUI = {
  initBoard,
  syncPiecesFromState,
  clearHighlights,
  applyHighlights,
  updateCaptureAnnotation,
};
})();

if (typeof module !== "undefined" && module.exports && typeof window !== "undefined") {
  module.exports = window.ChessUI;
}
