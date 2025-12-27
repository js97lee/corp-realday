import { getSql, initDatabase } from './db.js'

export const handler = async (event, context) => {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Content-Type': 'application/json',
  }

  try {
    await initDatabase()
    const sqlFunc = getSql()

    // GET: 멤버 목록 조회
    if (event.httpMethod === 'GET') {
      const users = await sqlFunc`
        SELECT id, email, role, name, created_at
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
      const { email, password, role, name } = JSON.parse(event.body || '{}')

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

      const result = await sqlFunc`
        INSERT INTO users (email, password, role, name)
        VALUES (${email}, ${password}, ${role || 'employee'}, ${name || null})
        RETURNING id, email, role, name, created_at
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
      const { id } = event.pathParameters || {}
      const { password, role, name } = JSON.parse(event.body || '{}')

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
        await sqlFunc`
          UPDATE users SET password = ${password} WHERE id = ${parseInt(id)}
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

      const result = await sqlFunc`
        SELECT id, email, role, name, created_at FROM users WHERE id = ${parseInt(id)}
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
      const { id } = event.pathParameters || {}

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

