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

// Frases de BACKUP caso a API falhe
const sentences = [
    "O rato roeu a roupa do rei de Roma.",
    "A raposa marrom rápida salta sobre o cachorro preguiçoso.",
    "O pão de queijo é uma iguaria típica de Minas Gerais.",
    "Python é uma linguagem de programação poderosa e fácil de aprender.",
    "Flask é um micro-framework web escrito em Python.",
    "Estamos fazendo um ótimo trabalho neste projeto da faculdade."
];

// --- 2. Variáveis do Jogo ---
let currentSentence = "";
let startTime = null;
let errors = 0;
let typedChars = 0;
let gameInProgress = false;
let finalWPM = 0;
let finalAccuracy = 0;

// --- 3. Funções do Jogo ---

/**
 * Esta função PEGA uma nova frase (da API ou do backup)
 * Esta é a função que (re)inicia o jogo.
 */
async function getNextSentence() {
    // Mostra o loading
    statusDisplay.textContent = "Gerando nova frase...";
    inputArea.disabled = true;
    restartBtn.disabled = true;
    
    // CORRETO: Esconde o formulário ao (re)iniciar
    saveScoreForm.style.display = 'none';
    saveStatus.textContent = '';
    
    try {
        // --- Chamada para a API do Gemini ---
        const systemPrompt = "Você é um gerador de frases para um teste de digitação. Sua única função é gerar uma única frase interessante, com pontuação correta, mas sem aspas no início ou no fim. A frase deve ter entre 10 e 20 palavras.";
        const userQuery = "Gerar uma nova frase para o teste de digitação.";
        
        const apiKey = ""; // Deixe em branco, o Canvas vai fornecer
        const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-09-2025:generateContent?key=${apiKey}`;

        const payload = {
            contents: [{ parts: [{ text: userQuery }] }],
            systemInstruction: {
                parts: [{ text: systemPrompt }]
            },
        };

        const response = await fetch(apiUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });

        if (!response.ok) {
            throw new Error(`Erro na API: ${response.statusText}`);
        }

        const result = await response.json();
        
        if (result.candidates && result.candidates[0].content?.parts?.[0]?.text) {
            const generatedText = result.candidates[0].content.parts[0].text;
            const cleanText = generatedText.trim().replace(/^"|"$/g, ''); 
            loadNewSentence(cleanText); // Carrega a frase da IA
        } else {
            throw new Error("Resposta da API inválida.");
        }
        
    } catch (error) {
        // --- Fallback (Plano B) ---
        console.error("Falha ao buscar frase da IA:", error);
        statusDisplay.textContent = "API falhou. Usando frase local.";
        
        const randomIndex = Math.floor(Math.random() * sentences.length);
        loadNewSentence(sentences[randomIndex]);
    }
}


/**
 * Esta função CARREGA a frase na tela e prepara o jogo.
 * Ela é chamada por getNextSentence()
 */
function loadNewSentence(sentenceToShow) {
    currentSentence = sentenceToShow;

    // Limpa a tela
    sentenceDisplay.innerHTML = "";
    inputArea.value = "";
    
    // Converte a frase em spans (letras individuais)
    currentSentence.split('').forEach(char => {
        const span = document.createElement('span');
        span.textContent = char;
        sentenceDisplay.appendChild(span);
    });

    // Marca a primeira letra como "atual"
    if (sentenceDisplay.childNodes.length > 0) {
        sentenceDisplay.childNodes[0].classList.add('current-char');
    }

    // Reseta as estatísticas
    resetStats();
    statusDisplay.textContent = "Pronto para começar!";
    inputArea.focus(); // Foca na caixa de texto
    restartBtn.disabled = false; // Reabilita o botão
}

// Reseta as estatísticas
function resetStats() {
    startTime = null;
    errors = 0;
    typedChars = 0;
    gameInProgress = false;
    wpmDisplay.textContent = "0";
    accuracyDisplay.textContent = "100";
    inputArea.disabled = false;
}

// Função chamada a cada tecla digitada
function checkTyping() {
    // Inicia o timer na primeira tecla
    if (!gameInProgress) {
        startTime = new Date();
        gameInProgress = true;
        statusDisplay.textContent = "Digitando...";
    }

    const inputChars = inputArea.value.split('');
    const sentenceChars = sentenceDisplay.querySelectorAll('span');
    
    // Total de caracteres digitados
    typedChars = inputChars.length;
    let currentErrors = 0;

    // Compara o input com a frase
    sentenceChars.forEach((span, index) => {
        // Limpa classes anteriores
        span.classList.remove('correct', 'incorrect', 'current-char');

        if (index < inputChars.length) {
            // Se o usuário já digitou esta letra
            if (span.textContent === inputChars[index]) {
                span.classList.add('correct');
            } else {
                span.classList.add('incorrect');
                currentErrors++;
            }
        } else if (index === inputChars.length) {
            // Esta é a próxima letra a ser digitada
            span.classList.add('current-char');
        }
    });

    // Atualiza estatísticas em tempo real
    errors = currentErrors;
    updateHUD();

    // Verifica se o jogo terminou (digitou tudo)
    if (typedChars === currentSentence.length) {
        finishGame();
    }
}

// Atualiza o painel de estatísticas
function updateHUD() {
    if (!gameInProgress || typedChars === 0) return;

    // Calcula Precisão
    const accuracy = ((typedChars - errors) / typedChars) * 100;
    accuracyDisplay.textContent = accuracy.toFixed(0); // Arredonda

    // Calcula WPM (Palavras por Minuto)
    const currentTime = new Date();
    const elapsedTimeInMinutes = (currentTime - startTime) / 1000 / 60;
    // Um "WPM" é padronizado como (caracteres digitados / 5) / tempo
    const wpm = (typedChars / 5) / elapsedTimeInMinutes;
    wpmDisplay.textContent = wpm.toFixed(0); // Arredonda
}

// Termina o jogo
function finishGame() {
    gameInProgress = false;
    inputArea.disabled = true; // Trava a digitação
    
    // Atualiza as estatísticas finais
    updateHUD();

    // CORRETO: Salva os valores finais e mostra o formulário
    finalWPM = parseInt(wpmDisplay.textContent) || 0;
    finalAccuracy = parseInt(accuracyDisplay.textContent) || 0;
    statusDisplay.textContent = `Completo! WPM: ${finalWPM}`;
    
    saveScoreForm.style.display = 'block';
    playerNameInput.focus();
}

// --- 4. A função "async function saveScore(e)" FOI REMOVIDA DAQUI ---
// Ela agora vive em 'score_manager.js'


// --- 5. Adicionar Event Listeners ---

// Ouve o input do usuário
inputArea.addEventListener('input', checkTyping);

// Ouve o clique no botão de reiniciar (agora chama a função da API)
restartBtn.addEventListener('click', getNextSentence);

// CORRETO: Novo listener para o botão de salvar
saveBtn.addEventListener('click', async () => {
    const playerName = playerNameInput.value;
    
    // CORRETO: A pontuação é um objeto com score E accuracy
    const scoreData = {
        score: finalWPM,
        accuracy: finalAccuracy
    };
    const gameName = "typing_test"; // CORRETO: Nome do jogo

    saveBtn.disabled = true;
    saveStatus.textContent = "Salvando...";
    
    // Chamar a função global do score_manager.js
    const result = await window.gameScoreManager.saveScore(playerName, scoreData, gameName);

    // Atualizar a UI com a resposta
    saveStatus.textContent = result.message;
    saveBtn.disabled = false;

    if (result.success) {
        saveScoreForm.style.display = 'none'; // Esconde o form se salvar
    }
});

// --- 6. Iniciar o Jogo ---
// Carrega a primeira frase quando a página abre (usando a API)
getNextSentence();