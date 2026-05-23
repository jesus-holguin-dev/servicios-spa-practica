// src/pages/PaymentReceiptPage.jsx
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useBooking } from "../context/BookingContext.jsx";
import "./PaymentReceiptPage.css";

function formatFechaHora(iso) {
  if (!iso) return "-";
  const d = new Date(iso);
  const fecha = d.toLocaleDateString("es-MX", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });
  const hora = d.toLocaleTimeString("es-MX", {
    hour: "2-digit",
    minute: "2-digit",
  });
  return `${fecha} - ${hora}`;
}

function formatSoloFecha(iso) {
  if (!iso) return "-";
  const d = new Date(iso);
  return d.toLocaleDateString("es-MX", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });
}

function PaymentReceiptPage() {
  const navigate = useNavigate();
  const { pagoInfo, clearCart, setPagoInfo, setCitaInfo } = useBooking();

  // 👉 Si no hay pagoInfo, regresamos al inicio.
  // 👉 Si sí hay pagoInfo, limpiamos carrito y cita para el siguiente flujo.
  useEffect(() => {
    if (!pagoInfo) {
      navigate("/");
      return;
    }

    // Limpiar carrito (por si aún tenía cosas)
    clearCart();

    // Limpiar datos de la cita para que no se prellen nombre/fecha/hora
    if (setCitaInfo) {
      setCitaInfo(null);
    }
  }, [pagoInfo, navigate, clearCart, setCitaInfo]);

  if (!pagoInfo) return null;

  const {
    email,
    telefono,
    citaInfo,
    items = [],
    total,
    respuesta_banco,
    estatus_pago,
  } = pagoInfo;

  // Respuesta de banco (real o simulada)
  const banco = respuesta_banco || pagoInfo;

  const nombreCliente =
    citaInfo?.nombreCompleto || banco?.NombreCliente || "Nombre del cliente";

  const servicioNombre =
    items[0]?.nombre || citaInfo?.servicioNombre || "Servicio reservado";

  const duracionMinutos =
    citaInfo?.duracionMinutos ??
    citaInfo?.duracion_minutos ??
    items[0]?.raw?.duracion_minutos ??
    60;

  const fechaCita = citaInfo?.fechaCita || "-";
  const horaCita = citaInfo?.horaCita || "-";
  const codigoReserva =
    citaInfo?.codigoReserva || citaInfo?.codigo_reserva || "DKS-2023-00125";

  const fechaPagoISO = banco?.CreadaUTC || new Date().toISOString();
  const textoFechaPago = formatFechaHora(fechaPagoISO);
  const textoFechaSoloPago = formatSoloFecha(fechaPagoISO);

  const estadoBanco = (banco?.NombreEstado || "").toUpperCase();

  const pagoConfirmado =
    ["ACEPTADA", "APROBADA", "COMPLETADA"].includes(estadoBanco) ||
    estatus_pago === "APROBADO";

  const handleDescargarPagoPDF = () => {
    // TODO: implementar jsPDF
    alert("Aquí iría la descarga del PDF de PAGO (pendiente implementar).");
  };

  const handleDescargarReservaPDF = () => {
    // TODO: implementar jsPDF
    alert("Aquí iría la descarga del PDF de RESERVA (pendiente implementar).");
  };

  // 👇 Botón para volver al inicio y dejar todo limpio
  const handleVolverInicio = () => {
    clearCart();
    if (setCitaInfo) setCitaInfo(null);
    if (setPagoInfo) setPagoInfo(null);
    navigate("/");
  };

  return (
    <div className="receipt-wrapper">
      <main className="receipt-main">
        {/* Columna: comprobante de pago */}
        <section className="receipt-column">
          <div className="column-header">
            <img
              src="/logo-dk.png"
              alt="Dream's Kingdom SPA"
              className="column-logo"
            />
            <p className="column-logo-text">Dream&apos;s Kingdom SPA</p>
          </div>

          {/* Título oculto por CSS */}
          <h2 className="column-title">Comprobante de pago</h2>
          <p className="column-subtitle">{textoFechaPago}</p>

          <div className="column-body">
            <div className="info-block">
              <p className="bold-text">{nombreCliente}</p>
              <p>{email || "cliente@ejemplo.com"}</p>
              <p>{telefono || "+52 000 000 0000"}</p>
            </div>

            <div className="info-block">
              <p className="bold-text">Tarjeta de crédito</p>
              <p>{banco?.NumeroTarjeta || "**** **** **** 1111"}</p>
            </div>

            <div className="service-row">
              <span>
                {servicioNombre} {duracionMinutos} min
              </span>
              <span>
                MX ${" "}
                {Number(total || banco?.MontoTransaccion || 0).toFixed(2)}
              </span>
            </div>

            <p className="small-muted">
              {fechaCita !== "-" && horaCita !== "-"
                ? `${fechaCita} - ${horaCita}`
                : ""}
            </p>

            {/* Estado de pago */}
            <div className="status-row">
              <div
                className={
                  "status-icon " + (pagoConfirmado ? "ok" : "status-error")
                }
              >
                {pagoConfirmado ? "✓" : "!"}
              </div>
              <div className="status-text">
                <p
                  className={
                    pagoConfirmado ? "status-title" : "status-title error"
                  }
                >
                  {pagoConfirmado ? "Pago confirmado" : "Pago no aprobado"}
                </p>
                <p className="status-subtitle">
                  {pagoConfirmado
                    ? `Número de referencia: ${
                        banco?.NumeroAutorizacion || "AUTH-XXXXXX"
                      }`
                    : banco?.Descripcion ||
                      banco?.Mensaje ||
                      "Contacta al establecimiento."}
                </p>
              </div>
            </div>

            <button
              type="button"
              className="btn-download"
              onClick={handleDescargarPagoPDF}
            >
              Descargar PDF
            </button>

            <p className="footnote">
              Este comprobante es válido como constancia de pago. Conserva tu
              número de referencia para cualquier aclaración.
            </p>
          </div>
        </section>

        {/* Columna: comprobante de reserva */}
        <section className="receipt-column">
          <div className="column-header">
            <img
              src="/logo-dk.png"
              alt="Dream's Kingdom SPA"
              className="column-logo"
            />
            <p className="column-logo-text">Dream&apos;s Kingdom SPA</p>
          </div>

          {/* Título oculto por CSS */}
          <h2 className="column-title">Comprobante de reserva</h2>
          <p className="column-subtitle">{textoFechaSoloPago}</p>

          <div className="column-body column-body-grid">
            <div className="left-block">
              <div className="info-block">
                <p className="bold-text">{nombreCliente}</p>
                <p>{email || "cliente@ejemplo.com"}</p>
              </div>

              <div className="info-block">
                <p className="label">Servicio</p>
                <p>{servicioNombre}</p>
              </div>

              <div className="info-block inline">
                <div>
                  <p className="label">Duración</p>
                  <p>{duracionMinutos} min</p>
                </div>
                <div>
                  <p className="label">Código</p>
                  <p>{codigoReserva}</p>
                </div>
              </div>
            </div>

            <div className="right-block">
              {/* Placeholder de QR, luego se puede cambiar por un QR real */}
              <div className="qr-placeholder">QR</div>

              <div className="info-block inline">
                <div>
                  <p className="label">Fecha de cita</p>
                  <p>{fechaCita}</p>
                </div>
                <div>
                  <p className="label">Hora</p>
                  <p>{horaCita}</p>
                </div>
              </div>
            </div>
          </div>

          <button
            type="button"
            className="btn-download"
            onClick={handleDescargarReservaPDF}
          >
            Descargar PDF
          </button>

          <p className="footnote">
            Gracias por elegir Dream&apos;s Kingdom SPA, te esperamos con gusto
            para brindarte una experiencia de relajación inolvidable.
          </p>
        </section>
      </main>

      {/* Botón global para volver al inicio y limpiar todo */}
      <div className="receipt-back-row">
        <button
          type="button"
          className="btn-download btn-home"
          onClick={handleVolverInicio}
        >
          Volver al inicio
        </button>
      </div>
    </div>
  );
}

export default PaymentReceiptPage;
