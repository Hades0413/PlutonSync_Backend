const express = require("express");
const cors = require("cors");
const rateLimit = require("express-rate-limit");
const { handleLogin, handleLogout } = require("../controllers/authController");

const router = express.Router();

// Limitador de tasa específico para login
const loginRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 5, // solo 5 intentos por IP
  message: "Demasiadas solicitudes de inicio de sesión, intenta más tarde.",
  standardHeaders: true,
  legacyHeaders: false,
});

/**
 * @route POST /login
 * @description Inicia sesión, devuelve un token JWT si es exitoso.
 * @access Public
 */
router.post("/login", loginRateLimiter, handleLogin);

/**
 * @route POST /logout
 * @description Cierra sesión del usuario eliminando el token JWT.
 * @access Private
 */
router.post("/logout", handleLogout);

module.exports = router;
