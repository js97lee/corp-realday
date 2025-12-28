/**
 * 공통 날짜 포맷팅 유틸리티
 */

/**
 * 날짜를 한국어 형식으로 포맷팅
 * @param {string|Date} dateString - 날짜 문자열 또는 Date 객체
 * @param {object} options - 포맷 옵션
 * @returns {string} 포맷된 날짜 문자열
 */
export const formatDate = (dateString, options = {}) => {
  if (!dateString) return '날짜 없음'

  try {
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

    const defaultOptions = {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
      ...options,
    }

    return date.toLocaleString('ko-KR', defaultOptions)
  } catch (error) {
    console.error('Date formatting error:', error, dateString)
    return '날짜 없음'
  }
}

/**
 * 날짜를 YYYY-MM-DD 형식으로 포맷팅
 * @param {string|Date} dateString - 날짜 문자열 또는 Date 객체
 * @returns {string} YYYY-MM-DD 형식의 날짜 문자열
 */
export const formatDateShort = (dateString) => {
  if (!dateString) return ''

  try {
    let date
    if (typeof dateString === 'string') {
      date = new Date(dateString.replace(' ', 'T'))
    } else {
      date = new Date(dateString)
    }

    if (isNaN(date.getTime())) {
      return ''
    }

    return date.toISOString().split('T')[0]
  } catch (error) {
    console.error('Date formatting error:', error, dateString)
    return ''
  }
}

/**
 * 날짜를 상대 시간으로 포맷팅 (예: 3일 전, 2시간 전)
 * @param {string|Date} dateString - 날짜 문자열 또는 Date 객체
 * @returns {string} 상대 시간 문자열
 */
export const formatRelativeTime = (dateString) => {
  if (!dateString) return '날짜 없음'

  try {
    let date
    if (typeof dateString === 'string') {
      date = new Date(dateString.replace(' ', 'T'))
    } else {
      date = new Date(dateString)
    }

    if (isNaN(date.getTime())) {
      return '날짜 없음'
    }

    const now = new Date()
    const diff = now - date
    const seconds = Math.floor(diff / 1000)
    const minutes = Math.floor(seconds / 60)
    const hours = Math.floor(minutes / 60)
    const days = Math.floor(hours / 24)

    if (days > 0) {
      return `${days}일 전`
    } else if (hours > 0) {
      return `${hours}시간 전`
    } else if (minutes > 0) {
      return `${minutes}분 전`
    } else {
      return '방금 전'
    }
  } catch (error) {
    console.error('Date formatting error:', error, dateString)
    return '날짜 없음'
  }
}

