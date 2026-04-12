import { Navigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import Layout from './Layout'

export default function PrivateRoute({ children }) {
  const { user } = useAuth()
  if (!user) return <Navigate to="/login" replace />

  // Guard against accidental nested layout wrappers in page components.
  const alreadyWrappedWithLayout = children?.type === Layout
  return alreadyWrappedWithLayout ? children : <Layout>{children}</Layout>
}
