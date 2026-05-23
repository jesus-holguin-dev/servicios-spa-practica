// src/components/Header.jsx

function Header({ title }) {
  return (
    <header className="spa-header">
      <div className="spa-header__topbar" />

      <div className="spa-header__inner">
        {/* Logo simple tipo círculo con iniciales (luego puedes cambiarlo por una imagen) */}
       <img
          src="/logo-dk.png"          // importante la diagonal inicial
          alt="Dreams Kingdom Spa"
          className="spa-header__logo-img"
        />

        <div className="spa-header__page-title">{title}</div>
      </div>

      <div className="spa-header__divider" />
    </header>
  );
}

export default Header;
