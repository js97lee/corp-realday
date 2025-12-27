function About() {
  return (
    <div className="pt-16 md:pt-20">
      {/* Hero Section */}
      <section className="py-12 md:py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold text-black mb-6 md:mb-8">
            ABOUT
          </h1>
          <div className="prose prose-lg max-w-none">
            <p className="text-lg md:text-xl text-gray-700 mb-6 leading-relaxed">
              REAL DAY는 새로운 하루를 시작하는 곳입니다. 우리는 창의적이고 혁신적인 솔루션을 통해 
              고객의 비전을 현실로 만들어갑니다.
            </p>
            <p className="text-lg md:text-xl text-gray-700 mb-6 leading-relaxed">
              최신 기술과 트렌드를 반영한 웹 개발, 사용자 경험 중심의 디자인, 그리고 성능 최적화에 
              중점을 둔 프로젝트를 진행합니다.
            </p>
          </div>
        </div>
      </section>

      {/* Values Section */}
      <section className="py-12 md:py-20 px-4 sm:px-6 lg:px-8 bg-gray-50">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold mb-12 md:mb-16 text-center">
            우리의 가치
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12">
            <div>
              <h3 className="text-2xl md:text-3xl font-semibold mb-4">창의성</h3>
              <p className="text-gray-600 text-base md:text-lg leading-relaxed">
                기존의 틀에 갇히지 않고 새로운 아이디어와 접근 방식을 통해 
                독창적인 솔루션을 만들어냅니다.
              </p>
            </div>
            <div>
              <h3 className="text-2xl md:text-3xl font-semibold mb-4">품질</h3>
              <p className="text-gray-600 text-base md:text-lg leading-relaxed">
                최고의 품질을 위해 세심한 주의를 기울이며, 모든 프로젝트에서 
                완벽함을 추구합니다.
              </p>
            </div>
            <div>
              <h3 className="text-2xl md:text-3xl font-semibold mb-4">협력</h3>
              <p className="text-gray-600 text-base md:text-lg leading-relaxed">
                고객과의 긴밀한 협력을 통해 프로젝트의 성공을 보장하고, 
                함께 성장해나갑니다.
              </p>
            </div>
            <div>
              <h3 className="text-2xl md:text-3xl font-semibold mb-4">혁신</h3>
              <p className="text-gray-600 text-base md:text-lg leading-relaxed">
                지속적인 학습과 개선을 통해 최신 기술과 트렌드를 반영한 
                혁신적인 솔루션을 제공합니다.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Team Section */}
      <section className="py-12 md:py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-6 md:mb-8">
            함께하는 사람들
          </h2>
          <p className="text-lg md:text-xl text-gray-600 leading-relaxed">
            REAL DAY는 다양한 전문성을 가진 팀원들이 함께 모여 
            최고의 결과물을 만들어냅니다.
          </p>
        </div>
      </section>
    </div>
  )
}

export default About



