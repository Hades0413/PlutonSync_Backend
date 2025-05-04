/**
 * @file userRoutes.js
 * @description Define las rutas relacionadas con la gestión del usuario.
 * Incluye registro, obtención del usuario autenticado y obtención por ID.
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
 * @route GET /listar-id/:id
 * @description Devuelve los datos del usuario autenticado (si no se pasa id) o cualquier usuario (si se pasa id).
 * @access Private
 */
router.get("/listar-id/:id", authMiddleware, getUserById);

/**
 * @route GET /listar-email
 * @description Devuelve los datos del usuario autenticado usando su email (desde JWT).
 * @access Private
 */
router.get("/listar-email", authMiddleware, getUserByEmail);

module.exports = router;
