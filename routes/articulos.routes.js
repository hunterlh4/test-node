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

router.get("/filterPublicaciones", (req, res) => {
  const {
    type,
    title,
    query,
    // author,
    sortBy,
    order = "asc",
    limit = 2,
    page = 1
  } = req.query;

  try {
    const data = fs.existsSync(bdPath)
      ? JSON.parse(fs.readFileSync(bdPath, "utf8"))
      : [];

    let publicaciones = [];

    // Aplanar todas las publicaciones (sin incluir el campo "contenido")
    data.forEach((categoria) => {
      if (Array.isArray(categoria.publicacion)) {
        categoria.publicacion.forEach((pub) => {
          const { contenido, links, ...resto } = pub; // eliminar contenido
          publicaciones.push({
            ...resto,
            categoryTitle: categoria.title,
            categoryType: categoria.type
            // categorySlug: categoria.slug
          });
        });
      }
    });

    // Filtros
    if (type) {
      publicaciones = publicaciones.filter(
        (p) => p.categoryType.toLowerCase() === type.toLowerCase()
      );
    }

    if (title) {
      publicaciones = publicaciones.filter((p) =>
        p.categoryTitle.toLowerCase().includes(title.toLowerCase())
      );
    }
    if (query) {
      publicaciones = publicaciones.filter((p) =>
        p.titulo.toLowerCase().includes(query.toLowerCase())
      );
    }

    if (sortBy) {
      publicaciones.sort((a, b) => {
        const valA = (a[sortBy] || "").toString().toLowerCase();
        const valB = (b[sortBy] || "").toString().toLowerCase();
        return order === "desc"
          ? valB.localeCompare(valA)
          : valA.localeCompare(valB);
      });
    }

    const pageInt = parseInt(page);
    const limitInt = parseInt(limit);
    const total = publicaciones.length;
    const startIndex = (pageInt - 1) * limitInt;
    const endIndex = startIndex + limitInt;
    const paginated = publicaciones.slice(startIndex, endIndex);

    res.json({
      success: true,
      mensaje: "Publicaciones filtradas correctamente",
      data: {
        total,
        page: pageInt,
        limit: limitInt,
        totalPages: Math.ceil(total / limitInt),
        data: paginated
      }
    });
  } catch (error) {
    console.error("Error al filtrar publicaciones:", error);
    res.status(500).json({
      success: false,
      data: [],
      mensaje: "Error al procesar las publicaciones"
    });
  }
});

router.get("/getPublicacionBySlug/:slug", (req, res) => {
  const { slug } = req.params;

  try {
    const data = fs.existsSync(bdPath)
      ? JSON.parse(fs.readFileSync(bdPath, "utf8"))
      : [];

    // Aplanar todas las publicaciones y conservar info de categoría
    const publicaciones = [];
    data.forEach((categoria) => {
      if (Array.isArray(categoria.publicacion)) {
        categoria.publicacion.forEach((pub) => {
          publicaciones.push({
            ...pub,
            categoryTitle: categoria.title,
            categoryType: categoria.type,
            categorySlug: categoria.slug
          });
        });
      }
    });

    // Ordenar por fecha ascendente (o lo que tú prefieras)
    publicaciones.sort((a, b) => new Date(a.fecha) - new Date(b.fecha));

    // Buscar la publicación actual por slug exacto
    const index = publicaciones.findIndex((p) => p.slug === `/${slug}`);

    if (index === -1) {
      return res.status(404).json({
        success: false,
        data: null,
        mensaje: `No se encontró la publicación con slug: /${slug}`
      });
    }

    const current = publicaciones[index];
    const prev = publicaciones[index - 1];
    const next = publicaciones[index + 1];

    res.json({
      success: true,
      mensaje: "Publicación encontrada correctamente",
      data: {
        publicacion: current,
        prevSlug: prev?.slug || null,
        nextSlug: next?.slug || null
      }
    });
  } catch (error) {
    console.error("Error al obtener publicación:", error);
    res.status(500).json({
      success: false,
      data: null,
      mensaje: "Error interno al obtener publicación"
    });
  }
});
module.exports = router;
