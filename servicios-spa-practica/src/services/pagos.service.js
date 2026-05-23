// src/services/pagos.service.js
import db from "../db/connection.js";
import bancoService from "./banco.service.js";
import dotenv from "dotenv";

dotenv.config();

/**
 * Tarjeta del comercio (SPA) donde se deposita el dinero.
 * La leemos de .env, igual que en banco.service.js
 */
const TARJETA_COMERCIO =
  process.env.BANCARATA_TARJETA_COMERCIO || "4111111111111111";

/**
 * Envía una solicitud de pago al banco a partir de una cita.
 *
 * 1) Registra el pago en la tabla `pagos`
 * 2) Crea el registro en `transacciones_bancarias`
 * 3) Llama a la API del banco (BANCARATA)
 * 4) Actualiza `transacciones_bancarias` con la respuesta real del banco
 * 5) Actualiza estatus de `pagos` y `citas`
 */
const enviarAlBanco = async (payload) => {
  const {
    id_cita,
    monto,
    numero_tarjeta_origen,      // 💳 tarjeta del cliente
    // numero_tarjeta_destino YA NO lo esperamos del frontend
    nombre_cliente_tarjeta,
    mes_expiracion,
    anio_expiracion,
    cvv,
  } = payload;

  // 🔎 Validaciones mínimas
  if (!id_cita || !monto) {
    throw new Error("id_cita y monto son obligatorios para solicitar el pago");
  }

  if (!numero_tarjeta_origen) {
    throw new Error("El número de tarjeta de origen es obligatorio");
  }

  // 1) Registrar el pago ligado a la cita
  const [pago] = await db.query(
    `INSERT INTO pagos (id_cita, monto, tipo_pago, metodo_pago, estatus)
     VALUES (?, ?, 'COMPLETO', 'TARJETA', 'ENVIADO_BANCO')`,
    [id_cita, monto]
  );

  // 2) Registrar transacción bancaria (lo que ENVIAMOS al banco)
  //    Guardamos la tarjeta del comercio como destino
  const [trx] = await db.query(
    `INSERT INTO transacciones_bancarias (
        id_pago,
        numero_tarjeta_origen,
        numero_tarjeta_destino,
        nombre_cliente_tarjeta,
        mes_expiracion,
        anio_expiracion,
        cvv,
        monto
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      pago.insertId,
      numero_tarjeta_origen,
      TARJETA_COMERCIO,         // 👈 SIEMPRE la tarjeta del SPA
      nombre_cliente_tarjeta,
      mes_expiracion,
      anio_expiracion,
      cvv,
      monto,
    ]
  );

  // 3) Llamar al BANCO real (BANCARATA)
  const respuestaBanco = await bancoService.enviarTransaccion({
    NumeroTarjetaOrigen: numero_tarjeta_origen,
    NumeroTarjetaDestino: TARJETA_COMERCIO, // 👈 mismo destino
    NombreCliente: nombre_cliente_tarjeta,
    MesExp: mes_expiracion,
    AnioExp: anio_expiracion,
    Cvv: cvv,
    Monto: monto,
  });

  // 4) Actualizar la transacción bancaria con los datos del banco
  const creadaMysql = respuestaBanco.CreadaUTC
    ? respuestaBanco.CreadaUTC.replace("T", " ").replace("Z", "").slice(0, 19)
    : null;

  const idTransaccionBanco =
    respuestaBanco.IdTransaccion || respuestaBanco.id_transaccion || null;

  await db.query(
    `UPDATE transacciones_bancarias
     SET
       tipo_transaccion         = ?,
       creada_utc               = ?,
       id_transaccion_externa   = ?,
       monto_transaccion        = ?,
       numero_tarjeta_mascarada = ?,
       nombre_estado            = ?,
       firma                    = ?,
       descripcion              = ?,
       fecha_actualizacion      = NOW()
     WHERE id_transaccion_banco = ?`,
    [
      respuestaBanco.TipoTransaccion || null,
      creadaMysql,
      idTransaccionBanco,
      respuestaBanco.MontoTransaccion ?? monto,
      respuestaBanco.NumeroTarjeta || null,
      respuestaBanco.NombreEstado || null,
      respuestaBanco.Firma || null,
      respuestaBanco.Descripcion || null,
      trx.insertId,
    ]
  );

  // 5) Actualizar estatus del pago y de la cita según respuesta del banco
  const estadoBanco = (respuestaBanco.NombreEstado || "").toUpperCase();
  const mensajeBanco = (
    respuestaBanco.Descripcion || respuestaBanco.Mensaje || ""
  ).toUpperCase();

  const aprobada =
    ["ACEPTADA", "APROBADA", "COMPLETADA"].includes(estadoBanco) ||
    mensajeBanco.includes("ÉXITO") ||
    mensajeBanco.includes("APROBADO");

  const nuevoEstatusPago = aprobada ? "APROBADO" : "RECHAZADO";
  await db.query(
    `UPDATE pagos
     SET estatus = ?, actualizado_en = NOW()
     WHERE id_pago = ?`,
    [nuevoEstatusPago, pago.insertId]
  );

  const nuevoEstatusCita = aprobada ? "CONFIRMADA" : "CANCELADA";
  await db.query(
    `UPDATE citas
     SET estatus = ?, actualizado_en = NOW()
     WHERE id_cita = ?`,
    [nuevoEstatusCita, id_cita]
  );

  // 6) Regresar info al frontend
  return {
    id_pago: pago.insertId,
    id_transaccion_banco: trx.insertId,
    id_transaccion_externa: idTransaccionBanco,
    respuesta_banco: respuestaBanco,
    estatus_pago: nuevoEstatusPago,
    estatus_cita: nuevoEstatusCita,
  };
};

export default { enviarAlBanco };
