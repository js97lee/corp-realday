import { getSql, initDatabase } from './db.js'

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
      body: JSON.stringify({ 
        success: false, 
        message: 'Method not allowed. Use GET method.' 
      }),
    }
  }

  try {
    console.log('=== DB 테스트 시작 ===')
    console.log('HTTP Method:', event.httpMethod)
    console.log('Path:', event.path)
    console.log('환경 변수 확인:')
    console.log('DATABASE_URL:', process.env.DATABASE_URL ? '설정됨' : '없음')
    console.log('NETLIFY_DATABASE_URL:', process.env.NETLIFY_DATABASE_URL ? '설정됨' : '없음')
    console.log('POSTGRES_PRISMA_URL:', process.env.POSTGRES_PRISMA_URL ? '설정됨' : '없음')
    console.log('POSTGRES_URL_NON_POOLING:', process.env.POSTGRES_URL_NON_POOLING ? '설정됨' : '없음')
    
    // 데이터베이스 초기화
    await initDatabase()
    
    // 간단한 쿼리 테스트
    const sqlFunc = getSql()
    const result = await sqlFunc`SELECT NOW() as current_time, COUNT(*) as user_count FROM users`
    
    console.log('=== DB 테스트 성공 ===')
    console.log('결과:', result)
    
    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        success: true,
        message: '데이터베이스 연결 성공',
        data: result[0],
        env: {
          DATABASE_URL: process.env.DATABASE_URL ? '설정됨' : '없음',
          NETLIFY_DATABASE_URL: process.env.NETLIFY_DATABASE_URL ? '설정됨' : '없음',
        }
      }),
    }
  } catch (error) {
    console.error('=== DB 테스트 실패 ===')
    console.error('에러:', error)
    console.error('에러 메시지:', error.message)
    console.error('에러 스택:', error.stack)
    
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({
        success: false,
        message: '데이터베이스 연결 실패',
        error: error.message,
        stack: process.env.NODE_ENV === 'development' ? error.stack : undefined,
        env: {
          DATABASE_URL: process.env.DATABASE_URL ? '설정됨' : '없음',
          NETLIFY_DATABASE_URL: process.env.NETLIFY_DATABASE_URL ? '설정됨' : '없음',
          allEnvKeys: Object.keys(process.env).filter(key => 
            key.includes('DATABASE') || key.includes('POSTGRES') || key.includes('NEON')
          ),
        }
      }),
    }
  }
}

