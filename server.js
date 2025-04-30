require("dotenv").config();
const express = require("express");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const { conectarBaseDeDatos } = require("./db");
const authRoutes = require("./routes/authRoutes");
const userRoutes = require("./routes/userRoutes");

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware: Configurar CORS correctamente para cookies
app.use(
  cors({
    origin: "http://localhost:5173", // 👈 Cambia esto según tu frontend
    credentials: true, // 👈 IMPORTANTE: habilita envío de cookies
  })
);

app.use(express.json());
app.use(cookieParser());

// 📌 Agrupamos las rutas bajo "/api"
app.use("/api/auth", authRoutes);
app.use("/api/user", userRoutes);

// Validación de variables de entorno necesarias
const requiredEnvVars = ["DATABASE_URL", "JWT_SECRET"];
requiredEnvVars.forEach((key) => {
  if (!process.env[key]) {
    console.error(
      `❌ Error: Falta la variable de entorno '${key}'. Verifica tu archivo .env.`
    );
    process.exit(1);
  }
});

// Iniciar servidor
conectarBaseDeDatos()
  .then(() => {
    app.listen(PORT, () => {
      console.log(`🚀 Servidor escuchando en http://localhost:${PORT}`);
    });
  })
  .catch((error) => {
    console.error("❌ Error al conectar al servidor:");
    console.error(`  Mensaje: ${error.message}`);
    process.exit(1);
  });
