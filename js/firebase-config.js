/**
 * Configuración de tu proyecto de Firebase (la base de datos compartida
 * donde viven los pedidos, para que Tomás, Falck y Condia vean siempre
 * lo mismo desde cualquier dispositivo).
 *
 * ESTE ES EL ÚNICO ARCHIVO QUE DEBES EDITAR para conectar el panel a tu
 * propio proyecto real. Los valores de abajo son de ejemplo y no
 * funcionan -- reemplázalos por los de tu proyecto:
 *
 * 1. Ve a https://console.firebase.google.com/ y crea un proyecto
 *    gratis (botón "Agregar proyecto"). Puedes desactivar Google
 *    Analytics, no se necesita.
 * 2. Dentro del proyecto, en la página principal, haz clic en el ícono
 *    "</>" (Web) para agregar una app web. Ponle un apodo cualquiera
 *    y NO marques "Configurar también Firebase Hosting".
 * 3. Firebase te muestra un bloque de código con `firebaseConfig = {...}`
 *    -- copia esos valores aquí abajo, reemplazando cada "CAMBIA_ESTO".
 * 4. En el menú de la izquierda, entra a "Authentication" → pestaña
 *    "Sign-in method" → activa "Correo electrónico/contraseña".
 *    Luego en la pestaña "Users", crea una cuenta para cada uno de
 *    los 3 (correo + contraseña) -- esas son las que usarán para
 *    entrar al panel desde aquí en adelante.
 * 5. En el menú de la izquierda, entra a "Firestore Database" → "Crear
 *    base de datos" → elige la ubicación más cercana (por ejemplo
 *    southamerica-east1) → modo "producción".
 * 6. Dentro de Firestore, pestaña "Reglas", borra lo que hay y pega el
 *    contenido completo del archivo `firestore.rules` de este mismo
 *    proyecto, luego "Publicar". Esto es lo que de verdad protege los
 *    datos (sin esto, cualquiera con el link podría leer o borrar
 *    pedidos aunque no haya iniciado sesión).
 *
 * Ninguno de estos valores es secreto -- Firebase los diseñó para vivir
 * en el código del navegador sin problema. Lo que de verdad protege tus
 * datos son las reglas del paso 6 y las cuentas del paso 4.
 */
export const firebaseConfig = {
  apiKey: "CAMBIA_ESTO",
  authDomain: "CAMBIA_ESTO.firebaseapp.com",
  projectId: "CAMBIA_ESTO",
  storageBucket: "CAMBIA_ESTO.appspot.com",
  messagingSenderId: "CAMBIA_ESTO",
  appId: "CAMBIA_ESTO",
};
