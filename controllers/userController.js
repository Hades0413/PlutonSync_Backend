/**
 * @file userController.js
 * @description Controlador para manejar las operaciones relacionadas con el usuario:
 * registro de nuevo usuario, obtención por ID (desde JWT o por parámetro) y por email (desde token).
 *
 * @module controllers/userController
 */

const { client } = require("../db");
const { createUser, saveUserToDatabase } = require("../supabase");

/**
 * Registra un nuevo usuario.
 */
async function handleRegister(req, res) {
  const { username, nombre_completo, email, password } = req.body;

  if (!username || !nombre_completo || !email || !password)
    return res.status(400).json({ success: false, message: "Faltan datos" });

  try {
    const emailExist = await client.query(
      "SELECT * FROM Usuario WHERE email_usuario = $1",
      [email]
    );

    if (emailExist.rows.length > 0)
      return res
        .status(400)
        .json({ success: false, message: "El email ya está registrado" });

    const supabaseResult = await createUser(
      email,
      password,
      username,
      nombre_completo
    );

    if (!supabaseResult.success)
      return res
        .status(400)
        .json({ success: false, message: supabaseResult.message });

    const dbResult = await saveUserToDatabase(
      email,
      username,
      nombre_completo,
      password
    );

    if (!dbResult.success)
      return res.status(500).json({
        success: false,
        message: "Error al guardar en la base de datos",
      });

    res.json({ success: true, message: "Usuario registrado exitosamente." });
  } catch (error) {
    console.error("Error en register:", error.message);
    res.status(500).json({ success: false, message: "Error interno" });
  }
}

async function getUserById(req, res) {
  // Usa el ID del parámetro si existe; si no, usa el del JWT
  const id = req.params.id || req.user.id_usuario;

  try {
    const result = await client.query(
      "SELECT id_usuario, username_usuario, nombre_completo_usuario FROM Usuario WHERE id_usuario = $1",
      [id]
    );

    if (result.rows.length === 0) {
      return res
        .status(404)
        .json({ success: false, message: "Usuario no encontrado" });
    }

    const user = result.rows[0];
    res.json({ success: true, user });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error al obtener los datos del usuario",
    });
  }
}

/**
 * Devuelve datos del usuario autenticado usando su email del token JWT.
 */
async function getUserByEmail(req, res) {
  const { email } = req.user;

  try {
    const result = await client.query(
      "SELECT id_usuario, username_usuario, nombre_completo_usuario FROM Usuario WHERE email_usuario = $1",
      [email]
    );

    if (result.rows.length === 0) {
      return res
        .status(404)
        .json({ success: false, message: "Usuario no encontrado" });
    }

    const user = result.rows[0];
    res.json({ success: true, user });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error al obtener los datos del usuario",
    });
  }
}

module.exports = {
  handleRegister,
  getUserById,
  getUserByEmail,
};
