// 공통 API 클라이언트 유틸리티
const API_BASE_URL = import.meta.env.VITE_API_URL || 
  (import.meta.env.PROD ? '/api' : 'http://localhost:3001/api')

/**
 * 공통 fetch 래퍼 (에러 처리, 타임아웃 포함)
 */
export async function apiRequest(endpoint, options = {}) {
  const {
    method = 'GET',
    body,
    timeout = 15000,
    signal: externalSignal,
    ...fetchOptions
  } = options

  const controller = new AbortController()
  const timeoutId = setTimeout(() => controller.abort(), timeout)
  
  // 외부 signal이 있으면 병합
  if (externalSignal) {
    externalSignal.addEventListener('abort', () => controller.abort())
  }

  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      method,
      headers: {
        'Content-Type': 'application/json',
        ...fetchOptions.headers,
      },
      body: body ? JSON.stringify(body) : undefined,
      signal: controller.signal,
      ...fetchOptions,
    })

    clearTimeout(timeoutId)

    if (!response.ok) {
      let errorData = {}
      try {
        errorData = await response.json()
      } catch (e) {
        errorData = { message: `서버 오류 (${response.status})` }
      }
      
      const error = new Error(errorData.message || errorData.error || `서버 오류 (${response.status})`)
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
    clearTimeout(timeoutId)
    
    // 타임아웃 에러
    if (error.name === 'AbortError') {
      throw new Error('요청 시간이 초과되었습니다. 잠시 후 다시 시도해주세요.')
    }
    
    // 네트워크 에러
    if (error.name === 'TypeError' && error.message.includes('fetch')) {
      throw new Error('서버에 연결할 수 없습니다. 네트워크 연결을 확인해주세요.')
    }
    
    throw error
  }
}

/**
 * GET 요청
 */
export function apiGet(endpoint, options = {}) {
  return apiRequest(endpoint, { ...options, method: 'GET' })
}

/**
 * POST 요청
 */
export function apiPost(endpoint, body, options = {}) {
  return apiRequest(endpoint, { ...options, method: 'POST', body })
}

/**
 * PUT 요청
 */
export function apiPut(endpoint, body, options = {}) {
  return apiRequest(endpoint, { ...options, method: 'PUT', body })
}

/**
 * DELETE 요청
 */
export function apiDelete(endpoint, options = {}) {
  return apiRequest(endpoint, { ...options, method: 'DELETE' })
}

