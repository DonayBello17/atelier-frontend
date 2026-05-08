import { useState } from 'react';
import Login from './components/Login';
import Navbar from './components/navbar';
import Productos from './components/Productos';
import Clientes from './components/Clientes';
import Inventario from './components/Inventario';
import Ventas from './components/Ventas';
import Tallas from './components/Tallas';

export default function App() {
  const [usuario, setUsuario] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('usuario')) || null;
    } catch {
      return null;
    }
  });

  const [vista, setVista] = useState('productos');

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

  const renderVista = () => {
    if (vista === 'productos') return <Productos usuario={usuario} />;
    if (vista === 'clientes') return <Clientes usuario={usuario} />;
    if (vista === 'inventario') return <Inventario usuario={usuario} />;
    if (vista === 'ventas') return <Ventas usuario={usuario} />;
    if (vista === 'tallas') return <Tallas usuario={usuario} />;

    return <Productos usuario={usuario} />;
  };

  if (!usuario) {
    return <Login onLogin={handleLogin} />;
  }

  return (
    <>
      <style>{`
        html,
        body,
        #root {
          min-height: 100%;
          margin: 0;
          background: #08090b;
        }

        body {
          overflow-x: hidden;
        }

        .app-premium-shell {
          min-height: 100vh;
          background:
            radial-gradient(circle at top right, rgba(214,180,105,0.06), transparent 22%),
            linear-gradient(180deg, #08090b 0%, #101114 100%);
          color: #ffffff;
          font-family: Inter, system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
        }

        .app-premium-shell h1,
        .app-premium-shell h2,
        .app-premium-shell h3 {
          color: inherit;
        }

        .app-premium-main {
          min-height: calc(100vh - 90px);
        }
      `}</style>

      <div className="app-premium-shell">
        <Navbar
          currentView={vista}
          setCurrentView={setVista}
          usuario={usuario}
          onLogout={handleLogout}
        />

        <main className="app-premium-main">
          {renderVista()}
        </main>
      </div>
    </>
  );
}
