/**
 * @file userRoutes.js
 * @description Define las rutas relacionadas con la gestión del usuario.
 * Incluye registro y obtención de datos del usuario autenticado.
 *
 * @module routes/userRoutes
 */

const express = require("express");
const {
  handleRegister,
  getUserByEmail,
  getUserById,
} = require("../controllers/userController");
const { authMiddleware } = require("../middlewares/authMiddleware");

const router = express.Router();

/**
 * @route POST /register
 * @description Registra un nuevo usuario.
 * @access Public
 */
router.post("/register", handleRegister);

/**
 * @route GET /listar-id
 * @description Devuelve los datos del usuario autenticado usando su id_usuario (desde JWT).
 * @access Private
 */
router.get("/listar-id", authMiddleware, getUserById); // Nueva ruta para obtener datos por id

/**
 * @route GET /listar-email
 * @description Devuelve los datos del usuario autenticado usando su email (desde JWT).
 * @access Private
 */
router.get("/listar-id/:id", authMiddleware, getUserByEmail);

module.exports = router;
