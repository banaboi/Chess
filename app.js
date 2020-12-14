// Classes
class Game {
    constructor() {
        this.turn = 0;
        this.finished = false;
        this.whiteToMove = (this.turn % 2 === 0);
        this.blackToMove = !this.whiteToMove;

        this.whiteKingLocation = {
            constructor() {
                this.i = 0;
                this.j = 0;
            }
        };

        this.blackKingLocation =  {
            constructor() {
                this.i = 0;
                this.j = 0;
            }
        };

        this.state = [  ["rb", "Nb", "bb", "qb", "kb", "bb", "Nb", "rb" ],
                        ["pb", "pb", "pb", "pb", "pb", "pb", "pb", "pb" ],
                        [" ", " ", " ", " ", " ", " ", " ", " "],
                        [" ", " ", " ", " ", " ", " ", " ", " "],
                        [" ", " ", " ", " ", " ", " ", " ", " "],
                        [" ", " ", " ", " ", " ", " ", " ", " "],
                        ["pw", "pw", "pw", "pw", "pw", "pw", "pw", "pw" ],
                        ["rw", "Nw", "bw", "qw", "kw", "bw", "Nw", "rw" ] ];
    }

    incrementGame() {
        this.turn++;
        this.whiteToMove = (this.turn % 2 === 0);
        this.blackToMove = !this.whiteToMove;
        console.log(this.state);
    }

}

// Constants
const board = document.querySelector('.board');
const WIDTH = 8;
const HEIGHT = 8;
const grid = [];
const columns = ['A','B','C','D','E','F','G','H'];
const rows = [8,7,6,5,4,3,2,1];

let game = new Game();

// State Variables
let pieceToMove = {
    constructor() {
        this.i = 0;
        this.j = 0;
        this.location = null;
    }
}

// Castling state variables
let whiteKingMoved = false;
let blackKingMoved = false;
let whiteLeftRookMoved = false;
let whiteRightRookMoved = false;
let blackLeftRookMoved = false;
let blackRightRookMoved = false;


function init_board() {
    for (let i = 0; i < HEIGHT; i++) {
        grid[i] = [];
        for (let j = 0; j < WIDTH; j++) {
            const square = document.createElement('div');
            square.setAttribute('id', columns[j] + rows[i]);
            if (i % 2 === 0 && j % 2 === 0) {
                square.setAttribute('class', 'light-square');
            } else if (i % 2 != 0 && j % 2 === 0) {
                square.setAttribute('class', 'dark-square');
            } else if (i % 2 === 0 && j % 2 != 0) {
                square.setAttribute('class', 'dark-square');
            } else {
                square.setAttribute('class', 'light-square');
            }
            
            square.addEventListener('click', function (e) {
                control (square,i,j);
            });
            board.appendChild(square);
            grid[i][j] = square;
            
        }
    }

    init_pieces();
    game.whiteKingLocation.i = 7;
    game.whiteKingLocation.j = 4;
    game.blackKingLocation.i = 0;
    game.blackKingLocation.j = 4;
}

function init_pieces() {
    for (let i = 0; i < HEIGHT; i++) {
        for (let j = 0; j < WIDTH; j++) {
            let type = (game.state[i][j] === " " ? "empty" : game.state[i][j]);
            grid[i][j].classList.add(type);
        }
    }
}

function control(square, i, j) {

    // If the game is finished, return
    if (game.finished) return;

    // Check whos turn it is
    if  ((game.whiteToMove && isBlackPiece(square) && !isMoves(square)) ||
        (game.blackToMove && isWhitePiece(square) && !isMoves(square))) {
        return;
    }

    // Square selected can be made ready, hence ready
    if (!isEmpty(game.state[i][j]) && !isReady(square) && !isMoves(square)) {
        reset();
        square.classList.add("ready");
        pieceToMove.i = i;
        pieceToMove.j = j;
        pieceToMove.location = square;
        showValidMoves(square,i,j);
    } 

    // Square selected is a move, hence move piece
    if (isMoves(square) || square.classList.contains("castle")) {
        updateCastlingStateVariables();
        move(pieceToMove, square, i, j);
    }
}

