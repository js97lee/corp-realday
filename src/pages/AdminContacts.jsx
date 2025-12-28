import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { isSuperAdmin, USER_ROLES } from '../utils/auth'
import { fetchContacts } from '../utils/api'
import AdminEmailComposer from '../components/AdminEmailComposer'

function AdminContacts() {
  const [contacts, setContacts] = useState([])
  const [loading, setLoading] = useState(false)
  const [isEmailComposerOpen, setIsEmailComposerOpen] = useState(false)
  const [selectedContactEmail, setSelectedContactEmail] = useState('')
  const navigate = useNavigate()

  useEffect(() => {
    // 로그인 상태 확인
    const token = localStorage.getItem('authToken')
    if (!token) {
      navigate('/admin')
      return
    }

    // 권한 확인 (최고관리자만 접근 가능)
    const userRole = localStorage.getItem('user') ? JSON.parse(localStorage.getItem('user')).role : null
    if (userRole !== USER_ROLES.SUPER_ADMIN) {
      navigate('/admin/dashboard')
      return
    }

    // 문의 목록 가져오기
    loadContacts()
  }, [navigate])

  const loadContacts = async () => {
    try {
      setLoading(true)
      const response = await fetchContacts()
      setContacts(response.contacts || [])
    } catch (error) {
      console.error('문의 목록 가져오기 실패:', error)
      // 에러 발생 시 빈 배열로 설정 (에러 메시지는 콘솔에만 표시)
      setContacts([])
    } finally {
      setLoading(false)
    }
  }

  const formatDate = (dateString) => {
    if (!dateString) return '날짜 없음'
    try {
      // ISO 문자열 또는 타임스탬프 형식 처리
      let date
      if (typeof dateString === 'string') {
        // PostgreSQL 타임스탬프 형식 처리
        date = new Date(dateString.replace(' ', 'T'))
      } else {
        date = new Date(dateString)
      }
      
      if (isNaN(date.getTime())) {
        console.warn('Invalid date:', dateString)
        return '날짜 없음'
      }
      
      return date.toLocaleString('ko-KR', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        hour12: false,
      })
    } catch (error) {
      console.error('Date formatting error:', error, dateString)
      return '날짜 없음'
    }
  }

  const handleEmailReply = (email) => {
    setSelectedContactEmail(email)
    setIsEmailComposerOpen(true)
  }

  const handleEmailComposerClose = () => {
    setIsEmailComposerOpen(false)
    setSelectedContactEmail('')
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">문의하기 관리</h2>
        <div className="text-sm text-gray-600">
          총 {contacts.length}건
        </div>
      </div>

      <div className="bg-white rounded-lg shadow">
        <div className="px-4 py-3 border-b border-gray-200 flex justify-between items-center">
          <h3 className="text-lg font-semibold">문의 목록</h3>
          <button
            onClick={() => handleEmailReply('')}
            className="flex items-center gap-2 px-4 py-2 bg-black text-white font-medium hover:bg-gray-800 transition-colors rounded-lg"
          >
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
              />
            </svg>
            <span>메일 쓰기</span>
          </button>
        </div>
        <div className="p-4">
          {loading ? (
            <p className="text-gray-500 text-center py-8">로딩 중...</p>
          ) : contacts.length === 0 ? (
            <p className="text-gray-500 text-center py-8">문의가 없습니다.</p>
          ) : (
            <div className="space-y-4">
              {contacts.map((contact) => (
                <div
                  key={contact.id}
                  className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h4 className="text-lg font-semibold">{contact.name}</h4>
                        <span className="text-xs text-gray-400 bg-gray-100 px-2 py-1 rounded">
                          {formatDate(contact.created_at || contact.createdAt)}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600">{contact.email}</p>
                    </div>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-4">
                    <p className="text-gray-700 whitespace-pre-wrap">{contact.message}</p>
                  </div>
                  <div className="mt-4 flex gap-2">
                    <button
                      onClick={() => handleEmailReply(contact.email)}
                      className="px-4 py-2 bg-black text-white text-sm font-medium hover:bg-gray-800 transition-colors rounded-lg"
                    >
                      이메일 답장
                    </button>
                    <button
                      className="px-4 py-2 bg-gray-200 text-gray-700 text-sm font-medium hover:bg-gray-300 transition-colors rounded-lg"
                    >
                      삭제
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Email Composer Modal */}
      <AdminEmailComposer
        isOpen={isEmailComposerOpen}
        onClose={handleEmailComposerClose}
        initialTo={selectedContactEmail}
      />
    </div>
  )
}

export default AdminContacts

