// src/api/spaApi.js
import axios from "axios";

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:3000/api";

console.log("✅ API_BASE_URL =>", API_BASE_URL);

export const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json"
  }
});

// --------- CATALOGO (Mall) ---------
export async function getCatalogo() {
  const res = await api.get("/catalogo");
  return res.data;
}

// --------- CATEGORÍAS (Web SPA) ---------
export async function getCategorias() {
  const res = await api.get("/categorias");
  return res.data;
}

export async function getServiciosPorCategoria(idCategoria) {
  const res = await api.get(`/categorias/${idCategoria}/servicios`);
  return res.data;
}

// --------- DISPONIBILIDAD ---------
export async function verificarDisponibilidad(body) {
  const res = await api.post("/disponibilidad", body);
  const data = res.data;

  // 🔧 Normalización para frontend SPA:
  // Caso 1: backend respondió en formato interno { disponible: true/false, ... }
  if (typeof data?.disponible !== "undefined") {
    return data;
  }

  // Caso 2: backend respondió en formato MALL (servicio_id, fecha_inicio, etc.)
  // => interpretamos que HAY disponibilidad
  if (data && data.servicio_id) {
    return {
      disponible: true,
      id_servicio: data.servicio_id,
      fecha_inicio: data.fecha_inicio,
      fecha_fin: data.fecha_fin,
      duracion_minutos: data.duracion_minutos,
      id_empleado_sugerido: data.id_barbero,
      raw: data, // por si luego quieres usar el objeto original
    };
  }

  // Si llega otra cosa rara, la regresamos tal cual
  return data;
}
// --------- CITAS WEB ---------
export async function crearCitaWeb(body) {
  const res = await api.post("/web", body);
  return res.data;
}

// --------- PAGOS ---------
export async function solicitarPago(body) {
  const res = await api.post("/pagos/solicitar-transaccion", body);
  return res.data;
}
