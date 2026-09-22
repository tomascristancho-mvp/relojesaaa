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
 */
const WATCHES = [
  {
    id: 1,
    referencia: "REF-01",
    marca: "Fossil",
    genero: "Hombre",
    nombre: "Clásico Esfera Blanca",
    precio: 70000,
    descripcion: "Caja en acero negro con esfera blanca y numeración árabe, correa de silicona negra. Un diseño atemporal para uso diario.",
    imagen: "images/watches/reloj-01.jpg",
  },
  {
    id: 2,
    referencia: "REF-02",
    marca: "Q&Q",
    genero: "Mujer",
    nombre: "Mesh Plata Minimalista",
    precio: 70000,
    descripcion: "Caja pequeña en acero plateado con esfera negra y correa de malla milanesa. Resistente al agua, ideal para uso diario.",
    imagen: "images/watches/reloj-02.jpg",
  },
  {
    id: 3,
    referencia: "REF-03",
    marca: "Tommy Hilfiger",
    genero: "Mujer",
    nombre: "Mesh Plata Cristales",
    precio: 70000,
    descripcion: "Esfera blanca con detalles en cristal y correa de malla milanesa plateada. Un toque elegante y femenino para el día a día.",
    imagen: "images/watches/reloj-03.jpg",
  },
  {
    id: 4,
    referencia: "REF-04",
    marca: "Diesel",
    genero: "Hombre",
    nombre: "Diver Esfera Crema",
    precio: 70000,
    descripcion: "Caja robusta con bisel giratorio negro, esfera crema con manecillas azules y correa de caucho negro. Estilo deportivo tipo buceo.",
    imagen: "images/watches/reloj-04.jpg",
  },
  {
    id: 5,
    referencia: "REF-05",
    marca: "Casio",
    genero: "Hombre",
    nombre: "Bisel Dorado Octagonal",
    precio: 70000,
    descripcion: "Caja negra con bisel octagonal dorado y esfera texturizada, incluye calendario. Un diseño llamativo que combina lo deportivo con lo elegante.",
    imagen: "images/watches/reloj-05.jpg",
  },

  // Aún faltan 9 relojes por agregar. Cuando Tomás mande las fotos y los
  // datos restantes, se agregan aquí con la misma estructura de arriba.
];
