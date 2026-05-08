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

  const rol = usuario?.rol || 'visitante';

  const vistasPermitidas = useMemo(() => {
    if (!usuario) {
      return ['productos'];
    }

    if (rol === 'cliente') {
      return ['productos'];
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