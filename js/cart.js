/**
 * Lógica del carrito. Las funciones son puras (no modifican el arreglo recibido)
 * salvo loadCart/saveCart, que usan localStorage.
 * Un ítem del carrito tiene la forma { id: number, qty: number }.
 */

export const STORAGE_KEY = 'minitienda.cart.v1';
export const TAX_RATE = 0.19; // IVA
const MAX_QTY = 99;

/** Lee el carrito guardado, descartando datos corruptos o productos que ya no existen. */
export function loadCart(validIds) {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];

    return parsed
      .filter(
        (item) =>
          Number.isInteger(item?.id) &&
          Number.isInteger(item?.qty) &&
          item.qty > 0 &&
          validIds.has(item.id)
      )
      .map((item) => ({ id: item.id, qty: Math.min(item.qty, MAX_QTY) }));
  } catch {
    return [];
  }
}

/** Guarda el carrito. Devuelve false si el navegador no permite escribir. */
export function saveCart(items) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
    return true;
  } catch {
    return false;
  }
}

export function addItem(items, id, qty = 1) {
  const exists = items.some((item) => item.id === id);
  if (!exists) return [...items, { id, qty: Math.min(qty, MAX_QTY) }];
  return items.map((item) =>
    item.id === id ? { ...item, qty: Math.min(item.qty + qty, MAX_QTY) } : item
  );
}

/** Suma o resta unidades; si la cantidad llega a 0 el ítem se elimina. */
export function changeQuantity(items, id, delta) {
  return items
    .map((item) => (item.id === id ? { ...item, qty: Math.min(item.qty + delta, MAX_QTY) } : item))
    .filter((item) => item.qty > 0);
}

export function removeItem(items, id) {
  return items.filter((item) => item.id !== id);
}

export function countItems(items) {
  return items.reduce((total, item) => total + item.qty, 0);
}

/** Calcula subtotal, IVA y total (en pesos, sin decimales). */
export function calculateTotals(items, productsById) {
  const subtotal = items.reduce(
    (sum, item) => sum + (productsById.get(item.id)?.price ?? 0) * item.qty,
    0
  );
  const tax = Math.round(subtotal * TAX_RATE);
  return { subtotal, tax, total: subtotal + tax };
}
