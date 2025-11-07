from flask import Flask, render_template

# 1. Cria a "aplicação" Flask
app = Flask(__name__)

# 2. Cria a rota principal do site
# Quando alguém acessar a página inicial ("/"),
# a função 'pagina_inicial' será executada.
@app.route('/')
def pagina_inicial():
    return render_template('index.html')
@app.route('/chimp-test')
def chimp_test():
    return render_template('chimp_test.html')
@app.route('/typing')
def typing_test():
    return render_template('typing.html')
@app.route('/aim-trainer')
def aim_trainer():
    return render_template('aim_trainer.html')

# 3. Bloco para rodar o servidor quando você executa "python app.py"
if __name__ == '__main__':
    # debug=True faz o servidor reiniciar sozinho quando você salvar o arquivo
    app.run(debug=True)