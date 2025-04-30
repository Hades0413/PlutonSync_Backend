const express = require("express");
const { getUserByEmail } = require("../controllers/userController");
const { authMiddleware } = require("../middlewares/authMiddleware");

const router = express.Router();

// Ruta protegida para obtener información del usuario mediante email
router.get("/listar-email", authMiddleware, getUserByEmail);

module.exports = router;
