import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { fetchProjects } from '../utils/api'
import { getCached } from '../utils/cache'

function Home() {
  const [projects, setProjects] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadFeaturedProjects = async () => {
      try {
        // 캐시 확인 (동기적으로)
        const cached = getCached('projects_false_true')
        
        // 캐시된 데이터가 있으면 즉시 표시하고 로딩 상태 건너뛰기
        if (cached && cached.success && cached.projects && cached.projects.length > 0) {
          // 데이터 복제 (임시로 더 많이 보여주기)
          const duplicatedProjects = [...cached.projects]
          for (let i = 0; i < 3; i++) {
            duplicatedProjects.push(...cached.projects.map(p => ({ ...p, id: `${p.id}_dup_${i}` })))
          }
          setProjects(duplicatedProjects)
          setLoading(false)
          // 백그라운드에서 최신 데이터 확인 (조용히 업데이트)
          fetchProjects(false, true).then(response => {
            if (response.success && response.projects) {
              // 데이터 복제
              const duplicated = [...response.projects]
              for (let i = 0; i < 3; i++) {
                duplicated.push(...response.projects.map(p => ({ ...p, id: `${p.id}_dup_${i}` })))
              }
              setProjects(duplicated)
            }
          }).catch(() => {
            // 백그라운드 업데이트 실패는 무시
          })
          return
        }
        
        // 캐시가 없으면 로딩 표시
        setLoading(true)
        const response = await fetchProjects(false, true) // featured=true: 랜딩페이지용
        if (response.success) {
          const projects = response.projects || []
          // 데이터 복제 (임시로 더 많이 보여주기)
          const duplicatedProjects = [...projects]
          for (let i = 0; i < 3; i++) {
            duplicatedProjects.push(...projects.map(p => ({ ...p, id: `${p.id}_dup_${i}` })))
          }
          setProjects(duplicatedProjects)
        }
      } catch (err) {
        console.error('랜딩페이지 프로젝트 불러오기 실패:', err)
        setProjects([])
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
        <div className="mb-4 md:mb-6">
          <div className="mb-2">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-black leading-relaxed tracking-tight font-outfit mb-2">
              FROM VISION<br />
              TO INFINITE CREATION
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
                  <div className="h-full flex flex-col transition-all duration-500 ease-out overflow-hidden group-hover:[clip-path:polygon(0%_0%,100%_0%,100%_85%,95%_100%,0%_100%)]">
                    {/* Image */}
                    {project.image && (
                      <div className="w-full aspect-[4/3] mb-4 md:mb-6 overflow-hidden bg-gray-100 transition-all duration-500 group-hover:[clip-path:polygon(0%_0%,100%_0%,100%_90%,95%_100%,0%_100%)]">
                        <img
                          src={project.image}
                          alt={project.title}
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                          loading="lazy"
                          decoding="async"
                        />
                      </div>
                    )}
                    
                    {/* Content */}
                    <div className="flex-1 px-2 group-hover:px-4 transition-all duration-500">
                      <div className="flex items-baseline gap-3 mb-2">
                        <span className="text-sm md:text-base font-medium text-gray-400 group-hover:text-black transition-colors duration-300">
                          {String(index + 1).padStart(2, '0')}
                        </span>
                        <h2 className="text-xl md:text-2xl font-bold text-black group-hover:text-gray-700 transition-colors duration-300">
                          {project.title}
                        </h2>
                      </div>
                      {project.description && (
                        <p className="text-sm md:text-base text-gray-600 leading-relaxed line-clamp-2 group-hover:text-gray-800 transition-colors duration-300">
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
