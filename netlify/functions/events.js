import { initDatabase, getSql } from './db.js'

export const handler = async (event, context) => {
  // CORS 헤더 설정
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
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
    await initDatabase()
    const sql = getSql()

    // 인증 확인
    const authHeader = event.headers.authorization || event.headers.Authorization
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return {
        statusCode: 401,
        headers,
        body: JSON.stringify({ error: '인증이 필요합니다.' }),
      }
    }

    const token = authHeader.replace('Bearer ', '')
    // 간단한 토큰 검증 (실제로는 JWT 검증 필요)
    const userResult = await sql`
      SELECT id, email, role FROM users WHERE password = ${token} LIMIT 1
    `
    if (userResult.length === 0) {
      return {
        statusCode: 401,
        headers,
        body: JSON.stringify({ error: '유효하지 않은 토큰입니다.' }),
      }
    }
    const user = userResult[0]

    // GET: 모든 일정 조회 (초대 정보 포함)
    if (event.httpMethod === 'GET') {
      const events = await sql`
        SELECT 
          e.*,
          u.name as created_by_name
        FROM events e
        LEFT JOIN users u ON e.created_by = u.id
        ORDER BY e.date ASC, e.start_time ASC
      `
      
      // 각 일정의 초대 정보 가져오기
      const eventsWithInvitations = await Promise.all(events.map(async (evt) => {
        const invitations = await sql`
          SELECT 
            ei.*,
            u.name as user_name,
            u.email as user_email
          FROM event_invitations ei
          LEFT JOIN users u ON ei.user_id = u.id
          WHERE ei.event_id = ${evt.id}
        `
        return {
          ...evt,
          invitations: invitations
        }
      }))
      
      return {
        statusCode: 200,
        headers,
        body: JSON.stringify(eventsWithInvitations),
      }
    }

    // POST: 일정 추가
    if (event.httpMethod === 'POST') {
      const body = JSON.parse(event.body || '{}')
      const { title, description, date, start_time, end_time, color, is_private, invited_user_ids } = body

      if (!title || !date) {
        return {
          statusCode: 400,
          headers,
          body: JSON.stringify({ error: '제목과 날짜는 필수입니다.' }),
        }
      }

      // 일정 생성
      const result = await sql`
        INSERT INTO events (title, description, date, start_time, end_time, color, is_private, created_by)
        VALUES (${title}, ${description || null}, ${date}, ${start_time || null}, ${end_time || null}, ${color || 'blue'}, ${is_private || false}, ${user.id})
        RETURNING *
      `
      
      const eventId = result[0].id
      
      // 초대할 사용자 추가
      if (invited_user_ids && Array.isArray(invited_user_ids) && invited_user_ids.length > 0) {
        for (const userId of invited_user_ids) {
          if (userId !== user.id) { // 자기 자신은 제외
            try {
              await sql`
                INSERT INTO event_invitations (event_id, user_id, status)
                VALUES (${eventId}, ${userId}, 'pending')
                ON CONFLICT (event_id, user_id) DO NOTHING
              `
            } catch (e) {
              console.error('초대 추가 실패:', e)
            }
          }
        }
      }

      return {
        statusCode: 201,
        headers,
        body: JSON.stringify(result[0]),
      }
    }

    // PUT: 일정 수정
    if (event.httpMethod === 'PUT') {
      const eventId = event.path.split('/').pop()
      const body = JSON.parse(event.body || '{}')
      const { title, description, date, start_time, end_time, color, is_private, invited_user_ids } = body

      if (!eventId || !title || !date) {
        return {
          statusCode: 400,
          headers,
          body: JSON.stringify({ error: '일정 ID, 제목, 날짜는 필수입니다.' }),
        }
      }

      const result = await sql`
        UPDATE events
        SET 
          title = ${title},
          description = ${description || null},
          date = ${date},
          start_time = ${start_time || null},
          end_time = ${end_time || null},
          color = ${color || 'blue'},
          is_private = ${is_private !== undefined ? is_private : false},
          updated_at = CURRENT_TIMESTAMP
        WHERE id = ${eventId}
        RETURNING *
      `

      if (result.length === 0) {
        return {
          statusCode: 404,
          headers,
          body: JSON.stringify({ error: '일정을 찾을 수 없습니다.' }),
        }
      }
      
      // 초대할 사용자 업데이트 (새로 추가만, 기존 초대는 유지)
      if (invited_user_ids && Array.isArray(invited_user_ids)) {
        // 기존 초대 목록 가져오기
        const existingInvitations = await sql`
          SELECT user_id FROM event_invitations WHERE event_id = ${eventId}
        `
        const existingUserIds = existingInvitations.map(i => i.user_id)
        
        // 새로 추가할 사용자
        for (const userId of invited_user_ids) {
          if (userId !== user.id && !existingUserIds.includes(userId)) {
            try {
              await sql`
                INSERT INTO event_invitations (event_id, user_id, status)
                VALUES (${eventId}, ${userId}, 'pending')
                ON CONFLICT (event_id, user_id) DO NOTHING
              `
            } catch (e) {
              console.error('초대 추가 실패:', e)
            }
          }
        }
      }

      return {
        statusCode: 200,
        headers,
        body: JSON.stringify(result[0]),
      }
    }

    // DELETE: 일정 삭제
    if (event.httpMethod === 'DELETE') {
      const eventId = event.path.split('/').pop()

      if (!eventId) {
        return {
          statusCode: 400,
          headers,
          body: JSON.stringify({ error: '일정 ID가 필요합니다.' }),
        }
      }

      const result = await sql`
        DELETE FROM events WHERE id = ${eventId} RETURNING *
      `

      if (result.length === 0) {
        return {
          statusCode: 404,
          headers,
          body: JSON.stringify({ error: '일정을 찾을 수 없습니다.' }),
        }
      }

      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({ message: '일정이 삭제되었습니다.' }),
      }
    }

    return {
      statusCode: 405,
      headers,
      body: JSON.stringify({ error: '지원하지 않는 메서드입니다.' }),
    }
  } catch (error) {
    console.error('Events API 오류:', error)
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ 
        error: '서버 오류가 발생했습니다.',
        details: error.message 
      }),
    }
  }
}

