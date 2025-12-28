import { useState, useEffect } from 'react'
import { fetchProjects } from '../utils/api'

function Projects() {
  const [projects, setProjects] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    const loadProjects = async () => {
      try {
        setLoading(true)
        setError('')
        const response = await fetchProjects(true) // visible=true: 노출된 프로젝트만
        if (response.success) {
          setProjects(response.projects || [])
        }
      } catch (err) {
        console.error('프로젝트 목록 불러오기 실패:', err)
        setError('프로젝트를 불러올 수 없습니다.')
        // 에러 발생 시 빈 배열로 설정
        setProjects([])
      } finally {
        setLoading(false)
      }
    }

    loadProjects()
  }, [])

  return (
    <div className="min-h-screen bg-white pt-20 md:pt-24">
      {/* Hero Section - 랜딩페이지와 동일한 스타일 */}
      <section className="max-w-7xl mx-auto px-6 md:px-12 py-16 md:py-24">
        <div className="mb-16 md:mb-24">
          <h1 className="text-7xl md:text-8xl lg:text-9xl font-bold text-black leading-[0.9] tracking-tight mb-6 md:mb-8">
            PROJECTS
          </h1>
          <p className="text-lg md:text-xl text-gray-600 mt-6 md:mt-8 max-w-2xl">
            우리가 진행한 프로젝트들을 소개합니다.
          </p>
        </div>

        {/* Projects Grid */}
        <div className="border-t border-black">
          {loading ? (
            <div className="py-20 text-center text-gray-400">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-black mb-4"></div>
              <p className="text-sm">로딩 중...</p>
            </div>
          ) : error ? (
            <div className="py-20 text-center">
              <div className="text-red-600 text-sm">
                {error}
              </div>
            </div>
          ) : projects.length === 0 ? (
            <div className="py-20 text-center text-gray-400">
              <p className="text-sm">등록된 프로젝트가 없습니다.</p>
            </div>
          ) : (
            <div className="space-y-0">
              {projects.map((project, index) => (
                <div
                  key={project.id}
                  className="border-b border-black py-8 md:py-10 hover:bg-gray-50 transition-colors group"
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
                      {project.category && (
                        <div className="text-sm text-gray-500 mb-2">
                          {project.category}
                        </div>
                      )}
                      <h2 className="text-2xl md:text-3xl font-bold text-black mb-3 md:mb-4 group-hover:text-gray-700 transition-colors">
                        {project.title}
                      </h2>
                      {project.description && (
                        <p className="text-base md:text-lg text-gray-600 leading-relaxed">
                          {project.description}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  )
}

export default Projects



