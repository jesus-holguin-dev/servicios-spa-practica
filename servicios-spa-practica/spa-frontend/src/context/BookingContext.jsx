// src/context/BookingContext.jsx
import { createContext, useContext, useState, useMemo } from "react";

const BookingContext = createContext(null);

// Helper para una llave única del servicio en el carrito
function getServicioKey(servicio) {
  return (
    servicio.service_external_id ||     // "SPA-SERV-001"
    servicio.id_servicio_externo ||    // por si viene con este nombre
    servicio.id_servicio ||            // 1, 2, ...
    servicio.id ||                     // id genérico
    Math.random().toString(36).slice(2)
  );
}

export function BookingProvider({ children }) {
  const [selectedService, setSelectedService] = useState(null);
  const [citaInfo, setCitaInfo] = useState(null);
  const [pagoInfo, setPagoInfo] = useState(null);

  const [cartItems, setCartItems] = useState([]);
  // cartItems: [{ key, id_servicio, id_servicio_externo, service_external_id, nombre, precioUnitario, cantidad, total, raw }]

  const addToCart = (servicio, cantidad) => {
    const precioUnitario = Number(
      servicio.precio || servicio.precio_unitario || servicio.base_price || 0
    );
    if (!precioUnitario || cantidad <= 0) return;

    const key = getServicioKey(servicio);

    const idServicio = servicio.id_servicio ?? servicio.id ?? null;

    // 👇 AQUÍ LO IMPORTANTE: leemos también `service_external_id`
    const idServicioExterno =
      servicio.id_servicio_externo ??
      servicio.service_external_id ??
      null;

    setCartItems((prev) => {
      const idx = prev.findIndex((item) => item.key === key);

      if (idx >= 0) {
        const updated = [...prev];
        const existing = updated[idx];
        const nuevaCantidad = existing.cantidad + cantidad;
        updated[idx] = {
          ...existing,
          cantidad: nuevaCantidad,
          total: nuevaCantidad * existing.precioUnitario,
        };
        return updated;
      }

      // Nuevo ítem en el carrito
      return [
        ...prev,
        {
          key,
          id_servicio: idServicio,
          id_servicio_externo: idServicioExterno,   // <- string tipo SPA-SERV-001
          service_external_id: idServicioExterno,   // <- lo guardamos también así
          nombre: servicio.nombre,
          precioUnitario,
          cantidad,
          total: cantidad * precioUnitario,
          raw: servicio,
        },
      ];
    });
  };

  const updateCartItemQuantity = (itemKey, nuevaCantidad) => {
    setCartItems((prev) =>
      prev
        .map((item) => {
          if (item.key !== itemKey) return item;
          const qty = Math.max(0, nuevaCantidad);
          if (qty === 0) return null;
          return {
            ...item,
            cantidad: qty,
            total: qty * item.precioUnitario,
          };
        })
        .filter(Boolean)
    );
  };

  const removeFromCart = (itemKey) => {
    updateCartItemQuantity(itemKey, 0);
  };

  const clearCart = () => setCartItems([]);

  const cartSubtotal = useMemo(
    () => cartItems.reduce((sum, item) => sum + item.total, 0),
    [cartItems]
  );

  const value = {
    selectedService,
    setSelectedService,
    citaInfo,
    setCitaInfo,
    pagoInfo,
    setPagoInfo,

    cartItems,
    addToCart,
    updateCartItemQuantity,
    removeFromCart,
    clearCart,
    cartSubtotal,
  };

  return (
    <BookingContext.Provider value={value}>
      {children}
    </BookingContext.Provider>
  );
}

export function useBooking() {
  const ctx = useContext(BookingContext);
  if (!ctx) {
    throw new Error("useBooking debe usarse dentro de <BookingProvider>");
  }
  return ctx;
}
