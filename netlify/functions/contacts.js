import { sql, initDatabase } from './db.js'

// 데이터베이스 초기화 (최초 실행 시)
let dbInitialized = false

export const handler = async (event, context) => {
  // CORS 헤더 설정
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'GET, OPTIONS',
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

  // GET 요청만 허용
  if (event.httpMethod !== 'GET') {
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

    // Contact 목록 조회
    const contacts = await sql`
      SELECT * FROM contacts
      ORDER BY created_at DESC
    `

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        success: true,
        contacts,
      }),
    }
  } catch (error) {
    console.error('Contacts fetch error:', error)
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

