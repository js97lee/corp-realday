import { Link } from 'react-router-dom'

function Home() {
  return (
    <div className="pt-16 md:pt-20">
      {/* Hero Section */}
      <section className="min-h-screen flex items-center justify-center px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold text-black mb-6 md:mb-8 leading-tight">
            REAL DAY
          </h1>
          <p className="text-lg sm:text-xl md:text-2xl text-gray-600 mb-8 md:mb-12 max-w-2xl mx-auto">
            새로운 하루를 시작하는 곳
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/projects"
              className="px-8 py-3 bg-black text-white font-medium hover:bg-gray-800 transition-colors"
            >
              프로젝트 보기
            </Link>
            <Link
              to="/about"
              className="px-8 py-3 border-2 border-black text-black font-medium hover:bg-black hover:text-white transition-colors"
            >
              더 알아보기
            </Link>
          </div>
        </div>
      </section>

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



