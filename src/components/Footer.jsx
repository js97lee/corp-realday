import { Link } from 'react-router-dom'

function Footer() {
  const currentYear = new Date().getFullYear()

  return (
    <footer className="bg-black text-white">
      <div className="max-w-7xl mx-auto px-6 md:px-12 py-12 md:py-16">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 md:gap-12">
          {/* Brand */}
          <div className="md:col-span-2">
            <Link to="/" className="mb-4 inline-block hover:opacity-80 transition-opacity">
              <img 
                src="/logo-white.svg" 
                alt="REAL DAY" 
                className="h-10 md:h-12 w-auto"
              />
            </Link>
            <p className="text-gray-400 text-sm md:text-base mb-4 max-w-md">
              FROM VISION TO INFINITE CREATION
            </p>
            <p className="text-gray-400 text-sm md:text-base mb-4 max-w-md">
              혁신적인 솔루션으로 고객의 비전을 무한한 창작으로 만들어갑니다.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-lg font-semibold mb-4">빠른 링크</h3>
            <ul className="space-y-2">
              <li>
                <Link to="/" className="text-gray-400 hover:text-white transition-colors text-sm md:text-base">
                  홈
                </Link>
              </li>
              <li>
                <Link to="/about" className="text-gray-400 hover:text-white transition-colors text-sm md:text-base">
                  소개
                </Link>
              </li>
              <li>
                <Link to="/projects" className="text-gray-400 hover:text-white transition-colors text-sm md:text-base">
                  프로젝트
                </Link>
              </li>
              <li>
                <Link to="/contact" className="text-gray-400 hover:text-white transition-colors text-sm md:text-base">
                  문의하기
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h3 className="text-lg font-semibold mb-4">연락처</h3>
            <ul className="space-y-2 text-gray-400 text-sm md:text-base">
              <li>
                <a href="mailto:studio.realday@gmail.com" className="hover:text-white transition-colors">
                  studio.realday@gmail.com
                </a>
              </li>
              <li>서울, 대한민국</li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-gray-800 mt-8 md:mt-12 pt-8 flex flex-col md:flex-row justify-between items-center">
          <p className="text-gray-400 text-sm">
            © {currentYear} REAL DAY. All rights reserved.
          </p>
          <div className="flex space-x-6 mt-4 md:mt-0">
            <a href="#" className="text-gray-400 hover:text-white transition-colors text-sm">
              Privacy Policy
            </a>
            <a href="#" className="text-gray-400 hover:text-white transition-colors text-sm">
              Terms of Service
            </a>
          </div>
        </div>
      </div>
    </footer>
  )
}

export default Footer

