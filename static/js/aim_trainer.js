document.addEventListener("DOMContentLoaded", () => {
    // --- 1. Seletores do Jogo ---
    const gameArea = document.getElementById("gameArea");
    const startBtn = document.getElementById("startBtn");
    const scoreEl = document.getElementById("score");
    const timeEl = document.getElementById("time");
    const accuracyEl = document.getElementById("accuracy");
    const difficultyEl = document.getElementById("difficulty");
    const hitSound = document.getElementById("hitSound");
    const missSound = document.getElementById("missSound");
    const leaderboardBtn = document.getElementById('leaderboardBtn');

    // --- 2. Seletores do Modal ---
    const modal = document.getElementById("endModal");
    const finalScore = document.getElementById("finalScore");
    const finalAccuracy = document.getElementById("finalAccuracy");
    const closeModal = document.getElementById("closeModal");

    // (NOVO) --- 3. Seletores do Formulário de Salvar ---
    const saveScoreForm = document.getElementById('saveScoreForm');
    const playerNameInput = document.getElementById('playerName');
    const saveBtn = document.getElementById('saveBtn');
    const saveStatus = document.getElementById('saveStatus');

    // --- 4. Variáveis do Jogo ---
    let score = 0;
    let hits = 0;
    let misses = 0;
    let time = 30;
    let gameInterval;
    let targetTimeout;
    let playing = false;
    let targetLifetime = 800;
    // (A variável 'score' já guarda a pontuação final, não precisamos de 'finalScore')

    // --- 5. Event Listeners Iniciais ---
    startBtn.addEventListener("click", startGame);
    closeModal.addEventListener("click", () => (modal.style.display = "none"));
    gameArea.addEventListener("click", registerMiss);

    // --- 6. Funções do Jogo ---

    function startGame() {
        if (playing) return;
        playing = true;

        // (NOVO) Reseta a UI de fim de jogo
        modal.style.display = "none";
        saveScoreForm.style.display = "none";
        saveStatus.textContent = "";
        leaderboardBtn.style.display = 'none';

        saveBtn.disabled = false;

        // Reseta as estatísticas
        score = 0;
        hits = 0;
        misses = 0;
        time = 30;
        scoreEl.textContent = score;
        timeEl.textContent = time;
        accuracyEl.textContent = "0%";

        startBtn.disabled = true;
        gameArea.innerHTML = ""; // Limpa alvos antigos

        // Define dificuldade
        const difficulty = difficultyEl.value;
        if (difficulty === "easy") targetLifetime = 1000;
        else if (difficulty === "medium") targetLifetime = 800;
        else targetLifetime = 500;

        // Inicia o jogo
        spawnTarget();
        gameInterval = setInterval(updateTime, 1000);
    }

    function updateTime() {
        time--;
        timeEl.textContent = time;
        if (time <= 0) endGame();
    }

    function updateAccuracy() {
        const total = hits + misses;
        const acc = total > 0 ? ((hits / total) * 100).toFixed(1) : 0;
        accuracyEl.textContent = `${acc}%`;
    }

    function endGame() {
        // Para o jogo
        clearInterval(gameInterval);
        clearTimeout(targetTimeout);
        playing = false;
        startBtn.disabled = false;
        gameArea.innerHTML = ""; // Limpa qualquer alvo restante

        // Calcula precisão final
        const acc = hits + misses > 0 ? ((hits / (hits + misses)) * 100).toFixed(1) : 0;
        accuracyEl.textContent = `${acc}%`;

        // Mostra o Modal de Fim de Jogo
        finalScore.textContent = `🎯 Pontos: ${score}`;
        finalAccuracy.textContent = `💥 Precisão: ${acc}%`;
        modal.style.display = "flex";

        // (NOVO) Mostra o formulário para salvar a pontuação
        saveScoreForm.style.display = "block";
        playerNameInput.focus();
    }

    function spawnTarget() {
        if (!playing) return; // (NOVO) Garante que não crie alvos após o fim

        const target = document.createElement("div");
        target.classList.add("target");

        const size = 40;
        const x = Math.random() * (gameArea.clientWidth - size);
        const y = Math.random() * (gameArea.clientHeight - size);

        target.style.left = `${x}px`;
        target.style.top = `${y}px`;

        target.addEventListener("click", (e) => {
            e.stopPropagation(); // Impede que o clique "vaze" para o gameArea
            hits++;
            score += 10;
            scoreEl.textContent = score;
            hitSound.currentTime = 0;
            hitSound.play();
            target.remove();
            updateAccuracy();
            clearTimeout(targetTimeout); // (NOVO) Limpa o timeout antigo
            spawnTarget(); // Cria o próximo alvo
        });

        gameArea.appendChild(target);

        // (NOVO) Lógica de "alvo perdido" melhorada
        targetTimeout = setTimeout(() => {
            if (document.body.contains(target)) {
                target.remove();
                if (playing) { // Só conta como erro se o jogo ainda estiver rolando
                    misses++;
                    missSound.currentTime = 0;
                    missSound.play();
                    updateAccuracy();
                    spawnTarget(); // Cria o próximo alvo
                }
            }
        }, targetLifetime);
    }

    function registerMiss(e) {
        // (NOVO) Garante que só registre clique no gameArea
        if (playing && e.target === gameArea) {
            misses++;
            missSound.currentTime = 0;
            missSound.play();
            updateAccuracy();
        }
    }

// (NOVO) --- Listener do botão SALVAR ---
    saveBtn.addEventListener('click', async () => {
        const playerName = playerNameInput.value.trim();
        
        const gameName = "aim_trainer";
        const scoreToSave = score;

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

}); // Fim do DOMContentLoaded
