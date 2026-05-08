import { useEffect, useMemo, useState } from 'react';
import api from '../api/api';
import bgImage from '../assets/login-bg.jpg';

export default function Tallas({ usuario }) {
  const [tallas, setTallas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [busqueda, setBusqueda] = useState('');
  const [error, setError] = useState('');
  const [editando, setEditando] = useState(null);
  const [nombreTalla, setNombreTalla] = useState('');

  const esAdmin = usuario?.rol === 'admin';

  const cargar = async () => {
    try {
      setLoading(true);
      setError('');

      const res = await api.get('/tallas');
      setTallas(res.data.data || []);
    } catch (err) {
      setError('No se pudieron cargar las tallas');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    cargar();
  }, []);

  const tallasFiltradas = useMemo(() => {
    return tallas.filter((talla) => {
      return String(talla.nombre_talla || '').toLowerCase().includes(busqueda.toLowerCase());
    });
  }, [tallas, busqueda]);

  const stats = useMemo(() => {
    const total = tallas.length;
    const usadas = tallas.filter((t) => Number(t.usos) > 0).length;
    const libres = tallas.filter((t) => Number(t.usos) === 0).length;
    const stock = tallas.reduce((acc, t) => acc + (Number(t.stock_total) || 0), 0);

    return { total, usadas, libres, stock };
  }, [tallas]);

  const guardar = async () => {
    if (!nombreTalla.trim()) {
      setError('Escribe el nombre de la talla');
      return;
    }

    try {
      setError('');

      if (editando) {
        await api.put(`/tallas/${editando}`, {
          nombre_talla: nombreTalla,
        });
      } else {
        await api.post('/tallas', {
          nombre_talla: nombreTalla,
        });
      }

      setNombreTalla('');
      setEditando(null);
      cargar();
    } catch (err) {
      setError(err.response?.data?.message || 'No se pudo guardar la talla');
    }
  };

  const editar = (talla) => {
    setEditando(talla.id_talla);
    setNombreTalla(talla.nombre_talla || '');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const cancelar = () => {
    setEditando(null);
    setNombreTalla('');
    setError('');
  };

  const eliminar = async (id) => {
    if (!confirm('¿Eliminar esta talla?')) return;

    try {
      setError('');
      await api.delete(`/tallas/${id}`);
      cargar();
    } catch (err) {
      setError(err.response?.data?.message || 'No se pudo eliminar la talla');
    }
  };

  if (loading) {
    return (
      <div className="premium-loading">
        Cargando tallas...
      </div>
    );
  }

  return (
    <>
      <style>{`
        * { box-sizing: border-box; }

        .premium-loading {
          min-height: 100vh;
          background: #08090b;
          color: white;
          display: flex;
          align-items: center;
          justify-content: center;
          font-family: Inter, sans-serif;
        }

        .sizes-page {
          min-height: 100vh;
          padding: 28px;
          background:
            radial-gradient(circle at top right, rgba(214,180,105,0.08), transparent 22%),
            linear-gradient(180deg, #08090b 0%, #101114 100%);
          color: white;
          font-family: Inter, system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
        }

        .sizes-container {
          width: 100%;
          max-width: 1400px;
          margin: 0 auto;
        }

        .hero {
          position: relative;
          overflow: hidden;
          min-height: 280px;
          border-radius: 30px;
          padding: 34px;
          display: flex;
          align-items: flex-end;
          border: 1px solid rgba(255,255,255,0.10);
          background:
            linear-gradient(to right, rgba(0,0,0,0.58), rgba(0,0,0,0.28)),
            linear-gradient(to top, rgba(0,0,0,0.60), rgba(0,0,0,0.10)),
            url(${bgImage});
          background-size: cover;
          background-position: center;
          box-shadow: 0 24px 60px rgba(0,0,0,0.28);
        }

        .hero-content {
          position: relative;
          z-index: 1;
          max-width: 720px;
        }

        .eyebrow {
          display: inline-flex;
          margin-bottom: 18px;
          padding: 10px 16px;
          border-radius: 999px;
          background: rgba(255,255,255,0.08);
          border: 1px solid rgba(255,255,255,0.14);
          font-size: 12px;
          letter-spacing: 2px;
          text-transform: uppercase;
        }

        .hero h1 {
          margin: 0 0 14px;
          font-size: 48px;
          line-height: 1.05;
        }

        .hero p {
          margin: 0;
          color: rgba(255,255,255,0.82);
          font-size: 16px;
          line-height: 1.8;
        }

        .stats-grid {
          display: grid;
          grid-template-columns: repeat(4, minmax(0, 1fr));
          gap: 18px;
          margin-top: 24px;
        }

        .stat-card,
        .glass-card,
        .size-card {
          background: rgba(18, 19, 24, 0.74);
          border: 1px solid rgba(255,255,255,0.10);
          backdrop-filter: blur(16px);
          box-shadow: 0 16px 40px rgba(0,0,0,0.18);
          border-radius: 24px;
        }

        .stat-card {
          padding: 22px;
        }

        .stat-label {
          color: rgba(255,255,255,0.62);
          font-size: 13px;
          margin-bottom: 12px;
          text-transform: uppercase;
          letter-spacing: 1.4px;
        }

        .stat-value {
          font-size: 32px;
          font-weight: 800;
        }

        .stat-accent {
          margin-top: 10px;
          font-size: 13px;
          color: #d6b469;
        }

        .toolbar {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 18px;
          margin-top: 24px;
        }

        .glass-card {
          padding: 24px;
        }

        .card-title {
          margin: 0 0 8px;
          font-size: 22px;
        }

        .card-subtitle {
          margin: 0 0 20px;
          color: rgba(255,255,255,0.62);
          font-size: 14px;
          line-height: 1.7;
        }

        .field {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        .field label {
          font-size: 13px;
          color: rgba(255,255,255,0.82);
          font-weight: 600;
        }

        .premium-input {
          width: 100%;
          min-height: 54px;
          border-radius: 16px;
          border: 1px solid rgba(255,255,255,0.12);
          background: rgba(255,255,255,0.04);
          color: white;
          outline: none;
          padding: 0 16px;
          font-size: 14px;
        }

        .actions-row {
          display: flex;
          flex-wrap: wrap;
          gap: 12px;
          margin-top: 18px;
        }

        .btn-gold,
        .btn-dark,
        .btn-danger {
          border: none;
          border-radius: 14px;
          padding: 14px 18px;
          font-size: 14px;
          font-weight: 800;
          cursor: pointer;
          transition: all 0.25s ease;
        }

        .btn-gold {
          background: linear-gradient(135deg, #d9b878, #b88d46);
          color: #131313;
        }

        .btn-dark {
          background: rgba(255,255,255,0.08);
          color: #fff;
          border: 1px solid rgba(255,255,255,0.12);
        }

        .btn-danger {
          background: rgba(220,38,38,0.16);
          color: #fca5a5;
          border: 1px solid rgba(220,38,38,0.26);
        }

        .sizes-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
          gap: 18px;
          margin-top: 24px;
        }

        .size-card {
          padding: 22px;
        }

        .size-name {
          font-size: 40px;
          font-weight: 900;
          color: #d6b469;
          margin-bottom: 12px;
        }

        .size-meta {
          color: rgba(255,255,255,0.68);
          font-size: 14px;
          line-height: 1.7;
        }

        .error-box {
          margin-top: 18px;
          background: rgba(220,38,38,0.12);
          border: 1px solid rgba(220,38,38,0.25);
          color: #fca5a5;
          padding: 14px 16px;
          border-radius: 14px;
          font-size: 14px;
        }

        @media (max-width: 1000px) {
          .stats-grid,
          .toolbar {
            grid-template-columns: 1fr 1fr;
          }
        }

        @media (max-width: 700px) {
          .sizes-page {
            padding: 16px;
          }

          .hero h1 {
            font-size: 36px;
          }

          .stats-grid,
          .toolbar {
            grid-template-columns: 1fr;
          }
        }
      `}</style>

      <div className="sizes-page">
        <div className="sizes-container">
          <section className="hero">
            <div className="hero-content">
              <div className="eyebrow">Sistema de tallas</div>
              <h1>Tallas organizadas para controlar el stock por prenda.</h1>
              <p>
                Administra las tallas disponibles y úsalas en inventario para manejar stock por producto, color y talla.
              </p>
            </div>
          </section>

          <section className="stats-grid">
            <div className="stat-card">
              <div className="stat-label">Total tallas</div>
              <div className="stat-value">{stats.total}</div>
              <div className="stat-accent">Catálogo de tallas</div>
            </div>

            <div className="stat-card">
              <div className="stat-label">Usadas</div>
              <div className="stat-value">{stats.usadas}</div>
              <div className="stat-accent">En inventario</div>
            </div>

            <div className="stat-card">
              <div className="stat-label">Libres</div>
              <div className="stat-value">{stats.libres}</div>
              <div className="stat-accent">Sin uso actual</div>
            </div>

            <div className="stat-card">
              <div className="stat-label">Stock total</div>
              <div className="stat-value">{stats.stock}</div>
              <div className="stat-accent">Unidades por talla</div>
            </div>
          </section>

          <section className="toolbar">
            {esAdmin && (
              <div className="glass-card">
                <h2 className="card-title">{editando ? 'Editar talla' : 'Agregar talla'}</h2>
                <p className="card-subtitle">
                  Ejemplos: XS, S, M, L, XL, 30, 32, 34.
                </p>

                <div className="field">
                  <label>Nombre de talla</label>
                  <input
                    className="premium-input"
                    placeholder="Ej. M"
                    value={nombreTalla}
                    onChange={(e) => setNombreTalla(e.target.value)}
                  />
                </div>

                <div className="actions-row">
                  <button className="btn-gold" onClick={guardar}>
                    {editando ? 'Guardar cambios' : 'Agregar talla'}
                  </button>

                  {editando && (
                    <button className="btn-dark" onClick={cancelar}>
                      Cancelar
                    </button>
                  )}
                </div>

                {error && <div className="error-box">{error}</div>}
              </div>
            )}

            <div className="glass-card">
              <h2 className="card-title">Buscar tallas</h2>
              <p className="card-subtitle">
                Encuentra tallas rápidamente.
              </p>

              <div className="field">
                <label>Búsqueda</label>
                <input
                  className="premium-input"
                  placeholder="Buscar talla..."
                  value={busqueda}
                  onChange={(e) => setBusqueda(e.target.value)}
                />
              </div>
            </div>
          </section>

          <section className="sizes-grid">
            {tallasFiltradas.map((talla) => (
              <article className="size-card" key={talla.id_talla}>
                <div className="size-name">{talla.nombre_talla}</div>
                <div className="size-meta">Registros de inventario: {talla.usos || 0}</div>
                <div className="size-meta">Stock asociado: {talla.stock_total || 0} unidades</div>

                {esAdmin && (
                  <div className="actions-row">
                    <button className="btn-gold" onClick={() => editar(talla)}>
                      Editar
                    </button>
                    <button className="btn-danger" onClick={() => eliminar(talla.id_talla)}>
                      Eliminar
                    </button>
                  </div>
                )}
              </article>
            ))}
          </section>
        </div>
      </div>
    </>
  );
}
