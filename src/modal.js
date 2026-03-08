(() => {
const PIECE_CLASSES = ["qw", "qb", "rw", "rb", "bw", "bb", "Nw", "Nb"];
let onPromotionSelected = null;

function showGameOverModal(message) {
  document.getElementById("modalMessage").textContent = message;
  document.getElementById("gameOverModal").classList.add("active");
}

function hideGameOverModal() {
  document.getElementById("gameOverModal").classList.remove("active");
}

function showPromotionModal(color, callback) {
  const promotionModal = document.getElementById("promotionModal");
  if (!promotionModal) return;

  onPromotionSelected = callback;
  const choices = promotionModal.querySelectorAll(".promotion-choice");

  choices.forEach((choice) => {
    const pieceType = choice.dataset.piece;
    const piecePreview = choice.querySelector(".promotion-piece");
    if (piecePreview) {
      piecePreview.classList.remove(...PIECE_CLASSES);
      piecePreview.classList.add(`${pieceType}${color}`);
    }
  });

  promotionModal.classList.add("active");
}

function hidePromotionModal() {
  const promotionModal = document.getElementById("promotionModal");
  if (!promotionModal) return;
  promotionModal.classList.remove("active");
}

function initializePromotionModal() {
  const promotionModal = document.getElementById("promotionModal");
  if (!promotionModal) return;

  const choices = promotionModal.querySelectorAll(".promotion-choice");
  choices.forEach((choice) => {
    choice.addEventListener("click", () => {
      const selectedPieceType = choice.dataset.piece;
      const callback = onPromotionSelected;
      onPromotionSelected = null;
      hidePromotionModal();

      if (typeof callback === "function") {
        callback(selectedPieceType);
      }
    });
  });
}

initializePromotionModal();

window.ChessModal = {
  showGameOverModal,
  hideGameOverModal,
  showPromotionModal,
  hidePromotionModal,
};
})();

if (typeof module !== "undefined" && module.exports && typeof window !== "undefined") {
  module.exports = window.ChessModal;
}
