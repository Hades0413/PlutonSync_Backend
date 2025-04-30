// Carga las variables de entorno desde un archivo .env en el proyecto
require("dotenv").config();

// Importación de dependencias principales
const express = require("express");
const cors = require("cors");
const cookieParser = require("cookie-parser");

// Importación de archivos internos
const { conectarBaseDeDatos } = require("./db"); // Función para conectar a la base de datos
const authRoutes = require("./routes/authRoutes"); // Rutas relacionadas a autenticación
const userRoutes = require("./routes/userRoutes"); // Rutas relacionadas a gestión de usuarios

// Inicialización de la aplicación Express
const app = express();

// Puerto de escucha, configurable por variable de entorno
const PORT = process.env.PORT || 3000;

/**
 * 🛡️ Middleware de seguridad y configuración
 */

// Configuración de CORS para permitir el acceso desde el frontend
// con envío de cookies entre dominios
app.use(
  cors({
    origin: process.env.ORIGIN, // Debe coincidir con el dominio del frontend
    credentials: true, // Permite el uso de cookies en peticiones cross-origin
  })
);

// Middleware para parsear el cuerpo de las solicitudes en formato JSON
app.use(express.json());

// Middleware para parsear cookies en las solicitudes
app.use(cookieParser());

/**
 * 🔀 Rutas de la API agrupadas por funcionalidad
 */

// Rutas de autenticación (login, registro, logout, etc.)
app.use("/api/auth", authRoutes);

// Rutas relacionadas a usuarios (perfil, actualización, etc.)
app.use("/api/user", userRoutes);

/**
 * ✅ Validación de variables de entorno requeridas
 * Esto asegura que las variables críticas estén definidas antes de ejecutar el servidor
 */
const requiredEnvVars = ["DATABASE_URL", "JWT_SECRET"];
requiredEnvVars.forEach((key) => {
  if (!process.env[key]) {
    console.error(
      `❌ Error: Falta la variable de entorno '${key}'. Verifica tu archivo .env.`
    );
    process.exit(1); // Detiene la ejecución del servidor si falta una variable obligatoria
  }
});

/**
 * 🚀 Inicialización del servidor
 * Se conecta a la base de datos antes de comenzar a escuchar peticiones
 */
conectarBaseDeDatos()
  .then(() => {
    app.listen(PORT, () => {
      console.log(`🚀 Servidor escuchando en http://localhost:${PORT}`);
    });
  })
  .catch((error) => {
    console.error("❌ Error al conectar al servidor:");
    console.error(`  Mensaje: ${error.message}`);
    process.exit(1); // Finaliza el proceso si hay un error de conexión
  });
