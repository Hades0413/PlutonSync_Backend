const { createClient } = require("@supabase/supabase-js");
const { client } = require("./db");
const bcrypt = require("bcryptjs");

// Conexión a Supabase
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_ANON_KEY
);

// Función para registrar en Supabase Auth
async function createUser(email, password, username, nombre_completo) {
  try {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          username,
          nombre_completo,
        },
      },
    });

    if (error) {
      return { success: false, message: error.message };
    }

    return {
      success: true,
      message:
        "Usuario registrado en Supabase. Revisa tu correo para confirmar tu cuenta.",
    };
  } catch (error) {
    return { success: false, message: error.message };
  }
}

// Función para guardar en PostgreSQL
async function saveUserToDatabase(email, username, nombre_completo, password) {
  try {
    const hashedPassword = await bcrypt.hash(password, 10);

    const query = `
      INSERT INTO Usuario (username_usuario, nombre_completo_usuario, email_usuario, password_usuario)
      VALUES ($1, $2, $3, $4)
      RETURNING id_usuario, email_usuario
    `;

    const result = await client.query(query, [
      username,
      nombre_completo,
      email,
      hashedPassword,
    ]);

    const user = result.rows[0];

    return {
      success: true,
      message: "Usuario registrado correctamente en la base de datos.",
      user,
    };
  } catch (error) {
    return { success: false, message: error.message };
  }
}

module.exports = {
  createUser,
  saveUserToDatabase,
};
