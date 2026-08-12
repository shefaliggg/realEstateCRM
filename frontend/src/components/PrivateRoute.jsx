import { Navigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import Layout from './Layout'
import { getDefaultProduct } from '../config/products'

export default function PrivateRoute({ children, allowedRoles }) {
  const { user } = useAuth()
  if (!user) return <Navigate to="/login" replace />

  // Defense in depth: this app is builder-org-only. A platform-tier session
  // (no builderId) should never render protected UI here, even briefly —
  // the backend already 403s every builder-scoped route for such a session.
  if (!user.builderId) return <Navigate to="/login" replace />

  if (allowedRoles?.length && !allowedRoles.includes(user.role)) {
    return <Navigate to={getDefaultProduct(user.role).homePath} replace />
  }

  const alreadyWrappedWithLayout = children?.type === Layout
  return alreadyWrappedWithLayout ? children : <Layout>{children}</Layout>
}
