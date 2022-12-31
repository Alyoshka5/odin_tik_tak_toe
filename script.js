// Symbols: ✕ ⭕

const gameBoard = (() => {
    const table = document.querySelector('.board');

    let board = [[' ', ' ', ' '], [' ', ' ', ' '], [' ', ' ', ' ']];
    let winIndex;

    const displayBoard = () => {
        table.innerHTML = '';
        for (let i = 0; i < 3; i++) {
            let row = board[i];
            table.innerHTML += `
                <tr>
                    <td data-row="${i}" data-col="0">${row[0]}</td>
                    <td data-row="${i}" data-col="1">${row[1]}</td>
                    <td data-row="${i}" data-col="2">${row[2]}</td>
                </tr>
            `;
        }
    }

    const getTile = (row, col) => {
        return board[row][col];
    }

    const updateBoard = (symbol, row, col) => {
        board[row][col] = symbol;
    }

    const checkWin = () => {
        return victoryRow(board[0], [[0, 0], [0, 1], [0, 2]]) ||
        victoryRow(board[1], [[1, 0], [1, 1], [1, 2]]) ||
        victoryRow(board[2], [[2, 0], [2, 1], [2, 2]]) || 
        victoryRow([board[0][0], board[1][0], board[2][0]], [[0, 0], [1, 0], [2, 0]]) || 
        victoryRow([board[0][1], board[1][1], board[2][1]], [[0, 1], [1, 1], [2, 1]]) || 
        victoryRow([board[0][2], board[1][2], board[2][2]], [[0, 2], [1, 2], [2, 2]]) || 
        victoryRow([board[0][0], board[1][1], board[2][2]], [[0, 0], [1, 1], [2, 2]]) || 
        victoryRow([board[0][2], board[1][1], board[2][0]], [[0, 2], [1, 1], [2, 0]])
    }

    function victoryRow(row, tiles) {
        if (row[0] != ' ' && row[0] === row[1] && row[0] === row[2]) {
            winIndex = tiles;
            console.log(winIndex);
            return true;
        }
        return false;
    }

    const checkTie = () => {
        return (board.flat().reduce((tot, tile) => tot += tile == ' ' ? 0 : 1, 0)) == 9;
    }

    const getWinIndex = () => {
        return winIndex;
    }

    return { displayBoard, getTile, updateBoard, board, checkWin, checkTie, getWinIndex };
})();


const playerFactory = (marker) => {

    const placeMarker = (tile) => {
        let row = tile.getAttribute('data-row');
        let col = tile.getAttribute('data-col');
        let boardTile = gameBoard.getTile(row, col);
        if (boardTile == ' ') {
            gameBoard.updateBoard(marker, row, col);
            return true;
        }
        return false;
    };

    return { placeMarker };
}

const actionExecuter = (() => {

    const displayWinRow = (tiles) => {
        let winIndex = gameBoard.getWinIndex();
        for (let i = 0; i < 3; i++) {
            let tileIndex = (winIndex[i][0] * 3) + winIndex[i][1];
            let tile = tiles[tileIndex];
            tile.classList.add('winner_row')
        }
    }

    return { displayWinRow }
})();

const gameExecutor = (() => {
    gameBoard.displayBoard();

    let tiles = document.querySelectorAll('.board td');
    let p1 = playerFactory('✕');
    let p2 = playerFactory('⭕');
    let turnP1 = true;
    
    tiles.forEach(tile => tile.addEventListener('click', makeMove));

    function makeMove() {
        if (turnP1) {
            if (!p1.placeMarker(this)) return;
        } else {
            if (!p2.placeMarker(this)) return;
        }
        gameBoard.displayBoard();
        tiles = document.querySelectorAll('.board td');
        tiles.forEach(tile => tile.addEventListener('click', makeMove));
        checkGameOver();
        turnP1 = !turnP1;
    }

    function checkGameOver() {
        if (gameBoard.checkWin()) {
            console.log("winner");
            tiles.forEach(tile => tile.removeEventListener('click', makeMove));
            Animator.displayWinRow(tiles);
        }
        else if (gameBoard.checkTie()) {
            console.log("tie");
        }
    }

    return {};
})();
