import { useEffect, useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import AdminProjects from './AdminProjects'
import AdminContacts from './AdminContacts'
import AdminFinance from './AdminFinance'
import AdminTasks from './AdminTasks'
import AdminMembers from './AdminMembers'
import { getUserRole, USER_ROLES, isSuperAdmin, isManagerOrAbove } from '../utils/auth'

function AdminDashboard() {
  const [user, setUser] = useState(null)
  const [activeMenu, setActiveMenu] = useState('dashboard')
  const navigate = useNavigate()
  const location = useLocation()

  useEffect(() => {
    // 로그인 상태 확인
    const token = localStorage.getItem('authToken')
    const userData = localStorage.getItem('user')

    if (!token || !userData) {
      // 로그인되지 않았으면 로그인 페이지로 리다이렉트
      navigate('/admin')
      return
    }

    try {
      setUser(JSON.parse(userData))
    } catch (error) {
      console.error('User data parse error:', error)
      navigate('/admin')
    }
  }, [navigate])

  const handleLogout = () => {
    localStorage.removeItem('authToken')
    localStorage.removeItem('user')
    navigate('/admin')
  }

  const [userRole, setUserRole] = useState(null)

  useEffect(() => {
    if (user) {
      setUserRole(user.role || 'employee')
    } else {
      const role = getUserRole()
      setUserRole(role)
    }
  }, [user])

  const allMenuItems = [
    { id: 'dashboard', label: '대시보드', icon: 'M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6', roles: [USER_ROLES.SUPER_ADMIN, USER_ROLES.MANAGER, USER_ROLES.EMPLOYEE] },
    { id: 'projects', label: '프로젝트 관리', icon: 'M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10', roles: [USER_ROLES.SUPER_ADMIN, USER_ROLES.MANAGER, USER_ROLES.EMPLOYEE] },
    { id: 'contacts', label: '문의하기 관리', icon: 'M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z', roles: [USER_ROLES.SUPER_ADMIN, USER_ROLES.MANAGER] },
    { id: 'tasks', label: '업무 진행상황', icon: 'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2', roles: [USER_ROLES.SUPER_ADMIN, USER_ROLES.MANAGER, USER_ROLES.EMPLOYEE] },
    { id: 'finance', label: '재무 관리', icon: 'M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z', roles: [USER_ROLES.SUPER_ADMIN] },
    { id: 'members', label: '멤버 관리', icon: 'M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z', roles: [USER_ROLES.SUPER_ADMIN] },
  ]

  // 권한에 따라 메뉴 필터링
  const menuItems = allMenuItems.filter(item => {
    if (!userRole) return false
    return item.roles.includes(userRole)
  })

  return (
    <div className="min-h-screen flex" style={{ backgroundColor: '#aaaaaa' }}>
      {/* Left Navigation Bar (LNB) */}
      <aside className="w-64 bg-black border-r border-gray-800 flex-shrink-0">
        <div className="h-full flex flex-col">
          {/* Logo/Header */}
          <div className="p-6 border-b border-gray-800">
            <button
              onClick={() => window.location.href = '/'}
              className="text-left w-full hover:opacity-80 transition-opacity"
            >
              <h1 className="text-xl font-bold text-white">REAL DAY</h1>
              <p className="text-xs text-gray-400 mt-1">Admin Panel</p>
            </button>
          </div>

          {/* Navigation Menu */}
          <nav className="flex-1 p-4">
            <ul className="space-y-2">
              {menuItems.map((item) => (
                <li key={item.id}>
                  <button
                    onClick={() => setActiveMenu(item.id)}
                    className={`w-full flex items-center px-4 py-3 rounded-lg transition-colors ${
                      activeMenu === item.id
                        ? 'bg-white text-black'
                        : 'text-gray-300 hover:bg-gray-800 hover:text-white'
                    }`}
                  >
                    <svg
                      className="w-5 h-5 mr-3"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d={item.icon}
                      />
                    </svg>
                    <span className="font-medium">{item.label}</span>
                  </button>
                </li>
              ))}
            </ul>
          </nav>

          {/* User Info & Logout */}
          <div className="p-4 border-t border-gray-800">
            <div className="mb-3">
              <p className="text-sm font-medium text-white">
                {user?.email || 'Admin'}
              </p>
              <p className="text-xs text-gray-400">관리자</p>
            </div>
            <button
              onClick={handleLogout}
              className="w-full px-4 py-2 bg-gray-800 text-white font-medium hover:bg-gray-700 transition-colors rounded-lg"
            >
              로그아웃
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col">
        {/* Top Header */}
        <header className="bg-white border-b border-gray-200 px-3 md:px-4 py-3">
          <div className="max-w-[1480px] mx-auto w-full flex justify-between items-center">
            <h2 className="text-2xl font-bold text-black">
              {menuItems.find(item => item.id === activeMenu)?.label || '대시보드'}
            </h2>
          </div>
        </header>

        {/* Main Content */}
        <main className="flex-1 py-4 px-3 md:px-4 overflow-y-auto">
          <div className="max-w-[1480px] mx-auto w-full">
          {activeMenu === 'dashboard' && (
            <>
              {/* Welcome Section */}
              <div className="bg-white rounded-lg shadow p-4 mb-6">
                <h2 className="text-xl font-semibold mb-2">환영합니다!</h2>
                <p className="text-gray-600">
                  관리자 대시보드에 오신 것을 환영합니다.
                </p>
              </div>

              {/* Stats Grid */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <div className="bg-white rounded-lg shadow p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600 mb-1">전체 문의</p>
                      <p className="text-3xl font-bold">0</p>
                    </div>
                    <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                      <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                      </svg>
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-lg shadow p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600 mb-1">프로젝트</p>
                      <p className="text-3xl font-bold">0</p>
                    </div>
                    <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                      <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                      </svg>
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-lg shadow p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600 mb-1">사용자</p>
                      <p className="text-3xl font-bold">1</p>
                    </div>
                    <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
                      <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                      </svg>
                    </div>
                  </div>
                </div>
              </div>

              {/* Recent Contacts */}
              <div className="bg-white rounded-lg shadow">
                <div className="px-4 py-3 border-b border-gray-200">
                  <h2 className="text-lg font-semibold">최근 문의</h2>
                </div>
                <div className="p-4">
                  <p className="text-gray-500 text-center py-8">
                    아직 문의가 없습니다.
                  </p>
                </div>
              </div>
            </>
          )}
          
          {activeMenu === 'tasks' && <AdminTasks />}
          {activeMenu === 'projects' && <AdminProjects />}
          {activeMenu === 'contacts' && <AdminContacts />}
          {activeMenu === 'finance' && <AdminFinance />}
          {activeMenu === 'members' && <AdminMembers />}
          </div>
        </main>
      </div>
    </div>
  )
}

export default AdminDashboard

