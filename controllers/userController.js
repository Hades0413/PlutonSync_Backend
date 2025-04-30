const { client } = require("../db");

/**
 * Controlador para obtener información del usuario autenticado por email.
 * Utiliza el email decodificado del token JWT.
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

    res.json({
      success: true,
      user: {
        id_usuario: user.id_usuario,
        username_usuario: user.username_usuario,
        nombre_completo_usuario: user.nombre_completo_usuario,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error al obtener los datos del usuario",
    });
  }
}

module.exports = { getUserByEmail };
