// src/services/disponibilidad.service.js
import db from "../db/connection.js";
import {
  buscarEmpleadoDisponible,
  calcularRangoFechaHora
} from "./asignacion.service.js";

const procesarDisponibilidad = async (data) => {
  console.log("📥 [SERVICE] procesarDisponibilidad - payload:");
  console.log(data);

  const {
    id_tienda,
    id_servicio_externo,
    fecha_cita,
    hora_cita,
    tipo_cabina
  } = data;

  // 1) Validación básica
  if (!id_tienda || !id_servicio_externo || !fecha_cita || !hora_cita) {
    console.log("⚠️ Falta info obligatoria");
    return {
      disponible: false,
      motivo:
        "Faltan campos obligatorios: id_tienda, id_servicio_externo, fecha_cita, hora_cita"
    };
  }

  // 2) Buscar servicio
  const [[serv]] = await db.query(
    `SELECT * FROM servicios
     WHERE id_servicio_externo = ? AND id_tienda = ?`,
    [id_servicio_externo, id_tienda]
  );

  if (!serv) {
    console.log("⚠️ Servicio no encontrado para esa tienda");
    return {
      disponible: false,
      motivo: "Servicio no encontrado para esa tienda"
    };
  }

  const dur = serv.duracion_minutos;

  // 3) Calcular inicio y fin
  const { inicio, fin } = calcularRangoFechaHora(fecha_cita, hora_cita, dur);

  // 4) Buscar empleado disponible
  const idEmpleado = await buscarEmpleadoDisponible(
    id_tienda,
    fecha_cita,
    hora_cita,
    dur
  );

  if (!idEmpleado) {
    console.log("⚠️ No hay empleados disponibles");
    return {
      disponible: false,
      motivo: "No hay empleados disponibles para ese horario"
    };
  }

  const respuesta = {
    disponible: true,
    id_servicio: serv.id_servicio,
    fecha_inicio: inicio,
    fecha_fin: fin,
    duracion_minutos: dur,
    id_empleado_sugerido: idEmpleado,
    tipo_cabina_solicitada: tipo_cabina || null
  };

  console.log("✅ Disponibilidad encontrada:", respuesta);
  return respuesta;
};

/**
 * 🔍 Nuevo: obtener todos los horarios disponibles en un día
 * data: { id_tienda, id_servicio_externo, fecha_cita }
 */
const obtenerHorariosDisponiblesDia = async (data) => {
  console.log("📥 [SERVICE] obtenerHorariosDisponiblesDia - payload:");
  console.log(data);

  const { id_tienda, id_servicio_externo, fecha_cita } = data;

  if (!id_tienda || !id_servicio_externo || !fecha_cita) {
    return {
      fecha: fecha_cita || null,
      horarios: [],
      motivo:
        "Faltan campos obligatorios: id_tienda, id_servicio_externo, fecha_cita"
    };
  }

  // 1) Buscar servicio para obtener duración
  const [[serv]] = await db.query(
    `SELECT * FROM servicios
     WHERE id_servicio_externo = ? AND id_tienda = ?`,
    [id_servicio_externo, id_tienda]
  );

  if (!serv) {
    console.log("⚠️ Servicio no encontrado para esa tienda");
    return {
      fecha: fecha_cita,
      horarios: [],
      motivo: "Servicio no encontrado para esa tienda"
    };
  }

  const dur = serv.duracion_minutos;

  // 2) Definir ventana del día (puedes ajustar estos valores)
  const HORA_INICIO = 9;   // 09:00
  const HORA_FIN = 21;     // 21:00
  const INTERVALO = 30;    // 30 minutos

  const horariosDisponibles = [];

  for (let h = HORA_INICIO; h < HORA_FIN; h++) {
    for (let m = 0; m < 60; m += INTERVALO) {
      const hora_cita = `${String(h).padStart(2, "0")}:${String(m).padStart(
        2,
        "0"
      )}`;

      // Verificamos empleado disponible en ese horario
      const idEmpleado = await buscarEmpleadoDisponible(
        id_tienda,
        fecha_cita,
        hora_cita,
        dur
      );

      if (!idEmpleado) {
        // No disponible, seguimos con el siguiente slot
        continue;
      }

      const { inicio, fin } = calcularRangoFechaHora(fecha_cita, hora_cita, dur);

      horariosDisponibles.push({
        hora_cita,
        fecha_inicio: inicio,
        fecha_fin: fin,
        duracion_minutos: dur,
        id_servicio: serv.id_servicio,
        id_empleado_sugerido: idEmpleado
      });
    }
  }

  console.log(
    `✅ Horarios disponibles para ${fecha_cita}:`,
    horariosDisponibles.length
  );

  return {
    fecha: fecha_cita,
    horarios: horariosDisponibles
  };
};

export default {
  procesarDisponibilidad,
  obtenerHorariosDisponiblesDia
};
