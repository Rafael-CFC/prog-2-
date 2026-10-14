// js/views/vitrineView.js
import { formatarMoeda, formatarTelefone, escapeHtml } from '../utils/formatters.js';

const CORES_CATEGORIA = {
    'Alimentação': 'success',
    'Tecnologia': 'info',
    'Artesanato': 'warning',
    'Serviços Gerais': 'primary',
    'Turismo': 'secondary'
};

export function criarCardHtml(s) {
    const corBadge = CORES_CATEGORIA[s.categoria] || 'primary';
    const telNumeros = (s.telefone || '').replace(/\D/g, '');

    return `
    <div class="col-md-6 col-lg-4 mb-4">
        <div class="card h-100 shadow-sm border-0 vitrine-card rounded-4 overflow-hidden">
            <div class="card-body p-4 d-flex flex-column">
                <div class="d-flex justify-content-between align-items-center mb-2">
                    <span class="badge bg-${corBadge} px-3 py-2 rounded-pill font-outfit">
                        <i class="bi bi-tag-fill me-1"></i>${escapeHtml(s.categoria)}
                    </span>
                    <span class="fw-bold text-success font-outfit fs-5">
                        ${formatarMoeda(s.precoBase)}
                    </span>
                </div>

                <h5 class="card-title fw-bold text-dark mt-2 mb-1">${escapeHtml(s.nome)}</h5>
                <h6 class="text-muted small mb-3">
                    <i class="bi bi-geo-alt-fill text-danger me-1"></i>${escapeHtml(s.bairro)}
                </h6>
                <p class="card-text text-secondary small flex-grow-1" style="line-height: 1.5;">
                    ${escapeHtml(s.descricao)}
                </p>

                <hr class="my-3 text-muted opacity-25">

                <div class="d-flex justify-content-between align-items-center mt-auto">
                    <a href="https://wa.me/55${telNumeros}" target="_blank" class="btn btn-sm btn-outline-success rounded-pill px-3 fw-bold">
                        <i class="bi bi-whatsapp me-1"></i>${formatarTelefone(s.telefone)}
                    </a>
                    <div class="d-flex gap-1">
                        <button class="btn btn-sm btn-outline-danger btn-excluir rounded-pill px-2" data-id="${s.id}" title="Remover da vitrine">
                            <i class="bi bi-trash"></i>
                        </button>
                    </div>
                </div>
            </div>
        </div>
    </div>
    `;
}

export function renderizarCards(servicos, containerElement) {
    if (!containerElement) return;
    if (!servicos || servicos.length === 0) {
        containerElement.innerHTML = `
            <div class="col-12 py-5 text-center text-muted">
                <i class="bi bi-inbox fs-1 d-block mb-3 text-secondary opacity-50"></i>
                <h5 class="fw-bold">Nenhum serviço encontrado</h5>
                <p class="small">Cadastre um novo serviço ou altere o filtro de categoria.</p>
            </div>
        `;
        return;
    }
    containerElement.innerHTML = servicos.map(s => criarCardHtml(s)).join('');
}

export function exibirSpinner(containerElement) {
    if (!containerElement) return;
    containerElement.innerHTML = `
        <div class="col-12 py-5 text-center text-primary">
            <div class="spinner-border text-primary" role="status" style="width: 3rem; height: 3rem;">
                <span class="visually-hidden">Carregando dados da API...</span>
            </div>
            <p class="mt-3 text-muted small fw-semibold">Consultando serviços no backend Flask (SQLite)...</p>
        </div>
    `;
}

export function atualizarStatusConexao(isOnline, statusBadgeEl) {
    if (!statusBadgeEl) return;
    if (isOnline) {
        statusBadgeEl.className = 'badge bg-success-subtle text-success border border-success-subtle px-3 py-2 rounded-pill fw-semibold';
        statusBadgeEl.innerHTML = '<i class="bi bi-cloud-check-fill me-1"></i> Backend Online (Flask + SQLite)';
    } else {
        statusBadgeEl.className = 'badge bg-warning-subtle text-warning border border-warning-subtle px-3 py-2 rounded-pill fw-semibold';
        statusBadgeEl.innerHTML = '<i class="bi bi-hdd-network-fill me-1"></i> Modo Offline (LocalStorage)';
    }
}

export function exibirToast(mensagem, tipo = 'success') {
    const toastEl = document.getElementById('toastNotificacao');
    const toastMsgEl = document.getElementById('toastMensagem');
    if (!toastEl || !toastMsgEl) return;
    toastEl.className = `toast align-items-center text-white bg-${tipo} border-0 shadow-lg`;
    toastMsgEl.innerText = mensagem;
    const bsToast = bootstrap.Toast.getOrCreateInstance(toastEl, { delay: 3500 });
    bsToast.show();
}