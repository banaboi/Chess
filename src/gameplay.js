(() => {
const { HEIGHT, WIDTH, COLUMNS, ROWS, PIECE_VALUES } = window.ChessConstants;
const { store, resetStoreGameState, updateSettings } = window.ChessStore;
const { playCaptureSound, playMoveSound, playCheckAlertSound } = window.ChessAudio;
const { showGameOverModal, hideGameOverModal, showPromotionModal, hidePromotionModal } = window.ChessModal;
const { clearHighlights, syncPiecesFromState, applyHighlights, applyPreMoveHighlight, clearPreMoveHighlight, updateCaptureAnnotation } = window.ChessUI;
const { isAttacked, showValidMoves, getValidMoves } = window.ChessRules;
const { boardHasMoves, isBlackPiece, isEmpty, isMoves, isReady, isWhitePiece } = window.ChessUtils;
const { boardToFen: notationBoardToFen, parseUciMove: notationParseUciMove } = window.ChessNotation;
const { applyMoveToState } = window.ChessMoveApplier;
const { requestBestMove, startNewGame, isAvailable: isEngineAvailable } = window.ChessEngine || {};

let isPromotionPending = false;
let isEngineTurnInProgress = false;
let engineRequestId = 0;
let hasWarnedStockfishUnavailable = false;
let hasWarnedStockfishFallback = false;

const KING_CHECK_FLASH_CLASS = "king-check-flash";

function randomChoice(items) {
  return items[Math.floor(Math.random() * items.length)];
}

function currentTurnColor() {
  return store.game.whiteToMove ? "w" : "b";
}

function engineColor() {
  return store.settings.humanColor === "w" ? "b" : "w";
}

function isHumanTurn() {
  return currentTurnColor() === store.settings.humanColor;
}

function isEngineTurn() {
  return currentTurnColor() === engineColor();
}

function boardToFen() {
  return notationBoardToFen();
}

function findLegalMoveFromUci(legalMoves, uciMove) {
  const parsed = notationParseUciMove(uciMove);
  if (!parsed) return null;

  const matchingMove = legalMoves.find((moveOption) => {
    return (
      moveOption.fromRow === parsed.fromRow &&
      moveOption.fromCol === parsed.fromCol &&
      moveOption.toRow === parsed.toRow &&
      moveOption.toCol === parsed.toCol
    );
  });

  if (!matchingMove) return null;

  return {
    moveOption: matchingMove,
    promotionType: parsed.promotion || "q",
  };
}

function playCheckRestrictionFeedback(color) {
  playCheckAlertSound();
  const kingLocation = color === "w" ? store.game.whiteKingLocation : store.game.blackKingLocation;
  const kingSquare = store.grid[kingLocation.i]?.[kingLocation.j];
  if (!kingSquare) return;

  kingSquare.classList.remove(KING_CHECK_FLASH_CLASS);
  void kingSquare.offsetWidth;
  kingSquare.classList.add(KING_CHECK_FLASH_CLASS);
}

function currentCheckedSideToMove() {
  if (store.game.whiteToMove && store.game.whiteCheck) return "w";
  if (store.game.blackToMove && store.game.blackCheck) return "b";
  return null;
}

function isPromotionMove(pieceClass, row) {
  return (pieceClass === "pw" && row === 0) || (pieceClass === "pb" && row === 7);
}

function applyPromotion(destinationSquare, row, col, selectedType) {
  const color = store.game.state[row][col].substring(1);
  const promotedPieceClass = `${selectedType}${color}`;
  const previousPieceClass = store.game.state[row][col];

  destinationSquare.classList.remove(previousPieceClass);
  destinationSquare.classList.add(promotedPieceClass);
  store.game.state[row][col] = promotedPieceClass;
}

function announceCheckmate(color) {
  store.game.finished = true;
  showGameOverModal(color === "w" ? "White wins!" : "Black wins!");
}

function announceStalemate() {
  store.game.finished = true;
  showGameOverModal("Stalemate!");
}

function isCheckMate(color) {
  store.game.legalMoves.clear();

  for (let row = 0; row < HEIGHT; row++) {
    for (let col = 0; col < WIDTH; col++) {
      const piece = store.game.state[row][col];
      if (isEmpty(piece) || piece.substring(1) !== color) continue;
      const { moveKeys, castleIds } = getValidMoves(piece, row, col);
      const combined = new Set(moveKeys);
      castleIds.forEach((id) => combined.add("c:" + id));
      if (boardHasMoves(combined)) {
        store.game.legalMoves.add(store.grid[row][col].id);
      }
    }
  }

  return store.game.legalMoves;
}

function isStalemate(color) {
  for (let row = 0; row < HEIGHT; row++) {
    for (let col = 0; col < WIDTH; col++) {
      const piece = store.game.state[row][col];
      if (isEmpty(piece) || piece.substring(1) !== color) continue;
      const { moveKeys, castleIds } = getValidMoves(piece, row, col);
      const combined = new Set(moveKeys);
      castleIds.forEach((id) => combined.add("c:" + id));
      if (boardHasMoves(combined)) return false;
    }
  }
  return true;
}

function incrementGame() {
  store.game.turn += 1;
  store.game.whiteToMove = store.game.turn % 2 === 0;
  store.game.blackToMove = !store.game.whiteToMove;

  store.game.whiteCheck = isAttacked("w", store.game.whiteKingLocation.i, store.game.whiteKingLocation.j);
  store.game.blackCheck = isAttacked("b", store.game.blackKingLocation.i, store.game.blackKingLocation.j);

  if (store.game.whiteCheck && !isCheckMate("w").size) {
    announceCheckmate("b");
  }

  if (store.game.blackCheck && !isCheckMate("b").size) {
    announceCheckmate("w");
  }

  if (!store.game.finished) {
    if (store.game.whiteToMove && isStalemate("w")) {
      announceStalemate();
    } else if (store.game.blackToMove && isStalemate("b")) {
      announceStalemate();
    }
  }

  maybeRunEngineTurn();
}

function updateCastlingStateVariables() {
  const selectedPiece = store.pieceToMove.location?.classList[1];
  const selectedId = store.pieceToMove.location?.id;

  if (selectedPiece === "kw" && !store.castling.whiteKingMoved) {
    store.castling.whiteKingMoved = true;
  } else if (selectedPiece === "kb" && !store.castling.blackKingMoved) {
    store.castling.blackKingMoved = true;
  } else if (selectedId === "A1" && !store.castling.whiteLeftRookMoved) {
    store.castling.whiteLeftRookMoved = true;
  } else if (selectedId === "H1" && !store.castling.whiteRightRookMoved) {
    store.castling.whiteRightRookMoved = true;
  } else if (selectedId === "A8" && !store.castling.blackLeftRookMoved) {
    store.castling.blackLeftRookMoved = true;
  } else if (selectedId === "H8" && !store.castling.blackRightRookMoved) {
    store.castling.blackRightRookMoved = true;
  }
}

/** Updates DOM for rook move when castling (state is applied by applyMoveToState). */
function syncCastlingRookDom(destinationSquare) {
  if (destinationSquare.id === "C1") {
    document.getElementById("A1").classList.remove("rw");
    document.getElementById("A1").classList.add("empty");
    document.getElementById("D1").classList.remove("empty");
    document.getElementById("D1").classList.add("rw");
  } else if (destinationSquare.id === "G1") {
    document.getElementById("H1").classList.remove("rw");
    document.getElementById("H1").classList.add("empty");
    document.getElementById("F1").classList.remove("empty");
    document.getElementById("F1").classList.add("rw");
  } else if (destinationSquare.id === "C8") {
    document.getElementById("A8").classList.remove("rb");
    document.getElementById("A8").classList.add("empty");
    document.getElementById("D8").classList.remove("empty");
    document.getElementById("D8").classList.add("rb");
  } else if (destinationSquare.id === "G8") {
    document.getElementById("H8").classList.remove("rb");
    document.getElementById("H8").classList.add("empty");
    document.getElementById("F8").classList.remove("empty");
    document.getElementById("F8").classList.add("rb");
  }
}

function move(destinationSquare, row, col, options = {}) {
  const { isEngineMove = false, isPreMoveExecution = false, promotionType = "q", isCastle: optionsIsCastle } = options;
  const fromRow = store.pieceToMove.i;
  const fromCol = store.pieceToMove.j;
  const capture = !isEmpty(store.game.state[row][col]);
  if (capture) {
    const capturedPieceCode = store.game.state[row][col];
    if (store.game.whiteToMove) {
      store.game.capturedByWhite.push(capturedPieceCode);
    } else {
      store.game.capturedByBlack.push(capturedPieceCode);
    }
    playCaptureSound();
  } else {
    playMoveSound();
  }

  const fromSquare = store.pieceToMove.location;
  const pieceClass = fromSquare.classList[1];
  const isCastle = optionsIsCastle !== undefined ? optionsIsCastle : destinationSquare.classList.contains("castle");
  const usePromotionType = (isEngineMove || isPreMoveExecution) && isPromotionMove(pieceClass, row);
  const promotionPieceCode = usePromotionType ? promotionType + pieceClass[1] : undefined;

  fromSquare.classList.remove(pieceClass, "ready");
  fromSquare.classList.add("empty");

  destinationSquare.classList.remove(destinationSquare.classList[1], "moves", "empty");
  destinationSquare.classList.add(promotionPieceCode || pieceClass);

  applyMoveToState(store, {
    fromRow,
    fromCol,
    toRow: row,
    toCol: col,
    pieceCode: pieceClass,
    isCastle,
    promotionPieceCode,
  });

  if (isCastle) {
    syncCastlingRookDom(destinationSquare);
  }

  clearHighlights();

  if (isPromotionMove(pieceClass, row)) {
    if (isEngineMove || isPreMoveExecution) {
      incrementGame();
      updateCaptureAnnotation();
      return;
    }

    isPromotionPending = true;
    showPromotionModal(pieceClass.substring(1), (selectedType) => {
      applyPromotion(destinationSquare, row, col, selectedType);
      isPromotionPending = false;
      incrementGame();
      updateCaptureAnnotation();
    });
    return;
  }

  incrementGame();
  updateCaptureAnnotation();
}

function squareIdToRowCol(id) {
  const col = COLUMNS.indexOf(id[0]);
  const row = ROWS.indexOf(parseInt(id[1], 10));
  return row >= 0 && col >= 0 ? { row, col } : null;
}

function getLegalMovesForColor(color) {
  const legalMoves = [];
  clearHighlights();

  for (let row = 0; row < HEIGHT; row++) {
    for (let col = 0; col < WIDTH; col++) {
      const piece = store.game.state[row][col];
      if (isEmpty(piece) || piece.substring(1) !== color) continue;

      const fromSquare = store.grid[row][col];
      const { moveKeys, castleIds } = getValidMoves(piece, row, col);

      for (const key of moveKeys) {
        const [toRow, toCol] = key.split(",").map(Number);
        legalMoves.push({
          fromRow: row,
          fromCol: col,
          toRow,
          toCol,
          fromSquare,
          toSquare: store.grid[toRow][toCol],
          piece,
          targetPiece: store.game.state[toRow][toCol],
          isCastle: false,
        });
      }
      for (const id of castleIds) {
        const pos = squareIdToRowCol(id);
        if (!pos) continue;
        legalMoves.push({
          fromRow: row,
          fromCol: col,
          toRow: pos.row,
          toCol: pos.col,
          fromSquare,
          toSquare: store.grid[pos.row][pos.col],
          piece,
          targetPiece: store.game.state[pos.row][pos.col],
          isCastle: true,
        });
      }
    }
  }

  return legalMoves;
}

function withTemporaryMove(moveOption, callback) {
  const movingPiece = store.game.state[moveOption.fromRow][moveOption.fromCol];
  const capturedPiece = store.game.state[moveOption.toRow][moveOption.toCol];
  const savedWhiteKing = { ...store.game.whiteKingLocation };
  const savedBlackKing = { ...store.game.blackKingLocation };

  let castleSnapshot = null;
  if (moveOption.isCastle) {
    if (moveOption.toRow === 7 && moveOption.toCol === 2) {
      castleSnapshot = { rookFrom: [7, 0], rookTo: [7, 3], rookPiece: "rw" };
    } else if (moveOption.toRow === 7 && moveOption.toCol === 6) {
      castleSnapshot = { rookFrom: [7, 7], rookTo: [7, 5], rookPiece: "rw" };
    } else if (moveOption.toRow === 0 && moveOption.toCol === 2) {
      castleSnapshot = { rookFrom: [0, 0], rookTo: [0, 3], rookPiece: "rb" };
    } else if (moveOption.toRow === 0 && moveOption.toCol === 6) {
      castleSnapshot = { rookFrom: [0, 7], rookTo: [0, 5], rookPiece: "rb" };
    }
  }

  store.game.state[moveOption.toRow][moveOption.toCol] = movingPiece;
  store.game.state[moveOption.fromRow][moveOption.fromCol] = " ";

  if (castleSnapshot) {
    const [rookFromRow, rookFromCol] = castleSnapshot.rookFrom;
    const [rookToRow, rookToCol] = castleSnapshot.rookTo;
    store.game.state[rookFromRow][rookFromCol] = " ";
    store.game.state[rookToRow][rookToCol] = castleSnapshot.rookPiece;
  }

  if (movingPiece === "kw") {
    store.game.whiteKingLocation.i = moveOption.toRow;
    store.game.whiteKingLocation.j = moveOption.toCol;
  } else if (movingPiece === "kb") {
    store.game.blackKingLocation.i = moveOption.toRow;
    store.game.blackKingLocation.j = moveOption.toCol;
  }

  const score = callback();

  store.game.state[moveOption.fromRow][moveOption.fromCol] = movingPiece;
  store.game.state[moveOption.toRow][moveOption.toCol] = capturedPiece;

  if (castleSnapshot) {
    const [rookFromRow, rookFromCol] = castleSnapshot.rookFrom;
    const [rookToRow, rookToCol] = castleSnapshot.rookTo;
    store.game.state[rookFromRow][rookFromCol] = castleSnapshot.rookPiece;
    store.game.state[rookToRow][rookToCol] = " ";
  }

  store.game.whiteKingLocation = savedWhiteKing;
  store.game.blackKingLocation = savedBlackKing;

  return score;
}

function scoreMove(moveOption, difficulty) {
  let score = 0;

  if (!isEmpty(moveOption.targetPiece)) {
    score += PIECE_VALUES[moveOption.targetPiece[0]] * 12;
  }

  if (moveOption.isCastle) {
    score += 3;
  }

  if (moveOption.piece[0] === "p" && (moveOption.toRow === 0 || moveOption.toRow === 7)) {
    score += 8;
  }

  score += (3.5 - Math.abs(3.5 - moveOption.toCol)) * 0.35;
  score += (3.5 - Math.abs(3.5 - moveOption.toRow)) * 0.35;

  score += withTemporaryMove(moveOption, () => {
    const movingColor = moveOption.piece.substring(1);
    const opposingColor = movingColor === "w" ? "b" : "w";
    let localScore = 0;

    const opponentKing =
      opposingColor === "w" ? store.game.whiteKingLocation : store.game.blackKingLocation;

    if (isAttacked(opposingColor, opponentKing.i, opponentKing.j)) {
      localScore += 4;
    }

    const destinationIsAttacked = isAttacked(movingColor, moveOption.toRow, moveOption.toCol);
    if (destinationIsAttacked) {
      localScore -= PIECE_VALUES[moveOption.piece[0]] * (difficulty === "hard" ? 2.3 : 1.2);
    }

    return localScore;
  });

  if (difficulty === "medium") {
    return score;
  }

  if (difficulty === "hard") {
    if (moveOption.piece[0] === "q") score += 0.4;
    if (moveOption.piece[0] === "N" || moveOption.piece[0] === "b") score += 0.6;
    if (moveOption.piece[0] === "k") score -= 0.5;
  }

  return score;
}

function chooseEngineMove(color, difficulty) {
  const legalMoves = getLegalMovesForColor(color);
  if (!legalMoves.length) {
    return null;
  }

  if (difficulty === "easy") {
    return randomChoice(legalMoves);
  }

  let bestScore = Number.NEGATIVE_INFINITY;
  const bestMoves = [];

  for (const moveOption of legalMoves) {
    const currentScore = scoreMove(moveOption, difficulty);
    if (currentScore > bestScore) {
      bestScore = currentScore;
      bestMoves.length = 0;
      bestMoves.push(moveOption);
    } else if (currentScore === bestScore) {
      bestMoves.push(moveOption);
    }
  }

  return randomChoice(bestMoves);
}

async function performEngineMove(requestId) {
  if (store.game.finished || isPromotionPending || !isEngineTurn()) {
    return;
  }

  const side = engineColor();
  const legalMoves = getLegalMovesForColor(side);
  clearHighlights();

  if (!legalMoves.length) {
    return;
  }

  let selectedMove = null;
  let selectedPromotion = "q";

  if (typeof requestBestMove === "function" && typeof isEngineAvailable === "function" && isEngineAvailable()) {
    const fen = boardToFen();
    const uciMove = await requestBestMove(fen, store.settings.difficulty);

    if (
      requestId !== engineRequestId ||
      store.game.finished ||
      isPromotionPending ||
      !isEngineTurn()
    ) {
      return;
    }

    if (uciMove) {
      const mappedMove = findLegalMoveFromUci(legalMoves, uciMove);
      if (mappedMove) {
        selectedMove = mappedMove.moveOption;
        selectedPromotion = mappedMove.promotionType;
      } else if (!hasWarnedStockfishFallback) {
        hasWarnedStockfishFallback = true;
        console.warn("Stockfish move could not be mapped to a legal move. Falling back to local heuristic.");
      }
    }
  } else if (!hasWarnedStockfishUnavailable) {
    hasWarnedStockfishUnavailable = true;
    console.warn("Stockfish worker unavailable. Using local heuristic engine fallback.");
  }

  if (!selectedMove) {
    selectedMove = chooseEngineMove(side, store.settings.difficulty);
  }

  if (!selectedMove) return;

  store.pieceToMove.i = selectedMove.fromRow;
  store.pieceToMove.j = selectedMove.fromCol;
  store.pieceToMove.location = selectedMove.fromSquare;

  updateCastlingStateVariables();
  move(selectedMove.toSquare, selectedMove.toRow, selectedMove.toCol, {
    isEngineMove: true,
    promotionType: selectedPromotion,
  });

  isEngineTurnInProgress = false;
  tryExecutePreMove();
}

/**
 * If a pre-move is queued, checks whether it is still legal on the current board.
 * If so, executes it (state, DOM, sounds, turn increment); otherwise discards it.
 * Clears the queued pre-move and its visual in all cases.
 */
function tryExecutePreMove() {
  if (!store.preMove) return;

  const legalMoves = getLegalMovesForColor(store.settings.humanColor);
  const pm = store.preMove;
  const matching = legalMoves.find(
    (m) =>
      m.fromRow === pm.fromRow &&
      m.fromCol === pm.fromCol &&
      m.toRow === pm.toRow &&
      m.toCol === pm.toCol
  );

  store.preMove = null;
  clearPreMoveHighlight();

  if (!matching) return;

  const promotionType = pm.promotionType ?? store.settings.premovePromotion;
  store.pieceToMove.i = matching.fromRow;
  store.pieceToMove.j = matching.fromCol;
  store.pieceToMove.location = matching.fromSquare;
  updateCastlingStateVariables();
  move(matching.toSquare, matching.toRow, matching.toCol, {
    isPreMoveExecution: true,
    promotionType,
    isCastle: matching.isCastle,
  });
}

function maybeRunEngineTurn() {
  if (isEngineTurnInProgress || store.game.finished || isPromotionPending || !isEngineTurn()) {
    return;
  }

  const requestId = ++engineRequestId;
  isEngineTurnInProgress = true;
  setTimeout(async () => {
    try {
      await performEngineMove(requestId);
    } finally {
      isEngineTurnInProgress = false;
    }
  }, 260);
}

/**
 * Cancels the queued pre-move (if any): clears store.preMove and pre-move highlight.
 * @returns {boolean} true if a pre-move was cancelled, false if none was queued.
 */
function cancelPreMove() {
  if (!store.preMove) return false;
  store.preMove = null;
  clearPreMoveHighlight();
  clearHighlights();
  return true;
}

function control(square, row, col) {
  if (isPromotionPending) return;
  if (store.game.finished) return;

  if (isHumanTurn()) {
    const checkedColor = currentCheckedSideToMove();
    if (checkedColor && !isMoves(square) && !store.game.legalMoves.has(square.id)) {
      playCheckRestrictionFeedback(checkedColor);
      return;
    }

    if (
      (store.game.whiteToMove && isBlackPiece(square) && !isMoves(square)) ||
      (store.game.blackToMove && isWhitePiece(square) && !isMoves(square))
    ) {
      return;
    }

    if (!isEmpty(store.game.state[row][col]) && !isReady(square) && !isMoves(square)) {
      clearHighlights();
      square.classList.add("ready");
      store.pieceToMove.i = row;
      store.pieceToMove.j = col;
      store.pieceToMove.location = square;
      const result = showValidMoves(square, row, col);
      applyHighlights(result.moveKeys, result.castleIds);
    }

    if (isMoves(square) || square.classList.contains("castle")) {
      updateCastlingStateVariables();
      move(square, row, col);
    }
    return;
  }

  // Pre-move path: during engine's turn, allow selecting a friendly piece and a legal
  // destination to queue one move; cancel pre-move by clicking another friendly piece.
  const humanColor = store.settings.humanColor;
  if (store.preMove && !isEmpty(store.game.state[row][col]) && store.game.state[row][col].substring(1) === humanColor) {
    cancelPreMove();
    return;
  }

  if (!isEmpty(store.game.state[row][col]) && store.game.state[row][col].substring(1) === humanColor) {
    clearHighlights();
    clearPreMoveHighlight();
    square.classList.add("ready");
    store.pieceToMove.i = row;
    store.pieceToMove.j = col;
    store.pieceToMove.location = square;
    const result = showValidMoves(square, row, col);
    applyHighlights(result.moveKeys, result.castleIds);
    return;
  }

  if (store.pieceToMove.location && (isMoves(square) || square.classList.contains("castle"))) {
    const fromRow = store.pieceToMove.i;
    const fromCol = store.pieceToMove.j;
    const pieceClass = store.pieceToMove.location.classList[1];
    const promotionType = isPromotionMove(pieceClass, row) ? store.settings.premovePromotion : undefined;
    store.preMove = { fromRow, fromCol, toRow: row, toCol: col, promotionType };
    applyPreMoveHighlight(store.pieceToMove.location, square);
    clearHighlights();
    return;
  }

  clearHighlights();
  clearPreMoveHighlight();
}

function handleDragStart(event, square, row, col) {
  if (isPromotionPending) return;
  if (store.game.finished) return;
  if (isEmpty(store.game.state[row][col])) return;

  if (isHumanTurn()) {
    const checkedColor = currentCheckedSideToMove();
    if (checkedColor && !store.game.legalMoves.has(square.id)) {
      playCheckRestrictionFeedback(checkedColor);
      return;
    }
    const pieceColor = store.game.state[row][col].substring(1);
    if (store.game.whiteToMove && pieceColor === "b") return;
    if (store.game.blackToMove && pieceColor === "w") return;
  } else {
    if (store.game.state[row][col].substring(1) !== store.settings.humanColor) return;
  }

  event.preventDefault();
  store.drag.isDragging = true;
  store.drag.moved = false;
  store.drag.source = square;
  store.drag.sourceI = row;
  store.drag.sourceJ = col;

  clearHighlights();
  square.classList.add("ready");
  store.pieceToMove.i = row;
  store.pieceToMove.j = col;
  store.pieceToMove.location = square;
  const result = showValidMoves(square, row, col);
  applyHighlights(result.moveKeys, result.castleIds);

  store.drag.ghost = document.createElement("div");
  store.drag.ghost.classList.add("drag-ghost", square.classList[1]);
  document.documentElement.appendChild(store.drag.ghost);
  square.classList.add("dragging");

  const clientX = event.clientX || event.touches?.[0].clientX;
  const clientY = event.clientY || event.touches?.[0].clientY;
  store.drag.ghost.style.left = `${clientX}px`;
  store.drag.ghost.style.top = `${clientY}px`;

  document.addEventListener("mousemove", handleDragMove);
  document.addEventListener("mouseup", handleDragEnd);
  document.addEventListener("touchmove", handleDragMove, { passive: false });
  document.addEventListener("touchend", handleDragEnd);
}

function handleDragMove(event) {
  if (!store.drag.isDragging) return;

  event.preventDefault();
  store.drag.moved = true;

  const clientX = event.clientX || event.touches?.[0].clientX;
  const clientY = event.clientY || event.touches?.[0].clientY;
  store.drag.ghost.style.left = `${clientX}px`;
  store.drag.ghost.style.top = `${clientY}px`;
}

function handleDragEnd(event) {
  if (!store.drag.isDragging) return;
  event.preventDefault();

  document.removeEventListener("mousemove", handleDragMove);
  document.removeEventListener("mouseup", handleDragEnd);
  document.removeEventListener("touchmove", handleDragMove);
  document.removeEventListener("touchend", handleDragEnd);

  if (store.drag.ghost) {
    store.drag.ghost.remove();
    store.drag.ghost = null;
  }

  if (store.drag.source) {
    store.drag.source.classList.remove("dragging");
  }

  const clientX = event.clientX || event.changedTouches?.[0].clientX;
  const clientY = event.clientY || event.changedTouches?.[0].clientY;

  let targetSquare = null;
  let targetRow = -1;
  let targetCol = -1;

  for (let row = 0; row < HEIGHT; row++) {
    for (let col = 0; col < WIDTH; col++) {
      const rect = store.grid[row][col].getBoundingClientRect();
      if (clientX >= rect.left && clientX <= rect.right && clientY >= rect.top && clientY <= rect.bottom) {
        targetSquare = store.grid[row][col];
        targetRow = row;
        targetCol = col;
      }
    }
  }

  if (targetSquare && store.drag.moved && (isMoves(targetSquare) || targetSquare.classList.contains("castle"))) {
    if (isHumanTurn()) {
      updateCastlingStateVariables();
      move(targetSquare, targetRow, targetCol);
    } else {
      const fromRow = store.drag.sourceI;
      const fromCol = store.drag.sourceJ;
      const pieceClass = store.pieceToMove.location?.classList?.[1];
      const promotionType = pieceClass && isPromotionMove(pieceClass, targetRow) ? store.settings.premovePromotion : undefined;
      store.preMove = { fromRow, fromCol, toRow: targetRow, toCol: targetCol, promotionType };
      applyPreMoveHighlight(store.drag.source, targetSquare);
      clearHighlights();
    }
  } else if (store.drag.moved) {
    if (isHumanTurn()) {
      const checkedColor = currentCheckedSideToMove();
      if (checkedColor) {
        playCheckRestrictionFeedback(checkedColor);
      }
    }
    clearHighlights();
  }

  store.drag.isDragging = false;
  setTimeout(() => {
    store.drag.isDragging = false;
  }, 0);
}

function resetGame() {
  hideGameOverModal();
  hidePromotionModal();
  isPromotionPending = false;
  isEngineTurnInProgress = false;
  engineRequestId += 1;
  resetStoreGameState();
  if (typeof startNewGame === "function") {
    startNewGame();
  }
  clearPreMoveHighlight();
  clearHighlights();
  syncPiecesFromState();
  updateCaptureAnnotation();
  maybeRunEngineTurn();
}

function setPreferences({ humanColor, difficulty } = {}) {
  updateSettings({ humanColor, difficulty });
}

function startGameWithPreferences({ humanColor, difficulty } = {}) {
  setPreferences({ humanColor, difficulty });
  if (window.ChessUI && typeof window.ChessUI.updateBoardOrientation === "function") {
    window.ChessUI.updateBoardOrientation();
  }
  resetGame();
}

window.ChessGameplay = {
  control,
  handleDragStart,
  cancelPreMove,
  resetGame,
  setPreferences,
  startGameWithPreferences,
  // exposed for tests
  boardToFen,
  getLegalMovesForColor,
  scoreMove,
  chooseEngineMove,
  incrementGame,
  tryExecutePreMove,
};
})();

if (typeof module !== "undefined" && module.exports && typeof window !== "undefined") {
  module.exports = window.ChessGameplay;
}
