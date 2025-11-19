// --- 1. Selecionar Elementos do HTML ---
const reactionBox = document.getElementById('reactionBox');
const reactionText = document.getElementById('reactionText');
const leaderboardBtn = document.getElementById('leaderboardBtn');

// (NOVO) --- Seletores do Formulário de Salvar ---
const saveScoreForm = document.getElementById('saveScoreForm');
const playerNameInput = document.getElementById('playerName');
const saveBtn = document.getElementById('saveBtn');
const saveStatus = document.getElementById('saveStatus');

// --- 2. Variáveis do Jogo ---
let gameState = "start"; // Estados: start, waiting, react, result
let timerId = null;
let startTime = 0;
let finalReactionTime = 0; // Guarda a pontuação final (a média)
let screenIsLocked = false;

// (NOVO) --- Variáveis para Média ---
const totalAttempts = 5; // Vamos fazer a média de 5 tentativas
let currentAttempt = 0;
let reactionTimes = []; // Array para guardar os tempos

// --- 3. Funções do Jogo ---

function setGameState(state) {
    gameState = state;
    reactionBox.className = '';

    // Esconde o formulário em todos os estados, exceto o resultado final
    saveScoreForm.style.display = "none";
    leaderboardBtn.style.display = 'none';
    // (Vamos limpar o saveStatus apenas quando o jogo reiniciar)

    switch (state) {
        case "start":
            reactionBox.classList.add('state-start'); // Azul
            reactionText.innerHTML = "Clique para começar";
            currentAttempt = 0;
            reactionTimes = [];
            saveStatus.textContent = ""; // Limpa status ao iniciar
            break;
        case "waiting":
            reactionBox.classList.add('state-wait'); // Vermelho
            reactionText.innerHTML = `Preparar... (Tentativa ${currentAttempt + 1}/${totalAttempts})`;
            const randomDelay = Math.random() * 3000 + 1000; // 1-4 segundos
            timerId = setTimeout(showGreen, randomDelay);
            break;
        case "react":
            reactionBox.classList.add('state-react'); // Verde
            reactionText.innerHTML = "CLIQUE!";
            startTime = Date.now();
            break;
        case "result":
            reactionBox.classList.add('state-start'); // Azul
            // O texto é definido no handleClick
            break;
        case "error":
            reactionBox.classList.add('state-wait'); // Vermelho
            reactionText.innerHTML = "Cedo demais!<br><small>Clique para tentar de novo</small>";
            break;
    }
}

function showGreen() {
    setGameState("react");
}

function handleClick() {
    
    // 1. Bloqueio: Se a tela estiver travada, não faça nada.
    if (screenIsLocked === true) {
        return;
    }
    
    // 2. Se o jogo está parado (start, result, error)...
    if (gameState === "start" || gameState === "result" || gameState === "error") {
        
        // Se o clique foi para "Jogar de Novo", ele esconde
        // o formulário que estava visível.
        if (saveScoreForm.style.display === 'block') {
            saveScoreForm.style.display = 'none';
            leaderboardBtn.style.display = 'none';
        }

        // Continua para iniciar o jogo (seja 'start' ou 'waiting')
        if (currentAttempt >= totalAttempts) {
            setGameState("start"); 
        } else {
            setGameState("waiting");
        }
    } 
    
    // 3. Se o jogo estava esperando (clique adiantado)
    else if (gameState === "waiting") {
        clearTimeout(timerId);
        setGameState("error");
    } 
    
    // 4. Se o jogo estava verde (clique certo)
    else if (gameState === "react") {
        const reactionTime = Date.now() - startTime;
        reactionTimes.push(reactionTime);
        currentAttempt++;
        
        setGameState("result"); 

        if (currentAttempt < totalAttempts) {
            reactionText.innerHTML = `${reactionTime} ms<br><small>Clique para a tentativa ${currentAttempt + 1}/${totalAttempts}</small>`;
        } else {
            // Terminou as 5 tentativas!
            const sum = reactionTimes.reduce((a, b) => a + b, 0);
            const average = sum / totalAttempts;
            finalReactionTime = average.toFixed(0); 

            reactionText.innerHTML = `Média Final: ${finalReactionTime} ms<br><small>Clique para tentar de novo</small>`;
            
            saveScoreForm.style.display = "block";
            playerNameInput.focus();
            screenIsLocked = true;

            currentAttempt = 0;
            reactionTimes = [];
        }
    }
}

// --- 4. Adicionar Event Listeners ---
reactionBox.addEventListener('mousedown', handleClick);

// (NOVO) --- Listener do botão SALVAR (não muda, mas está aqui) ---
saveBtn.addEventListener('click', async () => {
    const playerName = playerNameInput.value.trim();
    const gameName = "reaction_time";
    const scoreToSave = finalReactionTime; 

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
            screenIsLocked = false; // <-- DESTRAVA A TELA AQUI
        } else {
            saveStatus.textContent = `Erro ao salvar: ${result.erro}`;
            saveBtn.disabled = false;
            // Se falhar, a tela continua travada para proteger o placar
        }

    } catch (error) {
        console.error("Erro de rede ao salvar pontuação:", error);
        saveStatus.textContent = "Erro de conexão. Servidor está offline?";
        saveBtn.disabled = false;
        // Se falhar, a tela continua travada
    }
});

// --- 5. Iniciar o Jogo ---
setGameState("start");
