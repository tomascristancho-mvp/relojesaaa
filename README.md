# Catálogo de relojes

Página web para mostrar tu catálogo de 14 relojes, con pedido directo por
WhatsApp (mensaje personalizado según el reloj elegido). No usa frameworks
ni pasos de compilación: son solo HTML, CSS y JavaScript, así que puedes
editarla con cualquier editor de texto y publicarla en minutos.

## Estructura del proyecto

```
index.html                 → estructura de la página pública
admin.html                 → panel privado de pedidos/contabilidad (ver abajo)
css/styles.css              → estilos de la página pública
css/admin.css                → estilos del panel privado
js/data.js                      → tu información de negocio y el catálogo de relojes (edita aquí)
js/admin-config.js               → código de acceso del panel privado (edítalo aquí)
images/watches/                    → aquí van las fotos de tus relojes
favicon.svg                         → ícono de la pestaña del navegador
```

El resto de los archivos en `js/` son la lógica del sitio — no necesitas
tocarlos para actualizar tu catálogo o tu negocio, eso se edita en
`js/data.js` y `js/admin-config.js`. Están divididos en piezas chicas en
vez de un solo archivo gigante, cada una con una sola responsabilidad:

**Compartido por ambas páginas**
- `js/utils.js` — formato de moneda/precio, texto seguro, enlaces de WhatsApp.

**Página pública** (cargados por `index.html`)
- `js/catalog.js` — tarjetas, filtros, búsqueda, inclinación 3D al pasar el mouse.
- `js/watch-modal.js` — el modal de detalle y la lupa de zoom.
- `js/site.js` — tu marca, menú móvil, SEO, y el arranque general de la página.

**Panel privado** (cargados por `admin.html`)
- `js/admin-orders.js` — guardar/leer pedidos, el formulario, la tabla y sus estadísticas.
- `js/admin-csv.js` — exportar/importar CSV (Excel).
- `js/admin-sales-detail.js` — la lista que se abre al hacer clic en "Ganancia total".
- `js/admin-auth.js` — el candado de acceso y el arranque del panel.

