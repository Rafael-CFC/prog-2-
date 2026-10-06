// js/main.js

import {
  obterServicos,
  salvarServico,
  atualizarServico,
  removerServico
} from './services/vitrineService.js';

import {
  renderizarCards,
  exibirToast
} from './views/vitrineView.js';

document.addEventListener('DOMContentLoaded', () => {
  // Seleção de elementos do DOM
  const form = document.getElementById('formCadastro');
  const container = document.getElementById('vitrineContainer');
  const filtroCategoria = document.getElementById('filtroCategoria');
  const contadorEl = document.getElementById('totalServicosBadge');
  const modalEl = document.getElementById('modalCadastro');
  const servicoIdInput = document.getElementById('servicoId'); // ID correto com I maiúsculo

  /**
   * Atualiza os cards exibidos com base no filtro selecionado e atualiza o contador.
   */
  function atualizarInterface() {
    const todos = obterServicos();
    const filtro = filtroCategoria ? filtroCategoria.value : 'todas';
    
    const filtrados = filtro === 'todas'
      ? todos
      : todos.filter(s => s.categoria === filtro);

    renderizarCards(filtrados, container);

    if (contadorEl) {
      contadorEl.innerText = `${todos.length} cadastrados`;
    }
  }

  // Evento de alteração no filtro de categoria
  if (filtroCategoria) {
    filtroCategoria.addEventListener('change', atualizarInterface);
  }

  // Carga inicial dos dados na interface
  atualizarInterface();

  // Reset do modal ao abrir/fechar
  if (modalEl) {
    modalEl.addEventListener('show.bs.modal', () => {
      if (!servicoIdInput || !servicoIdInput.value) {
        form.reset();
        form.classList.remove('was-validated');
        const modalTitulo = document.getElementById('modalCadastroLabel');
        if (modalTitulo) {
          modalTitulo.innerHTML = '<i class="bi bi-shop text-success me-2"></i>Cadastrar Serviço na Vitrine';
        }
        const btnSalvarTexto = document.getElementById('btnSalvarTexto');
        if (btnSalvarTexto) {
          btnSalvarTexto.innerText = 'Salvar na Vitrine';
        }
      }
    });

    modalEl.addEventListener('hidden.bs.modal', () => {
      form.reset();
      if (servicoIdInput) servicoIdInput.value = '';
      form.classList.remove('was-validated');
    });
  }

  // Submissão do Formulário (Create e Update)
  form.addEventListener('submit', (e) => {
    e.preventDefault();

    // Validação nativa com o Bootstrap 5
    if (!form.checkValidity()) {
      e.stopPropagation();
      form.classList.add('was-validated');
      return;
    }

    const idAtual = servicoIdInput ? servicoIdInput.value.trim() : '';
    const getVal = (id) => {
      const el = document.getElementById(id);
      return el ? el.value.trim() : '';
    };

    const dados = {
      nome: getVal('nome'),
      categoria: document.getElementById('categoria').value,
      bairro: getVal('bairro'),
      precoBase: parseFloat(getVal('precoBase')) || 0,
      telefone: getVal('telefone'),
      descricao: getVal('descricao')
    };

    if (idAtual) {
      // Operação UPDATE
      atualizarServico(idAtual, dados);
      exibirToast('Serviço atualizado com sucesso!');
    } else {
      // Operação CREATE
      salvarServico(dados);
      exibirToast('Empreendimento cadastrado com sucesso!');
    }

    // Limpa formulário e fecha Modal
    form.reset();
    if (servicoIdInput) servicoIdInput.value = '';
    form.classList.remove('was-validated');

    if (modalEl) {
      const modal = bootstrap.Modal.getOrCreateInstance(modalEl);
      modal.hide();
    }

    // Re-renderiza a lista atualizada
    atualizarInterface();
  });

  // Delegação de Eventos para os botões dos Cards (Editar e Excluir)
  container.addEventListener('click', (e) => {
    // Clique no botão Editar
    const btnEditar = e.target.closest('.btn-editar');
    if (btnEditar) {
      const id = btnEditar.getAttribute('data-id');
      const item = obterServicos().find(s => s.id === id);

      if (item) {
        if (servicoIdInput) servicoIdInput.value = item.id;
        document.getElementById('nome').value = item.nome;
        document.getElementById('categoria').value = item.categoria;
        document.getElementById('bairro').value = item.bairro;
        document.getElementById('precoBase').value = item.precoBase;
        document.getElementById('telefone').value = item.telefone;
        document.getElementById('descricao').value = item.descricao;

        const modalTitulo = document.getElementById('modalCadastroLabel');
        if (modalTitulo) {
          modalTitulo.innerHTML = '<i class="bi bi-pencil-square text-primary me-2"></i>Editar Serviço na Vitrine';
        }

        const btnSalvarTexto = document.getElementById('btnSalvarTexto');
        if (btnSalvarTexto) {
          btnSalvarTexto.innerText = 'Salvar Alterações';
        }

        if (modalEl) {
          const modal = bootstrap.Modal.getOrCreateInstance(modalEl);
          modal.show();
        }
      }
      return;
    }

    // Clique no botão Excluir
    const btnExcluir = e.target.closest('.btn-excluir');
    if (btnExcluir) {
      const id = btnExcluir.getAttribute('data-id');
      if (confirm('Deseja realmente remover este serviço da vitrine?')) {
        removerServico(id);
        atualizarInterface();
        exibirToast('Serviço removido da vitrine.', 'warning');
      }
    }
  });
});