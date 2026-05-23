// src/controllers/categorias.controller.js
import categoriasService from "../services/categorias.service.js";

// GET /api/categorias
export const obtenerCategorias = async (req, res) => {
  try {
    const idTienda = req.query.id_tienda
      ? Number(req.query.id_tienda)
      : 2; // id de tu SPA

    const lista = await categoriasService.listarCategorias(idTienda);
    res.json(lista);
  } catch (e) {
    console.error("Error en obtenerCategorias:", e);
    res.status(500).json({ error: "Error al obtener categorías" });
  }
};

// GET /api/categorias/:idCategoria/servicios
export const obtenerServiciosDeCategoria = async (req, res) => {
  try {
    const idCategoria = Number(req.params.idCategoria);
    if (!idCategoria) {
      return res
        .status(400)
        .json({ error: "idCategoria es obligatorio y debe ser numérico" });
    }

    const idTienda = req.query.id_tienda
      ? Number(req.query.id_tienda)
      : 2;

    const servicios =
      await categoriasService.listarServiciosPorCategoria(
        idCategoria,
        idTienda
      );

    res.json(servicios);
  } catch (e) {
    console.error("Error en obtenerServiciosDeCategoria:", e);
    res
      .status(500)
      .json({ error: "Error al obtener servicios de la categoría" });
  }
};
