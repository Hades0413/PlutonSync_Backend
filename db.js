/**
 * Configuración y conexión a la base de datos PostgreSQL utilizando Supabase.
 *
 * Este módulo establece una conexión segura a la base de datos mediante la URL proporcionada
 * en las variables de entorno. Es compatible con el uso de SSL, lo cual es requerido por
 * plataformas como Supabase.
 */

require("dotenv").config(); // Cargar variables de entorno desde un archivo .env
const { Client } = require("pg"); // Importa el cliente de PostgreSQL

// 🔗 Crear una nueva instancia del cliente PostgreSQL
// Se usa la variable de entorno DATABASE_URL para obtener la cadena de conexión
const client = new Client({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false, // ⚠️ Desactiva la verificación estricta del certificado SSL
    // Útil para conexiones con Supabase o certificados auto-firmados
  },
});

/**
 * Establece la conexión a la base de datos PostgreSQL.
 *
 * @returns {Promise<Client>} Una promesa que se resuelve con el cliente de la base de datos conectado.
 * @throws {Error} Lanza un error si la conexión falla.
 */
async function conectarBaseDeDatos() {
  try {
    await client.connect(); // Intentar la conexión
    console.log(
      "✅ Conexión exitosa a la base de datos PostgreSQL en Supabase (Session Pooler)."
    );
    return client;
  } catch (error) {
    console.error("❌ Error al conectar a la base de datos:", error.message);
    throw error; // Relanza el error para que sea manejado por el servidor principal
  }
}

// Exporta tanto la función de conexión como el cliente directamente
module.exports = {
  conectarBaseDeDatos,
  client,
};
