import { useEffect, useMemo, useState } from 'react';
import Login from './components/Login';
import Navbar from './components/navbar';
import Productos from './components/Productos';
import Clientes from './components/Clientes';
import Inventario from './components/Inventario';
import Ventas from './components/Ventas';
import Tallas from './components/Tallas';

function GlobalStyles() {
  return (
    <style>{`
      html,
      body,
      #root {
        width: 100% !important;
        max-width: none !important;
        min-height: 100% !important;
        margin: 0 !important;
        padding: 0 !important;
        background: #08090b !important;
        text-align: initial !important;
      }

      body {
        min-height: 100vh !important;
        display: block !important;
        place-items: initial !important;
        overflow-x: hidden !important;
      }

      #root {
        min-height: 100vh !important;
      }

      .login-page {
        width: 100vw !important;
        min-height: 100vh !important;
        min-height: 100dvh !important;
        margin: 0 !important;
      }

      .productos-page {
        width: 100% !important;
        min-height: 100vh !important;
        margin: 0 !important;
      }

      .productos-container {
        width: 100% !important;
        max-width: 1400px !important;
        margin-left: auto !important;
        margin-right: auto !important;
      }

      .app-premium-shell {
        width: 100% !important;
        min-height: 100vh !important;
        background:
          radial-gradient(circle at top right, rgba(214,180,105,0.06), transparent 22%),
          linear-gradient(180deg, #08090b 0%, #101114 100%);
      }

      .app-premium-main {
        width: 100% !important;
        min-height: calc(100vh - 90px);
      }
              
      .products-page .products-hero,
      .sales-page .sales-hero,
      .inventory-page .inventory-hero,
      .clients-page .clients-hero,
      .clientes-page .clientes-hero,
      .sizes-page .sizes-hero,
      .tallas-page .tallas-hero,
      .tallas-page .sizes-hero {
        background:
          radial-gradient(circle at top right, rgba(214,180,105,0.10), transparent 26%),
          linear-gradient(135deg, #08090b 0%, #131418 48%, #090a0c 100%) !important;
        min-height: 220px !important;
      }

      .products-page .products-hero::before,
      .sales-page .sales-hero::before,
      .inventory-page .inventory-hero::before,
      .clients-page .clients-hero::before,
      .clientes-page .clientes-hero::before,
      .sizes-page .sizes-hero::before,
      .tallas-page .tallas-hero::before,
      .tallas-page .sizes-hero::before {
        background:
          radial-gradient(circle at top left, rgba(255,255,255,0.06), transparent 28%),
          radial-gradient(circle at bottom right, rgba(214,180,105,0.12), transparent 30%) !important;
      }

      /* Quitar miniaturas/perfiles en modulos internos, sin tocar imagenes del catalogo */
      .inventory-page .product-thumb,
      .sales-page .detail-img,
      .clients-page .client-avatar,
      .clientes-page .client-avatar,
      .clients-page .profile-avatar,
      .clientes-page .profile-avatar,
      .clients-page .avatar,
      .clientes-page .avatar {
        display: none !important;
      }

      .inventory-page .product-cell,
      .sales-page .detail-item,
      .clients-page .client-cell,
      .clientes-page .client-cell {
        grid-template-columns: 1fr auto !important;
      }

            .products-loading,
      .clients-loading,
      .sales-loading,
      .inventory-loading,
      .sizes-loading,
      .tallas-loading {
        min-height: 100vh !important;
        background:
          radial-gradient(circle at top right, rgba(214,180,105,0.13), transparent 28%),
          linear-gradient(135deg, #08090b 0%, #121318 52%, #07080a 100%) !important;
        color: transparent !important;
        font-size: 0 !important;
        display: flex !important;
        align-items: center !important;
        justify-content: center !important;
        position: relative !important;
      }

      .products-loading::before,
      .clients-loading::before,
      .sales-loading::before,
      .inventory-loading::before,
      .sizes-loading::before,
      .tallas-loading::before {
        content: "ATELIER";
        color: #f2eee7;
        font-family: Georgia, 'Times New Roman', serif;
        font-size: clamp(38px, 6vw, 72px);
        letter-spacing: 10px;
        font-weight: 500;
        display: block;
        text-align: center;
      }

      .products-loading::after,
      .clients-loading::after,
      .sales-loading::after,
      .inventory-loading::after,
      .sizes-loading::after,
      .tallas-loading::after {
        content: "Cargando sistema de ventas, catálogo e inventario...";
        position: absolute;
        top: calc(50% + 62px);
        left: 50%;
        transform: translateX(-50%);
        color: rgba(255,255,255,0.68);
        font-size: 14px;
        letter-spacing: 1px;
        text-align: center;
        width: min(90%, 520px);
      }
    `}</style>
  );
}

export default function App() {
  const [usuario, setUsuario] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('usuario')) || null;
    } catch {
      return null;
    }
  });

  const [vista, setVista] = useState('productos');

  const rol = String(usuario?.rol || 'visitante').toLowerCase().trim();

  const vistasPermitidas = useMemo(() => {
    if (!usuario) {
      return ['productos'];
    }

    if (rol === 'cliente') {
      return ['productos', 'ventas'];
    }

    if (rol === 'empleado') {
      return ['productos', 'clientes', 'inventario', 'ventas'];
    }

    if (rol === 'admin') {
      return ['productos', 'clientes', 'inventario', 'ventas', 'tallas'];
    }

    return ['productos'];
  }, [rol, usuario]);

  useEffect(() => {
    if (vista !== 'login' && !vistasPermitidas.includes(vista)) {
      setVista('productos');
    }
  }, [vista, vistasPermitidas]);

  const handleLogin = (usuarioLogueado) => {
    setUsuario(usuarioLogueado);
    setVista('productos');
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('usuario');
    setUsuario(null);
    setVista('productos');
  };

  const handleLoginClick = () => {
    setVista('login');
  };

  const handleBackCatalogo = () => {
    setVista('productos');
  };

  const renderVista = () => {
  if (vista === 'login' && !usuario) {
    return (
      <Login
        onLogin={handleLogin}
        onBackCatalogo={handleBackCatalogo}
      />
    );
  }

  if (vista === 'productos') {
    return (
      <Productos
        usuario={usuario}
        onRequireLogin={handleLoginClick}
      />
    );
  }

  if (vista === 'ventas') {
    return <Ventas usuario={usuario} />;
  }

  if (usuario?.rol === 'cliente') {
    return (
      <Productos
        usuario={usuario}
        onRequireLogin={handleLoginClick}
      />
    );
  }

  if (vista === 'clientes') return <Clientes usuario={usuario} />;
  if (vista === 'inventario') return <Inventario usuario={usuario} />;
  if (vista === 'tallas') return <Tallas usuario={usuario} />;

  return (
    <Productos
      usuario={usuario}
      onRequireLogin={handleLoginClick}
    />
  );
};

  if (vista === 'login' && !usuario) {
    return (
      <>
        <GlobalStyles />
        {renderVista()}
      </>
    );
  }

  return (
    <>
      <GlobalStyles />

      <div className="app-premium-shell">
        <Navbar
          currentView={vista}
          setCurrentView={setVista}
          usuario={usuario}
          onLogout={handleLogout}
          onLoginClick={handleLoginClick}
        />

        <main className="app-premium-main">
          {renderVista()}
        </main>
      </div>
    </>
  );
}