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
 * - imagenes360 (opcional): arreglo de fotos para la vista 360° (ver README).
 */
const WATCHES = [
  {
    id: 1,
    referencia: "REF-01",
    marca: "Fossil",
    genero: "Hombre",
    nombre: "Clásico Esfera Blanca",
    precio: 60000,
    descripcion: "Caja en acero negro con esfera blanca y numeración árabe, correa de silicona negra. Un diseño atemporal para uso diario.",
    imagen: "images/watches/reloj-01.jpg",
  },
  {
    id: 2,
    referencia: "REF-02",
    marca: "Q&Q",
    genero: "Mujer",
    nombre: "Mesh Plata Minimalista",
    precio: 60000,
    descripcion: "Caja pequeña en acero plateado con esfera negra y correa de malla milanesa. Un diseño minimalista ideal para uso diario.",
    imagen: "images/watches/reloj-02.jpg",
  },
  {
    id: 3,
    referencia: "REF-03",
    marca: "Tommy Hilfiger",
    genero: "Mujer",
    nombre: "Mesh Plata Cristales",
    precio: 60000,
    descripcion: "Esfera blanca con detalles en cristal y correa de malla milanesa plateada. Un toque elegante y femenino para el día a día.",
    imagen: "images/watches/reloj-03.jpg",
    imagenes360: [
      "images/watches/reloj-03-01.jpg",
      "images/watches/reloj-03-02.jpg",
      "images/watches/reloj-03-03.jpg",
      "images/watches/reloj-03-04.jpg",
      "images/watches/reloj-03-05.jpg",
      "images/watches/reloj-03-06.jpg",
      "images/watches/reloj-03-07.jpg",
      "images/watches/reloj-03-08.jpg",
      "images/watches/reloj-03-09.jpg",
      "images/watches/reloj-03-10.jpg",
      "images/watches/reloj-03-11.jpg",
      "images/watches/reloj-03-12.jpg",
      "images/watches/reloj-03-13.jpg",
      "images/watches/reloj-03-14.jpg",
      "images/watches/reloj-03-15.jpg",
      "images/watches/reloj-03-16.jpg",
      "images/watches/reloj-03-17.jpg",
      "images/watches/reloj-03-18.jpg",
      "images/watches/reloj-03-19.jpg",
      "images/watches/reloj-03-20.jpg",
      "images/watches/reloj-03-21.jpg",
      "images/watches/reloj-03-22.jpg",
      "images/watches/reloj-03-23.jpg",
      "images/watches/reloj-03-24.jpg",
      "images/watches/reloj-03-25.jpg",
      "images/watches/reloj-03-26.jpg",
      "images/watches/reloj-03-27.jpg",
      "images/watches/reloj-03-28.jpg",
    ],
  },
  {
    id: 4,
    referencia: "REF-04",
    marca: "Diesel",
    genero: "Hombre",
    nombre: "Diver Esfera Crema",
    precio: 60000,
    descripcion: "Caja robusta con bisel giratorio negro, esfera crema con manecillas azules y correa de caucho negro. Estilo deportivo tipo buceo.",
    imagen: "images/watches/reloj-04.jpg",
  },
  {
    id: 5,
    referencia: "REF-05",
    marca: "Casio",
    genero: "Hombre",
    nombre: "Bisel Dorado Octagonal",
    precio: 60000,
    descripcion: "Caja negra con bisel octagonal dorado y esfera texturizada, incluye calendario. Un diseño llamativo que combina lo deportivo con lo elegante.",
    imagen: "images/watches/reloj-05.jpg",
  },

  {
    id: 6,
    referencia: "REF-06",
    marca: "Q&Q",
    genero: "Hombre",
    nombre: "Deportivo Esfera Negra",
    precio: 60000,
    descripcion: "Caja y esfera en negro total con numeración blanca y correa de caucho. Liviano y fácil de combinar con cualquier outfit.",
    imagen: "images/watches/reloj-06.jpg",
  },
  {
    id: 7,
    referencia: "REF-07",
    marca: "Q&Q",
    genero: "Mujer",
    nombre: "Bracelet Perlado",
    precio: 60000,
    descripcion: "Esfera blanca nacarada con índices minimalistas y brazalete metálico delgado en tono plata. Un diseño delicado para el día a día.",
    imagen: "images/watches/reloj-07.jpg",
  },
  {
    id: 8,
    referencia: "REF-08",
    marca: "Q&Q",
    genero: "Hombre",
    nombre: "Clásico Calendario",
    precio: 60000,
    descripcion: "Caja plateada con esfera negra, calendario y brazalete metálico robusto. Un diseño clásico y versátil.",
    imagen: "images/watches/reloj-08.jpg",
  },
  {
    id: 9,
    referencia: "REF-09",
    marca: "Fossil",
    genero: "Hombre",
    nombre: "Diver Negro Total",
    precio: 60000,
    descripcion: "Caja negra con bisel giratorio numerado, esfera texturizada y correa de caucho negro. Estilo deportivo tipo buceo, todo en negro.",
    imagen: "images/watches/reloj-09.jpg",
  },
  {
    id: 10,
    referencia: "REF-10",
    marca: "Casio",
    genero: "Unisex",
    nombre: "Digital Retro Acero",
    precio: 60000,
    descripcion: "Diseño digital clásico con pantalla LCD, alarma, cronómetro y brazalete de acero plateado. Un ícono atemporal que nunca pasa de moda.",
    imagen: "images/watches/reloj-10.jpg",
  },

  {
    id: 11,
    referencia: "REF-11",
    marca: "Tommy Hilfiger",
    genero: "Hombre",
    nombre: "Clásico Esfera Crema",
    precio: 60000,
    descripcion: "Caja negra con esfera crema y numeración árabe, correa de caucho negro. Un diseño clásico con un toque cálido.",
    imagen: "images/watches/reloj-11.jpg",
  },
  {
    id: 12,
    referencia: "REF-12",
    marca: "Tissot",
    genero: "Hombre",
    nombre: "Cronógrafo Rosa y Azul",
    precio: 60000,
    descripcion: "Cronógrafo con esfera rosa, subesferas azules y bisel taquímetro, brazalete metálico y calendario. Un diseño llamativo entre lo deportivo y lo elegante.",
    imagen: "images/watches/reloj-12.jpg",
  },
  {
    id: 13,
    referencia: "REF-13",
    marca: "Casio",
    genero: "Unisex",
    nombre: "Digital Retro Dorado",
    precio: 60000,
    descripcion: "Diseño digital clásico en tono dorado, con pantalla LCD, alarma, cronómetro y brazalete de acero. Un ícono atemporal en versión dorada.",
    imagen: "images/watches/reloj-13.jpg",
  },
  {
    id: 14,
    referencia: "REF-14",
    marca: "Tommy Hilfiger",
    genero: "Mujer",
    nombre: "Cristales Nácar",
    precio: 60000,
    descripcion: "Esfera blanca nacarada con detalles en cristal y brazalete metálico plateado. Un diseño femenino y elegante para looks especiales.",
    imagen: "images/watches/reloj-14.jpg",
  },
];
