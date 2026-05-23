// src/pages/CatalogPage.jsx
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getCatalogo } from "../api/spaApi.js";
import { useBooking } from "../context/BookingContext.jsx";

function CatalogPage() {
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const { setSelectedService } = useBooking();
  const navigate = useNavigate();

  useEffect(() => {
    async function load() {
      try {
        setLoading(true);
        const data = await getCatalogo();   // GET /api/catalogo a tu backend
        setServices(data || []);
      } catch (err) {
        console.error(err);
        setError("Error al cargar el catálogo.");
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const handleReservar = (service) => {
    setSelectedService(service);
    navigate("/reserva"); // vamos a la pantalla de reserva
  };

  if (loading) return <p>Cargando servicios...</p>;
  if (error) return <p style={{ color: "red" }}>{error}</p>;

  return (
    <div>
      <h1 style={{ marginBottom: "0.5rem" }}>Catálogo de Servicios</h1>
      <p style={{ marginBottom: "1.5rem" }}>
        Elige un tratamiento para agendar tu cita.
      </p>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
          gap: "1.25rem"
        }}
      >
        {services.map((s) => (
          <article
            key={s.id}
            style={{
              border: "1px solid #ddd",
              borderRadius: "10px",
              padding: "1rem",
              background: "#111827", // se ve bien con tu fondo oscuro
            }}
          >
            <h2 style={{ marginBottom: "0.5rem", fontSize: "1.1rem" }}>
              {s.nombre}
            </h2>
            <p
              style={{
                fontSize: "0.9rem",
                marginBottom: "0.75rem",
                color: "#d1d5db"
              }}
            >
              {s.description || s.descripcion}
            </p>
            <p style={{ marginBottom: "0.25rem", fontSize: "0.9rem" }}>
              Duración:{" "}
              <strong>{s.duracion_minutos || s.duracion || 60} min</strong>
            </p>
            <p
              style={{
                marginBottom: "0.75rem",
                fontWeight: "bold",
                fontSize: "1rem"
              }}
            >
              MX$ {Number(s.precio || s.precio_base).toFixed(2)}
            </p>

            <button
              onClick={() => handleReservar(s)}
              style={{
                padding: "0.5rem 1rem",
                borderRadius: "999px",
                border: "none",
                backgroundColor: "#a47b5b",
                color: "white",
                cursor: "pointer"
              }}
            >
              Reservar
            </button>
          </article>
        ))}
      </div>
    </div>
  );
}

export default CatalogPage;
