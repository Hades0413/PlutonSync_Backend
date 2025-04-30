const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const { client } = require("../db");
const { createUser, saveUserToDatabase } = require("../supabase");

// Se obtienen las variables de entorno necesarias para JWT
const JWT_SECRET = process.env.JWT_SECRET;
const JWT_EXPIRATION = "1h"; // La duración del token JWT es de 1 hora

/**
 * Maneja la solicitud de inicio de sesión (login) del usuario.
 * Verifica si el usuario existe en la base de datos, si la contraseña es correcta
 * y genera un token JWT para mantener la sesión del usuario.
 *
 * @param {Object} req - El objeto de solicitud de Express.
 * @param {Object} res - El objeto de respuesta de Express.
 * @returns {Object} Respuesta con el estado del inicio de sesión y los datos del usuario si es exitoso.
 */
async function handleLogin(req, res) {
  const { email, password } = req.body;

  // Validación de campos requeridos
  if (!email || !password)
    return res.status(400).json({ success: false, message: "Faltan datos" });

  try {
    // Consultamos la base de datos para obtener el usuario con el correo electrónico proporcionado
    const result = await client.query(
      "SELECT * FROM Usuario WHERE email_usuario = $1",
      [email]
    );

    // Si no se encuentra el usuario, respondemos con un error 404
    if (result.rows.length === 0)
      return res
        .status(404)
        .json({ success: false, message: "Usuario no encontrado" });

    const user = result.rows[0];

    // Comparamos la contraseña proporcionada con la almacenada en la base de datos
    const isMatch = await bcrypt.compare(password, user.password_usuario);
    if (!isMatch)
      return res
        .status(401)
        .json({ success: false, message: "Contraseña incorrecta" });

    // Si las credenciales son correctas, generamos un token JWT
    const token = jwt.sign(
      { id: user.id_usuario, email: user.email_usuario },
      JWT_SECRET,
      { expiresIn: JWT_EXPIRATION }
    );

    // Enviamos el token en una cookie segura
    res.cookie("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production", // Sólo en producción se asegura la cookie
      sameSite: "Strict",
      maxAge: 3600000, // El token expirará en 1 hora
    });

    // Respondemos con los datos del usuario y un mensaje de éxito
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
    // Si ocurre un error, respondemos con un error 500
    console.error("Error en login:", error.message);
    res.status(500).json({ success: false, message: "Error interno" });
  }
}

/**
 * Maneja la solicitud de registro de un nuevo usuario.
 * Verifica si el correo electrónico ya está registrado, crea al usuario en Supabase
 * y guarda los datos del usuario en la base de datos.
 *
 * @param {Object} req - El objeto de solicitud de Express.
 * @param {Object} res - El objeto de respuesta de Express.
 * @returns {Object} Respuesta con el estado del registro y un mensaje si es exitoso.
 */
async function handleRegister(req, res) {
  const { username, nombre_completo, email, password } = req.body;

  // Validación de campos requeridos
  if (!username || !nombre_completo || !email || !password)
    return res.status(400).json({ success: false, message: "Faltan datos" });

  try {
    // Verificamos si el correo electrónico ya está registrado en la base de datos
    const emailExist = await client.query(
      "SELECT * FROM Usuario WHERE email_usuario = $1",
      [email]
    );
    if (emailExist.rows.length > 0)
      return res
        .status(400)
        .json({ success: false, message: "El email ya está registrado" });

    // Si el correo no está registrado, creamos el usuario en Supabase
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

    // Guardamos los datos del usuario en la base de datos
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

    // Respondemos con un mensaje de éxito
    res.json({ success: true, message: "Usuario registrado exitosamente." });
  } catch (error) {
    // Si ocurre un error, respondemos con un error 500
    console.error("Error en register:", error.message);
    res.status(500).json({ success: false, message: "Error interno" });
  }
}

/**
 * Maneja la solicitud de cierre de sesión (logout).
 * Elimina el token JWT de las cookies, cerrando así la sesión del usuario.
 *
 * @param {Object} req - El objeto de solicitud de Express.
 * @param {Object} res - El objeto de respuesta de Express.
 * @returns {Object} Respuesta indicando que la sesión fue cerrada correctamente.
 */
function handleLogout(req, res) {
  // Eliminamos el token de las cookies para cerrar la sesión
  res.clearCookie("token", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production", // Sólo en producción se asegura la cookie
    sameSite: "Strict",
  });

  // Respondemos con un mensaje de éxito
  res.json({ success: true, message: "Sesión cerrada correctamente" });
}

// Exportamos las funciones para que puedan ser utilizadas en las rutas
module.exports = {
  handleLogin,
  handleRegister,
  handleLogout,
};
