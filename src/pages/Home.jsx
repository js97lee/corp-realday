import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { fetchProjects } from '../utils/api'

function Home() {
  const [featuredProjects, setFeaturedProjects] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadFeaturedProjects = async () => {
      try {
        const response = await fetchProjects(true) // visible=true만
        if (response.success) {
          // 최신 프로젝트 3개만 가져오기
          setFeaturedProjects((response.projects || []).slice(0, 3))
        }
      } catch (err) {
        console.error('프로젝트 불러오기 실패:', err)
      } finally {
        setLoading(false)
      }
    }
    loadFeaturedProjects()
  }, [])

  return (
    <div className="pt-16 md:pt-20">
      {/* Hero Section */}
      <section className="min-h-screen flex items-center justify-center px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center animate-fade-in-up">
          <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold text-black mb-6 md:mb-8 leading-tight">
            REAL DAY
          </h1>
          <p className="text-lg sm:text-xl md:text-2xl text-gray-600 mb-8 md:mb-12 max-w-2xl mx-auto">
            새로운 하루를 시작하는 곳
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/projects"
              className="px-8 py-3 bg-black text-white font-medium hover:bg-gray-800 transition-all hover:scale-105 rounded-lg"
            >
              프로젝트 보기
            </Link>
            <Link
              to="/about"
              className="px-8 py-3 border-2 border-black text-black font-medium hover:bg-black hover:text-white transition-all hover:scale-105 rounded-lg"
            >
              더 알아보기
            </Link>
          </div>
        </div>
      </section>

      {/* Featured Projects Section */}
      {featuredProjects.length > 0 && (
        <section className="py-16 md:py-24 px-4 sm:px-6 lg:px-8 bg-white">
          <div className="max-w-7xl mx-auto">
            <div className="flex justify-between items-center mb-12 md:mb-16">
              <h2 className="text-3xl md:text-4xl font-bold text-black">
                최신 프로젝트
              </h2>
              <Link
                to="/projects"
                className="text-black font-medium hover:underline flex items-center gap-2"
              >
                전체 보기
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </Link>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-12">
              {featuredProjects.map((project) => (
                <Link
                  key={project.id}
                  to="/projects"
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
                  <h3 className="text-xl md:text-2xl font-bold mb-2 text-black">
                    {project.title}
                  </h3>
                  {project.description && (
                    <p className="text-gray-600 text-sm md:text-base line-clamp-2">
                      {project.description}
                    </p>
                  )}
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Features Section */}
      <section className="py-16 md:py-24 px-4 sm:px-6 lg:px-8 bg-gray-50">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-12 md:mb-16">
            우리가 하는 일
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-12">
            <div className="text-center">
              <div className="w-16 h-16 md:w-20 md:h-20 bg-black rounded-full mx-auto mb-4 md:mb-6 flex items-center justify-center">
                <svg className="w-8 h-8 md:w-10 md:h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                </svg>
              </div>
              <h3 className="text-xl md:text-2xl font-semibold mb-3 md:mb-4">혁신</h3>
              <p className="text-gray-600 text-sm md:text-base">
                최신 기술과 트렌드를 반영한 혁신적인 솔루션을 제공합니다.
              </p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 md:w-20 md:h-20 bg-black rounded-full mx-auto mb-4 md:mb-6 flex items-center justify-center">
                <svg className="w-8 h-8 md:w-10 md:h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
                </svg>
              </div>
              <h3 className="text-xl md:text-2xl font-semibold mb-3 md:mb-4">반응형</h3>
              <p className="text-gray-600 text-sm md:text-base">
                모든 디바이스에서 완벽하게 작동하는 반응형 디자인을 구현합니다.
              </p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 md:w-20 md:h-20 bg-black rounded-full mx-auto mb-4 md:mb-6 flex items-center justify-center">
                <svg className="w-8 h-8 md:w-10 md:h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <h3 className="text-xl md:text-2xl font-semibold mb-3 md:mb-4">성능</h3>
              <p className="text-gray-600 text-sm md:text-base">
                빠르고 효율적인 성능을 위한 최적화된 코드를 작성합니다.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}

export default Home




