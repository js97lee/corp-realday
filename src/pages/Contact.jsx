import { useState } from 'react'
import { submitContact } from '../utils/api'

function Contact() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    interestedIn: '',
    message: '',
  })
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState('')

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    })
    // 에러 메시지 초기화
    if (error) setError('')
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setSuccess(false)
    setLoading(true)

    try {
      // 서버와 통신하여 폼 제출
      const response = await submitContact(formData)
      
      if (response.success) {
        setSuccess(true)
        setFormData({ name: '', email: '', phone: '', interestedIn: '', message: '' })
        // 3초 후 성공 메시지 숨기기
        setTimeout(() => setSuccess(false), 3000)
      }
    } catch (err) {
      setError(err.message || '메시지 전송에 실패했습니다.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-white pt-10 md:pt-12">
      <section className="max-w-7xl mx-auto px-6 md:px-12 py-8 md:py-12">
        {/* Header Section */}
        <div className="mb-6 md:mb-8">
          {/* Title */}
          <div className="mb-4 md:mb-6">
            <div className="flex items-baseline gap-2 mb-2">
              <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold text-black">
                Contact
              </h2>
            </div>
          </div>

          {/* Description */}
          <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-6 md:gap-8">
            <div className="max-w-2xl">
              <p className="text-sm md:text-base text-gray-500 leading-relaxed mb-2">
                궁금한 점이 있으시거나 프로젝트를 논의하고 싶으시다면 언제든지 연락주세요.
              </p>
              <p className="text-sm md:text-base text-gray-500 leading-relaxed">
                If you have any questions or would like to discuss a project, please feel free to contact us anytime.
              </p>
            </div>
          </div>
        </div>

        {/* Contact Form Section */}
        <div className="pt-8 md:pt-12">
          <div className="max-w-4xl">
            {/* Get In Touch Section */}
            <div className="mb-8 md:mb-12">
              <h3 className="text-2xl md:text-3xl font-bold text-gray-800 mb-3">
                Get In Touch
              </h3>
              <div className="text-sm md:text-base text-gray-500 leading-relaxed max-w-2xl">
                <p>문의해 주시면 최대한 빠르게 답변 드리겠습니다.</p>
                <p className="text-gray-400">We will respond to your inquiry as quickly as possible.</p>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6 md:space-y-8">
              {/* First Row: Name and Email */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
                <div>
                  <label htmlFor="name" className="block text-sm md:text-base font-medium text-gray-700 mb-2">
                    <span className="font-bold">Name</span> <span className="text-gray-500 font-normal">이름</span>
                  </label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    required
                    className="w-full px-0 py-2 border-0 border-b-2 border-gray-300 focus:border-black outline-none transition-all bg-transparent"
                    placeholder=""
                  />
                </div>

                <div>
                  <label htmlFor="email" className="block text-sm md:text-base font-medium text-gray-700 mb-2">
                    <span className="font-bold">Email Address</span> <span className="text-gray-500 font-normal">이메일 주소</span>
                  </label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                    className="w-full px-0 py-2 border-0 border-b-2 border-gray-300 focus:border-black outline-none transition-all bg-transparent"
                    placeholder=""
                  />
                </div>
              </div>

              {/* Second Row: Interested In and Phone */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
                <div className="relative">
                  <label htmlFor="interestedIn" className="block text-sm md:text-base font-medium text-gray-700 mb-2">
                    <span className="font-bold">Interested In</span> <span className="text-gray-500 font-normal">관심 분야</span>
                  </label>
                  <select
                    id="interestedIn"
                    name="interestedIn"
                    value={formData.interestedIn}
                    onChange={handleChange}
                    className="w-full px-0 py-2 pr-6 border-0 border-b-2 border-gray-300 focus:border-black outline-none transition-all bg-transparent appearance-none cursor-pointer"
                  >
                    <option value="">Select an option</option>
                    <option value="branding">Branding</option>
                    <option value="web-design">Web Design</option>
                    <option value="mobile-design">Mobile Design</option>
                    <option value="consulting">Consulting</option>
                    <option value="other">Other</option>
                  </select>
                  <div className="absolute right-0 bottom-2 pointer-events-none">
                    <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </div>
                </div>

                <div>
                  <label htmlFor="phone" className="block text-sm md:text-base font-medium text-gray-700 mb-2">
                    <span className="font-bold">Phone Number</span> <span className="text-gray-500 font-normal">전화번호</span>
                  </label>
                  <input
                    type="tel"
                    id="phone"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    className="w-full px-0 py-2 border-0 border-b-2 border-gray-300 focus:border-black outline-none transition-all bg-transparent"
                    placeholder=""
                  />
                </div>
              </div>

              {/* Third Row: Message */}
              <div>
                <label htmlFor="message" className="block text-sm md:text-base font-medium text-gray-700 mb-2">
                  <span className="font-bold">Message</span> <span className="text-gray-500 font-normal">메시지</span>
                </label>
                <textarea
                  id="message"
                  name="message"
                  value={formData.message}
                  onChange={handleChange}
                  required
                  rows="6"
                  className="w-full px-0 py-2 border-0 border-b-2 border-gray-300 focus:border-black outline-none transition-all resize-none bg-transparent"
                  placeholder=""
                />
              </div>

              {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
                  {error}
                </div>
              )}

              {success && (
                <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg text-sm">
                  메시지가 성공적으로 전송되었습니다!
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="flex items-center gap-2 px-8 py-3 bg-black text-white font-medium hover:bg-gray-800 transition-colors rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <span>{loading ? '전송 중...' : 'Submit'}</span>
                {!loading && (
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                )}
              </button>
            </form>
          </div>
        </div>
      </section>
    </div>
  )
}

export default Contact

