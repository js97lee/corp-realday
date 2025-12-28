import { getSql, initDatabase } from './db.js'

// Task Key 생성 함수 (예: APP-1, APP-2)
async function generateTaskKey(sqlFunc, projectKey = 'APP') {
  try {
    const result = await sqlFunc`
      SELECT task_key FROM tasks 
      WHERE task_key LIKE ${projectKey + '-%'}
      ORDER BY task_key DESC
      LIMIT 1
    `
    
    if (result.length === 0) {
      return `${projectKey}-1`
    }
    
    const lastKey = result[0].task_key
    const parts = lastKey.split('-')
    if (parts.length === 2) {
      const lastNumber = parseInt(parts[1]) || 0
      return `${projectKey}-${lastNumber + 1}`
    }
    
    return `${projectKey}-1`
  } catch (error) {
    // 첫 번째 업무인 경우
    return `${projectKey}-1`
  }
}

export const handler = async (event, context) => {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Content-Type': 'application/json',
  }

  try {
    await initDatabase()
    const sqlFunc = getSql()

    // GET: 업무 목록 조회
    if (event.httpMethod === 'GET') {
      const { projectId } = event.queryStringParameters || {}
      let tasks
      
      if (projectId) {
        tasks = await sqlFunc`
          SELECT t.*, u.name as assignee_name, u.email as assignee_email
          FROM tasks t
          LEFT JOIN users u ON t.assignee_id = u.id
          WHERE t.project_id = ${parseInt(projectId)}
          ORDER BY t.created_at DESC
        `
      } else {
        tasks = await sqlFunc`
          SELECT t.*, u.name as assignee_name, u.email as assignee_email
          FROM tasks t
          LEFT JOIN users u ON t.assignee_id = u.id
          ORDER BY t.created_at DESC
        `
      }

      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({
          success: true,
          tasks
        }),
      }
    }

    // POST: 업무 추가
    if (event.httpMethod === 'POST') {
      const { title, description, status, priority, assigneeId, assigneeName, projectKey, projectId } = JSON.parse(event.body || '{}')

      if (!title) {
        return {
          statusCode: 400,
          headers,
          body: JSON.stringify({
            success: false,
            message: '업무 제목을 입력해주세요.'
          }),
        }
      }

      const taskKey = await generateTaskKey(sqlFunc, projectKey || 'APP')

      const result = await sqlFunc`
        INSERT INTO tasks (task_key, title, description, status, priority, assignee_id, assignee_name, project_id, project_key)
        VALUES (${taskKey}, ${title}, ${description || null}, ${status || 'backlog'}, ${priority || 'medium'}, ${assigneeId || null}, ${assigneeName || null}, ${projectId || null}, ${projectKey || 'APP'})
        RETURNING *
      `

      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({
          success: true,
          message: '업무가 추가되었습니다.',
          task: result[0]
        }),
      }
    }

    // PUT: 업무 수정
    if (event.httpMethod === 'PUT') {
      // 경로에서 ID 추출
      let id = event.pathParameters?.id || event.pathParameters?.splat
      if (!id && event.path) {
        const pathMatch = event.path.match(/\/tasks\/(\d+)/)
        if (pathMatch) {
          id = pathMatch[1]
        }
      }
      if (!id && event.queryStringParameters?.id) {
        id = event.queryStringParameters.id
      }
      
      const { title, description, status, priority, assigneeId, assigneeName, projectId } = JSON.parse(event.body || '{}')

      if (!id) {
        return {
          statusCode: 400,
          headers,
          body: JSON.stringify({
            success: false,
            message: '업무 ID가 필요합니다.'
          }),
        }
      }

      const existing = await sqlFunc`
        SELECT * FROM tasks WHERE id = ${parseInt(id)}
      `
      
      if (existing.length === 0) {
        return {
          statusCode: 404,
          headers,
          body: JSON.stringify({
            success: false,
            message: '업무를 찾을 수 없습니다.'
          }),
        }
      }

      // 업데이트할 필드만 업데이트
      if (title) {
        await sqlFunc`UPDATE tasks SET title = ${title} WHERE id = ${parseInt(id)}`
      }
      if (description !== undefined) {
        await sqlFunc`UPDATE tasks SET description = ${description} WHERE id = ${parseInt(id)}`
      }
      if (status !== undefined) {
        await sqlFunc`UPDATE tasks SET status = ${status} WHERE id = ${parseInt(id)}`
      }
      if (priority !== undefined) {
        await sqlFunc`UPDATE tasks SET priority = ${priority} WHERE id = ${parseInt(id)}`
      }
      if (assigneeId !== undefined) {
        await sqlFunc`UPDATE tasks SET assignee_id = ${assigneeId} WHERE id = ${parseInt(id)}`
      }
      if (assigneeName !== undefined) {
        await sqlFunc`UPDATE tasks SET assignee_name = ${assigneeName} WHERE id = ${parseInt(id)}`
      }
      if (projectId !== undefined) {
        await sqlFunc`UPDATE tasks SET project_id = ${projectId || null} WHERE id = ${parseInt(id)}`
      }
      
      await sqlFunc`UPDATE tasks SET updated_at = CURRENT_TIMESTAMP WHERE id = ${parseInt(id)}`

      const result = await sqlFunc`
        SELECT t.*, u.name as assignee_name, u.email as assignee_email
        FROM tasks t
        LEFT JOIN users u ON t.assignee_id = u.id
        WHERE t.id = ${parseInt(id)}
      `

      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({
          success: true,
          message: '업무가 수정되었습니다.',
          task: result[0]
        }),
      }
    }

    // DELETE: 업무 삭제
    if (event.httpMethod === 'DELETE') {
      // 경로에서 ID 추출
      let id = event.pathParameters?.id || event.pathParameters?.splat
      if (!id && event.path) {
        const pathMatch = event.path.match(/\/tasks\/(\d+)/)
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
            message: '업무 ID가 필요합니다.'
          }),
        }
      }

      const task = await sqlFunc`
        SELECT * FROM tasks WHERE id = ${parseInt(id)}
      `
      
      if (task.length === 0) {
        return {
          statusCode: 404,
          headers,
          body: JSON.stringify({
            success: false,
            message: '업무를 찾을 수 없습니다.'
          }),
        }
      }

      await sqlFunc`DELETE FROM tasks WHERE id = ${parseInt(id)}`

      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({
          success: true,
          message: '업무가 삭제되었습니다.'
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
    console.error('Tasks API error:', error)
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

