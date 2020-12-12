
// Constants
const board = document.querySelector('.board');
const WIDTH = 8;
const HEIGHT = 8;
const grid = [];
const columns = ['A','B','C','D','E','F','G','H'];
const rows = [8,7,6,5,4,3,2,1];
let pieceToMove = {
    constructor() {
        this.i = 0;
        this.j = 0;
        this.location = null;
    }
    
}

// Globals


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
    
    // classes: ready, moves
    if (!isEmpty(square) && !isReady(square) && !isMoves(square)) {
        reset();
        square.classList.add("ready");
        pieceToMove.i = i;
        pieceToMove.j = j;
        pieceToMove.location = square;
        showValidMoves(square,i,j);
    } 


    if (isMoves(square)) {
        move(pieceToMove, square);
    }
}

function showValidMoves(square, i, j) {
    
    // WHITE PAWN
    if (square.classList.contains("pw")) {
        whitePawnMoves(i,j);
    }

    // BLACK PAWN
    if (square.classList.contains("pb")) {
        blackPawnMoves(i,j);
       
    }

    // WHITE KNIGHT
    if (square.classList.contains("Nw")) {
        whiteKnightMoves(i,j);
    }

    // WHITE BISHOP
    if (square.classList.contains("bw")) {
        whiteBishopMoves(i,j);
    }

    // WHITE ROOK
    if (square.classList.contains("rw")) {
        whiteRookMoves(i,j);
    }

    // WHITE QUEEN
    if (square.classList.contains("qw")) {
        whiteBishopMoves(i,j);
        whiteRookMoves(i,j);
    }

    // WHITE KING
    if (square.classList.contains("kw")) {
        whiteKingMoves(i,j);
    }
}

function whiteKnightMoves(i, j) {
    // Check up and left
    if (i - 2 >= 0 && j - 1 >= 0) {
        if (isEmpty(grid[i-2][j-1]) || isBlackPiece(grid[i-2][j-1])) {
            grid[i-2][j-1].classList.add("moves");
        } 
    }
    
    // Check up and right
    if (i - 2 >= 0 && j + 1 < WIDTH) {
        if (isEmpty(grid[i-2][j+1]) || isBlackPiece(grid[i-2][j+1])) {
            grid[i-2][j+1].classList.add("moves");
        }
    }
    
    // Check right and up
    if (i - 1 >= 0 && j + 2 < WIDTH) {
        if (isEmpty(grid[i-1][j+2]) || isBlackPiece(grid[i-1][j+2])) {
            grid[i-1][j+2].classList.add("moves");
        }
    }
    
    // Check left and up 
    if (i - 1 >= 0 && j - 2 >= 0) {
        if (isEmpty(grid[i-1][j-2]) || isBlackPiece(grid[i-1][j-2])) {
            grid[i-1][j-2].classList.add("moves");
        }
    }
    
    // Check down and left
    if (i + 2 < HEIGHT && j - 1 >= 0) {
        if (isEmpty(grid[i+2][j-1]) || isBlackPiece(grid[i+2][j-1])) {
            grid[i+2][j-1].classList.add("moves");
        }
    }
    
    // Check down and right
    if (i + 2 < HEIGHT && j + 1 < WIDTH) {
        if  (isEmpty(grid[i+2][j+1]) || isBlackPiece(grid[i+2][j+1])) {
            grid[i+2][j+1].classList.add("moves");
        }
    }
    
    // Check left and down
    if (i + 1 < HEIGHT && j + 2 < WIDTH) {
        if (isEmpty(grid[i+1][j+2]) || isBlackPiece(grid[i+1][j+2])) {
            grid[i+1][j+2].classList.add("moves");
        }
    }
    
    // Check right and down 
    if (i + 1 < HEIGHT && j - 2 >= 0) {
        if (isEmpty(grid[i+1][j-2]) || isBlackPiece(grid[i+1][j-2])) {
            grid[i+1][j-2].classList.add("moves");
        }
    }
}

function blackPawnMoves(i, j) {
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
    if (i + 1 < HEIGHT && j - 1 >= 0 && isWhitePiece(grid[i+1][j-1])) {
        grid[i+1][j-1].classList.add("moves");
    }
    // check right
    if (i + 1 < HEIGHT && j + 1 < WIDTH && isWhitePiece(grid[i+1][j+1])) {
        grid[i+1][j+1].classList.add("moves");
    }
    
}

