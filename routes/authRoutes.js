/**
 * @file authRoutes.js
 * @description Define las rutas relacionadas con la autenticación de usuario.
 * Incluye las rutas para iniciar sesión, registrar un usuario y cerrar sesión.
 * Estas rutas son manejadas por funciones exportadas desde el controlador `authController`.
 * 
 * @module routes/authRoutes
 */

const express = require("express");

// Importamos los controladores que manejarán las peticiones a estas rutas.
const {
  handleLogin,    // Función para manejar el inicio de sesión de un usuario.
  handleRegister, // Función para manejar el registro de un nuevo usuario.
  handleLogout,   // Función para manejar el cierre de sesión de un usuario.
} = require("../controllers/authController");

// Creamos una instancia del enrutador de Express.
const router = express.Router();

/**
 * @route POST /login
 * @description Ruta para el inicio de sesión del usuario.
 * Recibe las credenciales (email y contraseña) y devuelve un token JWT si la autenticación es exitosa.
 * @access Public
 */
router.post("/login", handleLogin);

/**
 * @route POST /register
 * @description Ruta para registrar un nuevo usuario.
 * Recibe los datos del usuario (username, nombre completo, email y contraseña) y crea un nuevo registro.
 * @access Public
 */
router.post("/register", handleRegister);

/**
 * @route POST /logout
 * @description Ruta para cerrar sesión del usuario.
 * Elimina el token JWT de las cookies del cliente, invalidando la sesión actual.
 * @access Private (requiere que el usuario esté autenticado)
 */
router.post("/logout", handleLogout);

// Exportamos las rutas para que puedan ser usadas en otros archivos.
module.exports = router;
