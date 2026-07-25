import {
  ensureDatabaseInitialized,
  getCorsHeaders,
  handleOptionsRequest,
  verifyAuth,
} from './utils.js'

export const handler = async (event, context) => {
  const headers = getCorsHeaders()

  if (event.httpMethod === 'OPTIONS') {
    return handleOptionsRequest()
  }

  try {
    const sql = await ensureDatabaseInitialized(context)
    const user = await verifyAuth(event, sql)
    
    if (!user) {
      return {
        statusCode: 401,
        headers,
        body: JSON.stringify({ error: '유효하지 않은 토큰입니다.' }),
      }
    }

    // PUT: 초대 수락/거절
    if (event.httpMethod === 'PUT') {
      const pathParts = event.path.split('/')
      const eventId = pathParts[pathParts.length - 2]
      const action = pathParts[pathParts.length - 1] // 'accept' or 'decline'

      if (!eventId || !action) {
        return {
          statusCode: 400,
          headers,
          body: JSON.stringify({ error: '일정 ID와 액션이 필요합니다.' }),
        }
      }

      const status = action === 'accept' ? 'accepted' : 'declined'

      const result = await sql`
        UPDATE event_invitations
        SET status = ${status}, updated_at = CURRENT_TIMESTAMP
        WHERE event_id = ${eventId} AND user_id = ${user.id}
        RETURNING *
      `

      if (result.length === 0) {
        return {
          statusCode: 404,
          headers,
          body: JSON.stringify({ error: '초대를 찾을 수 없습니다.' }),
        }
      }

      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({ message: `초대가 ${action === 'accept' ? '수락' : '거절'}되었습니다.`, invitation: result[0] }),
      }
    }

    return {
      statusCode: 405,
      headers,
      body: JSON.stringify({ error: '지원하지 않는 메서드입니다.' }),
    }
  } catch (error) {
    console.error('Event invitations API 오류:', error)
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

