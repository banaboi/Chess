
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
    if (!square.classList.contains("ready") && !square.classList.contains("moves")) {
        reset();
        square.classList.add("ready");
        pieceToMove.i = i;
        pieceToMove.j = j;
        pieceToMove.location = square;
        showValidMoves(square,i,j);
    } 


    if (square.classList.contains("moves")) {
        move(pieceToMove, square);
    }
}

function showValidMoves(square, i, j) {
    // Square is empty, return
    if (square.classList.contains("empty")) {
        return;
    }
    // WHITE PAWN
    if (square.classList.contains("pw")) {
        // if there isnt a piece in front of pawn and the pawn isnt at end of board, valid move
        if (i - 1 >= 0 && grid[i-1][j].classList.contains("empty")) {
            console.log("yes")
            grid[i-1][j].classList.add("moves");
        }

        // if there is a black piece diagonally from pawn, valid capture
        // check left
        if (i - 1 >= 0 && j - 1 >= 0 && grid[i-1][j-1].getAttribute("class").substring(1) === 'b') {
            grid[i-1][j-1].classList.add("moves");
        }
        // check right
        if (i - 1 >= 0 && j + 1 <= WIDTH && grid[i-1][j+1].getAttribute("class").substring(1) === 'b') {
            grid[i-1][j+1].classList.add("moves");
        }
    }

    // BLACK PAWN
    if (square.classList.contains("pb")) {
        // if there isnt a piece in front of pawn and the pawn isnt at end of board, valid move
        if (i + 1 <= HEIGHT && grid[i+1][j].classList.contains("empty")) {
            grid[i+1][j].classList.add("moves");
        }

        // if there is a white piece diagonally from pawn, valid capture
        // check left
        if (i + 1 <= HEIGHT && j - 1 >= 0 && grid[i+1][j-1].getAttribute("class").substring(1) === 'w') {
            grid[i+1][j-1].classList.add("moves");
        }
        // check right
        if (i + 1 <= HEIGHT && j + 1 <= WIDTH && grid[i+1][j+1].getAttribute("class").substring(1) === 'w') {
            grid[i+1][j+1].classList.add("moves");
        }
    }
}

function reset() {
    for (let i = 0; i < HEIGHT; i++) {
        for (let j = 0; j < WIDTH; j++) {
            if (grid[i][j].getAttribute("class", "ready")) {
                grid[i][j].classList.remove("class", "ready");
            }
            if (grid[i][j].getAttribute("class", "moves")) {
                grid[i][j].classList.remove("class", "moves")
            }
        }
    }
}

function move(pieceToMove, destinationSquare) {
    pieceToMove.location.classList.remove("pw");
    pieceToMove.location.classList.remove("ready");
    destinationSquare.classList.remove("moves");
    destinationSquare.classList.add("pw");
}

init_board()

