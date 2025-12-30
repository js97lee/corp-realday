import { useEffect, useState, useMemo, useCallback, Suspense, lazy } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import LunchRoulette from '../components/LunchRoulette'
import Calendar from '../components/Calendar'
import EventModal from '../components/EventModal'
import AnnouncementModal from '../components/AnnouncementModal'
import { getUserRole, USER_ROLES, isSuperAdmin, isManagerOrAbove } from '../utils/auth'
import { fetchContacts, fetchProjects, fetchMembers, fetchFinances, fetchEvents, addEvent, updateEvent, deleteEvent, fetchAnnouncements, addAnnouncement, updateAnnouncement, deleteAnnouncement } from '../utils/api'

// 코드 스플리팅: 필요한 컴포넌트만 로드
const AdminProjects = lazy(() => import('./AdminProjects'))
const AdminContacts = lazy(() => import('./AdminContacts'))
const AdminFinance = lazy(() => import('./AdminFinance'))
const AdminTasks = lazy(() => import('./AdminTasks'))
const AdminMembers = lazy(() => import('./AdminMembers'))
const AdminPortfolio = lazy(() => import('./AdminPortfolio'))

// 로딩 컴포넌트
const LoadingSpinner = () => (
  <div className="flex items-center justify-center py-12">
    <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-black"></div>
  </div>
)

