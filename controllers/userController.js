/**
 * @file userController.js
 * @description Controlador para manejar las operaciones relacionadas con el usuario:
 * registro de nuevo usuario, obtención por ID (desde JWT o por parámetro) y por email (desde token).
 *
 * @module controllers/userController
 */
const bcrypt = require("bcryptjs");
const { client } = require("../db");
const { createUser, saveUserToDatabase } = require("../supabase");

/**
 * Registra un nuevo usuario.
 */
async function handleRegister(req, res) {
  const {
    username_usuario,
    nombre_completo_usuario,
    email_usuario,
    password_usuario,
  } = req.body;

  if (
    !username_usuario ||
    !nombre_completo_usuario ||
    !email_usuario ||
    !password_usuario
  ) {
    return res.status(400).json({ success: false, message: "Faltan datos" });
  }

  try {
    const emailExist = await client.query(
      "SELECT * FROM Usuario WHERE email_usuario = $1",
      [email_usuario]
    );

    if (emailExist.rows.length > 0) {
      return res
        .status(400)
        .json({ success: false, message: "El email ya está registrado" });
    }

    const supabaseResult = await createUser(
      email_usuario,
      password_usuario,
      username_usuario,
      nombre_completo_usuario
    );

    if (!supabaseResult.success) {
      return res
        .status(400)
        .json({ success: false, message: supabaseResult.message });
    }

    const dbResult = await saveUserToDatabase(
      email_usuario,
      username_usuario,
      nombre_completo_usuario,
      password_usuario
    );

    if (!dbResult.success) {
      return res.status(500).json({
        success: false,
        message: "Error al guardar en la base de datos",
      });
    }

    res.json({ success: true, message: "Usuario registrado exitosamente." });
  } catch (error) {
    console.error("Error en register:", error.message);
    res.status(500).json({ success: false, message: "Error interno" });
  }
}

/**
 * Obtiene un usuario por ID (desde token o parámetro).
 */
async function getUserById(req, res) {
  const id_usuario = req.params.id_usuario || req.user?.id_usuario;

  try {
    const result = await client.query(
      "SELECT id_usuario, username_usuario, nombre_completo_usuario, email_usuario FROM Usuario WHERE id_usuario = $1",
      [id_usuario]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: "Usuario no encontrado" });
    }

    const user = result.rows[0];
    res.json(user);
  } catch (error) {
    res.status(500).json({
      message: "Error al obtener los datos del usuario",
    });
  }
}

/**
 * Obtiene un usuario por su email.
 */
async function getUserByEmail(req, res) {
  const { email_usuario } = req.params;

  try {
    const result = await client.query(
      "SELECT id_usuario, username_usuario, nombre_completo_usuario, email_usuario FROM Usuario WHERE email_usuario = $1",
      [email_usuario]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: "Usuario no encontrado" });
    }

    const user = result.rows[0];
    res.json(user);
  } catch (error) {
    res.status(500).json({
      message: "Error al obtener los datos del usuario",
    });
  }
}

/**
 * Edita los datos del usuario, excepto la contraseña.
 */
async function editUser(req, res) {
  const { username_usuario, nombre_completo_usuario, email_usuario } = req.body;
  const id_usuario = req.params.id_usuario;

  if (
    !id_usuario ||
    !username_usuario ||
    !nombre_completo_usuario ||
    !email_usuario
  ) {
    return res.status(400).json({ code: 400, message: "Faltan datos" });
  }

  try {
    const userExist = await client.query(
      "SELECT * FROM Usuario WHERE id_usuario = $1",
      [id_usuario]
    );

    if (userExist.rows.length === 0) {
      return res
        .status(404)
        .json({ code: 404, message: "Usuario no encontrado" });
    }

    const result = await client.query(
      `UPDATE Usuario 
       SET username_usuario = $1, nombre_completo_usuario = $2, email_usuario = $3, fecha_actualizacion_usuario = NOW()
       WHERE id_usuario = $4`,
      [username_usuario, nombre_completo_usuario, email_usuario, id_usuario]
    );

    if (result.rowCount === 0) {
      return res
        .status(400)
        .json({ code: 400, message: "No se pudo actualizar el usuario" });
    }

    res.json({ code: 200, message: "Usuario actualizado correctamente" });
  } catch (error) {
    console.error("Error en editUser:", error.message);
    res.status(500).json({ code: 500, message: "Error interno" });
  }
}

/**
 * Cambia la contraseña del usuario.
 */
async function changePassword(req, res) {
  const id_usuario = req.params.id_usuario;
  const { current_password, new_password } = req.body;

  if (!id_usuario || !current_password || !new_password) {
    return res.status(400).json({ code: 400, message: "Faltan datos" });
  }

  try {
    const userQuery = await client.query(
      "SELECT password_usuario FROM Usuario WHERE id_usuario = $1",
      [id_usuario]
    );

    if (userQuery.rows.length === 0) {
      return res
        .status(404)
        .json({ code: 404, message: "Usuario no encontrado" });
    }

    const hashedPassword = userQuery.rows[0].password_usuario;
    const isMatch = await bcrypt.compare(current_password, hashedPassword);

    if (!isMatch) {
      return res
        .status(401)
        .json({ code: 401, message: "Contraseña actual incorrecta" });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedNewPassword = await bcrypt.hash(new_password, salt);

    const updateResult = await client.query(
      `UPDATE Usuario 
       SET password_usuario = $1, fecha_actualizacion_usuario = NOW()
       WHERE id_usuario = $2`,
      [hashedNewPassword, id_usuario]
    );

    if (updateResult.rowCount === 0) {
      return res
        .status(400)
        .json({ code: 400, message: "No se pudo cambiar la contraseña" });
    }

    res.json({ code: 200, message: "Contraseña cambiada correctamente" });
  } catch (error) {
    console.error("Error en changePassword:", error.message);
    res.status(500).json({ code: 500, message: "Error interno" });
  }
}

module.exports = {
  handleRegister,
  getUserById,
  getUserByEmail,
  editUser,
  changePassword,
};
