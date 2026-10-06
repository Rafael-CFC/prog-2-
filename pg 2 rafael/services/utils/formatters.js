// js/utils/formatters.js

/**
 * Formata um número/string para o formato de moeda brasileira (BRL).
 * @param {number|string} valor 
 * @returns {string} Ex: "R$ 35,00"
 */
export function formatarMoeda(valor) {
  const num = parseFloat(valor) || 0;
  return num.toLocaleString('pt-BR', {
    style: 'currency',
    currency: 'BRL'
  });
}

/**
 * Formata uma string numérica de telefone para a máscara brasileira (DD) XXXXX-XXXX.
 * @param {string} fone 
 * @returns {string} Ex: "(48) 99999-8888"
 */
export function formatarTelefone(fone) {
  const digits = (fone || '').replace(/\D/g, '');
  if (digits.length === 11) {
    return digits.replace(/^(\d{2})(\d{5})(\d{4})/, '($1) $2-$3');
  }
  if (digits.length === 10) {
    return digits.replace(/^(\d{2})(\d{4})(\d{4})/, '($1) $2-$3');
  }
  return fone;
}

/**
 * Sanitiza texto para evitar vulnerabilidades de Cross-Site Scripting (XSS).
 * @param {string} texto 
 * @returns {string} Texto seguro
 */
export function escapeHtml(texto) {
  const div = document.createElement('div');
  div.textContent = texto || '';
  return div.innerHTML;
}