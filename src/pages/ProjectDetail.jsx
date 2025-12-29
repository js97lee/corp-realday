import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { fetchProjects } from '../utils/api'

function ProjectDetail() {
  const { projectName } = useParams()
  const navigate = useNavigate()
  const [project, setProject] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadProject = async () => {
      try {
        setLoading(true)
        // 모든 프로젝트에서 찾기 (visible=false로 모든 프로젝트 조회)
        const response = await fetchProjects(false)
        if (response.success) {
          // 프로젝트 이름을 URL-friendly slug로 변환하여 매칭
          const foundProject = response.projects?.find(proj => {
            const slug = proj.title
              .toLowerCase()
              .replace(/[^a-z0-9가-힣]+/g, '-')
              .replace(/^-+|-+$/g, '')
            return slug === projectName || proj.title === decodeURIComponent(projectName)
          })
          setProject(foundProject || null)
        }
      } catch (err) {
        console.error('프로젝트 불러오기 실패:', err)
        setProject(null)
      } finally {
        setLoading(false)
      }
    }
    loadProject()
  }, [projectName])

  if (loading) {
    return (
      <div className="min-h-screen bg-white pt-20 md:pt-24">
        <div className="max-w-7xl mx-auto px-6 md:px-12 py-16 md:py-24">
          <div className="py-20 text-center text-gray-400">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-black mb-4"></div>
            <p className="text-sm">로딩 중...</p>
          </div>
        </div>
      </div>
    )
  }

  if (!project) {
    return (
      <div className="min-h-screen bg-white pt-20 md:pt-24">
        <div className="max-w-7xl mx-auto px-6 md:px-12 py-16 md:py-24">
          <div className="py-20 text-center">
            <h1 className="text-2xl md:text-3xl font-bold text-black mb-4">프로젝트를 찾을 수 없습니다</h1>
            <button
              onClick={() => navigate('/')}
              className="text-gray-600 hover:text-black transition-colors"
            >
              홈으로 돌아가기
            </button>
          </div>
        </div>
      </div>
    )
  }

  // 미디어 배열 파싱 (JSON 문자열일 수 있음)
  const mediaArray = project.media 
    ? (typeof project.media === 'string' ? JSON.parse(project.media) : project.media)
    : []

  // 썸네일 이미지도 미디어 배열에 포함
  const allMedia = project.image 
    ? [{ type: 'image', url: project.image }, ...mediaArray]
    : mediaArray

  return (
    <div className="min-h-screen bg-white pt-20 md:pt-24">
      <section className="max-w-7xl mx-auto px-6 md:px-12 py-16 md:py-24">
        {/* 뒤로가기 버튼 */}
        <div className="mb-8 md:mb-12">
          <button
            onClick={() => navigate(-1)}
            className="text-gray-600 hover:text-black transition-colors mb-8 inline-flex items-center gap-2"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            뒤로가기
          </button>
        </div>

        {/* 프로젝트 헤더 */}
        <div className="mb-16 md:mb-24">
          <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold text-black leading-tight tracking-tight mb-6 md:mb-8">
            {project.title}
          </h1>
          {project.description && (
            <p className="text-lg md:text-xl text-gray-600 max-w-3xl leading-relaxed">
              {project.description}
            </p>
          )}
          {project.category && (
            <div className="mt-4">
              <span className="text-sm md:text-base text-gray-500 uppercase tracking-wide">
                {project.category}
              </span>
            </div>
          )}
        </div>

        {/* 미디어 갤러리 - 스택 형태 */}
        {allMedia.length > 0 ? (
          <div className="space-y-6 md:space-y-8">
            {allMedia.map((item, index) => (
              <div 
                key={index} 
                className="w-full relative group"
                style={{ 
                  zIndex: allMedia.length - index 
                }}
              >
                {/* 스택 카드 효과 */}
                <div className="relative bg-white rounded-lg shadow-lg overflow-hidden transition-all duration-300 hover:shadow-xl">
                  {item.type === 'video' ? (
                    // 비디오
                    <div className="w-full aspect-video bg-black overflow-hidden">
                      {item.url.includes('youtube.com') || item.url.includes('youtu.be') ? (
                        // YouTube 비디오
                        <iframe
                          src={item.url.includes('youtu.be') 
                            ? `https://www.youtube.com/embed/${item.url.split('/').pop()}`
                            : item.url.includes('embed') 
                              ? item.url 
                              : `https://www.youtube.com/embed/${item.url.split('v=')[1]?.split('&')[0]}`
                          }
                          className="w-full h-full"
                          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                          allowFullScreen
                          title={project.title}
                        />
                      ) : (
                        // 일반 비디오
                        <video
                          src={item.url}
                          controls
                          className="w-full h-full object-contain"
                        >
                          브라우저가 비디오 태그를 지원하지 않습니다.
                        </video>
                      )}
                    </div>
                  ) : (
                    // 이미지
                    <div className="w-full bg-gray-50">
                      <img
                        src={item.url}
                        alt={`${project.title} - ${index + 1}`}
                        className="w-full h-auto object-contain"
                        loading="lazy"
                      />
                    </div>
                  )}
                  
                  {/* 미디어 인덱스 표시 (선택사항) */}
                  {allMedia.length > 1 && (
                    <div className="absolute top-4 right-4 bg-black/70 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                      {index + 1} / {allMedia.length}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          // 미디어가 없을 때 썸네일 이미지 표시
          project.image && (
            <div className="w-full">
              <div className="relative bg-white rounded-lg shadow-lg overflow-hidden">
                <img
                  src={project.image}
                  alt={project.title}
                  className="w-full h-auto object-contain"
                />
              </div>
            </div>
          )
        )}
      </section>
    </div>
  )
}

export default ProjectDetail
