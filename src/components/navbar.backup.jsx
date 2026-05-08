export default function Navbar({ currentView, setCurrentView, usuario, onLogout }) {
  const items = [
    { key: 'productos', label: 'Productos' },
    { key: 'clientes', label: 'Clientes' },
    { key: 'inventario', label: 'Inventario' },
    { key: 'ventas', label: 'Ventas' },
    { key: 'tallas', label: 'Tallas' },
  ];

  return (
    <>
      <style>{`
        .atelier-nav-shell {
          position: sticky;
          top: 0;
          z-index: 1000;
          padding: 18px 24px 0;
          background: linear-gradient(180deg, rgba(7,8,10,0.96) 0%, rgba(7,8,10,0.72) 72%, rgba(7,8,10,0) 100%);
          backdrop-filter: blur(10px);
        }

        .atelier-nav {
          max-width: 1400px;
          margin: 0 auto;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 16px;
          padding: 16px 18px;
          border-radius: 24px;
          border: 1px solid rgba(255,255,255,0.10);
          background: rgba(14, 15, 19, 0.88);
          box-shadow: 0 18px 45px rgba(0,0,0,0.35);
          backdrop-filter: blur(18px);
        }

        .atelier-brand {
          min-width: 190px;
          cursor: pointer;
          display: flex;
          flex-direction: column;
          gap: 4px;
        }

        .atelier-brand-title {
          color: #f2eee7;
          font-size: 30px;
          line-height: 1;
          letter-spacing: 7px;
          font-family: Georgia, 'Times New Roman', serif;
          font-weight: 500;
        }

        .atelier-brand-subtitle {
          color: #d6b469;
          font-size: 11px;
          text-transform: uppercase;
          letter-spacing: 2.2px;
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
          background: rgba(255,255,255,0.035);
          color: rgba(255,255,255,0.82);
          padding: 12px 17px;
          border-radius: 15px;
          cursor: pointer;
          font-size: 14px;
          font-weight: 700;
          transition: all 0.25s ease;
        }

        .atelier-nav-btn:hover {
          transform: translateY(-1px);
          border-color: rgba(214,180,105,0.35);
          color: #fff;
          background: rgba(255,255,255,0.07);
        }

        .atelier-nav-btn.active {
          background: linear-gradient(135deg, rgba(214,180,105,0.25), rgba(184,141,70,0.13));
          border-color: rgba(214,180,105,0.50);
          color: #f6e7bf;
          box-shadow: inset 0 0 0 1px rgba(214,180,105,0.16);
        }

        .atelier-nav-right {
          display: flex;
          align-items: center;
          gap: 12px;
          min-width: 250px;
          justify-content: flex-end;
        }

        .atelier-user-chip {
          padding: 10px 14px;
          border-radius: 15px;
          background: rgba(255,255,255,0.045);
          border: 1px solid rgba(255,255,255,0.08);
          color: rgba(255,255,255,0.84);
          font-size: 13px;
          line-height: 1.4;
          text-align: right;
        }

        .atelier-user-role {
          color: #d6b469;
          font-weight: 800;
          text-transform: capitalize;
        }

        .atelier-logout {
          border: none;
          border-radius: 15px;
          padding: 12px 17px;
          background: linear-gradient(135deg, #d9b878, #b88d46);
          color: #111;
          font-weight: 800;
          cursor: pointer;
          transition: all 0.25s ease;
          box-shadow: 0 10px 26px rgba(185,141,70,0.22);
        }

        .atelier-logout:hover {
          transform: translateY(-1px);
          box-shadow: 0 16px 32px rgba(185,141,70,0.30);
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
            font-size: 23px;
            letter-spacing: 5px;
          }

          .atelier-nav-links {
            flex-direction: column;
            align-items: stretch;
          }

          .atelier-nav-btn {
            width: 100%;
            text-align: left;
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
          >
            <div className="atelier-brand-title">ATELIER</div>
            <div className="atelier-brand-subtitle">Moda que trasciende</div>
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
                {usuario?.rol || 'usuario'}
              </div>
              <div>{usuario?.nombre || usuario?.email || 'Sesion activa'}</div>
            </div>

            <button className="atelier-logout" onClick={onLogout}>
              Salir
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
