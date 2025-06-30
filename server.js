const express = require('express')
const cors = require('cors')
const fs = require('fs')
const path = require('path')

const app = express()
const PORT = 3210

app.use(cors())
app.use(express.json())

// Cargar dinámicamente todas las rutas desde la carpeta routes
const routesPath = path.join(__dirname, 'routes')

fs.readdirSync(routesPath).forEach((file) => {
  const route = require(path.join(routesPath, file))
  const routeName = file.replace('.routes.js', '')
  app.use(`/api/${routeName}`, route)
})

// Iniciar servidor
app.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`)
})