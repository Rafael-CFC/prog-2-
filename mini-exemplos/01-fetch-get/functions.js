// 1. Função assíncrona dedicada
async function carregarServicos(listaServicos) {
  try {
    const resposta = await fetch('dados.json');
    const servicos = await resposta.json();

    listaServicos.innerHTML = '';

    for (const servico of servicos) {
      const item = document.createElement('li');
      item.className =
        'list-group-item d-flex justify-content-between align-items-center';
      item.innerHTML =
        '<span>' + servico.nome + '</span>' +
        '<span class="badge bg-success rounded-pill">R$ ' +
        servico.preco.toFixed(2) + '</span>';
      listaServicos.appendChild(item);
    }
  } catch (erro) {
    console.error('Falha ao carregar os dados:', erro);
  }
}

// 2. Controle seguro do ciclo de vida do DOM
document.addEventListener('DOMContentLoaded', () => {
  const btnCarregar = document.getElementById('btnCarregar');
  const listaServicos = document.getElementById('listaServicos');

  btnCarregar.addEventListener('click', () => {
    carregarServicos(listaServicos);
  });
});
