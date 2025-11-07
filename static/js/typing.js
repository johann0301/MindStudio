// --- 1. Selecionar Elementos do HTML ---
const sentenceDisplay = document.getElementById('sentenceDisplay');
const inputArea = document.getElementById('inputArea');
const restartBtn = document.getElementById('restartBtn');
const wpmDisplay = document.getElementById('wpmDisplay');
const accuracyDisplay = document.getElementById('accuracyDisplay');
const statusDisplay = document.getElementById('statusDisplay');

// Frases de exemplo para o teste
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

// --- 3. Funções do Jogo ---

// Carrega uma nova frase
function loadNewSentence() {
    // Escolhe uma frase aleatória
    const randomIndex = Math.floor(Math.random() * sentences.length);
    currentSentence = sentences[randomIndex];

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
    statusDisplay.textContent = `Completo! WPM: ${wpmDisplay.textContent}`;
    
    // Atualiza as estatísticas finais
    updateHUD();
}

// --- 4. Adicionar Event Listeners ---

// Ouve o input do usuário
inputArea.addEventListener('input', checkTyping);

// Ouve o clique no botão de reiniciar
restartBtn.addEventListener('click', loadNewSentence);

// --- 5. Iniciar o Jogo ---
// Carrega a primeira frase quando a página abre
loadNewSentence();