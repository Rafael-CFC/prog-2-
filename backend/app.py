"""
BACKEND DIDÁTICO EM FLASK & SQLITE (app.py)
Unidade Curricular: Programação para a Internet 2 (ProgWeb 2)
CST em Sistemas para a Internet — IFSC Câmpus Garopaba

Fornece uma API RESTful completa para a Vitrine Comunitária de Garopaba.
Endpoints disponíveis:
  GET    /api/status          -> Health-check e verificação de conexão
  GET    /api/servicos        -> Lista todos os serviços cadastrados
  POST   /api/servicos        -> Cadastra um novo serviço no SQLite
  PUT    /api/servicos/<id>   -> Atualiza um serviço existente
  DELETE /api/servicos/<id>   -> Remove um serviço pelo ID
"""

import os
import sqlite3
from datetime import datetime
from flask import Flask, jsonify, request
from flask_cors import CORS

# Inicializa o microframework Flask
app = Flask(__name__)

# Habilita CORS (Cross-Origin Resource Sharing) para permitir que páginas
# rodando no Live Server (porta 5500 ou similar) façam requisições para a porta 5000
CORS(app)

# Caminho absoluto para o arquivo do banco de dados SQLite local
DB_PATH = os.path.join(os.path.dirname(__file__), 'vitrine.db')


def obter_conexao():
    """Cria e retorna uma conexão com o banco SQLite com suporte a dicionário."""
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row  # Permite acessar colunas pelo nome (ex: row['nome'])
    return conn


