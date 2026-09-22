# Catálogo de relojes

Página web para mostrar tu catálogo de 14 relojes, con pedido directo por
WhatsApp (mensaje personalizado según el reloj elegido). No usa frameworks
ni pasos de compilación: son solo HTML, CSS y JavaScript, así que puedes
editarla con cualquier editor de texto y publicarla en minutos.

## Estructura del proyecto

```
index.html            → estructura de la página
css/styles.css         → todos los estilos (colores, tipografía, layout)
js/data.js              → tu información de negocio y el catálogo de relojes (edita aquí)
js/main.js              → lógica del sitio (no necesitas tocarlo)
images/watches/         → aquí van las fotos de tus relojes
favicon.svg              → ícono de la pestaña del navegador
```

## Cómo personalizar tu información

Abre `js/data.js` y edita el bloque `CONFIG`:

- `businessName`: el nombre de tu marca.
- `tagline`: una frase corta debajo del logo.
- `whatsappNumber`: tu número en formato internacional, sin espacios ni signos.
  Ejemplo para Colombia: `573001234567` (57 + tu número de 10 dígitos).
- `city`: tu ciudad (Bogotá).
- `instagram` / `email`: opcionales, déjalos vacíos (`""`) si no los quieres mostrar.

Mientras el número de WhatsApp o el nombre de la marca sigan con los valores
de ejemplo, verás un aviso amarillo en la parte superior de la página
recordándote que los cambies. Ese aviso desaparece solo una vez los edites.

## Cómo agregar tus 14 relojes

En el mismo archivo `js/data.js`, en el arreglo `WATCHES`, edita cada
reloj con tus datos reales:

```js
{
  id: 1,
  referencia: "REF-01",       // tu código de referencia
  nombre: "Modelo Onix",       // nombre comercial del reloj
  categoria: "Clásico",         // úsalo para los filtros del catálogo
  precio: 120000,                // número en pesos, o null para "Escríbenos por el precio"
  descripcion: "Descripción corta y atractiva del reloj.",
  imagen: "images/watches/reloj-01.jpg", // ruta a tu foto
},
```

### Sobre las fotos

1. Copia tus fotos (tal cual, sin editarlas) dentro de la carpeta `images/watches/`.
2. Usa nombres simples sin espacios ni tildes, por ejemplo `reloj-01.jpg`, `reloj-02.jpg`.
3. En cada reloj de `js/data.js`, pon esa ruta en el campo `imagen`.
4. Si dejas `imagen: null`, se muestra una imagen temporal de "Foto próximamente".

Recomendación: fotos cuadradas (1:1) y con buena luz se ven mejor en las tarjetas
del catálogo, pero el sitio funciona con cualquier proporción.

## Cómo se arma el mensaje de WhatsApp

Cada botón "Pedir por WhatsApp" abre automáticamente una conversación con tu
número, con un mensaje ya escrito que incluye el nombre y la referencia del
reloj que la persona está viendo. No necesitas configurar nada adicional:
se genera solo a partir de los datos de cada reloj.

## Cómo ver la página en tu computador

No necesitas instalar nada. Basta con abrir el archivo `index.html`
directamente en tu navegador (doble clic).

Si prefieres verla con un servidor local (opcional, útil para evitar
restricciones del navegador con algunos archivos):

```bash
python3 -m http.server 8000
```

y luego abre `http://localhost:8000` en tu navegador.

## Cómo publicar la página (gratis)

Cualquiera de estas opciones te da un enlace público que puedes compartir
por Instagram, WhatsApp, etc.

**Opción 1: GitHub Pages** (usando este mismo repositorio)
1. Ve a la configuración del repositorio en GitHub → "Pages".
2. Selecciona la rama donde está tu código y la carpeta raíz (`/`).
3. GitHub te dará un enlace tipo `https://tu-usuario.github.io/relojesaaa/`.

**Opción 2: Netlify**
1. Entra a [netlify.com](https://netlify.com) y crea una cuenta gratis.
2. Arrastra la carpeta del proyecto a la página de Netlify.
3. Netlify te da un enlace público al instante.

## Filtros por categoría

Los botones de filtro ("Clásico", "Deportivo", etc.) se generan automáticamente
según las categorías que uses en `js/data.js`. Si agregas una categoría nueva
en algún reloj, el filtro aparece solo, sin que tengas que tocar el HTML.
