/**
 * CONFIGURACIÓN DEL NEGOCIO
 * Edita estos valores con tu información real antes de publicar la página.
 */
const CONFIG = {
  // Nombre de tu marca (aparece en el logo, el título de la pestaña y los mensajes de WhatsApp)
  businessName: "Tu Marca de Relojes",

  // Frase corta que describe el negocio (aparece debajo del logo)
  tagline: "Relojes para cada estilo",

  // Tu número de WhatsApp en formato internacional SIN signos ni espacios.
  // Ejemplo Colombia: 57 + tu número a 10 dígitos => "573001234567"
  whatsappNumber: "573000000000",

  // Ciudad donde estás ubicado
  city: "Bogotá",

  // Usuario de Instagram (opcional). Déjalo vacío ("") si no quieres mostrarlo.
  instagram: "",

  // Correo de contacto (opcional). Déjalo vacío ("") si no quieres mostrarlo.
  email: "",
};

/**
 * CATÁLOGO DE RELOJES
 * Cada objeto es un reloj. Edita referencia, nombre, categoria, precio, descripcion
 * e imagen con tus datos reales.
 *
 * - precio: número en pesos colombianos (ej: 120000) o null si prefieres "Escríbenos por el precio".
 * - imagen: ruta al archivo de la foto (ej: "images/watches/reloj-01.jpg").
 *   Si lo dejas en null, se muestra una imagen de referencia temporal.
 * - categoria: úsala para los filtros del catálogo. Puedes usar las que ya existen
 *   (Clásico, Deportivo, Minimalista, Elegante) o crear las tuyas.
 */
const WATCHES = [
  {
    id: 1,
    referencia: "REF-01",
    nombre: "Modelo Onix",
    categoria: "Clásico",
    precio: null,
    descripcion: "Diseño atemporal con caja metálica y correa de cuero, ideal para uso diario y ocasiones formales.",
    imagen: null,
  },
  {
    id: 2,
    referencia: "REF-02",
    nombre: "Modelo Vértice",
    categoria: "Deportivo",
    precio: null,
    descripcion: "Resistente al agua, correa de caucho y carátula de alto contraste para actividad física.",
    imagen: null,
  },
  {
    id: 3,
    referencia: "REF-03",
    nombre: "Modelo Nórdico",
    categoria: "Minimalista",
    precio: null,
    descripcion: "Líneas limpias, esfera simple y correa delgada. Pensado para quienes prefieren la sobriedad.",
    imagen: null,
  },
  {
    id: 4,
    referencia: "REF-04",
    nombre: "Modelo Aurora",
    categoria: "Elegante",
    precio: null,
    descripcion: "Detalles dorados y carátula nacarada, perfecto para complementar looks de noche.",
    imagen: null,
  },
  {
    id: 5,
    referencia: "REF-05",
    nombre: "Modelo Meridiano",
    categoria: "Clásico",
    precio: null,
    descripcion: "Caja redonda de acero con subesferas funcionales, un básico que nunca pasa de moda.",
    imagen: null,
  },
  {
    id: 6,
    referencia: "REF-06",
    nombre: "Modelo Pulso",
    categoria: "Deportivo",
    precio: null,
    descripcion: "Cronógrafo digital con luz nocturna y correa ajustable, pensado para el día a día activo.",
    imagen: null,
  },
  {
    id: 7,
    referencia: "REF-07",
    nombre: "Modelo Lino",
    categoria: "Minimalista",
    precio: null,
    descripcion: "Correa de malla milanesa y caja delgada, combina con cualquier atuendo sin esfuerzo.",
    imagen: null,
  },
  {
    id: 8,
    referencia: "REF-08",
    nombre: "Modelo Cobre",
    categoria: "Elegante",
    precio: null,
    descripcion: "Tonos cobrizos y bisel biselado, una pieza para destacar en cualquier reunión.",
    imagen: null,
  },
  {
    id: 9,
    referencia: "REF-09",
    nombre: "Modelo Andes",
    categoria: "Clásico",
    precio: null,
    descripcion: "Correa de cuero genuino y caja robusta, inspirado en los diseños de siempre.",
    imagen: null,
  },
  {
    id: 10,
    referencia: "REF-10",
    nombre: "Modelo Circuito",
    categoria: "Deportivo",
    precio: null,
    descripcion: "Diseño técnico con indicadores de alto contraste, ideal para entrenamientos y outdoor.",
    imagen: null,
  },
  {
    id: 11,
    referencia: "REF-11",
    nombre: "Modelo Bruma",
    categoria: "Minimalista",
    precio: null,
    descripcion: "Esfera mate y correa de silicona, pensado para un uso cómodo durante todo el día.",
    imagen: null,
  },
  {
    id: 12,
    referencia: "REF-12",
    nombre: "Modelo Reina",
    categoria: "Elegante",
    precio: null,
    descripcion: "Caja pequeña con incrustaciones brillantes, un diseño delicado para uso femenino.",
    imagen: null,
  },
  {
    id: 13,
    referencia: "REF-13",
    nombre: "Modelo Roble",
    categoria: "Clásico",
    precio: null,
    descripcion: "Combinación de correa café y detalles plateados, versátil para oficina y ciudad.",
    imagen: null,
  },
  {
    id: 14,
    referencia: "REF-14",
    nombre: "Modelo Nova",
    categoria: "Deportivo",
    precio: null,
    descripcion: "Caja grande y correa deportiva, pensado para quienes buscan un estilo llamativo.",
    imagen: null,
  },
];
