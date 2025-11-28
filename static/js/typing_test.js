const sentenceDisplay = document.getElementById('sentenceDisplay');
const inputArea = document.getElementById('inputArea');
const restartBtn = document.getElementById('restartBtn');
const wpmDisplay = document.getElementById('wpmDisplay');
const accuracyDisplay = document.getElementById('accuracyDisplay');
const statusDisplay = document.getElementById('statusDisplay');
const saveScoreForm = document.getElementById('saveScoreForm');
const playerNameInput = document.getElementById('playerName');
const saveBtn = document.getElementById('saveBtn');
const saveStatus = document.getElementById('saveStatus');
const leaderboardBtn = document.getElementById('leaderboardBtn');

const sentences = [
    "O rato roeu a roupa do rei de Roma.",
    "A raposa marrom rápida salta sobre o cachorro preguiçoso.",
    "O pão de queijo é uma iguaria típica de Minas Gerais.",
    "Python é uma linguagem de programação poderosa e fácil de aprender.",
    "Flask é um micro-framework web escrito em Python.",
    "Estamos fazendo um ótimo trabalho neste projeto da faculdade.",
    "JavaScript é uma linguagem essencial para o desenvolvimento web moderno.",
    "HTML e CSS são a base de toda página na internet.",
    "O banco de dados SQLite é leve e muito fácil de configurar.",
    "Mais vale um pássaro na mão do que dois voando."
];

// --- 2. Variáveis do Jogo ---
let currentSentence = "";
let startTime = null;
let errors = 0;
let typedChars = 0;
let gameInProgress = false;
let finalWPM = 0; 
let finalAccuracy = 0;

const totalRounds = 3;
let currentRound = 0;
let wpmScores = [];
let finalAverageWPM = 0; 

// --- Variáveis de Repetição ---
let phrasesForThisGame = [];

// --- Função para embaralhar a lista de frases ---
function shuffleSentences() {
    // Copia o array original e o embaralha
    phrasesForThisGame = [...sentences].sort(() => Math.random() - 0.5);
}

// --- 3. Funções do Jogo ---

function getNextSentence() {
    statusDisplay.textContent = `Gerando frase ${currentRound + 1}/${totalRounds}...`;
    inputArea.disabled = true;
    
    saveScoreForm.style.display = 'none';
    saveStatus.textContent = '';
    leaderboardBtn.style.display = 'none';
    
    // Pega a frase da lista embaralhada
    const fraseLocal = phrasesForThisGame[currentRound];

    loadNewSentence(fraseLocal);
}

function loadNewSentence(sentenceToShow) {
    currentSentence = sentenceToShow;

    sentenceDisplay.innerHTML = "";
    inputArea.value = "";
    
    currentSentence.split('').forEach(char => {
        const span = document.createElement('span');
        span.textContent = char;
        sentenceDisplay.appendChild(span);
    });

    if (sentenceDisplay.childNodes.length > 0) {
        sentenceDisplay.childNodes[0].classList.add('current-char');
    }

    resetStats();
    statusDisplay.textContent = `Pronto para a Frase ${currentRound + 1}/${totalRounds}`;
    inputArea.focus(); 
    
    saveBtn.disabled = false;
}

// Reseta estatísticas (para cada rodada)
function resetStats() {
    startTime = null;
    errors = 0;
    typedChars = 0;
    gameInProgress = false;
    wpmDisplay.textContent = "0";
    accuracyDisplay.textContent = "100";
    inputArea.disabled = false;
}

function checkTyping() {
    if (!gameInProgress) {
        startTime = new Date();
        gameInProgress = true;
        statusDisplay.textContent = "Digitando...";
    }

    const inputChars = inputArea.value.split('');
    const sentenceChars = sentenceDisplay.querySelectorAll('span');
    
    typedChars = inputChars.length;
    let currentErrors = 0;

    sentenceChars.forEach((span, index) => {
        span.classList.remove('correct', 'incorrect', 'current-char');
        if (index < inputChars.length) {
            if (span.textContent === inputChars[index]) {
                span.classList.add('correct');
            } else {
                span.classList.add('incorrect');
                currentErrors++;
            }
        } else if (index === inputChars.length) {
            span.classList.add('current-char');
        }
    });

    errors = currentErrors;
    updateHUD();

    if (typedChars === currentSentence.length) {
        finishRound(); 
    }
}

function updateHUD() {
    if (!gameInProgress || typedChars === 0) return;

    const accuracy = ((typedChars - errors) / typedChars) * 100;
    accuracyDisplay.textContent = accuracy.toFixed(0);

    const currentTime = new Date();
    const elapsedTimeInMinutes = (currentTime - startTime) / 1000 / 60;
    const wpm = (typedChars / 5) / elapsedTimeInMinutes;
    wpmDisplay.textContent = wpm.toFixed(0);
}

function finishRound() {
    gameInProgress = false;
    inputArea.disabled = true; 
    
    updateHUD();

    finalWPM = parseInt(wpmDisplay.textContent) || 0;
    wpmScores.push(finalWPM);
    currentRound++;

    if (currentRound < totalRounds) {
        statusDisplay.textContent = `Frase ${currentRound}/${totalRounds} completa. Próxima...`;
        setTimeout(getNextSentence, 1500); 
    } else {
        const sum = wpmScores.reduce((a, b) => a + b, 0);
        finalAverageWPM = (sum / totalRounds).toFixed(0);

        statusDisplay.textContent = `Média Final: ${finalAverageWPM} WPM`;
        saveScoreForm.style.display = 'block';
        playerNameInput.focus();

        // Reabilita o botão de jogar e muda o texto
        restartBtn.style.display = 'inline-block';
        restartBtn.textContent = "Jogar Novamente";

        currentRound = 0;
        wpmScores = [];
    }
}


// --- 5. Adicionar Event Listeners ---
inputArea.addEventListener('input', checkTyping);

// Event listener do botão de Iniciar/Reiniciar
restartBtn.addEventListener('click', () => {
    restartBtn.style.display = 'none';
    currentRound = 0; 
    wpmScores = [];
    shuffleSentences(); 
    getNextSentence();
});

// Listener do botão SALVAR
saveBtn.addEventListener('click', async () => {
    const playerName = playerNameInput.value.trim();
    const gameName = "typing_test";
    const scoreToSave = finalAverageWPM;

    if (playerName === "") {
        saveStatus.textContent = "Por favor, digite seu nome.";
        return;
    }

    saveBtn.disabled = true;
    saveStatus.textContent = "Salvando...";

    try {
        const response = await fetch('/api/salvar-pontuacao', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
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

// --- 6. Iniciar o Jogo ---
currentRound = 0; 
wpmScores = [];
shuffleSentences(); 
getNextSentence();
restartBtn.style.display = 'none';
restartBtn.textContent = "Jogar Novamente";