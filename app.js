const PREMOVE_PROMOTION_KEY = "chess.premovePromotion";
const PREMOVE_PROMOTION_VALUES = ["q", "r", "b", "N"];

function loadPremovePromotionFromStorage(updateSettings) {
  if (typeof updateSettings !== "function") return;
  try {
    if (typeof localStorage === "undefined") return;
    const stored = localStorage.getItem(PREMOVE_PROMOTION_KEY);
    if (stored && PREMOVE_PROMOTION_VALUES.includes(stored)) {
      updateSettings({ premovePromotion: stored });
    }
  } catch (_) {}
}

function savePremovePromotionToStorage(value) {
  try {
    if (typeof localStorage !== "undefined") {
      localStorage.setItem(PREMOVE_PROMOTION_KEY, value);
    }
  } catch (_) {}
}

function bootstrap() {
  const ui = window.ChessUI;
  const gameplay = window.ChessGameplay || {};
  const store = window.ChessStore?.store;
  const updateSettings = window.ChessStore?.updateSettings;

  loadPremovePromotionFromStorage(updateSettings);
  const onSquareClick = typeof gameplay.control === "function" ? gameplay.control : () => {};
  const onSquarePointerDown =
    typeof gameplay.handleDragStart === "function" ? gameplay.handleDragStart : () => {};
  const onContextMenu =
    typeof gameplay.cancelPreMove === "function"
      ? (_square, _row, _col) => gameplay.cancelPreMove()
      : () => false;

  ui.initBoard({
    onSquareClick,
    onSquarePointerDown,
    onContextMenu,
  });

  ui.syncPiecesFromState();
  if (typeof ui.updateCaptureAnnotation === "function") {
    ui.updateCaptureAnnotation();
  }

  const colorSelect = document.getElementById("playerColorSelect");
  const difficultySelect = document.getElementById("difficultySelect");
  const startGameButton = document.getElementById("startGameBtn");

  if (typeof gameplay.setPreferences === "function") {
    gameplay.setPreferences({
      humanColor: colorSelect?.value,
      difficulty: difficultySelect?.value,
    });
  }

  if (typeof ui.updateBoardOrientation === "function") {
    ui.updateBoardOrientation();
  }

  if (startGameButton && typeof gameplay.startGameWithPreferences === "function") {
    startGameButton.addEventListener("click", () => {
      gameplay.startGameWithPreferences({
        humanColor: colorSelect?.value,
        difficulty: difficultySelect?.value,
      });
    });
  }

  const settingsToggleBtn = document.getElementById("settingsToggleBtn");
  const settingsPanel = document.getElementById("settingsPanel");
  const premovePromotionSelect = document.getElementById("premovePromotionSelect");

  if (settingsToggleBtn && settingsPanel) {
    settingsToggleBtn.addEventListener("click", () => {
      settingsPanel.hidden = !settingsPanel.hidden;
      const isOpen = !settingsPanel.hidden;
      settingsToggleBtn.setAttribute("aria-expanded", String(isOpen));
      if (isOpen && premovePromotionSelect && store?.settings?.premovePromotion !== undefined) {
        premovePromotionSelect.value = store.settings.premovePromotion;
      }
    });
  }

  if (premovePromotionSelect && typeof updateSettings === "function") {
    premovePromotionSelect.addEventListener("change", () => {
      const value = premovePromotionSelect.value;
      if (value === "q" || value === "r" || value === "b" || value === "N") {
        updateSettings({ premovePromotion: value });
        savePremovePromotionToStorage(value);
      }
    });
  }

  if (premovePromotionSelect && store?.settings?.premovePromotion !== undefined) {
    premovePromotionSelect.value = store.settings.premovePromotion;
  }

  const playAgainButton = document.getElementById("playAgainBtn");
  if (typeof gameplay.resetGame === "function") {
    playAgainButton.addEventListener("click", gameplay.resetGame);
  }
}

bootstrap();
