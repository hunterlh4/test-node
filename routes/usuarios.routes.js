const express = require('express')
const fs = require('fs')
const path = require('path')
const bcrypt = require('bcrypt')

const router = express.Router()
const usuariosPath = path.join(__dirname, '../usuarios.json')

// Ruta POST para login de usuario
router.post('/login', async (req, res) => {
  const { nombre, clave } = req.body

  if (!nombre || !clave) {
    return res.status(400).json({
      success: false,
      data: null,
      mensaje: 'Faltan campos: nombre o clave'
    })
  }

  try {
    const usuarios = fs.existsSync(usuariosPath)
      ? JSON.parse(fs.readFileSync(usuariosPath, 'utf8'))
      : []

    const usuario = usuarios.find(u => u.nombre === nombre)

    if (!usuario) {
      return res.status(404).json({
        success: false,
        data: null,
        mensaje: 'Usuario no encontrado'
      })
    }

    const claveValida = await bcrypt.compare(clave, usuario.clave)

    if (!claveValida) {
      return res.status(401).json({
        success: false,
        data: null,
        mensaje: 'Clave incorrecta'
      })
    }

    res.json({
      success: true,
      data: {
        id: usuario.id,
        nombre: usuario.nombre,
        foto: usuario.foto
      },
      mensaje: 'Login exitoso'
    })
  } catch (error) {
    console.error('Error al logear:', error)
    res.status(500).json({
      success: false,
      data: null,
      mensaje: 'Error interno al hacer login'
    })
  }
})

module.exports = router