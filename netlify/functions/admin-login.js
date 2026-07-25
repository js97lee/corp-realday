import {
  createErrorResponse,
  ensureDatabaseInitialized,
  getCorsHeaders,
  handleOptionsRequest,
} from './utils.js'
import {
  createSession,
  upgradeLegacyPassword,
  verifyPassword,
} from './auth.js'

export const handler = async (event, context) => {
  const headers = getCorsHeaders()

  if (event.httpMethod === 'OPTIONS') {
    return handleOptionsRequest()
  }

  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      headers,
      body: JSON.stringify({ success: false, message: 'Method not allowed' }),
    }
  }

  try {
    const sqlFunc = await ensureDatabaseInitialized(context)
    const { email, password } = JSON.parse(event.body || '{}')

    // 입력 검증
    if (!email || !password) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({
          success: false,
          message: '이메일과 비밀번호를 모두 입력해주세요.',
        }),
      }
    }

    // 이메일 형식 검증
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({
          success: false,
          message: '올바른 이메일 형식을 입력해주세요.',
        }),
      }
    }

    const users = await sqlFunc`
      SELECT * FROM users WHERE email = ${email}
    `

    if (users.length === 0) {
      return {
        statusCode: 401,
        headers,
        body: JSON.stringify({
          success: false,
          message: '이메일 또는 비밀번호가 올바르지 않습니다.',
        }),
      }
    }

    const user = users[0]

    if (!await verifyPassword(password, user.password)) {
      return {
        statusCode: 401,
        headers,
        body: JSON.stringify({
          success: false,
          message: '이메일 또는 비밀번호가 올바르지 않습니다.',
        }),
      }
    }

    await upgradeLegacyPassword(sqlFunc, user, password)
    const token = await createSession(sqlFunc, user.id)

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        success: true,
        message: '로그인 성공',
        user: {
          id: user.id,
          email: user.email,
          role: user.role || 'employee',
        },
        token,
      }),
    }
  } catch (error) {
    console.error('Login error:', error)
    return createErrorResponse(error, context)
  }
}