// Shows the valid moves for a given piece
function showValidMoves(square, i, j) {

    let color = (square.classList[1].substring(1) === "w") ? "w" : "b";

    // WHITE PAWN
    if (square.classList.contains("pw")) whitePawnMoves(color, i, j);
    // BLACK PAWN
    if (square.classList.contains("pb")) blackPawnMoves(color, i,j);
    // KNIGHT
    if (square.classList[1].substring(0,1) === "N") knightMoves(color, i,j);
    // BISHOP
    if (square.classList[1].substring(0,1) === "b") bishopMoves(color,i,j);
    // ROOK
    if (square.classList[1].substring(0,1) === "r") rookMoves(color, i,j);
    // KING
    if (square.classList[1].substring(0,1) === "k") kingMoves(color, i,j);
    // QUEEN
    if (square.classList[1].substring(0,1) === "q") {
        bishopMoves(color,i,j);
        rookMoves(color, i,j);
    }
}

function knightMoves(color, i, j) {

    // Logic is determined by which color knight is being moved
    let iKing = (color === "w") ? game.whiteKingLocation.i : game.blackKingLocation.i;
    let jKing = (color === "w") ? game.whiteKingLocation.j : game.blackKingLocation.j;
    let knight = (color === "w") ? "Nw" : "Nb";
    
    // Check up and left
    if (i - 2 >= 0 && j - 1 >= 0) {
        if (isEmpty(game.state[i-2][j-1]) || isOpposingPiece(color, grid[i-2][j-1])) {
            
            // Simulate movement
            let pieceTaken = game.state[i-2][j-1];
            game.state[i-2][j-1] = knight;
            game.state[i][j] = " ";
            // If the white king is attacked after move, illegal
            if (!isAttacked(color, iKing, jKing)) {
                grid[i-2][j-1].classList.add("moves");
            }
            game.state[i-2][j-1] = pieceTaken;
            game.state[i][j] = knight;
            
        } 
    }
    
    // Check up and right
    if (i - 2 >= 0 && j + 1 < WIDTH) {
        if (isEmpty(game.state[i-2][j+1]) || isOpposingPiece(color,grid[i-2][j+1])) {

            // Simulate movement
            let pieceTaken = game.state[i-2][j+1];
            game.state[i-2][j+1] = knight;
            game.state[i][j] = " ";
            // If the white king is attacked after move, illegal
            if (!isAttacked(color, iKing, jKing)) {
                grid[i-2][j+1].classList.add("moves");
            }
            game.state[i-2][j+1] = pieceTaken;
            game.state[i][j] = knight;
        }
    }
    
    // Check right and up
    if (i - 1 >= 0 && j + 2 < WIDTH) {
        if (isEmpty(game.state[i-1][j+2]) || isOpposingPiece(color,grid[i-1][j+2])) {
            // Simulate movement
            let pieceTaken = game.state[i-1][j+2];
            game.state[i-1][j+2] = knight;
            game.state[i][j] = " ";
            // If the white king is attacked after move, illegal
            if (!isAttacked(color, iKing, jKing)) {
                grid[i-1][j+2].classList.add("moves");
            }
            game.state[i-1][j+2] = pieceTaken;
            game.state[i][j] = knight;
        }
    }
    
    // Check left and up 
    if (i - 1 >= 0 && j - 2 >= 0) {
        if (isEmpty(game.state[i-1][j-2]) || isOpposingPiece(color,grid[i-1][j-2])) {
            // Simulate movement
            let pieceTaken = game.state[i-1][j-2];
            game.state[i-1][j-2] = knight;
            game.state[i][j] = " ";
            // If the white king is attacked after move, illegal
            if (!isAttacked(color, iKing, jKing)) {
                grid[i-1][j-2].classList.add("moves");
            }
            game.state[i-1][j-2] = pieceTaken;
            game.state[i][j] = knight;
        }
    }
    
    // Check down and left
    if (i + 2 < HEIGHT && j - 1 >= 0) {
        if (isEmpty(game.state[i+2][j-1]) || isOpposingPiece(color,grid[i+2][j-1])) {
            // Simulate movement
            let pieceTaken = game.state[i+2][j-1];
            game.state[i+2][j-1] = knight;
            game.state[i][j] = " ";
            // If the white king is attacked after move, illegal
            if (!isAttacked(color, iKing, jKing)) {
                grid[i+2][j-1].classList.add("moves");
            }
            game.state[i+2][j-1] = pieceTaken;
            game.state[i][j] = knight;
        }
    }
    
    // Check down and right
    if (i + 2 < HEIGHT && j + 1 < WIDTH) {
        if  (isEmpty(game.state[i+2][j+1]) || isOpposingPiece(color,grid[i+2][j+1])) {
            // Simulate movement
            let pieceTaken = game.state[i+2][j+1];
            game.state[i+2][j+1] = knight;
            game.state[i][j] = " ";
            // If the white king is attacked after move, illegal
            if (!isAttacked(color, iKing, jKing)) {
                grid[i+2][j+1].classList.add("moves");
            }
            game.state[i+2][j+1] = pieceTaken;
            game.state[i][j] = knight;
        }
    }
    
    // Check left and down
    if (i + 1 < HEIGHT && j + 2 < WIDTH) {
        if (isEmpty(game.state[i+1][j+2]) || isOpposingPiece(color,grid[i+1][j+2])) {
            // Simulate movement
            let pieceTaken = game.state[i+1][j+2];
            game.state[i+1][j+2] = knight;
            game.state[i][j] = " ";
            // If the white king is attacked after move, illegal
            if (!isAttacked(color, iKing, jKing)) {
                grid[i+1][j+2].classList.add("moves");
            }
            game.state[i+1][j+2] = pieceTaken;
            game.state[i][j] = knight;
        }
    }
    
    // Check right and down 
    if (i + 1 < HEIGHT && j - 2 >= 0) {
        if (isEmpty(game.state[i+1][j-2]) || isOpposingPiece(color,grid[i+1][j-2])) {
            // Simulate movement
            let pieceTaken = game.state[i+1][j-2];
            game.state[i+1][j-2] = knight;
            game.state[i][j] = " ";

            // If the white king is attacked after move, illegal
            if (!isAttacked(color, iKing, jKing)) {
                grid[i+1][j-2].classList.add("moves");
            }
            game.state[i+1][j-2] = pieceTaken;
            game.state[i][j] = knight;
        }
    }
}

