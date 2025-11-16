import sqlite3  # Importa a biblioteca do SQLite
from flask import Flask, render_template, request, jsonify  # Importa 'request' e 'jsonify'

# 1. Cria a "aplicação" Flask
app = Flask(__name__)

# --- Configuração do Banco de Dados ---
DATABASE_FILE = 'pontuacoes.db'

def inicializar_banco():
    """
    Função para criar o arquivo do banco (pontuacoes.db)
    e a tabela 'pontuacoes' se eles não existirem.
    """
    # Conecta ao banco (isso cria o arquivo se ele não existir)
    conn = sqlite3.connect(DATABASE_FILE)
    cursor = conn.cursor()
    
    # Cria a tabela
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS pontuacoes (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            nome_jogador TEXT NOT NULL,
            nome_jogo TEXT NOT NULL,
            pontuacao REAL NOT NULL, 
            data_registro TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    ''')
    
    conn.commit()
    conn.close()
# --- Fim da Configuração do BD ---

# 2. Cria as rotas do site
@app.route('/')
def pagina_inicial():
    return render_template('index.html')

# --- ROTAS DOS JOGOS ---
@app.route('/chimp-test')
def chimp_test():
    return render_template('chimp_test.html')

@app.route('/typing-test')
def typing_test():
    return render_template('typing_test.html')

@app.route('/aim-trainer')
def aim_trainer():
    return render_template('aim_trainer.html')

@app.route('/number-memory')
def number_memory():
    return render_template('number_memory.html')

@app.route('/reaction-time')
def reaction_time():
    return render_template('reaction_time.html')

# --- API PARA SALVAR PONTUAÇÃO ---
@app.route('/api/salvar-pontuacao', methods=['POST'])
def salvar_pontuacao():
    """
    Esta é a rota que o JavaScript vai chamar.
    Ela espera receber um JSON com:
    {
        "nome": "Nome do Jogador",
        "jogo": "Nome do Jogo (ex: chimp-test)",
        "pontuacao": 123
    }
    """
    try:
        # 1. Pega os dados que o JS enviou (em formato JSON)
        dados = request.get_json()
        
        nome = dados.get('nome')
        jogo = dados.get('jogo')
        pontuacao = dados.get('pontuacao')

        # 2. Validação simples
        if not nome or not jogo or pontuacao is None:
            # Retorna um erro para o JS
            return jsonify({'sucesso': False, 'erro': 'Dados incompletos'}), 400

        # 3. Conecta ao banco e insere os dados
        conn = sqlite3.connect(DATABASE_FILE)
        cursor = conn.cursor()
        cursor.execute(
            "INSERT INTO pontuacoes (nome_jogador, nome_jogo, pontuacao) VALUES (?, ?, ?)",
            (nome, jogo, pontuacao)
        )
        conn.commit()
        conn.close()

        # 4. Envia uma resposta de sucesso de volta ao JS
        return jsonify({'sucesso': True, 'mensagem': 'Pontuação salva com sucesso!'})

    except Exception as e:
        # Em caso de qualquer outro erro, informa o JS e printa no terminal do Flask
        print(f"Erro ao salvar pontuação: {e}")
        return jsonify({'sucesso': False, 'erro': str(e)}), 500
# --- Fim da API ---

# --- ROTAS DO LEADERBOARD ---
@app.route('/leaderboard')
def pagina_leaderboard():
    """ Rota para servir a página HTML do placar de líderes. """
    return render_template('leaderboard.html')

@app.route('/api/get-pontuacoes', methods=['GET'])
def get_pontuacoes():
    """
    Esta é a API que o JavaScript vai chamar.
    Ela lê o banco de dados e retorna todas as pontuações em formato JSON.
    """
    try:
        conn = sqlite3.connect(DATABASE_FILE)
        
        # Isso faz o SQLite retornar os dados como dicionários (mais fácil para o JS)
        conn.row_factory = sqlite3.Row 
        
        cursor = conn.cursor()
        
        # Pega todas as pontuações, ordenadas pela data de registro (mais novas primeiro)
        cursor.execute("SELECT nome_jogador, nome_jogo, pontuacao, data_registro FROM pontuacoes ORDER BY data_registro DESC")
        
        # Converte os resultados em uma lista de dicionários
        # A sintaxe [dict(row) for row in ...] é uma "List Comprehension" em Python
        pontuacoes = [dict(row) for row in cursor.fetchall()]
        
        conn.close()
        
        # Retorna a lista completa de pontuações como JSON
        return jsonify({'sucesso': True, 'pontuacoes': pontuacoes})

    except Exception as e:
        print(f"Erro ao buscar pontuações: {e}")
        return jsonify({'sucesso': False, 'erro': str(e)}), 500

# 4. Bloco para rodar o servidor
if __name__ == '__main__':
    inicializar_banco()  # Chama a função para criar o BD antes de rodar
    app.run(debug=True)
