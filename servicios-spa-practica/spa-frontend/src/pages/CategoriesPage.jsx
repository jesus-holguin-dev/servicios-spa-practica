// src/pages/CategoriesPage.jsx
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getCategorias } from "../api/spaApi.js";

function CategoriesPage() {
  const [categorias, setCategorias] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    async function cargar() {
      try {
        setLoading(true);
        const data = await getCategorias();
        setCategorias(data);
      } catch (err) {
        console.error("Error cargando categorías:", err);
        setError("Error al cargar las categorías.");
      } finally {
        setLoading(false);
      }
    }

    cargar();
  }, []);

  const handleClickCategoria = (cat) => {
    navigate(`/categoria/${cat.id_categoria}`, {
      state: { categoria: cat } // pasamos nombre + descripcion + imagen_url
    });
  };

  return (
    <main className="spa-page">
      {/* Ya no quieres título arriba, así que lo dejamos vacío o muy discreto */}
      {/* <h1 className="page-title">SERVICIOS</h1> */}

      {loading && <p>Cargando categorías...</p>}
      {error && <p style={{ color: "red" }}>{error}</p>}

      {!loading && !error && (
        <section className="categories-grid">
          {categorias.map((cat) => (
            <button
              key={cat.id_categoria}
              className="category-card"
              onClick={() => handleClickCategoria(cat)}
            >
              <div className="category-card__image-wrapper">
                <img
                  src={cat.imagen_url}
                  alt={cat.nombre}
                  className="category-card__image"
                />
                <div className="category-card__overlay" />
                <div className="category-card__name">
                  {cat.nombre.toUpperCase()}
                </div>
              </div>
            </button>
          ))}
        </section>
      )}
    </main>
  );
}

export default CategoriesPage;
