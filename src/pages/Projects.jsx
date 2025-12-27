function Projects() {
  const projects = [
    {
      id: 1,
      title: '프로젝트 1',
      description: '혁신적인 웹 애플리케이션 개발 프로젝트입니다.',
      category: 'Web Development',
      image: 'https://via.placeholder.com/600x400?text=Project+1',
    },
    {
      id: 2,
      title: '프로젝트 2',
      description: '모바일 최적화 반응형 웹사이트 구축 프로젝트입니다.',
      category: 'Responsive Design',
      image: 'https://via.placeholder.com/600x400?text=Project+2',
    },
    {
      id: 3,
      title: '프로젝트 3',
      description: '사용자 경험 중심의 디자인 시스템 구축 프로젝트입니다.',
      category: 'UX/UI Design',
      image: 'https://via.placeholder.com/600x400?text=Project+3',
    },
    {
      id: 4,
      title: '프로젝트 4',
      description: '성능 최적화 및 SEO 개선 프로젝트입니다.',
      category: 'Performance',
      image: 'https://via.placeholder.com/600x400?text=Project+4',
    },
  ]

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
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12">
            {projects.map((project) => (
              <div
                key={project.id}
                className="group cursor-pointer transition-transform hover:scale-[1.02]"
              >
                <div className="bg-gray-100 aspect-video mb-4 md:mb-6 overflow-hidden rounded-lg">
                  <img
                    src={project.image}
                    alt={project.title}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                  />
                </div>
                <div className="text-sm md:text-base text-gray-500 mb-2">
                  {project.category}
                </div>
                <h3 className="text-2xl md:text-3xl font-bold mb-3 md:mb-4 text-black">
                  {project.title}
                </h3>
                <p className="text-gray-600 text-base md:text-lg leading-relaxed">
                  {project.description}
                </p>
              </div>
            ))}
          </div>
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



