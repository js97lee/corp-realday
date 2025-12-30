import { useState } from 'react'
import { submitContact } from '../utils/api'

function Contact() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
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
        setFormData({ name: '', email: '', message: '' })
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
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-black">
                Contact
              </h1>
            </div>
          </div>

          {/* Description */}
          <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-6 md:gap-8">
            <p className="text-sm md:text-base text-gray-500 max-w-2xl leading-relaxed">
              궁금한 점이 있으시거나 프로젝트를 논의하고 싶으시다면 언제든지 연락주세요.
            </p>
          </div>
        </div>

        {/* Contact Form Section */}
        <div className="pt-8 md:pt-12">
          <div className="max-w-2xl">
          <form onSubmit={handleSubmit} className="space-y-6 md:space-y-8">
            <div>
              <label htmlFor="name" className="block text-sm md:text-base font-medium text-gray-700 mb-2">
                이름
              </label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent outline-none transition-all"
                placeholder="이름을 입력하세요"
              />
            </div>

            <div>
              <label htmlFor="email" className="block text-sm md:text-base font-medium text-gray-700 mb-2">
                이메일
              </label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent outline-none transition-all"
                placeholder="이메일을 입력하세요"
              />
            </div>

            <div>
              <label htmlFor="message" className="block text-sm md:text-base font-medium text-gray-700 mb-2">
                메시지
              </label>
              <textarea
                id="message"
                name="message"
                value={formData.message}
                onChange={handleChange}
                required
                rows="6"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent outline-none transition-all resize-none"
                placeholder="메시지를 입력하세요"
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
              className="w-full md:w-auto px-8 py-3 bg-black text-white font-medium hover:bg-gray-800 transition-colors rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? '전송 중...' : '전송하기'}
            </button>
          </form>
          </div>
        </div>
      </section>
    </div>
  )
}

export default Contact

