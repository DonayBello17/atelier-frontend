export default function Navbar({
  currentView,
  setCurrentView,
  usuario,
  onLogout,
  onLoginClick,
}) {
  const rol = String(usuario?.rol || 'visitante').toLowerCase();

  const itemsPorRol = {
    visitante: [
      { key: 'productos', label: 'Catálogo' },
    ],

    cliente: [
      { key: 'productos', label: 'Catálogo' },
      { key: 'ventas', label: 'Mis compras' },
     
    ],

    empleado: [
      { key: 'productos', label: 'Productos' },
      
      { key: 'ventas', label: 'Ventas' },
    ],

    admin: [
      { key: 'productos', label: 'Productos' },
      { key: 'clientes', label: 'Clientes' },
      
      { key: 'ventas', label: 'Ventas' },
      { key: 'tallas', label: 'Tallas' },
    ],
  };

  const nombreRol = {
    visitante: 'Visitante',
    cliente: 'Cliente',
    empleado: 'Empleado',
    admin: 'Administrador',
  };

  const items = itemsPorRol[rol] || itemsPorRol.visitante;

  return (
    <>
      <style>{`
        .atelier-nav-shell {
          position: sticky;
          top: 0;
          z-index: 1000;
          padding: 18px 24px 0;
          background: linear-gradient(180deg, rgba(7,8,10,0.92) 0%, rgba(7,8,10,0.65) 70%, rgba(7,8,10,0) 100%);
          backdrop-filter: blur(8px);
        }

        .atelier-nav {
          max-width: 1400px;
          margin: 0 auto;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 16px;
          padding: 16px 18px;
          border-radius: 22px;
          border: 1px solid rgba(255,255,255,0.10);
          background: rgba(14, 15, 19, 0.82);
          box-shadow: 0 18px 40px rgba(0,0,0,0.22);
          backdrop-filter: blur(16px);
        }

        .atelier-brand {
          min-width: 180px;
          cursor: pointer;
          display: flex;
          flex-direction: column;
          gap: 4px;
        }

        .atelier-brand-title {
          color: #f2eee7;
          font-size: 28px;
          line-height: 1;
          letter-spacing: 6px;
          font-family: Georgia, 'Times New Roman', serif;
          font-weight: 500;
        }

        .atelier-brand-subtitle {
          color: #d6b469;
          font-size: 11px;
          text-transform: uppercase;
          letter-spacing: 2px;
        }

        .atelier-nav-links {
          flex: 1;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 10px;
          flex-wrap: wrap;
        }

        .atelier-nav-btn {
          border: 1px solid rgba(255,255,255,0.08);
          background: rgba(255,255,255,0.03);
          color: rgba(255,255,255,0.85);
          padding: 12px 16px;
          border-radius: 14px;
          cursor: pointer;
          font-size: 14px;
          font-weight: 600;
          transition: all 0.25s ease;
        }

        .atelier-nav-btn:hover {
          transform: translateY(-1px);
          border-color: rgba(214,180,105,0.35);
          color: #fff;
          background: rgba(255,255,255,0.06);
        }

        .atelier-nav-btn.active {
          background: linear-gradient(135deg, rgba(214,180,105,0.22), rgba(184,141,70,0.12));
          border-color: rgba(214,180,105,0.45);
          color: #f6e7bf;
          box-shadow: inset 0 0 0 1px rgba(214,180,105,0.18);
        }

        .atelier-nav-right {
          display: flex;
          align-items: center;
          gap: 12px;
          min-width: 240px;
          justify-content: flex-end;
        }

        .atelier-user-chip {
          padding: 10px 14px;
          border-radius: 14px;
          background: rgba(255,255,255,0.04);
          border: 1px solid rgba(255,255,255,0.08);
          color: rgba(255,255,255,0.84);
          font-size: 13px;
          line-height: 1.4;
          text-align: right;
        }

        .atelier-user-role {
          color: #d6b469;
          font-weight: 700;
          text-transform: capitalize;
        }

        .atelier-logout {
          border: none;
          border-radius: 14px;
          padding: 12px 16px;
          background: linear-gradient(135deg, #d9b878, #b88d46);
          color: #111;
          font-weight: 700;
          cursor: pointer;
          transition: all 0.25s ease;
          box-shadow: 0 10px 24px rgba(185,141,70,0.20);
        }

        .atelier-logout:hover {
          transform: translateY(-1px);
          box-shadow: 0 16px 28px rgba(185,141,70,0.28);
        }

        @media (max-width: 1100px) {
          .atelier-nav {
            flex-direction: column;
            align-items: stretch;
          }

          .atelier-nav-links {
            justify-content: flex-start;
          }

          .atelier-nav-right {
            min-width: unset;
            justify-content: space-between;
          }

          .atelier-user-chip {
            text-align: left;
          }
        }

        @media (max-width: 640px) {
          .atelier-nav-shell {
            padding: 12px 12px 0;
          }

          .atelier-brand-title {
            font-size: 22px;
            letter-spacing: 4px;
          }

          .atelier-nav-btn {
            width: 100%;
            text-align: left;
          }

          .atelier-nav-links {
            flex-direction: column;
            align-items: stretch;
          }

          .atelier-nav-right {
            flex-direction: column;
            align-items: stretch;
          }

          .atelier-logout {
            width: 100%;
          }
        }
      `}</style>

      <div className="atelier-nav-shell">
        <div className="atelier-nav">
          <div
            className="atelier-brand"
            onClick={() => setCurrentView('productos')}
            title="Ir al catálogo"
          >
            <div className="atelier-brand-title">ATELIER</div>
            <div className="atelier-brand-subtitle">
              {rol === 'visitante' || rol === 'cliente'
                ? 'Catálogo premium'
                : 'Moda que trasciende'}
            </div>
          </div>

          <div className="atelier-nav-links">
            {items.map((item) => (
              <button
                key={item.key}
                className={`atelier-nav-btn ${currentView === item.key ? 'active' : ''}`}
                onClick={() => setCurrentView(item.key)}
              >
                {item.label}
              </button>
            ))}
          </div>

          <div className="atelier-nav-right">
            <div className="atelier-user-chip">
              <div className="atelier-user-role">
                {nombreRol[rol] || 'Usuario'}
              </div>
              <div>
                {usuario?.nombre ||
                  usuario?.email ||
                  (rol === 'visitante' ? 'Explorando catálogo' : 'Sesión activa')}
              </div>
            </div>

            {usuario ? (
              <button className="atelier-logout" onClick={onLogout}>
                Salir
              </button>
            ) : (
              <button className="atelier-logout" onClick={onLoginClick}>
                Iniciar sesión
              </button>
            )}
          </div>
        </div>
      </div>
    </>
  );
}