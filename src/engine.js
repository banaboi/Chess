(() => {
const STOCKFISH_WORKER_PATH = "lib/stockfish-nnue-16-single.js";

let worker = null;
let engineReady = false;
let hasInitializedUci = false;
let pendingRequest = null;
let fallbackTimeoutId = null;
let readyWaiters = [];

function difficultyConfig(difficulty) {
  if (difficulty === "easy") {
    return {
      limitStrength: true,
      elo: 900,
      skill: 1,
      moveTime: 180,
    };
  }

  if (difficulty === "hard") {
    return {
      limitStrength: false,
      elo: null,
      skill: 20,
      moveTime: 2400,
    };
  }

  return {
    limitStrength: true,
    elo: 1500,
    skill: 10,
    moveTime: 700,
  };
}

function clearPendingRequest(result = null) {
  if (fallbackTimeoutId) {
    clearTimeout(fallbackTimeoutId);
    fallbackTimeoutId = null;
  }

  if (pendingRequest) {
    const { resolve } = pendingRequest;
    pendingRequest = null;
    resolve(result);
  }
}

function handleMessage(event) {
  const raw = typeof event.data === "string" ? event.data : "";
  const line = raw.trim();
  if (!line) return;

  if (line === "uciok") {
    hasInitializedUci = true;
    console.log("Stockfish engine: UCI initialized successfully");
    worker.postMessage("isready");
    return;
  }

  if (line === "readyok") {
    engineReady = true;
    console.log("Stockfish engine: ready");
    if (readyWaiters.length) {
      const waiters = readyWaiters;
      readyWaiters = [];
      waiters.forEach((resolve) => resolve(true));
    }
    return;
  }

  if (line.startsWith("bestmove")) {
    const parts = line.split(/\s+/);
    const uciMove = parts[1] && parts[1] !== "(none)" ? parts[1] : null;
    console.log("Stockfish engine: bestmove =", uciMove);
    clearPendingRequest(uciMove);
  }
}

function initialize() {
  if (worker) return true;

  try {
    worker = new Worker(STOCKFISH_WORKER_PATH);
  } catch (error) {
    console.error("Failed to create Stockfish worker:", error);
    worker = null;
    return false;
  }

  worker.onmessage = handleMessage;
  worker.onerror = (err) => {
    console.error("Stockfish worker error:", err);
    engineReady = false;
    hasInitializedUci = false;
    if (readyWaiters.length) {
      const waiters = readyWaiters;
      readyWaiters = [];
      waiters.forEach((resolve) => resolve(false));
    }
    clearPendingRequest(null);
  };

  worker.postMessage("uci");
  console.log("Stockfish engine: worker created, waiting for UCI init...");
  return true;
}

function waitForReady(timeoutMs = 2500) {
  if (!initialize()) {
    return Promise.resolve(false);
  }

  engineReady = false;
  worker.postMessage("isready");

  return new Promise((resolve) => {
    const timeoutId = setTimeout(() => {
      const index = readyWaiters.indexOf(onReady);
      if (index >= 0) {
        readyWaiters.splice(index, 1);
      }
      resolve(false);
    }, timeoutMs);

    function onReady(ok) {
      clearTimeout(timeoutId);
      resolve(ok);
    }

    readyWaiters.push(onReady);
  });
}

function startNewGame() {
  if (!initialize()) return;
  worker.postMessage("ucinewgame");
  worker.postMessage("isready");
}

async function requestBestMove(fen, difficulty = "medium") {
  if (!initialize()) {
    return null;
  }

  if (!hasInitializedUci) {
    const uciReady = await waitForReady(3500);
    if (!uciReady) {
      return null;
    }
  }

  if (pendingRequest) {
    worker.postMessage("stop");
    clearPendingRequest(null);
  }

  const config = difficultyConfig(difficulty);

  worker.postMessage("setoption name Hash value 32");
  worker.postMessage(`setoption name Skill Level value ${config.skill}`);
  worker.postMessage(`setoption name UCI_LimitStrength value ${config.limitStrength ? "true" : "false"}`);
  if (config.limitStrength && Number.isFinite(config.elo)) {
    worker.postMessage(`setoption name UCI_Elo value ${config.elo}`);
  }

  const optionsReady = await waitForReady(3000);
  if (!optionsReady) {
    return null;
  }

  return new Promise((resolve) => {
    pendingRequest = {
      resolve,
    };

    worker.postMessage(`position fen ${fen}`);
    worker.postMessage(`go movetime ${config.moveTime}`);

    fallbackTimeoutId = setTimeout(() => {
      if (!pendingRequest) return;
      worker.postMessage("stop");
      clearPendingRequest(null);
    }, config.moveTime + 2500);
  });
}

function isAvailable() {
  return initialize();
}

window.ChessEngine = {
  startNewGame,
  requestBestMove,
  isAvailable,
};
})();
