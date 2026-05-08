import { useEffect, useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { supabase } from '../supabase'

const PLACEHOLDER = (name) =>
  `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&size=300&background=f0f0f0&color=555&bold=true&format=svg`

export default function Tienda() {
  const [productos, setProductos] = useState([])
  const [categorias, setCategorias] = useState([])
  const [busqueda, setBusqueda] = useState('')
  const [categoriaActiva, setCategoriaActiva] = useState('Todas')
  const [carrito, setCarrito] = useState([])
  const [carritoAbierto, setCarritoAbierto] = useState(false)
  const [cargando, setCargando] = useState(true)
  const [usuario, setUsuario] = useState(null)
  const navigate = useNavigate()

  useEffect(() => {
    async function cargarDatos() {
      const { data: { user } } = await supabase.auth.getUser()
      setUsuario(user)
      const { data: prods } = await supabase.from('productos').select('*, categorias(nombre)')
      const { data: cats } = await supabase.from('categorias').select('*')
      if (prods) setProductos(prods)
      if (cats) setCategorias(cats)
      setCargando(false)
    }
    cargarDatos()
  }, [])

  const agregarAlCarrito = (producto) => {
    setCarrito((prev) => {
      const existe = prev.find((p) => p.id_producto === producto.id_producto)
      if (existe) return prev.map((p) => p.id_producto === producto.id_producto ? { ...p, cantidad: p.cantidad + 1 } : p)
      return [...prev, { ...producto, cantidad: 1 }]
    })
  }

  const quitarDelCarrito = (id) => setCarrito((prev) => prev.filter((p) => p.id_producto !== id))
  const totalCarrito = carrito.reduce((acc, p) => acc + p.precio * p.cantidad, 0)
  const cantidadCarrito = carrito.reduce((acc, p) => acc + p.cantidad, 0)

  const productosFiltrados = productos.filter((p) => {
    const coincideBusqueda = p.nombre?.toLowerCase().includes(busqueda.toLowerCase()) || p.marca?.toLowerCase().includes(busqueda.toLowerCase())
    const coincideCategoria = categoriaActiva === 'Todas' || p.categorias?.nombre === categoriaActiva
    return coincideBusqueda && coincideCategoria
  })

  async function cerrarSesion() {
    await supabase.auth.signOut()
    setUsuario(null)
  }

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;700&family=DM+Sans:wght@300;400;500&display=swap');
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        body { font-family: 'DM Sans', sans-serif; background: #fafaf8; color: #1a1a1a; min-height: 100vh; }
        .navbar { position: sticky; top: 0; z-index: 100; background: rgba(250,250,248,0.92); backdrop-filter: blur(12px); border-bottom: 1px solid #e8e8e4; padding: 0 2rem; display: flex; align-items: center; justify-content: space-between; height: 64px; gap: 1rem; }
        .navbar-logo { font-family: 'Playfair Display', serif; font-size: 1.5rem; font-weight: 700; letter-spacing: -0.02em; color: #1a1a1a; text-decoration: none; }
        .navbar-logo span { color: #c8a96e; }
        .navbar-right { display: flex; align-items: center; gap: 0.75rem; }
        .search-bar { display: flex; align-items: center; background: #f0f0ec; border: 1px solid #e0e0da; border-radius: 999px; padding: 0.4rem 1rem; gap: 0.5rem; width: 280px; transition: all 0.2s; }
        .search-bar:focus-within { border-color: #c8a96e; background: #fff; box-shadow: 0 0 0 3px rgba(200,169,110,0.15); }
        .search-bar input { border: none; background: transparent; font-family: 'DM Sans', sans-serif; font-size: 0.875rem; width: 100%; outline: none; color: #1a1a1a; }
        .cart-btn { position: relative; background: #1a1a1a; color: #fff; border: none; border-radius: 999px; padding: 0.5rem 1.2rem; font-family: 'DM Sans', sans-serif; font-size: 0.875rem; cursor: pointer; display: flex; align-items: center; gap: 0.5rem; transition: background 0.2s; }
        .cart-btn:hover { background: #c8a96e; }
        .cart-badge { background: #c8a96e; color: #fff; border-radius: 999px; padding: 0.1rem 0.45rem; font-size: 0.75rem; font-weight: 700; min-width: 20px; text-align: center; }
        .nav-link { font-size: 0.82rem; color: #555; text-decoration: none; padding: 0.4rem 0.8rem; border-radius: 999px; border: 1px solid #e0e0da; transition: all 0.2s; white-space: nowrap; }
        .nav-link:hover { border-color: #c8a96e; color: #c8a96e; }
        .nav-link.admin { background: #1a1a1a; color: #fff; border-color: #1a1a1a; }
        .nav-link.admin:hover { background: #c8a96e; border-color: #c8a96e; }
        .filtros { display: flex; gap: 0.5rem; padding: 1.5rem 2rem 0; flex-wrap: wrap; }
        .filtro-btn { padding: 0.35rem 1rem; border-radius: 999px; border: 1.5px solid #e0e0da; background: transparent; font-family: 'DM Sans', sans-serif; font-size: 0.8rem; cursor: pointer; transition: all 0.2s; color: #555; }
        .filtro-btn:hover { border-color: #c8a96e; color: #c8a96e; }
        .filtro-btn.activo { background: #1a1a1a; color: #fff; border-color: #1a1a1a; }
        .hero-text { padding: 2.5rem 2rem 1rem; }
        .hero-text h1 { font-family: 'Playfair Display', serif; font-size: clamp(2rem, 5vw, 3.5rem); font-weight: 700; line-height: 1.1; letter-spacing: -0.03em; }
        .hero-text p { color: #888; font-size: 0.9rem; margin-top: 0.5rem; }
        .grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(260px, 1fr)); gap: 1.5rem; padding: 1.5rem 2rem 4rem; }
        .card { background: #fff; border-radius: 16px; overflow: hidden; border: 1px solid #eeeee8; transition: transform 0.25s, box-shadow 0.25s; display: flex; flex-direction: column; cursor: pointer; }
        .card:hover { transform: translateY(-4px); box-shadow: 0 16px 40px rgba(0,0,0,0.08); }
        .card-img { width: 100%; aspect-ratio: 4/3; object-fit: cover; background: #f5f5f0; display: block; }
        .card-body { padding: 1.2rem; flex: 1; display: flex; flex-direction: column; }
        .card-categoria { font-size: 0.7rem; text-transform: uppercase; letter-spacing: 0.1em; color: #c8a96e; font-weight: 500; margin-bottom: 0.3rem; }
        .card-nombre { font-family: 'Playfair Display', serif; font-size: 1.1rem; font-weight: 700; line-height: 1.3; margin-bottom: 0.3rem; }
        .card-marca { font-size: 0.8rem; color: #999; margin-bottom: auto; }
        .card-footer { display: flex; align-items: center; justify-content: space-between; margin-top: 1rem; padding-top: 1rem; border-top: 1px solid #f0f0ea; }
        .card-precio { font-size: 1.2rem; font-weight: 700; color: #1a1a1a; }
        .add-btn { background: #1a1a1a; color: #fff; border: none; border-radius: 999px; padding: 0.45rem 1rem; font-size: 0.8rem; font-family: 'DM Sans', sans-serif; cursor: pointer; transition: background 0.2s; }
        .add-btn:hover { background: #c8a96e; }
        .overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.3); z-index: 200; backdrop-filter: blur(2px); }
        .carrito-panel { position: fixed; top: 0; right: 0; bottom: 0; width: min(420px, 100vw); background: #fff; z-index: 201; display: flex; flex-direction: column; box-shadow: -8px 0 40px rgba(0,0,0,0.12); animation: slideIn 0.3s ease; }
        @keyframes slideIn { from { transform: translateX(100%); } to { transform: translateX(0); } }
        .carrito-header { display: flex; align-items: center; justify-content: space-between; padding: 1.5rem 1.5rem 1rem; border-bottom: 1px solid #f0f0ea; }
        .carrito-header h2 { font-family: 'Playfair Display', serif; font-size: 1.4rem; }
        .close-btn { background: none; border: none; font-size: 1.4rem; cursor: pointer; color: #888; }
        .carrito-items { flex: 1; overflow-y: auto; padding: 1rem 1.5rem; }
        .carrito-item { display: flex; gap: 1rem; align-items: center; padding: 0.8rem 0; border-bottom: 1px solid #f5f5f0; }
        .carrito-item-info { flex: 1; }
        .carrito-item-nombre { font-weight: 500; font-size: 0.9rem; }
        .carrito-item-precio { font-size: 0.8rem; color: #888; }
        .carrito-item-qty { background: #f0f0ec; border-radius: 999px; padding: 0.2rem 0.6rem; font-size: 0.8rem; font-weight: 600; }
        .quitar-btn { background: none; border: none; color: #ccc; cursor: pointer; font-size: 1.1rem; transition: color 0.2s; }
        .quitar-btn:hover { color: #e74c3c; }
        .carrito-footer { padding: 1.5rem; border-top: 1px solid #f0f0ea; }
        .carrito-total { display: flex; justify-content: space-between; font-size: 1.1rem; font-weight: 700; margin-bottom: 1rem; }
        .checkout-btn { width: 100%; background: #1a1a1a; color: #fff; border: none; border-radius: 12px; padding: 1rem; font-family: 'DM Sans', sans-serif; font-size: 1rem; cursor: pointer; transition: background 0.2s; }
        .checkout-btn:hover { background: #c8a96e; }
        .empty { text-align: center; color: #aaa; padding: 3rem 0; font-size: 0.9rem; }
        .loading { text-align: center; padding: 4rem; color: #aaa; }
        .usuario-info { font-size: 0.78rem; color: #999; max-width: 140px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
      `}</style>

      <nav className="navbar">
        <Link to="/" className="navbar-logo">VESTI<span>R</span></Link>
        <div className="search-bar">
          <span>🔍</span>
          <input placeholder="Buscar producto o marca..." value={busqueda} onChange={(e) => setBusqueda(e.target.value)} />
        </div>
        <div className="navbar-right">
          {usuario ? (
            <>
              <span className="usuario-info">{usuario.email}</span>
              <Link to="/admin" className="nav-link admin">Admin</Link>
              <button className="nav-link" style={{border:'1px solid #e0e0da',background:'none',cursor:'pointer'}} onClick={cerrarSesion}>Salir</button>
            </>
          ) : (
            <Link to="/login" className="nav-link">Iniciar sesión</Link>
          )}
          <button className="cart-btn" onClick={() => setCarritoAbierto(true)}>
            🛍 Carrito {cantidadCarrito > 0 && <span className="cart-badge">{cantidadCarrito}</span>}
          </button>
        </div>
      </nav>

      <div className="filtros">
        {['Todas', ...categorias.map((c) => c.nombre)].map((cat) => (
          <button key={cat} className={`filtro-btn ${categoriaActiva === cat ? 'activo' : ''}`} onClick={() => setCategoriaActiva(cat)}>{cat}</button>
        ))}
      </div>

      <div className="hero-text">
        <h1>Nueva Colección</h1>
        <p>{productosFiltrados.length} productos encontrados</p>
      </div>

      {cargando ? <div className="loading">Cargando productos...</div> : productosFiltrados.length === 0 ? <div className="empty">No se encontraron productos.</div> : (
        <div className="grid">
          {productosFiltrados.map((p) => (
            <div className="card" key={p.id_producto} onClick={() => navigate(`/producto/${p.id_producto}`)}>
              <img className="card-img" src={p.imagen_url || PLACEHOLDER(p.nombre)} alt={p.nombre} onError={(e) => { e.target.src = PLACEHOLDER(p.nombre) }} />
              <div className="card-body">
                <div className="card-categoria">{p.categorias?.nombre}</div>
                <div className="card-nombre">{p.nombre}</div>
                <div className="card-marca">{p.marca}</div>
                <div className="card-footer">
                  <span className="card-precio">${p.precio}</span>
                  <button className="add-btn" onClick={(e) => { e.stopPropagation(); agregarAlCarrito(p) }}>+ Agregar</button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {carritoAbierto && (
        <>
          <div className="overlay" onClick={() => setCarritoAbierto(false)} />
          <div className="carrito-panel">
            <div className="carrito-header">
              <h2>Tu carrito</h2>
              <button className="close-btn" onClick={() => setCarritoAbierto(false)}>✕</button>
            </div>
            <div className="carrito-items">
              {carrito.length === 0 ? <div className="empty">Tu carrito está vacío</div> : carrito.map((p) => (
                <div className="carrito-item" key={p.id_producto}>
                  <div className="carrito-item-info">
                    <div className="carrito-item-nombre">{p.nombre}</div>
                    <div className="carrito-item-precio">${p.precio} × {p.cantidad}</div>
                  </div>
                  <span className="carrito-item-qty">{p.cantidad}</span>
                  <button className="quitar-btn" onClick={() => quitarDelCarrito(p.id_producto)}>✕</button>
                </div>
              ))}
            </div>
            <div className="carrito-footer">
              <div className="carrito-total"><span>Total</span><span>${totalCarrito.toFixed(2)}</span></div>
              <button className="checkout-btn" onClick={() => { setCarritoAbierto(false); navigate('/checkout', { state: { carrito } }) }}>Proceder al pago →</button>
            </div>
          </div>
        </>
      )}
    </>
  )
}