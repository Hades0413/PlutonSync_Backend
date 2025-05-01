/**
 * @file authRoutes.js
 * @description Define las rutas relacionadas con la autenticación del usuario: login y logout.
 *
 * @module routes/authRoutes
 */

const express = require("express");
const { handleLogin, handleLogout } = require("../controllers/authController");

const router = express.Router();

/**
 * @route POST /login
 * @description Inicia sesión, devuelve un token JWT si es exitoso.
 * @access Public
 */
router.post("/login", handleLogin);

/**
 * @route POST /logout
 * @description Cierra sesión del usuario eliminando el token JWT.
 * @access Private
 */
router.post("/logout", handleLogout);

module.exports = router;
