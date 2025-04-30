const express = require("express");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const { client } = require("../db");
const { createUser, saveUserToDatabase } = require("../supabase");

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET;
const JWT_EXPIRATION = "1h";

// Login
router.post("/login", async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password)
    return res.status(400).json({ success: false, message: "Faltan datos" });

  try {
    const result = await client.query(
      "SELECT * FROM Usuario WHERE email_usuario = $1",
      [email]
    );
    if (result.rows.length === 0)
      return res
        .status(404)
        .json({ success: false, message: "Usuario no encontrado" });

    const user = result.rows[0];
    const isMatch = await bcrypt.compare(password, user.password_usuario);
    if (!isMatch)
      return res
        .status(401)
        .json({ success: false, message: "Contraseña incorrecta" });

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
    res.status(500).json({ success: false, message: "Error interno" });
  }
});

// Register
router.post("/register", async (req, res) => {
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
      return res
        .status(500)
        .json({
          success: false,
          message: "Error al guardar en la base de datos",
        });

    res.json({ success: true, message: "Usuario registrado exitosamente." });
  } catch (error) {
    console.error("Error en register:", error.message);
    res.status(500).json({ success: false, message: "Error interno" });
  }
});

// Logout
router.post("/logout", (req, res) => {
  res.clearCookie("token", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "Strict",
  });

  res.json({ success: true, message: "Sesión cerrada correctamente" });
});

module.exports = router;
