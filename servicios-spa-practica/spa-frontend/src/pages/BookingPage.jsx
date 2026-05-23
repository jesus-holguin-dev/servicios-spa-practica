// src/pages/BookingPage.jsx
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useBooking } from "../context/BookingContext.jsx";
import {
  verificarDisponibilidad,
  crearCitaWeb,
} from "../api/spaApi.js";

function BookingPage() {
  const navigate = useNavigate();
  const { cartItems, cartSubtotal, citaInfo, setCitaInfo } = useBooking();

  const [nombreCompleto, setNombreCompleto] = useState(
    citaInfo?.nombreCompleto || ""
  );
  const [fechaCita, setFechaCita] = useState(citaInfo?.fechaCita || "");
  const [horaCita, setHoraCita] = useState(citaInfo?.horaCita || "");
  const [aceptaPoliticas, setAceptaPoliticas] = useState(
    citaInfo?.aceptaPoliticas || false
  );

  const [checking, setChecking] = useState(false);
  const [statusDisponibilidad, setStatusDisponibilidad] = useState(null);
  const [availableTimes, setAvailableTimes] = useState([]);

  // Si no hay carrito, mandamos al inicio
  useEffect(() => {
    if (!cartItems || cartItems.length === 0) {
      navigate("/");
    }
  }, [cartItems, navigate]);

  // Generar horarios 09:00, 09:30, ..., 20:30
  const generarHorarios = () => {
    const slots = [];
    let hora = 9;
    let minuto = 0;

    while (hora < 21) {
      const hStr = String(hora).padStart(2, "0");
      const mStr = String(minuto).padStart(2, "0");
      slots.push(`${hStr}:${mStr}`);

      minuto += 30;
      if (minuto >= 60) {
        minuto = 0;
        hora += 1;
      }
    }
    return slots;
  };

  const horariosBase = generarHorarios();

  const validarFormularioBasico = () => {
    if (!nombreCompleto.trim()) {
      return "Por favor ingresa el nombre completo.";
    }
    if (!fechaCita) {
      return "Por favor selecciona la fecha de la cita.";
    }
    if (!aceptaPoliticas) {
      return "Debes aceptar las políticas de privacidad y uso.";
    }
    if (!cartItems || cartItems.length === 0) {
      return "Tu carrito está vacío.";
    }
    return null;
  };

  // 🔍 Calcula horarios disponibles para TODOS los servicios del carrito
  const calcularHorariosDisponibles = async (fechaISO) => {
    if (!fechaISO || !cartItems.length) {
      setAvailableTimes([]);
      setStatusDisponibilidad(null);
      return;
    }

    setChecking(true);
    setStatusDisponibilidad(null);
    setAvailableTimes([]);
    setHoraCita("");

    const horariosDisponibles = [];

    for (const hora of horariosBase) {
      let disponibleParaTodos = true;

      for (const item of cartItems) {
        const idServicioExterno =
          item.id_servicio_externo ||
          item.service_external_id ||
          item.id_servicio ||
          item.id ||
          null;

        const payload = {
          id_tienda: 2,
          id_servicio_externo: idServicioExterno,
          fecha_cita: fechaISO,
          hora_cita: hora,
          tipo_cabina: null,
        };

        try {
          const resp = await verificarDisponibilidad(payload);
          console.log("Resp disponibilidad", fechaISO, hora, resp);

          if (!resp || resp.disponible !== true) {
            disponibleParaTodos = false;
            break;
          }
        } catch (err) {
          console.error("Error verificando disponibilidad:", err);
          disponibleParaTodos = false;
          break;
        }
      }

      if (disponibleParaTodos) {
        horariosDisponibles.push(hora);
      }
    }

    console.log(
      "✅ Horarios disponibles para",
      fechaISO,
      "=>",
      horariosDisponibles
    );

    if (!horariosDisponibles.length) {
      setStatusDisponibilidad({
        tipo: "error",
        mensaje: "No hay horarios disponibles para esa fecha.",
      });
    } else {
      setStatusDisponibilidad({
        tipo: "ok",
        mensaje: "Selecciona una hora disponible para completar la reserva.",
      });
    }

    setAvailableTimes(horariosDisponibles);
    setChecking(false);
  };

  // Recalcular horarios cuando cambia la fecha
  useEffect(() => {
    if (fechaCita) {
      calcularHorariosDisponibles(fechaCita);
    } else {
      setAvailableTimes([]);
      setStatusDisponibilidad(null);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fechaCita, cartItems]);

  const handleProcederPagar = async () => {
    const errorForm = validarFormularioBasico();
    if (errorForm) {
      setStatusDisponibilidad({ tipo: "error", mensaje: errorForm });
      return;
    }
    if (!horaCita) {
      setStatusDisponibilidad({
        tipo: "error",
        mensaje: "Selecciona una hora de la lista disponible.",
      });
      return;
    }
    if (!availableTimes.includes(horaCita)) {
      setStatusDisponibilidad({
        tipo: "error",
        mensaje:
          "La hora seleccionada ya no está disponible. Elige otra de la lista.",
      });
      return;
    }

    if (!cartItems || cartItems.length === 0) {
      setStatusDisponibilidad({
        tipo: "error",
        mensaje: "Tu carrito está vacío.",
      });
      return;
    }

    // Por ahora tomamos el PRIMER servicio del carrito para la cita
    const servicioPrincipal = cartItems[0];

    const serviceExternalId =
      servicioPrincipal.service_external_id ||
      servicioPrincipal.id_servicio_externo ||
      servicioPrincipal.id_servicio ||
      servicioPrincipal.id;

    if (!serviceExternalId) {
      setStatusDisponibilidad({
        tipo: "error",
        mensaje:
          "No se pudo identificar el servicio seleccionado. Intenta agregarlo de nuevo al carrito.",
      });
      return;
    }

    try {
      setChecking(true);
      setStatusDisponibilidad(null);

      // 🧱 Payload que espera el backend (citasWeb.service.js)
      const payloadCita = {
        store_id: 2, // id_tienda que estás usando en disponibilidad
        service_external_id: serviceExternalId,
        appointment_date: fechaCita,
        appointment_time: horaCita,
        customer_name: nombreCompleto,
        customer_email: null, // aquí luego puedes conectar correo real
        customer_phone: null, // y teléfono si lo agregas al formulario
        tipo_cabina: null,
      };

      console.log("➡️ Enviando crearCitaWeb:", payloadCita);
      const resp = await crearCitaWeb(payloadCita);
      console.log("✅ Cita creada desde web:", resp);

      // resp trae: id_cita, codigo_reserva, fecha_inicio, fecha_fin, duracion_minutos, id_empleado...
      setCitaInfo({
        nombreCompleto,
        fechaCita,
        horaCita,
        aceptaPoliticas,
        id_cita: resp.id_cita,
        codigo_reserva: resp.codigo_reserva,
        fecha_inicio: resp.fecha_inicio,
        fecha_fin: resp.fecha_fin,
        duracion_minutos: resp.duracion_minutos,
        id_empleado: resp.id_empleado,
      });

      // Ahora sí pasamos a la pantalla de pago
      navigate("/pago");
    } catch (err) {
      console.error("❌ Error al crear la cita web:", err);

      const msg =
        err.response?.data?.detalle ||
        err.response?.data?.error ||
        err.message ||
        "Error al crear la cita. Intenta nuevamente.";

      setStatusDisponibilidad({
        tipo: "error",
        mensaje: msg,
      });
    } finally {
      setChecking(false);
    }
  };

  const handleRegresarCarrito = () => {
    navigate("/carrito");
  };

  if (!cartItems || cartItems.length === 0) return null;

  return (
    <div className="booking-page">
      <h1 className="booking-title">Elementos de pago</h1>

      <div className="booking-layout">
        {/* Izquierda: formulario */}
        <div className="booking-left">
          <div className="booking-field">
            <label>Servicio(s):</label>
            <div className="booking-services-list">
              {cartItems.map((item) => (
                <div key={item.key} className="booking-service-item">
                  <span className="service-name">
                    {item.nombre}
                    {item.cantidad > 1 && ` x${item.cantidad}`}
                  </span>
                  <span className="service-price">
                    MX$ {item.total.toFixed(2)}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div className="booking-field">
            <label>Nombre completo:</label>
            <input
              type="text"
              value={nombreCompleto}
              onChange={(e) => setNombreCompleto(e.target.value)}
              placeholder="¿Quién recibe el tratamiento?"
            />
          </div>

          <div className="booking-field">
            <label>Fecha de la cita:</label>
            <input
              type="date"
              value={fechaCita}
              onChange={(e) => setFechaCita(e.target.value)}
            />
          </div>

          <div className="booking-field">
            <label>Hora de la cita:</label>
            <select
              value={horaCita}
              onChange={(e) => setHoraCita(e.target.value)}
              disabled={!availableTimes.length || checking}
            >
              <option value="">-Seleccionar-</option>
              {availableTimes.map((h) => (
                <option key={h} value={h}>
                  {h}
                </option>
              ))}
            </select>
          </div>

          <div className="booking-field booking-checkbox">
            <label>
              <input
                type="checkbox"
                checked={aceptaPoliticas}
                onChange={(e) => setAceptaPoliticas(e.target.checked)}
              />
              <span>Acepto las políticas de privacidad y uso.</span>
            </label>
          </div>

          {statusDisponibilidad && (
            <div
              className={
                statusDisponibilidad.tipo === "ok"
                  ? "disponibilidad-message ok"
                  : "disponibilidad-message error"
              }
            >
              {statusDisponibilidad.mensaje}
            </div>
          )}

          <div className="booking-buttons-row">
            <button
              type="button"
              className="btn-secondary"
              onClick={handleRegresarCarrito}
              disabled={checking}
            >
              Regresar al carrito
            </button>

            <button
              type="button"
              className="btn-primary"
              onClick={handleProcederPagar}
              disabled={checking || !availableTimes.length}
            >
              {checking ? "Procesando..." : "Proceder a pagar"}
            </button>
          </div>
        </div>

        {/* Derecha: resumen */}
        <div className="booking-right">
          <h2>Resumen de la reserva</h2>
          <div className="booking-summary-box">
            <div className="summary-row">
              <span>Subtotal</span>
              <span>MX$ {cartSubtotal.toFixed(2)}</span>
            </div>
            <div className="summary-row">
              <span>Cupón de descuento</span>
              <span>—</span>
            </div>
            <div className="summary-row summary-total">
              <span>Total</span>
              <span>MX$ {cartSubtotal.toFixed(2)}</span>
            </div>

            <div className="summary-extra">
              {fechaCita && horaCita ? (
                <p>
                  <strong>Fecha y hora seleccionadas:</strong>{" "}
                  {fechaCita} — {horaCita}
                </p>
              ) : fechaCita ? (
                <p>Selecciona una hora disponible para completar la reserva.</p>
              ) : (
                <p>
                  Selecciona fecha y hora para ver el resumen completo.
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default BookingPage;
