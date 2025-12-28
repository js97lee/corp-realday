import { useState, useEffect, useCallback } from 'react'
import { USER_ROLES } from '../utils/auth'
import { fetchContacts } from '../utils/api'
import AdminEmailComposer from '../components/AdminEmailComposer'
import { useAuth } from '../hooks/useAuth'
import { formatDate } from '../utils/date'
import { ErrorMessage, LoadingSpinner, PageHeader, Button } from '../components/common'

function AdminContacts() {
  const [contacts, setContacts] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [isEmailComposerOpen, setIsEmailComposerOpen] = useState(false)
  const [selectedContactEmail, setSelectedContactEmail] = useState('')
  
  // 인증 체크
  useAuth(USER_ROLES.CEO)

  const loadContacts = useCallback(async () => {
    try {
      setLoading(true)
      setError('')
      const response = await fetchContacts()
      setContacts(response.contacts || [])
    } catch (err) {
      console.error('문의 목록 가져오기 실패:', err)
      setError(err.message || '문의 목록을 불러오는데 실패했습니다.')
      setContacts([])
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    loadContacts()
  }, [loadContacts])

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
      <PageHeader
        title="문의하기 관리"
        action={
          <div className="flex items-center gap-4">
            <div className="text-sm text-gray-600">총 {contacts.length}건</div>
            <Button
              onClick={() => handleEmailReply('')}
              className="flex items-center gap-2"
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
            </Button>
          </div>
        }
      />

      <ErrorMessage message={error} />

      <div className="bg-white rounded-lg shadow">
        <div className="px-4 py-3 border-b border-gray-200 flex justify-between items-center">
          <h3 className="text-lg font-semibold">문의 목록</h3>
        </div>
        <div className="p-4">
          {loading ? (
            <LoadingSpinner />
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
                    <Button
                      onClick={() => handleEmailReply(contact.email)}
                      size="sm"
                    >
                      이메일 답장
                    </Button>
                    <Button
                      variant="secondary"
                      size="sm"
                    >
                      삭제
                    </Button>
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

