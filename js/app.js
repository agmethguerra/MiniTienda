/**
 * Punto de entrada: mantiene el estado y conecta datos, carrito e interfaz.
 */
import { fetchProducts } from './api.js';
import * as Cart from './cart.js';
import * as UI from './ui.js';
import { normalizeText } from './utils.js';

const ALL = 'Todos';

const state = {
  products: [],
  productsById: new Map(),
  categories: [ALL],
  query: '',
  category: ALL,
  cart: [],
  storageWarned: false,
};

/* ---------- Catálogo ---------- */

function filteredProducts() {
  const query = normalizeText(state.query);
  return state.products.filter((product) => {
    const matchesCategory = state.category === ALL || product.category === state.category;
    return matchesCategory && (!query || product.searchText.includes(query));
  });
}

function renderCatalog() {
  const list = filteredProducts();
  UI.renderCategories(state.categories, state.category);
  UI.renderProducts(list);
  UI.setResults(list.length, state.products.length);
  UI.setView(list.length ? 'ready' : 'empty');
}

async function loadCatalog() {
  UI.setView('loading');
  try {
    const list = await fetchProducts();
    if (list.length === 0) throw new Error('El catálogo está vacío.');

    state.products = list.map((product) => ({
      ...product,
      searchText: normalizeText(`${product.name} ${product.description ?? ''} ${product.category}`),
    }));
    state.productsById = new Map(state.products.map((product) => [product.id, product]));
    state.categories = [ALL, ...new Set(state.products.map((product) => product.category))];
    state.cart = Cart.loadCart(new Set(state.productsById.keys()));

    renderCatalog();
    renderCart();
  } catch (error) {
    console.error('Error al cargar el catálogo:', error);
    const message =
      error instanceof TypeError
        ? 'Verifica tu conexión y que la aplicación se esté sirviendo desde un servidor local.'
        : error.message;
    UI.setView('error', message);
  }
}

/* ---------- Carrito ---------- */

function renderCart() {
  UI.renderCart(state.cart, state.productsById, Cart.calculateTotals(state.cart, state.productsById));
}

function commitCart(items) {
  state.cart = items;
  if (!Cart.saveCart(items) && !state.storageWarned) {
    state.storageWarned = true;
    UI.showToast('No se pudo guardar el carrito en este navegador.');
  }
  renderCart();
}

/* ---------- Checkout ---------- */

function createOrderNumber() {
  return `MT-${Date.now().toString(36).toUpperCase()}`;
}

function handleCheckoutSubmit(event) {
  event.preventDefault();
  const form = event.currentTarget;
  form.classList.add('was-validated');

  if (state.cart.length === 0) {
    UI.showFormError('Tu carrito está vacío. Agrega productos antes de continuar.');
    return;
  }
  if (!form.checkValidity()) {
    form.querySelector(':invalid')?.focus();
    return;
  }

  const totals = Cart.calculateTotals(state.cart, state.productsById);
  const order = {
    number: createOrderNumber(),
    name: String(new FormData(form).get('name')).trim(),
    count: Cart.countItems(state.cart),
    total: totals.total,
  };

  commitCart([]);
  UI.showSuccess(order);
}

/* ---------- Acciones (delegación de eventos con data-action) ---------- */

const actions = {
  filter(target) {
    state.category = target.dataset.category;
    renderCatalog();
  },

  detail(target) {
    const product = state.productsById.get(Number(target.dataset.id));
    if (product) UI.openDetail(product);
  },

  add(target) {
    const product = state.productsById.get(Number(target.dataset.id));
    if (!product) return;
    commitCart(Cart.addItem(state.cart, product.id));
    UI.showToast(`${product.name} se agregó al carrito`);
    if (target.closest('#productModal')) UI.modals.product.hide();
  },

  inc(target) {
    commitCart(Cart.changeQuantity(state.cart, Number(target.dataset.id), 1));
  },

  dec(target) {
    commitCart(Cart.changeQuantity(state.cart, Number(target.dataset.id), -1));
  },

  remove(target) {
    commitCart(Cart.removeItem(state.cart, Number(target.dataset.id)));
  },

  clear() {
    commitCart([]);
  },

  checkout() {
    if (state.cart.length === 0) return;
    const totals = Cart.calculateTotals(state.cart, state.productsById);
    UI.beginCheckout(Cart.countItems(state.cart), totals);
  },

  retry: loadCatalog,

  'reset-filters'() {
    state.query = '';
    state.category = ALL;
    UI.clearSearch();
    renderCatalog();
  },
};

function bindEvents() {
  document.addEventListener('click', (event) => {
    const target = event.target.closest('[data-action]');
    const handler = target && actions[target.dataset.action];
    if (handler) handler(target);
  });

  UI.refs.search.addEventListener('input', (event) => {
    if (state.products.length === 0) return;
    state.query = event.target.value;
    renderCatalog();
  });

  UI.refs.form.addEventListener('submit', handleCheckoutSubmit);

  // Mantiene sincronizado el carrito si se modifica en otra pestaña.
  window.addEventListener('storage', (event) => {
    if (event.key !== Cart.STORAGE_KEY || state.products.length === 0) return;
    state.cart = Cart.loadCart(new Set(state.productsById.keys()));
    renderCart();
  });
}

bindEvents();
loadCatalog();
