import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { isManagerOrAbove } from '../utils/auth'

function AdminContacts() {
  const [contacts, setContacts] = useState([])
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  useEffect(() => {
    // 로그인 상태 확인
    const token = localStorage.getItem('authToken')
    if (!token) {
      navigate('/admin')
      return
    }

    // 권한 확인 (중간관리자 이상만 접근 가능)
    if (!isManagerOrAbove()) {
      navigate('/admin/dashboard')
      return
    }

    // 문의 목록 가져오기 (실제로는 API 호출)
    fetchContacts()
  }, [navigate])

  const fetchContacts = async () => {
    try {
      setLoading(true)
      // 실제로는 API 호출
      // const response = await fetch('http://localhost:5001/api/contacts')
      // const data = await response.json()
      // setContacts(data.contacts || [])
      
      // 임시 데이터
      setContacts([
        {
          id: 1,
          name: '홍길동',
          email: 'hong@example.com',
          message: '프로젝트 문의드립니다.',
          createdAt: new Date().toISOString(),
        },
      ])
    } catch (error) {
      console.error('문의 목록 가져오기 실패:', error)
    } finally {
      setLoading(false)
    }
  }

  const formatDate = (dateString) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('ko-KR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
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
        <div className="px-4 py-3 border-b border-gray-200">
          <h3 className="text-lg font-semibold">문의 목록</h3>
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
                    <div>
                      <h4 className="text-lg font-semibold mb-1">{contact.name}</h4>
                      <p className="text-sm text-gray-600">{contact.email}</p>
                    </div>
                    <span className="text-xs text-gray-500">
                      {formatDate(contact.createdAt)}
                    </span>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-4">
                    <p className="text-gray-700 whitespace-pre-wrap">{contact.message}</p>
                  </div>
                  <div className="mt-4 flex gap-2">
                    <a
                      href={`mailto:${contact.email}`}
                      className="px-4 py-2 bg-black text-white text-sm font-medium hover:bg-gray-800 transition-colors rounded-lg"
                    >
                      이메일 답장
                    </a>
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
    </div>
  )
}

export default AdminContacts