function whitePawnMoves(i,j) {
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
    if (i - 1 >= 0 && j - 1 >= 0 && isBlackPiece(grid[i-1][j-1])) {
        grid[i-1][j-1].classList.add("moves");
    }
    // check right
    if (i - 1 >= 0 && j + 1 <= WIDTH && isBlackPiece(grid[i-1][j+1])) {
        grid[i-1][j+1].classList.add("moves");
    }
}

function whiteBishopMoves(i,j) {

    // Upper Left diagonal
    let iCurr = i - 1;
    let jCurr = j - 1;
    while (iCurr >= 0 && jCurr >= 0 && !isWhitePiece(grid[iCurr][jCurr])) {
        grid[iCurr][jCurr].classList.add("moves");
        if (isBlackPiece(grid[iCurr][jCurr])) break;

        iCurr--;
        jCurr--;

    }
    
    // Upper right diagonal
    iCurr = i - 1;
    jCurr = j + 1;
    while (iCurr >= 0 && jCurr < WIDTH && !isWhitePiece(grid[iCurr][jCurr])) {
        grid[iCurr][jCurr].classList.add("moves");
        if (isBlackPiece(grid[iCurr][jCurr])) break;

        iCurr--;
        jCurr++;
    }

    // Lower left diagonal
    iCurr = i + 1;
    jCurr = j - 1;
    while (iCurr < HEIGHT && jCurr >= 0 && !isWhitePiece(grid[iCurr][jCurr])) {
        grid[iCurr][jCurr].classList.add("moves");
        if (isBlackPiece(grid[iCurr][jCurr])) break;

        iCurr++;
        jCurr--;
    }

    // Lower right diagonal
    iCurr = i + 1;
    jCurr = j + 1;
    while (iCurr < HEIGHT && jCurr < WIDTH && !isWhitePiece(grid[iCurr][jCurr])) {
        grid[iCurr][jCurr].classList.add("moves");
        if (isBlackPiece(grid[iCurr][jCurr])) break;

        iCurr++;
        jCurr++;
    }
}

function whiteRookMoves(i,j) {
    // Up 
    let iCurr = i - 1;
    let jCurr = j;
    while (iCurr >= 0 && !isWhitePiece(grid[iCurr][jCurr])) {
        grid[iCurr][jCurr].classList.add("moves");
        if (isBlackPiece(grid[iCurr][jCurr])) break;

        iCurr--;

    }
    
    // Down
    iCurr = i + 1;
    jCurr = j;
    while (iCurr < HEIGHT && !isWhitePiece(grid[iCurr][jCurr])) {
        grid[iCurr++][jCurr++].classList.add("moves");
        if (isBlackPiece(grid[iCurr][jCurr])) break;

        iCurr++;
    }

    // Left
    iCurr = i;
    jCurr = j - 1;
    while (jCurr >= 0 && !isWhitePiece(grid[iCurr][jCurr])) {
        grid[iCurr][jCurr--].classList.add("moves");
        if (isBlackPiece(grid[iCurr][jCurr])) break;

        jCurr--;
    }

    // Right
    iCurr = i;
    jCurr = j + 1;
    while (jCurr < WIDTH && !isWhitePiece(grid[iCurr][jCurr])) {
        grid[iCurr][jCurr++].classList.add("moves");
        if (isBlackPiece(grid[iCurr][jCurr])) break;

        jCurr++;
    }
}

function whiteKingMoves(i,j) {
    for (let row = i - 1; row < i + 2; row++) {
        for (let col = j - 1; col < j + 2; col++) {
            if (row >= 0 && row < HEIGHT && col >= 0 && col < WIDTH && !isWhitePiece(grid[row][col])) {
                grid[row][col].classList.add("moves");
                
            }
        }
    }
}

function reset() {
    for (let i = 0; i < HEIGHT; i++) {
        for (let j = 0; j < WIDTH; j++) {
            if (grid[i][j].getAttribute("class", "ready")) {
                grid[i][j].classList.remove("ready");
            }
            if (grid[i][j].getAttribute("class", "moves")) {
                grid[i][j].classList.remove("moves")
            }
        }
    }
}

function move(pieceToMove, destinationSquare) {
    let pieceClass = pieceToMove.location.classList[1];
    pieceToMove.location.classList.remove(pieceClass);
    pieceToMove.location.classList.remove("ready");
    pieceToMove.location.classList.add("empty");
    destinationSquare.classList.remove(destinationSquare.classList[1]);
    destinationSquare.classList.remove("moves");
    destinationSquare.classList.remove("empty");
    destinationSquare.classList.add(pieceClass);
    reset();
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

function isBlackPiece(square) {
    return square.classList[1].substring(1) === 'b';
}

function isWhitePiece(square) {
    return square.classList[1].substring(1) === 'w';
}



init_board()