function blackPawnMoves(color, i, j) {
     // Pawn can move two spots if not moved
     if (i === 1 && i + 2 >= 0 && isEmpty(game.state[i+2][j]) && isEmpty(game.state[i+1][j])) {

        // Simulate movement
        let pieceTaken = game.state[i+2][j];
        game.state[i+2][j] = "pb";
        game.state[i][j] = " ";

        // If the white king is attacked after move, illegal
        if (!isAttacked("b", game.blackKingLocation.i, game.blackKingLocation.j)) {
            grid[i+2][j].classList.add("moves");
        }

        game.state[i+2][j] = pieceTaken;
        game.state[i][j] = "pb"
        
    }
    // if there isnt a piece in front of pawn and the pawn isnt at end of board, valid move
    if (i + 1 < HEIGHT && isEmpty(game.state[i+1][j])) {

        // Simulate movement
        let pieceTaken = game.state[i+1][j];
        game.state[i+1][j] = "pb";
        game.state[i][j] = " ";

        // If the white king is attacked after move, illegal
        if (!isAttacked("b", game.blackKingLocation.i, game.blackKingLocation.j)) {
            grid[i+1][j].classList.add("moves");
        }
        game.state[i+1][j] = pieceTaken;
        game.state[i][j] = "pb"
    }

    // if there is a white piece diagonally from pawn, valid capture
    // check left
    if (i + 1 < HEIGHT && j - 1 >= 0 && isOpposingPiece(color, grid[i+1][j-1])) {
        // Simulate
        let pieceTaken = game.state[i+1][j-1];
        game.state[i+1][j-1] = "pb";
        game.state[i][j] = " ";

        // If the white king is attacked after move, illegal
        if (!isAttacked("b", game.blackKingLocation.i, game.blackKingLocation.j)) {
            grid[i+1][j-1].classList.add("moves");
        }

        game.state[i+1][j-1] = pieceTaken;
        game.state[i][j] = "pb"
    }

    // check right
    if (i + 1 < HEIGHT && j + 1 < WIDTH && isOpposingPiece(color,grid[i+1][j+1])) {
       // Simulate
       let pieceTaken = game.state[i+1][j-1];
       game.state[i+1][j+1] = "pb";
       game.state[i][j] = " ";

       // If the white king is attacked after move, illegal
       if (!isAttacked("b", game.blackKingLocation.i, game.blackKingLocation.j)) {
           grid[i+1][j+1].classList.add("moves");
       }

       // Revert
       game.state[i+1][j+1] = pieceTaken;
       game.state[i][j] = "pb"
    }
    
}

