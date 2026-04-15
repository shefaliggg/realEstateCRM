import { Navigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import Layout from './Layout'

export default function PrivateRoute({ children, allowedRoles }) {
  const { user } = useAuth()
  if (!user) return <Navigate to="/login" replace />

  if (allowedRoles?.length && !allowedRoles.includes(user.role)) {
    return <Navigate to="/dashboard" replace />
  }

  const alreadyWrappedWithLayout = children?.type === Layout
  return alreadyWrappedWithLayout ? children : <Layout>{children}</Layout>
}
