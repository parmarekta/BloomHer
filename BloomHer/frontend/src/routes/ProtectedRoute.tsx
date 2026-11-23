import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { useAuth } from '@/context/AuthContext'
import { roleHomePath } from '@/data/mock'
import type { UserRole } from '@/types'

export function ProtectedRoute({ role }: { role: UserRole }) {
  const { user } = useAuth()
  const location = useLocation()

  if (!user) {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />
  }

  if (user.role !== role) {
    return <Navigate to={roleHomePath[user.role]} replace />
  }

  return <Outlet />
}
