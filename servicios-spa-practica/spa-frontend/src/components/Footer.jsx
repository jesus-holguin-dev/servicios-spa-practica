// src/components/Footer.jsx

function Footer() {
  return (
    <footer className="spa-footer">
      <div className="spa-footer__inner">
        {/* Fila de redes sociales */}
        <div className="spa-footer__social-row">
          <button className="spa-footer__social-btn">F</button>
          <button className="spa-footer__social-btn">I</button>
          <button className="spa-footer__social-btn">T</button>
          <button className="spa-footer__social-btn">📧</button>
        </div>

        {/* Info en columnas */}
        <div className="spa-footer__info">
          <div>
            <div className="spa-footer__info-title">Ubicación</div>
            <div className="spa-footer__info-text">
              Avenida obrego 228
              <br />
              Hermosillo, Sonora 84620
            </div>
          </div>

          <div>
            <div className="spa-footer__info-title">Horario</div>
            <div className="spa-footer__info-text">
              Lunes - Sábado
              <br />
              9 AM - 6 PM
            </div>
          </div>

          <div>
            <div className="spa-footer__info-title">Contacto</div>
            <div className="spa-footer__info-text">
              + 662-340-0361
              <br />
              DreamsKingdom@gmail.com
            </div>
          </div>
        </div>
      </div>

      <div className="spa-footer__bottom">
        © {new Date().getFullYear()} Dreams Kingdom Spa
      </div>
    </footer>
  );
}

export default Footer;
