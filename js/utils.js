/**
 * Utilidades puras y reutilizables (sin estado de la aplicación).
 */

const currencyFormatter = new Intl.NumberFormat('es-CO', {
  style: 'currency',
  currency: 'COP',
  maximumFractionDigits: 0,
});

/** Formatea un número como moneda colombiana. */
export function formatPrice(value) {
  return currencyFormatter.format(value);
}

/** Minúsculas y sin tildes, para búsquedas tolerantes. */
export function normalizeText(text) {
  return String(text)
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim();
}

/**
 * Crea un elemento del DOM de forma segura (usa textContent, nunca innerHTML).
 * @param {string} tag
 * @param {Object<string,string>} [attrs]
 * @param {...(Node|string)} children
 */
export function el(tag, attrs = {}, ...children) {
  const node = document.createElement(tag);
  for (const [name, value] of Object.entries(attrs)) {
    if (value === null || value === undefined || value === false) continue;
    node.setAttribute(name, value === true ? '' : String(value));
  }
  for (const child of children.flat()) {
    if (child === null || child === undefined) continue;
    node.append(child instanceof Node ? child : document.createTextNode(String(child)));
  }
  return node;
}
