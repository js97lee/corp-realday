import { useState, useEffect } from 'react'
import { fetchPortfolioItems } from '../utils/api'

function Home() {
  const [portfolioItems, setPortfolioItems] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadPortfolioItems = async () => {
      try {
        setLoading(true)
        const response = await fetchPortfolioItems()
        if (response.success) {
          setPortfolioItems(response.items || [])
        }
      } catch (err) {
        console.error('포트폴리오 항목 불러오기 실패:', err)
        setPortfolioItems([])
      } finally {
        setLoading(false)
      }
    }
    loadPortfolioItems()
  }, [])

  const currentYear = new Date().getFullYear()

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="border-b border-black px-6 md:px-12 py-4">
        <div className="max-w-7xl mx-auto flex justify-between items-center text-sm md:text-base">
          <div className="font-medium">{currentYear}</div>
          <div className="font-medium">UX/UI Design Portfolio</div>
          <div className="font-medium">@realday</div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-6 md:px-12 py-12 md:py-20">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 md:gap-16">
          {/* Left Column - Index */}
          <div className="md:col-span-5 flex flex-col justify-between min-h-[60vh]">
            <h1 className="text-6xl md:text-8xl lg:text-9xl font-bold text-black leading-none">
              Index
            </h1>
            <div className="mt-8 md:mt-0">
              <svg className="w-12 h-12 md:w-16 md:h-16 text-black" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v2.25m6.364.386l-1.591 1.591M21 12h-2.25m-.386 6.364l-1.591-1.591M12 18.75V21m-4.773-4.227l-1.591 1.591M5.25 12H3m4.227-4.773L5.636 5.636M15.75 12a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0z" />
              </svg>
            </div>
          </div>

          {/* Right Column - Portfolio Items */}
          <div className="md:col-span-7">
            {loading ? (
              <div className="py-12 text-center text-gray-500">
                로딩 중...
              </div>
            ) : portfolioItems.length === 0 ? (
              <div className="py-12 text-center text-gray-500">
                <p className="text-sm">등록된 포트폴리오 항목이 없습니다.</p>
              </div>
            ) : (
              <div className="space-y-0">
                {portfolioItems.map((item, index) => (
                  <div key={item.id} className="border-b border-black py-6 md:py-8">
                    <div className="flex items-start gap-4 md:gap-6">
                      {/* Number */}
                      <div className="flex-shrink-0">
                        <div className="text-2xl md:text-3xl font-medium text-black">
                          {String(item.number || index + 1).padStart(2, '0')}
                        </div>
                        <div className="w-8 md:w-12 h-px bg-black mt-2"></div>
                      </div>
                      
                      {/* Content */}
                      <div className="flex-1">
                        <h2 className="text-xl md:text-2xl font-bold text-black mb-3 md:mb-4">
                          {item.title}
                        </h2>
                        <p className="text-sm md:text-base text-gray-700 leading-relaxed">
                          {item.description}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  )
}

export default Home
