import { Navigate, Outlet } from 'react-router-dom'
import { useAuth } from '../Providers/AuthProvider'
import { isGlobalAdmin } from '../utils/adminAccess'

const AdminRoute = () => {
  const { user } = useAuth()
  return isGlobalAdmin(user) ? <Outlet /> : <Navigate to='/' replace />
}

export default AdminRoute
