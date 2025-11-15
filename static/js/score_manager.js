async function handleSaveScore(playerName, scoreData, gameName) {
    // 1. Validar nome
    if (!playerName) {
        return { success: false, message: "Por favor, digite seu nome." };
    }

    // 2. Validar conexão com Firebase
    if (!window.gameApp || !window.gameApp.db) {
        console.error("Firebase não está pronto.");
        return { success: false, message: "Erro ao conectar com o banco de dados." };
    }
    
    // 3. Pegar funções do Firebase
    const { db, appId, addDoc, collection, serverTimestamp } = window.gameApp;

    try {
        const scoresCollectionPath = `/artifacts/${appId}/public/data/scores`;
        
        // 4. Montar o objeto de dados
        const dataToSave = {
            name: playerName,
            game: gameName,
            createdAt: serverTimestamp()
        };

        // 5. Lidar com diferentes tipos de pontuação (simples ou complexa)
        if (typeof scoreData === 'object' && scoreData !== null) {
            // Para jogos como Typing Test (score + accuracy)
            dataToSave.score = scoreData.score || 0;
            dataToSave.accuracy = scoreData.accuracy || 0;
        } else {
            // Para jogos como Reaction Time (score simples)
            dataToSave.score = scoreData || 0;
        }
        
        // 6. Salvar no banco
        await addDoc(collection(db, scoresCollectionPath), dataToSave);
        return { success: true, message: "Pontuação salva com sucesso!" };

    } catch (error) {
        console.error("Erro ao salvar pontuação: ", error);
        return { success: false, message: "Erro ao salvar. Tente novamente." };
    }
}

// 7. Expor a função globalmente para que os outros scripts possam usá-la
window.gameScoreManager = {
    saveScore: handleSaveScore
};