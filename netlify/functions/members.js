import { hashPassword } from './auth.js'
import {
  createErrorResponse,
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
    const sqlFunc = await ensureDatabaseInitialized(context)
    const currentUser = await verifyAuth(event, sqlFunc)
    const role = currentUser?.role?.toLowerCase()

    if (!currentUser || !['ceo', 'super_admin'].includes(role)) {
      return {
        statusCode: 401,
        headers,
        body: JSON.stringify({ success: false, message: '최고관리자 권한이 필요합니다.' }),
      }
    }

    // GET: 멤버 목록 조회
    if (event.httpMethod === 'GET') {
      const users = await sqlFunc`
        SELECT id, email, role, name, profile_image_url, join_date, created_at
        FROM users
        ORDER BY created_at DESC
      `
      
      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({
          success: true,
          members: users
        }),
      }
    }

    // POST: 멤버 추가
    if (event.httpMethod === 'POST') {
      const { email, password, role, name, profileImageUrl, joinDate } = JSON.parse(event.body || '{}')

      if (!email || !password) {
        return {
          statusCode: 400,
          headers,
          body: JSON.stringify({
            success: false,
            message: '이메일과 비밀번호를 입력해주세요.'
          }),
        }
      }

      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
      if (!emailRegex.test(email)) {
        return {
          statusCode: 400,
          headers,
          body: JSON.stringify({
            success: false,
            message: '올바른 이메일 형식을 입력해주세요.'
          }),
        }
      }

      // 중복 확인
      const existing = await sqlFunc`
        SELECT * FROM users WHERE email = ${email}
      `
      if (existing.length > 0) {
        return {
          statusCode: 400,
          headers,
          body: JSON.stringify({
            success: false,
            message: '이미 존재하는 이메일입니다.'
          }),
        }
      }

      const passwordHash = await hashPassword(password)
      const result = await sqlFunc`
        INSERT INTO users (email, password, role, name, profile_image_url, join_date)
        VALUES (${email}, ${passwordHash}, ${role || 'pro'}, ${name || null}, ${profileImageUrl || null}, ${joinDate || null})
        RETURNING id, email, role, name, profile_image_url, join_date, created_at
      `

      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({
          success: true,
          message: '멤버가 추가되었습니다.',
          member: result[0]
        }),
      }
    }

    // PUT: 멤버 수정
    if (event.httpMethod === 'PUT') {
      // 경로에서 ID 추출: /api/members/123 또는 /.netlify/functions/members/123
      let id = event.pathParameters?.id || event.pathParameters?.splat
      
      // pathParameters가 없으면 경로에서 직접 추출
      if (!id && event.path) {
        const pathMatch = event.path.match(/\/members\/(\d+)/)
        if (pathMatch) {
          id = pathMatch[1]
        }
      }
      
      // 쿼리 스트링에서도 확인
      if (!id && event.queryStringParameters?.id) {
        id = event.queryStringParameters.id
      }
      
      const { password, role, name, profileImageUrl, joinDate } = JSON.parse(event.body || '{}')

      if (!id) {
        return {
          statusCode: 400,
          headers,
          body: JSON.stringify({
            success: false,
            message: '멤버 ID가 필요합니다.'
          }),
        }
      }

      const existing = await sqlFunc`
        SELECT * FROM users WHERE id = ${parseInt(id)}
      `
      
      if (existing.length === 0) {
        return {
          statusCode: 404,
          headers,
          body: JSON.stringify({
            success: false,
            message: '멤버를 찾을 수 없습니다.'
          }),
        }
      }

      // 업데이트할 필드만 업데이트
      if (password) {
        const passwordHash = await hashPassword(password)
        await sqlFunc`
          UPDATE users SET password = ${passwordHash} WHERE id = ${parseInt(id)}
        `
      }
      if (role) {
        await sqlFunc`
          UPDATE users SET role = ${role} WHERE id = ${parseInt(id)}
        `
      }
      if (name !== undefined) {
        await sqlFunc`
          UPDATE users SET name = ${name} WHERE id = ${parseInt(id)}
        `
      }
      if (profileImageUrl !== undefined) {
        await sqlFunc`
          UPDATE users SET profile_image_url = ${profileImageUrl || null} WHERE id = ${parseInt(id)}
        `
      }
      if (joinDate !== undefined) {
        await sqlFunc`
          UPDATE users SET join_date = ${joinDate || null} WHERE id = ${parseInt(id)}
        `
      }

      const result = await sqlFunc`
        SELECT id, email, role, name, profile_image_url, join_date, created_at FROM users WHERE id = ${parseInt(id)}
      `

      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({
          success: true,
          message: '멤버 정보가 수정되었습니다.',
          member: result[0]
        }),
      }
    }

    // DELETE: 멤버 삭제
    if (event.httpMethod === 'DELETE') {
      // 경로에서 ID 추출: /api/members/123 또는 /.netlify/functions/members/123
      let id = event.pathParameters?.id || event.pathParameters?.splat
      
      // pathParameters가 없으면 경로에서 직접 추출
      if (!id && event.path) {
        const pathMatch = event.path.match(/\/members\/(\d+)/)
        if (pathMatch) {
          id = pathMatch[1]
        }
      }
      
      // 쿼리 스트링에서도 확인
      if (!id && event.queryStringParameters?.id) {
        id = event.queryStringParameters.id
      }

      if (!id) {
        return {
          statusCode: 400,
          headers,
          body: JSON.stringify({
            success: false,
            message: '멤버 ID가 필요합니다.'
          }),
        }
      }

      const user = await sqlFunc`
        SELECT email FROM users WHERE id = ${parseInt(id)}
      `
      
      if (user.length === 0) {
        return {
          statusCode: 404,
          headers,
          body: JSON.stringify({
            success: false,
            message: '멤버를 찾을 수 없습니다.'
          }),
        }
      }

      if (user[0].email === 'studio.realday@gmail.com') {
        return {
          statusCode: 400,
          headers,
          body: JSON.stringify({
            success: false,
            message: '최고관리자 계정은 삭제할 수 없습니다.'
          }),
        }
      }

      await sqlFunc`
        DELETE FROM users WHERE id = ${parseInt(id)}
      `

      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({
          success: true,
          message: '멤버가 삭제되었습니다.'
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
    console.error('Members API error:', error)
    return createErrorResponse(error, context)
  }
}
