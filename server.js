const express = require("express");
const cors = require("cors");
const fs = require("fs");
const path = require("path");
const morgan = require("morgan");
const app = express();
const PORT = 3210;

app.use(cors());
app.use(express.json());
app.use(morgan("dev"));
app.use(express.static(path.join(__dirname, "public")));
// Cargar dinámicamente todas las rutas desde la carpeta routes
const routesPath = path.join(__dirname, "routes");

fs.readdirSync(routesPath).forEach((file) => {
  const route = require(path.join(routesPath, file));
  const routeName = file.replace(".routes.js", "");
  app.use(`/api/${routeName}`, route);
});

app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

// Iniciar servidor
app.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`);
});
