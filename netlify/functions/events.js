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
    // 간단한 토큰 검증 (mock-jwt-token은 모든 사용자 허용)
    let user = null
    
    if (token === 'mock-jwt-token') {
      // mock 토큰인 경우 첫 번째 사용자를 사용 (실제로는 토큰에서 사용자 정보 추출)
      const userResult = await sql`
        SELECT id, email, role FROM users LIMIT 1
      `
      if (userResult.length > 0) {
        user = userResult[0]
      }
    } else {
      // 실제 토큰인 경우 password와 비교 (임시)
      const userResult = await sql`
        SELECT id, email, role FROM users WHERE password = ${token} LIMIT 1
      `
      if (userResult.length > 0) {
        user = userResult[0]
      }
    }
    
    if (!user) {
      return {
        statusCode: 401,
        headers,
        body: JSON.stringify({ error: '유효하지 않은 토큰입니다.' }),
      }
    }

    // GET: 모든 일정 조회 (초대 정보 포함) - 배치 쿼리로 최적화
    if (event.httpMethod === 'GET') {
      // 모든 이벤트와 초대 정보를 한 번에 조회 (N+1 쿼리 문제 해결)
      const events = await sql`
        SELECT 
          e.*,
          u.name as created_by_name
        FROM events e
        LEFT JOIN users u ON e.created_by = u.id
        ORDER BY e.date ASC, e.start_time ASC
      `
      
      // 모든 초대 정보를 한 번에 조회
      const eventIds = events.map(e => e.id)
      let allInvitations = []
      if (eventIds.length > 0) {
        allInvitations = await sql`
          SELECT 
            ei.*,
            u.name as user_name,
            u.email as user_email
          FROM event_invitations ei
          LEFT JOIN users u ON ei.user_id = u.id
          WHERE ei.event_id = ANY(${eventIds})
        `
      }
      
      // 이벤트별로 초대 정보 그룹화
      const invitationsByEventId = {}
      allInvitations.forEach(inv => {
        if (!invitationsByEventId[inv.event_id]) {
          invitationsByEventId[inv.event_id] = []
        }
        invitationsByEventId[inv.event_id].push(inv)
      })
      
      const eventsWithInvitations = events.map(evt => ({
        ...evt,
        invitations: invitationsByEventId[evt.id] || []
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
      
      // 초대할 사용자 추가 (배치 처리로 최적화)
      if (invited_user_ids && Array.isArray(invited_user_ids) && invited_user_ids.length > 0) {
        const validUserIds = invited_user_ids.filter(userId => userId !== user.id)
        if (validUserIds.length > 0) {
          // 배치 INSERT로 한 번에 처리 (UNNEST 사용)
          await sql`
            INSERT INTO event_invitations (event_id, user_id, status)
            SELECT ${eventId}, unnest(${validUserIds}), 'pending'
            ON CONFLICT (event_id, user_id) DO NOTHING
          `
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
      
      // 초대할 사용자 업데이트 (배치 처리로 최적화)
      if (invited_user_ids && Array.isArray(invited_user_ids)) {
        // 기존 초대 목록 가져오기
        const existingInvitations = await sql`
          SELECT user_id FROM event_invitations WHERE event_id = ${eventId}
        `
        const existingUserIds = new Set(existingInvitations.map(i => i.user_id))
        
        // 새로 추가할 사용자 필터링
        const validUserIds = invited_user_ids.filter(
          userId => userId !== user.id && !existingUserIds.has(userId)
        )
        
        // 배치 INSERT로 한 번에 처리
        if (validUserIds.length > 0) {
          await sql`
            INSERT INTO event_invitations (event_id, user_id, status)
            SELECT ${eventId}, unnest(${validUserIds}), 'pending'
            ON CONFLICT (event_id, user_id) DO NOTHING
          `
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

