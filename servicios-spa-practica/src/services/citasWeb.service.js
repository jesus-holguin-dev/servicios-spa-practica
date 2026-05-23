// src/services/citasWeb.service.js
import db from "../db/connection.js";
import {
  buscarEmpleadoDisponible,
  calcularRangoFechaHora
} from "./asignacion.service.js";

/**
 * Crear cita desde el SITIO WEB del SPA (SPA_WEB)
 *
 * - NO usa user_id del Mall
 * - Usa datos del cliente (nombre, correo, teléfono)
 * - Usa service_external_id, fecha y hora
 * - Crea/obtiene cliente
 * - Asigna empleado disponible
 * - Crea cita con origen = 'SPA_WEB' y estatus = 'PENDIENTE_PAGO'
 */
const crearCita = async (payload) => {
  const {
    // Datos de tienda / servicio
    store_id,
    id_tienda,
    service_external_id,

    // Fecha y hora (aceptamos dos nombres por si acaso)
    appointment_date,
    appointment_time,
    fecha_cita,
    hora_cita,

    // Datos del cliente
    customer_name,
    customer_email,
    customer_phone,

    // Opcional: tipo de cabina (para el futuro)
    tipo_cabina
  } = payload;

  const tiendaId = id_tienda ?? store_id;
  const fechaCita = fecha_cita ?? appointment_date;
  const horaCita = hora_cita ?? appointment_time;

  if (!tiendaId || !service_external_id || !fechaCita || !horaCita || !customer_name) {
    throw new Error(
      "Faltan datos obligatorios (store_id, service_external_id, fecha_cita, hora_cita, customer_name)"
    );
  }

  // 1) Buscar o crear cliente por correo o teléfono
  let cli = null;

  if (customer_email) {
    const [[row]] = await db.query(
      "SELECT * FROM clientes WHERE id_tienda = ? AND correo = ? LIMIT 1",
      [tiendaId, customer_email]
    );
    cli = row || null;
  }

  if (!cli && customer_phone) {
    const [[row]] = await db.query(
      "SELECT * FROM clientes WHERE id_tienda = ? AND telefono = ? LIMIT 1",
      [tiendaId, customer_phone]
    );
    cli = row || null;
  }

  let idCliente = cli ? cli.id_cliente : null;

  if (!idCliente) {
    const [n] = await db.query(
      "INSERT INTO clientes (id_tienda, id_usuario_mall, nombre_completo, correo, telefono) VALUES (?,?,?,?,?)",
      [tiendaId, null, customer_name, customer_email || null, customer_phone || null]
    );
    idCliente = n.insertId;
  }

  // 2) Buscar servicio
  const [[serv]] = await db.query(
    "SELECT * FROM servicios WHERE id_servicio_externo = ? AND id_tienda = ?",
    [service_external_id, tiendaId]
  );

  if (!serv) {
    throw new Error("Servicio no encontrado para esa tienda");
  }

  const dur = serv.duracion_minutos;

  const { inicio, fin } = calcularRangoFechaHora(fechaCita, horaCita, dur);

  // 3) Asignar empleado disponible
  const idEmpleado = await buscarEmpleadoDisponible(
    tiendaId,
    fechaCita,
    horaCita,
    dur
  );

  if (!idEmpleado) {
    throw new Error("No hay empleados disponibles para ese horario");
  }

  // 4) Crear la cita
  const horaNormalizada =
    horaCita.length === 5 ? `${horaCita}:00` : horaCita;

  const [cita] = await db.query(
    `INSERT INTO citas (
        id_tienda,
        id_servicio,
        id_cliente,
        id_cabina,
        id_empleado,
        fecha_cita,
        hora_cita,
        fecha_inicio,
        fecha_fin,
        duracion_minutos,
        origen,
        estatus,
        tipo_cabina_reservada
      )
      VALUES (?,?,?,?,?,?,?,?,?,?, 'SPA_WEB', 'PENDIENTE_PAGO', ?)`,
    [
      tiendaId,
      serv.id_servicio,
      idCliente,
      null,
      idEmpleado,
      fechaCita,
      horaNormalizada,
      inicio,
      fin,
      dur,
      tipo_cabina || null
    ]
  );

  // 5) Generar y guardar código de reserva
  const codigoReserva = `SPA-${fechaCita.replace(/-/g, "")}-${cita.insertId}`;

  await db.query(
    "UPDATE citas SET codigo_reserva = ? WHERE id_cita = ?",
    [codigoReserva, cita.insertId]
  );

  // 6) Devolver info para el frontend
  return {
    id_cita: cita.insertId,
    codigo_reserva: codigoReserva,
    fecha_inicio: inicio,
    fecha_fin: fin,
    duracion_minutos: dur,
    id_empleado: idEmpleado
  };
};

export default { crearCita };
