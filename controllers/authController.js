/**
 * @file authController.js
 * @description Controlador de autenticación: login y logout.
 *
 * @module controllers/authController
 */

const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const { client } = require("../db");
const validator = require("validator");

const JWT_SECRET = process.env.JWT_SECRET;
const JWT_EXPIRATION = "1h";

// Función para validar el formato del correo y la longitud de la contraseña
function validarEntradas(email, password) {
  const errores = [];

  // Validación de correo electrónico
  if (!email || !validator.isEmail(email)) {
    errores.push("Correo electrónico inválido");
  }

  // Validación de contraseña
  if (!password || password.length < 12) {
    errores.push("La contraseña debe tener al menos 12 caracteres");
  }

  return errores;
}

async function handleLogin(req, res) {
  const { email, password } = req.body;

  // Validar entradas
  const errores = validarEntradas(email, password);
  if (errores.length > 0) {
    return res
      .status(400)
      .json({ success: false, message: errores.join(", ") });
  }

  try {
    const result = await client.query(
      "SELECT * FROM Usuario WHERE email_usuario = $1",
      [email]
    );

    if (result.rows.length === 0) {
      return res
        .status(404)
        .json({ success: false, message: "Usuario no encontrado" });
    }

    const user = result.rows[0];
    const isMatch = await bcrypt.compare(password, user.password_usuario);

    if (!isMatch) {
      return res
        .status(401)
        .json({ success: false, message: "Contraseña incorrecta" });
    }

    const token = jwt.sign(
      { id: user.id_usuario, email: user.email_usuario },
      JWT_SECRET,
      { expiresIn: JWT_EXPIRATION }
    );

    res.cookie("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production", // solo en producción
      sameSite: "Strict",
      maxAge: 3600000, // 1 hora
    });

    res.json({
      success: true,
      user: {
        id: user.id_usuario,
        nombre: user.nombre_completo_usuario,
        email: user.email_usuario,
      },
      message: "Login exitoso",
    });
  } catch (error) {
    console.error("Error en login:", error.message);
    // Evitar exponer detalles del error en producción
    const mensajeError =
      process.env.NODE_ENV === "production" ? "Error interno" : error.message;

    res.status(500).json({ success: false, message: mensajeError });
  }
}

function handleLogout(req, res) {
  try {
    res.clearCookie("token", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "Strict",
    });

    res.setHeader("Clear-Site-Data", '"cookies", "storage", "cache"');
    res.json({ success: true, message: "Sesión cerrada correctamente" });
  } catch (error) {
    console.error("Error al cerrar sesión:", error.message);
    res.status(500).json({ success: false, message: "Error al cerrar sesión" });
  }
}

module.exports = {
  handleLogin,
  handleLogout,
};
