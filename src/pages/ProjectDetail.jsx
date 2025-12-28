import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { fetchPortfolioItems } from '../utils/api'

function ProjectDetail() {
  const { projectName } = useParams()
  const navigate = useNavigate()
  const [portfolioItem, setPortfolioItem] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadProject = async () => {
      try {
        setLoading(true)
        const response = await fetchPortfolioItems()
        if (response.success) {
          // 프로젝트 이름을 URL-friendly slug로 변환하여 매칭
          const item = response.items?.find(item => {
            const slug = item.title
              .toLowerCase()
              .replace(/[^a-z0-9가-힣]+/g, '-')
              .replace(/^-+|-+$/g, '')
            return slug === projectName || item.title === decodeURIComponent(projectName)
          })
          setPortfolioItem(item || null)
        }
      } catch (err) {
        console.error('프로젝트 불러오기 실패:', err)
        setPortfolioItem(null)
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

  if (!portfolioItem) {
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

  return (
    <div className="min-h-screen bg-white pt-20 md:pt-24">
      <section className="max-w-7xl mx-auto px-6 md:px-12 py-16 md:py-24">
        <div className="mb-8 md:mb-12">
          <button
            onClick={() => navigate('/')}
            className="text-gray-600 hover:text-black transition-colors mb-8 inline-flex items-center gap-2"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            뒤로가기
          </button>
        </div>

        <div className="mb-16 md:mb-24">
          <h1 className="text-7xl md:text-8xl lg:text-9xl font-bold text-black leading-[0.9] tracking-tight mb-6 md:mb-8">
            {portfolioItem.title}
          </h1>
          {portfolioItem.description && (
            <p className="text-lg md:text-xl text-gray-600 mt-6 md:mt-8 max-w-3xl leading-relaxed">
              {portfolioItem.description}
            </p>
          )}
        </div>

        {/* 추가 콘텐츠 영역 - 필요시 확장 가능 */}
        <div className="border-t border-black pt-16 md:pt-24">
          <div className="prose prose-lg max-w-none">
            {/* 여기에 프로젝트 상세 내용을 추가할 수 있습니다 */}
          </div>
        </div>
      </section>
    </div>
  )
}

export default ProjectDetail