// 날짜 포맷 함수 (컴포넌트 외부로 이동하여 재생성 방지)
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
  const [authChecked, setAuthChecked] = useState(false) // 인증 체크 완료 여부
  const [dashboardDataLoaded, setDashboardDataLoaded] = useState(false) // 대시보드 데이터 로드 여부
  const [showLunchRoulette, setShowLunchRoulette] = useState(false) // 점심 메뉴 룰렛 팝업
  const [events, setEvents] = useState([]) // 캘린더 일정
  const [showEventModal, setShowEventModal] = useState(false) // 일정 모달
  const [selectedEvent, setSelectedEvent] = useState(null) // 선택된 일정
  const [selectedDate, setSelectedDate] = useState(null) // 선택된 날짜
  const [announcement, setAnnouncement] = useState(null) // 공지사항
  const [allAnnouncements, setAllAnnouncements] = useState([]) // 모든 공지사항 목록
  const [showAnnouncementModal, setShowAnnouncementModal] = useState(false) // 공지사항 모달
  const navigate = useNavigate()
  const location = useLocation()

  useEffect(() => {
    // 로그인 상태 확인
    const token = localStorage.getItem('authToken')
    const userData = localStorage.getItem('user')

    console.log('AdminDashboard 인증 체크:', { token: !!token, userData: !!userData, tokenValue: token?.substring(0, 10) })

    if (!token) {
      // 토큰이 없으면 로그인 페이지로 리다이렉트
      console.log('토큰이 없습니다. 로그인 페이지로 리다이렉트')
      navigate('/admin', { replace: true })
      return
    }

    // userData가 없어도 토큰이 있으면 기본 사용자 정보 사용
    if (!userData) {
      console.warn('사용자 데이터가 없습니다. 기본값 사용')
      const defaultUser = {
        email: 'unknown',
        role: 'employee'
      }
      localStorage.setItem('user', JSON.stringify(defaultUser))
      setUser(defaultUser)
      setAuthChecked(true)
      setLoading(false)
      return
    }

    try {
      const parsedUser = JSON.parse(userData)
      console.log('사용자 정보 파싱 성공:', parsedUser)
      setUser(parsedUser)
      setAuthChecked(true) // 인증 성공 후에만 true로 설정
      setLoading(false)
    } catch (error) {
      console.error('User data parse error:', error)
      // 파싱 실패해도 토큰이 있으면 기본값 사용
      const defaultUser = {
        email: 'unknown',
        role: 'employee'
      }
      localStorage.setItem('user', JSON.stringify(defaultUser))
      setUser(defaultUser)
      setAuthChecked(true)
      setLoading(false)
    }
  }, [navigate])

  // 대시보드 데이터 로드 함수 (조건부 return 이전에 정의해야 함)
  const loadDashboardData = useCallback(async () => {
    try {
      setLoading(true)
      
      // 병렬로 데이터 로드 (각각 타임아웃 설정)
      const createTimeoutPromise = (promise, timeout = 20000) => {
        return Promise.race([
          promise,
          new Promise((_, reject) => 
            setTimeout(() => reject(new Error('요청 시간이 초과되었습니다.')), timeout)
          )
        ])
      }
      
      const [contactsRes, projectsRes, membersRes, financesRes] = await Promise.allSettled([
        createTimeoutPromise(fetchContacts()),
        createTimeoutPromise(fetchProjects()),
        createTimeoutPromise(fetchMembers()),
        isSuperAdmin() ? createTimeoutPromise(fetchFinances()) : Promise.resolve({ success: false })
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
  }, [])

  // 일정 데이터 로드 (조건부 return 이전에 정의)
  const loadEvents = useCallback(async () => {
    try {
      const eventsData = await fetchEvents()
      setEvents(eventsData)
    } catch (error) {
      console.error('일정 데이터 로드 실패:', error)
    }
  }, [])

  // 공지사항 로드 (조건부 return 이전에 정의, useEffect보다 먼저 정의되어야 함)
  const loadAnnouncement = useCallback(async () => {
    try {
      const announcements = await fetchAnnouncements()
      // 활성 공지사항만 표시 (일반 사용자) 또는 최신 공지사항 (슈퍼어드민)
      const activeAnnouncement = announcements.find(a => a.is_active) || announcements[0] || null
      setAnnouncement(activeAnnouncement)
      // 모든 공지사항 저장 (공지사항 관리 페이지용)
      setAllAnnouncements(Array.isArray(announcements) ? announcements : [])
    } catch (error) {
      console.error('공지사항 로드 실패:', error)
    }
  }, [])

  // 대시보드 데이터 로드 (useEffect에서 호출)
  useEffect(() => {
    if (user && activeMenu === 'dashboard' && !dashboardDataLoaded) {
      loadDashboardData()
      setDashboardDataLoaded(true)
    }
    // 다른 메뉴로 이동했다가 다시 돌아오면 리셋하지 않음 (캐싱 활용)
  }, [user, activeMenu, dashboardDataLoaded, loadDashboardData])

  // 공지사항 자동 새로고침: 대시보드로 돌아올 때마다 공지사항 다시 불러오기
  useEffect(() => {
    if (user && activeMenu === 'dashboard') {
      loadAnnouncement()
    }
  }, [user, activeMenu, loadAnnouncement])

  // 공지사항 관리 탭에서도 공지사항 자동 새로고침
  useEffect(() => {
    if (user && activeMenu === 'announcements') {
      loadAnnouncement()
    }
  }, [user, activeMenu, loadAnnouncement])

  // 공지사항 저장 핸들러
  const handleAnnouncementSave = useCallback(async (announcementData) => {
    try {
      if (announcement) {
        // 수정
        await updateAnnouncement(announcement.id, announcementData)
      } else {
        // 추가
        await addAnnouncement(announcementData)
      }
      await loadAnnouncement()
      setShowAnnouncementModal(false)
      setAnnouncement(null) // 선택된 공지사항 초기화
    } catch (error) {
      console.error('공지사항 저장 실패:', error)
      alert(error.message || '공지사항 저장에 실패했습니다.')
    }
  }, [announcement, loadAnnouncement])

  // 공지사항 삭제 핸들러
  const handleAnnouncementDelete = useCallback(async (announcementId) => {
    try {
      await deleteAnnouncement(announcementId)
      await loadAnnouncement()
      setShowAnnouncementModal(false)
      setAnnouncement(null) // 선택된 공지사항 초기화
    } catch (error) {
      console.error('공지사항 삭제 실패:', error)
      alert(error.message || '공지사항 삭제에 실패했습니다.')
    }
  }, [loadAnnouncement])

  // 일정 저장 핸들러
  const handleEventSave = useCallback(async (eventData) => {
    try {
      if (selectedEvent) {
        // 수정
        await updateEvent(selectedEvent.id, eventData)
      } else {
        // 추가
        await addEvent(eventData)
      }
      await loadEvents()
      setShowEventModal(false)
      setSelectedEvent(null)
      setSelectedDate(null)
    } catch (error) {
      console.error('일정 저장 실패:', error)
      alert(error.message || '일정 저장에 실패했습니다.')
    }
  }, [selectedEvent, loadEvents])

  // 일정 삭제 핸들러
  const handleEventDelete = useCallback(async (eventId) => {
    try {
      await deleteEvent(eventId)
      await loadEvents()
      setShowEventModal(false)
      setSelectedEvent(null)
    } catch (error) {
      console.error('일정 삭제 실패:', error)
      alert(error.message || '일정 삭제에 실패했습니다.')
    }
  }, [loadEvents])

  // 날짜 클릭 핸들러
  const handleDateClick = useCallback((date) => {
    setSelectedDate(date)
    setSelectedEvent(null)
    setShowEventModal(true)
  }, [])

  // 일정 클릭 핸들러
  const handleEventClick = useCallback((event) => {
    setSelectedEvent(event)
    setSelectedDate(new Date(event.date))
    setShowEventModal(true)
  }, [])

  const handleLogout = useCallback(() => {
    localStorage.removeItem('authToken')
    localStorage.removeItem('user')
    navigate('/admin')
  }, [navigate])

  const [userRole, setUserRole] = useState(null)

  useEffect(() => {
    if (user) {
      let role = user.role
      // 하위 호환성: 'employee' -> 'pro', 'manager' -> 'director', 'super_admin' -> 'ceo'
      if (role === 'employee') role = USER_ROLES.PRO
      else if (role === 'manager') role = USER_ROLES.DIRECTOR
      else if (role === 'super_admin') role = USER_ROLES.CEO
      // 'ceo' 문자열도 USER_ROLES.CEO로 정규화
      else if (role === 'ceo') role = USER_ROLES.CEO
      
      setUserRole(role || getUserRole() || USER_ROLES.PRO)
    } else {
      const role = getUserRole() || USER_ROLES.PRO
      setUserRole(role)
    }
  }, [user])

  // 메뉴를 카테고리별로 그룹화
  const menuCategories = [
    {
      category: '관리',
      items: [
        { id: 'dashboard', label: '대시보드', icon: 'M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6', roles: [USER_ROLES.CEO, USER_ROLES.CTO, USER_ROLES.CMO, USER_ROLES.DIRECTOR, USER_ROLES.PRO, USER_ROLES.PRO1, USER_ROLES.PRO2, USER_ROLES.PRO3, USER_ROLES.SUPER_ADMIN, USER_ROLES.MANAGER, USER_ROLES.EMPLOYEE] },
      ]
    },
    {
      category: '콘텐츠',
      items: [
        { id: 'portfolio', label: '랜딩페이지 관리', icon: 'M4 5a1 1 0 011-1h4a1 1 0 011 1v7a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM14 5a1 1 0 011-1h4a1 1 0 011 1v7a1 1 0 01-1 1h-4a1 1 0 01-1-1V5zM4 16a1 1 0 011-1h4a1 1 0 011 1v3a1 1 0 01-1 1H5a1 1 0 01-1-1v-3zM14 16a1 1 0 011-1h4a1 1 0 011 1v3a1 1 0 01-1 1h-4a1 1 0 01-1-1v-3z', roles: [USER_ROLES.CEO, USER_ROLES.CTO, USER_ROLES.CMO, USER_ROLES.DIRECTOR, USER_ROLES.SUPER_ADMIN, USER_ROLES.MANAGER] },
        { id: 'projects', label: '프로젝트 관리', icon: 'M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10', roles: [USER_ROLES.CEO, USER_ROLES.CTO, USER_ROLES.CMO, USER_ROLES.DIRECTOR, USER_ROLES.PRO, USER_ROLES.PRO1, USER_ROLES.PRO2, USER_ROLES.PRO3, USER_ROLES.SUPER_ADMIN, USER_ROLES.MANAGER, USER_ROLES.EMPLOYEE] },
      ]
    },
    {
      category: '업무',
      items: [
        { id: 'tasks', label: '업무 진행상황', icon: 'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2', roles: [USER_ROLES.CEO, USER_ROLES.CTO, USER_ROLES.CMO, USER_ROLES.DIRECTOR, USER_ROLES.PRO, USER_ROLES.PRO1, USER_ROLES.PRO2, USER_ROLES.PRO3, USER_ROLES.SUPER_ADMIN, USER_ROLES.MANAGER, USER_ROLES.EMPLOYEE] },
      ]
    },
    {
      category: '시스템',
      items: [
        { id: 'announcements', label: '공지사항 관리', icon: 'M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z', roles: [USER_ROLES.CEO, USER_ROLES.SUPER_ADMIN] },
        { id: 'contacts', label: '문의하기 관리', icon: 'M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z', roles: [USER_ROLES.CEO, USER_ROLES.SUPER_ADMIN] },
        { id: 'finance', label: '재무 관리', icon: 'M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z', roles: [USER_ROLES.CEO, USER_ROLES.SUPER_ADMIN] },
        { id: 'members', label: '멤버 관리', icon: 'M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z', roles: [USER_ROLES.CEO, USER_ROLES.SUPER_ADMIN] },
      ]
    },
  ]

  // 권한에 따라 메뉴 필터링 (메모이제이션)
  const filteredCategories = useMemo(() => {
    if (!userRole) {
      // userRole이 없으면 빈 배열 반환
      return []
    }
    
    return menuCategories.map(category => ({
      ...category,
      items: category.items.filter(item => {
        return item.roles.includes(userRole)
      })
    })).filter(category => category.items.length > 0) // 빈 카테고리는 제외
  }, [userRole])

  return (
    <div className="h-screen flex bg-gray-50 overflow-hidden">
      {/* Left Navigation Bar (LNB) */}
      <aside className="w-64 bg-black border-r border-gray-800 flex-shrink-0 h-screen flex flex-col">
        <div className="h-full flex flex-col">
          {/* Logo/Header */}
          <div className="px-4 py-3 border-b border-gray-800 flex-shrink-0">
            <button
              onClick={() => window.location.href = '/'}
              className="text-left w-full hover:opacity-80 transition-opacity"
            >
              <p className="text-xs text-gray-400 mb-1">Studio.</p>
              <p className="text-lg font-bold text-white">REALDAY</p>
              <p className="text-xs text-gray-400 mt-1">Admin Panel</p>
            </button>
          </div>

          {/* Navigation Menu */}
          <nav className="flex-1 px-3 py-3 overflow-y-auto min-h-0">
            <div className="space-y-4">
              {filteredCategories.length === 0 ? (
                <div className="text-gray-400 text-sm px-3 py-2">
                  메뉴를 불러올 수 없습니다.
                </div>
              ) : (
                filteredCategories.map((category, categoryIndex) => (
                  <div key={category.category}>
                    {/* 카테고리 제목 */}
                    <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider px-3 py-1.5 mb-1.5">
                      {category.category}
                    </h3>
                    
                    {/* 카테고리 메뉴 아이템 */}
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
                    
                    {/* 카테고리 구분선 (마지막 카테고리가 아닐 때만) */}
                    {categoryIndex < filteredCategories.length - 1 && (
                      <div className="mt-4 border-t border-gray-800"></div>
                    )}
                  </div>
                ))
              )}
            </div>
          </nav>

          {/* 하단 고정 영역: 점메추 & 프로필 */}
          <div className="flex-shrink-0 border-t border-gray-800">
            {/* 점메추 버튼 */}
            <div className="px-3 py-2">
              <button
                onClick={() => setShowLunchRoulette(true)}
                className="w-full flex items-center px-3 py-2 rounded-lg text-gray-300 hover:bg-gray-800 hover:text-white transition-colors"
                title="오늘의 점메추"
              >
                <svg className="w-4 h-4 mr-2.5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M11 2v20c0 .55-.45 1-1 1s-1-.45-1-1v-6H7v6c0 .55-.45 1-1 1s-1-.45-1-1V2c0-.55.45-1 1-1s1 .45 1 1v6h2V2c0-.55.45-1 1-1s1 .45 1 1zm7 0v20c0 .55-.45 1-1 1s-1-.45-1-1v-6h-2v6c0 .55-.45 1-1 1s-1-.45-1-1V2c0-.55.45-1 1-1s1 .45 1 1v6h2V2c0-.55.45-1 1-1s1 .45 1 1z"/>
                </svg>
                <span className="font-medium text-sm">점메추</span>
              </button>
            </div>

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
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col bg-gray-50 overflow-y-auto h-screen">
        {/* Top Header */}
        <header className="bg-white px-3 md:px-4 py-3">
          <div className="max-w-[1480px] mx-auto w-full">
            <div className="flex justify-between items-center mb-2">
              <h2 className="text-xl font-bold text-black">
                {filteredCategories.flatMap(cat => cat.items).find(item => item.id === activeMenu)?.label || '대시보드'}
              </h2>
            </div>
            <div className="h-px bg-black"></div>
          </div>
        </header>

        {/* Main Content */}
        <main className="flex-1 py-4 px-3 md:px-4 overflow-y-auto">
          <div className="max-w-[1480px] mx-auto w-full">
          {activeMenu === 'dashboard' && (
            <>
              {/* 공지사항 Section */}
              <div className="bg-white rounded-lg shadow p-6 mb-6">
                <div className="flex items-start justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                    <svg className="w-6 h-6 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6M5.436 13.683A4.001 4.001 0 017 6h1.832c4.1 0 7.625-1.234 9.168-3v14c-1.543-1.766-5.067-3-9.168-3H7a3.988 3.988 0 01-1.564-.317z" />
                    </svg>
                    공지사항
                  </h3>
                  {isSuperAdmin() && (
                    <button
                      onClick={() => {
                        setShowAnnouncementModal(true)
                      }}
                      className="px-4 py-2 text-sm font-medium bg-black text-white rounded-lg hover:bg-gray-800 transition-colors flex items-center gap-2"
                      title="공지사항 작성/수정"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                      </svg>
                      {announcement ? '수정하기' : '공지 작성하기'}
                    </button>
                  )}
                  {!isSuperAdmin() && (
                    <span className="text-xs text-gray-400">최고관리자만 작성 가능</span>
                  )}
                </div>
                <div className="border-t border-gray-200 pt-4">
                  {announcement ? (
                    <>
                      <h2 className="text-xl font-semibold mb-3 text-gray-900">{announcement.title}</h2>
                      <p className="text-gray-600 whitespace-pre-wrap leading-relaxed mb-4">{announcement.content}</p>
                      {announcement.created_at && (
                        <div className="flex items-center gap-2 text-xs text-gray-400">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                          </svg>
                          <span>
                            {new Date(announcement.created_at).toLocaleDateString('ko-KR', {
                              year: 'numeric',
                              month: 'long',
                              day: 'numeric',
                            })}
                          </span>
                          {announcement.created_by_name && (
                            <>
                              <span>•</span>
                              <span>작성자: {announcement.created_by_name}</span>
                            </>
                          )}
                        </div>
                      )}
                    </>
                  ) : (
                    <div className="text-center py-8 text-gray-400">
                      <p className="text-sm">공지사항</p>
                      {isSuperAdmin() && (
                        <p className="text-xs mt-1 text-gray-500">위의 '공지 작성하기' 버튼을 클릭하여 공지사항을 작성하세요.</p>
                      )}
                    </div>
                  )}
                </div>
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
                        <p className={`text-3xl font-bold ${stats.balance >= 0 ? 'text-black' : 'text-gray-600'}`}>
                          {loading ? '...' : `${stats.balance >= 0 ? '+' : ''}${stats.balance.toLocaleString()}`}
                        </p>
                        <p className="text-xs text-gray-500 mt-1">
                          <span className="text-red-600">수익: {stats.totalIncome.toLocaleString()}</span> / <span className="text-blue-600">지출: {stats.totalExpense.toLocaleString()}</span>
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
                        {recentContacts.map((contact) => (
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
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* 캘린더 섹션 */}
              <div className="mt-6">
                <Calendar
                  events={events}
                  onDateClick={handleDateClick}
                  onEventClick={handleEventClick}
                  currentUserId={user?.id}
                />
              </div>
            </>
          )}
          
          {activeMenu === 'tasks' && (
            <Suspense fallback={<LoadingSpinner />}>
              <AdminTasks />
            </Suspense>
          )}
          {activeMenu === 'portfolio' && (
            <Suspense fallback={<LoadingSpinner />}>
              <AdminPortfolio />
            </Suspense>
          )}
          {activeMenu === 'projects' && (
            <Suspense fallback={<LoadingSpinner />}>
              <AdminProjects />
            </Suspense>
          )}
          {activeMenu === 'contacts' && (
            <Suspense fallback={<LoadingSpinner />}>
              <AdminContacts />
            </Suspense>
          )}
          {activeMenu === 'finance' && (
            <Suspense fallback={<LoadingSpinner />}>
              <AdminFinance />
            </Suspense>
          )}
          {activeMenu === 'members' && (
            <Suspense fallback={<LoadingSpinner />}>
              <AdminMembers />
            </Suspense>
          )}
          {activeMenu === 'announcements' && isSuperAdmin() && (
            <div className="bg-white rounded-lg shadow">
              <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-900">공지사항 관리</h3>
                <button
                  onClick={() => {
                    setAnnouncement(null)
                    setShowAnnouncementModal(true)
                  }}
                  className="px-4 py-2 text-sm font-medium bg-black text-white rounded-lg hover:bg-gray-800 transition-colors flex items-center gap-2"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                  새 공지사항 작성
                </button>
              </div>
              <div className="p-6">
                {allAnnouncements.length === 0 ? (
                  <div className="text-center py-12 text-gray-400">
                    <p className="text-sm">등록된 공지사항이 없습니다.</p>
                    <p className="text-xs mt-2 text-gray-500">위의 '새 공지사항 작성' 버튼을 클릭하여 공지사항을 작성하세요.</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {allAnnouncements.map((ann) => (
                      <div
                        key={ann.id}
                        className={`border rounded-lg p-4 transition-all hover:shadow-md ${
                          ann.is_active ? 'border-blue-500 bg-blue-50' : 'border-gray-200 bg-white'
                        }`}
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <h4 className="text-lg font-semibold text-gray-900">{ann.title}</h4>
                              {ann.is_active && (
                                <span className="px-2 py-1 text-xs font-medium bg-blue-500 text-white rounded">
                                  활성
                                </span>
                              )}
                            </div>
                            <p className="text-sm text-gray-600 mb-3 line-clamp-2">{ann.content}</p>
                            <div className="flex items-center gap-4 text-xs text-gray-400">
                              {ann.created_at && (
                                <div className="flex items-center gap-1">
                                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                  </svg>
                                  <span>
                                    {new Date(ann.created_at).toLocaleDateString('ko-KR', {
                                      year: 'numeric',
                                      month: 'long',
                                      day: 'numeric',
                                    })}
                                  </span>
                                </div>
                              )}
                              {ann.created_by_name && (
                                <div className="flex items-center gap-1">
                                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                  </svg>
                                  <span>{ann.created_by_name}</span>
                                </div>
                              )}
                            </div>
                          </div>
                          <div className="flex items-center gap-2 ml-4">
                            <button
                              onClick={() => {
                                setAnnouncement(ann)
                                setShowAnnouncementModal(true)
                              }}
                              className="px-3 py-1.5 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 transition-colors rounded-lg flex items-center gap-1.5"
                            >
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                              </svg>
                              수정
                            </button>
                            <button
                              onClick={() => {
                                if (window.confirm('정말 이 공지사항을 삭제하시겠습니까?')) {
                                  handleAnnouncementDelete(ann.id)
                                }
                              }}
                              className="px-3 py-1.5 text-sm font-medium text-red-700 bg-red-100 hover:bg-red-200 transition-colors rounded-lg flex items-center gap-1.5"
                            >
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                              </svg>
                              삭제
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}
          </div>
        </main>

        {/* 점심 메뉴 룰렛 팝업 */}
        <LunchRoulette 
          isOpen={showLunchRoulette} 
          onClose={() => setShowLunchRoulette(false)} 
        />

        {/* 일정 모달 */}
        <EventModal
          isOpen={showEventModal}
          onClose={() => {
            setShowEventModal(false)
            setSelectedEvent(null)
            setSelectedDate(null)
          }}
          event={selectedEvent}
          selectedDate={selectedDate}
          onSave={handleEventSave}
          onDelete={handleEventDelete}
        />

        {/* 공지사항 모달 */}
        <AnnouncementModal
          isOpen={showAnnouncementModal}
          onClose={() => {
            setShowAnnouncementModal(false)
          }}
          announcement={announcement}
          onSave={handleAnnouncementSave}
          onDelete={handleAnnouncementDelete}
        />
      </div>
    </div>
  )
}

export default AdminDashboard

