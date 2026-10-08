# MiniTienda Web

Aplicación web educativa (Actividad 9 – Pruebas No Funcionales, UDES).
Solo **HTML5, CSS3, JavaScript (ES modules) y Bootstrap 5.3** — sin otras librerías.

## Cómo ejecutarla

El catálogo se carga con `fetch`, por lo que debe servirse por HTTP (no abrir el HTML con doble clic).
Cualquiera de estas opciones funciona:

```bash
# Python
python3 -m http.server 3000

# Node.js
npx serve -l 3000
```

Luego abre <http://localhost:3000>. También sirve la extensión *Live Server* de VS Code.

## Estructura

```
minitienda/
├── index.html              Estructura de la página
├── css/styles.css          Estilos (tema tipo Apple sobre Bootstrap)
├── js/
│   ├── app.js              Punto de entrada: estado y eventos
│   ├── api.js              Carga y validación de data/products.json
│   ├── cart.js             Lógica del carrito + localStorage
│   ├── ui.js               Render del DOM
│   └── utils.js            Formato de moneda, búsqueda y creación segura de nodos
├── data/products.json      Catálogo (16 productos, 5 categorías)
└── vendor/bootstrap/       Bootstrap 5.3.8 local (funciona sin internet)
```

## Funcionalidades (sección 4.1 del documento)

| Requisito | Dónde |
|---|---|
| Catálogo desde `products.json` | `js/api.js` |
| Búsqueda (sin distinguir tildes) y filtro por categoría | `js/app.js` |
| Detalle de producto | modal, `js/ui.js` |
| Agregar / quitar productos, cambiar cantidades | `js/cart.js` |
| Subtotal, IVA (19 %) y total | `calculateTotals` en `js/cart.js` |
| Checkout simulado (sin datos de tarjeta) | modal + validación nativa de Bootstrap |
| Carrito persistente | `localStorage`, con validación de datos corruptos |
| Responsive (móvil, tableta, escritorio) | grid de Bootstrap |
| Mensajes de validación y estados de error | carga, error con reintento, sin resultados, formulario |

## Notas

- No incluye servidor Node/Express ni `/api/health`; el documento los marca como opcionales.
  Para las pruebas de carga, estrés y recuperación con JMeter basta con apuntar al servidor estático.
- Precios en pesos colombianos (COP). Los productos son ficticios.
