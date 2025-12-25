// API 기본 URL (환경 변수로 관리 가능)
// 프로덕션에서는 Netlify Functions 사용 (/api)
// 로컬 개발 시에는 환경 변수로 백엔드 서버 URL 설정 가능
const API_BASE_URL = import.meta.env.VITE_API_URL || 
  (import.meta.env.PROD ? '/api' : 'http://localhost:5001/api')

// Admin 로그인 API
export const adminLogin = async (email, password) => {
  try {
    const response = await fetch(`${API_BASE_URL}/admin/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, password }),
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      throw new Error(errorData.message || `서버 오류 (${response.status})`)
    }

    const data = await response.json()
    return data
  } catch (error) {
    // 네트워크 에러 처리
    if (error.name === 'TypeError' && error.message.includes('fetch')) {
      throw new Error('서버에 연결할 수 없습니다. 네트워크 연결을 확인해주세요.')
    }
    throw error
  }
}

// Contact 폼 제출 API
export const submitContact = async (formData) => {
  try {
    const response = await fetch(`${API_BASE_URL}/contact`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(formData),
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      throw new Error(errorData.message || `서버 오류 (${response.status})`)
    }

    const data = await response.json()
    return data
  } catch (error) {
    // 네트워크 에러 처리
    if (error.name === 'TypeError' && error.message.includes('fetch')) {
      throw new Error('서버에 연결할 수 없습니다. 네트워크 연결을 확인해주세요.')
    }
    throw error
  }
}

// Contacts 목록 조회 API
export const fetchContacts = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/contacts`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      throw new Error(errorData.message || `서버 오류 (${response.status})`)
    }

    const data = await response.json()
    return data
  } catch (error) {
    // 네트워크 에러 처리
    if (error.name === 'TypeError' && error.message.includes('fetch')) {
      throw new Error('서버에 연결할 수 없습니다. 네트워크 연결을 확인해주세요.')
    }
    throw error
  }
}

