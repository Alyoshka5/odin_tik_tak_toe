const gameBoard = (() => {
    const table = document.querySelector('#board');

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

    const clearBoard = () => { board = [[' ', ' ', ' '], [' ', ' ', ' '], [' ', ' ', ' ']] }

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

    return { displayBoard, clearBoard, getTile, updateBoard, checkWin, checkTie, getWinIndex };
})();



const displayExecutor = (() => {
    
    const winnerDisplay = document.querySelector('#winner_display');

    const clearWinnerDisplay = () => { winnerDisplay.textContent = '' }

    const displayGameOver = (won, tiles, winner) => {
        if (won) {
            displayWinRow(tiles);
            announceWinner(winner);
        } else {
            announceTie();
        }
    }

    function displayWinRow(tiles) {
        let winIndex = gameBoard.getWinIndex();
        for (let i = 0; i < 3; i++) {
            let tileIndex = (winIndex[i][0] * 3) + winIndex[i][1];
            let tile = tiles[tileIndex];
            tile.classList.add('winner_row')
        }
    }

    function announceWinner(winner) {
        winnerDisplay.textContent = winner.getName() + " won!";
    }
    
    function announceTie() {
        winnerDisplay.textContent = "It's a tie!";
    }

    return { displayGameOver, clearWinnerDisplay }
})();

const playerFactory = (isPlayer1) => {

    const errorDisplay = document.querySelector('.input_errors');
    let marker;
    let name;

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

    const initiatePlayer = () => {
        const inputedName = document.querySelector(`#p${isPlayer1 ? 1 : 2}_name`).value;
        const inputedMarker = document.querySelector(`#p${isPlayer1 ? 1 : 2}_marker`).value;
        if (isPlayer1 && !validateInputs(inputedName, inputedMarker)) return false;
        marker = inputedMarker; 
        name = inputedName;
        return true;
    }
   
    function validateInputs(name, marker) {
        const name2 = document.querySelector(`#p2_name`).value;
        const marker2 = document.querySelector(`#p2_marker`).value;
        if (!name.replace(/\s/g, "").length || !name2.replace(/\s/g, "").length) {
            errorDisplay.textContent = "Name must contain at least one none whitespace character";
            return false;
        } else if (name == name2) {
            errorDisplay.textContent = "Both players cannot have the same name";
            return false;
        } else if (!marker.replace(/\s/g, "").length || !marker.replace(/\s/g, "").length) {
            errorDisplay.textContent = "Marker cannot be whitespace";
            return false;
        } else if (marker == marker2) {
            errorDisplay.textContent = "Both players cannot have the same marker";
            return false;
        } else {
            errorDisplay.textContent = "";
            return true;
        }
    }

    const getName = () => { return name }

    return { placeMarker, initiatePlayer, getName };
}

const gameExecutor = (() => {
    gameBoard.displayBoard();

    const startForm = document.querySelector('.player_form');
    const startButton = document.querySelector('#start_button');
    let tiles;
    let p1 = playerFactory(true);
    let p2 = playerFactory(false);
    let turnP1;
    
    startForm.addEventListener('submit', startGame);
    
    function startGame(e) {
        e.preventDefault();
        if (!p1.initiatePlayer()) return;
        p2.initiatePlayer();
        gameBoard.clearBoard();
        displayExecutor.clearWinnerDisplay();
        turnP1 = true;
        startButton.value = "Restart"
        gameBoard.displayBoard();
        tiles = document.querySelectorAll('#board td');
        tiles.forEach(tile => tile.addEventListener('click', makeMove));
    }

    function makeMove() {
        if (turnP1) {
            if (!p1.placeMarker(this)) return;
        } else {
            if (!p2.placeMarker(this)) return;
        }
        gameBoard.displayBoard();
        tiles = document.querySelectorAll('#board td');
        tiles.forEach(tile => tile.addEventListener('click', makeMove));
        checkGameOver();
        turnP1 = !turnP1;
    }

    function checkGameOver() {
        if (gameBoard.checkWin()) {
            tiles.forEach(tile => tile.removeEventListener('click', makeMove));
            let winner = turnP1 ? p1 : p2;
            displayExecutor.displayGameOver(true, tiles, winner);
        }
        else if (gameBoard.checkTie()) {
            displayExecutor.displayGameOver(false);
        }
    }
})();
