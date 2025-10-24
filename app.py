from flask import Flask

# 1. Cria a "aplicação" Flask
app = Flask(__name__)

# 2. Cria a rota principal do site
# Quando alguém acessar a página inicial ("/"), 
# a função 'pagina_inicial' será executada.
@app.route('/')
def pagina_inicial():
    return "Nosso servidor Flask está funcionando! 🎉"

# 3. Bloco para rodar o servidor quando você executa "python app.py"
if __name__ == '__main__':
    # debug=True faz o servidor reiniciar sozinho quando você salvar o arquivo
    app.run(debug=True)