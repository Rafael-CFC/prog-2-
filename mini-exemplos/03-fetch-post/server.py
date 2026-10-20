from flask import Flask, jsonify, request
from flask_cors import CORS

app = Flask(__name__)
CORS(app)

servicos_cadastrados = []


@app.route('/api/cadastrar', methods=['POST'])
def cadastrar_servico():
    dados = request.get_json()

    if not dados or 'nome' not in dados or 'preco' not in dados:
        return jsonify({"erro": "Campos obrigatórios ausentes."}), 400

    novo_id = len(servicos_cadastrados) + 1
    registro = {
        "id": novo_id,
        "nome": str(dados['nome']).strip(),
        # Mini Desafio 2: categoria recebida no POST
        "categoria": str(dados.get('categoria', 'Serviços Gerais')).strip(),
        "preco": float(dados['preco'])
    }
    servicos_cadastrados.append(registro)

    print(f"[API FLASK] Novo serviço cadastrado: {registro}")

    return jsonify({
        "mensagem": "Serviço cadastrado com sucesso no servidor!",
        "registro": registro,
        "total": len(servicos_cadastrados)
    }), 201


if __name__ == '__main__':
    app.run(port=5000, debug=True)
