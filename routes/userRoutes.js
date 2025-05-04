/**
 * @file userRoutes.js
 * @description Define las rutas relacionadas con la gestión del usuario.
 * Incluye registro, obtención del usuario autenticado, obtención por ID, 
 * edición de usuario y cambio de contraseña.
 *
 * @module routes/userRoutes
 */

const express = require("express");
const {
  handleRegister,
  getUserByEmail,
  getUserById,
  editUser,
  changePassword,
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
 * @route GET /listar-id/:id_usuario
 * @description Devuelve los datos del usuario autenticado (si no se pasa id) o cualquier usuario (si se pasa id).
 * @access Private
 */
router.get("/listar-id/:id_usuario", authMiddleware, getUserById);

/**
 * @route GET /listar-email/:email_usuario
 * @description Devuelve los datos del usuario autenticado usando su email (desde JWT).
 * @access Private
 */
router.get("/listar-email/:email_usuario", authMiddleware, getUserByEmail);

/**
 * @route PUT /edit/:id_usuario
 * @description Edita los datos del usuario (username, nombre completo, y email).
 * @access Private
 */
router.put("/edit/:id_usuario", authMiddleware, editUser);

/**
 * @route PUT /change-password/:id_usuario
 * @description Cambia solo la contraseña del usuario.
 * @access Private
 */
router.put("/change-password/:id_usuario", authMiddleware, changePassword);

module.exports = router;
