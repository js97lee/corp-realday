import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { fetchProjects } from '../utils/api'

function Projects() {
  const [projects, setProjects] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [viewMode, setViewMode] = useState('grid') // grid, list, feed, full

  useEffect(() => {
    const loadProjects = async () => {
      try {
        setLoading(true)
        setError('')
        const response = await fetchProjects(true) // visible=true: 노출된 프로젝트만
        if (response && (response.success || response.projects)) {
          setProjects(response.projects || [])
        } else {
          // 응답이 없거나 형식이 잘못된 경우 빈 배열 설정
          console.warn('예상치 못한 응답 형식:', response)
          setProjects([])
        }
      } catch (err) {
        console.error('❌ [프로젝트 목록] 프로젝트 불러오기 실패:', err)
        console.error('📍 에러 위치: Projects.jsx > loadProjects()')
        console.error('🔍 에러 상세:', {
          message: err.message,
          status: err.status,
          details: err.details,
          stack: err.stack
        })
        
        // 에러 발생 시 빈 배열로 설정하여 빈 화면 방지
        setProjects([])
        
        // 에러 메시지 구성
        let errorMessage = '❌ 프로젝트 목록을 불러올 수 없습니다.\n\n'
        errorMessage += '📍 발생 위치: 프로젝트 목록 페이지\n'
        errorMessage += '🔧 작업 내용: 노출된 프로젝트 목록 조회\n\n'
        
        // HTTP 상태 코드별 메시지
        if (err.status === 502) {
          errorMessage += '⚠️ 서버 게이트웨이 오류 (502)\n'
          errorMessage += '→ 백엔드 서버가 응답하지 않습니다. 잠시 후 다시 시도해주세요.'
        } else if (err.status === 503) {
          errorMessage += '⚠️ 서비스 일시 중단 (503)\n'
          errorMessage += '→ 서버가 일시적으로 사용할 수 없습니다. 잠시 후 다시 시도해주세요.'
        } else if (err.status === 504) {
          errorMessage += '⚠️ 게이트웨이 타임아웃 (504)\n'
          errorMessage += '→ 서버 응답 시간이 초과되었습니다. 잠시 후 다시 시도해주세요.'
        } else if (err.status >= 500) {
          errorMessage += `⚠️ 서버 오류 (${err.status})\n`
          errorMessage += '→ 서버에 문제가 발생했습니다. 잠시 후 다시 시도해주세요.'
        } else if (err.status === 401 || err.status === 403) {
          errorMessage += '⚠️ 권한 오류\n'
          errorMessage += '→ 로그인이 필요하거나 권한이 없습니다.'
        } else if (err.status === 404) {
          errorMessage += '⚠️ 리소스를 찾을 수 없음 (404)\n'
          errorMessage += '→ 요청한 API 엔드포인트를 찾을 수 없습니다.'
        } else {
          errorMessage += `⚠️ 오류 발생\n`
          errorMessage += `→ ${err.message || '알 수 없는 오류가 발생했습니다.'}`
        }
        
        if (err.details) {
          errorMessage += `\n\n🔍 상세 정보: ${err.details}`
        }
        
        setError(errorMessage)
      } finally {
        setLoading(false)
      }
    }

    loadProjects()
  }, [])

  const viewModes = [
    { id: 'grid', label: 'Grid' },
    { id: 'feed', label: 'Feed' },
    { id: 'full', label: 'Full' }
  ]

  return (
    <div className="min-h-screen bg-white pt-10 md:pt-12">
      <section className="max-w-7xl mx-auto px-6 md:px-12 py-8 md:py-12">
        {/* Header Section */}
        <div className="mb-6 md:mb-8">
          {/* Brand Name */}
          <div className="mb-4 md:mb-6">
            <div className="flex items-baseline gap-2 mb-2">
              <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold text-black">
                Projects
              </h2>
              <span className="text-base md:text-lg text-gray-500 align-super">
                ({projects.length})
              </span>
            </div>
          </div>

          {/* Description and View Modes */}
          <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-6 md:gap-8">
            {/* Description */}
            <p className="text-sm md:text-base text-gray-500 max-w-2xl leading-relaxed">
              REALDAY is a creative agency dedicated to branding that delivers real outcomes, meaningful, measurable, and human.
            </p>

            {/* View Mode Toggle */}
            <div className="flex items-center gap-4 md:gap-6">
              {viewModes.map((mode) => (
                <button
                  key={mode.id}
                  onClick={() => setViewMode(mode.id)}
                  className={`text-sm md:text-base transition-colors duration-200 ${
                    viewMode === mode.id
                      ? 'font-bold text-black'
                      : 'text-gray-400 hover:text-gray-600'
                  }`}
                >
                  {mode.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Projects Grid */}
        {loading ? (
          <div className="py-20 text-center text-gray-400">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-black mb-4"></div>
            <p className="text-sm">로딩 중...</p>
          </div>
        ) : error ? (
          <div className="py-20 text-center">
            <div className="bg-red-50 border border-red-200 text-red-700 px-6 py-4 rounded-lg text-sm max-w-2xl mx-auto whitespace-pre-line text-left">
              {error}
            </div>
          </div>
        ) : projects.length === 0 ? (
          <div className="py-20 text-center text-gray-400">
            <p className="text-sm">등록된 프로젝트가 없습니다.</p>
          </div>
        ) : (
          <div className={`grid gap-4 md:gap-6 ${
            viewMode === 'grid' ? 'grid-cols-2 md:grid-cols-4' :
            viewMode === 'feed' ? 'grid-cols-1 md:grid-cols-2' :
            'grid-cols-1'
          }`}>
            {projects.map((project) => {
              // 프로젝트 이름을 URL-friendly slug로 변환
              const projectSlug = project.title
                .toLowerCase()
                .replace(/[^a-z0-9가-힣]+/g, '-')
                .replace(/^-+|-+$/g, '')
              
              return (
                <Link
                  key={project.id}
                  to={`/project/${projectSlug}`}
                  className="group block"
                >
                  <div className={`w-full overflow-hidden bg-gray-100 transition-all duration-500 ease-out group-hover:[clip-path:circle(85%_at_50%_50%)] ${
                    viewMode === 'grid' ? 'aspect-square' :
                    viewMode === 'feed' ? 'aspect-[4/3]' :
                    'aspect-[21/9]'
                  }`}>
                    {project.image ? (
                      <img
                        src={project.image}
                        alt={project.title}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-gray-200 group-hover:bg-gray-300 transition-colors duration-300">
                        <span className="text-gray-400 text-sm group-hover:text-gray-600 transition-colors duration-300">No Image</span>
                      </div>
                    )}
                  </div>
                </Link>
              )
            })}
          </div>
        )}
      </section>
    </div>
  )
}

export default Projects



