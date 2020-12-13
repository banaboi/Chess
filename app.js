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
    }

    incrementGame() {
        this.turn++;
        this.whiteToMove = (this.turn % 2 === 0);
        this.blackToMove = !this.whiteToMove;
        if (this.isCheckMate("w")) {
            console.log("Black won!");
        }
        if (this.isCheckMate("b")) {
            console.log("White won!");
        }
        console.log("White king is checked: " + isInCheck("w"));
        console.log("Black king is checked: " + isInCheck("b"));
    }

    isCheckMate(color) {
        if (isInCheck(color)) {
            
            return true;
        }

        return false;   
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
            init_pieces(square);
            square.addEventListener('click', function (e) {
                control (square,i,j);
            });
            board.appendChild(square);
            grid[i][j] = square;
            
        }
    }

    game.whiteKingLocation.i = 7;
    game.whiteKingLocation.j = 4;
    game.blackKingLocation.i = 0;
    game.blackKingLocation.j = 4;
}

function init_pieces(square) {
    switch (square.getAttribute('id')) {
        case 'A1':
            square.classList.add('rw');
            return;
        case 'B1':
            square.classList.add('Nw');
            return;
        case 'C1':
            square.classList.add('bw');
            return;
        case 'D1':
            square.classList.add('qw');
            return;
        case 'E1':
            square.classList.add('kw');
            return;
        case 'F1':
            square.classList.add('bw');
            return;
        case 'G1':
            square.classList.add('Nw');
            return;
        case 'H1':
            square.classList.add('rw');
            return;
        case 'A8':
            square.classList.add('rb');
            return;
        case 'B8':
            square.classList.add('Nb');
            return;
        case 'C8':
            square.classList.add('bb');
            return;
        case 'D8':
            square.classList.add('qb');
            return;
        case 'E8':
            square.classList.add('kb');
            return;
        case 'F8':
            square.classList.add('bb');
            return;
        case 'G8':
            square.classList.add('Nb');
            return;
        case 'H8':
            square.classList.add('rb');
            return;

    }

    switch(square.getAttribute('id').substring(1)) {
        case '2':
            square.classList.add('pw');
            return;
        case '7':
            square.classList.add('pb');
            return;
    }

    square.classList.add("empty")

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
    if (!isEmpty(square) && !isReady(square) && !isMoves(square)) {
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
    // Check up and left
    if (i - 2 >= 0 && j - 1 >= 0) {
        if (isEmpty(grid[i-2][j-1]) || isOpposingPiece(color, grid[i-2][j-1])) {
            grid[i-2][j-1].classList.add("moves");
        } 
    }
    
    // Check up and right
    if (i - 2 >= 0 && j + 1 < WIDTH) {
        if (isEmpty(grid[i-2][j+1]) || isOpposingPiece(color,grid[i-2][j+1])) {
            grid[i-2][j+1].classList.add("moves");
        }
    }
    
    // Check right and up
    if (i - 1 >= 0 && j + 2 < WIDTH) {
        if (isEmpty(grid[i-1][j+2]) || isOpposingPiece(color,grid[i-1][j+2])) {
            grid[i-1][j+2].classList.add("moves");
        }
    }
    
    // Check left and up 
    if (i - 1 >= 0 && j - 2 >= 0) {
        if (isEmpty(grid[i-1][j-2]) || isOpposingPiece(color,grid[i-1][j-2])) {
            grid[i-1][j-2].classList.add("moves");
        }
    }
    
    // Check down and left
    if (i + 2 < HEIGHT && j - 1 >= 0) {
        if (isEmpty(grid[i+2][j-1]) || isOpposingPiece(color,grid[i+2][j-1])) {
            grid[i+2][j-1].classList.add("moves");
        }
    }
    
    // Check down and right
    if (i + 2 < HEIGHT && j + 1 < WIDTH) {
        if  (isEmpty(grid[i+2][j+1]) || isOpposingPiece(color,grid[i+2][j+1])) {
            grid[i+2][j+1].classList.add("moves");
        }
    }
    
    // Check left and down
    if (i + 1 < HEIGHT && j + 2 < WIDTH) {
        if (isEmpty(grid[i+1][j+2]) || isOpposingPiece(color,grid[i+1][j+2])) {
            grid[i+1][j+2].classList.add("moves");
        }
    }
    
    // Check right and down 
    if (i + 1 < HEIGHT && j - 2 >= 0) {
        if (isEmpty(grid[i+1][j-2]) || isOpposingPiece(color,grid[i+1][j-2])) {
            grid[i+1][j-2].classList.add("moves");
        }
    }
}

function blackPawnMoves(color, i, j) {
     // Pawn can move two spots if not moved
     if (i === 1 && i + 2 >= 0 && isEmpty(grid[i+2][j]) && isEmpty(grid[i+1][j])) {
        grid[i+2][j].classList.add("moves");
    }
    // if there isnt a piece in front of pawn and the pawn isnt at end of board, valid move
    if (i + 1 < HEIGHT && isEmpty(grid[i+1][j])) {
        grid[i+1][j].classList.add("moves");
    }

    // if there is a white piece diagonally from pawn, valid capture
    // check left
    if (i + 1 < HEIGHT && j - 1 >= 0 && isOpposingPiece(color, grid[i+1][j-1])) {
        grid[i+1][j-1].classList.add("moves");
    }
    // check right
    if (i + 1 < HEIGHT && j + 1 < WIDTH && isOpposingPiece(color,grid[i+1][j+1])) {
        grid[i+1][j+1].classList.add("moves");
    }
    
}

function whitePawnMoves(color, i,j) {

    // Pawn can move two spots if not moved
    if (i === 6 && i - 2 >= 0 && isEmpty(grid[i-2][j]) && isEmpty(grid[i-1][j])) {
        grid[i-2][j].classList.add("moves");
    }
    // if there isnt a piece in front of pawn and the pawn isnt at end of board, valid move
    if (i - 1 >= 0 && isEmpty(grid[i-1][j])) {
        grid[i-1][j].classList.add("moves");
    }

    // if there is a black piece diagonally from pawn, valid capture
    // check left
    if (i - 1 >= 0 && j - 1 >= 0 && isOpposingPiece(color, grid[i-1][j-1])) {
        grid[i-1][j-1].classList.add("moves");
    }
    // check right
    if (i - 1 >= 0 && j + 1 < WIDTH && isOpposingPiece(color, grid[i-1][j+1])) {
        grid[i-1][j+1].classList.add("moves");
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
        if (!isEmpty(grid[i][j])) {
            return false;
        }
    }

    return true;
}

// Checks if a given color king is in check or not
function isInCheck(color) {

    
    let i = (color === "w") ? game.whiteKingLocation.i : game.blackKingLocation.i;
    let j = (color === "w") ? game.whiteKingLocation.j : game.blackKingLocation.j;

    if (pawnChecks(color, i,j)) return true;
    if (knightChecks(color, i,j)) return true;
    if (diagonalChecks(color, i,j)) return true;
    if (verticalAndHorizontalChecks(color,i,j)) return true;
    return false;
}

function pawnChecks(color, i,j) {

    let direction = (color === "w") ? (i - 1 >= 0) : (i + 1 < HEIGHT);
    let index = (color === "w") ? i - 1 : i + 1;
    let attackingPiece = (color === "w") ? "pb" : "pw";

    // Check left
    if (direction && j - 1 >= 0 && grid[index][j-1].classList.contains(attackingPiece)) {
        return true;
    }
    // check right
    if (direction && j + 1 < WIDTH && grid[index][j+1].classList.contains(attackingPiece)) {
        return true;
    }


    return false;
}

function knightChecks(color, i,j) {

    let attackingPiece = (color === "w") ? "Nb" : "Nw";

    // Check up and left
    if (i - 2 >= 0 && j - 1 >= 0) {
        if (grid[i-2][j-1].classList.contains(attackingPiece)) {
            return true;
        } 
    }

    // Check up and right
    if (i - 2 >= 0 && j + 1 < WIDTH) {
        if (grid[i-2][j+1].classList.contains(attackingPiece)) {
            return true;
        }
    }

    // Check right and up
    if (i - 1 >= 0 && j + 2 < WIDTH) {
        if (grid[i-1][j+2].classList.contains(attackingPiece)) {
            return true;
        }
    }

    // Check left and up 
    if (i - 1 >= 0 && j - 2 >= 0) {
        if (grid[i-1][j-2].classList.contains(attackingPiece)) {
            return true;
        }
    }

    // Check down and left
    if (i + 2 < HEIGHT && j - 1 >= 0) {
        if (grid[i+2][j-1].classList.contains(attackingPiece)) {
            return true;
        }
    }

    // Check down and right
    if (i + 2 < HEIGHT && j + 1 < WIDTH) {
        if (grid[i+2][j-1].classList.contains(attackingPiece)) {
            return true;
        }
    }

    // Check left and down
    if (i + 1 < HEIGHT && j + 2 < WIDTH) {
        if (grid[i+1][j+2].classList.contains(attackingPiece)) {
            return true;
        }
    }

    // Check right and down 
    if (i + 1 < HEIGHT && j - 2 >= 0) {
        if (grid[i+1][j-2].classList.contains(attackingPiece)) {
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
        if (grid[iCurr][jCurr].classList.contains(attackingPieces[0]) || grid[iCurr][jCurr].classList.contains(attackingPieces[1])) return true;
        // Found another piece blocking, not checked
        if (!isEmpty(grid[iCurr][jCurr])) break;

        iCurr--;
        jCurr--;

    }

    // Upper right diagonal
    iCurr = i - 1;
    jCurr = j + 1;
    while (iCurr >= 0 && jCurr < WIDTH) {
        // Found a bishop or queen
        if (grid[iCurr][jCurr].classList.contains(attackingPieces[0]) || grid[iCurr][jCurr].classList.contains(attackingPieces[1])) return true;
        // Found another piece blocking, not checked
        if (!isEmpty(grid[iCurr][jCurr])) break;

        iCurr--;
        jCurr++;
    }

    // Lower left diagonal
    iCurr = i + 1;
    jCurr = j - 1;
    while (iCurr < HEIGHT && jCurr >= 0) {
        // Found a bishop or queen
        if (grid[iCurr][jCurr].classList.contains(attackingPieces[0]) || grid[iCurr][jCurr].classList.contains(attackingPieces[1])) return true;
        // Found another piece blocking, not checked
        if (!isEmpty(grid[iCurr][jCurr])) break;

        iCurr++;
        jCurr--;
    }

    // Lower right diagonal
    iCurr = i + 1;
    jCurr = j + 1;
    while (iCurr < HEIGHT && jCurr < WIDTH) {
        // Found a bishop or queen
        if (grid[iCurr][jCurr].classList.contains(attackingPieces[0]) || grid[iCurr][jCurr].classList.contains(attackingPieces[1])) return true;
        // Found another piece blocking, not checked
        if (!isEmpty(grid[iCurr][jCurr])) break;

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
        if (grid[iCurr][jCurr].classList.contains(attackingPieces[0]) || grid[iCurr][jCurr].classList.contains(attackingPieces[1])) return true;
        // Found another piece blocking, not checked
        if (!isEmpty(grid[iCurr][jCurr])) break;

        iCurr--;

    }
    
    // Down
    iCurr = i + 1;
    jCurr = j;
    while (iCurr < HEIGHT) {
        // Found a rook or queen
        if (grid[iCurr][jCurr].classList.contains(attackingPieces[0]) || grid[iCurr][jCurr].classList.contains(attackingPieces[1])) return true;
        // Found another piece blocking, not checked
        if (!isEmpty(grid[iCurr][jCurr])) break;

        iCurr++;
    }

    // Left
    iCurr = i;
    jCurr = j - 1;
    while (jCurr >= 0) {
       // Found a rook or queen
       if (grid[iCurr][jCurr].classList.contains(attackingPieces[0]) || grid[iCurr][jCurr].classList.contains(attackingPieces[1])) return true;
       // Found another piece blocking, not checked
       if (!isEmpty(grid[iCurr][jCurr])) break;

        jCurr--;
    }

    // Right
    iCurr = i;
    jCurr = j + 1;
    while (jCurr < WIDTH) {
        // Found a rook or queen
        if (grid[iCurr][jCurr].classList.contains(attackingPieces[0]) || grid[iCurr][jCurr].classList.contains(attackingPieces[1])) return true;
        // Found another piece blocking, not checked
        if (!isEmpty(grid[iCurr][jCurr])) break;

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

    let pieceClass = pieceToMove.location.classList[1];
    pieceToMove.location.classList.remove(pieceClass);
    pieceToMove.location.classList.remove("ready");
    pieceToMove.location.classList.add("empty");
    destinationSquare.classList.remove(destinationSquare.classList[1]);
    destinationSquare.classList.remove("moves");
    destinationSquare.classList.remove("empty");
    destinationSquare.classList.add(pieceClass);

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

function isEmpty(square) {
    return square.classList.contains("empty");
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

init_board();
