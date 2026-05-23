// src/App.jsx
import { Routes, Route, useLocation } from "react-router-dom";
import CategoriesPage from "./pages/CategoriesPage.jsx";
import CategoryServicesPage from "./pages/CategoryServicesPage.jsx";
import { BookingProvider } from "./context/BookingContext";
import BookingPage from "./pages/BookingPage.jsx";
import PaymentPage from "./pages/PaymentPage.jsx";
import Layout from "./components/Layout.jsx";
import CartPage from "./pages/CartPage.jsx";
import PaymentReceiptPage from "./pages/PaymentReceiptPage.jsx";

/**
 * Hook interno para decidir qué título mostrar en el header
 * según la ruta actual.
 */
function useHeaderTitle() {
  const location = useLocation();
  const path = location.pathname;

  if (path === "/") return "Servicios";
  if (path.startsWith("/categoria/")) return "Masajes"; // o "Servicios" si prefieres
  if (path === "/carrito") return "Carrito de compras";
  if (path === "/reserva") return "Reserva";
  if (path === "/pago") return "Pago";

  return "Servicios";
}

function AppWithRouter() {
  const headerTitle = useHeaderTitle();

  return (
    <Layout headerTitle={headerTitle}>
      <Routes>
        <Route path="/" element={<CategoriesPage />} />
        <Route path="/categoria/:idCategoria" element={<CategoryServicesPage />} />
        <Route path="/carrito" element={<CartPage />} />
        <Route path="/reserva" element={<BookingPage />} />
        <Route path="/pago" element={<PaymentPage />} />
        <Route path="/comprobante" element={<PaymentReceiptPage />} />
      </Routes>
    </Layout>
  );
}

function App() {
  return (
    <BookingProvider>
      <AppWithRouter />
    </BookingProvider>
  );
}

export default App;
