const express = require("express");
const fs = require("fs");
const path = require("path");
const bcrypt = require("bcrypt");

const router = express.Router();
const usuariosPath = path.join(__dirname, "../usuarios.json");

// Ruta POST para login de usuario
router.post("/login", async (req, res) => {
  const { nombre, clave } = req.body;

  if (!nombre || !clave) {
    return res.status(400).json({
      success: false,
      data: null,
      mensaje: "Faltan campos: nombre o clave"
    });
  }

  try {
    const usuarios = fs.existsSync(usuariosPath)
      ? JSON.parse(fs.readFileSync(usuariosPath, "utf8"))
      : [];

    const usuario = usuarios.find((u) => u.nombre === nombre);

    if (!usuario) {
      return res.status(404).json({
        success: false,
        data: null,
        mensaje: "Usuario no encontrado"
      });
    }

    const claveValida = await bcrypt.compare(clave, usuario.clave);

    if (!claveValida) {
      return res.status(401).json({
        success: false,
        data: null,
        mensaje: "Clave incorrecta"
      });
    }

    res.json({
      success: true,
      data: {
        id: usuario.id,
        nombre: usuario.nombre,
        foto: usuario.foto
      },
      mensaje: "Login exitoso"
    });
  } catch (error) {
    console.error("Error al logear:", error);
    res.status(500).json({
      success: false,
      data: null,
      mensaje: "Error interno al hacer login"
    });
  }
});

router.get("/createAdmin", async (req, res) => {
  const nombre = "hunterlh4";
  const clave = "Black1mago.*";

  try {
    // Leer usuarios actuales o inicializar arreglo
    const usuarios = fs.existsSync(usuariosPath)
      ? JSON.parse(fs.readFileSync(usuariosPath, "utf8"))
      : [];

    // Verificar si ya existe
    if (usuarios.find((u) => u.nombre === nombre)) {
      return res.status(400).json({
        success: false,
        mensaje: "El usuario ya existe"
      });
    }

    const hashedClave = await bcrypt.hash(clave, 10);

    const nuevoUsuario = {
      id: Date.now(),
      nombre,
      clave: hashedClave,
      foto: "https://avatars.githubusercontent.com/u/13859221?v=4" // puedes agregar un campo de foto si lo usas
    };

    usuarios.push(nuevoUsuario);

    fs.writeFileSync(usuariosPath, JSON.stringify(usuarios, null, 2), "utf8");

    res.status(201).json({
      success: true,
      mensaje: "Usuario creado correctamente",
      data: {
        id: nuevoUsuario.id,
        nombre: nuevoUsuario.nombre
      }
    });
  } catch (error) {
    console.error("Error al crear usuario:", error);
    res.status(500).json({
      success: false,
      mensaje: "Error interno al crear el usuario"
    });
  }
});

router.post("/create", async (req, res) => {
  const { nombre, clave } = req.body;

  if (!nombre || !clave) {
    return res.status(400).json({
      success: false,
      mensaje: "Faltan campos: nombre o clave"
    });
  }

  try {
    const usuarios = fs.existsSync(usuariosPath)
      ? JSON.parse(fs.readFileSync(usuariosPath, "utf8"))
      : [];

    if (usuarios.find((u) => u.nombre === nombre)) {
      return res.status(400).json({
        success: false,
        mensaje: "El usuario ya existe"
      });
    }

    const hashedClave = await bcrypt.hash(clave, 10);

    const nuevoUsuario = {
      id: Date.now(),
      nombre,
      clave: hashedClave,
      foto: "https://avatars.githubusercontent.com/u/13859221?v=4"
    };

    usuarios.push(nuevoUsuario);
    fs.writeFileSync(usuariosPath, JSON.stringify(usuarios, null, 2), "utf8");

    res.status(201).json({
      success: true,
      mensaje: "Usuario creado correctamente",
      data: {
        id: nuevoUsuario.id,
        nombre: nuevoUsuario.nombre
      }
    });
  } catch (error) {
    console.error("Error al crear usuario:", error);
    res.status(500).json({
      success: false,
      mensaje: "Error interno al crear el usuario"
    });
  }
});

module.exports = router;