function whitePawnMoves(color, i,j) {

    // Pawn can move two spots if not moved
    if (i === 6 && i - 2 >= 0 && isEmpty(game.state[i-2][j]) && isEmpty(game.state[i-1][j])) {

        // Simulate movement
        let pieceTaken = game.state[i - 2][j];
        game.state[i-2][j] = "pw";
        game.state[i][j] = " ";

        // If the white king is attacked after move, illegal
        if (!isAttacked("w", game.whiteKingLocation.i, game.whiteKingLocation.j)) {
            grid[i-2][j].classList.add("moves");
        } 

        // Revert
        game.state[i - 2][j] = pieceTaken;
        game.state[i][j] = "pw";
        
    }
    // if there isnt a piece in front of pawn and the pawn isnt at end of board, psuedo valid move
    if (i - 1 >= 0 && isEmpty(game.state[i-1][j])) {

        // Simulate movement
        let pieceTaken = game.state[i - 1][j];
        game.state[i-1][j] = "pw";
        game.state[i][j] = " ";

        // If the white king is attacked after move, illegal
        if (!isAttacked("w", game.whiteKingLocation.i, game.whiteKingLocation.j)) {
            grid[i-1][j].classList.add("moves");
        } 
        // Revert
        game.state[i - 1][j] = pieceTaken;
        game.state[i][j] = "pw";
        
    }

    // if there is a black piece diagonally from pawn, valid capture
    // check left
    if (i - 1 >= 0 && j - 1 >= 0 && isOpposingPiece(color, grid[i-1][j-1])) {

        // Simulate 
        let pieceTaken = game.state[i-1][j-1];
        game.state[i-1][j-1] = "pw";
        game.state[i][j] = " ";

        // If the white king is attacked after move, illegal
        if (!isAttacked("w", game.whiteKingLocation.i, game.whiteKingLocation.j)) {
            grid[i-1][j-1].classList.add("moves");
        } 

        // Revert
        game.state[i-1][j-1] = pieceTaken;
        game.state[i][j] = "pw";
    }

    // check right
    if (i - 1 >= 0 && j + 1 < WIDTH && isOpposingPiece(color, grid[i-1][j+1])) {

        // Simulate 
        let pieceTaken = game.state[i-1][j+1];
        game.state[i-1][j+1] = "pw";
        game.state[i][j] = " ";

        // If the white king is attacked after move, illegal
        if (!isAttacked("w", game.whiteKingLocation.i, game.whiteKingLocation.j)) {
            grid[i-1][j+1].classList.add("moves");
        } 

        // Revert
        game.state[i-1][j+1] = pieceTaken;
        game.state[i][j] = "pw";
    }
}

