from flask import Flask, jsonify
from flask_cors import CORS

app = Flask(__name__)
# Libera o acesso entre portas distintas (5500 e 5000)
CORS(app)


# Mini Desafio 1: versão e câmpus adicionados ao status
@app.route('/api/status', methods=['GET'])
def verificar_status():
    return jsonify({
        "status": "online",
        "servidor": "Flask 3.x",
        "cidade": "Garopaba/SC",
        "campus": "IFSC Câmpus Garopaba",
        "versao": "1.0.0"
    }), 200


if __name__ == '__main__':
    app.run(port=5000, debug=True)
