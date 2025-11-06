const board = document.getElementById("board");
const startBtn = document.getElementById("startBtn");
const statusEl = document.getElementById("status");
const levelEl = document.getElementById("level");
const highscoreEl = document.getElementById("highscore");

let sequence = [];
let playerStep = 0;
let playing = false;
let cells = [];
let highscore = 0;

// Sons
const soundClick = new Audio('https://freesound.org/data/previews/256/256113_3263906-lq.mp3');
const soundError = new Audio('https://freesound.org/data/previews/331/331912_3248244-lq.mp3');

function createBoard() {
    board.innerHTML = "";
    cells = [];
    for (let i = 0; i < 9; i++) {
        const cell = document.createElement("div");
        cell.classList.add("cell");
        cell.textContent = i + 1;
        cell.addEventListener("click", () => handleInput(i));
        board.appendChild(cell);
        cells.push(cell);
    }
}

function flashCell(i) {
    cells[i].classList.add("active");
    soundClick.currentTime = 0;
    soundClick.play();
    setTimeout(() => cells[i].classList.remove("active"), 500);
}

async function playSequence() {
    playing = true;
    statusEl.textContent = "Memorize a sequência...";
    for (let i = 0; i < sequence.length; i++) {
        await new Promise(r => setTimeout(r, 600));
        flashCell(sequence[i]);
    }
    playing = false;
    statusEl.textContent = "Sua vez!";
}

function nextLevel() {
    sequence.push(Math.floor(Math.random() * 9));
    playerStep = 0;
    levelEl.textContent = sequence.length;
    if(sequence.length > highscore) {
        highscore = sequence.length;
        highscoreEl.textContent = highscore;
    }
    playSequence();
}

function handleInput(i) {
    if (playing) return;
    if(i === sequence[playerStep]) {
        flashCell(i);
        playerStep++;
        if(playerStep === sequence.length) {
            statusEl.textContent = "Acertou! Próximo nível...";
            setTimeout(nextLevel, 800);
        }
    } else {
        // Erro
        cells[i].classList.add("wrong");
        soundError.currentTime = 0;
        soundError.play();
        setTimeout(() => cells[i].classList.remove("wrong"), 500);
        statusEl.textContent = "Errou! Fim de jogo.";
        sequence = [];
        playerStep = 0;
        levelEl.textContent = "0";
    }
}

startBtn.addEventListener("click", () => {
    sequence = [];
    playerStep = 0;
    levelEl.textContent = "0";
    nextLevel();
});

createBoard();
