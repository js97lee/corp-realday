// API 기본 URL (환경 변수로 관리 가능)
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001/api'

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

    const data = await response.json()
    
    if (!response.ok) {
      throw new Error(data.message || '로그인에 실패했습니다.')
    }

    return data
  } catch (error) {
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

    const data = await response.json()
    
    if (!response.ok) {
      throw new Error(data.message || '메시지 전송에 실패했습니다.')
    }

    return data
  } catch (error) {
    throw error
  }
}

