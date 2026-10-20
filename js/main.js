// js/main.js
/**
 * MÓDULO PRINCIPAL & ORQUESTRADOR ASSÍNCRONO (main.js)
 * Unidade Curricular: Programação para a Internet 2 (ProgWeb 2) - IFSC Garopaba
 * 
 * Conecta os eventos da interface com os métodos assíncronos da camada de serviços (vitrineService)
 * e atualiza a visão (vitrineView) garantindo feedback imediato e tratamento de carregamento.
 */

import {
  obterServicos,
  salvarServico,
  atualizarServico,
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
  // Elementos da Interface (DOM)
  const form = document.getElementById('formCadastro');
  const container = document.getElementById('vitrineContainer');
  const filtroCategoria = document.getElementById('filtroCategoria');
  const contadorEl = document.getElementById('totalServicosBadge');
  const statusApiBadge = document.getElementById('statusApiBadge');
  const modalEl = document.getElementById('modalCadastro');
  const servicoIdInput = document.getElementById('servicoId');
  const modalTitulo = document.getElementById('modalCadastroLabel');
  const btnSalvarTexto = document.getElementById('btnSalvarTexto');
  const btnSalvar = document.getElementById('btnSalvar');

  // Cache em memória dos serviços carregados na última consulta
  let cacheServicosAtuais = [];

  /**
   * Consulta a API assincronamente, testa a conectividade e atualiza a interface
   */
  async function atualizarInterface() {
    // 1. Exibe o estado visual de carregamento (Spinner)
    exibirSpinner(container);

    // 2. Testa a conectividade com o backend Flask
    const conectado = await testarConexaoApi();
    atualizarStatusConexao(conectado, statusApiBadge);

    // 3. Busca a lista de serviços (da API Flask ou fallback LocalStorage)
    cacheServicosAtuais = await obterServicos();

    // 4. Aplica o filtro de categoria selecionado
    const categoriaSelecionada = filtroCategoria ? filtroCategoria.value : 'todas';
    const servicosFiltrados = categoriaSelecionada === 'todas'
      ? cacheServicosAtuais
      : cacheServicosAtuais.filter(s => s.categoria === categoriaSelecionada);

    // 5. Renderiza os cards na tela
    renderizarCards(servicosFiltrados, container);

    // 6. Atualiza o contador de itens
    if (contadorEl) {
      contadorEl.innerText = `${cacheServicosAtuais.length} Serviços Cadastrados`;
    }
  }

  // 1. Evento de Filtragem por Categoria
  if (filtroCategoria) {
    filtroCategoria.addEventListener('change', () => {
      const categoriaSelecionada = filtroCategoria.value;
      const servicosFiltrados = categoriaSelecionada === 'todas'
        ? cacheServicosAtuais
        : cacheServicosAtuais.filter(s => s.categoria === categoriaSelecionada);

      renderizarCards(servicosFiltrados, container);
    });
  }

  // 2. Renderização Inicial Assíncrona
  await atualizarInterface();

  // 3. Reset e Controle de Estados do Modal
  if (modalEl) {
    modalEl.addEventListener('show.bs.modal', () => {
      // Se não estiver em modo de edição (ID vazio)
      if (!servicoIdInput.value) {
        form.reset();
        form.classList.remove('was-validated');
        if (modalTitulo) {
          modalTitulo.innerHTML = '<i class="bi bi-shop text-success me-2"></i>Cadastrar Serviço na Vitrine';
        }
        if (btnSalvarTexto) {
          btnSalvarTexto.innerText = 'Salvar no Banco';
        }
      }
    });

    modalEl.addEventListener('hidden.bs.modal', () => {
      form.reset();
      servicoIdInput.value = '';
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

  // 4. Submissão do Formulário (Operações Assíncronas Create & Update)
  async function processarFormularioServico(evento) {
    evento.preventDefault();

    // Validação visual nativa do Bootstrap 5
    if (form.checkValidity() === false) {
      evento.stopPropagation();
      form.classList.add('was-validated');
      return;
    }

    const idAtual = servicoIdInput ? servicoIdInput.value : '';

    const dados = {
      nome: obterValorCampo('nome'),
      categoria: document.getElementById('categoria').value,
      bairro: obterValorCampo('bairro'),
      precoBase: parseFloat(obterValorCampo('precoBase')) || 0,
      telefone: obterValorCampo('telefone'),
      descricao: obterValorCampo('descricao')
    };

    // Bloqueia temporariamente o botão para evitar cliques duplicados
    if (btnSalvar) {
      btnSalvar.disabled = true;
    }
    if (btnSalvarTexto) {
      btnSalvarTexto.innerText = 'Enviando...';
    }

    try {
      if (idAtual) {
        // Operação UPDATE assíncrona
        await atualizarServico(idAtual, dados);
        let msg = 'Serviço atualizado localmente (Modo Offline).';
        if (estaConectadoNaApi() === true) {
          msg = 'Serviço atualizado no banco SQLite com sucesso!';
        }
        exibirToast(msg, 'success');
      } else {
        // Operação CREATE assíncrona
        await salvarServico(dados);
        let msg = 'Empreendimento gravado localmente (Modo Offline).';
        if (estaConectadoNaApi() === true) {
          msg = 'Novo empreendimento gravado no banco de dados SQLite!';
        }
        exibirToast(msg, 'success');
      }

      // Fecha o modal após a resposta do backend
      if (modalEl) {
        const modal = bootstrap.Modal.getOrCreateInstance(modalEl);
        modal.hide();
      }

      // Atualiza a lista na tela com os novos dados
      await atualizarInterface();
    } catch (erro) {
      console.error('Erro ao processar formulário:', erro);
      exibirToast('Ocorreu um erro ao salvar o serviço.', 'danger');
    } finally {
      if (btnSalvar) {
        btnSalvar.disabled = false;
      }
      if (btnSalvarTexto) {
        if (idAtual) {
          btnSalvarTexto.innerText = 'Salvar Alterações';
        } else {
          btnSalvarTexto.innerText = 'Salvar no Banco';
        }
      }
    }
  }

  form.addEventListener('submit', processarFormularioServico);

  // 5. Delegação de Eventos na Vitrine (Editar e Excluir)
  async function tratarAcoesNosCards(evento) {
    // 5.1. Operação Update (Edição)
    const btnEditar = evento.target.closest('.btn-editar');
    if (btnEditar) {
      const id = btnEditar.getAttribute('data-id');
      const item = cacheServicosAtuais.find(s => s.id.toString() === id.toString());

      if (item) {
        servicoIdInput.value = item.id;
        document.getElementById('nome').value = item.nome;
        document.getElementById('categoria').value = item.categoria;
        document.getElementById('bairro').value = item.bairro;
        document.getElementById('precoBase').value = item.precoBase;
        document.getElementById('telefone').value = item.telefone;
        document.getElementById('descricao').value = item.descricao;

        if (modalTitulo) {
          modalTitulo.innerHTML = '<i class="bi bi-pencil-square text-primary me-2"></i>Editar Serviço na Vitrine';
        }
        if (btnSalvarTexto) {
          btnSalvarTexto.innerText = 'Salvar Alterações';
        }

        const modal = bootstrap.Modal.getOrCreateInstance(modalEl);
        modal.show();
      }
      return;
    }

    // 5.2. Operação Delete (Exclusão Assíncrona)
    const btnExcluir = evento.target.closest('.btn-excluir');
    if (btnExcluir) {
      const id = btnExcluir.getAttribute('data-id');
      if (confirm('Deseja realmente remover este serviço da vitrine comunitária?')) {
        await removerServico(id);
        await atualizarInterface();

        let msg = 'Serviço removido do armazenamento local.';
        if (estaConectadoNaApi() === true) {
          msg = 'Serviço excluído do banco SQLite com sucesso.';
        }
        exibirToast(msg, 'warning');
      }
    }
  }

  container.addEventListener('click', tratarAcoesNosCards);
});
