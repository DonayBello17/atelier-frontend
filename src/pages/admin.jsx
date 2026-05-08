import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { supabase } from '../supabase'

export default function Admin() {
  const [productos, setProductos] = useState([])
  const [categorias, setCategorias] = useState([])
  const [form, setForm] = useState({ nombre: '', marca: '', precio: '', id_categoria: '', imagen_url: '', descripcion: '' })
  const [cargando, setCargando] = useState(true)
  const [guardando, setGuardando] = useState(false)
  const [mensaje, setMensaje] = useState('')
  const [editando, setEditando] = useState(null)

  useEffect(() => { cargarDatos() }, [])

  async function cargarDatos() {
    const { data: prods } = await supabase.from('productos').select('*, categorias(nombre)').order('id_producto', { ascending: false })
    const { data: cats } = await supabase.from('categorias').select('*')
    if (prods) setProductos(prods)
    if (cats) setCategorias(cats)
    setCargando(false)
  }

  function handleChange(e) { setForm({ ...form, [e.target.name]: e.target.value }) }

  async function handleGuardar() {
    if (!form.nombre || !form.precio) return setMensaje('⚠️ Nombre y precio son obligatorios')
    setGuardando(true)
    const datos = { nombre: form.nombre, marca: form.marca, precio: parseFloat(form.precio), id_categoria: form.id_categoria || null, imagen_url: form.imagen_url || null, descripcion: form.descripcion || null }
    let error
    if (editando) {
      ({ error } = await supabase.from('productos').update(datos).eq('id_producto', editando))
    } else {
      ({ error } = await supabase.from('productos').insert(datos))
    }
    if (error) setMensaje('❌ Error: ' + error.message)
    else { setMensaje(editando ? '✅ Producto actualizado' : '✅ Producto agregado'); setForm({ nombre: '', marca: '', precio: '', id_categoria: '', imagen_url: '', descripcion: '' }); setEditando(null); cargarDatos() }
    setGuardando(false)
    setTimeout(() => setMensaje(''), 3000)
  }

  async function handleEliminar(id) {
    if (!confirm('¿Eliminar este producto?')) return
    await supabase.from('productos').delete().eq('id_producto', id)
    cargarDatos()
  }

  function handleEditar(p) {
    setEditando(p.id_producto)
    setForm({ nombre: p.nombre || '', marca: p.marca || '', precio: p.precio || '', id_categoria: p.id_categoria || '', imagen_url: p.imagen_url || '', descripcion: p.descripcion || '' })
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700&family=DM+Sans:wght@300;400;500&display=swap');
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        body { font-family: 'DM Sans', sans-serif; background: #fafaf8; color: #1a1a1a; }
        .admin-wrap { max-width: 1000px; margin: 0 auto; padding: 2rem; }
        .admin-header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 2rem; }
        .admin-logo { font-family: 'Playfair Display', serif; font-size: 1.5rem; font-weight: 700; }
        .admin-logo span { color: #c8a96e; }
        .volver-link { font-size: 0.82rem; color: #999; text-decoration: none; }
        .volver-link:hover { color: #c8a96e; }
        .card { background: #fff; border-radius: 16px; border: 1px solid #eeeee8; padding: 1.5rem; margin-bottom: 1.5rem; }
        .card h3 { font-family: 'Playfair Display', serif; font-size: 1.1rem; margin-bottom: 1.2rem; }
        .form-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 0.75rem; }
        .campo { margin-bottom: 0 }
        .campo label { display: block; font-size: 0.78rem; font-weight: 500; margin-bottom: 0.3rem; color: #555; }
        .campo input, .campo select, .campo textarea { width: 100%; padding: 0.6rem 0.8rem; border: 1.5px solid #e0e0da; border-radius: 8px; font-family: 'DM Sans', sans-serif; font-size: 0.88rem; outline: none; transition: border-color 0.2s; background: #fafaf8; }
        .campo input:focus, .campo select:focus, .campo textarea:focus { border-color: #c8a96e; background: #fff; }
        .campo textarea { resize: vertical; min-height: 72px; }
        .campo-full { grid-column: 1 / -1; }
        .guardar-btn { background: #1a1a1a; color: #fff; border: none; border-radius: 10px; padding: 0.75rem 1.5rem; font-family: 'DM Sans', sans-serif; font-size: 0.9rem; cursor: pointer; margin-top: 1rem; transition: background 0.2s; }
        .guardar-btn:hover { background: #c8a96e; }
        .guardar-btn:disabled { opacity: 0.6; cursor: not-allowed; }
        .cancelar-btn { background: none; border: 1px solid #e0e0da; border-radius: 10px; padding: 0.75rem 1.2rem; font-family: 'DM Sans', sans-serif; font-size: 0.9rem; cursor: pointer; margin-top: 1rem; margin-left: 0.5rem; color: #555; }
        .cancelar-btn:hover { border-color: #999; }
        .mensaje { border-radius: 8px; padding: 0.6rem 0.8rem; font-size: 0.82rem; margin-bottom: 1rem; background: #f0fff4; color: #27ae60; }
        .tabla { width: 100%; border-collapse: collapse; font-size: 0.88rem; }
        .tabla th { text-align: left; padding: 0.6rem 0.8rem; border-bottom: 2px solid #f0f0ea; color: #999; font-weight: 500; font-size: 0.78rem; text-transform: uppercase; letter-spacing: 0.05em; }
        .tabla td { padding: 0.7rem 0.8rem; border-bottom: 1px solid #f5f5f0; vertical-align: middle; }
        .tabla tr:hover td { background: #fafaf8; }
        .editar-btn { background: none; border: 1px solid #e0e0da; border-radius: 6px; padding: 0.3rem 0.7rem; font-size: 0.78rem; cursor: pointer; color: #555; margin-right: 0.3rem; }
        .editar-btn:hover { border-color: #c8a96e; color: #c8a96e; }
        .eliminar-btn { background: none; border: 1px solid #ffd0d0; border-radius: 6px; padding: 0.3rem 0.7rem; font-size: 0.78rem; cursor: pointer; color: #e74c3c; }
        .eliminar-btn:hover { background: #fff0f0; }
        .badge { background: #f5f5f0; border-radius: 999px; padding: 0.15rem 0.6rem; font-size: 0.75rem; color: #888; }
      `}</style>
      <div className="admin-wrap">
        <div className="admin-header">
          <div className="admin-logo">VESTI<span>R</span> — Admin</div>
          <Link to="/" className="volver-link">← Volver a la tienda</Link>
        </div>

        <div className="card">
          <h3>{editando ? '✏️ Editar producto' : '➕ Agregar producto'}</h3>
          {mensaje && <div className="mensaje">{mensaje}</div>}
          <div className="form-grid">
            <div className="campo"><label>Nombre *</label><input name="nombre" value={form.nombre} onChange={handleChange} placeholder="Camiseta básica" /></div>
            <div className="campo"><label>Marca</label><input name="marca" value={form.marca} onChange={handleChange} placeholder="Nike" /></div>
            <div className="campo"><label>Precio *</label><input name="precio" type="number" value={form.precio} onChange={handleChange} placeholder="25" /></div>
            <div className="campo"><label>Categoría</label>
              <select name="id_categoria" value={form.id_categoria} onChange={handleChange}>
                <option value="">Sin categoría</option>
                {categorias.map(c => <option key={c.id_categoria} value={c.id_categoria}>{c.nombre}</option>)}
              </select>
            </div>
            <div className="campo campo-full"><label>URL de imagen</label><input name="imagen_url" value={form.imagen_url} onChange={handleChange} placeholder="https://..." /></div>
            <div className="campo campo-full"><label>Descripción</label><textarea name="descripcion" value={form.descripcion} onChange={handleChange} placeholder="Describe el producto..." /></div>
          </div>
          <button className="guardar-btn" onClick={handleGuardar} disabled={guardando}>{guardando ? 'Guardando...' : editando ? 'Actualizar' : 'Agregar producto'}</button>
          {editando && <button className="cancelar-btn" onClick={() => { setEditando(null); setForm({ nombre:'',marca:'',precio:'',id_categoria:'',imagen_url:'',descripcion:'' }) }}>Cancelar</button>}
        </div>

        <div className="card">
          <h3>Productos ({productos.length})</h3>
          {cargando ? <p style={{color:'#aaa'}}>Cargando...</p> : (
            <table className="tabla">
              <thead><tr><th>Nombre</th><th>Marca</th><th>Precio</th><th>Categoría</th><th>Acciones</th></tr></thead>
              <tbody>
                {productos.map(p => (
                  <tr key={p.id_producto}>
                    <td>{p.nombre}</td>
                    <td><span className="badge">{p.marca || '—'}</span></td>
                    <td>${p.precio}</td>
                    <td>{p.categorias?.nombre || '—'}</td>
                    <td>
                      <button className="editar-btn" onClick={() => handleEditar(p)}>Editar</button>
                      <button className="eliminar-btn" onClick={() => handleEliminar(p.id_producto)}>Eliminar</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </>
  )
}