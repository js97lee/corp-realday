import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { fetchProjects } from '../utils/api'
import { getCached } from '../utils/cache'

function Home() {
  // 초기 상태를 캐시에서 즉시 설정하여 첫 렌더링 최적화
  const cached = getCached('projects_false_true')
  const [projects, setProjects] = useState(() => {
    // 캐시가 있으면 즉시 사용, 없으면 빈 배열
    return (cached && cached.success && cached.projects) ? cached.projects : []
  })
  const [loading, setLoading] = useState(() => {
    // 캐시가 있으면 로딩 상태 건너뛰기
    return !(cached && cached.success && cached.projects && cached.projects.length > 0)
  })

  useEffect(() => {
    // 캐시가 이미 있으면 백그라운드 업데이트만 수행
    if (cached && cached.success && cached.projects && cached.projects.length > 0) {
      // requestIdleCallback으로 백그라운드 업데이트 지연 (브라우저가 여유있을 때 실행)
      if (window.requestIdleCallback) {
        window.requestIdleCallback(() => {
          fetchProjects(false, true).then(response => {
            if (response.success && response.projects) {
              setProjects(response.projects)
            }
          }).catch(() => {
            // 백그라운드 업데이트 실패는 무시
          })
        }, { timeout: 2000 })
      } else {
        // requestIdleCallback을 지원하지 않는 브라우저는 setTimeout 사용
        setTimeout(() => {
          fetchProjects(false, true).then(response => {
            if (response.success && response.projects) {
              setProjects(response.projects)
            }
          }).catch(() => {
            // 백그라운드 업데이트 실패는 무시
          })
        }, 100)
      }
      return
    }
    
    // 캐시가 없으면 즉시 로드
    const loadFeaturedProjects = async () => {
      try {
        const response = await fetchProjects(false, true) // featured=true: 랜딩페이지용
        console.log('랜딩페이지 프로젝트 응답:', response)
        if (response && (response.success || response.projects)) {
          setProjects(response.projects || [])
        } else {
          console.warn('예상치 못한 응답 형식:', response)
          setProjects([])
        }
      } catch (err) {
        console.error('❌ [랜딩페이지] 프로젝트 불러오기 실패:', err)
        console.error('📍 에러 위치: Home.jsx > loadFeaturedProjects()')
        console.error('🔍 에러 상세:', {
          message: err.message,
          status: err.status,
          details: err.details,
          stack: err.stack
        })
        
        // 에러 발생 시 빈 배열 설정하여 빈 화면 방지
        setProjects([])
        
        // 502, 503, 504 에러인 경우 콘솔에 상세 정보 출력
        if (err.status === 502 || err.status === 503 || err.status === 504) {
          console.warn('⚠️ [랜딩페이지] 서버 연결 문제로 프로젝트를 불러올 수 없습니다.')
          console.warn('📍 발생 위치: 랜딩페이지 (Home.jsx)')
          console.warn('🔧 작업 내용: Featured 프로젝트 목록 조회')
          console.warn(`⚠️ HTTP 상태 코드: ${err.status}`)
          if (err.status === 502) {
            console.warn('→ 백엔드 서버가 응답하지 않습니다.')
          } else if (err.status === 503) {
            console.warn('→ 서버가 일시적으로 사용할 수 없습니다.')
          } else if (err.status === 504) {
            console.warn('→ 서버 응답 시간이 초과되었습니다.')
          }
        }
      } finally {
        setLoading(false)
      }
    }
    loadFeaturedProjects()
  }, [])

  return (
    <div className="min-h-screen bg-white pt-10 md:pt-12">
      {/* Hero Section - 디자인 에이전시 스타일 */}
      <section className="max-w-7xl mx-auto px-6 md:px-12 py-8 md:py-12">
        <div className="mb-4 md:mb-6 pt-5">
          <div className="mb-2">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-black leading-loose tracking-tight font-outfit mb-2">
              From Vision<br />
              To Infinite Creation
            </h1>
          </div>
        </div>

        {/* Portfolio Items - 깔끔한 리스트 스타일 */}
        {loading ? (
          <div className="py-20 text-center text-gray-400">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-black mb-4"></div>
            <p className="text-sm">로딩 중...</p>
          </div>
        ) : projects.length === 0 ? (
          null
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
            {projects.map((project, index) => {
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
                  <div className="h-full flex flex-col transition-all duration-500 ease-out overflow-hidden">
                    {/* Image */}
                    {project.image && (
                      <div className="w-full aspect-video mb-4 md:mb-6 overflow-hidden bg-gray-100 transition-all duration-500 md:group-hover:rounded-tl-[200px] md:group-hover:rounded-br-[200px]">
                        <img
                          src={project.image}
                          alt={project.title}
                          className="w-full h-full object-cover md:group-hover:scale-110 transition-transform duration-500"
                          loading="lazy"
                          decoding="async"
                          fetchPriority={index < 2 ? "high" : "low"}
                        />
                      </div>
                    )}
                    
                    {/* Content */}
                    <div className="flex-1 px-2">
                      <div className="flex items-baseline gap-3 mb-2">
                        <span className="text-sm md:text-base font-medium text-gray-400 md:group-hover:text-black transition-colors duration-300">
                          {String(index + 1).padStart(2, '0')}
                        </span>
                        <h2 className="text-xl md:text-2xl font-bold text-black md:group-hover:text-gray-700 transition-colors duration-300">
                          {project.title}
                        </h2>
                      </div>
                      {project.description && (
                        <p className="text-sm md:text-base text-gray-600 leading-relaxed line-clamp-2 md:group-hover:text-gray-800 transition-colors duration-300">
                          {project.description}
                        </p>
                      )}
                    </div>
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

export default Home
