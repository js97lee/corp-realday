import nodemailer from 'nodemailer'
import {
  ensureDatabaseInitialized,
  getCorsHeaders,
  handleOptionsRequest,
  verifyAuth,
} from './utils.js'

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

export const handler = async (event, context) => {
  const headers = getCorsHeaders()

  if (event.httpMethod === 'OPTIONS') {
    return handleOptionsRequest()
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
    const sql = await ensureDatabaseInitialized(context)
    const requestBody = JSON.parse(event.body || '{}')
    const { to, subject, body } = requestBody

    const user = await verifyAuth(event, sql)
    const role = user?.role?.toLowerCase()
    if (!user || !['ceo', 'super_admin'].includes(role)) {
      return {
        statusCode: 401,
        headers,
        body: JSON.stringify({
          success: false,
          message: '최고관리자 권한이 필요합니다.',
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
