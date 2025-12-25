import { sql, initDatabase } from './db.js'

export const handler = async (event, context) => {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Content-Type': 'application/json',
  }

  try {
    console.log('=== DB 테스트 시작 ===')
    console.log('환경 변수 확인:')
    console.log('DATABASE_URL:', process.env.DATABASE_URL ? '설정됨' : '없음')
    console.log('NETLIFY_DATABASE_URL:', process.env.NETLIFY_DATABASE_URL ? '설정됨' : '없음')
    console.log('POSTGRES_PRISMA_URL:', process.env.POSTGRES_PRISMA_URL ? '설정됨' : '없음')
    console.log('POSTGRES_URL_NON_POOLING:', process.env.POSTGRES_URL_NON_POOLING ? '설정됨' : '없음')
    
    // 데이터베이스 초기화
    await initDatabase()
    
    // 간단한 쿼리 테스트
    const result = await sql`SELECT NOW() as current_time, COUNT(*) as user_count FROM users`
    
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
        stack: error.stack,
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

