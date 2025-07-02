const express = require("express");
const fs = require("fs");
const path = require("path");

const router = express.Router();
const bdPath = path.join(__dirname, "../articulos.json");

const generarSlug = (texto) => {
  return texto.toLowerCase().replace(/\s+/g, "-");
};

const getNuevoId = (data) => {
  const ids = data.map((a) => parseInt(a.id));
  return (Math.max(0, ...ids) + 1).toString();
};

// Ruta GET para listar artículos
router.get("/getAll", (req, res) => {
  try {
    const data = fs.existsSync(bdPath)
      ? JSON.parse(fs.readFileSync(bdPath, "utf8"))
      : [];

    const categorias = data.map(({ id, title, type, icon, publicacion }) => ({
      id,
      title,
      type,
      icon,
      total: Array.isArray(publicacion) ? publicacion.length : 0
    }));

    res.json({
      success: true,
      data: categorias,
      mensaje: "Artículos obtenidos correctamente"
    });
  } catch (error) {
    console.error("Error al listar:", error);
    res.status(500).json({
      success: false,
      data: [],
      mensaje: "Error al leer los artículos"
    });
  }
});

// Ruta GET para guardar un artículo aleatorio
router.post("/save", (req, res) => {
  const { title, type, icon } = req.body;

  if (!title || !type || !icon) {
    return res.status(400).json({
      success: false,
      data: null,
      mensaje: "Faltan campos obligatorios: title, type o icon"
    });
  }

  try {
    const contenidoActual = fs.existsSync(bdPath)
      ? JSON.parse(fs.readFileSync(bdPath, "utf8"))
      : [];

    const nuevoArticulo = {
      id: getNuevoId(contenidoActual),
      title,
      type,
      slug: generarSlug(title),
      icon,
      publicacion: []
    };

    contenidoActual.push(nuevoArticulo);

    fs.writeFileSync(bdPath, JSON.stringify(contenidoActual, null, 2), "utf8");

    res.status(201).json({
      success: true,
      data: nuevoArticulo,
      mensaje: "Artículo guardado correctamente"
    });
  } catch (error) {
    console.error("Error al guardar:", error);
    res.status(500).json({
      success: false,
      data: null,
      mensaje: "Error al guardar el artículo"
    });
  }
});

router.post("/edit", (req, res) => {
  const { id, title, type, icon } = req.body;

  if (!id || !title || !type || !icon) {
    return res.status(400).json({
      success: false,
      data: null,
      mensaje: "Faltan campos obligatorios: id, title, type o icon"
    });
  }

  try {
    const contenidoActual = fs.existsSync(bdPath)
      ? JSON.parse(fs.readFileSync(bdPath, "utf8"))
      : [];

    const index = contenidoActual.findIndex((a) => a.id === id);

    if (index === -1) {
      return res.status(404).json({
        success: false,
        data: null,
        mensaje: "Artículo no encontrado"
      });
    }

    contenidoActual[index].title = title;
    contenidoActual[index].type = type;
    contenidoActual[index].slug = generarSlug(title);
    contenidoActual[index].icon = icon;

    fs.writeFileSync(bdPath, JSON.stringify(contenidoActual, null, 2), "utf8");

    res.json({
      success: true,
      data: contenidoActual[index],
      mensaje: "Artículo editado correctamente"
    });
  } catch (error) {
    console.error("Error al editar:", error);
    res.status(500).json({
      success: false,
      data: null,
      mensaje: "Error al editar el artículo"
    });
  }
});

router.get("/getBySlug/:slug", (req, res) => {
  const { slug } = req.params;

  try {
    const data = fs.existsSync(bdPath)
      ? JSON.parse(fs.readFileSync(bdPath, "utf8"))
      : [];

    const articulo = data.find((a) => a.slug === slug);

    if (!articulo) {
      return res.status(404).json({
        success: false,
        data: null,
        mensaje: `No se encontró un artículo con el slug "${slug}"`
      });
    }

    // Clonar artículo excluyendo contenido de cada publicación
    const articuloSinContenido = {
      ...articulo,
      publicacion: (articulo.publicacion || []).map((pub) => ({
        id: pub.id,
        titulo: pub.titulo,
        descripcion: pub.descripcion,
        slug: pub.slug,
        tags: pub.tags,
        fecha: pub.fecha,
        author: pub.author,
        authorSlug: pub.authorSlug,
        authorImage: pub.authorImage
      }))
    };

    res.json({
      success: true,
      data: articuloSinContenido,
      mensaje: `Artículo con slug "${slug}" encontrado correctamente`
    });
  } catch (error) {
    console.error("Error al buscar por slug:", error);
    res.status(500).json({
      success: false,
      data: null,
      mensaje: "Error al buscar el artículo"
    });
  }
});
module.exports = router;
