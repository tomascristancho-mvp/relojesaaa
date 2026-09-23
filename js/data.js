/**
 * CONFIGURACIÓN DEL NEGOCIO
 * Edita estos valores con tu información real antes de publicar la página.
 */
const CONFIG = {
  // Nombre de tu marca (aparece en el logo, el título de la pestaña y los mensajes de WhatsApp)
  businessName: "Altitude Watch Co.",

  // Frase corta que describe el negocio (aparece debajo del logo)
  tagline: "Relojes con altura.",

  // Tu número de WhatsApp en formato internacional SIN signos ni espacios.
  whatsappNumber: "573027167144",

  // Ciudad donde estás ubicado
  city: "Bogotá",

  // Usuario de Instagram (opcional). Déjalo vacío ("") si no quieres mostrarlo.
  instagram: "",

  // Correo de contacto (opcional). Déjalo vacío ("") si no quieres mostrarlo.
  email: "tomascristanchoo@gmail.com",
};

/**
 * CATÁLOGO DE RELOJES
 * Cada objeto es un reloj. Edita marca, genero, precio, descripcion e imagen
 * con tus datos reales.
 *
 * - referencia: código interno para identificar el reloj (no es el código de fábrica).
 * - marca: se usa para el filtro "Marca".
 * - genero: "Hombre", "Mujer" o "Unisex". Se usa para el filtro "Género".
 * - precio: número en pesos colombianos (ej: 70000) o null si prefieres "Escríbenos por el precio".
 * - imagen: ruta al archivo de la foto (ej: "images/watches/reloj-01.jpg").
 * - disponible (opcional): pon `disponible: false` para que ese reloj deje
 *   de aparecer en la página pública (catálogo, búsqueda y enlaces
 *   compartidos) sin borrar sus datos. Si no lo agregas, se asume
 *   disponible: true. Úsalo solo cuando una venta ya esté 100% concretada
 *   (ver "Marcar un reloj como agotado" en el README) -- el panel de
 *   pedidos NO actualiza esto por sí solo, porque los pedidos que guardas
 *   ahí viven únicamente en el navegador donde los registraste, no están
 *   conectados con esta página pública.
 */
