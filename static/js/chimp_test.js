// --- 1. Selecionar Elementos do HTML ---
const board = document.getElementById("board");
const startBtn = document.getElementById("startBtn");
const statusEl = document.getElementById("status");
const levelEl = document.getElementById("level");
const highscoreEl = document.getElementById("highscore");
const leaderboardBtn = document.getElementById('leaderboardBtn');

// (NOVO) --- Seletores do Formulário de Salvar ---
const saveScoreForm = document.getElementById('saveScoreForm');
const playerNameInput = document.getElementById('playerName');
const saveBtn = document.getElementById('saveBtn');
const saveStatus = document.getElementById('saveStatus');

// --- 2. Variáveis do Jogo ---
let sequence = [];
let playerStep = 0;
let playing = false;
let cells = [];
let highscore = 0;
let finalLevel = 0; // (NOVO) Guarda a pontuação final

// Sons
const soundClick = new Audio('https://freesound.org/data/previews/256/256113_3263906-lq.mp3');
const soundError = new Audio('https://freesound.org/data/previews/331/331912_3248244-lq.mp3');

// --- 3. Funções do Jogo ---

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

// (NOVO) --- Função de Fim de Jogo ---
function gameOver(cellIndex) {
    // 1. Salva a pontuação
    finalLevel = highscore; 

    // 2. Mostra o erro
    cells[cellIndex].classList.add("wrong");
    soundError.currentTime = 0;
    soundError.play();
    setTimeout(() => cells[cellIndex].classList.remove("wrong"), 500);
    
    statusEl.textContent = `Errou! Fim de jogo. Nível: ${finalLevel}`;

    // 3. Reseta o jogo
    sequence = [];
    playerStep = 0;
    levelEl.textContent = "0";

    // 4. Mostra o formulário de salvar
    saveScoreForm.style.display = "block";
    playerNameInput.focus();
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
        gameOver(i);
    }
}

// --- 4. Event Listeners ---

startBtn.addEventListener("click", () => {
    // Esconde o formulário ao iniciar/reiniciar
    saveScoreForm.style.display = "none";
    saveStatus.textContent = "";
    saveBtn.disabled = false;
    leaderboardBtn.style.display = 'none';

    // Lógica original de início
    sequence = [];
    playerStep = 0;
    levelEl.textContent = "0";
    nextLevel();
});

// --- Listener do botão SALVAR ---
saveBtn.addEventListener('click', async () => {
    const playerName = playerNameInput.value.trim();
    
    const gameName = "chimp_test";
    const scoreToSave = finalLevel; // Salva o nível alcançado

    if (playerName === "") {
        saveStatus.textContent = "Por favor, digite seu nome.";
        return;
    }

    saveBtn.disabled = true;
    saveStatus.textContent = "Salvando...";

    try {
        const response = await fetch('/api/salvar-pontuacao', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                nome: playerName,
                jogo: gameName,
                pontuacao: scoreToSave
            }),
        });

        const result = await response.json();

        if (result.sucesso) {
            saveStatus.textContent = "Pontuação salva!";
            saveBtn.disabled = false;
            leaderboardBtn.href = `/leaderboard?game=${gameName}#jogos`;
            leaderboardBtn.style.display = 'inline-block';
        } else {
            saveStatus.textContent = `Erro ao salvar: ${result.erro}`;
            saveBtn.disabled = false;
        }

    } catch (error) {
        console.error("Erro de rede ao salvar pontuação:", error);
        saveStatus.textContent = "Erro de conexão. Servidor está offline?";
        saveBtn.disabled = false;
    }
});


// --- 5. Iniciar o Jogo ---
createBoard();
