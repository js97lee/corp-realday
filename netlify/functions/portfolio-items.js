import { getSql, initDatabase } from './db.js'

export const handler = async (event, context) => {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Content-Type': 'application/json',
  }

  try {
    await initDatabase()
    const sqlFunc = getSql()

    // GET: 포트폴리오 항목 목록 조회
    if (event.httpMethod === 'GET') {
      const items = await sqlFunc`
        SELECT id, number, title, description, display_order, created_at, updated_at
        FROM portfolio_items
        ORDER BY display_order ASC, number ASC
      `

      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({
          success: true,
          items
        }),
      }
    }

    // POST: 포트폴리오 항목 추가
    if (event.httpMethod === 'POST') {
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

      const result = await sqlFunc`
        INSERT INTO portfolio_items (number, title, description, display_order)
        VALUES (${number || null}, ${title}, ${description}, ${displayOrder || 0})
        RETURNING *
      `

      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({
          success: true,
          message: '포트폴리오 항목이 추가되었습니다.',
          item: result[0]
        }),
      }
    }

    // PUT: 포트폴리오 항목 수정
    if (event.httpMethod === 'PUT') {
      const { id } = event.pathParameters || {}
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

      const existing = await sqlFunc`
        SELECT * FROM portfolio_items WHERE id = ${parseInt(id)}
      `
      
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
        await sqlFunc`UPDATE portfolio_items SET number = ${number} WHERE id = ${parseInt(id)}`
      }
      if (title) {
        await sqlFunc`UPDATE portfolio_items SET title = ${title} WHERE id = ${parseInt(id)}`
      }
      if (description !== undefined) {
        await sqlFunc`UPDATE portfolio_items SET description = ${description} WHERE id = ${parseInt(id)}`
      }
      if (displayOrder !== undefined) {
        await sqlFunc`UPDATE portfolio_items SET display_order = ${displayOrder} WHERE id = ${parseInt(id)}`
      }
      
      await sqlFunc`UPDATE portfolio_items SET updated_at = CURRENT_TIMESTAMP WHERE id = ${parseInt(id)}`

      const result = await sqlFunc`
        SELECT * FROM portfolio_items WHERE id = ${parseInt(id)}
      `

      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({
          success: true,
          message: '포트폴리오 항목이 수정되었습니다.',
          item: result[0]
        }),
      }
    }

    // DELETE: 포트폴리오 항목 삭제
    if (event.httpMethod === 'DELETE') {
      const { id } = event.pathParameters || {}

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

      const item = await sqlFunc`
        SELECT * FROM portfolio_items WHERE id = ${parseInt(id)}
      `
      
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

      await sqlFunc`DELETE FROM portfolio_items WHERE id = ${parseInt(id)}`

      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({
          success: true,
          message: '포트폴리오 항목이 삭제되었습니다.'
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

