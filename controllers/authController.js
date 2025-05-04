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
function validarEntradas(email_usuario, password_usuario) {
  const errores = [];

  if (!email_usuario || !validator.isEmail(email_usuario)) {
    errores.push("Correo electrónico inválido");
  }

  if (!password_usuario || password_usuario.length < 12) {
    errores.push("La contraseña debe tener al menos 12 caracteres");
  }

  return errores;
}

async function handleLogin(req, res) {
  const { email_usuario, password_usuario } = req.body;

  const errores = validarEntradas(email_usuario, password_usuario);
  if (errores.length > 0) {
    return res
      .status(400)
      .json({ success: false, message: errores.join(", ") });
  }

  try {
    const result = await client.query(
      "SELECT * FROM Usuario WHERE email_usuario = $1",
      [email_usuario]
    );

    if (result.rows.length === 0) {
      return res
        .status(404)
        .json({ success: false, message: "Usuario no encontrado" });
    }

    const user = result.rows[0];
    const isMatch = await bcrypt.compare(
      password_usuario,
      user.password_usuario
    );

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
      secure: process.env.NODE_ENV === "production",
      sameSite: "Strict",
      maxAge: 3600000,
    });

    res.status(201).json({
      code: 201,
      message: "Login exitoso",
    });
  } catch (error) {
    console.error("Error en login:", error.message);
    const mensajeError =
      process.env.NODE_ENV === "production" ? "Error interno" : error.message;

    res.status(500).json({ success: false, message: mensajeError });
  }
}

function handleLogout(req, res) {
  try {
    // Invalida la cookie del token estableciendo una expiración en el pasado
    res.cookie("token", "", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "Strict",
      expires: new Date(0), // Fuerza expiración inmediata
    });

    // Limpia el storage del navegador
    res.setHeader("Clear-Site-Data", '"cookies", "storage", "cache"');

    res.status(200).json({
      success: true,
      message: "Sesión cerrada correctamente",
    });
  } catch (error) {
    console.error("Error al cerrar sesión:", error.message);
    res.status(500).json({
      success: false,
      message: "Error al cerrar sesión",
    });
  }
}

module.exports = {
  handleLogin,
  handleLogout,
};
