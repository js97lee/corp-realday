import { useState, useEffect } from 'react'
import { sendEmail } from '../utils/api'

function AdminEmailComposer({ isOpen, onClose, initialTo = '' }) {
  const [formData, setFormData] = useState({
    to: initialTo || 'studio.realday@gmail.com',
    subject: '',
    body: '',
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)

  // initialTo가 변경되면 formData 업데이트
  useEffect(() => {
    if (isOpen && initialTo) {
      setFormData(prev => ({
        ...prev,
        to: initialTo
      }))
    } else if (isOpen && !initialTo) {
      setFormData(prev => ({
        ...prev,
        to: 'studio.realday@gmail.com'
      }))
    }
  }, [isOpen, initialTo])

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
    setError('')
    setSuccess(false)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setSuccess(false)
    setLoading(true)

    try {
      // 현재 로그인한 사용자 정보 가져오기
      const userData = localStorage.getItem('user')
      let userEmail = null
      if (userData) {
        try {
          const user = JSON.parse(userData)
          userEmail = user.email
        } catch (err) {
          console.error('User data parse error:', err)
        }
      }

      // 사용자 이메일을 포함하여 전송
      const result = await sendEmail({
        ...formData,
        userEmail: userEmail
      })
      
      if (result.success) {
        setSuccess(true)
        setFormData({
          to: 'studio.realday@gmail.com',
          subject: '',
          body: '',
        })
        setTimeout(() => {
          onClose()
          setSuccess(false)
        }, 2000)
      }
    } catch (err) {
      setError(err.message || '메일 전송에 실패했습니다.')
    } finally {
      setLoading(false)
    }
  }

  const handleClose = () => {
    setFormData({
      to: 'studio.realday@gmail.com',
      subject: '',
      body: '',
    })
    setError('')
    setSuccess(false)
    onClose()
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-gray-200">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-bold text-black">메일 쓰기</h2>
            <button
              onClick={handleClose}
              className="text-gray-500 hover:text-black transition-colors"
              aria-label="닫기"
            >
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label htmlFor="to" className="block text-sm font-medium text-gray-700 mb-2">
              받는 사람
            </label>
            <input
              type="email"
              id="to"
              name="to"
              value={formData.to}
              onChange={handleChange}
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent outline-none"
              placeholder="받는 사람 이메일"
            />
          </div>

          <div>
            <label htmlFor="subject" className="block text-sm font-medium text-gray-700 mb-2">
              제목
            </label>
            <input
              type="text"
              id="subject"
              name="subject"
              value={formData.subject}
              onChange={handleChange}
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent outline-none"
              placeholder="메일 제목을 입력하세요"
            />
          </div>

          <div>
            <label htmlFor="body" className="block text-sm font-medium text-gray-700 mb-2">
              내용
            </label>
            <textarea
              id="body"
              name="body"
              value={formData.body}
              onChange={handleChange}
              required
              rows={10}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent outline-none resize-none"
              placeholder="메일 내용을 입력하세요"
            />
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
              {error}
            </div>
          )}

          {success && (
            <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg text-sm">
              메일이 성공적으로 전송되었습니다!
            </div>
          )}

          <div className="flex justify-end gap-3 pt-4">
            <button
              type="button"
              onClick={handleClose}
              className="px-6 py-2 border border-gray-300 text-gray-700 font-medium hover:bg-gray-50 transition-colors rounded-lg"
            >
              취소
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2 bg-black text-white font-medium hover:bg-gray-800 transition-colors rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? '전송 중...' : '전송'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default AdminEmailComposer

