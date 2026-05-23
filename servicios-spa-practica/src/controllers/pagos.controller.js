// src/controllers/pagos.controller.js
import pagosService from "../services/pagos.service.js";

export const solicitarTransaccion = async (req, res) => {
  try {
    const respuesta = await pagosService.enviarAlBanco(req.body);
    res.json(respuesta);
  } catch (e) {
    console.error("[PAGOS] Error al solicitar transacción:", e);

    const bankData = e.response?.data || null;

    res.status(500).json({
      error: "Error al solicitar transacción",
      message: e.message,
      banco: bankData,
    });
  }
};
