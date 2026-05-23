// src/pages/CartPage.jsx
import { useNavigate } from "react-router-dom";
import { useBooking } from "../context/BookingContext.jsx";
import "./CartPage.css";

function CartPage() {
  const {
    cartItems,
    cartSubtotal,
    updateCartItemQuantity,
    clearCart,
  } = useBooking();

  const navigate = useNavigate();

  // Cambiar cantidad directamente en el contexto
  const handleChangeQty = (itemKey, delta) => {
    const item = cartItems.find((i) => i.key === itemKey);
    if (!item) return;

    const nuevaCantidad = Math.max(0, item.cantidad + delta);
    updateCartItemQuantity(itemKey, nuevaCantidad);
  };

  const handleAgregarMasServicios = () => {
    navigate("/");
  };

  const handleProcederPagar = () => {
    navigate("/reserva");
  };

  if (!cartItems || cartItems.length === 0) {
    return (
      <div className="cart-page">
        <h1 className="cart-title">Carrito de compras de servicios</h1>
        <p className="cart-empty">Tu carrito está vacío.</p>
        <button className="btn-primary" onClick={handleAgregarMasServicios}>
          Agregar más servicios
        </button>
      </div>
    );
  }

  return (
    <div className="cart-page">
      <h1 className="cart-title">Carrito de compras de servicios</h1>

      <div className="cart-layout">
        {/* Columna izquierda: tabla */}
        <section className="cart-table-section">
          <table className="cart-table">
            <thead>
              <tr>
                <th>Servicio</th>
                <th>Precio</th>
                <th>Cantidad</th>
                <th>Total</th>
              </tr>
            </thead>
            <tbody>
              {cartItems.map((item) => (
                <tr key={item.key}>
                  <td className="cart-service-name">{item.nombre}</td>
                  <td>MX$ {item.precioUnitario.toFixed(2)}</td>
                  <td>
                    <div className="cart-qty-control">
                      <button
                        type="button"
                        onClick={() => handleChangeQty(item.key, -1)}
                      >
                        −
                      </button>
                      <span>{item.cantidad}</span>
                      <button
                        type="button"
                        onClick={() => handleChangeQty(item.key, 1)}
                      >
                        +
                      </button>
                    </div>
                  </td>
                  <td>MX$ {item.total.toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
          </table>

          <div className="cart-actions-row">
            {/* El botón de actualizar ya no es necesario */}
            {/* <button className="btn-secondary" type="button">
              Actualizar carrito
            </button> */}
            <button
              className="btn-link"
              type="button"
              onClick={clearCart}
            >
              Vaciar carrito
            </button>
          </div>
        </section>

        {/* Columna derecha: resumen */}
        <aside className="cart-summary">
          <h2>Total del carrito</h2>

          <div className="cart-summary-row">
            <span>Subtotal</span>
            <span>MX$ {cartSubtotal.toFixed(2)}</span>
          </div>

          <div className="cart-summary-row cart-coupon-row">
            <span>Cupon de descuento</span>
            <div className="cart-coupon-input">
              <input type="text" placeholder="Código de cupón" />
              <button type="button" className="btn-secondary">
                Aplicar
              </button>
            </div>
          </div>

          <div className="cart-summary-row cart-total-row">
            <span>Total</span>
            <span>MX$ {cartSubtotal.toFixed(2)}</span>
          </div>

          <div className="cart-summary-buttons">
            <button
              className="btn-secondary full-width"
              type="button"
              onClick={handleAgregarMasServicios}
            >
              Agregar más servicios
            </button>
            <button
              className="btn-primary full-width"
              type="button"
              onClick={handleProcederPagar}
            >
              Proceder a pagar
            </button>
          </div>
        </aside>
      </div>
    </div>
  );
}

export default CartPage;
