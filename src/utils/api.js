// API 기본 URL (환경 변수로 관리 가능)
// 프로덕션에서는 Netlify Functions 사용 (/api)
// 로컬 개발 시에는 환경 변수로 백엔드 서버 URL 설정 가능
const API_BASE_URL = import.meta.env.VITE_API_URL || 
  (import.meta.env.PROD ? '/api' : 'http://localhost:3001/api')

// 캐싱 유틸리티 import
import { cachedFetch, clearCache } from './cache'

// Admin 로그인 API
export const adminLogin = async (email, password) => {
  try {
    const response = await fetch(`${API_BASE_URL}/admin-login`, {
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

// Contacts 목록 조회 API (캐싱 적용)
export const fetchContacts = async () => {
  return cachedFetch('contacts', async () => {
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
  })
}

// 멤버 목록 조회 API (캐싱 적용)
export const fetchMembers = async () => {
  return cachedFetch('members', async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/members`, {
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
      if (error.name === 'TypeError' && error.message.includes('fetch')) {
        throw new Error('서버에 연결할 수 없습니다. 네트워크 연결을 확인해주세요.')
      }
      throw error
    }
  })
}

// 멤버 추가 API (캐시 무효화)
export const addMember = async (memberData) => {
  try {
    const response = await fetch(`${API_BASE_URL}/members`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(memberData),
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      throw new Error(errorData.message || `서버 오류 (${response.status})`)
    }

    const data = await response.json()
    // 멤버 목록 캐시 무효화
    clearCache('members')
    return data
  } catch (error) {
    if (error.name === 'TypeError' && error.message.includes('fetch')) {
      throw new Error('서버에 연결할 수 없습니다. 네트워크 연결을 확인해주세요.')
    }
    throw error
  }
}

// 멤버 수정 API (캐시 무효화)
export const updateMember = async (id, memberData) => {
  try {
    const response = await fetch(`${API_BASE_URL}/members/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(memberData),
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      throw new Error(errorData.message || `서버 오류 (${response.status})`)
    }

    const data = await response.json()
    // 멤버 목록 캐시 무효화
    clearCache('members')
    return data
  } catch (error) {
    if (error.name === 'TypeError' && error.message.includes('fetch')) {
      throw new Error('서버에 연결할 수 없습니다. 네트워크 연결을 확인해주세요.')
    }
    throw error
  }
}

// 멤버 삭제 API
export const deleteMember = async (id) => {
  try {
    const response = await fetch(`${API_BASE_URL}/members/${id}`, {
      method: 'DELETE',
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
    if (error.name === 'TypeError' && error.message.includes('fetch')) {
      throw new Error('서버에 연결할 수 없습니다. 네트워크 연결을 확인해주세요.')
    }
    throw error
  }
}

// 프로젝트 목록 조회 API (캐싱 적용)
export const fetchProjects = async (visible = false, featured = false) => {
  const cacheKey = `projects_${visible}_${featured}`
  return cachedFetch(cacheKey, async () => {
    try {
      let url = `${API_BASE_URL}/projects`
      if (featured) {
        url += '?featured=true'
      } else if (visible) {
        url += '?visible=true'
      }
      
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      })

      if (!response.ok) {
        let errorData = {}
        try {
          errorData = await response.json()
        } catch (e) {
          errorData = { message: `서버 오류 (${response.status})` }
        }
        
        const errorMessage = errorData.message || errorData.error || `서버 오류 (${response.status})`
        const error = new Error(errorMessage)
        error.status = response.status
        error.details = errorData.details || errorData.error
        throw error
      }

      const data = await response.json()
      
      // 응답이 success: false인 경우도 에러로 처리
      if (data.success === false) {
        const error = new Error(data.message || '요청 처리에 실패했습니다.')
        error.details = data.error || data.details
        throw error
      }
      
      return data
    } catch (error) {
      if (error.name === 'TypeError' && error.message.includes('fetch')) {
        throw new Error('서버에 연결할 수 없습니다. 네트워크 연결을 확인해주세요.')
      }
      throw error
    }
  })
}

// 프로젝트 추가 API
export const addProject = async (projectData) => {
  try {
    const response = await fetch(`${API_BASE_URL}/projects`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(projectData),
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      throw new Error(errorData.message || `서버 오류 (${response.status})`)
    }

    const data = await response.json()
    return data
  } catch (error) {
    if (error.name === 'TypeError' && error.message.includes('fetch')) {
      throw new Error('서버에 연결할 수 없습니다. 네트워크 연결을 확인해주세요.')
    }
    throw error
  }
}

// 프로젝트 수정 API
export const updateProject = async (id, projectData) => {
  try {
    const response = await fetch(`${API_BASE_URL}/projects/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(projectData),
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      throw new Error(errorData.message || `서버 오류 (${response.status})`)
    }

    const data = await response.json()
    return data
  } catch (error) {
    if (error.name === 'TypeError' && error.message.includes('fetch')) {
      throw new Error('서버에 연결할 수 없습니다. 네트워크 연결을 확인해주세요.')
    }
    throw error
  }
}

// 프로젝트 삭제 API
export const deleteProject = async (id) => {
  try {
    const response = await fetch(`${API_BASE_URL}/projects/${id}`, {
      method: 'DELETE',
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
    if (error.name === 'TypeError' && error.message.includes('fetch')) {
      throw new Error('서버에 연결할 수 없습니다. 네트워크 연결을 확인해주세요.')
    }
    throw error
  }
}

// 업무 목록 조회 API
export const fetchTasks = async (includeDeleted = false) => {
  try {
    const url = includeDeleted 
      ? `${API_BASE_URL}/tasks?includeDeleted=true`
      : `${API_BASE_URL}/tasks`
    
    const response = await fetch(url, {
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
    if (error.name === 'TypeError' && error.message.includes('fetch')) {
      throw new Error('서버에 연결할 수 없습니다. 네트워크 연결을 확인해주세요.')
    }
    throw error
  }
}

// 업무 추가 API
export const addTask = async (taskData) => {
  try {
    const response = await fetch(`${API_BASE_URL}/tasks`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(taskData),
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      throw new Error(errorData.message || `서버 오류 (${response.status})`)
    }

    const data = await response.json()
    return data
  } catch (error) {
    if (error.name === 'TypeError' && error.message.includes('fetch')) {
      throw new Error('서버에 연결할 수 없습니다. 네트워크 연결을 확인해주세요.')
    }
    throw error
  }
}

// 업무 수정 API
export const updateTask = async (id, taskData) => {
  try {
    const response = await fetch(`${API_BASE_URL}/tasks/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(taskData),
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      throw new Error(errorData.message || `서버 오류 (${response.status})`)
    }

    const data = await response.json()
    return data
  } catch (error) {
    if (error.name === 'TypeError' && error.message.includes('fetch')) {
      throw new Error('서버에 연결할 수 없습니다. 네트워크 연결을 확인해주세요.')
    }
    throw error
  }
}

// 업무 삭제 API
export const deleteTask = async (id) => {
  try {
    const response = await fetch(`${API_BASE_URL}/tasks/${id}`, {
      method: 'DELETE',
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
    if (error.name === 'TypeError' && error.message.includes('fetch')) {
      throw new Error('서버에 연결할 수 없습니다. 네트워크 연결을 확인해주세요.')
    }
    throw error
  }
}

// 포트폴리오 항목 목록 조회 API
export const fetchPortfolioItems = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/portfolio-items`, {
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
    if (error.name === 'TypeError' && error.message.includes('fetch')) {
      throw new Error('서버에 연결할 수 없습니다. 네트워크 연결을 확인해주세요.')
    }
    throw error
  }
}

// 포트폴리오 항목 추가 API
export const addPortfolioItem = async (itemData) => {
  try {
    const response = await fetch(`${API_BASE_URL}/portfolio-items`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(itemData),
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      throw new Error(errorData.message || `서버 오류 (${response.status})`)
    }

    const data = await response.json()
    return data
  } catch (error) {
    if (error.name === 'TypeError' && error.message.includes('fetch')) {
      throw new Error('서버에 연결할 수 없습니다. 네트워크 연결을 확인해주세요.')
    }
    throw error
  }
}

// 포트폴리오 항목 수정 API
export const updatePortfolioItem = async (id, itemData) => {
  try {
    const response = await fetch(`${API_BASE_URL}/portfolio-items/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(itemData),
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      throw new Error(errorData.message || `서버 오류 (${response.status})`)
    }

    const data = await response.json()
    return data
  } catch (error) {
    if (error.name === 'TypeError' && error.message.includes('fetch')) {
      throw new Error('서버에 연결할 수 없습니다. 네트워크 연결을 확인해주세요.')
    }
    throw error
  }
}

// 포트폴리오 항목 삭제 API
export const deletePortfolioItem = async (id) => {
  try {
    const response = await fetch(`${API_BASE_URL}/portfolio-items/${id}`, {
      method: 'DELETE',
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
    if (error.name === 'TypeError' && error.message.includes('fetch')) {
      throw new Error('서버에 연결할 수 없습니다. 네트워크 연결을 확인해주세요.')
    }
    throw error
  }
}

// 재무 내역 목록 조회 API (캐싱 적용)
export const fetchFinances = async () => {
  return cachedFetch('finances', async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/finances`, {
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
      if (error.name === 'TypeError' && error.message.includes('fetch')) {
        throw new Error('서버에 연결할 수 없습니다. 네트워크 연결을 확인해주세요.')
      }
      throw error
    }
  })
}

// 재무 내역 추가 API
export const addFinance = async (financeData) => {
  try {
    const response = await fetch(`${API_BASE_URL}/finances`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(financeData),
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      throw new Error(errorData.message || `서버 오류 (${response.status})`)
    }

    const data = await response.json()
    return data
  } catch (error) {
    if (error.name === 'TypeError' && error.message.includes('fetch')) {
      throw new Error('서버에 연결할 수 없습니다. 네트워크 연결을 확인해주세요.')
    }
    throw error
  }
}

// 재무 내역 수정 API
export const updateFinance = async (id, financeData) => {
  try {
    const response = await fetch(`${API_BASE_URL}/finances/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(financeData),
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      throw new Error(errorData.message || `서버 오류 (${response.status})`)
    }

    const data = await response.json()
    return data
  } catch (error) {
    if (error.name === 'TypeError' && error.message.includes('fetch')) {
      throw new Error('서버에 연결할 수 없습니다. 네트워크 연결을 확인해주세요.')
    }
    throw error
  }
}

// 재무 내역 삭제 API
export const deleteFinance = async (id) => {
  try {
    const response = await fetch(`${API_BASE_URL}/finances/${id}`, {
      method: 'DELETE',
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
    if (error.name === 'TypeError' && error.message.includes('fetch')) {
      throw new Error('서버에 연결할 수 없습니다. 네트워크 연결을 확인해주세요.')
    }
    throw error
  }
}

// ========== 캘린더 일정 API ==========

// 일정 조회
export const fetchEvents = async () => {
  try {
    const token = localStorage.getItem('authToken')
    if (!token) {
      throw new Error('인증이 필요합니다.')
    }

    const response = await fetch(`${API_BASE_URL}/events`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      throw new Error(errorData.message || `서버 오류 (${response.status})`)
    }

    const data = await response.json()
    return Array.isArray(data) ? data : []
  } catch (error) {
    if (error.name === 'TypeError' && error.message.includes('fetch')) {
      throw new Error('서버에 연결할 수 없습니다. 네트워크 연결을 확인해주세요.')
    }
    throw error
  }
}

// 일정 추가
export const addEvent = async (eventData) => {
  try {
    const token = localStorage.getItem('authToken')
    if (!token) {
      throw new Error('인증이 필요합니다.')
    }

    const response = await fetch(`${API_BASE_URL}/events`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify(eventData),
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      throw new Error(errorData.message || `서버 오류 (${response.status})`)
    }

    const data = await response.json()
    return data.event || data
  } catch (error) {
    if (error.name === 'TypeError' && error.message.includes('fetch')) {
      throw new Error('서버에 연결할 수 없습니다. 네트워크 연결을 확인해주세요.')
    }
    throw error
  }
}

// 일정 수정
export const updateEvent = async (id, eventData) => {
  try {
    const token = localStorage.getItem('authToken')
    if (!token) {
      throw new Error('인증이 필요합니다.')
    }

    const response = await fetch(`${API_BASE_URL}/events/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify(eventData),
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      throw new Error(errorData.message || `서버 오류 (${response.status})`)
    }

    const data = await response.json()
    return data.event || data
  } catch (error) {
    if (error.name === 'TypeError' && error.message.includes('fetch')) {
      throw new Error('서버에 연결할 수 없습니다. 네트워크 연결을 확인해주세요.')
    }
    throw error
  }
}

// 일정 삭제
export const deleteEvent = async (id) => {
  try {
    const token = localStorage.getItem('authToken')
    if (!token) {
      throw new Error('인증이 필요합니다.')
    }

    const response = await fetch(`${API_BASE_URL}/events/${id}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      throw new Error(errorData.message || `서버 오류 (${response.status})`)
    }

    const data = await response.json()
    return data
  } catch (error) {
    if (error.name === 'TypeError' && error.message.includes('fetch')) {
      throw new Error('서버에 연결할 수 없습니다. 네트워크 연결을 확인해주세요.')
    }
    throw error
  }
}

// ========== 공지사항 API ==========

// 공지사항 조회
export const fetchAnnouncements = async () => {
  try {
    const token = localStorage.getItem('authToken')
    if (!token) {
      throw new Error('인증이 필요합니다.')
    }

    const response = await fetch(`${API_BASE_URL}/announcements`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      throw new Error(errorData.message || `서버 오류 (${response.status})`)
    }

    const data = await response.json()
    return Array.isArray(data) ? data : []
  } catch (error) {
    if (error.name === 'TypeError' && error.message.includes('fetch')) {
      throw new Error('서버에 연결할 수 없습니다. 네트워크 연결을 확인해주세요.')
    }
    throw error
  }
}

// 공지사항 추가 (슈퍼어드민만)
export const addAnnouncement = async (announcementData) => {
  try {
    const token = localStorage.getItem('authToken')
    if (!token) {
      throw new Error('인증이 필요합니다.')
    }

    const response = await fetch(`${API_BASE_URL}/announcements`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify(announcementData),
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      throw new Error(errorData.message || `서버 오류 (${response.status})`)
    }

    const data = await response.json()
    return data.announcement || data
  } catch (error) {
    if (error.name === 'TypeError' && error.message.includes('fetch')) {
      throw new Error('서버에 연결할 수 없습니다. 네트워크 연결을 확인해주세요.')
    }
    throw error
  }
}

// 공지사항 수정 (슈퍼어드민만)
export const updateAnnouncement = async (id, announcementData) => {
  try {
    const token = localStorage.getItem('authToken')
    if (!token) {
      throw new Error('인증이 필요합니다.')
    }

    const response = await fetch(`${API_BASE_URL}/announcements/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify(announcementData),
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      throw new Error(errorData.message || `서버 오류 (${response.status})`)
    }

    const data = await response.json()
    return data.announcement || data
  } catch (error) {
    if (error.name === 'TypeError' && error.message.includes('fetch')) {
      throw new Error('서버에 연결할 수 없습니다. 네트워크 연결을 확인해주세요.')
    }
    throw error
  }
}

// 공지사항 삭제 (슈퍼어드민만)
export const deleteAnnouncement = async (id) => {
  try {
    const token = localStorage.getItem('authToken')
    if (!token) {
      throw new Error('인증이 필요합니다.')
    }

    const response = await fetch(`${API_BASE_URL}/announcements/${id}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      throw new Error(errorData.message || `서버 오류 (${response.status})`)
    }

    const data = await response.json()
    return data
  } catch (error) {
    if (error.name === 'TypeError' && error.message.includes('fetch')) {
      throw new Error('서버에 연결할 수 없습니다. 네트워크 연결을 확인해주세요.')
    }
    throw error
  }
}

// ========== 일정 초대 API ==========

// 초대 수락/거절
export const respondToInvitation = async (eventId, action) => {
  try {
    const token = localStorage.getItem('authToken')
    if (!token) {
      throw new Error('인증이 필요합니다.')
    }

    const response = await fetch(`${API_BASE_URL}/events/${eventId}/invitations/${action}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      throw new Error(errorData.message || `서버 오류 (${response.status})`)
    }

    const data = await response.json()
    return data
  } catch (error) {
    if (error.name === 'TypeError' && error.message.includes('fetch')) {
      throw new Error('서버에 연결할 수 없습니다. 네트워크 연결을 확인해주세요.')
    }
    throw error
  }
}

// 이메일 전송 API (최고관리자 전용)
export const sendEmail = async (emailData) => {
  try {
    const token = localStorage.getItem('authToken')
    if (!token) {
      throw new Error('인증이 필요합니다.')
    }

    const response = await fetch(`${API_BASE_URL}/send-email`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify(emailData),
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      throw new Error(errorData.message || `서버 오류 (${response.status})`)
    }

    const data = await response.json()
    return data
  } catch (error) {
    if (error.name === 'TypeError' && error.message.includes('fetch')) {
      throw new Error('서버에 연결할 수 없습니다. 네트워크 연결을 확인해주세요.')
    }
    throw error
  }
}

