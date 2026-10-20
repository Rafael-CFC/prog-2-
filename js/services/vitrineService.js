// js/services/vitrineService.js
/**
 * CAMADA DE SERVIÇOS & INTEGRAÇÃO ASSÍNCRONA COM A API (vitrineService.js)
 * Unidade Curricular: Programação para a Internet 2 (ProgWeb 2) - IFSC Garopaba
 * 
 * Responsável por:
 *  1. Comunicar-se via HTTP com o backend RESTful em Flask (porta 5000);
 *  2. Utilizar a Fetch API nativa moderna com async/await;
 *  3. Prover resiliência (Fallback) automático para o LocalStorage se a API estiver offline
 *     (garantindo compatibilidade com o GitHub Pages ou quando o Flask estiver desligado).
 */

const API_BASE_URL = 'http://127.0.0.1:5000/api';
const STORAGE_KEY = 'garopaba_vitrine_servicos';

// Flag de estado da conexão com a API
let apiConectada = false;

// Dados modelo semente caso o LocalStorage esteja vazio no modo offline
export const DADOS_INICIAIS = [
  {
    id: '1',
    nome: 'Maré Alta Artesanatos & Cerâmicas',
    categoria: 'Artesanato',
    bairro: 'Centro Histórico',
    precoBase: 35.00,
    telefone: '48991234567',
    descricao: 'Peças artesanais e utilitárias modeladas à mão com argila local e conchas de Garopaba.'
  },
  {
    id: '2',
    nome: 'Garopaba Web & Design Studio',
    categoria: 'Tecnologia',
    bairro: 'Ferrugem',
    precoBase: 150.00,
    telefone: '48998765432',
    descricao: 'Criação de websites profissionais responsivos, cardápios digitais e suporte para comércio local.'
  },
  {
    id: '3',
    nome: 'Pescado Fresco do Zequinha',
    categoria: 'Alimentação',
    bairro: 'Canto das Canoas',
    precoBase: 42.00,
    telefone: '48984561234',
    descricao: 'Peixes frescos e frutos do mar da pesca artesanal diária entregues com higiene e pontualidade.'
  }
];

/**
 * Retorna o status atual da conexão com o backend Flask
 */
export function estaConectadoNaApi() {
  return apiConectada;
}

/**
 * Testa ativamente a conectividade com o backend Flask
 */
export async function testarConexaoApi() {
  try {
    const resposta = await fetch(`${API_BASE_URL}/status`, {
      method: 'GET',
      headers: { 'Accept': 'application/json' },
      signal: AbortSignal.timeout(2000) // Timeout de 2s para resposta rápida
    });

    apiConectada = resposta.ok;
    return apiConectada;
  } catch (erro) {
    apiConectada = false;
    return false;
  }
}

/**
 * =========================================================================
 * ROTINAS LOCAIS DE CONTINGÊNCIA (FALLBACK LOCALSTORAGE)
 * =========================================================================
 */
function obterServicosLocal() {
  const dados = localStorage.getItem(STORAGE_KEY);
  if (!dados) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(DADOS_INICIAIS));
    return DADOS_INICIAIS;
  }
  try {
    return JSON.parse(dados);
  } catch (e) {
    return [];
  }
}

function salvarServicoLocal(novoServico) {
  const servicos = obterServicosLocal();
  const servicoCompleto = {
    id: Date.now().toString(),
    dataCadastro: new Date().toISOString(),
    ...novoServico
  };
  servicos.unshift(servicoCompleto);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(servicos));
  return servicoCompleto;
}

function atualizarServicoLocal(id, dados) {
  const servicos = obterServicosLocal();
  const index = servicos.findIndex(s => s.id.toString() === id.toString());
  if (index !== -1) {
    servicos[index] = {
      ...servicos[index],
      ...dados,
      dataEdicao: new Date().toISOString()
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(servicos));
    return servicos[index];
  }
  return null;
}

function removerServicoLocal(id) {
  const servicos = obterServicosLocal();
  const filtrados = servicos.filter(s => s.id.toString() !== id.toString());
  localStorage.setItem(STORAGE_KEY, JSON.stringify(filtrados));
  return filtrados;
}

/**
 * =========================================================================
 * OPERAÇÕES CRUD ASSÍNCRONAS (FETCH API COM FALLBACK)
 * =========================================================================
 */

/**
 * READ (GET): Busca a lista de serviços do backend Flask.
 * Se o backend estiver indisponível, recorre ao LocalStorage transparente.
 */
export async function obterServicos() {
  try {
    const resposta = await fetch(`${API_BASE_URL}/servicos`, {
      method: 'GET',
      headers: { 'Accept': 'application/json' },
      signal: AbortSignal.timeout(3000)
    });

    if (!resposta.ok) {
      throw new Error(`Erro HTTP ao carregar serviços: ${resposta.status}`);
    }

    const dados = await resposta.json();
    apiConectada = true;

    // Atualiza o cache local para contingência futura
    localStorage.setItem(STORAGE_KEY, JSON.stringify(dados));
    return dados;
  } catch (erro) {
    apiConectada = false;
    console.warn('[vitrineService] Backend Flask inacessível. Ativando contingência LocalStorage:', erro.message);
    return obterServicosLocal();
  }
}

/**
 * CREATE (POST): Envia um novo serviço em formato JSON para ser gravado no banco SQLite.
 */
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

    if (!resposta.ok) {
      throw new Error(`Falha no cadastro via API: ${resposta.status}`);
    }

    const criado = await resposta.json();
    apiConectada = true;

    // Sincroniza cache local
    const servicos = obterServicosLocal();
    servicos.unshift(criado);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(servicos));

    return criado;
  } catch (erro) {
    apiConectada = false;
    console.warn('[vitrineService] Falha ao enviar para o Flask. Salvando localmente:', erro.message);
    return salvarServicoLocal(novoServico);
  }
}

/**
 * UPDATE (PUT): Atualiza os campos de um serviço existente a partir do seu ID.
 */
export async function atualizarServico(id, dados) {
  try {
    const resposta = await fetch(`${API_BASE_URL}/servicos/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify(dados),
      signal: AbortSignal.timeout(4000)
    });

    if (!resposta.ok) {
      throw new Error(`Falha na atualização via API: ${resposta.status}`);
    }

    apiConectada = true;
    atualizarServicoLocal(id, dados);
    return { id, ...dados };
  } catch (erro) {
    apiConectada = false;
    console.warn('[vitrineService] Falha ao atualizar na API. Atualizando localmente:', erro.message);
    return atualizarServicoLocal(id, dados);
  }
}

/**
 * DELETE (DELETE): Exclui um registro do banco de dados remoto pelo ID.
 */
export async function removerServico(id) {
  try {
    const resposta = await fetch(`${API_BASE_URL}/servicos/${id}`, {
      method: 'DELETE',
      headers: { 'Accept': 'application/json' },
      signal: AbortSignal.timeout(4000)
    });

    if (!resposta.ok) {
      throw new Error(`Falha ao remover na API: ${resposta.status}`);
    }

    apiConectada = true;
    removerServicoLocal(id);
    return true;
  } catch (erro) {
    apiConectada = false;
    console.warn('[vitrineService] Falha ao excluir na API. Excluindo localmente:', erro.message);
    removerServicoLocal(id);
    return true;
  }
}
