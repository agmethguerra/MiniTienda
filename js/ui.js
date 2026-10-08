/**
 * Capa de interfaz: solo lee/escribe el DOM. No contiene reglas de negocio.
 */
import { el, formatPrice } from './utils.js';

const { bootstrap } = window;
const byId = (id) => document.getElementById(id);

export const refs = {
  search: byId('searchInput'),
  filters: byId('categoryFilters'),
  resultsInfo: byId('resultsInfo'),
  loading: byId('loadingState'),
  error: byId('errorState'),
  errorMessage: byId('errorMessage'),
  empty: byId('emptyState'),
  grid: byId('productGrid'),

  cartPanel: byId('cartPanel'),
  cartCount: byId('cartCount'),
  cartItems: byId('cartItems'),
  subtotal: byId('subtotalValue'),
  tax: byId('taxValue'),
  total: byId('totalValue'),
  checkoutBtn: byId('checkoutBtn'),
  clearBtn: byId('clearBtn'),

  productModal: byId('productModal'),
  detailIcon: byId('detailIcon'),
  detailCategory: byId('detailCategory'),
  detailName: byId('detailName'),
  detailDescription: byId('detailDescription'),
  detailFeatures: byId('detailFeatures'),
  detailPrice: byId('detailPrice'),
  detailAddBtn: byId('detailAddBtn'),

  checkoutModal: byId('checkoutModal'),
  form: byId('checkoutForm'),
  formAlert: byId('formAlert'),
  checkoutPane: byId('checkoutPane'),
  successPane: byId('successPane'),
  coItems: byId('coItems'),
  coSubtotal: byId('coSubtotal'),
  coTax: byId('coTax'),
  coTotal: byId('coTotal'),
  orderName: byId('orderName'),
  orderNumber: byId('orderNumber'),
  orderItems: byId('orderItems'),
  orderTotal: byId('orderTotal'),

  toasts: byId('toastContainer'),
};

export const modals = {
  product: bootstrap.Modal.getOrCreateInstance(refs.productModal),
  checkout: bootstrap.Modal.getOrCreateInstance(refs.checkoutModal),
  cart: bootstrap.Offcanvas.getOrCreateInstance(refs.cartPanel),
};

/* ---------- Estado de la vista del catálogo ---------- */

/** @param {'loading'|'error'|'empty'|'ready'} view */
export function setView(view, message = '') {
  refs.loading.hidden = view !== 'loading';
  refs.error.hidden = view !== 'error';
  refs.empty.hidden = view !== 'empty';
  refs.grid.hidden = view !== 'ready';
  if (view === 'error') refs.errorMessage.textContent = message;
  if (view === 'loading' || view === 'error') refs.resultsInfo.textContent = '';
}

export function setResults(shown, total) {
  refs.resultsInfo.textContent =
    shown === total ? `${total} productos` : `${shown} de ${total} productos`;
}

export function clearSearch() {
  refs.search.value = '';
}

/* ---------- Catálogo ---------- */

export function renderCategories(categories, active) {
  refs.filters.replaceChildren(
    ...categories.map((category) =>
      el(
        'button',
        {
          type: 'button',
          class: 'chip',
          'data-action': 'filter',
          'data-category': category,
          'aria-pressed': String(category === active),
        },
        category
      )
    )
  );
}

function productCard(product) {
  return el(
    'div',
    { class: 'col' },
    el(
      'article',
      { class: 'product-card' },
      el(
        'button',
        {
          type: 'button',
          class: 'product-media',
          'data-action': 'detail',
          'data-id': product.id,
          'aria-label': `Ver detalle de ${product.name}`,
        },
        el('span', { class: 'product-icon', 'aria-hidden': 'true' }, product.icon || '📦')
      ),
      el(
        'div',
        { class: 'product-body' },
        el('p', { class: 'product-category' }, product.category),
        el('h3', { class: 'product-name' }, product.name),
        el('p', { class: 'product-desc' }, product.description || ''),
        el(
          'div',
          { class: 'product-footer' },
          el('span', { class: 'product-price' }, formatPrice(product.price)),
          el(
            'button',
            {
              type: 'button',
              class: 'btn btn-primary btn-sm',
              'data-action': 'add',
              'data-id': product.id,
              'aria-label': `Agregar ${product.name} al carrito`,
            },
            'Agregar'
          )
        )
      )
    )
  );
}

export function renderProducts(products) {
  refs.grid.replaceChildren(...products.map(productCard));
}

/* ---------- Detalle de producto ---------- */

export function openDetail(product) {
  refs.detailIcon.textContent = product.icon || '📦';
  refs.detailCategory.textContent = product.category;
  refs.detailName.textContent = product.name;
  refs.detailDescription.textContent = product.description || '';
  refs.detailPrice.textContent = formatPrice(product.price);
  refs.detailAddBtn.dataset.id = product.id;
  refs.detailFeatures.replaceChildren(...(product.features || []).map((text) => el('li', {}, text)));
  modals.product.show();
}

