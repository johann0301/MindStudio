// --- 1. Selecionar Elementos do HTML ---
const numberDisplay = document.getElementById('numberDisplay');
const inputArea = document.getElementById('inputArea');
const numberInput = document.getElementById('numberInput');
const startBtn = document.getElementById('startBtn');
const submitBtn = document.getElementById('submitBtn');
const levelDisplay = document.getElementById('levelDisplay');
const statusDisplay = document.getElementById('statusDisplay');
const leaderboardBtn = document.getElementById('leaderboardBtn');

// --- Seletores do Formulário de Salvar ---
const saveScoreForm = document.getElementById('saveScoreForm');
const playerNameInput = document.getElementById('playerName');
const saveBtn = document.getElementById('saveBtn');
const saveStatus = document.getElementById('saveStatus');

// --- 2. Variáveis do Jogo ---
let level = 1;
let currentNumber = "";
let gameState = "start"; // Estados: start, showing, input, gameover
let showTime = 1500; // 1.5 segundos para mostrar o primeiro número
let finalLevel = 0; // Guarda a pontuação final

// --- 3. Funções do Jogo ---

// Gera um número aleatório com o tamanho do nível
function generateNumber(length) {
    let result = '';
    const characters = '0123456789';
    for (let i = 0; i < length; i++) {
        result += characters.charAt(Math.floor(Math.random() * characters.length));
    }
    return result;
}

// Atualiza a UI com base no estado do jogo
function setGameState(state) {
    gameState = state;
    if (state === "start" || state === "gameover") {
        startBtn.style.display = "inline-block"; // Mostra botão de iniciar
        submitBtn.style.display = "none"; // Esconde botão de enviar
        inputArea.style.display = "none"; // Esconde área de input
        numberDisplay.style.color = "#e2e8f0"; // Garante cor normal
        
        // Esconde o form de salvar se estiver no estado inicial
        if (state === "start") {
             saveScoreForm.style.display = "none";
        }
        
    } else if (state === "showing") {
        startBtn.style.display = "none";
        submitBtn.style.display = "none";
        inputArea.style.display = "none";
        numberDisplay.style.color = "#e2e8f0"; // Cor normal
        numberDisplay.classList.remove("fading"); // Remove fade
    } else if (state === "input") {
        startBtn.style.display = "none";
        submitBtn.style.display = "inline-block"; // Mostra botão de enviar
        inputArea.style.display = "block"; // Mostra área de input
        numberInput.value = ""; // Limpa input
        numberInput.focus(); // Foca no input
    }
}

// Inicia o próximo nível
function nextLevel() {
    statusDisplay.textContent = ""; // Limpa status
    levelDisplay.textContent = level;
    currentNumber = generateNumber(level);
    
    setGameState("showing");
    numberDisplay.textContent = currentNumber;

    // Tempo para memorizar (aumenta 500ms a cada nível)
    const timeToMemorize = showTime + (level - 1) * 500;

    // 1. Animação de "fade out" (começa um pouco antes do fim)
    setTimeout(() => {
        numberDisplay.classList.add("fading");
    }, timeToMemorize - 500);

    // 2. Transição para o estado de input
    setTimeout(() => {
        setGameState("input");
        numberDisplay.textContent = "Qual era o número?";
        numberDisplay.classList.remove("fading"); // Reseta p/ próxima
    }, timeToMemorize);
}

// Inicia o jogo
function startGame() {
    level = 1;
    saveScoreForm.style.display = "none"; // Esconde o form ao reiniciar
    saveStatus.textContent = ""; // Limpa o status de salvamento
    saveBtn.disabled = false;
    leaderboardBtn.style.display = 'none';
    nextLevel();
}

// Verifica a resposta do usuário
function checkAnswer() {
    if (gameState !== "input") return;

    const userAnswer = numberInput.value;
    if (userAnswer === currentNumber) {
        // Acertou!
        level++;
        statusDisplay.textContent = "Correto! Próximo nível...";
        statusDisplay.style.color = "#00ffca";
        
        // Espera um pouco antes de ir para o próximo nível
        setTimeout(nextLevel, 1000);
    } else {
        // Errou!
        gameOver();
    }
}

// Fim de jogo
function gameOver() {
    finalLevel = level;
    
    setGameState("gameover"); 
    statusDisplay.textContent = "Errado! Fim de jogo.";
    statusDisplay.style.color = "#ff0033";
    
    // Ajusta o display para o texto de "Game Over"
    // Agora o 'finalLevel' terá o valor correto (ex: 5)
    numberDisplay.textContent = `Você alcançou o Nível ${finalLevel}!`; 
    numberDisplay.style.fontSize = "2rem"; 
    numberDisplay.style.lineHeight = "1.2"; 

    // Reinicializa o botão de início
    startBtn.textContent = "Tentar Novamente"; 
    
    saveScoreForm.style.display = "block"; // Mostra o formulário
    playerNameInput.focus(); // Foca no campo de nome
}


// --- 4. Adicionar Event Listeners ---
startBtn.addEventListener('click', startGame);
submitBtn.addEventListener('click', checkAnswer);

// Permite que o usuário pressione "Enter" para enviar
numberInput.addEventListener('keypress', function(e) {
    if (e.key === 'Enter' && gameState === "input") {
        checkAnswer();
    }
});

// (NOVO) --- Listener do botão SALVAR --
saveBtn.addEventListener('click', async () => {
    const playerName = playerNameInput.value.trim();
    
    const gameName = "number_memory";
    const scoreToSave = finalLevel;

    // Validação
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


// --- 5. Iniciar o Jogo ---
// Define o estado inicial da UI
setGameState("start");
numberDisplay.textContent = "Memorize o número";
