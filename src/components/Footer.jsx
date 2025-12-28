function Footer() {
  const currentYear = new Date().getFullYear()

  return (
    <footer className="bg-black text-gray-300 border-t-2 border-gray-600">
      <div className="max-w-7xl mx-auto px-6 md:px-12 py-12 md:py-16">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-8 md:gap-0">
          {/* Left Side - Logo */}
          <div className="flex flex-col gap-6 md:gap-8">
            {/* Logo - 200% 크기 */}
            <div>
              <img 
                src="/logo-white.svg" 
                alt="REALDAY Logo" 
                className="h-12 md:h-16 w-auto scale-[2]"
              />
            </div>
            
            {/* Privacy Policy Link */}
            <a 
              href="/privacy" 
              className="text-gray-400 hover:text-white transition-colors text-xs md:text-sm"
            >
              개인정보 처리 방침
            </a>
          </div>
          
          {/* Right Side - Contact Info & Copyright */}
          <div className="flex flex-col gap-6 md:gap-8 items-start md:items-end">
            {/* Contact Information */}
            <div className="flex flex-col gap-2 items-start md:items-end">
              <a 
                href="mailto:studio.realday@gmail.com" 
                className="text-gray-300 hover:text-white transition-colors text-sm md:text-base flex items-center gap-2"
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path d="M20 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z"/>
                </svg>
                studio.realday@gmail.com
              </a>
              <a 
                href="tel:+821020215243" 
                className="text-gray-300 hover:text-white transition-colors text-sm md:text-base flex items-center gap-2"
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path d="M6.62 10.79c1.44 2.83 3.76 5.14 6.59 6.59l2.2-2.2c.27-.27.67-.36 1.02-.24 1.12.37 2.33.57 3.57.57.55 0 1 .45 1 1V20c0 .55-.45 1-1 1-9.39 0-17-7.61-17-17 0-.55.45-1 1-1h3.5c.55 0 1 .45 1 1 0 1.25.2 2.45.57 3.57.11.35.03.74-.25 1.02l-2.2 2.2z"/>
                </svg>
                +82. 10. 2021.5243
              </a>
            </div>
            
            {/* Copyright */}
            <p className="text-gray-300 text-sm md:text-base">
              ©2025 REALDAY Inc.
            </p>
          </div>

          {/* Right Side - Social Media Links */}
          <div className="flex gap-6 md:gap-8 items-center">
            <a 
              href="https://www.instagram.com/realday.d" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-gray-300 hover:text-white transition-colors"
              aria-label="Instagram"
            >
              <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
              </svg>
            </a>
            <a 
              href="https://www.behance.net" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-gray-300 hover:text-white transition-colors"
              aria-label="Behance"
            >
              <svg className="w-14 h-6" fill="currentColor" viewBox="0 0 70 24" xmlns="http://www.w3.org/2000/svg">
                {/* Behance "Bē" 텍스트 로고 - 벡터 경로 */}
                {/* B */}
                <path d="M2 2h8c2.2 0 4 1.8 4 4 0 1.5-.8 2.6-2 3v.1c1.2.4 2 1.4 2 2.9 0 2.2-1.8 4-4 4H2V2zm3 6.5h4.5c.7 0 1.2-.5 1.2-1.2 0-.7-.5-1.2-1.2-1.2H5v2.4zm0 5.5h5c.8 0 1.3-.6 1.3-1.3 0-.7-.5-1.3-1.3-1.3H5v2.6z"/>
                {/* ē (e with macron) */}
                <path d="M18 2h8v2.5h-5.5v2h5v2.5h-5v2h5.5V14h-8V2z"/>
                {/* Macron (위의 선) */}
                <line x1="20" y1="4" x2="24" y2="4" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"/>
              </svg>
            </a>
          </div>
        </div>
      </div>
    </footer>
  )
}

export default Footer