const WATCHES = [
  {
    id: 1,
    referencia: "REF-01",
    marca: "Fossil",
    genero: "Hombre",
    nombre: "Clásico Esfera Blanca",
    precio: 60000,
    descripcion: "Caja en acero negro, esfera blanca con numeración árabe y correa de silicona bien cómoda para todo el día. Un clásico que nunca falla, para la oficina o la calle.",
    imagen: "images/watches/reloj-01.jpg",
  },
  {
    id: 2,
    referencia: "REF-02",
    marca: "Q&Q",
    genero: "Mujer",
    nombre: "Mesh Plata Minimalista",
    precio: 60000,
    descripcion: "Caja pequeña en acero plateado, esfera negra y correa de malla milanesa que se ajusta solita a la muñeca. Minimalista y fácil de combinar, para el día a día.",
    imagen: "images/watches/reloj-02.jpg",
  },
  {
    id: 3,
    referencia: "REF-03",
    marca: "Tommy Hilfiger",
    genero: "Mujer",
    nombre: "Mesh Plata Cristales",
    precio: 60000,
    descripcion: "Esfera blanca con detalles en cristal y correa de malla milanesa plateada. Ese toque elegante y femenino que no se ve forzado en el día a día.",
    imagen: "images/watches/reloj-03.jpg",
  },
  {
    id: 4,
    referencia: "REF-04",
    marca: "Diesel",
    genero: "Hombre",
    nombre: "Diver Esfera Crema",
    precio: 65000,
    descripcion: "Caja robusta con bisel giratorio negro, esfera crema y manecillas azules que le dan personalidad. Correa de caucho negro, con ese estilo deportivo tipo buceo.",
    imagen: "images/watches/reloj-04.jpg",
  },
  {
    id: 5,
    referencia: "REF-05",
    marca: "Casio",
    genero: "Hombre",
    nombre: "Bisel Dorado Octagonal",
    precio: 60000,
    descripcion: "Caja negra con bisel octagonal dorado y esfera texturizada, con calendario incluido. Llamativo sin pasarse -- mezcla lo deportivo con un toque elegante.",
    imagen: "images/watches/reloj-05.jpg",
  },

  {
    id: 6,
    referencia: "REF-06",
    marca: "Q&Q",
    genero: "Hombre",
    nombre: "Deportivo Esfera Negra",
    precio: 55000,
    descripcion: "Caja y esfera en negro total, con numeración blanca y correa de caucho. Liviano y fácil de combinar, el reloj que te pones sin pensarlo mucho.",
    imagen: "images/watches/reloj-06.jpg",
  },
  {
    id: 7,
    referencia: "REF-07",
    marca: "Q&Q",
    genero: "Mujer",
    nombre: "Bracelet Perlado",
    precio: 55000,
    descripcion: "Esfera blanca nacarada con índices minimalistas y un brazalete metálico bien delgado en plata. Delicado sin ser exagerado, para cualquier día.",
    imagen: "images/watches/reloj-07.jpg",
  },
  {
    id: 8,
    referencia: "REF-08",
    marca: "Q&Q",
    genero: "Hombre",
    nombre: "Clásico Calendario",
    precio: 60000,
    descripcion: "Caja plateada, esfera negra y un calendario que de verdad se usa. Brazalete metálico resistente -- clásico y versátil, sirve para todo.",
    imagen: "images/watches/reloj-08.jpg",
  },
  {
    id: 9,
    referencia: "REF-09",
    marca: "Fossil",
    genero: "Hombre",
    nombre: "Diver Azul Medianoche",
    precio: 65000,
    descripcion: "Bisel giratorio numerado y esfera azul medianoche -- casi se ve negra hasta que le pega la luz y ahí sí se nota el azul. Correa de caucho negro, con ese toque deportivo tipo buceo.",
    imagen: "images/watches/reloj-09.jpg",
  },
  {
    id: 10,
    referencia: "REF-10",
    marca: "Casio",
    genero: "Unisex",
    nombre: "Digital Retro Acero",
    precio: 55000,
    descripcion: "El digital de toda la vida: pantalla LCD, alarma, cronómetro y brazalete de acero plateado. Un ícono que nunca pasa de moda.",
    imagen: "images/watches/reloj-10.jpg",
  },

  {
    id: 11,
    referencia: "REF-11",
    marca: "Tommy Hilfiger",
    genero: "Hombre",
    nombre: "Clásico Esfera Crema",
    precio: 65000,
    descripcion: "Caja negra con esfera crema, numeración árabe y correa de caucho. Un clásico con un toque cálido que se ve bien sin esforzarse.",
    imagen: "images/watches/reloj-11.jpg",
  },
  {
    id: 12,
    referencia: "REF-12",
    marca: "Tissot",
    genero: "Hombre",
    nombre: "Cronógrafo Rosa y Azul",
    precio: 65000,
    descripcion: "Cronógrafo con esfera rosa, subesferas azules y bisel taquímetro -- para el que quiere un reloj que llame la atención. Brazalete metálico y calendario incluidos.",
    imagen: "images/watches/reloj-12.jpg",
  },
  {
    id: 13,
    referencia: "REF-13",
    marca: "Casio",
    genero: "Unisex",
    nombre: "Digital Retro Dorado",
    precio: 55000,
    descripcion: "El mismo digital de siempre pero en dorado, con pantalla LCD, alarma y cronómetro. Ese brillito extra que le sube el nivel a cualquier look.",
    imagen: "images/watches/reloj-13.jpg",
  },
  {
    id: 14,
    referencia: "REF-14",
    marca: "Tommy Hilfiger",
    genero: "Mujer",
    nombre: "Cristales Nácar",
    precio: 65000,
    descripcion: "Esfera blanca nacarada con detalles en cristal y brazalete plateado. Para esos días en que quieres verte arreglada sin complicarte.",
    imagen: "images/watches/reloj-14.jpg",
  },
];
