// js/utils/formatters.js
/**
 * UTILITÁRIOS PUROS DE FORMATAÇÃO E SANITIZAÇÃO (formatters.js)
 * Funções puras sem efeitos colaterais: não acessam o DOM nem o armazenamento.
 * Permanece 100% idêntico ao Roteiro 04, demonstrando o poder do desacoplamento.
 */

/**
 * Converte um valor numérico para moeda brasileira formatada (BRL - R$)
 */
export function formatarMoeda(valor) {
  const numero = parseFloat(valor) || 0;
  return numero.toLocaleString('pt-BR', {
    style: 'currency',
    currency: 'BRL'
  });
}

/**
 * Aplica máscara visual em números de telefone fixos ou celulares (DDD + número)
 */
export function formatarTelefone(telefone) {
  if (!telefone) return '';
  const limpo = telefone.toString().replace(/\D/g, '');

  if (limpo.length === 11) {
    // Celular: (XX) 9XXXX-XXXX
    return `(${limpo.slice(0, 2)}) ${limpo.slice(2, 7)}-${limpo.slice(7)}`;
  } else if (limpo.length === 10) {
    // Fixo: (XX) XXXX-XXXX
    return `(${limpo.slice(0, 2)}) ${limpo.slice(2, 6)}-${limpo.slice(6)}`;
  }
  return telefone;
}

/**
 * Sanitiza strings para prevenir ataques de Cross-Site Scripting (XSS)
 */
export function escapeHtml(texto) {
  if (!texto) return '';
  return texto
    .toString()
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}
