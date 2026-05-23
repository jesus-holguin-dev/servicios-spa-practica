// src/controllers/catalogo.controller.js
import serviciosService from "../services/servicios.service.js";

export const obtenerCatalogo = async (req, res) => {
  try {
    const lista = await serviciosService.listarCatalogo();
    res.json(lista); // ← devolver DIRECTO el arreglo para el Mall
  } catch (e) {
    console.error("Error en obtenerCatalogo:", e);
    res.status(500).json({ error: "Error al obtener catálogo" });
  }
};
