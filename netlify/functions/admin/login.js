import { sql, initDatabase } from '../db.js'

// 데이터베이스 초기화 (최초 실행 시)
let dbInitialized = false

export const handler = async (event, context) => {
  // CORS 헤더 설정
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Content-Type': 'application/json',
  }

  // OPTIONS 요청 처리 (CORS preflight)
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers,
      body: '',
    }
  }

  // POST 요청만 허용
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      headers,
      body: JSON.stringify({ success: false, message: 'Method not allowed' }),
    }
  }

  try {
    // 데이터베이스 초기화 (한 번만 실행)
    if (!dbInitialized) {
      try {
        await initDatabase()
        dbInitialized = true
      } catch (dbError) {
        console.error('Database initialization error:', dbError)
        return {
          statusCode: 500,
          headers,
          body: JSON.stringify({
            success: false,
            message: '데이터베이스 연결 오류: ' + dbError.message,
          }),
        }
      }
    }

    const { email, password } = JSON.parse(event.body || '{}')

    // 입력 검증
    if (!email || !password) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({
          success: false,
          message: '이메일과 비밀번호를 모두 입력해주세요.',
        }),
      }
    }

    // 이메일 형식 검증
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({
          success: false,
          message: '올바른 이메일 형식을 입력해주세요.',
        }),
      }
    }

    // 데이터베이스에서 사용자 조회
    const users = await sql`
      SELECT * FROM users WHERE email = ${email}
    `

    if (users.length === 0) {
      return {
        statusCode: 401,
        headers,
        body: JSON.stringify({
          success: false,
          message: '이메일 또는 비밀번호가 올바르지 않습니다.',
        }),
      }
    }

    const user = users[0]

    // 비밀번호 확인
    if (password !== user.password) {
      return {
        statusCode: 401,
        headers,
        body: JSON.stringify({
          success: false,
          message: '이메일 또는 비밀번호가 올바르지 않습니다.',
        }),
      }
    }

    // 로그인 성공
    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        success: true,
        message: '로그인 성공',
        user: {
          id: user.id,
          email: user.email,
          role: user.role || 'employee',
        },
        token: 'mock-jwt-token',
      }),
    }
  } catch (error) {
    console.error('Login error:', error)
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({
        success: false,
        message: '서버 오류가 발생했습니다.',
      }),
    }
  }
}