function bishopMoves(color, i,j) {

    // Upper Left diagonal
    let iCurr = i - 1;
    let jCurr = j - 1;
    while (iCurr >= 0 && jCurr >= 0 && !isSamePiece(color, grid[iCurr][jCurr])) {
        grid[iCurr][jCurr].classList.add("moves");
        if (isOpposingPiece(color, grid[iCurr][jCurr])) break;

        iCurr--;
        jCurr--;

    }
    
    // Upper right diagonal
    iCurr = i - 1;
    jCurr = j + 1;
    while (iCurr >= 0 && jCurr < WIDTH && !isSamePiece(color, grid[iCurr][jCurr])) {
        grid[iCurr][jCurr].classList.add("moves");
        if (isOpposingPiece(color, grid[iCurr][jCurr])) break;

        iCurr--;
        jCurr++;
    }

    // Lower left diagonal
    iCurr = i + 1;
    jCurr = j - 1;
    while (iCurr < HEIGHT && jCurr >= 0 && !isSamePiece(color, grid[iCurr][jCurr])) {
        grid[iCurr][jCurr].classList.add("moves");
        if (isOpposingPiece(color, grid[iCurr][jCurr])) break;

        iCurr++;
        jCurr--;
    }

    // Lower right diagonal
    iCurr = i + 1;
    jCurr = j + 1;
    while (iCurr < HEIGHT && jCurr < WIDTH && !isSamePiece(color, grid[iCurr][jCurr])) {
        grid[iCurr][jCurr].classList.add("moves");
        if (isOpposingPiece(color, grid[iCurr][jCurr])) break;

        iCurr++;
        jCurr++;
    }
}

function rookMoves(color, i,j) {
    // Up 
    let iCurr = i - 1;
    let jCurr = j;
    while (iCurr >= 0 && !isSamePiece(color, grid[iCurr][jCurr])) {
        grid[iCurr][jCurr].classList.add("moves");
        if (isOpposingPiece(color, grid[iCurr][jCurr])) break;

        iCurr--;

    }
    
    // Down
    iCurr = i + 1;
    jCurr = j;
    while (iCurr < HEIGHT && !isSamePiece(color, grid[iCurr][jCurr])) {
        grid[iCurr][jCurr].classList.add("moves");
        if (isOpposingPiece(color, grid[iCurr][jCurr])) break;

        iCurr++;
    }

    // Left
    iCurr = i;
    jCurr = j - 1;
    while (jCurr >= 0 && !isSamePiece(color, grid[iCurr][jCurr])) {
        grid[iCurr][jCurr].classList.add("moves");
        if (isOpposingPiece(color, grid[iCurr][jCurr])) break;

        jCurr--;
    }

    // Right
    iCurr = i;
    jCurr = j + 1;
    while (jCurr < WIDTH && !isSamePiece(color, grid[iCurr][jCurr])) {
        grid[iCurr][jCurr].classList.add("moves");
        if (isOpposingPiece(color, grid[iCurr][jCurr])) break;

        jCurr++;
    }
}

function kingMoves(color, i,j) {

    checkCastlingRights(color);
    for (let row = i - 1; row < i + 2; row++) {
        for (let col = j - 1; col < j + 2; col++) {
            if (row >= 0 && row < HEIGHT && col >= 0 && col < WIDTH && !isSamePiece(color, grid[row][col])) {
                grid[row][col].classList.add("moves");
                
            }
        }
    }
}

function squaresAreEmpty(start,end, i) {
    for (let j = start; j < end; j++) {
        if (!isEmpty(game.state[i][j])) {
            return false;
        }
    }

    return true;
}

