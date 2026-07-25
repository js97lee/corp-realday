import { getSql, initDatabase } from './db.js'
import { getSessionUser } from './auth.js'

// 데이터베이스 초기화 플래그 (모듈 레벨)
let dbInitialized = false

/**
 * 공통 CORS 헤더 생성
 */
export function getCorsHeaders() {
  return {
    'Access-Control-Allow-Origin': '*',
    'Content-Type': 'application/json',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  }
}

/**
 * OPTIONS 요청 처리 (CORS preflight)
 */
export function handleOptionsRequest() {
  return {
    statusCode: 200,
    headers: getCorsHeaders(),
    body: '',
  }
}

/**
 * 남은 실행 시간 확인 (Netlify Functions 제한 고려)
 */
export function getRemainingTime(context) {
  if (context && context.getRemainingTimeInMillis) {
    return context.getRemainingTimeInMillis()
  }
  return 10000 // 기본값 10초
}

/**
 * 타임아웃 계산
 */
export function calculateTimeouts(context) {
  const remainingTime = getRemainingTime(context)
  return {
    queryTimeout: Math.min(5000, remainingTime - 2000), // 쿼리 타임아웃: 최대 5초
    initTimeout: Math.min(8000, remainingTime - 1000), // 초기화 타임아웃: 최대 8초
  }
}

/**
 * 데이터베이스 초기화 (한 번만 실행)
 */
export async function ensureDatabaseInitialized(context) {
  if (dbInitialized) {
    return getSql()
  }

  const { initTimeout } = calculateTimeouts(context)
  
  try {
    await Promise.race([
      initDatabase(),
      new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Database initialization timeout')), initTimeout)
      )
    ])
    dbInitialized = true
    return getSql()
  } catch (initError) {
    console.error('Database initialization error:', initError)
    throw {
      statusCode: 503,
      message: '데이터베이스 초기화에 실패했습니다.',
      error: initError.message
    }
  }
}

/**
 * 쿼리 실행 (타임아웃 포함)
 */
export async function executeQuery(queryPromise, context) {
  const { queryTimeout } = calculateTimeouts(context)
  
  return Promise.race([
    queryPromise,
    new Promise((_, reject) => 
      setTimeout(() => reject(new Error('Query timeout')), queryTimeout)
    )
  ])
}

/**
 * 에러 응답 생성
 */
export function createErrorResponse(error, context, defaultMessage = '서버 오류가 발생했습니다.') {
  const headers = getCorsHeaders()
  
  // 타임아웃 에러
  if (error.message && (error.message.includes('timeout') || error.message.includes('Timeout'))) {
    return {
      statusCode: 504,
      headers,
      body: JSON.stringify({
        success: false,
        message: '요청 시간이 초과되었습니다. 잠시 후 다시 시도해주세요.',
        error: 'Timeout'
      }),
    }
  }
  
  // 데이터베이스 연결 에러
  if (error.message && (error.message.includes('connection') || error.message.includes('database') || error.message.includes('DATABASE_URL'))) {
    return {
      statusCode: 503,
      headers,
      body: JSON.stringify({
        success: false,
        message: '데이터베이스 연결에 실패했습니다. 잠시 후 다시 시도해주세요.',
        error: 'Database connection failed'
      }),
    }
  }
  
  // 이미 statusCode가 있는 에러 (ensureDatabaseInitialized에서 발생)
  if (error.statusCode) {
    return {
      statusCode: error.statusCode,
      headers,
      body: JSON.stringify({
        success: false,
        message: error.message,
        error: error.error
      }),
    }
  }
  
  // 일반 서버 에러
  return {
    statusCode: 500,
    headers,
    body: JSON.stringify({
      success: false,
      message: error.message || defaultMessage,
      error: error.message
    }),
  }
}

/**
 * 성공 응답 생성
 */
export function createSuccessResponse(data, statusCode = 200) {
  return {
    statusCode,
    headers: getCorsHeaders(),
    body: JSON.stringify({
      success: true,
      ...data
    }),
  }
}

/**
 * 인증 확인
 */
export async function verifyAuth(event, sqlFunc) {
  const authHeader = event.headers?.authorization || event.headers?.Authorization
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return null
  }

  return getSessionUser(sqlFunc, authHeader.slice('Bearer '.length))
}
