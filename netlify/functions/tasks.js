import { getSql, initDatabase } from './db.js'
import { 
  handleOptionsRequest, 
  ensureDatabaseInitialized, 
  executeQuery, 
  createErrorResponse, 
  createSuccessResponse 
} from './utils.js'

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
  // OPTIONS 요청 처리
  if (event.httpMethod === 'OPTIONS') {
    return handleOptionsRequest()
  }

  try {
    const sqlFunc = await ensureDatabaseInitialized(context)

    // GET: 업무 목록 조회 (쿼리 최적화)
    if (event.httpMethod === 'GET') {
      const { projectId, includeDeleted } = event.queryStringParameters || {}
      
      // 조건에 따라 쿼리 구성
      let tasks
      if (projectId) {
        if (includeDeleted === 'true') {
          tasks = await executeQuery(
            sqlFunc`
              SELECT t.*, u.name as assignee_name, u.email as assignee_email
              FROM tasks t
              LEFT JOIN users u ON t.assignee_id = u.id
              WHERE t.project_id = ${parseInt(projectId)}
              ORDER BY t.is_deleted ASC, t.created_at DESC
            `,
            context
          )
        } else {
          tasks = await executeQuery(
            sqlFunc`
              SELECT t.*, u.name as assignee_name, u.email as assignee_email
              FROM tasks t
              LEFT JOIN users u ON t.assignee_id = u.id
              WHERE t.project_id = ${parseInt(projectId)} AND (t.is_deleted = false OR t.is_deleted IS NULL)
              ORDER BY t.created_at DESC
            `,
            context
          )
        }
      } else {
        if (includeDeleted === 'true') {
          tasks = await executeQuery(
            sqlFunc`
              SELECT t.*, u.name as assignee_name, u.email as assignee_email
              FROM tasks t
              LEFT JOIN users u ON t.assignee_id = u.id
              ORDER BY t.is_deleted ASC, t.created_at DESC
            `,
            context
          )
        } else {
          tasks = await executeQuery(
            sqlFunc`
              SELECT t.*, u.name as assignee_name, u.email as assignee_email
              FROM tasks t
              LEFT JOIN users u ON t.assignee_id = u.id
              WHERE (t.is_deleted = false OR t.is_deleted IS NULL)
              ORDER BY t.created_at DESC
            `,
            context
          )
        }
      }

      return createSuccessResponse({ tasks })
    }

    // POST: 업무 추가
    if (event.httpMethod === 'POST') {
      const { title, description, status, priority, assigneeId, assigneeName, projectKey, projectId, startDate, endDate, assigneeIds, assigneeNames } = JSON.parse(event.body || '{}')
      
      // 다중 담당자 지원: assigneeNames가 있으면 첫 번째 담당자 사용
      const finalAssigneeId = assigneeIds && assigneeIds.length > 0 ? assigneeIds[0] : assigneeId
      const finalAssigneeName = assigneeNames && assigneeNames.length > 0 ? assigneeNames[0] : assigneeName

      if (!title) {
        return {
          statusCode: 400,
          headers: { 'Access-Control-Allow-Origin': '*', 'Content-Type': 'application/json' },
          body: JSON.stringify({
            success: false,
            message: '업무 제목을 입력해주세요.'
          }),
        }
      }

      const taskKey = await executeQuery(
        generateTaskKey(sqlFunc, projectKey || 'APP'),
        context
      )

      const result = await executeQuery(
        sqlFunc`
          INSERT INTO tasks (task_key, title, description, status, priority, assignee_id, assignee_name, project_id, project_key, start_date, end_date)
          VALUES (${taskKey}, ${title}, ${description || null}, ${status || 'backlog'}, ${priority || 'medium'}, ${finalAssigneeId || null}, ${finalAssigneeName || null}, ${projectId || null}, ${projectKey || 'APP'}, ${startDate || null}, ${endDate || null})
          RETURNING *
        `,
        context
      )

      return createSuccessResponse({
        message: '업무가 추가되었습니다.',
        task: result[0]
      })
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
      
      const { title, description, status, priority, assigneeId, assigneeName, projectId, startDate, endDate, assigneeIds, assigneeNames, taskKey } = JSON.parse(event.body || '{}')
      
      // 다중 담당자 지원: assigneeNames가 있으면 첫 번째 담당자 사용
      const finalAssigneeId = assigneeIds && assigneeIds.length > 0 ? assigneeIds[0] : assigneeId
      const finalAssigneeName = assigneeNames && assigneeNames.length > 0 ? assigneeNames[0] : assigneeName

      if (!id) {
        return {
          statusCode: 400,
          headers: { 'Access-Control-Allow-Origin': '*', 'Content-Type': 'application/json' },
          body: JSON.stringify({
            success: false,
            message: '업무 ID가 필요합니다.'
          }),
        }
      }

      const existing = await executeQuery(
        sqlFunc`SELECT * FROM tasks WHERE id = ${parseInt(id)}`,
        context
      )
      
      if (existing.length === 0) {
        return {
          statusCode: 404,
          headers: { 'Access-Control-Allow-Origin': '*', 'Content-Type': 'application/json' },
          body: JSON.stringify({
            success: false,
            message: '업무를 찾을 수 없습니다.'
          }),
        }
      }

      // 기존 데이터 가져오기
      const current = existing[0]

      // 업데이트할 값 결정
      const updateTitle = title !== undefined ? title : current.title
      const updateDescription = description !== undefined ? description : current.description
      const updateStatus = status !== undefined ? status : current.status
      const updatePriority = priority !== undefined ? priority : current.priority
      const updateAssigneeId = finalAssigneeId !== undefined ? finalAssigneeId : current.assignee_id
      const updateAssigneeName = finalAssigneeName !== undefined ? finalAssigneeName : current.assignee_name
      const updateProjectId = projectId !== undefined ? projectId : current.project_id
      const updateStartDate = startDate !== undefined ? startDate : current.start_date
      const updateEndDate = endDate !== undefined ? endDate : current.end_date
      const updateTaskKey = (taskKey !== undefined && taskKey !== null && taskKey !== '') ? taskKey : current.task_key

      // 단일 UPDATE 쿼리로 모든 필드 업데이트
      const result = await executeQuery(
        sqlFunc`
          UPDATE tasks
          SET 
            title = ${updateTitle},
            description = ${updateDescription},
            status = ${updateStatus},
            priority = ${updatePriority},
            assignee_id = ${updateAssigneeId || null},
            assignee_name = ${updateAssigneeName || null},
            project_id = ${updateProjectId || null},
            start_date = ${updateStartDate || null},
            end_date = ${updateEndDate || null},
            task_key = ${updateTaskKey},
            updated_at = CURRENT_TIMESTAMP
          WHERE id = ${parseInt(id)}
          RETURNING *
        `,
        context
      )

      // 사용자 정보 포함하여 반환
      const taskWithUser = await executeQuery(
        sqlFunc`
          SELECT t.*, u.name as assignee_name, u.email as assignee_email
          FROM tasks t
          LEFT JOIN users u ON t.assignee_id = u.id
          WHERE t.id = ${parseInt(id)}
        `,
        context
      )

      return createSuccessResponse({
        message: '업무가 수정되었습니다.',
        task: taskWithUser[0]
      })
    }

    // DELETE: 업무 삭제 (soft delete)
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
          headers: { 'Access-Control-Allow-Origin': '*', 'Content-Type': 'application/json' },
          body: JSON.stringify({
            success: false,
            message: '업무 ID가 필요합니다.'
          }),
        }
      }

      const task = await executeQuery(
        sqlFunc`SELECT * FROM tasks WHERE id = ${parseInt(id)}`,
        context
      )
      
      if (task.length === 0) {
        return {
          statusCode: 404,
          headers: { 'Access-Control-Allow-Origin': '*', 'Content-Type': 'application/json' },
          body: JSON.stringify({
            success: false,
            message: '업무를 찾을 수 없습니다.'
          }),
        }
      }

      // Soft delete: is_deleted를 true로 설정하고 deleted_at에 현재 시간 저장
      await executeQuery(
        sqlFunc`
          UPDATE tasks 
          SET is_deleted = true, deleted_at = CURRENT_TIMESTAMP, updated_at = CURRENT_TIMESTAMP
          WHERE id = ${parseInt(id)}
        `,
        context
      )

      return createSuccessResponse({
        message: '업무가 삭제되었습니다.'
      })
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
    return createErrorResponse(error, context)
  }
}