function pawnChecks(color, i,j) {

    let direction = (color === "w") ? (i - 1 >= 0) : (i + 1 < HEIGHT);
    let index = (color === "w") ? i - 1 : i + 1;
    let attackingPiece = (color === "w") ? "pb" : "pw";

    // Check left
    if (direction && j - 1 >= 0 && game.state[index][j-1] === attackingPiece) {
        return true;
    }
    // check right
    if (direction && j + 1 < WIDTH && game.state[index][j+1] === attackingPiece) {
        return true;
    }


    return false;
}

function knightChecks(color, i,j) {

    let attackingPiece = (color === "w") ? "Nb" : "Nw";

    // Check up and left
    if (i - 2 >= 0 && j - 1 >= 0) {
        if (game.state[i-2][j-1] === attackingPiece) {
            return true;
        } 
    }

    // Check up and right
    if (i - 2 >= 0 && j + 1 < WIDTH) {
        if (game.state[i-2][j+1] === attackingPiece) {
            return true;
        }
    }

    // Check right and up
    if (i - 1 >= 0 && j + 2 < WIDTH) {
        if (game.state[i-1][j+2] === attackingPiece) {
            return true;
        }
    }

    // Check left and up 
    if (i - 1 >= 0 && j - 2 >= 0) {
        if (game.state[i-1][j-2] === attackingPiece) {
            return true;
        }
    }

    // Check down and left
    if (i + 2 < HEIGHT && j - 1 >= 0) {
        if (game.state[i+2][j-1] === attackingPiece) {
            return true;
        }
    }

    // Check down and right
    if (i + 2 < HEIGHT && j + 1 < WIDTH) {
        if (game.state[i+2][j-1] === attackingPiece) {
            return true;
        }
    }

    // Check left and down
    if (i + 1 < HEIGHT && j + 2 < WIDTH) {
        if (game.state[i+1][j+2] === attackingPiece) {
            return true;
        }
    }

    // Check right and down 
    if (i + 1 < HEIGHT && j - 2 >= 0) {
        if (game.state[i+1][j-2] === attackingPiece) {
            return true;
        }
    }

    return false;
}

function diagonalChecks(color, i,j) {

    let attackingPieces = [];
    attackingPieces[0] = (color === "w") ? "bb" : "bw";
    attackingPieces[1] = (color === "w") ? "qb" : "qw";

    // Upper Left diagonal
    let iCurr = i - 1;
    let jCurr = j - 1;
    while (iCurr >= 0 && jCurr >= 0) {
        // Found a bishop or queen
        if (game.state[iCurr][jCurr] === attackingPieces[0] || game.state[iCurr][jCurr] === attackingPieces[1]) return true;
        // Found another piece blocking, not checked
        if (!isEmpty(game.state[iCurr][jCurr])) break;

        iCurr--;
        jCurr--;

    }

    // Upper right diagonal
    iCurr = i - 1;
    jCurr = j + 1;
    while (iCurr >= 0 && jCurr < WIDTH) {
        // Found a bishop or queen
        if (game.state[iCurr][jCurr] === attackingPieces[0] || game.state[iCurr][jCurr] === attackingPieces[1]) return true;
        // Found another piece blocking, not checked
        if (!isEmpty(game.state[iCurr][jCurr])) break;

        iCurr--;
        jCurr++;
    }

    // Lower left diagonal
    iCurr = i + 1;
    jCurr = j - 1;
    while (iCurr < HEIGHT && jCurr >= 0) {
        // Found a bishop or queen
        if (game.state[iCurr][jCurr] === attackingPieces[0] || game.state[iCurr][jCurr] === attackingPieces[1]) return true;
        // Found another piece blocking, not checked
        if (!isEmpty(game.state[iCurr][jCurr])) break;

        iCurr++;
        jCurr--;
    }

    // Lower right diagonal
    iCurr = i + 1;
    jCurr = j + 1;
    while (iCurr < HEIGHT && jCurr < WIDTH) {
        // Found a bishop or queen
        if (game.state[iCurr][jCurr] === attackingPieces[0] || game.state[iCurr][jCurr] === attackingPieces[1]) return true;
        // Found another piece blocking, not checked
        if (!isEmpty(game.state[iCurr][jCurr])) break;

        iCurr++;
        jCurr++;
    }
}

