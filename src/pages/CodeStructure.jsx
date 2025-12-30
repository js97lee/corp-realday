import { useState } from 'react'

function CodeStructure() {
  const [expandedFolders, setExpandedFolders] = useState({
    'src': true,
    'src/components': true,
    'src/pages': true,
    'src/utils': true,
    'netlify/functions': true,
  })

  const toggleFolder = (folder) => {
    setExpandedFolders(prev => ({
      ...prev,
      [folder]: !prev[folder]
    }))
  }

  const structure = {
    'real-day': {
      type: 'folder',
      children: {
        'src': {
          type: 'folder',
          children: {
            'components': {
              type: 'folder',
              children: {
                'common': {
                  type: 'folder',
                  children: {
                    'Button.jsx': { type: 'file', description: '공통 버튼 컴포넌트' },
                    'ConfirmDialog.jsx': { type: 'file', description: '확인 다이얼로그' },
                    'ErrorMessage.jsx': { type: 'file', description: '에러 메시지 컴포넌트' },
                    'FormInput.jsx': { type: 'file', description: '폼 입력 컴포넌트' },
                    'FormSelect.jsx': { type: 'file', description: '폼 셀렉트 컴포넌트' },
                    'LoadingSpinner.jsx': { type: 'file', description: '로딩 스피너' },
                    'PageHeader.jsx': { type: 'file', description: '페이지 헤더' },
                    'index.js': { type: 'file', description: '공통 컴포넌트 export' },
                  }
                },
                'AdminEmailComposer.jsx': { type: 'file', description: '관리자 이메일 작성기' },
                'AnnouncementModal.jsx': { type: 'file', description: '공지사항 모달' },
                'Calendar.jsx': { type: 'file', description: '캘린더 컴포넌트' },
                'EventModal.jsx': { type: 'file', description: '일정 모달' },
                'Footer.jsx': { type: 'file', description: '푸터 컴포넌트' },
                'Layout.jsx': { type: 'file', description: '레이아웃 컴포넌트' },
                'LunchRoulette.jsx': { type: 'file', description: '점심 메뉴 룰렛' },
                'Navigation.jsx': { type: 'file', description: '네비게이션 컴포넌트' },
              }
            },
            'pages': {
              type: 'folder',
              children: {
                'Home.jsx': { type: 'file', description: '랜딩 페이지 (프로젝트 목록)' },
                'About.jsx': { type: 'file', description: '회사 소개 페이지' },
                'Projects.jsx': { type: 'file', description: '프로젝트 목록 페이지' },
                'ProjectDetail.jsx': { type: 'file', description: '프로젝트 상세 페이지 (Behance 스타일)' },
                'Contact.jsx': { type: 'file', description: '문의 페이지' },
                'AdminLogin.jsx': { type: 'file', description: '관리자 로그인 페이지' },
                'AdminDashboard.jsx': { type: 'file', description: '관리자 대시보드 (메인)' },
                'AdminProjects.jsx': { type: 'file', description: '프로젝트 관리 페이지' },
                'AdminPortfolio.jsx': { type: 'file', description: '랜딩페이지 관리 (Featured 프로젝트)' },
                'AdminMembers.jsx': { type: 'file', description: '멤버 관리 페이지' },
                'AdminTasks.jsx': { type: 'file', description: '작업 관리 페이지' },
                'AdminContacts.jsx': { type: 'file', description: '문의 관리 페이지' },
                'AdminFinance.jsx': { type: 'file', description: '재무 관리 페이지' },
              }
            },
            'hooks': {
              type: 'folder',
              children: {
                'useAuth.js': { type: 'file', description: '인증 훅' },
                'useCrud.js': { type: 'file', description: 'CRUD 작업 훅' },
              }
            },
            'utils': {
              type: 'folder',
              children: {
                'api.js': { type: 'file', description: 'API 호출 유틸리티 (fetchProjects, adminLogin 등)' },
                'auth.js': { type: 'file', description: '인증 유틸리티 (getUserRole, isSuperAdmin 등)' },
                'cache.js': { type: 'file', description: '클라이언트 캐싱 유틸리티' },
                'date.js': { type: 'file', description: '날짜 포맷 유틸리티' },
              }
            },
            'App.jsx': { type: 'file', description: '메인 앱 컴포넌트 (라우팅 설정)' },
            'main.jsx': { type: 'file', description: '앱 진입점' },
            'index.css': { type: 'file', description: '전역 스타일' },
          }
        },
        'netlify': {
          type: 'folder',
          children: {
            'functions': {
              type: 'folder',
              children: {
                'db.js': { type: 'file', description: '데이터베이스 연결 및 초기화' },
                'admin-login.js': { type: 'file', description: '관리자 로그인 API' },
                'projects.js': { type: 'file', description: '프로젝트 CRUD API' },
                'members.js': { type: 'file', description: '멤버 관리 API' },
                'tasks.js': { type: 'file', description: '작업 관리 API' },
                'contacts.js': { type: 'file', description: '문의 관리 API' },
                'finances.js': { type: 'file', description: '재무 관리 API' },
                'events.js': { type: 'file', description: '일정 관리 API' },
                'announcements.js': { type: 'file', description: '공지사항 API' },
                'portfolio-items.js': { type: 'file', description: '포트폴리오 항목 API' },
                'send-email.js': { type: 'file', description: '이메일 전송 API' },
                'contact.js': { type: 'file', description: '문의 폼 제출 API' },
                'event-invitations.js': { type: 'file', description: '일정 초대 API' },
                'test-db.js': { type: 'file', description: 'DB 테스트 API' },
              }
            },
            'netlify.toml': { type: 'file', description: 'Netlify 설정 파일' },
          }
        },
        'server': {
          type: 'folder',
          children: {
            'server.js': { type: 'file', description: '로컬 개발 서버 (Express)' },
            'package.json': { type: 'file', description: '서버 의존성' },
          }
        },
        'public': {
          type: 'folder',
          children: {
            'logo-behance.svg': { type: 'file', description: 'Behance 로고' },
            'logo-black.svg': { type: 'file', description: '로고 (검정)' },
            'logo-white.svg': { type: 'file', description: '로고 (흰색)' },
            '_redirects': { type: 'file', description: 'Netlify 리다이렉트 설정' },
          }
        },
        'package.json': { type: 'file', description: '프로젝트 의존성 및 스크립트' },
        'vite.config.js': { type: 'file', description: 'Vite 빌드 설정' },
        'tailwind.config.js': { type: 'file', description: 'Tailwind CSS 설정' },
        'postcss.config.js': { type: 'file', description: 'PostCSS 설정' },
      }
    }
  }

  const renderTree = (node, path = '', depth = 0) => {
    if (!node || !node.children) return null

    return Object.entries(node.children).map(([name, item]) => {
      const fullPath = path ? `${path}/${name}` : name
      const isExpanded = expandedFolders[fullPath]
      const isFolder = item.type === 'folder'

      return (
        <div key={fullPath} className={`${depth > 0 ? 'ml-6' : ''}`}>
          <div
            className={`flex items-center py-1 px-2 hover:bg-gray-50 rounded cursor-pointer ${depth === 0 ? 'font-semibold' : ''}`}
            onClick={() => isFolder && toggleFolder(fullPath)}
          >
            {isFolder ? (
              <>
                <svg
                  className={`w-4 h-4 mr-2 transition-transform ${isExpanded ? 'rotate-90' : ''}`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
                <span className="text-blue-600 font-medium">{name}/</span>
              </>
            ) : (
              <>
                <svg className="w-4 h-4 mr-2 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                <span className="text-gray-700">{name}</span>
              </>
            )}
            {item.description && (
              <span className="ml-3 text-sm text-gray-500">- {item.description}</span>
            )}
          </div>
          {isFolder && isExpanded && item.children && (
            <div className="border-l-2 border-gray-200 ml-2">
              {renderTree(item, fullPath, depth + 1)}
            </div>
          )}
        </div>
      )
    })
  }

  return (
    <div className="min-h-screen bg-white py-12 px-6">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-black mb-2">코드 구조도</h1>
          <p className="text-gray-600">REAL DAY 프로젝트 전체 코드 구조</p>
        </div>

        <div className="bg-white border border-gray-200 rounded-lg shadow-lg p-6">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-xl font-semibold text-gray-900">프로젝트 구조</h2>
            <button
              onClick={() => {
                setExpandedFolders({
                  'src': true,
                  'src/components': true,
                  'src/pages': true,
                  'src/utils': true,
                  'netlify/functions': true,
                })
              }}
              className="text-sm text-blue-600 hover:text-blue-800"
            >
              모두 펼치기
            </button>
          </div>
          
          <div className="font-mono text-sm">
            {renderTree(structure)}
          </div>
        </div>

        <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-gray-50 rounded-lg p-6">
            <h3 className="text-lg font-semibold mb-4">주요 기능</h3>
            <ul className="space-y-2 text-sm text-gray-700">
              <li>• 프로젝트 포트폴리오 관리 (Behance 스타일)</li>
              <li>• 관리자 대시보드 (프로젝트, 멤버, 작업, 재무)</li>
              <li>• 공지사항 관리</li>
              <li>• 캘린더 일정 관리</li>
              <li>• 문의 관리</li>
              <li>• 이메일 전송</li>
            </ul>
          </div>

          <div className="bg-gray-50 rounded-lg p-6">
            <h3 className="text-lg font-semibold mb-4">기술 스택</h3>
            <ul className="space-y-2 text-sm text-gray-700">
              <li>• <strong>Frontend:</strong> React 18, React Router, Tailwind CSS</li>
              <li>• <strong>Backend:</strong> Netlify Functions (Serverless)</li>
              <li>• <strong>Database:</strong> PostgreSQL (Neon)</li>
              <li>• <strong>Build:</strong> Vite</li>
              <li>• <strong>Deployment:</strong> Netlify</li>
            </ul>
          </div>
        </div>

        <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-6">
          <h3 className="text-lg font-semibold mb-4 text-blue-900">API 엔드포인트</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div>
              <h4 className="font-semibold mb-2">인증</h4>
              <ul className="space-y-1 text-gray-700">
                <li>POST /api/admin-login</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-2">프로젝트</h4>
              <ul className="space-y-1 text-gray-700">
                <li>GET /api/projects</li>
                <li>POST /api/projects</li>
                <li>PUT /api/projects/:id</li>
                <li>DELETE /api/projects/:id</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-2">멤버</h4>
              <ul className="space-y-1 text-gray-700">
                <li>GET /api/members</li>
                <li>POST /api/members</li>
                <li>PUT /api/members/:id</li>
                <li>DELETE /api/members/:id</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-2">작업</h4>
              <ul className="space-y-1 text-gray-700">
                <li>GET /api/tasks</li>
                <li>POST /api/tasks</li>
                <li>PUT /api/tasks/:id</li>
                <li>DELETE /api/tasks/:id</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-2">문의</h4>
              <ul className="space-y-1 text-gray-700">
                <li>GET /api/contacts</li>
                <li>POST /api/contact</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-2">기타</h4>
              <ul className="space-y-1 text-gray-700">
                <li>GET /api/finances</li>
                <li>GET /api/events</li>
                <li>GET /api/announcements</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default CodeStructure


