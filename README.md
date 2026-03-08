# Chess

## Project Description

##### This is a mini game project made using vanilla JavaScript

## Features

* Pawn promotion (Queen, Rook, Bishop, Knight)
* Play against a Stockfish-powered chess engine
* Choose your side (White or Black)
* Adjustable engine difficulty (Easy, Medium, Hard)

## Refactor Structure

The game logic has been split into modules for maintainability:

* `app.js` - bootstrap and event wiring
* `src/constants.js` - board dimensions and column/row labels
* `src/store.js` - shared game state and UI refs
* `src/notation.js` - FEN and UCI (boardToFen, parseUciMove, etc.)
* `src/rules.js` - move generation and check detection
* `src/moveApplier.js` - apply move to state and castling (no DOM)
* `src/gameplay.js` - turn flow, moves, drag-and-drop, reset
* `src/ui.js` - board rendering and highlight cleanup
* `src/engine.js` - Stockfish worker and difficulty config
* `src/audio.js` - sound effects
* `src/modal.js` - game-over and promotion modal controls
* `src/utils.js` - square/piece helper functions

### Architecture

* **Script load order** (in `index.html`) is fixed: constants → store → notation → audio → modal → utils → ui → rules → engine → moveApplier → gameplay → app. Each module may depend on earlier globals.
* **Globals**: All modules attach a namespace to `window` (`ChessConstants`, `ChessStore`, `ChessNotation`, `ChessMoveApplier`, `ChessRules`, `ChessUtils`, `ChessUI`, `ChessEngine`, `ChessModal`, `ChessAudio`, `ChessGameplay`). The bootstrap in `app.js` wires them together.
* **Store**: `ChessStore.store` holds (1) **game state** — `game`, `castling`, `settings` — and (2) **UI refs** — `boardElement`, `grid`, `pieceToMove`, `drag`. Reset functions only clear game state and selection; UI refs are re-bound when the board is initialised.

## Testing

Automated tests are implemented with [Jest](https://jestjs.io/).

- **Test runner**: Jest with a jsdom environment.
- **Test location**: All tests live under the `tests/` directory:
  - `tests/rules.test.js` covers `ChessRules` (attack detection and castling path checks).
  - `tests/utils.test.js` covers `ChessUtils` (piece/color helpers and move highlighting detection).
  - `tests/gameplay.test.js` covers selected helpers from `ChessGameplay` (FEN generation and heuristic move scoring).

### Running tests

1. Install dependencies (first time only):
   - `npm install`
2. Run the test suite:
   - `npm test`
3. Run a single file in watch mode (example):
   - `npm test -- --runTestsByPath tests/rules.test.js --watch`