function verticalAndHorizontalChecks(color, i,j) {

    let attackingPieces = [];
    attackingPieces[0] = (color === "w") ? "rb" : "rw";
    attackingPieces[1] = (color === "w") ? "qb" : "qw";

    // Up 
    let iCurr = i - 1;
    let jCurr = j;
    while (iCurr >= 0) {
        // Found a rook or queen
        if (game.state[iCurr][jCurr] === attackingPieces[0] || game.state[iCurr][jCurr] === attackingPieces[1]) return true;
        // Found another piece blocking, not checked
        if (!isEmpty(game.state[iCurr][jCurr])) break;

        iCurr--;

    }
    
    // Down
    iCurr = i + 1;
    jCurr = j;
    while (iCurr < HEIGHT) {
        // Found a rook or queen
        if (game.state[iCurr][jCurr] === attackingPieces[0] || game.state[iCurr][jCurr] === attackingPieces[1]) return true;
        // Found another piece blocking, not checked
        if (!isEmpty(game.state[iCurr][jCurr])) break;

        iCurr++;
    }

    // Left
    iCurr = i;
    jCurr = j - 1;
    while (jCurr >= 0) {
       // Found a rook or queen
       if (game.state[iCurr][jCurr] === attackingPieces[0] || game.state[iCurr][jCurr] === attackingPieces[1]) return true;
        // Found another piece blocking, not checked
        if (!isEmpty(game.state[iCurr][jCurr])) break;

        jCurr--;
    }

    // Right
    iCurr = i;
    jCurr = j + 1;
    while (jCurr < WIDTH) {
        // Found a rook or queen
        if (game.state[iCurr][jCurr] === attackingPieces[0] || game.state[iCurr][jCurr] === attackingPieces[1]) return true;
        // Found another piece blocking, not checked
        if (!isEmpty(game.state[iCurr][jCurr])) break;

        jCurr++;
    }
}

// Checks castling rights
function checkCastlingRights(color) {
    // Check left white
    if (color === "w" && !whiteKingMoved && !whiteLeftRookMoved && squaresAreEmpty(1, 4, 7)) {
        // Can castle, highlight A3
        document.getElementById("C1").classList.add("castle");
    }
    // Check right white
    if (color === "w" && !whiteKingMoved && !whiteRightRookMoved && squaresAreEmpty(5, 7, 7)) {
        // Can castle, highlight, A7
        document.getElementById("G1").classList.add("castle");
    }
    // Check left black
    if (color === "b" && !blackKingMoved && !blackLeftRookMoved && squaresAreEmpty(1, 4, 0)) {
        // Can castle, highlight, A7
        document.getElementById("C8").classList.add("castle");
    }
    // Check right black
    if (color === "b" && !blackKingMoved && !blackRightRookMoved && squaresAreEmpty(5, 7, 0)) {
        // Can castle, highlight, A7
        document.getElementById("G8").classList.add("castle");
    }
}

function updateCastlingStateVariables() {
    if (pieceToMove.location.classList[1] === "kw" && whiteKingMoved === false) {
        whiteKingMoved = true;
    } else if (pieceToMove.location.classList[1] === "kb" && blackKingMoved === false) {
        blackKingMoved = true;
    } else if (pieceToMove.location.id === "A1" && whiteLeftRookMoved === false) {
        whiteLeftRookMoved = true;
    } else if (pieceToMove.location.id === "H1" && whiteRightRookMoved === false) {
        whiteRightRookMoved = true;
    } else if (pieceToMove.location.id === "A8" && blackLeftRookMoved === false) {
        blackLeftRookMoved = true;
    } else if (pieceToMove.location.id === "H8" && blackRightRookMoved === false) {
        blackRightRookMoved = true;
    } 
}

