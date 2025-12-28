/**
 * 간단한 인메모리 캐시 유틸리티
 * API 응답을 캐싱하여 불필요한 호출 방지
 */

const cache = new Map()
const CACHE_DURATION = 5 * 60 * 1000 // 5분

/**
 * 캐시에서 데이터 가져오기
 * @param {string} key - 캐시 키
 * @returns {any|null} 캐시된 데이터 또는 null
 */
export function getCached(key) {
  const item = cache.get(key)
  if (!item) return null
  
  // 캐시 만료 확인
  if (Date.now() - item.timestamp > CACHE_DURATION) {
    cache.delete(key)
    return null
  }
  
  return item.data
}

/**
 * 캐시에 데이터 저장
 * @param {string} key - 캐시 키
 * @param {any} data - 저장할 데이터
 */
export function setCached(key, data) {
  cache.set(key, {
    data,
    timestamp: Date.now()
  })
}

/**
 * 특정 키의 캐시 삭제
 * @param {string} key - 캐시 키
 */
export function clearCache(key) {
  cache.delete(key)
}

/**
 * 모든 캐시 삭제
 */
export function clearAllCache() {
  cache.clear()
}

/**
 * 캐시된 API 호출 래퍼
 * @param {string} key - 캐시 키
 * @param {Function} fetchFn - API 호출 함수
 * @returns {Promise<any>} API 응답 데이터
 */
export async function cachedFetch(key, fetchFn) {
  // 캐시 확인
  const cached = getCached(key)
  if (cached) {
    // 캐시된 데이터가 있으면 즉시 반환 (동기적으로)
    return Promise.resolve(cached)
  }
  
  // API 호출
  const data = await fetchFn()
  
  // 캐시 저장
  setCached(key, data)
  
  return data
}

