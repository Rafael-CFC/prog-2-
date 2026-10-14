// js/services/vitrineService.js
const API_BASE_URL = 'http://127.0.0.1:5000/api';
const STORAGE_KEY = 'garopaba_vitrine_servicos';

let apiConectada = false;

export const DADOS_INICIAIS = [
  {
    id: '1',
    nome: 'Maré Alta Artesanatos & Cerâmicas',
    categoria: 'Artesanato',
    bairro: 'Centro Histórico',
    precoBase: 35.00,
    telefone: '48991234567',
    descricao: 'Peças artesanais e utilitárias modeladas à mão com argila local e conchas de Garopaba.'
  }
];

function removerServicoLocal(id) {
    const servicos = obterServicosLocal();
    const filtrados = servicos.filter(s => s.id.toString() !== id.toString());
    localStorage.setItem(STORAGE_KEY, JSON.stringify(filtrados));
    return filtrados;
}

function obterServicosLocal() {
    try {
        const servicos = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
        return Array.isArray(servicos) ? servicos : [];
    } catch {
        return [];
    }
}

function salvarServicoLocal(novoServico) {
    const criado = {
        ...novoServico,
        id: `local-${Date.now()}`,
        dataCadastro: new Date().toISOString()
    };
    const servicos = obterServicosLocal();
    servicos.unshift(criado);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(servicos));
    return criado;
}

// Operações Assíncronas com Fetch API
export async function obterServicos() {
    try {
        const resposta = await fetch(`${API_BASE_URL}/servicos`, {
            method: 'GET',
            headers: { 'Accept': 'application/json' },
            signal: AbortSignal.timeout(3000)
        });
        if (!resposta.ok) throw new Error(`HTTP ${resposta.status}`);
        const dados = await resposta.json();
        apiConectada = true;
        localStorage.setItem(STORAGE_KEY, JSON.stringify(dados));
        return dados;
    } catch (erro) {
        apiConectada = false;
        console.warn('API Flask offline. Ativando contingência LocalStorage:', erro.message);
        return obterServicosLocal();
    }
}

export async function salvarServico(novoServico) {
    try {
        const resposta = await fetch(`${API_BASE_URL}/servicos`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            },
            body: JSON.stringify(novoServico),
            signal: AbortSignal.timeout(4000)
        });
        if (!resposta.ok) throw new Error(`HTTP ${resposta.status}`);
        const criado = await resposta.json();
        apiConectada = true;
        const servicos = obterServicosLocal();
        servicos.unshift(criado);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(servicos));
        return criado;
    } catch (erro) {
        apiConectada = false;
        console.warn('Falha no envio à API. Salvando localmente:', erro.message);
        return salvarServicoLocal(novoServico);
    }
}

export async function removerServico(id) {
    try {
        const resposta = await fetch(`${API_BASE_URL}/servicos/${id}`, {
            method: 'DELETE',
            headers: { 'Accept': 'application/json' },
            signal: AbortSignal.timeout(4000)
        });
        if (!resposta.ok) throw new Error(`HTTP ${resposta.status}`);
        apiConectada = true;
        removerServicoLocal(id);
        return true;
    } catch (erro) {
        apiConectada = false;
        console.warn('Falha na exclusão remota. Removendo localmente:', erro.message);
        removerServicoLocal(id);
        return true;
    }
}

export async function atualizarServico(id, dadosAtualizados) {
    try {
        const resposta = await fetch(`${API_BASE_URL}/servicos/${id}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            },
            body: JSON.stringify(dadosAtualizados),
            signal: AbortSignal.timeout(4000)
        });
        if (!resposta.ok) throw new Error(`HTTP ${resposta.status}`);
        const atualizado = await resposta.json();
        const servicos = obterServicosLocal().filter(s => s.id.toString() !== id.toString());
        servicos.unshift(atualizado);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(servicos));
        apiConectada = true;
        return atualizado;
    } catch (erro) {
        apiConectada = false;
        const servicos = obterServicosLocal();
        const indice = servicos.findIndex(s => s.id.toString() === id.toString());
        if (indice < 0) throw erro;
        servicos[indice] = { ...servicos[indice], ...dadosAtualizados };
        localStorage.setItem(STORAGE_KEY, JSON.stringify(servicos));
        return servicos[indice];
    }
}