def inicializar_banco():
    """Cria a tabela e insere os registros semente se o banco estiver vazio."""
    conn = obter_conexao()
    cursor = conn.cursor()

    # Criação da tabela de serviços
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS servicos (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            nome TEXT NOT NULL,
            categoria TEXT NOT NULL,
            bairro TEXT NOT NULL,
            precoBase REAL NOT NULL,
            telefone TEXT NOT NULL,
            descricao TEXT,
            dataCadastro TEXT
        )
    ''')

    # Verifica se a tabela já possui dados
    cursor.execute('SELECT COUNT(*) AS total FROM servicos')
    if cursor.fetchone()['total'] == 0:
        # Insere dados modelo semente de Garopaba para enriquecer a experiência inicial
        dados_semente = [
            (
                'Maré Alta Artesanatos & Cerâmicas',
                'Artesanato',
                'Centro Histórico',
                35.00,
                '48991234567',
                'Peças artesanais e utilitárias modeladas à mão com argila local e conchas de Garopaba.',
                datetime.now().isoformat()
            ),
            (
                'Garopaba Web & Design Studio',
                'Tecnologia',
                'Ferrugem',
                150.00,
                '48998765432',
                'Criação de websites profissionais responsivos, cardápios digitais e suporte para comércio local.',
                datetime.now().isoformat()
            ),
            (
                'Pescado Fresco do Zequinha',
                'Alimentação',
                'Canto das Canoas',
                42.00,
                '48984561234',
                'Peixes frescos e frutos do mar da pesca artesanal diária entregues com higiene e pontualidade.',
                datetime.now().isoformat()
            )
        ]

        cursor.executemany('''
            INSERT INTO servicos (nome, categoria, bairro, precoBase, telefone, descricao, dataCadastro)
            VALUES (?, ?, ?, ?, ?, ?, ?)
        ''', dados_semente)
        conn.commit()
        print('-> [Banco SQLite] Tabela "servicos" inicializada com 3 registros semente.')

    conn.close()


# ---------------------------------------------------------------------------
# ROTAS DA API RESTful
# ---------------------------------------------------------------------------

@app.route('/api/status', methods=['GET'])
def verificar_status():
    """Rota de diagnóstico para checar se a API está online."""
    return jsonify({
        'status': 'online',
        'mensagem': 'API REST da Vitrine Comunitária de Garopaba está operacional.',
        'banco': 'SQLite 3'
    }), 200


@app.route('/api/servicos', methods=['GET'])
def listar_servicos():
    """READ: Retorna a lista de todos os serviços ordenados pelo ID decrescente."""
    conn = obter_conexao()
    cursor = conn.cursor()
    cursor.execute('SELECT * FROM servicos ORDER BY id DESC')
    linhas = cursor.fetchall()
    conn.close()

    # Converte cada linha do SQLite em um dicionário Python
    servicos = [dict(linha) for linha in linhas]
    return jsonify(servicos), 200


@app.route('/api/servicos', methods=['POST'])
def cadastrar_servico():
    """CREATE: Recebe um payload JSON do frontend e grava um novo serviço no banco."""
    dados = request.get_json()

    if not dados:
        return jsonify({'erro': 'Payload JSON não fornecido ou inválido.'}), 400

    # Validação mínima dos campos obrigatórios
    campos_obrigatorios = ['nome', 'categoria', 'bairro', 'precoBase', 'telefone']
    for campo in campos_obrigatorios:
        if campo not in dados or str(dados[campo]).strip() == '':
            return jsonify({'erro': f'O campo obrigatório "{campo}" está ausente.'}), 422

    conn = obter_conexao()
    cursor = conn.cursor()
    data_atual = datetime.now().isoformat()

    cursor.execute('''
        INSERT INTO servicos (nome, categoria, bairro, precoBase, telefone, descricao, dataCadastro)
        VALUES (?, ?, ?, ?, ?, ?, ?)
    ''', (
        dados['nome'].strip(),
        dados['categoria'].strip(),
        dados['bairro'].strip(),
        float(dados['precoBase']),
        dados['telefone'].strip(),
        dados.get('descricao', '').strip(),
        data_atual
    ))

    conn.commit()
    novo_id = cursor.lastrowid
    conn.close()

    # Retorna o registro completo recém-criado
    servico_criado = {
        'id': novo_id,
        'nome': dados['nome'].strip(),
        'categoria': dados['categoria'].strip(),
        'bairro': dados['bairro'].strip(),
        'precoBase': float(dados['precoBase']),
        'telefone': dados['telefone'].strip(),
        'descricao': dados.get('descricao', '').strip(),
        'dataCadastro': data_atual
    }

    return jsonify(servico_criado), 201


@app.route('/api/servicos/<int:id>', methods=['PUT'])
def atualizar_servico(id):
    """UPDATE: Atualiza os dados de um serviço existente a partir do seu ID."""
    dados = request.get_json()

    if not dados:
        return jsonify({'erro': 'Payload JSON não fornecido.'}), 400

    conn = obter_conexao()
    cursor = conn.cursor()

    # Verifica se o serviço existe
    cursor.execute('SELECT * FROM servicos WHERE id = ?', (id,))
    existente = cursor.fetchone()
    if not existente:
        conn.close()
        return jsonify({'erro': f'Serviço com ID {id} não encontrado.'}), 404

    cursor.execute('''
        UPDATE servicos
        SET nome = ?, categoria = ?, bairro = ?, precoBase = ?, telefone = ?, descricao = ?
        WHERE id = ?
    ''', (
        dados.get('nome', existente['nome']).strip(),
        dados.get('categoria', existente['categoria']).strip(),
        dados.get('bairro', existente['bairro']).strip(),
        float(dados.get('precoBase', existente['precoBase'])),
        dados.get('telefone', existente['telefone']).strip(),
        dados.get('descricao', existente['descricao']).strip(),
        id
    ))

    conn.commit()
    conn.close()

    return jsonify({'mensagem': f'Serviço {id} atualizado com sucesso.'}), 200


@app.route('/api/servicos/<int:id>', methods=['DELETE'])
def excluir_servico(id):
    """DELETE: Remove um serviço do banco de dados pelo seu ID."""
    conn = obter_conexao()
    cursor = conn.cursor()

    cursor.execute('SELECT id FROM servicos WHERE id = ?', (id,))
    if not cursor.fetchone():
        conn.close()
        return jsonify({'erro': f'Serviço com ID {id} não encontrado.'}), 404

    cursor.execute('DELETE FROM servicos WHERE id = ?', (id,))
    conn.commit()
    conn.close()

    return jsonify({'mensagem': f'Serviço {id} removido com sucesso.'}), 200


# ---------------------------------------------------------------------------
# PONTO DE ENTRADA DO SERVIDOR
# ---------------------------------------------------------------------------
if __name__ == '__main__':
    # Garante que o banco de dados e a tabela existam
    inicializar_banco()
    print('===============================================================')
    print(' SERVIDOR FLASK INICIADO (ProgWeb 2 — IFSC Garopaba)')
    print(' API REST rodando em: http://127.0.0.1:5000')
    print(' Rota de Teste:       http://127.0.0.1:5000/api/status')
    print(' Endpoint Serviços:   http://127.0.0.1:5000/api/servicos')
    print('===============================================================')
    app.run(host='127.0.0.1', port=5000, debug=True)
