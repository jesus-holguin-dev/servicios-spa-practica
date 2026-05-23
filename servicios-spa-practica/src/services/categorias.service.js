// src/services/categorias.service.js
import db from "../db/connection.js";

// ========================
//  CATEGORÍAS
// ========================
async function listarCategorias(idTienda = 2) {
  const [rows] = await db.query(
    `SELECT 
        id_categoria,
        nombre,
        descripcion,
        imagen_url
     FROM categorias_servicio
     WHERE id_tienda = ?
       AND estatus = 'ACTIVA'
     ORDER BY id_categoria`,
    [idTienda]
  );

  // Lo regresamos tal cual, el frontend usa estas propiedades:
  // id_categoria, nombre, descripcion, imagen_url
  return rows;
}

// ========================
//  SERVICIOS POR CATEGORÍA
// ========================
async function listarServiciosPorCategoria(idCategoria, idTienda = 2) {
  const [rows] = await db.query(
    `SELECT
        s.id_servicio AS id,
        s.id_servicio_externo,
        s.nombre,
        s.descripcion,
        s.precio_base,
        s.duracion_minutos
     FROM servicios s
     WHERE s.id_tienda = ?
       AND s.id_categoria = ?
       AND s.estatus = 'ACTIVO'
     ORDER BY s.id_servicio`,
    [idTienda, idCategoria]
  );

  // Adaptamos al formato que usará el frontend
  return rows.map((s) => ({
    id: s.id,
    store_id: idTienda,
    service_external_id: s.id_servicio_externo,
    nombre: s.nombre,
    description: s.descripcion,          // 👈 aquí va la descripción del servicio
    precio: Number(s.precio_base),
    duracion_minutos: s.duracion_minutos,
    talla: null,
    color: null,
    stock: null
  }));
}

export default {
  listarCategorias,
  listarServiciosPorCategoria
};