/* ---------- Carrito ---------- */

function cartRow(item, product) {
  return el(
    'li',
    { class: 'cart-item' },
    el('span', { class: 'cart-icon', 'aria-hidden': 'true' }, product.icon || '📦'),
    el(
      'div',
      {},
      el('p', { class: 'cart-name' }, product.name),
      el('p', { class: 'cart-unit' }, formatPrice(product.price)),
      el(
        'div',
        { class: 'qty' },
        el(
          'button',
          {
            type: 'button',
            class: 'qty-btn',
            'data-action': 'dec',
            'data-id': product.id,
            'aria-label': `Quitar una unidad de ${product.name}`,
          },
          '−'
        ),
        el('span', { class: 'qty-value' }, item.qty),
        el(
          'button',
          {
            type: 'button',
            class: 'qty-btn',
            'data-action': 'inc',
            'data-id': product.id,
            'aria-label': `Agregar una unidad de ${product.name}`,
          },
          '+'
        )
      )
    ),
    el(
      'div',
      { class: 'cart-side' },
      el('span', { class: 'cart-line' }, formatPrice(product.price * item.qty)),
      el(
        'button',
        {
          type: 'button',
          class: 'btn btn-link btn-sm text-danger p-0',
          'data-action': 'remove',
          'data-id': product.id,
          'aria-label': `Eliminar ${product.name} del carrito`,
        },
        'Eliminar'
      )
    )
  );
}

export function renderCart(items, productsById, totals) {
  const count = items.reduce((sum, item) => sum + item.qty, 0);

  refs.cartCount.textContent = String(count);
  refs.cartCount.hidden = count === 0;

  const rows = items
    .filter((item) => productsById.has(item.id))
    .map((item) => cartRow(item, productsById.get(item.id)));

  refs.cartItems.replaceChildren(
    ...(rows.length
      ? rows
      : [
          el(
            'li',
            { class: 'cart-empty' },
            el('p', { class: 'fs-5 fw-semibold mb-1' }, 'Tu carrito está vacío'),
            el('p', { class: 'mb-0' }, 'Agrega productos desde el catálogo.')
          ),
        ])
  );

  refs.subtotal.textContent = formatPrice(totals.subtotal);
  refs.tax.textContent = formatPrice(totals.tax);
  refs.total.textContent = formatPrice(totals.total);
  refs.checkoutBtn.disabled = count === 0;
  refs.clearBtn.disabled = count === 0;
}

/* ---------- Checkout ---------- */

export function beginCheckout(count, totals) {
  refs.form.reset();
  refs.form.classList.remove('was-validated');
  refs.formAlert.hidden = true;
  refs.checkoutPane.hidden = false;
  refs.successPane.hidden = true;

  refs.coItems.textContent = `${count} ${count === 1 ? 'artículo' : 'artículos'}`;
  refs.coSubtotal.textContent = formatPrice(totals.subtotal);
  refs.coTax.textContent = formatPrice(totals.tax);
  refs.coTotal.textContent = formatPrice(totals.total);

  // Bootstrap no admite dos superposiciones a la vez: se cierra el carrito primero.
  const openModal = () => modals.checkout.show();
  if (refs.cartPanel.classList.contains('show')) {
    refs.cartPanel.addEventListener('hidden.bs.offcanvas', openModal, { once: true });
    modals.cart.hide();
  } else {
    openModal();
  }
}

export function showFormError(message) {
  refs.formAlert.textContent = message;
  refs.formAlert.hidden = false;
}

export function showSuccess(order) {
  refs.orderName.textContent = order.name;
  refs.orderNumber.textContent = order.number;
  refs.orderItems.textContent = `${order.count} ${order.count === 1 ? 'artículo' : 'artículos'}`;
  refs.orderTotal.textContent = formatPrice(order.total);
  refs.checkoutPane.hidden = true;
  refs.successPane.hidden = false;
}

/* ---------- Notificaciones ---------- */

export function showToast(message) {
  const toast = el(
    'div',
    {
      class: 'toast align-items-center text-bg-dark border-0',
      role: 'status',
      'aria-live': 'polite',
      'aria-atomic': 'true',
    },
    el(
      'div',
      { class: 'd-flex' },
      el('div', { class: 'toast-body' }, message),
      el('button', {
        type: 'button',
        class: 'btn-close btn-close-white me-2 m-auto',
        'data-bs-dismiss': 'toast',
        'aria-label': 'Cerrar notificación',
      })
    )
  );
  refs.toasts.append(toast);
  toast.addEventListener('hidden.bs.toast', () => toast.remove());
  bootstrap.Toast.getOrCreateInstance(toast, { delay: 2500 }).show();
}
