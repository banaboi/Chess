function bootstrap() {
  const ui = window.ChessUI;
  const gameplay = window.ChessGameplay || {};
  const onSquareClick = typeof gameplay.control === "function" ? gameplay.control : () => {};
  const onSquarePointerDown =
    typeof gameplay.handleDragStart === "function" ? gameplay.handleDragStart : () => {};

  ui.initBoard({
    onSquareClick,
    onSquarePointerDown,
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

  if (startGameButton && typeof gameplay.startGameWithPreferences === "function") {
    startGameButton.addEventListener("click", () => {
      gameplay.startGameWithPreferences({
        humanColor: colorSelect?.value,
        difficulty: difficultySelect?.value,
      });
    });
  }

  const playAgainButton = document.getElementById("playAgainBtn");
  if (typeof gameplay.resetGame === "function") {
    playAgainButton.addEventListener("click", gameplay.resetGame);
  }
}

bootstrap();
