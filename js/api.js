/**
 * Capa de datos: carga y valida el catálogo desde data/products.json.
 */

const PRODUCTS_URL = 'data/products.json';
const TIMEOUT_MS = 8000;

function isValidProduct(product) {
  return (
    product !== null &&
    typeof product === 'object' &&
    Number.isInteger(product.id) &&
    typeof product.name === 'string' &&
    typeof product.category === 'string' &&
    Number.isFinite(product.price) &&
    product.price >= 0
  );
}

/**
 * Descarga el catálogo. Lanza un Error con mensaje legible si algo falla.
 * @returns {Promise<Array>}
 */
export async function fetchProducts() {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);

  try {
    const response = await fetch(PRODUCTS_URL, {
      signal: controller.signal,
      headers: { Accept: 'application/json' },
    });
    if (!response.ok) {
      throw new Error(`El servidor respondió con el código ${response.status}.`);
    }

    const data = await response.json();
    const list = Array.isArray(data) ? data : data.products;
    if (!Array.isArray(list)) {
      throw new Error('El archivo del catálogo no tiene un formato válido.');
    }
    return list.filter(isValidProduct);
  } catch (error) {
    if (error.name === 'AbortError') {
      throw new Error('Se agotó el tiempo de espera al cargar el catálogo.');
    }
    throw error;
  } finally {
    clearTimeout(timer);
  }
}
