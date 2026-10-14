/**
 * MÓDULO PRINCIPAL DA APLICAÇÃO (main.js)
 * Orquestrador e controlador de eventos da interface.
 * Conecta a camada de dados (vitrineService) com a camada de visualização (vitrineView).
 */

import {
  obterServicos,
  salvarServico,
  atualizarServico,
  removerServico
} from '../services/vitrineService.js';

import {
  renderizarCards,
  exibirToast
} from './views/vitrineView.js';

document.addEventListener('DOMContentLoaded', () => {
  // Elementos do DOM
  const form = document.getElementById('formCadastro');
  const container = document.getElementById('vitrineContainer');
  const filtroCategoria = document.getElementById('filtroCategoria');
  const contadorEl = document.getElementById('totalServicosBadge');
  const modalEl = document.getElementById('modalCadastro');
  const servicoIdInput = document.getElementById('servicoId');
  const modalTitulo = document.getElementById('modalCadastroLabel');
  const btnSalvarTexto = document.getElementById('btnSalvarTexto');

  /**
   * Atualiza a exibição da vitrine aplicando o filtro selecionado
   */
  async function atualizarInterface() {
    const todos = await obterServicos();
    const categoriaSelecionada = filtroCategoria ? filtroCategoria.value : 'todas';

    const servicosFiltrados = categoriaSelecionada === 'todas'
      ? todos
      : todos.filter(s => s.categoria === categoriaSelecionada);

    renderizarCards(servicosFiltrados, container);

    if (contadorEl) {
      contadorEl.innerText = `${todos.length} Serviços Cadastrados`;
    }
  }

  // 1. Evento de Filtragem por Categoria
  if (filtroCategoria) {
    filtroCategoria.addEventListener('change', atualizarInterface);
  }

  // 2. Renderização Inicial
  atualizarInterface();

  // 3. Reset do Modal ao abrir para novo cadastro
  if (modalEl) {
    modalEl.addEventListener('show.bs.modal', (e) => {
      // Se não foi disparado por um botão de edição
      if (!servicoIdInput.value) {
        form.reset();
        form.classList.remove('was-validated');
        if (modalTitulo) {
          modalTitulo.innerHTML = '<i class="bi bi-shop text-success me-2"></i>Cadastrar Serviço na Vitrine';
        }
        if (btnSalvarTexto) {
          btnSalvarTexto.innerText = 'Salvar na Vitrine';
        }
      }
    });

    modalEl.addEventListener('hidden.bs.modal', () => {
      form.reset();
      servicoIdInput.value = '';
      form.classList.remove('was-validated');
    });
  }

  // 4. Submissão do Formulário (Create e Update)
  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    // Validação visual nativa do Bootstrap 5
    if (!form.checkValidity()) {
      e.stopPropagation();
      form.classList.add('was-validated');
      return;
    }

    const idAtual = servicoIdInput ? servicoIdInput.value : '';
    const getVal = (id) => document.getElementById(id).value.trim();

    const dados = {
      nome: getVal('nome'),
      categoria: document.getElementById('categoria').value,
      bairro: getVal('bairro'),
      precoBase: parseFloat(getVal('precoBase')) || 0,
      telefone: getVal('telefone'),
      descricao: getVal('descricao')
    };

    const btnSalvar = document.getElementById('btnSalvarModal');
    if (btnSalvar) btnSalvar.disabled = true;

    try {
      if (idAtual) {
        await atualizarServico(idAtual, dados);
        exibirToast('Serviço atualizado com sucesso!', 'success');
      } else {
        await salvarServico(dados);
        exibirToast('Empreendimento cadastrado na vitrine com sucesso!', 'success');
      }
    } catch (erro) {
      exibirToast('Não foi possível salvar o serviço. Verifique os dados e tente novamente.', 'danger');
      return;
    } finally {
      if (btnSalvar) btnSalvar.disabled = false;
    }

    // Reset e atualização imediata da interface
    form.reset();
    servicoIdInput.value = '';
    form.classList.remove('was-validated');

    // Fecha o modal programaticamente
    if (modalEl) {
      const modal = bootstrap.Modal.getOrCreateInstance(modalEl);
      modal.hide();
    }

    // Atualiza os cards e o contador na tela imediatamente!
    await atualizarInterface();
  });

  // 5. Delegação de Eventos na Vitrine (Editar e Excluir)
  container.addEventListener('click', async (e) => {
    // 5.1. Operação Update (Edição)
    const btnEditar = e.target.closest('.btn-editar');
    if (btnEditar) {
      const id = btnEditar.getAttribute('data-id');
      const item = (await obterServicos()).find(s => s.id.toString() === id);

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

    // 5.2. Operação Delete (Exclusão)
    const btnExcluir = e.target.closest('.btn-excluir');
    if (btnExcluir) {
      const id = btnExcluir.getAttribute('data-id');
      if (confirm('Deseja realmente remover este serviço da vitrine comunitária?')) {
        await removerServico(id);
        await atualizarInterface();
        exibirToast('Serviço removido da vitrine.', 'warning');
      }
    }
  });
});