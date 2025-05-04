// Cargar variables de entorno desde .env
require("dotenv").config();

// Dependencias principales
const express = require("express");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const helmet = require("helmet");
const rateLimit = require("express-rate-limit");

// Archivos internos
const { conectarBaseDeDatos } = require("./db");
const authRoutes = require("./routes/authRoutes");
const userRoutes = require("./routes/userRoutes");

const app = express();
const PORT = process.env.PORT || 3000;

/**
 * 🛡️ Seguridad y configuración de middleware
 */
app.disable("x-powered-by"); // Elimina el header X-Powered-By
app.use(helmet()); // Cabeceras de seguridad por defecto

// Política de seguridad de contenido (CSP)
app.use(
  helmet.contentSecurityPolicy({
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", "https://trusted.cdn.com"],
      styleSrc: ["'self'", "https://trusted.cdn.com"],
      imgSrc: ["'self'", "data:"],
      connectSrc: ["'self'"],
      fontSrc: [
        "'self'",
        "https://fonts.googleapis.com",
        "https://fonts.gstatic.com",
      ],
      objectSrc: ["'none'"],
      frameAncestors: ["'self'"],
      upgradeInsecureRequests: [],
    },
  })
);

// Cabeceras adicionales
app.use((req, res, next) => {
  res.setHeader("X-Permitted-Cross-Domain-Policies", "none");
  res.setHeader("Cache-Control", "no-store");
  next();
});

// Limitador de tasa
/*
app.use(
  rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutos
    max: 100, // máximo de 100 peticiones por IP
    message: "Demasiadas solicitudes, intenta más tarde.",
    standardHeaders: true,
    legacyHeaders: false,
  })
);
*/

// CORS con envío de cookies
app.use(
  cors({
    origin: process.env.ORIGIN || "http://localhost:5173",
    credentials: true,
  })
);

// Parseadores de cuerpo y cookies
app.use(express.json({ limit: "10kb" }));
app.use(cookieParser());

/**
 * 🔀 Rutas agrupadas
 */
app.use("/api/auth", authRoutes);
app.use("/api/user", userRoutes);

/**
 * ✅ Verificación de variables .env requeridas
 */
["DATABASE_URL", "JWT_SECRET"].forEach((key) => {
  if (!process.env[key]) {
    console.error(`❌ Falta la variable de entorno '${key}'.`);
    process.exit(1);
  }
});

/**
 * 🚀 Inicio del servidor tras conexión exitosa a la base de datos
 */
conectarBaseDeDatos()
  .then(() => {
    app.listen(PORT, () => {
      console.log(`🚀 Servidor corriendo en http://localhost:${PORT}`);
    });
  })
  .catch((err) => {
    console.error("❌ Error al conectar a la base de datos:", err.message);
    process.exit(1);
  });
