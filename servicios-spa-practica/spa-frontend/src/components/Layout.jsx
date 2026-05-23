// src/components/Layout.jsx
import Header from "./Header.jsx";
import Footer from "./Footer.jsx";

function Layout({ children, headerTitle }) {
  return (
    <>
      {/* El header ahora usa el título dinámico */}
      <Header title={headerTitle} />

      <main>{children}</main>

      <Footer />
    </>
  );
}

export default Layout;
