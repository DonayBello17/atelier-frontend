import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { supabase } from '../supabase'

export default function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [modo, setModo] = useState('login')
  const [error, setError] = useState('')
  const [mensaje, setMensaje] = useState('')
  const [cargando, setCargando] = useState(false)
  const navigate = useNavigate()

  async function handleSubmit() {
    setCargando(true)
    setError('')
    setMensaje('')
    if (modo === 'login') {
      const { error } = await supabase.auth.signInWithPassword({ email, password })
      if (error) setError('Correo o contraseña incorrectos')
      else navigate('/')
    } else {
      const { error } = await supabase.auth.signUp({ email, password })
      if (error) setError(error.message)
      else setMensaje('¡Registro exitoso! Revisa tu correo para confirmar.')
    }
    setCargando(false)
  }

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700&family=DM+Sans:wght@300;400;500&display=swap');
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        body { font-family: 'DM Sans', sans-serif; background: #fafaf8; }
        .login-wrap { min-height: 100vh; display: flex; align-items: center; justify-content: center; padding: 2rem; }
        .login-card { background: #fff; border-radius: 20px; border: 1px solid #eeeee8; padding: 2.5rem; width: 100%; max-width: 400px; box-shadow: 0 8px 40px rgba(0,0,0,0.06); }
        .login-logo { font-family: 'Playfair Display', serif; font-size: 1.8rem; font-weight: 700; text-align: center; margin-bottom: 0.3rem; }
        .login-logo span { color: #c8a96e; }
        .login-sub { text-align: center; color: #999; font-size: 0.85rem; margin-bottom: 2rem; }
        .tabs { display: flex; margin-bottom: 1.5rem; border-bottom: 2px solid #f0f0ea; }
        .tab { flex: 1; padding: 0.6rem; text-align: center; font-size: 0.85rem; font-weight: 500; cursor: pointer; border: none; background: none; color: #999; border-bottom: 2px solid transparent; margin-bottom: -2px; transition: all 0.2s; }
        .tab.activo { color: #1a1a1a; border-bottom-color: #1a1a1a; }
        .campo { margin-bottom: 1rem; }
        .campo label { display: block; font-size: 0.8rem; font-weight: 500; margin-bottom: 0.4rem; color: #555; }
        .campo input { width: 100%; padding: 0.7rem 1rem; border: 1.5px solid #e0e0da; border-radius: 10px; font-family: 'DM Sans', sans-serif; font-size: 0.9rem; outline: none; transition: border-color 0.2s; background: #fafaf8; }
        .campo input:focus { border-color: #c8a96e; background: #fff; }
        .btn-submit { width: 100%; background: #1a1a1a; color: #fff; border: none; border-radius: 10px; padding: 0.85rem; font-family: 'DM Sans', sans-serif; font-size: 0.95rem; font-weight: 500; cursor: pointer; margin-top: 0.5rem; transition: background 0.2s; }
        .btn-submit:hover { background: #c8a96e; }
        .btn-submit:disabled { opacity: 0.6; cursor: not-allowed; }
        .error { background: #fff0f0; color: #c0392b; border-radius: 8px; padding: 0.6rem 0.8rem; font-size: 0.82rem; margin-bottom: 1rem; }
        .mensaje { background: #f0fff4; color: #27ae60; border-radius: 8px; padding: 0.6rem 0.8rem; font-size: 0.82rem; margin-bottom: 1rem; }
        .volver { display: block; text-align: center; margin-top: 1.2rem; font-size: 0.82rem; color: #999; text-decoration: none; }
        .volver:hover { color: #c8a96e; }
      `}</style>
      <div className="login-wrap">
        <div className="login-card">
          <div className="login-logo">VESTI<span>R</span></div>
          <div className="login-sub">Tu tienda de moda</div>
          <div className="tabs">
            <button className={`tab ${modo === 'login' ? 'activo' : ''}`} onClick={() => setModo('login')}>Iniciar sesión</button>
            <button className={`tab ${modo === 'registro' ? 'activo' : ''}`} onClick={() => setModo('registro')}>Registrarse</button>
          </div>
          {error && <div className="error">{error}</div>}
          {mensaje && <div className="mensaje">{mensaje}</div>}
          <div className="campo">
            <label>Correo electrónico</label>
            <input type="email" placeholder="tu@correo.com" value={email} onChange={e => setEmail(e.target.value)} />
          </div>
          <div className="campo">
            <label>Contraseña</label>
            <input type="password" placeholder="••••••••" value={password} onChange={e => setPassword(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleSubmit()} />
          </div>
          <button className="btn-submit" onClick={handleSubmit} disabled={cargando}>
            {cargando ? 'Cargando...' : modo === 'login' ? 'Entrar' : 'Crear cuenta'}
          </button>
          <Link to="/" className="volver">← Volver a la tienda</Link>
        </div>
      </div>
    </>
  )
}