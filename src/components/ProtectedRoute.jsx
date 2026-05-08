import { useEffect, useState } from 'react'
import { Navigate } from 'react-router-dom'
import { supabase } from '../supabase'

export default function ProtectedRoute({ children, adminOnly = false }) {
  const [estado, setEstado] = useState('cargando')

  useEffect(() => {
    async function verificar() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { setEstado('sin-sesion'); return }
      if (!adminOnly) { setEstado('ok'); return }
      const { data } = await supabase
        .from('profiles')
        .select('rol')
        .eq('id', user.id)
        .single()
      setEstado(data?.rol === 'admin' ? 'ok' : 'sin-permiso')
    }
    verificar()
  }, [adminOnly])

  if (estado === 'cargando') return <div style={{padding:'2rem',textAlign:'center'}}>Verificando acceso...</div>
  if (estado === 'sin-sesion') return <Navigate to="/login" replace />
  if (estado === 'sin-permiso') return <Navigate to="/" replace />
  return children
}