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
    <div className="pt-16 md:pt-20">
      {/* Hero Section */}
      <section className="py-12 md:py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold text-black mb-6 md:mb-8">
            PROJECTS
          </h1>
          <p className="text-lg md:text-xl text-gray-600 max-w-2xl mx-auto">
            우리가 진행한 프로젝트들을 소개합니다.
          </p>
        </div>
      </section>

      {/* Projects Grid */}
      <section className="py-12 md:py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          {loading ? (
            <div className="text-center py-12 text-gray-500">
              프로젝트를 불러오는 중...
            </div>
          ) : error ? (
            <div className="text-center py-12 text-red-500">
              {error}
            </div>
          ) : projects.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              등록된 프로젝트가 없습니다.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12">
              {projects.map((project) => (
                <div
                  key={project.id}
                  className="group cursor-pointer transition-transform hover:scale-[1.02]"
                >
                  <div className="bg-gray-100 aspect-video mb-4 md:mb-6 overflow-hidden rounded-lg">
                    {project.image ? (
                      <img
                        src={project.image}
                        alt={project.title}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                        onError={(e) => {
                          e.target.style.display = 'none'
                        }}
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-gray-100">
                        <svg className="w-16 h-16 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                      </div>
                    )}
                  </div>
                  {project.category && (
                    <div className="text-sm md:text-base text-gray-500 mb-2">
                      {project.category}
                    </div>
                  )}
                  <h3 className="text-2xl md:text-3xl font-bold mb-3 md:mb-4 text-black">
                    {project.title}
                  </h3>
                  {project.description && (
                    <p className="text-gray-600 text-base md:text-lg leading-relaxed">
                      {project.description}
                    </p>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-12 md:py-20 px-4 sm:px-6 lg:px-8 bg-black text-white">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-6 md:mb-8">
            프로젝트를 시작하고 싶으신가요?
          </h2>
          <p className="text-lg md:text-xl mb-8 md:mb-12 text-gray-300">
            함께 멋진 프로젝트를 만들어보세요.
          </p>
          <a
            href="/contact"
            className="inline-block px-8 py-3 bg-white text-black font-medium hover:bg-gray-200 transition-colors"
          >
            문의하기
          </a>
        </div>
      </section>
    </div>
  )
}

export default Projects



