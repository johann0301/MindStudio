document.addEventListener("DOMContentLoaded", () => {

    // --- 1. Seletores ---
    const leaderboardBody = document.getElementById('leaderboardBody');
    const filterButtons = document.querySelectorAll('.filter-btn');

    // --- Dicionário de "Tradução" ---
    const NomesAmigaveis = {
        "typing_test": "Typing Test",
        "number_memory": "Number Memory",
        "chimp_test": "Chimp Test",
        "aim_trainer": "Aim Trainer",
        "reaction_time": "Reaction Time"
    };

    // --- 2. Variável Global ---
    let todasAsPontuacoes = []; // Guarda os dados vindos da API

    // --- 3. Funções ---

    /**
     * Função Principal: Busca os dados da nossa API
     */
    async function carregarPontuacoes() {
        try {
            const response = await fetch('/api/get-pontuacoes');
            const data = await response.json();

            if (data.sucesso) {
                todasAsPontuacoes = data.pontuacoes;
                mostrarPlacar("typing_test"); 
                filterButtons[0].classList.add('active');
            } else {
                leaderboardBody.innerHTML = `<tr><td colspan="4">Erro ao carregar: ${data.erro}</td></tr>`;
            }
        } catch (error) {
            console.error("Erro de rede:", error);
            leaderboardBody.innerHTML = `<tr><td colspan="4">Erro de conexão com o servidor.</td></tr>`;
        }
    }

    /**
     * Função para atualizar a tabela na tela
     * @param {string} nomeDoJogo - O ID do jogo
     */
    function mostrarPlacar(nomeDoJogo) {
        
        // 1. Filtra a lista principal
        const placarDoJogo = todasAsPontuacoes.filter(p => p.nome_jogo === nomeDoJogo);

        // 2. Ordena (Sort) o placar
        const isReactionTime = (nomeDoJogo === "reaction_time");
        if (isReactionTime) {
            placarDoJogo.sort((a, b) => a.pontuacao - b.pontuacao); 
        } else {
            placarDoJogo.sort((a, b) => b.pontuacao - a.pontuacao); 
        }

        // Bloco para filtrar apenas o melhor score
        const placarDeRecordes = new Map();
        for (const placar of placarDoJogo) {
            const nome = placar.nome_jogador;
            if (!placarDeRecordes.has(nome)) {
                placarDeRecordes.set(nome, placar);
            }
        }
        const placarFiltrado = Array.from(placarDeRecordes.values());

        // 3. Limpa a tabela
        leaderboardBody.innerHTML = "";

        // 4. Verifica se há pontuações
        if (placarFiltrado.length === 0) {
            leaderboardBody.innerHTML = `<tr><td colspan="4">Nenhuma pontuação registrada para este jogo.</td></tr>`;
            return;
        }

        // 5. Constrói as linhas da tabela (HTML)
        placarFiltrado.slice(0, 10).forEach((placar, index) => { // Mostra só o Top 10
            const row = document.createElement('tr');
            
            // (NOVO) Busca o nome amigável. Se não achar, usa o ID original.
            const nomeAmigavel = NomesAmigaveis[placar.nome_jogo] || placar.nome_jogo;

            row.innerHTML = `
                <td>${index + 1}</td>
                <td>${placar.nome_jogador}</td>
                <td>${placar.pontuacao.toFixed(0)}</td> 
                <td>${nomeAmigavel}</td>
            `;

            leaderboardBody.appendChild(row);
        });
    }

    // --- 4. Event Listeners ---
    filterButtons.forEach(button => {
        button.addEventListener('click', () => {
            const nomeJogo = button.dataset.jogo; 
            filterButtons.forEach(btn => btn.classList.remove('active'));
            button.classList.add('active');
            mostrarPlacar(nomeJogo);
        });
    });

    // --- 5. Iniciar ---
    carregarPontuacoes(); // Busca os dados assim que a página carregar
});