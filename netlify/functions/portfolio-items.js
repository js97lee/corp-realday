import { getSql, initDatabase } from './db.js'

// 데이터베이스 초기화 (최초 실행 시만)
let dbInitialized = false

export const handler = async (event, context) => {
  const headers = {
    'Access-Control-Allow-Origin': '*',
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

  try {
    // 데이터베이스 초기화 (한 번만 실행 - 성능 최적화)
    if (!dbInitialized) {
      try {
        await Promise.race([
          initDatabase(),
          new Promise((_, reject) => setTimeout(() => reject(new Error('Init timeout (5초 초과)')), 5000))
        ])
        dbInitialized = true
      } catch (initError) {
        console.error('Database initialization error:', initError)
        return {
          statusCode: 503,
          headers,
          body: JSON.stringify({
            success: false,
            message: '데이터베이스 초기화에 실패했습니다.',
            error: initError.message
          }),
        }
      }
    }

    // 데이터베이스 연결 (간단하게)
    const sqlFunc = getSql()

    // GET: 포트폴리오 항목 목록 조회
    if (event.httpMethod === 'GET') {
      try {
        const items = await Promise.race([
          sqlFunc`
            SELECT id, number, title, description, display_order, created_at, updated_at
            FROM portfolio_items
            ORDER BY display_order ASC, number ASC
          `,
          new Promise((_, reject) => setTimeout(() => reject(new Error('Query timeout (8초 초과)')), 8000))
        ])

        return {
          statusCode: 200,
          headers,
          body: JSON.stringify({
            success: true,
            items: items || []
          }),
        }
      } catch (dbError) {
        // 테이블이 없으면 초기화 후 재시도 (타임아웃 설정)
        if (dbError.message && dbError.message.includes('does not exist')) {
          console.log('테이블이 없어서 초기화 후 재시도...')
          try {
            await Promise.race([
              initDatabase(),
              new Promise((_, reject) => setTimeout(() => reject(new Error('Init timeout (5초 초과)')), 5000))
            ])
            dbInitialized = true
            
            const items = await Promise.race([
              sqlFunc`
                SELECT id, number, title, description, display_order, created_at, updated_at
                FROM portfolio_items
                ORDER BY display_order ASC, number ASC
              `,
              new Promise((_, reject) => setTimeout(() => reject(new Error('Query timeout (8초 초과)')), 8000))
            ])
            
            return {
              statusCode: 200,
              headers,
              body: JSON.stringify({
                success: true,
                items: items || []
              }),
            }
          } catch (retryError) {
            console.error('재시도 실패:', retryError)
            return {
              statusCode: 500,
              headers,
              body: JSON.stringify({
                success: false,
                message: '포트폴리오 항목 조회에 실패했습니다.',
                error: retryError.message
              }),
            }
          }
        }
        
        // 다른 에러는 그대로 반환
        console.error('Portfolio items fetch error:', dbError)
        return {
          statusCode: 500,
          headers,
          body: JSON.stringify({
            success: false,
            message: '서버 오류가 발생했습니다.',
            error: dbError.message
          }),
        }
      }
    }

    // POST: 포트폴리오 항목 추가
    if (event.httpMethod === 'POST') {
      try {
        const { number, title, description, displayOrder } = JSON.parse(event.body || '{}')

        if (!title || !description) {
          return {
            statusCode: 400,
            headers,
            body: JSON.stringify({
              success: false,
              message: '제목과 설명을 입력해주세요.'
            }),
          }
        }

        const result = await Promise.race([
          sqlFunc`
            INSERT INTO portfolio_items (number, title, description, display_order)
            VALUES (${number || null}, ${title}, ${description}, ${displayOrder || 0})
            RETURNING *
          `,
          new Promise((_, reject) => setTimeout(() => reject(new Error('Query timeout (8초 초과)')), 8000))
        ])

        return {
          statusCode: 200,
          headers,
          body: JSON.stringify({
            success: true,
            message: '포트폴리오 항목이 추가되었습니다.',
            item: result[0]
          }),
        }
      } catch (error) {
        console.error('Portfolio item creation error:', error)
        return {
          statusCode: 500,
          headers,
          body: JSON.stringify({
            success: false,
            message: '포트폴리오 항목 추가에 실패했습니다.',
            error: error.message
          }),
        }
      }
    }

    // PUT: 포트폴리오 항목 수정
    if (event.httpMethod === 'PUT') {
      // 경로에서 ID 추출
      let id = event.pathParameters?.id || event.pathParameters?.splat
      if (!id && event.path) {
        const pathMatch = event.path.match(/\/portfolio-items\/(\d+)/)
        if (pathMatch) {
          id = pathMatch[1]
        }
      }
      if (!id && event.queryStringParameters?.id) {
        id = event.queryStringParameters.id
      }
      const { number, title, description, displayOrder } = JSON.parse(event.body || '{}')

      if (!id) {
        return {
          statusCode: 400,
          headers,
          body: JSON.stringify({
            success: false,
            message: '포트폴리오 항목 ID가 필요합니다.'
          }),
        }
      }

      try {
        const existing = await Promise.race([
          sqlFunc`SELECT * FROM portfolio_items WHERE id = ${parseInt(id)}`,
          new Promise((_, reject) => setTimeout(() => reject(new Error('Query timeout (8초 초과)')), 8000))
        ])
        
        if (existing.length === 0) {
          return {
            statusCode: 404,
            headers,
            body: JSON.stringify({
              success: false,
              message: '포트폴리오 항목을 찾을 수 없습니다.'
            }),
          }
        }

        if (number !== undefined) {
          await Promise.race([
            sqlFunc`UPDATE portfolio_items SET number = ${number} WHERE id = ${parseInt(id)}`,
            new Promise((_, reject) => setTimeout(() => reject(new Error('Query timeout (8초 초과)')), 8000))
          ])
        }
        if (title) {
          await Promise.race([
            sqlFunc`UPDATE portfolio_items SET title = ${title} WHERE id = ${parseInt(id)}`,
            new Promise((_, reject) => setTimeout(() => reject(new Error('Query timeout (8초 초과)')), 8000))
          ])
        }
        if (description !== undefined) {
          await Promise.race([
            sqlFunc`UPDATE portfolio_items SET description = ${description} WHERE id = ${parseInt(id)}`,
            new Promise((_, reject) => setTimeout(() => reject(new Error('Query timeout (8초 초과)')), 8000))
          ])
        }
        if (displayOrder !== undefined) {
          await Promise.race([
            sqlFunc`UPDATE portfolio_items SET display_order = ${displayOrder} WHERE id = ${parseInt(id)}`,
            new Promise((_, reject) => setTimeout(() => reject(new Error('Query timeout (8초 초과)')), 8000))
          ])
        }
        
        await Promise.race([
          sqlFunc`UPDATE portfolio_items SET updated_at = CURRENT_TIMESTAMP WHERE id = ${parseInt(id)}`,
          new Promise((_, reject) => setTimeout(() => reject(new Error('Query timeout (8초 초과)')), 8000))
        ])

        const result = await Promise.race([
          sqlFunc`SELECT * FROM portfolio_items WHERE id = ${parseInt(id)}`,
          new Promise((_, reject) => setTimeout(() => reject(new Error('Query timeout (8초 초과)')), 8000))
        ])

        return {
          statusCode: 200,
          headers,
          body: JSON.stringify({
            success: true,
            message: '포트폴리오 항목이 수정되었습니다.',
            item: result[0]
          }),
        }
      } catch (error) {
        console.error('Portfolio item update error:', error)
        return {
          statusCode: 500,
          headers,
          body: JSON.stringify({
            success: false,
            message: '포트폴리오 항목 수정에 실패했습니다.',
            error: error.message
          }),
        }
      }
    }

    // DELETE: 포트폴리오 항목 삭제
    if (event.httpMethod === 'DELETE') {
      // 경로에서 ID 추출
      let id = event.pathParameters?.id || event.pathParameters?.splat
      if (!id && event.path) {
        const pathMatch = event.path.match(/\/portfolio-items\/(\d+)/)
        if (pathMatch) {
          id = pathMatch[1]
        }
      }
      if (!id && event.queryStringParameters?.id) {
        id = event.queryStringParameters.id
      }

      if (!id) {
        return {
          statusCode: 400,
          headers,
          body: JSON.stringify({
            success: false,
            message: '포트폴리오 항목 ID가 필요합니다.'
          }),
        }
      }

      try {
        const item = await Promise.race([
          sqlFunc`SELECT * FROM portfolio_items WHERE id = ${parseInt(id)}`,
          new Promise((_, reject) => setTimeout(() => reject(new Error('Query timeout (8초 초과)')), 8000))
        ])
        
        if (item.length === 0) {
          return {
            statusCode: 404,
            headers,
            body: JSON.stringify({
              success: false,
              message: '포트폴리오 항목을 찾을 수 없습니다.'
            }),
          }
        }

        await Promise.race([
          sqlFunc`DELETE FROM portfolio_items WHERE id = ${parseInt(id)}`,
          new Promise((_, reject) => setTimeout(() => reject(new Error('Query timeout (8초 초과)')), 8000))
        ])

        return {
          statusCode: 200,
          headers,
          body: JSON.stringify({
            success: true,
            message: '포트폴리오 항목이 삭제되었습니다.'
          }),
        }
      } catch (error) {
        console.error('Portfolio item deletion error:', error)
        return {
          statusCode: 500,
          headers,
          body: JSON.stringify({
            success: false,
            message: '포트폴리오 항목 삭제에 실패했습니다.',
            error: error.message
          }),
        }
      }
    }

    return {
      statusCode: 405,
      headers,
      body: JSON.stringify({
        success: false,
        message: '지원하지 않는 HTTP 메서드입니다.'
      }),
    }
  } catch (error) {
    console.error('Portfolio items API error:', error)
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({
        success: false,
        message: '서버 오류가 발생했습니다.',
        error: error.message
      }),
    }
  }
}

