function Footer() {
  const currentYear = new Date().getFullYear()

  return (
    <footer className="bg-black text-gray-300">
      <div className="max-w-7xl mx-auto px-6 md:px-12 py-12 md:py-16">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-8 md:gap-0">
          {/* Left Side - Logo, Contact Info & Copyright */}
          <div className="flex flex-col gap-6 md:gap-8">
            {/* Logo */}
            <div>
              <img 
                src="/logo-white.svg" 
                alt="REALDAY Logo" 
                className="h-6 md:h-8 w-auto"
              />
            </div>
            {/* Contact Information */}
            <div className="flex flex-col gap-2">
              <a 
                href="mailto:studio.realday@gmail.com" 
                className="text-gray-300 hover:text-white transition-colors text-sm md:text-base"
              >
                studio.realday@gmail.com
              </a>
              <a 
                href="tel:+821020215243" 
                className="text-gray-300 hover:text-white transition-colors text-sm md:text-base"
              >
                +82. 10. 2021.5243
              </a>
            </div>
            
            {/* Copyright */}
            <p className="text-gray-300 text-sm md:text-base">
              ©2025 REALDAY Inc.
            </p>
            
            {/* Privacy Policy Link */}
            <a 
              href="/privacy" 
              className="text-gray-400 hover:text-white transition-colors text-xs md:text-sm"
            >
              개인정보 처리 방침
            </a>
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
              href="#" 
              className="text-gray-300 hover:text-white transition-colors"
              aria-label="Behance"
            >
              <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                <path d="M22 7h-7v-2h7v2zm1.726 10c-.442 1.297-2.029 3-5.101 3-3.074 0-5.564-1.729-5.564-5.675 0-3.91 2.325-5.92 5.466-5.92 3.082 0 4.964 1.782 5.375 4.426.078.506.109 1.188.095 2.14h-8.027c.13 3.211 3.483 3.312 4.588 2.029h3.168zm-7.686-4h4.965c-.105-1.547-1.136-2.219-2.477-2.219-1.466 0-2.277.768-2.488 2.219zm-9.574 6.859h-6.465v-6.859h6.465c1.782 0 2.888 1.066 2.888 3.211.009 2.327-1.106 3.648-2.888 3.648zm-1.896-5.032h-1.688v3.549h1.749c1.325 0 1.712-.864 1.712-1.773 0-.939-.37-1.776-1.773-1.776zm7.65-7.827h-10.754v2.138h10.754v-2.138z"/>
              </svg>
            </a>
          </div>
        </div>
      </div>
    </footer>
  )
}

export default Footer

