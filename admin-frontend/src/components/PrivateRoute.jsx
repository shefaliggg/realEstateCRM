import { Navigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import Layout from './Layout'

export default function PrivateRoute({ children }) {
  const { user } = useAuth()
  if (!user) return <Navigate to="/login" replace />
  // Platform staff never have a builderId — if one somehow ended up here
  // (shared login endpoint), bounce them rather than render admin UI.
  if (user.builderId) return <Navigate to="/login" replace />

  return <Layout>{children}</Layout>
}
