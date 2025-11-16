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
    if (gameState === "start" || gameState === "result" || gameState === "error") {
        // Primeiro, checa se o formulário está visível. Se sim, para tudo.
        if (saveScoreForm.style.display === 'block') {
            return;
        }

        // (LÓGICA DA MÉDIA)
        // Se o formulário não está visível, checa se as 5 tentativas acabaram.
        if (currentAttempt >= totalAttempts) {
            // Se já completou as 5, recomeça do zero
            setGameState("start"); 
        } else {
            // Se não, vai para a próxima tentativa
            setGameState("waiting");
        }
    } 
    else if (gameState === "waiting") {
        // Clicou cedo demais!
        clearTimeout(timerId);
        setGameState("error");
    } 
    else if (gameState === "react") {
        // Clicou no verde! (Sucesso)
        const reactionTime = Date.now() - startTime;
        reactionTimes.push(reactionTime); // Guarda o tempo
        currentAttempt++;
        
        setGameState("result"); // Vai para o estado de resultado

        if (currentAttempt < totalAttempts) {
            // Ainda não terminou as 5 tentativas
            reactionText.innerHTML = `${reactionTime} ms<br><small>Clique para a tentativa ${currentAttempt + 1}/${totalAttempts}</small>`;
        } else {
            // Terminou as 5 tentativas!
            // 1. Calcula a média
            const sum = reactionTimes.reduce((a, b) => a + b, 0);
            const average = sum / totalAttempts;
            finalReactionTime = average.toFixed(0); // Arredonda e salva

            // 2. Mostra o resultado final
            reactionText.innerHTML = `Média Final: ${finalReactionTime} ms<br><small>Clique para tentar de novo</small>`;
            
            // 3. Mostra o formulário de salvar
            saveScoreForm.style.display = "block";
            playerNameInput.focus();

            // 4. Reseta para o próximo jogo
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
    
    // Agora 'scoreToSave' será a média!
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
            saveBtn.disabled = false; // (NOVO) Reabilita o botão
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
setGameState("start");
