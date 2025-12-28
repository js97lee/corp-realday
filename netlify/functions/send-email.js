import nodemailer from 'nodemailer'
import { getSql, initDatabase } from './db.js'

// 데이터베이스 초기화 (최초 실행 시)
let dbInitialized = false

// Gmail SMTP 설정
const createTransporter = () => {
  // 환경 변수에서 Gmail 계정 정보 가져오기
  const gmailUser = process.env.GMAIL_USER || 'studio.realday@gmail.com'
  const gmailPassword = process.env.GMAIL_APP_PASSWORD // Gmail 앱 비밀번호 필요

  if (!gmailPassword) {
    throw new Error('Gmail 앱 비밀번호가 설정되지 않았습니다. 환경 변수 GMAIL_APP_PASSWORD를 설정해주세요.')
  }

  return nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: gmailUser,
      pass: gmailPassword,
    },
  })
}

// 권한 확인 함수 - 최고관리자만 허용
const verifySuperAdmin = async (event) => {
  const authHeader = event.headers.authorization || event.headers.Authorization
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return { authorized: false, message: '인증 토큰이 필요합니다.' }
  }

  // 데이터베이스 초기화
  if (!dbInitialized) {
    try {
      await initDatabase()
      dbInitialized = true
    } catch (dbError) {
      console.error('Database initialization error:', dbError)
      return { authorized: false, message: '데이터베이스 연결 오류' }
    }
  }

  try {
    // 요청 본문에서 사용자 이메일 추출 (클라이언트에서 전송)
    const body = JSON.parse(event.body || '{}')
    const userEmail = body.userEmail

    if (!userEmail) {
      return { authorized: false, message: '사용자 정보가 필요합니다.' }
    }

    // 데이터베이스에서 사용자 조회 및 권한 확인
    const sqlFunc = getSql()
    const users = await sqlFunc`
      SELECT * FROM users WHERE email = ${userEmail}
    `

    if (users.length === 0) {
      return { authorized: false, message: '사용자를 찾을 수 없습니다.' }
    }

    const user = users[0]
    if (user.role !== 'ceo' && user.role !== 'super_admin') {
      return { authorized: false, message: '최고관리자 권한이 필요합니다.' }
    }

    return { authorized: true, user }
  } catch (error) {
    console.error('Auth verification error:', error)
    return { authorized: false, message: '인증 확인 중 오류가 발생했습니다.' }
  }
}

export const handler = async (event, context) => {
  // CORS 헤더 설정
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Content-Type': 'application/json',
  }

  // OPTIONS 요청 처리 (CORS preflight)
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers,
      body: '',
    }
  }

  // POST 요청만 허용
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      headers,
      body: JSON.stringify({ success: false, message: 'Method not allowed' }),
    }
  }

  try {
    // 데이터베이스 초기화
    if (!dbInitialized) {
      try {
        await initDatabase()
        dbInitialized = true
      } catch (dbError) {
        console.error('Database initialization error:', dbError)
        return {
          statusCode: 500,
          headers,
          body: JSON.stringify({
            success: false,
            message: '데이터베이스 연결 오류: ' + dbError.message,
          }),
        }
      }
    }

    // 요청 본문 파싱 (한 번만)
    const requestBody = JSON.parse(event.body || '{}')
    const { to, subject, body, userEmail } = requestBody

    // 권한 확인 - 최고관리자만 허용
    // userEmail을 포함한 이벤트 객체 전달
    const authEvent = {
      ...event,
      body: JSON.stringify({ userEmail })
    }
    const authResult = await verifySuperAdmin(authEvent)
    if (!authResult.authorized) {
      return {
        statusCode: 401,
        headers,
        body: JSON.stringify({
          success: false,
          message: authResult.message || '최고관리자 권한이 필요합니다.',
        }),
      }
    }

    // 입력 검증
    if (!to || !subject || !body) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({
          success: false,
          message: '받는 사람, 제목, 내용을 모두 입력해주세요.',
        }),
      }
    }

    // 이메일 형식 검증
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(to)) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({
          success: false,
          message: '올바른 이메일 형식을 입력해주세요.',
        }),
      }
    }

    // 이메일 전송
    const transporter = createTransporter()
    const gmailUser = process.env.GMAIL_USER || 'studio.realday@gmail.com'
    
    const mailOptions = {
      from: gmailUser,
      to: to,
      subject: subject,
      text: body,
      html: body.replace(/\n/g, '<br>'), // 줄바꿈을 HTML로 변환
    }

    await transporter.sendMail(mailOptions)

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        success: true,
        message: '메일이 성공적으로 전송되었습니다.',
      }),
    }
  } catch (error) {
    console.error('Send email error:', error)
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({
        success: false,
        message: error.message || '메일 전송 중 오류가 발생했습니다.',
      }),
    }
  }
}
