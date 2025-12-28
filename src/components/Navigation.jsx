import { useState } from 'react'
import { Link, useLocation } from 'react-router-dom'

function Navigation() {
  const [isOpen, setIsOpen] = useState(false)
  const location = useLocation()

  const navItems = [
    { path: '/about', label: 'ABOUT' },
    { path: '/projects', label: 'PROJECTS' },
    { path: '/contact', label: 'CONTACT' },
  ]

  const isActive = (path) => {
    if (path === '/') {
      return location.pathname === '/'
    }
    return location.pathname.startsWith(path)
  }

  return (
    <nav className="fixed top-0 left-0 right-0 z-50">
      {/* 상단 검은색 선 */}
      <div className="h-px bg-black"></div>
      
      {/* 회색 배경 헤더 */}
      <div className="bg-gray-50 border-b border-black px-6 md:px-12 py-3 md:py-4">
        <div className="max-w-7xl mx-auto flex justify-between items-center text-sm md:text-base">
          {/* 왼쪽: 회사 로고 */}
          <Link to="/" className="flex items-center">
            <img 
              src="/logo-black.svg" 
              alt="Company Logo" 
              className="h-6 md:h-8 w-auto"
            />
          </Link>
          
          {/* 오른쪽: 계정 및 메뉴 */}
          <div className="flex items-center gap-4 md:gap-6">
            <div className="font-medium text-black hidden md:block">@realday</div>
            
            {/* 데스크톱 메뉴 */}
            <div className="hidden md:flex items-center gap-6">
              {navItems.map((item) => (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`text-xs md:text-sm transition-colors ${
                    isActive(item.path)
                      ? 'text-black font-bold'
                      : 'text-gray-600 hover:text-black font-medium'
                  }`}
                >
                  {item.label}
                </Link>
              ))}
            </div>
            
            {/* 모바일 메뉴 버튼 */}
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="md:hidden p-2 text-black focus:outline-none"
              aria-label="Toggle menu"
            >
              <svg
                className="w-5 h-5"
                fill="none"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                {isOpen ? (
                  <path d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </button>
          </div>
        </div>
        
        {/* 모바일 메뉴 */}
        {isOpen && (
          <div className="md:hidden mt-4 pb-2 border-t border-gray-300 pt-4">
            <div className="flex flex-col space-y-3 px-6 md:px-12">
              {navItems.map((item) => (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={() => setIsOpen(false)}
                  className={`text-sm transition-colors ${
                    isActive(item.path)
                      ? 'text-black font-bold'
                      : 'text-gray-600 hover:text-black font-medium'
                  }`}
                >
                  {item.label}
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
      
      {/* 하단 검은색 선 */}
      <div className="h-px bg-black"></div>
    </nav>
  )
}

export default Navigation
