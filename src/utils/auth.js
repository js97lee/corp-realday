// 권한 관리 유틸리티

export const USER_ROLES = {
  SUPER_ADMIN: 'super_admin',      // 최고관리자
  MANAGER: 'manager',              // 중간관리자
  EMPLOYEE: 'employee'             // 직원
}

// 현재 사용자 권한 가져오기
export const getUserRole = () => {
  const user = localStorage.getItem('user')
  if (!user) return null
  
  try {
    const userData = JSON.parse(user)
    return userData.role || USER_ROLES.EMPLOYEE
  } catch {
    return null
  }
}

// 권한 확인
export const hasPermission = (requiredRole) => {
  const userRole = getUserRole()
  if (!userRole) return false

  const roleHierarchy = {
    [USER_ROLES.SUPER_ADMIN]: 3,
    [USER_ROLES.MANAGER]: 2,
    [USER_ROLES.EMPLOYEE]: 1,
  }

  return roleHierarchy[userRole] >= roleHierarchy[requiredRole]
}

// 최고 관리자 확인
export const isSuperAdmin = () => {
  return getUserRole() === USER_ROLES.SUPER_ADMIN
}

// 중간 관리자 이상 확인
export const isManagerOrAbove = () => {
  const role = getUserRole()
  return role === USER_ROLES.SUPER_ADMIN || role === USER_ROLES.MANAGER
}


