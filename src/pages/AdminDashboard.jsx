import { useEffect, useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import AdminProjects from './AdminProjects'
import AdminContacts from './AdminContacts'
import AdminFinance from './AdminFinance'
import AdminTasks from './AdminTasks'
import AdminMembers from './AdminMembers'
import AdminPortfolio from './AdminPortfolio'
import LunchRoulette from '../components/LunchRoulette'
import { getUserRole, USER_ROLES, isSuperAdmin, isManagerOrAbove } from '../utils/auth'
import { fetchContacts, fetchProjects, fetchMembers, fetchFinances } from '../utils/api'

function AdminDashboard() {
  const [user, setUser] = useState(null)
  const [activeMenu, setActiveMenu] = useState('dashboard')
  const [stats, setStats] = useState({
    contactsCount: 0,
    projectsCount: 0,
    membersCount: 0,
    totalIncome: 0,
    totalExpense: 0,
    balance: 0,
  })
  const [recentContacts, setRecentContacts] = useState([])
  const [loading, setLoading] = useState(true)
  const [collapsedCategories, setCollapsedCategories] = useState({}) // 카테고리 접기/펼치기 상태 (undefined/false = 접힘, true = 펼쳐짐)
  const [showLunchRoulette, setShowLunchRoulette] = useState(false) // 점심 메뉴 룰렛 팝업
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

  // 대시보드 데이터 로드
  useEffect(() => {
    if (user) {
      loadDashboardData()
    }
  }, [user])

  const loadDashboardData = async () => {
    try {
      setLoading(true)
      
      // 병렬로 데이터 로드
      const [contactsRes, projectsRes, membersRes, financesRes] = await Promise.allSettled([
        fetchContacts(),
        fetchProjects(),
        fetchMembers(),
        isSuperAdmin() ? fetchFinances() : Promise.resolve({ success: false })
      ])

      // 문의 데이터
      if (contactsRes.status === 'fulfilled' && contactsRes.value.success) {
        const contacts = contactsRes.value.contacts || []
        setStats(prev => ({ ...prev, contactsCount: contacts.length }))
        setRecentContacts(contacts.slice(0, 5)) // 최근 5개
      }

      // 프로젝트 데이터
      if (projectsRes.status === 'fulfilled' && projectsRes.value.success) {
        const projects = projectsRes.value.projects || []
        setStats(prev => ({ ...prev, projectsCount: projects.length }))
      }

      // 멤버 데이터
      if (membersRes.status === 'fulfilled' && membersRes.value.success) {
        const members = membersRes.value.members || []
        setStats(prev => ({ ...prev, membersCount: members.length }))
      }

      // 재무 데이터 (최고관리자만)
      if (financesRes.status === 'fulfilled' && financesRes.value.success) {
        const finances = financesRes.value.finances || []
        const totalIncome = finances
          .filter(f => f.type === 'income')
          .reduce((sum, f) => sum + f.amount, 0)
        const totalExpense = finances
          .filter(f => f.type === 'expense')
          .reduce((sum, f) => sum + f.amount, 0)
        const balance = totalIncome - totalExpense
        
        setStats(prev => ({
          ...prev,
          totalIncome,
          totalExpense,
          balance
        }))
      }
    } catch (error) {
      console.error('대시보드 데이터 로드 실패:', error)
    } finally {
      setLoading(false)
    }
  }

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

  // 메뉴를 카테고리별로 그룹화
  const menuCategories = [
    {
      category: '관리',
      items: [
        { id: 'dashboard', label: '대시보드', icon: 'M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6', roles: [USER_ROLES.SUPER_ADMIN, USER_ROLES.MANAGER, USER_ROLES.EMPLOYEE] },
      ]
    },
    {
      category: '콘텐츠',
      items: [
        { id: 'portfolio', label: '랜딩페이지 관리', icon: 'M4 5a1 1 0 011-1h4a1 1 0 011 1v7a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM14 5a1 1 0 011-1h4a1 1 0 011 1v7a1 1 0 01-1 1h-4a1 1 0 01-1-1V5zM4 16a1 1 0 011-1h4a1 1 0 011 1v3a1 1 0 01-1 1H5a1 1 0 01-1-1v-3zM14 16a1 1 0 011-1h4a1 1 0 011 1v3a1 1 0 01-1 1h-4a1 1 0 01-1-1v-3z', roles: [USER_ROLES.SUPER_ADMIN, USER_ROLES.MANAGER] },
        { id: 'projects', label: '프로젝트 관리', icon: 'M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10', roles: [USER_ROLES.SUPER_ADMIN, USER_ROLES.MANAGER, USER_ROLES.EMPLOYEE] },
      ]
    },
    {
      category: '업무',
      items: [
        { id: 'tasks', label: '업무 진행상황', icon: 'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2', roles: [USER_ROLES.SUPER_ADMIN, USER_ROLES.MANAGER, USER_ROLES.EMPLOYEE] },
      ]
    },
    {
      category: '시스템',
      items: [
        { id: 'contacts', label: '문의하기 관리', icon: 'M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z', roles: [USER_ROLES.SUPER_ADMIN] },
        { id: 'finance', label: '재무 관리', icon: 'M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z', roles: [USER_ROLES.SUPER_ADMIN] },
        { id: 'members', label: '멤버 관리', icon: 'M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z', roles: [USER_ROLES.SUPER_ADMIN] },
      ]
    },
  ]

  // 권한에 따라 메뉴 필터링
  const filteredCategories = menuCategories.map(category => ({
    ...category,
    items: category.items.filter(item => {
      if (!userRole) return false
      return item.roles.includes(userRole)
    })
  })).filter(category => category.items.length > 0) // 빈 카테고리는 제외

  return (
    <div className="min-h-screen flex bg-gray-50">
      {/* Left Navigation Bar (LNB) */}
      <aside className="w-64 bg-black border-r border-gray-800 flex-shrink-0">
        <div className="h-full flex flex-col">
          {/* Logo/Header */}
          <div className="px-4 py-3 border-b border-gray-800">
            <button
              onClick={() => window.location.href = '/'}
              className="text-left w-full hover:opacity-80 transition-opacity"
            >
              <img 
                src="/logo-white.svg" 
                alt="REAL DAY" 
                className="h-7 w-auto mb-1"
              />
              <p className="text-xs text-gray-400">Admin Panel</p>
            </button>
          </div>

          {/* Navigation Menu */}
          <nav className="flex-1 px-3 py-3 overflow-y-auto">
            <div className="space-y-4">
              {filteredCategories.map((category, categoryIndex) => {
                // collapsedCategories[category.category]가 false면 접힘, true/undefined면 펼쳐짐
                const isCollapsed = collapsedCategories[category.category] === false
                return (
                  <div key={category.category}>
                    {/* 카테고리 제목 (클릭 가능) */}
                    <button
                      onClick={() => {
                        setCollapsedCategories(prev => ({
                          ...prev,
                          [category.category]: prev[category.category] === false ? true : false
                        }))
                      }}
                      className="w-full px-3 py-1.5 mb-1.5 flex items-center justify-between rounded transition-colors group"
                    >
                      <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider transition-colors group-hover:text-gray-300">
                        {category.category}
                      </h3>
                      <svg
                        className={`w-3 h-3 text-gray-500 transition-all duration-200 group-hover:text-gray-300 ${isCollapsed ? 'rotate-180' : ''}`}
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </button>
                    
                    {/* 카테고리 메뉴 아이템 */}
                    {!isCollapsed && (
                      <ul className="space-y-1">
                        {category.items.map((item) => (
                          <li key={item.id}>
                            <button
                              onClick={() => setActiveMenu(item.id)}
                              className={`w-full flex items-center px-3 py-2 rounded-lg transition-colors ${
                                activeMenu === item.id
                                  ? 'bg-white text-black'
                                  : 'text-gray-300 hover:bg-gray-800 hover:text-white'
                              }`}
                            >
                              <svg
                                className="w-4 h-4 mr-2.5"
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
                              <span className="font-medium text-sm">{item.label}</span>
                            </button>
                          </li>
                        ))}
                      </ul>
                    )}
                    
                    {/* 카테고리 구분선 (마지막 카테고리가 아닐 때만) */}
                    {categoryIndex < filteredCategories.length - 1 && (
                      <div className="mt-4 border-t border-gray-800"></div>
                    )}
                  </div>
                )
              })}
            </div>
          </nav>

          {/* User Info & Logout */}
          <div className="px-4 py-3 border-t border-gray-800">
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
      <div className="flex-1 flex flex-col bg-gray-50">
        {/* Top Header */}
        <header className="bg-white px-3 md:px-4 py-3">
          <div className="max-w-[1480px] mx-auto w-full">
            <div className="flex justify-between items-center mb-2">
              <h2 className="text-xl font-bold text-black">
                {filteredCategories.flatMap(cat => cat.items).find(item => item.id === activeMenu)?.label || '대시보드'}
              </h2>
              {/* 점심 메뉴 추천 버튼 */}
              <button
                onClick={() => setShowLunchRoulette(true)}
                className="px-3 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-medium rounded-lg transition-colors flex items-center gap-1.5"
                title="오늘의 점메추"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                점메추
              </button>
            </div>
            <div className="h-px bg-black"></div>
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
              <div className={`grid grid-cols-1 gap-4 mb-6 ${isSuperAdmin() ? 'md:grid-cols-4' : 'md:grid-cols-3'}`}>
                <div className="bg-white rounded-lg shadow p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600 mb-1">전체 문의</p>
                      <p className="text-3xl font-bold">
                        {loading ? '...' : stats.contactsCount}
                      </p>
                    </div>
                    <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center">
                      <svg className="w-6 h-6 text-black" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                      </svg>
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-lg shadow p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600 mb-1">프로젝트</p>
                      <p className="text-3xl font-bold">
                        {loading ? '...' : stats.projectsCount}
                      </p>
                    </div>
                    <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center">
                      <svg className="w-6 h-6 text-black" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                      </svg>
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-lg shadow p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600 mb-1">사용자</p>
                      <p className="text-3xl font-bold">
                        {loading ? '...' : stats.membersCount}
                      </p>
                    </div>
                    <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center">
                      <svg className="w-6 h-6 text-black" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                      </svg>
                    </div>
                  </div>
                </div>

                {/* 재무 통계 (최고관리자만) */}
                {isSuperAdmin() && (
                  <div className="bg-white rounded-lg shadow p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-gray-600 mb-1">잔액</p>
                        <p className="text-3xl font-bold text-black">
                          {loading ? '...' : `${stats.balance >= 0 ? '+' : ''}${stats.balance.toLocaleString()}`}
                        </p>
                        <p className="text-xs text-gray-500 mt-1">
                          <span className="text-black">수익: {stats.totalIncome.toLocaleString()}</span> / <span className="text-gray-600">지출: {stats.totalExpense.toLocaleString()}</span>
                        </p>
                      </div>
                      <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center">
                        <svg className="w-6 h-6 text-black" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Recent Contacts (최고관리자만) */}
              {isSuperAdmin() && (
                <div className="bg-white rounded-lg shadow">
                  <div className="px-4 py-3 border-b border-gray-200">
                    <h2 className="text-lg font-semibold">최근 문의</h2>
                  </div>
                  <div className="p-4">
                    {loading ? (
                      <p className="text-gray-500 text-center py-8">로딩 중...</p>
                    ) : recentContacts.length === 0 ? (
                      <p className="text-gray-500 text-center py-8">
                        아직 문의가 없습니다.
                      </p>
                    ) : (
                      <div className="space-y-2">
                        {recentContacts.map((contact) => {
                          const formatContactDate = (dateString) => {
                            if (!dateString) return '날짜 없음'
                            try {
                              const date = new Date(dateString.replace(' ', 'T'))
                              if (isNaN(date.getTime())) return '날짜 없음'
                              return date.toLocaleString('ko-KR', {
                                year: 'numeric',
                                month: 'long',
                                day: 'numeric',
                                hour: '2-digit',
                                minute: '2-digit',
                                hour12: false,
                              })
                            } catch (error) {
                              return '날짜 없음'
                            }
                          }
                          
                          return (
                            <div
                              key={contact.id}
                              className="p-3 border border-gray-200 rounded-lg hover:bg-gray-50"
                            >
                              <div className="flex items-start justify-between">
                                <div className="flex-1">
                                  <div className="flex items-center gap-2 mb-1">
                                    <p className="font-medium text-gray-900">{contact.name}</p>
                                    <span className="text-xs text-gray-400 bg-gray-100 px-2 py-0.5 rounded">
                                      {formatContactDate(contact.created_at || contact.createdAt)}
                                    </span>
                                  </div>
                                  <p className="text-sm text-gray-600">{contact.email}</p>
                                  <p className="text-sm text-gray-500 mt-2 line-clamp-2">
                                    {contact.message}
                                  </p>
                                </div>
                              </div>
                            </div>
                          )
                        })}
                      </div>
                    )}
                  </div>
                </div>
              )}
            </>
          )}
          
          {activeMenu === 'tasks' && <AdminTasks />}
          {activeMenu === 'portfolio' && <AdminPortfolio />}
          {activeMenu === 'projects' && <AdminProjects />}
          {activeMenu === 'contacts' && <AdminContacts />}
          {activeMenu === 'finance' && <AdminFinance />}
          {activeMenu === 'members' && <AdminMembers />}
          </div>
        </main>

        {/* 점심 메뉴 룰렛 팝업 */}
        <LunchRoulette 
          isOpen={showLunchRoulette} 
          onClose={() => setShowLunchRoulette(false)} 
        />
      </div>
    </div>
  )
}

export default AdminDashboard

