// 권한 관리 유틸리티

export const USER_ROLES = {
  CEO: 'ceo',                       // 최고관리자 (CEO)
  CTO: 'cto',                       // CTO
  CMO: 'cmo',                       // CMO
  DIRECTOR: 'director',             // 중간관리자 (Director)
  PRO: 'pro',                       // 직원 (Pro)
  PRO1: 'pro1',                     // 직원 (Pro1)
  PRO2: 'pro2',                     // 직원 (Pro2)
  PRO3: 'pro3',                     // 직원 (Pro3)
  // 하위 호환성을 위한 기존 역할 (deprecated)
  SUPER_ADMIN: 'ceo',               // CEO로 매핑
  MANAGER: 'director',              // Director로 매핑
  EMPLOYEE: 'pro'                   // Pro로 매핑
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
    [USER_ROLES.CEO]: 8,
    [USER_ROLES.CTO]: 7,
    [USER_ROLES.CMO]: 7,
    [USER_ROLES.DIRECTOR]: 5,
    [USER_ROLES.PRO]: 3,
    [USER_ROLES.PRO1]: 3,
    [USER_ROLES.PRO2]: 3,
    [USER_ROLES.PRO3]: 3,
    // 하위 호환성
    [USER_ROLES.SUPER_ADMIN]: 8,
    [USER_ROLES.MANAGER]: 5,
    [USER_ROLES.EMPLOYEE]: 3,
  }

  return roleHierarchy[userRole] >= roleHierarchy[requiredRole]
}

// 최고 관리자 확인 (CEO)
export const isSuperAdmin = () => {
  const role = getUserRole()
  return role === USER_ROLES.CEO || role === USER_ROLES.SUPER_ADMIN
}

// 중간 관리자 이상 확인 (Director 이상)
export const isManagerOrAbove = () => {
  const role = getUserRole()
  return role === USER_ROLES.CEO || 
         role === USER_ROLES.CTO || 
         role === USER_ROLES.CMO || 
         role === USER_ROLES.DIRECTOR ||
         role === USER_ROLES.SUPER_ADMIN ||
         role === USER_ROLES.MANAGER
}