// Resets which squares are highlighted when selecting a piece to move
function reset() {
    for (let i = 0; i < HEIGHT; i++) {
        for (let j = 0; j < WIDTH; j++) {
            if (isReady(grid[i][j])) grid[i][j].classList.remove("ready");
            if (isMoves(grid[i][j])) grid[i][j].classList.remove("moves");
            if (grid[i][j].classList.contains("castle")) grid[i][j].classList.remove("castle");
        }
    }
}

// Moves a piece
function move(pieceToMove, destinationSquare, i, j) {

    // Update physical board
    let pieceClass = pieceToMove.location.classList[1];
    pieceToMove.location.classList.remove(pieceClass);
    pieceToMove.location.classList.remove("ready");
    pieceToMove.location.classList.add("empty");
    destinationSquare.classList.remove(destinationSquare.classList[1]);
    destinationSquare.classList.remove("moves");
    destinationSquare.classList.remove("empty");
    destinationSquare.classList.add(pieceClass);

    // Update game state
    game.state[i][j] = pieceClass;
    game.state[pieceToMove.i][pieceToMove.j] = " ";

    // Check if castling
    if (destinationSquare.classList.contains("castle")) {
        castle(destinationSquare);
    }

    // Update king location
    if (destinationSquare.classList[1] === "kw") {
        game.whiteKingLocation.i = i;   
        game.whiteKingLocation.j = j;
    } else if (destinationSquare.classList[1] === "kb") {
        game.blackKingLocation.i = i;
        game.blackKingLocation.j = j;
    }

    reset();

    // Move made, next turn
    game.incrementGame();

}

// Moves the appropriate rook when castling
function castle(destinationSquare) {
    if (destinationSquare.id === "C1") {
        // Put rook D1
        document.getElementById("A1").classList.remove("rw");
        document.getElementById("A1").classList.add("empty");
        document.getElementById("D1").classList.remove("empty");
        document.getElementById("D1").classList.add("rw");
    } else if (destinationSquare.id === "G1") {
        // Put rook on F1
        document.getElementById("H1").classList.remove("rw");
        document.getElementById("H1").classList.add("empty");
        document.getElementById("F1").classList.remove("empty");
        document.getElementById("F1").classList.add("rw");

    } else if (destinationSquare.id === "C8") {
        // Put rook on D8
        document.getElementById("A8").classList.remove("rb");
        document.getElementById("A8").classList.add("empty");
        document.getElementById("D8").classList.remove("empty");
        document.getElementById("D8").classList.add("rb");

    } else if (destinationSquare.id === "G8") {
        // Put rook on F8 
        document.getElementById("H8").classList.remove("rb");
        document.getElementById("H8").classList.add("empty");
        document.getElementById("F8").classList.remove("empty");
        document.getElementById("F8").classList.add("rb");
    }
}

function isEmpty(cell) {
    return (cell === " ");
}

function isReady(square) {
    return square.classList.contains("ready");
}

function isMoves(square) {
    return square.classList.contains("moves");
} 

function isOpposingPiece(color, square) {
    if (color === 'w') {
        return square.classList[1].substring(1) === 'b';
    } else {
        return square.classList[1].substring(1) === 'w';
    }
    
}

function isSamePiece(color, square) {
    return square.classList[1].substring(1) === color;
}

function isWhitePiece(square) {
    return square.classList[1].substring(1) === "w";
}

function isBlackPiece(square) {
    return square.classList[1].substring(1) === "b";
}

function isAttacked(color, i, j) {
    if (diagonalChecks(color, i,j) || verticalAndHorizontalChecks(color, i, j) || pawnChecks(color, i,j) || knightChecks(color, i,j)) {
        return true;
    }

    return false;
}

init_board();
