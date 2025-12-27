import { getSql, initDatabase } from './db.js'

export const handler = async (event, context) => {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Content-Type': 'application/json',
  }

  try {
    await initDatabase()
    const sqlFunc = getSql()

    // GET: 프로젝트 목록 조회
    if (event.httpMethod === 'GET') {
      const { visible } = event.queryStringParameters || {}
      let projects

      if (visible === 'true') {
        // 랜딩페이지용: 노출된 프로젝트만
        projects = await sqlFunc`
          SELECT id, title, description, category, image, created_at
          FROM projects
          WHERE is_visible = true
          ORDER BY created_at DESC
        `
      } else {
        // 관리자용: 모든 프로젝트
        projects = await sqlFunc`
          SELECT id, title, description, category, image, memo, is_visible, status, created_at, updated_at
          FROM projects
          ORDER BY created_at DESC
        `
      }

      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({
          success: true,
          projects
        }),
      }
    }

    // POST: 프로젝트 추가
    if (event.httpMethod === 'POST') {
      const { title, description, category, image, memo, isVisible, status } = JSON.parse(event.body || '{}')

      if (!title) {
        return {
          statusCode: 400,
          headers,
          body: JSON.stringify({
            success: false,
            message: '프로젝트 제목을 입력해주세요.'
          }),
        }
      }

      const result = await sqlFunc`
        INSERT INTO projects (title, description, category, image, memo, is_visible, status)
        VALUES (${title}, ${description || null}, ${category || null}, ${image || null}, ${memo || null}, ${isVisible !== false}, ${status || 'planned'})
        RETURNING *
      `

      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({
          success: true,
          message: '프로젝트가 추가되었습니다.',
          project: result[0]
        }),
      }
    }

    // PUT: 프로젝트 수정
    if (event.httpMethod === 'PUT') {
      const { id } = event.pathParameters || {}
      const { title, description, category, image, memo, isVisible, status } = JSON.parse(event.body || '{}')

      if (!id) {
        return {
          statusCode: 400,
          headers,
          body: JSON.stringify({
            success: false,
            message: '프로젝트 ID가 필요합니다.'
          }),
        }
      }

      const existing = await sqlFunc`
        SELECT * FROM projects WHERE id = ${parseInt(id)}
      `
      
      if (existing.length === 0) {
        return {
          statusCode: 404,
          headers,
          body: JSON.stringify({
            success: false,
            message: '프로젝트를 찾을 수 없습니다.'
          }),
        }
      }

      // 업데이트할 필드만 업데이트
      if (title) {
        await sqlFunc`UPDATE projects SET title = ${title} WHERE id = ${parseInt(id)}`
      }
      if (description !== undefined) {
        await sqlFunc`UPDATE projects SET description = ${description} WHERE id = ${parseInt(id)}`
      }
      if (category !== undefined) {
        await sqlFunc`UPDATE projects SET category = ${category} WHERE id = ${parseInt(id)}`
      }
      if (image !== undefined) {
        await sqlFunc`UPDATE projects SET image = ${image} WHERE id = ${parseInt(id)}`
      }
      if (memo !== undefined) {
        await sqlFunc`UPDATE projects SET memo = ${memo} WHERE id = ${parseInt(id)}`
      }
      if (isVisible !== undefined) {
        await sqlFunc`UPDATE projects SET is_visible = ${isVisible} WHERE id = ${parseInt(id)}`
      }
      if (status !== undefined) {
        await sqlFunc`UPDATE projects SET status = ${status} WHERE id = ${parseInt(id)}`
      }
      
      await sqlFunc`UPDATE projects SET updated_at = CURRENT_TIMESTAMP WHERE id = ${parseInt(id)}`

      const result = await sqlFunc`
        SELECT * FROM projects WHERE id = ${parseInt(id)}
      `

      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({
          success: true,
          message: '프로젝트가 수정되었습니다.',
          project: result[0]
        }),
      }
    }

    // DELETE: 프로젝트 삭제
    if (event.httpMethod === 'DELETE') {
      const { id } = event.pathParameters || {}

      if (!id) {
        return {
          statusCode: 400,
          headers,
          body: JSON.stringify({
            success: false,
            message: '프로젝트 ID가 필요합니다.'
          }),
        }
      }

      const project = await sqlFunc`
        SELECT * FROM projects WHERE id = ${parseInt(id)}
      `
      
      if (project.length === 0) {
        return {
          statusCode: 404,
          headers,
          body: JSON.stringify({
            success: false,
            message: '프로젝트를 찾을 수 없습니다.'
          }),
        }
      }

      await sqlFunc`DELETE FROM projects WHERE id = ${parseInt(id)}`

      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({
          success: true,
          message: '프로젝트가 삭제되었습니다.'
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
    console.error('Projects API error:', error)
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

