// src/services/servicios.service.js
import db from "../db/connection.js";

const listarCatalogo = async () => {
  const [rows] = await db.query(`
      SELECT 
        id_servicio AS id,
        id_servicio_externo,
        nombre,
        descripcion,
        precio_base,
        duracion_minutos
      FROM servicios
      WHERE id_tienda = 2 AND estatus = 'ACTIVO'
  `);

  const servicios = rows.map((s) => ({
    store_id: 2,
    id: s.id,
    id_servicio_externo: s.id_servicio_externo,   // 👈 nuevo campo
    nombre: s.nombre,
    description: s.descripcion,
    precio: Number(s.precio_base),

    // Campos NO usados en spa, pero requeridos por el MALL
    talla: null,
    color: null,
    stock: null,

    duracion_minutos: s.duracion_minutos
  }));

  return servicios;
};

export default { listarCatalogo };
