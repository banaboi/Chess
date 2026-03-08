/**
 * Engine tests: difficultyConfig (via requestBestMove), requestBestMove,
 * startNewGame, and fallback when Worker is unavailable.
 * Worker is mocked; no real Stockfish worker is used.
 */

let workerInstance;
let postMessageCalls;

function createMockWorker() {
  postMessageCalls = [];
  workerInstance = {
    postMessage: jest.fn((msg) => {
      postMessageCalls.push(msg);
    }),
    onmessage: null,
    onerror: null,
  };
  return workerInstance;
}

function simulateUciReady() {
  if (workerInstance && workerInstance.onmessage) {
    workerInstance.onmessage({ data: "uciok" });
    workerInstance.onmessage({ data: "readyok" });
  }
}

function simulateBestMove(move = "e2e4") {
  if (workerInstance && workerInstance.onmessage) {
    workerInstance.onmessage({ data: `bestmove ${move}` });
  }
}

describe("ChessEngine fallback when Worker fails", () => {
  let consoleErrorSpy;

  beforeAll(() => {
    consoleErrorSpy = jest.spyOn(console, "error").mockImplementation(() => {});
    jest.resetModules();
    global.Worker = function MockWorkerThrowing() {
      throw new Error("Worker not supported");
    };
    require("../src/engine.js");
  });

  afterAll(() => {
    consoleErrorSpy?.mockRestore();
    delete global.Worker;
  });

  test("requestBestMove returns null when Worker cannot be created", async () => {
    const result = await window.ChessEngine.requestBestMove(
      "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1",
      "medium"
    );
    expect(result).toBeNull();
  });

  test("startNewGame does not throw when Worker cannot be created", () => {
    expect(() => {
      window.ChessEngine.startNewGame();
    }).not.toThrow();
  });

  test("isAvailable returns false when Worker cannot be created", () => {
    expect(window.ChessEngine.isAvailable()).toBe(false);
  });
});

describe("ChessEngine with mocked Worker", () => {
  beforeAll(() => {
    jest.resetModules();
    global.Worker = function MockWorker() {
      return createMockWorker();
    };
    require("../src/engine.js");
  });

  afterAll(() => {
    delete global.Worker;
  });

  test("isAvailable returns true when Worker can be created", () => {
    expect(window.ChessEngine.isAvailable()).toBe(true);
  });

  test("startNewGame sends ucinewgame and isready", () => {
    postMessageCalls.length = 0;
    window.ChessEngine.startNewGame();
    expect(postMessageCalls).toContain("ucinewgame");
    expect(postMessageCalls).toContain("isready");
  });
});

describe("ChessEngine difficultyConfig (via requestBestMove)", () => {
  beforeEach(() => {
    jest.useFakeTimers();
    postMessageCalls.length = 0;
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  test("easy difficulty sends expected options and movetime", async () => {
    jest.resetModules();
    global.Worker = function MockWorker() {
      return createMockWorker();
    };
    require("../src/engine.js");

    const fen = "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1";
    const movePromise = window.ChessEngine.requestBestMove(fen, "easy");

    simulateUciReady();
    await Promise.resolve();
    simulateUciReady();
    await Promise.resolve();

    expect(
      postMessageCalls.some((m) => m === "setoption name Skill Level value 1")
    ).toBe(true);
    expect(
      postMessageCalls.some(
        (m) => m === "setoption name UCI_LimitStrength value true"
      )
    ).toBe(true);
    expect(
      postMessageCalls.some((m) => m === "setoption name UCI_Elo value 900")
    ).toBe(true);
    expect(
      postMessageCalls.some((m) => m === "go movetime 180")
    ).toBe(true);

    simulateBestMove("e2e4");
    await expect(movePromise).resolves.toBe("e2e4");
  });

  test("hard difficulty sends expected options and movetime", async () => {
    jest.resetModules();
    global.Worker = function MockWorker() {
      return createMockWorker();
    };
    require("../src/engine.js");

    const fen = "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1";
    const movePromise = window.ChessEngine.requestBestMove(fen, "hard");

    simulateUciReady();
    await Promise.resolve();
    simulateUciReady();
    await Promise.resolve();

    expect(
      postMessageCalls.some((m) => m === "setoption name Skill Level value 20")
    ).toBe(true);
    expect(
      postMessageCalls.some(
        (m) => m === "setoption name UCI_LimitStrength value false"
      )
    ).toBe(true);
    expect(
      postMessageCalls.some((m) => m.includes("UCI_Elo"))
    ).toBe(false);
    expect(
      postMessageCalls.some((m) => m === "go movetime 2400")
    ).toBe(true);

    simulateBestMove("g8f6");
    await expect(movePromise).resolves.toBe("g8f6");
  });

  test("medium (default) difficulty sends expected options and movetime", async () => {
    jest.resetModules();
    global.Worker = function MockWorker() {
      return createMockWorker();
    };
    require("../src/engine.js");

    const fen = "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1";
    const movePromise = window.ChessEngine.requestBestMove(fen, "medium");

    simulateUciReady();
    await Promise.resolve();
    simulateUciReady();
    await Promise.resolve();

    expect(
      postMessageCalls.some((m) => m === "setoption name Skill Level value 10")
    ).toBe(true);
    expect(
      postMessageCalls.some(
        (m) => m === "setoption name UCI_LimitStrength value true"
      )
    ).toBe(true);
    expect(
      postMessageCalls.some((m) => m === "setoption name UCI_Elo value 1500")
    ).toBe(true);
    expect(
      postMessageCalls.some((m) => m === "go movetime 700")
    ).toBe(true);

    simulateBestMove("e7e5");
    await expect(movePromise).resolves.toBe("e7e5");
  });
});

describe("ChessEngine requestBestMove fallback (timeout)", () => {
  beforeEach(() => {
    jest.useFakeTimers();
    postMessageCalls.length = 0;
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  test("resolves with null when no bestmove and fallback timeout fires", async () => {
    jest.resetModules();
    global.Worker = function MockWorker() {
      return createMockWorker();
    };
    require("../src/engine.js");

    const fen = "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1";
    const movePromise = window.ChessEngine.requestBestMove(fen, "easy");

    simulateUciReady();
    await Promise.resolve();
    simulateUciReady();
    await Promise.resolve();

    // Do not simulate bestmove; advance past fallback (moveTime + 2500 = 180 + 2500 = 2680 ms)
    jest.advanceTimersByTime(3000);

    await expect(movePromise).resolves.toBeNull();
  });
});
