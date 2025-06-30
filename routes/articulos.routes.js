const express = require('express')
const fs = require('fs')
const path = require('path')

const router = express.Router()
const bdPath = path.join(__dirname, '../articulos.json')

// Función para generar un artículo aleatorio
function generarArticuloAleatorio() {
  const titulos = ['React', 'Vue', 'Angular', 'Svelte', 'Next.js']
  const tipos = ['frontend', 'backend', 'fullstack']
  const slug = Math.random().toString(36).substring(2, 8)

  return {
    id: Date.now().toString(),
    title: titulos[Math.floor(Math.random() * titulos.length)],
    type: tipos[Math.floor(Math.random() * tipos.length)],
    slug: slug,
    icon: `https://api.iconify.design/logos:${slug}.svg`,
    contenido: []
  }
}

// Ruta GET para listar artículos
router.get('/all', (req, res) => {
  try {
    const data = fs.existsSync(bdPath)
      ? JSON.parse(fs.readFileSync(bdPath, 'utf8'))
      : []

    res.json(data)
  } catch (error) {
    console.error('Error al listar:', error)
    res.status(500).json({ mensaje: 'Error al leer los artículos' })
  }
})

// Ruta GET para guardar un artículo aleatorio
router.get('/guardar', (req, res) => {
  const nuevoArticulo = generarArticuloAleatorio()
  console.log('Nuevo artículo generado:', nuevoArticulo)

  try {
    const contenidoActual = fs.existsSync(bdPath)
      ? JSON.parse(fs.readFileSync(bdPath, 'utf8'))
      : []

    contenidoActual.push(nuevoArticulo)

    fs.writeFileSync(bdPath, JSON.stringify(contenidoActual, null, 2), 'utf8')

    res.status(201).json({
      mensaje: 'Artículo aleatorio guardado correctamente ✅',
      articulo: nuevoArticulo
    })
  } catch (error) {
    console.error('Error al guardar:', error)
    res.status(500).json({ mensaje: 'Error al guardar el artículo' })
  }
})

module.exports = router