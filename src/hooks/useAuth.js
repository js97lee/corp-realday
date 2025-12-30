import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { getUserRole, USER_ROLES } from '../utils/auth'

/**
 * 인증 및 권한 체크 커스텀 훅
 */
export function useAuth(requiredRole = null, redirectPath = '/admin') {
  const navigate = useNavigate()

  useEffect(() => {
    const token = localStorage.getItem('authToken')
    if (!token) {
      navigate(redirectPath)
      return
    }

    if (requiredRole) {
      const userRole = getUserRole()
      if (userRole !== requiredRole && userRole !== USER_ROLES.SUPER_ADMIN) {
        navigate('/admin/dashboard')
        return
      }
    }
  }, [navigate, requiredRole, redirectPath])

  return {
    isAuthenticated: !!localStorage.getItem('authToken'),
    userRole: getUserRole(),
  }
}



