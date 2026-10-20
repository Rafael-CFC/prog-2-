// js/main.js
import {
  obterServicos,
  salvarServico,
  removerServico,
  testarConexaoApi,
  estaConectadoNaApi
} from './services/vitrineService.js';

import {
  renderizarCards,
  exibirSpinner,
  atualizarStatusConexao,
  exibirToast
} from './views/vitrineView.js';

document.addEventListener('DOMContentLoaded', async () => {
  const form = document.getElementById('formCadastro');
  const container = document.getElementById('vitrineContainer');
  const filtroCategoria = document.getElementById('filtroCategoria');
  const contadorEl = document.getElementById('totalServicosBadge');
  const statusApiBadge = document.getElementById('statusApiBadge');
  const modalEl = document.getElementById('modalCadastro');
  const btnSalvarTexto = document.getElementById('btnSalvarTexto');
  const btnSalvar = document.getElementById('btnSalvar');

  let cacheServicosAtuais = [];

  async function atualizarInterface() {
    exibirSpinner(container);

    const conectado = await testarConexaoApi();
    atualizarStatusConexao(conectado, statusApiBadge);

    cacheServicosAtuais = await obterServicos();

    const categoriaSelecionada = filtroCategoria ? filtroCategoria.value : 'todas';
    const servicosFiltrados = categoriaSelecionada === 'todas'
      ? cacheServicosAtuais
      : cacheServicosAtuais.filter(s => s.categoria === categoriaSelecionada);

    renderizarCards(servicosFiltrados, container);

    if (contadorEl) {
      contadorEl.innerText = `${cacheServicosAtuais.length} Serviços Cadastrados`;
    }
  }

  if (filtroCategoria) {
    filtroCategoria.addEventListener('change', () => {
      const categoria = filtroCategoria.value;
      const filtrados = categoria === 'todas'
        ? cacheServicosAtuais
        : cacheServicosAtuais.filter(s => s.categoria === categoria);
      renderizarCards(filtrados, container);
    });
  }

  // Inicialização assíncrona
  await atualizarInterface();

  // Reset do formulário ao abrir modal
  if (modalEl) {
    modalEl.addEventListener('show.bs.modal', () => {
      form.reset();
      form.classList.remove('was-validated');
    });
  }

  function obterValorCampo(idCampo) {
    const elemento = document.getElementById(idCampo);
    if (elemento) {
      return elemento.value.trim();
    }
    return '';
  }

  // Cadastro de Novo Serviço via HTTP POST (Função Nomeada)
  async function cadastrarNovoServico(evento) {
    evento.preventDefault();

    if (form.checkValidity() === false) {
      evento.stopPropagation();
      form.classList.add('was-validated');
      return;
    }

    const dados = {
      nome: obterValorCampo('nome'),
      categoria: document.getElementById('categoria').value,
      bairro: obterValorCampo('bairro'),
      precoBase: parseFloat(obterValorCampo('precoBase')) || 0,
      telefone: obterValorCampo('telefone'),
      descricao: obterValorCampo('descricao')
    };

    if (btnSalvar) btnSalvar.disabled = true;
    if (btnSalvarTexto) btnSalvarTexto.innerText = 'Gravando...';

    try {
      await salvarServico(dados);

      let msg = 'Serviço salvo localmente (Modo Offline).';
      if (estaConectadoNaApi() === true) {
        msg = 'Serviço gravado no banco de dados SQLite!';
      }
      exibirToast(msg, 'success');

      const modal = bootstrap.Modal.getOrCreateInstance(modalEl);
      modal.hide();

      await atualizarInterface();
    } catch (erro) {
      exibirToast('Erro ao processar cadastro.', 'danger');
    } finally {
      if (btnSalvar) btnSalvar.disabled = false;
      if (btnSalvarTexto) btnSalvarTexto.innerText = 'Salvar no Banco';
    }
  }

  form.addEventListener('submit', cadastrarNovoServico);

  // Exclusão Assíncrona via HTTP DELETE (Função Nomeada)
  async function tratarExclusaoNaVitrine(evento) {
    const btnExcluir = evento.target.closest('.btn-excluir');
    if (btnExcluir) {
      const id = btnExcluir.getAttribute('data-id');
      if (confirm('Deseja realmente remover este serviço da vitrine?')) {
        await removerServico(id);
        await atualizarInterface();
        exibirToast('Serviço excluído da vitrine.', 'warning');
      }
    }
  }

  container.addEventListener('click', tratarExclusaoNaVitrine);
});
