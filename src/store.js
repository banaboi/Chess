(() => {
function createInitialBoardState() {
  return [
    ["rb", "Nb", "bb", "qb", "kb", "bb", "Nb", "rb"],
    ["pb", "pb", "pb", "pb", "pb", "pb", "pb", "pb"],
    [" ", " ", " ", " ", " ", " ", " ", " "],
    [" ", " ", " ", " ", " ", " ", " ", " "],
    [" ", " ", " ", " ", " ", " ", " ", " "],
    [" ", " ", " ", " ", " ", " ", " ", " "],
    ["pw", "pw", "pw", "pw", "pw", "pw", "pw", "pw"],
    ["rw", "Nw", "bw", "qw", "kw", "bw", "Nw", "rw"],
  ];
}

function createGameState() {
  return {
    turn: 0,
    finished: false,
    whiteToMove: true,
    blackToMove: false,
    whiteCheck: false,
    blackCheck: false,
    whiteKingLocation: { i: 7, j: 4 },
    blackKingLocation: { i: 0, j: 4 },
    state: createInitialBoardState(),
    legalMoves: new Set(),
    capturedByWhite: [],
    capturedByBlack: [],
  };
}

function createCastlingState() {
  return {
    whiteKingMoved: false,
    blackKingMoved: false,
    whiteLeftRookMoved: false,
    whiteRightRookMoved: false,
    blackLeftRookMoved: false,
    blackRightRookMoved: false,
  };
}

const store = {
  boardElement: null,
  grid: [],
  settings: {
    humanColor: "w",
    difficulty: "medium",
  },
  game: createGameState(),
  castling: createCastlingState(),
  pieceToMove: {
    i: 0,
    j: 0,
    location: null,
  },
  drag: {
    isDragging: false,
    ghost: null,
    source: null,
    sourceI: -1,
    sourceJ: -1,
    moved: false,
  },
};

function resetStoreGameState() {
  store.game = createGameState();
  store.castling = createCastlingState();
  store.pieceToMove = { i: 0, j: 0, location: null };
  store.drag = {
    isDragging: false,
    ghost: null,
    source: null,
    sourceI: -1,
    sourceJ: -1,
    moved: false,
  };
}

function updateSettings({ humanColor, difficulty } = {}) {
  if (humanColor === "w" || humanColor === "b") {
    store.settings.humanColor = humanColor;
  }

  if (["easy", "medium", "hard"].includes(difficulty)) {
    store.settings.difficulty = difficulty;
  }
}

window.ChessStore = {
  store,
  resetStoreGameState,
  updateSettings,
};

if (typeof module !== "undefined" && module.exports && typeof window !== "undefined") {
  module.exports = window.ChessStore;
}
})();
