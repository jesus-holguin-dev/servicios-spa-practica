// src/services/asignacion.service.js
import db from "../db/connection.js";

/**
 * Convierte una fecha (YYYY-MM-DD) a abreviatura de día de la semana
 * compatible con los valores en BD (L, M, Mi, J, V, S, D).
 *
 * IMPORTANTE:
 *  - Martes => M
 *  - Miércoles => Mi
 */
function obtenerAbreviaturaDia(fechaCita) {
  const d = new Date(`${fechaCita}T12:00:00`);
  const day = d.getDay();

  const mapa = ["D", "L", "M", "Mi", "J", "V", "S"];
  return mapa[day] || "L";
}

/**
 * Calcula fecha y hora de inicio/fin basado en la duración del servicio.
 * Regresa: { inicio, fin, horaFin }
 *
 * inicio: "YYYY-MM-DD HH:MM:SS"
 * fin:    "YYYY-MM-DD HH:MM:SS"
 * horaFin: "HH:MM:SS"
 */
function calcularRangoFechaHora(fechaCita, horaCita, duracionMinutos) {
  // Normalizar hora (convertir "15:00" -> "15:00:00")
  const horaNormalizada =
    horaCita.length === 5 ? `${horaCita}:00` : horaCita;

  const inicio = `${fechaCita} ${horaNormalizada}`;
  const inicioDate = new Date(inicio);

  const finDate = new Date(
    inicioDate.getTime() + duracionMinutos * 60000
  );

  const fin = finDate.toISOString().slice(0, 19).replace("T", " ");
  const horaFin = fin.slice(11, 19);

  return { inicio, fin, horaFin };
}

/**
 * Busca un empleado disponible para el rango calculado.
 * Valida:
 *  - Turno (hora_inicio/hora_fin)
 *  - Día laboral (dias_trabajo: L-M-Mi-J-V)
 *  - No choque con citas existentes
 */
export async function buscarEmpleadoDisponible(
  idTienda,
  fechaCita,
  horaCita,
  duracionMinutos
) {
  const { inicio, fin, horaFin } = calcularRangoFechaHora(
    fechaCita,
    horaCita,
    duracionMinutos
  );

  const abreviaturaDia = obtenerAbreviaturaDia(fechaCita);

  // Query corregido con:
  //  ✔ TIME() para comparar horas correctamente
  //  ✔ FIND_IN_SET con reemplazo de guiones para días
  const [rows] = await db.query(
    `
    SELECT e.id_empleado
    FROM empleados e
    WHERE e.id_tienda = ?
      AND e.estatus = 'ACTIVO'

      -- Validación de horas usando TIME()
      AND (e.hora_inicio_turno IS NULL OR TIME(e.hora_inicio_turno) <= TIME(?))
      AND (e.hora_fin_turno IS NULL OR TIME(e.hora_fin_turno) >= TIME(?))

      -- Validación de días
      AND (
          e.dias_trabajo IS NULL
          OR e.dias_trabajo = ''
          OR FIND_IN_SET(?, REPLACE(e.dias_trabajo, '-', ',')) > 0
      )

      -- Validación de citas traslapadas
      AND NOT EXISTS (
          SELECT 1
          FROM citas c
          WHERE c.id_empleado = e.id_empleado
            AND c.estatus IN ('PENDIENTE_PAGO','CONFIRMADA')
            AND NOT (c.fecha_fin <= ? OR c.fecha_inicio >= ?)
      )

    LIMIT 1
  `,
    [
      idTienda,
      horaCita.length === 5 ? `${horaCita}:00` : horaCita, // inicio turno
      horaFin, // fin de la cita
      abreviaturaDia,
      inicio,
      fin
    ]
  );

  return rows[0]?.id_empleado || null;
}

export { calcularRangoFechaHora };