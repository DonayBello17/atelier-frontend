import { useEffect, useMemo, useState } from 'react';
import api from '../api/api';

export default function Clientes({ usuario }) {
  const [clientes, setClientes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [busqueda, setBusqueda] = useState('');
  const [estadoFiltro, setEstadoFiltro] = useState('todos');
  const [comprasFiltro, setComprasFiltro] = useState('todos');
  const [ordenCliente, setOrdenCliente] = useState('recientes');
  const [paginaClientes, setPaginaClientes] = useState(1);
  const [error, setError] = useState('');
  const [mensaje, setMensaje] = useState('');
  const [editando, setEditando] = useState(null);

  const clientesPorPagina = 10;

  const [form, setForm] = useState({
    nombre: '',
    telefono: '',
    email: '',
    direccion: '',
  });

  const esAdmin = usuario?.rol === 'admin';

  const cargar = async () => {
    try {
      setLoading(true);
      setError('');

      const res = await api.get('/clientes');
      setClientes(res.data.data || []);
    } catch (err) {
      setError('No se pudieron cargar los clientes');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    cargar();
  }, []);

  const clientesFiltrados = useMemo(() => {
    const textoBusqueda = busqueda.toLowerCase().trim();

    const resultado = clientes.filter((cliente) => {
      const texto = `
        ${cliente.nombre || ''}
        ${cliente.telefono || ''}
        ${cliente.email || ''}
        ${cliente.direccion || ''}
        ${cliente.estado || ''}
      `.toLowerCase();

      const coincideBusqueda = texto.includes(textoBusqueda);

      const estaInactivo = cliente.estado === 'inactivo';
      const coincideEstado =
        estadoFiltro === 'todos' ||
        (estadoFiltro === 'activos' && !estaInactivo) ||
        (estadoFiltro === 'inactivos' && estaInactivo);

      const compras = Number(cliente.compras) || 0;
      const coincideCompras =
        comprasFiltro === 'todos' ||
        (comprasFiltro === 'con-compras' && compras > 0) ||
        (comprasFiltro === 'sin-compras' && compras === 0);

      return coincideBusqueda && coincideEstado && coincideCompras;
    });

    return [...resultado].sort((a, b) => {
      if (ordenCliente === 'nombre') {
        return String(a.nombre || '').localeCompare(String(b.nombre || ''));
      }

      if (ordenCliente === 'compras-mayor') {
        return (Number(b.compras) || 0) - (Number(a.compras) || 0);
      }

      if (ordenCliente === 'total-mayor') {
        return (Number(b.total_gastado) || 0) - (Number(a.total_gastado) || 0);
      }

      if (ordenCliente === 'total-menor') {
        return (Number(a.total_gastado) || 0) - (Number(b.total_gastado) || 0);
      }

      return Number(b.id_cliente || 0) - Number(a.id_cliente || 0);
    });
  }, [clientes, busqueda, estadoFiltro, comprasFiltro, ordenCliente]);

  const totalPaginasClientes = Math.max(
    1,
    Math.ceil(clientesFiltrados.length / clientesPorPagina)
  );

  useEffect(() => {
    setPaginaClientes(1);
  }, [busqueda, estadoFiltro, comprasFiltro, ordenCliente]);

  useEffect(() => {
    if (paginaClientes > totalPaginasClientes) {
      setPaginaClientes(totalPaginasClientes);
    }
  }, [paginaClientes, totalPaginasClientes]);

  const clientesPaginados = useMemo(() => {
    const inicio = (paginaClientes - 1) * clientesPorPagina;
    const fin = inicio + clientesPorPagina;

    return clientesFiltrados.slice(inicio, fin);
  }, [clientesFiltrados, paginaClientes]);

  const stats = useMemo(() => {
    const total = clientes.length;

    const activos = clientes.filter((cliente) => cliente.estado !== 'inactivo').length;
    const inactivos = clientes.filter((cliente) => cliente.estado === 'inactivo').length;

    const conCompras = clientes.filter((cliente) => {
      return Number(cliente.compras) > 0;
    }).length;

    const clientesVip = clientes.filter((cliente) => {
      return Number(cliente.total_gastado) >= 5000;
    }).length;

    const ingresos = clientes.reduce((acc, cliente) => {
      return acc + (Number(cliente.total_gastado) || 0);
    }, 0);

    return {
      total,
      activos,
      inactivos,
      conCompras,
      clientesVip,
      ingresos,
    };
  }, [clientes]);

  const formatMoney = (value) => {
    return new Intl.NumberFormat('es-DO', {
      style: 'currency',
      currency: 'DOP',
      maximumFractionDigits: 2,
    }).format(Number(value) || 0);
  };

  const formatDate = (value) => {
    if (!value) return 'Sin compras';

    return new Date(value).toLocaleDateString('es-DO', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
  };

  const limpiarForm = () => {
    setForm({
      nombre: '',
      telefono: '',
      email: '',
      direccion: '',
    });

    setEditando(null);
    setError('');
  };

  const limpiarFiltros = () => {
    setBusqueda('');
    setEstadoFiltro('todos');
    setComprasFiltro('todos');
    setOrdenCliente('recientes');
    setPaginaClientes(1);
  };

  const guardar = async () => {
    if (!form.nombre.trim()) {
      setError('El nombre del cliente es obligatorio');
      return;
    }

    try {
      setError('');
      setMensaje('');

      const payload = {
        nombre: form.nombre,
        telefono: form.telefono,
        email: form.email,
        direccion: form.direccion,
      };

      if (editando) {
        await api.put(`/clientes/${editando}`, payload);
        setMensaje('Cliente actualizado correctamente');
      } else {
        await api.post('/clientes', payload);
        setMensaje('Cliente agregado correctamente');
      }

      limpiarForm();
      cargar();
    } catch (err) {
      setError(err.response?.data?.message || 'No se pudo guardar el cliente');
    }
  };

  const editar = (cliente) => {
    setEditando(cliente.id_cliente);

    setForm({
      nombre: cliente.nombre || '',
      telefono: cliente.telefono || '',
      email: cliente.email || '',
      direccion: cliente.direccion || '',
    });

    setError('');
    setMensaje('');

    window.scrollTo({
      top: 0,
      behavior: 'smooth',
    });
  };

  const eliminar = async (cliente) => {
    if (!confirm(`¿Eliminar el cliente ${cliente.nombre}?`)) return;

    try {
      setError('');
      setMensaje('');

      await api.delete(`/clientes/${cliente.id_cliente}`);

      setMensaje('Cliente eliminado correctamente');
      cargar();
    } catch (err) {
      setError(
        err.response?.data?.message ||
        'No se pudo eliminar el cliente. Si tiene ventas registradas, no debe eliminarse.'
      );
    }
  };

  const cambiarEstadoCliente = async (cliente) => {
    const estaInactivo = cliente.estado === 'inactivo';
    const accion = estaInactivo ? 'activar' : 'desactivar';

    const confirmar = window.confirm(
      estaInactivo
        ? `¿Activar nuevamente al cliente ${cliente.nombre}?`
        : `¿Desactivar al cliente ${cliente.nombre}? Ya no aparecerá para nuevas ventas, pero conservará su historial.`
    );

    if (!confirmar) return;

    try {
      setError('');
      setMensaje('');

      await api.post(`/clientes/${cliente.id_cliente}/${accion}`);

      setMensaje(
        estaInactivo
          ? 'Cliente activado correctamente'
          : 'Cliente desactivado correctamente'
      );

      cargar();
    } catch (err) {
      setError(err.response?.data?.message || 'No se pudo cambiar el estado del cliente');
    }
  };

  const getClienteEstado = (cliente) => {
    if (cliente.estado === 'inactivo') {
      return {
        label: 'Inactivo',
        className: 'status-inactive',
      };
    }

    const totalGastado = Number(cliente.total_gastado) || 0;
    const compras = Number(cliente.compras) || 0;

    if (totalGastado >= 5000) {
      return {
        label: 'VIP',
        className: 'status-vip',
      };
    }

    if (compras > 0) {
      return {
        label: 'Frecuente',
        className: 'status-active',
      };
    }

    return {
      label: 'Nuevo',
      className: 'status-new',
    };
  };

  if (loading) {
    return (
      <div className="clients-loading">
        Cargando clientes...
      </div>
    );
  }

  return (
    <>
      <style>{`
        * {
          box-sizing: border-box;
        }

        .clients-loading {
          min-height: 100vh;
          background: #08090b;
          color: white;
          display: flex;
          align-items: center;
          justify-content: center;
          font-family: Inter, sans-serif;
        }

        .clients-page {
          min-height: 100vh;
          padding: 28px;
          background:
            radial-gradient(circle at top right, rgba(214,180,105,0.08), transparent 22%),
            linear-gradient(180deg, #08090b 0%, #101114 100%);
          color: white;
          font-family: Inter, system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
        }

        .clients-container {
          width: 100%;
          max-width: 1400px;
          margin: 0 auto;
        }

        .clients-hero {
          position: relative;
          overflow: hidden;
          min-height: 220px;
          border-radius: 30px;
          padding: 34px;
          display: flex;
          align-items: center;
          border: 1px solid rgba(255,255,255,0.10);
          background:
            radial-gradient(circle at top right, rgba(214,180,105,0.10), transparent 26%),
            linear-gradient(135deg, #08090b 0%, #131418 48%, #090a0c 100%);
          box-shadow: 0 24px 60px rgba(0,0,0,0.28);
        }

        .clients-hero::before {
          content: '';
          position: absolute;
          inset: 0;
          background:
            radial-gradient(circle at top left, rgba(255,255,255,0.06), transparent 28%),
            radial-gradient(circle at bottom right, rgba(214,180,105,0.12), transparent 30%);
          pointer-events: none;
        }

        .hero-content {
          position: relative;
          z-index: 1;
          max-width: 760px;
        }

        .eyebrow {
          display: inline-flex;
          width: fit-content;
          margin-bottom: 18px;
          padding: 10px 16px;
          border-radius: 999px;
          background: rgba(255,255,255,0.08);
          border: 1px solid rgba(255,255,255,0.14);
          font-size: 12px;
          letter-spacing: 2px;
          text-transform: uppercase;
          color: #f6f1e7;
        }

        .clients-hero h1 {
          margin: 0 0 14px;
          font-size: clamp(38px, 4.3vw, 54px);
          line-height: 1.05;
          letter-spacing: -1px;
          color: #ffffff;
          font-weight: 900;
          max-width: 760px;
        }

        .clients-hero p {
          margin: 0;
          max-width: 720px;
          color: rgba(255,255,255,0.88);
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
        .glass-card {
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
          grid-template-columns: 1.1fr 0.9fr;
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

        .form-grid,
        .filters-grid {
          display: grid;
          grid-template-columns: repeat(2, minmax(0, 1fr));
          gap: 14px;
        }

        .filters-grid {
          margin-top: 16px;
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

        .premium-input,
        .premium-textarea,
        .premium-select {
          width: 100%;
          border-radius: 16px;
          border: 1px solid rgba(255,255,255,0.12);
          background: rgba(255,255,255,0.04);
          color: white;
          outline: none;
          padding: 0 16px;
          font-size: 14px;
          transition: all 0.25s ease;
        }

        .premium-input,
        .premium-select {
          min-height: 54px;
        }

        .premium-select option {
          background: #111214;
          color: white;
        }

        .premium-textarea {
          min-height: 108px;
          padding-top: 14px;
          resize: vertical;
        }

        .premium-input:focus,
        .premium-textarea:focus,
        .premium-select:focus {
          border-color: rgba(214,180,105,0.85);
          box-shadow: 0 0 0 4px rgba(214,180,105,0.10);
        }

        .full-field {
          grid-column: 1 / -1;
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
          box-shadow: 0 12px 28px rgba(185,141,70,0.24);
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

        .btn-gold:hover,
        .btn-dark:hover,
        .btn-danger:hover {
          transform: translateY(-2px);
        }

        .btn-dark:disabled,
        .btn-gold:disabled,
        .btn-danger:disabled {
          opacity: 0.45;
          cursor: not-allowed;
          transform: none;
        }

        .search-row {
          display: flex;
          align-items: end;
          gap: 12px;
        }

        .search-row .field {
          flex: 1;
        }

        .search-meta {
          margin-top: 14px;
          color: rgba(255,255,255,0.62);
          font-size: 14px;
          line-height: 1.6;
        }

        .error-box,
        .success-box {
          margin-top: 18px;
          padding: 14px 16px;
          border-radius: 14px;
          font-size: 14px;
        }

        .error-box {
          background: rgba(220,38,38,0.12);
          border: 1px solid rgba(220,38,38,0.25);
          color: #fca5a5;
        }

        .success-box {
          background: rgba(34,197,94,0.12);
          border: 1px solid rgba(34,197,94,0.25);
          color: #86efac;
        }

        .clients-table-card {
          margin-top: 24px;
          overflow: hidden;
        }

        .table-wrapper {
          width: 100%;
          overflow-x: auto;
        }

        .clients-table {
          width: 100%;
          border-collapse: collapse;
          min-width: 1050px;
        }

        .clients-table thead {
          background: rgba(255,255,255,0.045);
        }

        .clients-table th {
          text-align: left;
          padding: 18px;
          color: rgba(255,255,255,0.64);
          font-size: 12px;
          text-transform: uppercase;
          letter-spacing: 1.4px;
          border-bottom: 1px solid rgba(255,255,255,0.08);
        }

        .clients-table td {
          padding: 18px;
          border-bottom: 1px solid rgba(255,255,255,0.07);
          vertical-align: middle;
        }

        .client-name {
          font-weight: 900;
          margin-bottom: 5px;
        }

        .client-sub {
          color: rgba(255,255,255,0.58);
          font-size: 13px;
        }

        .pill {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          padding: 8px 12px;
          border-radius: 999px;
          font-size: 12px;
          font-weight: 800;
          border: 1px solid rgba(255,255,255,0.10);
          background: rgba(255,255,255,0.05);
          color: rgba(255,255,255,0.86);
        }

        .status-vip {
          background: rgba(214,180,105,0.15);
          color: #f8e6b8;
          border-color: rgba(214,180,105,0.30);
        }

        .status-active {
          background: rgba(34,197,94,0.13);
          color: #86efac;
          border-color: rgba(34,197,94,0.25);
        }

        .status-new {
          background: rgba(59,130,246,0.13);
          color: #93c5fd;
          border-color: rgba(59,130,246,0.25);
        }

        .status-inactive {
          background: rgba(148,163,184,0.13);
          color: #cbd5e1;
          border-color: rgba(148,163,184,0.25);
        }

        .row-actions {
          display: flex;
          gap: 10px;
        }

        .pagination-row {
          margin-top: 22px;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 14px;
          color: rgba(255,255,255,0.72);
          font-weight: 700;
        }

        .empty-box {
          margin-top: 24px;
          padding: 34px;
          border-radius: 24px;
          border: 1px dashed rgba(255,255,255,0.14);
          text-align: center;
          color: rgba(255,255,255,0.66);
          background: rgba(255,255,255,0.03);
        }

        @media (max-width: 1200px) {
          .stats-grid {
            grid-template-columns: repeat(2, minmax(0, 1fr));
          }

          .toolbar {
            grid-template-columns: 1fr;
          }
        }

        @media (max-width: 760px) {
          .clients-page {
            padding: 16px;
          }

          .clients-hero {
            min-height: 240px;
            padding: 22px;
          }

          .clients-hero h1 {
            font-size: 36px;
          }

          .stats-grid,
          .form-grid,
          .filters-grid {
            grid-template-columns: 1fr;
          }

          .search-row,
          .row-actions,
          .pagination-row {
            flex-direction: column;
            align-items: stretch;
          }

          .full-field {
            grid-column: auto;
          }
        }
      `}</style>

      <div className="clients-page">
        <div className="clients-container">
          <section className="clients-hero">
            <div className="hero-content">
              <div className="eyebrow">Clientes premium</div>
              <h1>Clientes, historial de compras y fidelización.</h1>
              <p>
                Administra compradores, contacto, dirección y comportamiento de compra.
                Los filtros permiten manejar muchos registros sin saturar la tabla.
              </p>
            </div>
          </section>

          <section className="stats-grid">
            <div className="stat-card">
              <div className="stat-label">Total clientes</div>
              <div className="stat-value">{stats.total}</div>
              <div className="stat-accent">Base completa</div>
            </div>

            <div className="stat-card">
              <div className="stat-label">Activos</div>
              <div className="stat-value">{stats.activos}</div>
              <div className="stat-accent">Disponibles para venta</div>
            </div>

            <div className="stat-card">
              <div className="stat-label">Con compras</div>
              <div className="stat-value">{stats.conCompras}</div>
              <div className="stat-accent">Historial registrado</div>
            </div>

            <div className="stat-card">
              <div className="stat-label">Ingresos clientes</div>
              <div className="stat-value">{formatMoney(stats.ingresos)}</div>
              <div className="stat-accent">Ventas activas</div>
            </div>
          </section>

          <section className="toolbar">
            {esAdmin && (
              <div className="glass-card">
                <h2 className="card-title">
                  {editando ? 'Editar cliente' : 'Agregar cliente'}
                </h2>

                <p className="card-subtitle">
                  Completa los datos para que ventas y facturas se vean profesionales.
                </p>

                <div className="form-grid">
                  <div className="field">
                    <label>Nombre</label>
                    <input
                      className="premium-input"
                      placeholder="Ej. Donay Martinez"
                      value={form.nombre}
                      onChange={(e) => setForm({ ...form, nombre: e.target.value })}
                    />
                  </div>

                  <div className="field">
                    <label>Teléfono</label>
                    <input
                      className="premium-input"
                      placeholder="Ej. 809-000-0000"
                      value={form.telefono}
                      onChange={(e) => setForm({ ...form, telefono: e.target.value })}
                    />
                  </div>

                  <div className="field">
                    <label>Email</label>
                    <input
                      className="premium-input"
                      type="email"
                      placeholder="cliente@email.com"
                      value={form.email}
                      onChange={(e) => setForm({ ...form, email: e.target.value })}
                    />
                  </div>

                  <div className="field">
                    <label>Dirección</label>
                    <input
                      className="premium-input"
                      placeholder="Ej. Santo Domingo"
                      value={form.direccion}
                      onChange={(e) => setForm({ ...form, direccion: e.target.value })}
                    />
                  </div>
                </div>

                <div className="actions-row">
                  <button className="btn-gold" onClick={guardar}>
                    {editando ? 'Guardar cambios' : 'Agregar cliente'}
                  </button>

                  {editando && (
                    <button className="btn-dark" onClick={limpiarForm}>
                      Cancelar edición
                    </button>
                  )}
                </div>

                {error && <div className="error-box">{error}</div>}
                {mensaje && <div className="success-box">{mensaje}</div>}
              </div>
            )}

            <div className="glass-card">
              <h2 className="card-title">Explorar clientes</h2>
              <p className="card-subtitle">
                Busca, filtra y ordena clientes para manejar grandes volúmenes de información.
              </p>

              <div className="search-row">
                <div className="field">
                  <label>Búsqueda</label>
                  <input
                    className="premium-input"
                    placeholder="Buscar por nombre, email, teléfono o dirección..."
                    value={busqueda}
                    onChange={(e) => setBusqueda(e.target.value)}
                  />
                </div>

                <button className="btn-dark" onClick={limpiarFiltros}>
                  Limpiar
                </button>
              </div>

              <div className="filters-grid">
                <div className="field">
                  <label>Estado</label>
                  <select
                    className="premium-select"
                    value={estadoFiltro}
                    onChange={(e) => setEstadoFiltro(e.target.value)}
                  >
                    <option value="todos">Todos</option>
                    <option value="activos">Activos</option>
                    <option value="inactivos">Inactivos</option>
                  </select>
                </div>

                <div className="field">
                  <label>Compras</label>
                  <select
                    className="premium-select"
                    value={comprasFiltro}
                    onChange={(e) => setComprasFiltro(e.target.value)}
                  >
                    <option value="todos">Todos</option>
                    <option value="con-compras">Con compras</option>
                    <option value="sin-compras">Sin compras</option>
                  </select>
                </div>

                <div className="field">
                  <label>Ordenar por</label>
                  <select
                    className="premium-select"
                    value={ordenCliente}
                    onChange={(e) => setOrdenCliente(e.target.value)}
                  >
                    <option value="recientes">Más recientes</option>
                    <option value="nombre">Nombre A-Z</option>
                    <option value="compras-mayor">Más compras</option>
                    <option value="total-mayor">Mayor gasto</option>
                    <option value="total-menor">Menor gasto</option>
                  </select>
                </div>
              </div>

              <div className="search-meta">
                Mostrando {clientesPaginados.length} de {clientesFiltrados.length} clientes filtrados.
                Total registrados: {clientes.length}.
              </div>

              {!esAdmin && error && <div className="error-box">{error}</div>}
              {!esAdmin && mensaje && <div className="success-box">{mensaje}</div>}
            </div>
          </section>

          {clientesFiltrados.length === 0 ? (
            <div className="empty-box">
              No hay clientes para mostrar con los filtros seleccionados.
            </div>
          ) : (
            <section className="glass-card clients-table-card">
              <div className="table-wrapper">
                <table className="clients-table">
                  <thead>
                    <tr>
                      <th>Cliente</th>
                      <th>Contacto</th>
                      <th>Dirección</th>
                      <th>Compras</th>
                      <th>Total gastado</th>
                      <th>Última compra</th>
                      <th>Estado</th>
                      {esAdmin && <th>Acciones</th>}
                    </tr>
                  </thead>

                  <tbody>
                    {clientesPaginados.map((cliente) => {
                      const estado = getClienteEstado(cliente);

                      return (
                        <tr key={cliente.id_cliente}>
                          <td>
                            <div className="client-name">{cliente.nombre}</div>
                            <div className="client-sub">ID #{cliente.id_cliente}</div>
                          </td>

                          <td>
                            <div>{cliente.telefono || 'Sin teléfono'}</div>
                            <div className="client-sub">{cliente.email || 'Sin email'}</div>
                          </td>

                          <td>{cliente.direccion || 'Sin dirección'}</td>

                          <td>
                            <span className="pill">
                              {cliente.compras || 0} compras
                            </span>
                          </td>

                          <td>
                            <strong>{formatMoney(cliente.total_gastado)}</strong>
                          </td>

                          <td>{formatDate(cliente.ultima_compra)}</td>

                          <td>
                            <span className={`pill ${estado.className}`}>
                              {estado.label}
                            </span>
                          </td>

                          {esAdmin && (
                            <td>
                              <div className="row-actions">
                                <button className="btn-gold" onClick={() => editar(cliente)}>
                                  Editar
                                </button>

                                {Number(cliente.compras) > 0 ? (
                                  <button
                                    className={cliente.estado === 'inactivo' ? 'btn-gold' : 'btn-dark'}
                                    onClick={() => cambiarEstadoCliente(cliente)}
                                  >
                                    {cliente.estado === 'inactivo' ? 'Activar' : 'Desactivar'}
                                  </button>
                                ) : (
                                  <button className="btn-danger" onClick={() => eliminar(cliente)}>
                                    Eliminar
                                  </button>
                                )}
                              </div>
                            </td>
                          )}
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </section>
          )}

          {clientesFiltrados.length > clientesPorPagina && (
            <div className="pagination-row">
              <button
                className="btn-dark"
                onClick={() => setPaginaClientes((prev) => Math.max(1, prev - 1))}
                disabled={paginaClientes === 1}
              >
                Anterior
              </button>

              <span>
                Página {paginaClientes} de {totalPaginasClientes}
              </span>

              <button
                className="btn-dark"
                onClick={() => setPaginaClientes((prev) => Math.min(totalPaginasClientes, prev + 1))}
                disabled={paginaClientes === totalPaginasClientes}
              >
                Siguiente
              </button>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
