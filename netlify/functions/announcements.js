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

    // GET: 활성 공지사항 조회 (모든 사용자) 또는 모든 공지사항 조회 (슈퍼어드민)
    if (event.httpMethod === 'GET') {
      const isSuperAdmin = user.role === 'ceo' || user.role === 'super_admin'
      
      if (isSuperAdmin) {
        // 슈퍼어드민은 모든 공지사항 조회
        const announcements = await sql`
          SELECT 
            a.*,
            u.name as created_by_name,
            u.email as created_by_email
          FROM announcements a
          LEFT JOIN users u ON a.created_by = u.id
          ORDER BY a.created_at DESC
        `
        return {
          statusCode: 200,
          headers,
          body: JSON.stringify(announcements),
        }
      } else {
        // 일반 사용자는 활성 공지사항만 조회
        const announcements = await sql`
          SELECT 
            a.*,
            u.name as created_by_name
          FROM announcements a
          LEFT JOIN users u ON a.created_by = u.id
          WHERE a.is_active = true
          ORDER BY a.created_at DESC
          LIMIT 1
        `
        return {
          statusCode: 200,
          headers,
          body: JSON.stringify(announcements),
        }
      }
    }

    // POST, PUT, DELETE는 슈퍼어드민만 가능
    const isSuperAdmin = user.role === 'ceo' || user.role === 'super_admin'
    if (!isSuperAdmin) {
      return {
        statusCode: 403,
        headers,
        body: JSON.stringify({ error: '권한이 없습니다. 최고관리자만 공지를 작성할 수 있습니다.' }),
      }
    }

    // POST: 공지사항 추가
    if (event.httpMethod === 'POST') {
      const body = JSON.parse(event.body || '{}')
      const { title, content, is_active } = body

      if (!title || !content) {
        return {
          statusCode: 400,
          headers,
          body: JSON.stringify({ error: '제목과 내용은 필수입니다.' }),
        }
      }

      // 기존 활성 공지사항 비활성화 (하나만 활성화되도록)
      if (is_active !== false) {
        await sql`UPDATE announcements SET is_active = false WHERE is_active = true`
      }

      const result = await sql`
        INSERT INTO announcements (title, content, is_active, created_by)
        VALUES (${title}, ${content}, ${is_active !== false}, ${user.id})
        RETURNING *
      `

      return {
        statusCode: 201,
        headers,
        body: JSON.stringify(result[0]),
      }
    }

    // PUT: 공지사항 수정
    if (event.httpMethod === 'PUT') {
      const announcementId = event.path.split('/').pop()
      const body = JSON.parse(event.body || '{}')
      const { title, content, is_active } = body

      if (!announcementId || !title || !content) {
        return {
          statusCode: 400,
          headers,
          body: JSON.stringify({ error: '공지사항 ID, 제목, 내용은 필수입니다.' }),
        }
      }

      // 활성화할 경우 기존 활성 공지사항 비활성화
      if (is_active === true) {
        await sql`UPDATE announcements SET is_active = false WHERE is_active = true AND id != ${announcementId}`
      }

      const result = await sql`
        UPDATE announcements
        SET 
          title = ${title},
          content = ${content},
          is_active = ${is_active !== false},
          updated_at = CURRENT_TIMESTAMP
        WHERE id = ${announcementId}
        RETURNING *
      `

      if (result.length === 0) {
        return {
          statusCode: 404,
          headers,
          body: JSON.stringify({ error: '공지사항을 찾을 수 없습니다.' }),
        }
      }

      return {
        statusCode: 200,
        headers,
        body: JSON.stringify(result[0]),
      }
    }

    // DELETE: 공지사항 삭제
    if (event.httpMethod === 'DELETE') {
      const announcementId = event.path.split('/').pop()

      if (!announcementId) {
        return {
          statusCode: 400,
          headers,
          body: JSON.stringify({ error: '공지사항 ID가 필요합니다.' }),
        }
      }

      const result = await sql`
        DELETE FROM announcements WHERE id = ${announcementId} RETURNING *
      `

      if (result.length === 0) {
        return {
          statusCode: 404,
          headers,
          body: JSON.stringify({ error: '공지사항을 찾을 수 없습니다.' }),
        }
      }

      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({ message: '공지사항이 삭제되었습니다.' }),
      }
    }

    return {
      statusCode: 405,
      headers,
      body: JSON.stringify({ error: '지원하지 않는 메서드입니다.' }),
    }
  } catch (error) {
    console.error('Announcements API 오류:', error)
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

