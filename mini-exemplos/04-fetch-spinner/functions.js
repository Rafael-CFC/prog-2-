// 1. Funções auxiliares para clareza visual de estados
function ativarEstadoCarregando(elementos) {
  elementos.btnVerificar.disabled = true;
  elementos.btnSimularErro.disabled = true;
  elementos.iconeBotao.classList.add('d-none');
  elementos.spinnerCarregamento.classList.remove('d-none');
  elementos.textoBotao.textContent = 'Consultando Servidor...';
  elementos.caixaAlerta.classList.add('d-none');
}

function desativarEstadoCarregando(elementos) {
  elementos.spinnerCarregamento.classList.add('d-none');
  elementos.iconeBotao.classList.remove('d-none');
  elementos.textoBotao.textContent = 'Testar Conexão Oficial (/api/status)';
  elementos.btnVerificar.disabled = false;
  elementos.btnSimularErro.disabled = false;
  elementos.caixaAlerta.classList.remove('d-none');
}

// 2. Função assíncrona genérica com bloco defensivo try...catch...finally
async function requisitarUrlComResiliencia(urlAlvo, elementos) {
  ativarEstadoCarregando(elementos);

  try {
    const resposta = await fetch(urlAlvo);

    if (resposta.ok === false) {
      throw new Error('Código HTTP retornado pelo servidor: ' + resposta.status + ' (' + resposta.statusText + ')');
    }

    const dados = await resposta.json();

    elementos.caixaAlerta.className = 'alert alert-success mb-0';
    elementos.caixaAlerta.innerHTML =
      '<i class="bi bi-check-circle-fill me-1"></i> ' +
      '<strong>API Conectada!</strong> Servidor: ' + dados.servidor;
  } catch (erro) {
    elementos.caixaAlerta.className = 'alert alert-danger mb-0';
    elementos.caixaAlerta.innerHTML =
      '<i class="bi bi-exclamation-triangle-fill me-1"></i> ' +
      '<strong>Falha de Conectividade:</strong> ' + erro.message;
  } finally {
    // Executado SEMPRE: restaura botões e desliga o spinner!
    desativarEstadoCarregando(elementos);
  }
}

// 3. Controle seguro de carregamento do DOM
document.addEventListener('DOMContentLoaded', () => {
  const elementos = {
    btnVerificar: document.getElementById('btnVerificar'),
    btnSimularErro: document.getElementById('btnSimularErro'),
    iconeBotao: document.getElementById('iconeBotao'),
    spinnerCarregamento: document.getElementById('spinnerCarregamento'),
    textoBotao: document.getElementById('textoBotao'),
    caixaAlerta: document.getElementById('caixaAlerta')
  };

  elementos.btnVerificar.addEventListener('click', () => {
    requisitarUrlComResiliencia('http://127.0.0.1:5000/api/status', elementos);
  });

  // Mini Desafio 3: rota inexistente para provar o catch/finally
  elementos.btnSimularErro.addEventListener('click', () => {
    requisitarUrlComResiliencia('http://127.0.0.1:5000/api/rota-inexistente', elementos);
  });
});
