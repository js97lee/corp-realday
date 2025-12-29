import { useState, useEffect, useRef } from 'react'

function About() {
  const [isVisible, setIsVisible] = useState({})
  const sectionRefs = useRef({})

  useEffect(() => {
    const observerOptions = {
      threshold: 0.1,
      rootMargin: '0px 0px -50px 0px'
    }

    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          setIsVisible(prev => ({
            ...prev,
            [entry.target.dataset.section]: true
          }))
        }
      })
    }, observerOptions)

    // 모든 섹션 관찰 시작
    Object.values(sectionRefs.current).forEach((ref) => {
      if (ref) observer.observe(ref)
    })

    return () => {
      Object.values(sectionRefs.current).forEach((ref) => {
        if (ref) observer.unobserve(ref)
      })
    }
  }, [])

  return (
    <div className="min-h-screen bg-white">
      {/* Top Section - Navy Blue Background */}
      <section className="bg-[#1e3a8a] text-white py-16 md:py-24 pt-[calc(1px+3rem+1px+4rem)] md:pt-[calc(1px+4rem+1px+6rem)]">
        <div className="max-w-7xl mx-auto px-6 md:px-12">
          <div className="text-center space-y-4 md:space-y-6 max-w-4xl mx-auto">
            <p 
              className={`text-lg md:text-xl leading-relaxed transition-all duration-700 ease-out ${
                isVisible.intro ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
              }`}
              data-section="intro"
              ref={(el) => {
                if (el) sectionRefs.current.intro = el
              }}
            >
              REALDAY is a professional brand identity design consultancy.
            </p>
            <p 
              className={`text-lg md:text-xl leading-relaxed transition-all duration-700 ease-out delay-100 ${
                isVisible.intro ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
              }`}
            >
              We create and deliver brands that have straight values and experiences.
            </p>
            <p 
              className={`text-lg md:text-xl leading-relaxed transition-all duration-700 ease-out delay-200 ${
                isVisible.intro ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
              }`}
            >
              What keeps our adventurous spirit and realize newness is our belief
            </p>
            <p 
              className={`text-lg md:text-xl leading-relaxed transition-all duration-700 ease-out delay-300 ${
                isVisible.intro ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
              }`}
            >
              facing brands.
            </p>
            <div 
              className={`mt-8 md:mt-12 flex items-center justify-center gap-4 transition-all duration-700 ease-out delay-500 ${
                isVisible.intro ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
              }`}
            >
              <div className="w-12 h-12 bg-white flex items-center justify-center transition-transform duration-300 hover:scale-110 cursor-default">
                <span className="text-[#1e3a8a] font-bold text-lg">RD</span>
              </div>
              <p className="text-xl md:text-2xl font-bold uppercase tracking-wide">
                FROM VISION TO INFINITE CREATION
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Bottom Section - Black Background */}
      <section className="bg-black text-white py-16 md:py-24">
        <div className="max-w-7xl mx-auto px-6 md:px-12">
          {/* Who we are Section */}
          <div 
            className={`mb-16 md:mb-24 transition-all duration-700 ease-out ${
              isVisible.who ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
            }`}
            data-section="who"
            ref={(el) => {
              if (el) sectionRefs.current.who = el
            }}
          >
            <h2 className="text-3xl md:text-4xl font-bold mb-8 md:mb-12 transition-all duration-300 hover:text-white/80">
              Who we are
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12">
              <div className="space-y-4 group">
                <p className="text-base md:text-lg leading-relaxed text-gray-300 transition-all duration-300 group-hover:text-white">
                  REALDAY is a consultancy specialized in brand Design. We build brands by storytelling, art direction, identity design and visual system. We address clear answers and sustain appropriate value and experience.
                </p>
              </div>
              <div className="space-y-4 group">
                <p className="text-base md:text-lg leading-relaxed text-gray-300 transition-all duration-300 group-hover:text-white">
                  리얼데이는 브랜드 디자인 전문 회사입니다. 브랜드 전략과 스토리, 아트디렉션, 아이덴티티 디자인, 비주얼 시스템을 통해 올곧은 가치와 경험을 이야기합니다. 우리는 명확한 답을 찾아 내고, 적합한 가치와 경험을 지속시키고 있습니다.
                </p>
              </div>
            </div>
          </div>

          {/* Divider */}
          <div className="border-t border-gray-700 my-16 md:my-24"></div>

          {/* How we work Section */}
          <div 
            className={`mb-16 md:mb-24 transition-all duration-700 ease-out ${
              isVisible.how ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
            }`}
            data-section="how"
            ref={(el) => {
              if (el) sectionRefs.current.how = el
            }}
          >
            <h2 className="text-3xl md:text-4xl font-bold mb-8 md:mb-12 transition-all duration-300 hover:text-white/80">
              How we work
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12">
              <div className="space-y-6 group">
                <div className="transition-all duration-300 hover:translate-x-2">
                  <h3 className="text-xl md:text-2xl font-bold mb-4 transition-all duration-300 group-hover:text-white/90">
                    Purpose
                  </h3>
                  <p className="text-base md:text-lg leading-relaxed text-gray-300 mb-4 transition-all duration-300 group-hover:text-white">
                    The success of your business is our goal. We maintain a close partnership with our clients by listening to their voices carefully to understand their goals and consumers. Your success makes us stands out.
                  </p>
                  <p className="text-base md:text-lg leading-relaxed text-gray-300 transition-all duration-300 group-hover:text-white">
                    고객의 비즈니스가 성공하는 것이 우리의 첫 번째 목표입니다. 이를 위해 고객과 긴밀한 파트너십을 유지하고, 비즈니스의 목표와 소비자를 이해하기 위해 그들의 목소리를 주의 깊게 듣습니다. 고객이 돋보이는 것이 곧 우리가 돋보이는 것입니다.
                  </p>
                </div>
              </div>
              <div className="space-y-6 group">
                <div className="transition-all duration-300 hover:translate-x-2">
                  <h3 className="text-xl md:text-2xl font-bold mb-4 transition-all duration-300 group-hover:text-white/90">
                    Projects
                  </h3>
                  <p className="text-base md:text-lg leading-relaxed text-gray-300 mb-4 transition-all duration-300 group-hover:text-white">
                    We create and transform brands and convey them to specific targets. We find out and identify brand essence based on meticulous observation and analysis. Moreover, we connect this brand essence to the design outcome. The process completes a brand that conveys positive emotion with a coherent voice.
                  </p>
                  <p className="text-base md:text-lg leading-relaxed text-gray-300 transition-all duration-300 group-hover:text-white">
                    브랜드를 만들고 전달합니다. 면밀한 관찰과 분석을 기반으로, 브랜드 속성을 파악하고 가치를 찾아냅니다. 그리고 그 맥락을 디자인 결과물로 연결합니다. 이 과정을 통해 일관된 목소리로 긍정적인 감정을 전달하는 브랜드를 완성합니다.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Divider */}
          <div className="border-t border-gray-700 my-16 md:my-24"></div>

          {/* Awards Section */}
          <div 
            className={`mb-16 md:mb-24 transition-all duration-700 ease-out ${
              isVisible.awards ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
            }`}
            data-section="awards"
            ref={(el) => {
              if (el) sectionRefs.current.awards = el
            }}
          >
            <h2 className="text-3xl md:text-4xl font-bold mb-8 md:mb-12 transition-all duration-300 hover:text-white/80">
              Awards
            </h2>
            <div className="space-y-3 md:space-y-4">
              <div className="text-base md:text-lg text-gray-300 transition-all duration-300 hover:text-white hover:translate-x-2 cursor-default">
                <strong>IF Design Awards:</strong> Communication - Winner (2024)
              </div>
            </div>
          </div>

          {/* Media & Activity Section */}
          <div 
            className={`transition-all duration-700 ease-out ${
              isVisible.media ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
            }`}
            data-section="media"
            ref={(el) => {
              if (el) sectionRefs.current.media = el
            }}
          >
            <h2 className="text-3xl md:text-4xl font-bold mb-8 md:mb-12 transition-all duration-300 hover:text-white/80">
              Media & Activity
            </h2>
            <div className="space-y-3 md:space-y-4">
              <div className="text-base md:text-lg text-gray-300 transition-all duration-300 hover:text-white hover:translate-x-2 cursor-default">
                <strong>Lecture</strong> — November 2025, Dankook University
              </div>
              <div className="text-base md:text-lg text-gray-300 transition-all duration-300 hover:text-white hover:translate-x-2 cursor-default">
                <strong>Exhibition</strong> — 2025' 10 - AI Exhibition : Amuse Oeil
              </div>
              <div className="text-base md:text-lg text-gray-300 transition-all duration-300 hover:text-white hover:translate-x-2 cursor-default">
                <strong>Exhibition</strong> — 2025' 07 - AI Exhibition : Objecture
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}

export default About
