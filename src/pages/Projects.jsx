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
                Works
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
            <div className="text-red-600 text-sm">
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