Cada archivo HTML carga sus scripts en orden con etiquetas `<script>`
normales (sin `import`/`export`, sin paso de compilación), así que sigues
pudiendo abrir `index.html` con doble clic sin instalar nada.

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
  referencia: "REF-01",         // código interno para identificar el reloj (no es el código de fábrica)
  marca: "Fossil",               // marca real del reloj, se usa en el filtro "Marca"
  genero: "Hombre",              // "Hombre", "Mujer" o "Unisex", se usa en el filtro "Género"
  nombre: "Clásico Esfera Blanca", // nombre descriptivo del reloj
  precio: 60000,                  // número en pesos, o null para "Escríbenos por el precio"
  descripcion: "Descripción corta y atractiva del reloj.",
  imagen: "images/watches/reloj-01.jpg", // ruta a tu foto
},
```

`referencia` es un código interno (REF-01, REF-02...) que tú controlas, no el
número de modelo de fábrica — así siempre es correcto, sin depender de
adivinar el código exacto del fabricante. Si tu proveedor te da un código de
referencia real para cada reloj, puedes reemplazar el valor de `referencia`
por ese código.

### Sobre las fotos

1. Copia tus fotos (tal cual, sin editarlas) dentro de la carpeta `images/watches/`.
2. Usa nombres simples sin espacios ni tildes, por ejemplo `reloj-01.jpg`, `reloj-02.jpg`.
3. En cada reloj de `js/data.js`, pon esa ruta en el campo `imagen`.
4. Si dejas `imagen: null`, se muestra una imagen temporal de "Foto próximamente".

Recomendación: fotos cuadradas (1:1) y con buena luz se ven mejor en las tarjetas
del catálogo, pero el sitio funciona con cualquier proporción.

### Marcar un reloj como agotado

El panel de pedidos (`admin.html`) guarda todo en el navegador donde lo
usas (`localStorage`) — **no está conectado con la página pública**. Eso
significa que registrar un pedido ahí no puede, por sí solo, ocultar
automáticamente ese reloj para el resto de tus clientes: la página pública
es un archivo estático (`js/data.js`) que solo cambia cuando lo editas y
vuelves a publicar el sitio.

Cuando una venta ya esté **100% concretada** (el reloj entregado y no te
queda más stock de esa referencia), agrega `disponible: false` a ese reloj
en `js/data.js`:

```js
{
  id: 1,
  referencia: "REF-01",
  // ...el resto de los campos igual...
  disponible: false, // deja de aparecer en el catálogo público
},
```

Al publicar el cambio, esa referencia deja de aparecer en el catálogo, en
la búsqueda y en enlaces compartidos (aunque alguien ya tenga el link
guardado). No borra sus datos: puedes quitar la línea (o ponerla en
`true`) cuando vuelvas a tener stock.

Para que no se te pase ninguna, el panel de pedidos avisa arriba de todo
cuando detecta una referencia que ya marcaste como "Entregado" pero que el
catálogo público todavía muestra como disponible. Si quieres, en vez de
editar el archivo tú mismo, puedes simplemente pedirme (a Claude) que
marque esa referencia como agotada la próxima vez que hablemos.

### Importante: solo describe características reales

En `descripcion`, escribe únicamente características que el reloj realmente
tiene (por ejemplo, no pongas "resistente al agua" si no estás seguro de que
lo sea, aunque el reloj tenga texto tipo "WATER RESIST" impreso en la esfera
de fábrica). Anunciar una característica falsa puede generar reclamos de
clientes y es publicidad engañosa. Ante la duda, describe solo lo que ves
(material, color, tamaño, estilo) y evita promesas de funcionalidad.

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

## Filtros por marca y género

Los botones de filtro ("Marca" y "Género") se generan automáticamente según
los valores de `marca` y `genero` que uses en `js/data.js`. Si agregas una
marca o un género nuevo en algún reloj, el filtro aparece solo, sin que
tengas que tocar el HTML. Los dos filtros se combinan (por ejemplo, "Fossil"
+ "Hombre" muestra solo los relojes Fossil para hombre).

## Carrito de compra

Además de pedir un reloj individual por WhatsApp, quien visite la página
puede armar un carrito con varios relojes y pedirlos todos juntos:

- En cada reloj (tarjeta del catálogo y ventana de detalle) hay dos botones
  independientes: **"Pedir por WhatsApp"** (pide ese reloj solo, como antes)
  y **"Agregar al carrito"** (lo suma al carrito sin salir de la página).
- El ícono del carrito está arriba a la izquierda, junto al nombre de la
  marca, con un número pequeño que muestra cuántos relojes hay agregados.
- Al tocar el ícono se abre el carrito con la lista de relojes elegidos, el
  total sumado, y un botón **"Pedir todo por WhatsApp"** que arma un solo
  mensaje predeterminado con la lista completa (marca, modelo, referencia,
  precio de cada uno) y el total, listo para enviarte.
- Se puede quitar un reloj del carrito con la ✕ de cada fila.

El carrito se guarda con `localStorage` en el navegador de quien visita —
es solo para armar el pedido antes de escribirte, no necesitas hacer nada
para que funcione y no se comparte entre dispositivos.

## Compartir un reloj puntual

En la ventana de detalle de cada reloj hay un botón de compartir (el ícono
de conexiones, arriba a la derecha de la foto). Sirve para que alguien le
mande a un familiar o amigo el enlace directo a ESE reloj, no solo a la
página general:

- En el celular, abre el menú nativo de "Compartir" del sistema (WhatsApp,
  Instagram, correo, etc.) con el enlace ya listo.
- En computador (donde no existe ese menú nativo), copia el enlace al
  portapapeles y el botón muestra un ✓ por un momento para confirmar.
- Quien reciba el enlace y lo abra ve la página con ese reloj ya abierto
  en su ventana de detalle, sin tener que buscarlo en el catálogo.

No requiere configuración: el enlace se arma solo con la referencia del
reloj (por ejemplo `...?reloj=REF-01`).

## Flechas para pasar de un reloj a otro

Dentro de la ventana de detalle hay dos flechas (izquierda/derecha, a los
lados de la foto) para pasar al reloj anterior o siguiente sin cerrar la
ventana y volver a buscarlo en el catálogo. También funciona con las
flechas ← → del teclado en computador.

- Respeta los filtros que tengas activos: si filtraste por "Fossil", las
  flechas solo se mueven entre los relojes Fossil, no entre los 14.
- Da toda la vuelta: desde el último reloj, "siguiente" te lleva de nuevo
  al primero (y viceversa), así nunca hay un callejón sin salida.
- Si solo hay un reloj visible (por ejemplo, una búsqueda muy específica),
  las flechas se ocultan solas porque no habría a dónde ir.

## Panel privado de pedidos y contabilidad (`admin.html`)

Además de la página pública, el sitio incluye un panel privado en
`admin.html` para que registres tus pedidos: nombre del cliente, cédula,
teléfono, correo, lugar de entrega, reloj, **encargado de venta** (Tomás,
Falck o Condia — obligatorio elegir uno), medio de pago, precio de venta,
costo del reloj y estado. Desde ahí puedes:

- Ver estadísticas rápidas (pedidos totales, vendido, **ganancia total**,
  pendientes).
- Registrar un pedido nuevo con un formulario. Si pones el "Costo del
  reloj" (lo que te costó a ti), el panel calcula solo la ganancia de ese
  pedido (precio de venta − costo) y la suma al total. Si vendes la misma
  referencia otra vez, el costo se autocompleta con el que usaste la última
  vez (lo puedes cambiar si varió).
- **Hacer clic en la tarjeta "Ganancia total"** para ver la lista de cada
  venta con costo registrado: foto del reloj, precio, lugar de entrega,
  fecha y la ganancia de esa venta puntual.
- Ver el detalle de cualquier pedido (incluye costo y ganancia) o eliminarlo.
- **Exportar todo a un archivo CSV** que abre directo en Excel (botón
  "Exportar a Excel (CSV)") — así llevas tu contabilidad fuera del navegador.
- **Importar un CSV** para restaurar datos o pasarlos a otro computador.

El campo "Costo" es opcional: si dejas un pedido sin costo, ese pedido no
se cuenta en "Ganancia total" (para no inflar el número), y el panel te
avisa cuántos pedidos le faltan costo.

### Cómo entrar

Abre `admin.html` (por ejemplo `https://tu-usuario.github.io/relojesaaa/admin.html`)
y escribe el código de acceso. El código por defecto está en
`js/admin-config.js` — ábrelo y cámbialo por el que tú quieras, es solo
texto plano en ese archivo.

