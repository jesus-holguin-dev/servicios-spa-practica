// src/controllers/ventasMall.controller.js
import citasService from "../services/citas.service.js";

/**
 * CONTROLADOR PARA REGISTRAR VENTA DESDE EL MALL (REG_VTA_SERV)
 * ------------------------------------------------------------------
 * - Recibe datos del Mall
 * - Llama al servicio para registrar la cita
 * - Responde OK + datos clave de la venta/cita
 */
export const registrarVentaMall = async (req, res) => {
  try {
    console.log("📥 [SPA] REG_VTA_SERV - Datos recibidos:");
    console.log(JSON.stringify(req.body, null, 2));

    const resultado = await citasService.registrarVenta(req.body);

    console.log("✅ [SPA] Cita guardada correctamente en la BD:", resultado);

    // Respuesta pensada para el Mall
    return res.status(201).json({
      message: "Cita registrada correctamente en SPA",
      venta_id_spa: resultado.id_cita,          // <- ID interno de la cita
      codigo_reserva: resultado.codigo_reserva, // <- para mostrar al usuario
      mall_order_id: resultado.mall_order_id,   // <- por si quieren correlacionar
      estatus_cita: resultado.estatus_cita,
      fecha_cita: resultado.fecha_cita,
      hora_cita: resultado.hora_cita,
      duracion_minutos: resultado.duracion_minutos,
    });

  } catch (error) {
    console.error("❌ [SPA] Error en REG_VTA_SERV:");
    console.error("   • Mensaje:", error.message);
    console.error("   • Stack trace:", error.stack);

    const erroresCliente = [
      "Faltan datos obligatorios",
      "Servicio no encontrado",
      "No hay empleados disponibles"
    ];

    const esErrorCliente = erroresCliente.some((t) =>
      error.message.includes(t)
    );

    return res.status(esErrorCliente ? 400 : 500).json({
      error: "Error al registrar venta",
      detalle: error.message
    });
  }
};
