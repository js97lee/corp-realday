import { getSql, initDatabase } from './db.js'

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

    const { name, email, message } = JSON.parse(event.body || '{}')

    // 입력 검증
    if (!name || !email || !message) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({
          success: false,
          message: '모든 필드를 입력해주세요.',
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

    // 데이터베이스에 Contact 저장
    const sqlFunc = getSql()
    const result = await sqlFunc`
      INSERT INTO contacts (name, email, message)
      VALUES (${name}, ${email}, ${message})
      RETURNING *
    `

    const contact = result[0]

    // 성공 응답
    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        success: true,
        message: '메시지가 전송되었습니다!',
        contact,
      }),
    }
  } catch (error) {
    console.error('Contact error:', error)
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