### Muy importante: esto NO es un sistema con seguridad real

`admin.html` es una página estática más de este mismo sitio (no hay un
servidor tuyo ni una base de datos real detrás). Eso significa:

1. **El código de acceso no es seguridad de verdad.** Cualquiera con
   conocimientos básicos puede ver el código de la página (clic derecho →
   "Ver código fuente") y leer el código de acceso tal cual está escrito en
   `js/admin-config.js`. El candado solo evita que alguien entre por
   accidente si llega a encontrar el link — no protege datos de alguien que
   de verdad se lo proponga.
2. **No compartas el link de `admin.html` públicamente.** No lo pongas en
   Instagram, en el link de WhatsApp que le das a tus clientes, ni en
   ninguna parte visible. Solo tú (y quien tú autorices) debería tener ese
   link.
3. **Los datos viven solo en el navegador donde los escribiste**, guardados
   con una tecnología llamada `localStorage`. Si entras desde el celular,
   esos pedidos NO aparecen automáticamente si luego entras desde el
   computador — son navegadores distintos. Por eso:
   - Exporta a CSV seguido y guarda una copia en Google Drive, tu correo, o
     donde prefieras.
   - Si quieres mover los datos de un dispositivo a otro, expórtalos en uno
     e impórtalos en el otro con el botón "Importar CSV".
   - Si borras los datos del navegador (caché/cookies) o cambias de
     computador sin haber exportado, pierdes lo que no hayas respaldado.
4. **Estás guardando datos personales de tus clientes** (nombre, cédula,
   teléfono, correo, dirección). En Colombia esto lo cubre la Ley de
   Protección de Datos (Habeas Data, Ley 1581 de 2012): en términos
   simples, usa esos datos solo para procesar el pedido, no los compartas
   con terceros sin avisar a tus clientes, y bórralos si un cliente te lo
   pide. Si tu negocio crece mucho, en algún momento vale la pena migrar
   esto a una herramienta con una base de datos y seguridad real (por
   ejemplo, una app con backend, o incluso una hoja de Google Sheets
   compartida solo contigo) — este panel es un punto de partida simple y
   gratuito, no la solución definitiva.

Si en algún momento quieres algo con seguridad real (usuarios con
contraseña de verdad, base de datos en la nube, copias de seguridad
automáticas), avísame y armamos ese siguiente paso — requiere un servicio
adicional (no alcanza con GitHub Pages solo), pero es totalmente posible.
