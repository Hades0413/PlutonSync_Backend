const jwt = require("jsonwebtoken");

// Se obtiene el secreto de JWT desde las variables de entorno
const JWT_SECRET = process.env.JWT_SECRET;

/**
 * Middleware para verificar el token JWT presente en las cookies.
 * Este middleware asegura que la solicitud contiene un token JWT válido en las cookies.
 * Si el token es válido, se añade la información del usuario decodificada a `req.user`.
 * Si no es válido, se envía una respuesta de error (401 - No autorizado).
 *
 * @param {Object} req - El objeto de solicitud de Express.
 * @param {Object} res - El objeto de respuesta de Express.
 * @param {Function} next - La función que pasa el control al siguiente middleware o ruta.
 *
 * @returns {Object} Si el token es inválido o no está presente, responde con un código de estado 401 y un mensaje de error.
 * Si el token es válido, se pasa al siguiente middleware o ruta.
 */
function authMiddleware(req, res, next) {
  // Extraemos el token JWT desde el encabezado 'Authorization'
  const token = req.headers['authorization']?.split(' ')[1];  // Se espera que sea "Bearer <token>"

  // Si no se encuentra un token, se devuelve un error de acceso no autorizado
  if (!token) {
    return res
      .status(401)
      .json({ success: false, message: "Acceso no autorizado: Token no encontrado" });
  }

  try {
    // Verificamos el token utilizando el secreto JWT
    const decoded = jwt.verify(token, JWT_SECRET);

    // Si el token es válido, almacenamos la información decodificada en `req.user`
    req.user = decoded;

    // Pasamos el control al siguiente middleware o ruta
    next();
  } catch (error) {
    // Si el token es inválido o ha expirado, respondemos con un error 401
    let errorMessage = "Token inválido o expirado";
    if (error.name === "TokenExpiredError") {
      errorMessage = "Token ha expirado";
    }

    return res
      .status(401)
      .json({ success: false, message: errorMessage });
  }
}


// Exportamos el middleware para que pueda ser utilizado en otras partes de la aplicación
module.exports = { authMiddleware };
