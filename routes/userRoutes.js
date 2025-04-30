const express = require("express");
const jwt = require("jsonwebtoken");
const { client } = require("../db");

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET;

// Middleware para verificar el token JWT desde cookies
function authMiddleware(req, res, next) {
  const token = req.cookies.token;
  if (!token)
    return res
      .status(401)
      .json({ success: false, message: "Acceso no autorizado" });

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    return res
      .status(401)
      .json({ success: false, message: "Token inválido o expirado" });
  }
}

// Ruta protegida: obtener info de usuario por email
router.get("/listar-email", authMiddleware, async (req, res) => {
  const { email } = req.user;

  try {
    const result = await client.query(
      "SELECT id_usuario, username_usuario, nombre_completo_usuario FROM Usuario WHERE email_usuario = $1",
      [email]
    );

    if (result.rows.length === 0)
      return res
        .status(404)
        .json({ success: false, message: "Usuario no encontrado" });

    const user = result.rows[0];
    res.json({
      success: true,
      user: {
        id_usuario: user.id_usuario,
        username_usuario: user.username_usuario,
        nombre_completo_usuario: user.nombre_completo_usuario,
      },
    });
  } catch (error) {
    console.error("Error en listar-email:", error.message);
    res
      .status(500)
      .json({
        success: false,
        message: "Error al obtener los datos del usuario",
      });
  }
});

module.exports = router;
