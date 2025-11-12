document.addEventListener('DOMContentLoaded', () => {

    // --- 1. CONFIGURATION & STATE ---

    // You can change the grid size here
    const GRID_SIZE = 8; // This will create a 8x8 grid of boxes

    // Player settings
    const PLAYER_1_INITIAL = "P1";
    const PLAYER_2_INITIAL = "P2";

    // Game state
    let currentPlayer = 1;
    let scores = { 1: 0, 2: 0 };
    let totalBoxes = GRID_SIZE * GRID_SIZE;
    let gameOver = false;

    // DOM Elements
    const board = document.getElementById('game-board');
    const turnDisplay = document.getElementById('turn-display');
    const scoreDisplay = document.getElementById('score-display');

    // We need to get the CSS variable values
    const rootStyles = getComputedStyle(document.documentElement);
    const boxSize = rootStyles.getPropertyValue('--box-size');
    const dotSize = rootStyles.getPropertyValue('--dot-size');

    // --- 2. BOARD CREATION ---

    function createBoard() {
        // Calculate the full grid dimensions (dots + lines)
        const totalDim = (GRID_SIZE * 2) + 1;

        let colTemplate = '';
        let rowTemplate = '';

        for (let i = 0; i < totalDim; i++) {
            const size = (i % 2 === 0) ? dotSize : boxSize;
            colTemplate += size + ' ';
            rowTemplate += size + ' ';
        }
        board.style.gridTemplateColumns = colTemplate;
        board.style.gridTemplateRows = rowTemplate;


        // Create grid elements
        for (let i = 0; i < totalDim; i++) {
            for (let j = 0; j < totalDim; j++) {
                const el = document.createElement('div');
                el.classList.add('grid-element');

                // Add data attributes for coordinates
                el.dataset.row = i;
                el.dataset.col = j;

                if (i % 2 === 0) { // Even rows (dots and horizontal lines)
                    if (j % 2 === 0) {
                        el.classList.add('dot');
                    } else {
                        el.classList.add('line', 'line-h');
                    }
                } else { // Odd rows (vertical lines and boxes)
                    if (j % 2 === 0) {
                        el.classList.add('line', 'line-v');
                    } else {
                        el.classList.add('box');
                    }
                }
                board.appendChild(el);
            }
        }
    }

    // --- 3. GAME LOGIC ---

    function handleLineClick(e) {
        if (gameOver) return;

        const el = e.target;

        // Check if it's a line and not already filled
        if (!el.classList.contains('line') || el.classList.contains('filled')) {
            return;
        }

        // Fill the line
        fillLine(el);

        // Check if this line completed any boxes
        const boxCompleted = checkBox(el);

        // If no box was completed, switch player
        if (!boxCompleted) {
            switchPlayer();
        }

        updateGameInfo();
        checkGameOver();
    }

    function fillLine(line) {
        line.classList.add('filled', `player-${currentPlayer}`);
    }

    function switchPlayer() {
        currentPlayer = (currentPlayer === 1) ? 2 : 1;
    }

    function updateGameInfo() {
        // Update turn display
        turnDisplay.innerText = `Player ${currentPlayer}'s Turn`;
        turnDisplay.className = `player-${currentPlayer}`;

        // Update score display
        scoreDisplay.innerText = `${PLAYER_1_INITIAL}: ${scores[1]} - ${PLAYER_2_INITIAL}: ${scores[2]}`;
    }

    /**
     * Checks if the clicked line completes one or two boxes.
     * @param {HTMLElement} line - The line element that was clicked.
     * @returns {boolean} - True if at least one box was completed, false otherwise.
     */
    function checkBox(line) {
        const r = parseInt(line.dataset.row);
        const c = parseInt(line.dataset.col);
        let boxFound = false;

        if (line.classList.contains('line-h')) {
            // Horizontal line: check box above and box below
            if (checkSingleBox(r - 1, c)) boxFound = true;
            if (checkSingleBox(r + 1, c)) boxFound = true;
        } else {
            // Vertical line: check box left and box right
            if (checkSingleBox(r, c - 1)) boxFound = true;
            if (checkSingleBox(r, c + 1)) boxFound = true;
        }

        return boxFound;
    }

    /**
     * Checks a single box to see if all four of its walls are filled.
     * @param {number} boxRow - The row coordinate of the box to check.
     * @param {number} boxCol - The column coordinate of the box to check.
     * @returns {boolean} - True if the box was just completed, false otherwise.
     */
    function checkSingleBox(boxRow, boxCol) {
        // Find the box element
        const box = document.querySelector(`.box[data-row="${boxRow}"][data-col="${boxCol}"]`);

        // If box is out of bounds or already filled, it can't be *just* completed
        if (!box || box.classList.contains('filled')) {
            return false;
        }

        // Find its 4 surrounding lines
        const topLine = document.querySelector(`.line[data-row="${boxRow - 1}"][data-col="${boxCol}"]`);
        const bottomLine = document.querySelector(`.line[data-row="${boxRow + 1}"][data-col="${boxCol}"]`);
        const leftLine = document.querySelector(`.line[data-row="${boxRow}"][data-col="${boxCol - 1}"]`);
        const rightLine = document.querySelector(`.line[data-row="${boxRow}"][data-col="${boxCol + 1}"]`);

        // Check if all 4 lines are filled
        if (topLine.classList.contains('filled') &&
            bottomLine.classList.contains('filled') &&
            leftLine.classList.contains('filled') &&
            rightLine.classList.contains('filled')) {
            // All walls are filled! Claim the box.
            fillBox(box);
            return true;
        }

        return false;
    }

    /**
     * Fills a box for the current player.
     * @param {HTMLElement} box - The box element to fill.
     */
    function fillBox(box) {
        box.classList.add('filled', `player-${currentPlayer}`);

        // This is the auto-initial feature you requested
        box.innerText = (currentPlayer === 1) ? PLAYER_1_INITIAL : PLAYER_2_INITIAL;

        scores[currentPlayer]++;
    }

    function checkGameOver() {
        if (scores[1] + scores[2] === totalBoxes) {
            gameOver = true;
            let winnerMsg = "";
            if (scores[1] > scores[2]) {
                winnerMsg = `${PLAYER_1_INITIAL} (Player 1) Wins!`;
            } else if (scores[2] > scores[1]) {
                winnerMsg = `${PLAYER_2_INITIAL} (Player 2) Wins!`;
            } else {
                winnerMsg = "It's a Tie!";
            }
            turnDisplay.innerText = `Game Over! ${winnerMsg}`;
            turnDisplay.className = 'game-over';
        }
    }


    // --- 4. INITIALIZATION ---

    createBoard();
    updateGameInfo();
    board.addEventListener('click', handleLineClick);

});