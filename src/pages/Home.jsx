import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { fetchProjects } from '../utils/api'

function Home() {
  const [projects, setProjects] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadFeaturedProjects = async () => {
      try {
        setLoading(true)
        const response = await fetchProjects(false, true) // featured=true: 랜딩페이지용
        if (response.success) {
          setProjects(response.projects || [])
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
    <div className="min-h-screen bg-white pt-20 md:pt-24">
      {/* Hero Section - 디자인 에이전시 스타일 */}
      <section className="max-w-7xl mx-auto px-6 md:px-12 py-16 md:py-24">
        <div className="mb-16 md:mb-24">
          <h1 className="text-7xl md:text-8xl lg:text-9xl font-bold text-black leading-[0.9] tracking-tight">
            INDEX
          </h1>
          <p className="text-lg md:text-xl text-gray-600 mt-6 md:mt-8 max-w-2xl">
            FROM VISION TO INFINITE CREATION
          </p>
        </div>

        {/* Portfolio Items - 깔끔한 리스트 스타일 */}
        {loading ? (
          <div className="py-20 text-center text-gray-400">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-black mb-4"></div>
            <p className="text-sm">로딩 중...</p>
          </div>
        ) : projects.length === 0 ? (
          <div className="py-20 text-center text-gray-400">
            <p className="text-sm">등록된 프로젝트가 없습니다.</p>
          </div>
        ) : (
          <div className="space-y-0 border-t border-black">
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
                  className="block border-b border-black py-8 md:py-10 hover:bg-gray-50 transition-colors group"
                >
                  <div className="flex items-start gap-6 md:gap-8">
                    {/* Number */}
                    <div className="flex-shrink-0 w-12 md:w-16">
                      <div className="text-xl md:text-2xl font-medium text-black mb-2">
                        {String(index + 1).padStart(2, '0')}
                      </div>
                      <div className="w-full h-px bg-black"></div>
                    </div>
                    
                    {/* Content */}
                    <div className="flex-1">
                      <h2 className="text-2xl md:text-3xl font-bold text-black mb-3 md:mb-4 group-hover:text-gray-700 transition-colors">
                        {project.title}
                      </h2>
                      <p className="text-base md:text-lg text-gray-600 leading-relaxed">
                        {project.description}
                      </p>
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
