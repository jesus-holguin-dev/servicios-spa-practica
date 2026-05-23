// src/services/banco.service.js
import axios from "axios";
import dotenv from "dotenv";

dotenv.config();

// Endpoint real de Bancarata
const BANK_API_URL =
  process.env.BANK_API_URL || "https://bancarata.vercel.app/api/bank";

const NOMBRE_COMERCIO =
  process.env.BANCARATA_COMERCIO || "Dreams Kingdom SPA";

// 💳 Tarjeta del comercio (SPA) donde se deposita el dinero
const TARJETA_COMERCIO =
  process.env.BANCARATA_TARJETA_COMERCIO || "4111111111111111";

const enviarTransaccion = async (solicitud) => {
  const {
    NumeroTarjetaOrigen,
    NumeroTarjetaDestino,
    NombreCliente,
    MesExp,
    AnioExp,
    Cvv,
    Monto,
  } = solicitud;

  // Payload que manda tu backend al banco (nuevo contrato)
  const bodyBanco = {
    NumeroTarjetaOrigen,
    // Si no viene en la solicitud, usamos la tarjeta del comercio
    NumeroTarjetaDestino: NumeroTarjetaDestino || TARJETA_COMERCIO,
    NombreCliente,
    MesExp,
    AnioExp,
    Cvv,
    Monto,
  };

  const url = BANK_API_URL;

  console.log("[BANCO] Enviando solicitud a:", url);
  console.log("[BANCO] Body:", bodyBanco);

  const { data } = await axios.post(url, bodyBanco);

  console.log("[BANCO] Respuesta REAL:", data);

  // Normalizamos la respuesta al formato del nuevo contrato
  const descripcion =
    data.Descripcion ||
    data.descripcion ||
    data.Mensaje ||
    data.mensaje ||
    "";

  const idTransaccion =
    data.IdTransaccion ||
    data.id_transaccion ||
    data.idTransaccion ||
    `TRX-${Date.now()}`;

  return {
    // Campos del contrato nuevo
    CreadaUTC: data.CreadaUTC || data.creadaUTC || new Date().toISOString(),
    IdTransaccion: idTransaccion,
    TipoTransaccion:
      data.TipoTransaccion ||
      data.tipoTransaccion ||
      data.tipo_transaccion ||
      "TRANSFERENCIA",
    MontoTransaccion:
      data.MontoTransaccion ??
      data.montoTransaccion ??
      data.monto ??
      Monto,
    NumeroTarjeta: data.NumeroTarjeta || data.numeroTarjeta || null,
    NombreEstado: data.NombreEstado || data.nombreEstado || null,
    Firma: data.Firma || data.firma || null,
    Descripcion: descripcion,

    // Alias
    Mensaje: descripcion,

    // Opcional para logs / front
    NombreComercio: NOMBRE_COMERCIO,
  };
};

export default { enviarTransaccion };
