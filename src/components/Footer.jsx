function Footer() {
  const currentYear = new Date().getFullYear()

  return (
    <footer className="bg-black text-gray-300">
      <div className="max-w-7xl mx-auto px-6 md:px-12 py-12 md:py-16">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-8 md:gap-0">
          {/* Left Side - Contact Info & Copyright */}
          <div className="flex flex-col gap-6 md:gap-8">
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
          </div>

          {/* Right Side - Social Media Links */}
          <div className="flex gap-8 md:gap-12">
            <a 
              href="https://www.instagram.com/realday.d" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-gray-300 hover:text-white transition-colors text-sm md:text-base"
            >
              Instagram
            </a>
            <a 
              href="#" 
              className="text-gray-300 hover:text-white transition-colors text-sm md:text-base"
            >
              Behance
            </a>
          </div>
        </div>
      </div>
    </footer>
  )
}

export default Footer

