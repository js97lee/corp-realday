import { getSql, initDatabase } from './db.js'

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
    const sqlFunc = getSql()

    // GET: 재무 내역 목록 조회
    if (event.httpMethod === 'GET') {
      try {
        const finances = await sqlFunc`
          SELECT id, date, category, description, amount, type, payment_method, created_at, updated_at
          FROM finances
          ORDER BY date DESC, created_at DESC
        `
        
        return {
          statusCode: 200,
          headers,
          body: JSON.stringify({
            success: true,
            finances: finances.map(f => ({
              ...f,
              amount: parseFloat(f.amount)
            }))
          }),
        }
      } catch (error) {
        // 테이블이 없으면 초기화 후 재시도
        if (error.message && error.message.includes('does not exist')) {
          await initDatabase()
          const finances = await sqlFunc`
            SELECT id, date, category, description, amount, type, payment_method, created_at, updated_at
            FROM finances
            ORDER BY date DESC, created_at DESC
          `
          return {
            statusCode: 200,
            headers,
            body: JSON.stringify({
              success: true,
              finances: finances.map(f => ({
                ...f,
                amount: parseFloat(f.amount)
              }))
            }),
          }
        }
        throw error
      }
    }

    // POST: 재무 내역 추가
    if (event.httpMethod === 'POST') {
      await initDatabase()
      const { date, category, description, amount, type, paymentMethod } = JSON.parse(event.body || '{}')

      if (!date || !category || !amount || !type) {
        return {
          statusCode: 400,
          headers,
          body: JSON.stringify({
            success: false,
            message: '날짜, 카테고리, 금액, 유형을 모두 입력해주세요.'
          }),
        }
      }

      if (type !== 'income' && type !== 'expense') {
        return {
          statusCode: 400,
          headers,
          body: JSON.stringify({
            success: false,
            message: '유형은 income 또는 expense여야 합니다.'
          }),
        }
      }

      const result = await sqlFunc`
        INSERT INTO finances (date, category, description, amount, type, payment_method)
        VALUES (${date}, ${category}, ${description || null}, ${amount}, ${type}, ${paymentMethod || null})
        RETURNING *
      `

      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({
          success: true,
          message: '재무 내역이 추가되었습니다.',
          finance: {
            ...result[0],
            amount: parseFloat(result[0].amount)
          }
        }),
      }
    }

    // PUT: 재무 내역 수정
    if (event.httpMethod === 'PUT') {
      await initDatabase()
      
      // ID 추출 (pathParameters 또는 path에서)
      let id = null
      if (event.pathParameters && event.pathParameters.id) {
        id = event.pathParameters.id
      } else if (event.pathParameters && event.pathParameters.splat) {
        id = event.pathParameters.splat
      } else {
        // path에서 직접 추출: /api/finances/123
        const pathMatch = event.path.match(/\/finances\/(\d+)/)
        if (pathMatch) {
          id = pathMatch[1]
        }
      }

      if (!id) {
        return {
          statusCode: 400,
          headers,
          body: JSON.stringify({
            success: false,
            message: '재무 내역 ID가 필요합니다.'
          }),
        }
      }

      const { date, category, description, amount, type, paymentMethod } = JSON.parse(event.body || '{}')

      if (!date || !category || !amount || !type) {
        return {
          statusCode: 400,
          headers,
          body: JSON.stringify({
            success: false,
            message: '날짜, 카테고리, 금액, 유형을 모두 입력해주세요.'
          }),
        }
      }

      if (type !== 'income' && type !== 'expense') {
        return {
          statusCode: 400,
          headers,
          body: JSON.stringify({
            success: false,
            message: '유형은 income 또는 expense여야 합니다.'
          }),
        }
      }

      const result = await sqlFunc`
        UPDATE finances
        SET date = ${date},
            category = ${category},
            description = ${description || null},
            amount = ${amount},
            type = ${type},
            payment_method = ${paymentMethod || null},
            updated_at = CURRENT_TIMESTAMP
        WHERE id = ${id}
        RETURNING *
      `

      if (result.length === 0) {
        return {
          statusCode: 404,
          headers,
          body: JSON.stringify({
            success: false,
            message: '재무 내역을 찾을 수 없습니다.'
          }),
        }
      }

      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({
          success: true,
          message: '재무 내역이 수정되었습니다.',
          finance: {
            ...result[0],
            amount: parseFloat(result[0].amount)
          }
        }),
      }
    }

    // DELETE: 재무 내역 삭제
    if (event.httpMethod === 'DELETE') {
      await initDatabase()
      
      // ID 추출 (pathParameters 또는 path에서)
      let id = null
      if (event.pathParameters && event.pathParameters.id) {
        id = event.pathParameters.id
      } else if (event.pathParameters && event.pathParameters.splat) {
        id = event.pathParameters.splat
      } else {
        // path에서 직접 추출: /api/finances/123
        const pathMatch = event.path.match(/\/finances\/(\d+)/)
        if (pathMatch) {
          id = pathMatch[1]
        }
      }

      if (!id) {
        return {
          statusCode: 400,
          headers,
          body: JSON.stringify({
            success: false,
            message: '재무 내역 ID가 필요합니다.'
          }),
        }
      }

      const result = await sqlFunc`
        DELETE FROM finances
        WHERE id = ${id}
        RETURNING *
      `

      if (result.length === 0) {
        return {
          statusCode: 404,
          headers,
          body: JSON.stringify({
            success: false,
            message: '재무 내역을 찾을 수 없습니다.'
          }),
        }
      }

      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({
          success: true,
          message: '재무 내역이 삭제되었습니다.'
        }),
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
    console.error('재무 관리 오류:', error)
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

